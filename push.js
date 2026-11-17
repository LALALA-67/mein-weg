'use strict';
/* ===== Benachrichtigungen: Web-Push über Supabase (kommen auch, wenn die App zu ist) ===== */
const Push = {
  state: 'idle',
  supported() { return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window; },
  on() { return this.supported() && Notification.permission === 'granted' && localStorage.getItem('mw-push') === '1'; },
  init() { if (this.on()) this.subscribe(true).catch(() => {}); },
  async subscribe(silent) {
    const key = (window.MW_CONFIG || {}).vapidPublic;
    if (!key || !Sync.client || !Sync.user) throw new Error('Bitte zuerst anmelden.');
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const raw = atob(key.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((key.length + 3) % 4));
      sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: Uint8Array.from(raw, c => c.charCodeAt(0)) });
    }
    const { error } = await Sync.client.from('push_subs').upsert({ endpoint: sub.endpoint, user_id: Sync.user.id, sub: sub.toJSON() }, { onConflict: 'endpoint' });
    if (error) throw error;
    localStorage.setItem('mw-push', '1');
    if (!silent) this.sync();
  },
  async enable() {
    if (!this.supported()) { App.toast(/iphone|ipad/i.test(navigator.userAgent) ? 'Auf dem iPhone: erst die App zum Home-Bildschirm hinzufügen und von dort öffnen.' : 'Dieser Browser unterstützt keine Benachrichtigungen.'); return; }
    this.state = 'busy'; App.render();
    try {
      const p = await Notification.requestPermission();
      if (p !== 'granted') { App.toast('Benachrichtigungen wurden nicht erlaubt. Du kannst sie in den Browser-Einstellungen freigeben.'); }
      else { await this.subscribe(); App.toast('Benachrichtigungen sind an!'); }
    } catch (e) { App.toast('Hat nicht geklappt: ' + (e.message || e)); }
    this.state = 'idle'; App.render();
  },
  async disable() {
    try { const reg = await navigator.serviceWorker.ready, sub = await reg.pushManager.getSubscription(); if (sub) { if (Sync.client) await Sync.client.from('push_subs').delete().eq('endpoint', sub.endpoint); await sub.unsubscribe(); } } catch (e) {}
    localStorage.removeItem('mw-push'); App.render();
  },
  async test() {
    if (!Sync.client || !Sync.user) return;
    const { error } = await Sync.client.from('reminders').upsert({ id: Sync.user.id.slice(0, 8) + '-test-' + Date.now(), user_id: Sync.user.id, at: new Date().toISOString(), title: 'The Lore', body: 'Benachrichtigungen funktionieren 🌙', sent: false });
    App.toast(error ? 'Fehler: ' + error.message : 'Test unterwegs – kommt innerhalb von 1 Minute.');
  },
  relLabel(m) { return m === 0 ? 'Jetzt' : m < 60 ? `In ${m} Minuten` : m < 1440 ? `In ${m / 60} Stunde${m === 60 ? '' : 'n'}` : m === 1440 ? 'Morgen' : m < 10080 ? `In ${m / 1440} Tagen` : 'In 1 Woche'; },
  // Erinnerungen aller Termine in die Datenbank schreiben (Server verschickt sie zur richtigen Zeit)
  sync() {
    clearTimeout(this._t);
    this._t = setTimeout(async () => {
      if (!Sync.client || !Sync.user) return;
      const me = Sync.user.id, now = Date.now(), rows = [];
      Cal.events().forEach(e => (e.rem || []).forEach(m => {
        const [y, mo, d] = e.date.split('-').map(Number), [hh, mm] = (e.allDay ? '09:00' : e.start).split(':').map(Number);
        const at = new Date(y, mo - 1, d, hh, mm).getTime() - m * 60000;
        if (at < now - 60000) return;
        rows.push({ id: me.slice(0, 8) + '-' + e.id + '-' + m, user_id: me, at: new Date(at).toISOString(), title: e.title || 'Termin', body: `${this.relLabel(m)} · ${e.allDay ? 'Ganztägig' : e.start + '–' + e.end} · ${Cal.catName(e)}`, sent: false });
      }));
      try {
        await Sync.client.from('reminders').delete().eq('user_id', me).eq('sent', false).not('id', 'like', '%-test-%');
        if (rows.length) await Sync.client.from('reminders').upsert(rows, { onConflict: 'id' });
      } catch (e) {}
    }, 1500);
  },
  box() {
    if (!this.supported()) return `<p class="small">${/iphone|ipad/i.test(navigator.userAgent) ? 'Auf dem iPhone gehen Benachrichtigungen nur in der installierten App: Teilen → „Zum Home-Bildschirm“, dann von dort öffnen.' : 'Dieser Browser unterstützt keine Benachrichtigungen.'}</p>`;
    if (Notification.permission === 'denied') return '<p class="small">Benachrichtigungen sind im Browser blockiert. Erlaube sie in den Seiten-Einstellungen (Schloss-Symbol in der Adressleiste).</p>';
    if (this.on()) return `<p class="small" style="margin-bottom:10px">Aktiv auf diesem Gerät ✓ Du bekommst Erinnerungen zu deinen Terminen – auch wenn die App zu ist. Die Zeit stellst du beim Termin ein.</p><div class="row"><button class="grow" data-a="pushTest">Test senden</button><button class="grow" data-a="pushOff">Ausschalten</button></div>`;
    return `<p class="small" style="margin-bottom:10px">Lass dich an Termine erinnern, z. B. 1 Tag vorher. Muss auf jedem Gerät einmal eingeschaltet werden.</p><button class="pri" style="width:100%" data-a="pushOn" ${this.state === 'busy' ? 'disabled' : ''}>Benachrichtigungen einschalten</button>`;
  }
};
Actions.pushOn = () => Push.enable();
Actions.pushOff = () => Push.disable();
Actions.pushTest = () => Push.test();

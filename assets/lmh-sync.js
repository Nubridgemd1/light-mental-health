/* Light Mental Health & Wellness — shared-content sync.
   Makes admin "Publish to live site" edits visible to EVERY visitor and device
   (the site previously saved only to this browser's localStorage). Stores the
   site config (and uploaded image URLs) only — no patient/booking data. The
   publishable key is browser-safe; writes are governed by Supabase RLS.
   Namespaced under lmh_* keys and the light/ storage folder. */
(function () {
  var SB_URL = 'https://wdyiiaxyscqvzzomhwuw.supabase.co';
  var SB_KEY = 'sb_publishable_s4iqMjkPg82Kupy4jLPu4w_b8NqoUHT';
  var T = SB_URL + '/rest/v1/site_content';
  var H = { apikey: SB_KEY, 'Authorization': 'Bearer ' + SB_KEY };
  var BUCKET = 'site-photos';

  function get(key) {
    return fetch(T + '?key=eq.' + encodeURIComponent(key) + '&select=value', { headers: H })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (a) { return (a && a[0]) ? a[0].value : null; })
      .catch(function () { return null; });
  }
  function set(key, value) {
    return fetch(T + '?on_conflict=key', {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal' }, H),
      body: JSON.stringify({ key: key, value: value, updated_at: new Date().toISOString() })
    }).then(function (r) { return r.ok; }).catch(function () { return false; });
  }
  function uploadPhoto(name, file) {
    var path = 'light/' + name;
    return fetch(SB_URL + '/storage/v1/object/' + BUCKET + '/' + path, {
      method: 'POST',
      headers: Object.assign({ 'x-upsert': 'true',
        'Content-Type': (file && file.type) || 'application/octet-stream',
        'Cache-Control': '3600' }, H),
      body: file
    }).then(function (r) {
      return r.ok ? (SB_URL + '/storage/v1/object/public/' + BUCKET + '/' + path) : null;
    }).catch(function () { return null; });
  }

  window.LMHSync = {
    get: get, set: set,
    getConfig: function () { return get('lmh_config'); },
    setConfig: function (v) { return set('lmh_config', v); },
    uploadPhoto: uploadPhoto
  };
})();

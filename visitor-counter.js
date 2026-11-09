/* Счётчик посещений «ИМПУЛЬС» — виден только разблокированной панели админа.
   Подключение в index.html перед </body>:
   <script src="visitor-counter.js"></script>
   <script>
     if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
   </script>
*/
(function () {
  var NAMESPACE = 'impul-site-visits'; // имя должно быть уникальным на весь интернет
  var KEY = 'visits';

  var badge = document.createElement('div');
  badge.id = 'visit-counter';
  badge.style.cssText =
    'display:none;position:fixed;bottom:12px;right:12px;' +
    'background:#0a3d6b;color:#f5c518;padding:6px 12px;border-radius:8px;' +
    'font:13px sans-serif;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,.35);';
  document.body.appendChild(badge);

  // === ВСТАВЬТЕ сюда имя ключа localStorage, которое создаёт ваша панель админа
  // после ввода пароля (см. F12 -> Application -> Local Storage).
  var ADMIN_KEYS = ['adminUnlocked', 'panelUnlocked'];

  function showIfAdmin() {
    var isAdmin = ADMIN_KEYS.some(function (k) { return localStorage.getItem(k); });
    badge.style.display = isAdmin ? 'block' : 'none';
  }

  function fetchCounter(action) {
    return fetch('https://api.countapi.xyz/' + action + '/' + NAMESPACE + '/' + KEY)
      .then(function (r) { return r.json(); })
      .then(function (d) { return d.value; })
      .catch(function () { return null; });
  }

  function update(text) {
    badge.textContent = text;
    showIfAdmin();
  }

  if (!localStorage.getItem('impul_visited')) {
    fetchCounter('hit').then(function (v) {
      localStorage.setItem('impul_visited', '1');
      if (v !== null) update('Посещений: ' + v);
    });
  } else {
    fetchCounter('get').then(function (v) {
      if (v !== null) update('Посещений: ' + v);
    });
  }

  showIfAdmin();
  // панель админа может быть разблокирована уже после загрузки страницы
  setInterval(showIfAdmin, 1000);
})();

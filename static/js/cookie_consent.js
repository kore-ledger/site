function mostrarBannerCookies() {
  document.body.classList.add('cookies-modal-open');
}

function ocultarBannerCookies() {
  document.body.classList.remove('cookies-modal-open');
  var over = document.getElementById('cookies-overlay');
  if (over) {
    over.remove();
  }
}

function createCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + value + expires + "; path=/" + ";secure;SameSite=None";
}
function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookiesByPattern(pattern) {
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {

    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;

    if (name.includes(pattern)) {
      document.cookie = name + "=; Domain=.kore-ledger.net; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; SameSite=None";
    }
  }
}

if (readCookie('cookie-notice-option') == 'true') {
  function loadScriptAsync(scriptSrc, callback) {
    if (typeof callback !== 'function') {
      throw new Error('Not a valid callback for async script load');
    }
    var script = document.createElement('script');
    script.onload = callback;
    script.src = scriptSrc;
    document.head.appendChild(script);
  }

  loadScriptAsync('https://www.googletagmanager.com/gtag/js?id=G-1TBWRM0BXF', function () {
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-1TBWRM0BXF', { 'anonymize_ip': true, cookie_flags: 'secure;samesite=none' });
  })

} else if (readCookie('cookie-notice-option') != 'false') {
  mostrarBannerCookies();
  deleteCookiesByPattern("_ga");
  document.getElementById('cookie-notice').style.display = 'block';
} else if (readCookie('cookie-notice-option') == 'false') {
  deleteCookiesByPattern("_ga");
  document.getElementById('cookie-notice').style.display = 'none';
}

document.getElementById('cookie-notice-accept').addEventListener("click", function () {

  createCookie('cookie-notice-option', 'true', 31);
  document.getElementById('cookie-notice').style.display = 'none';
  ocultarBannerCookies();
  location.reload();
});

document.getElementById('cookie-notice-deny').addEventListener("click", function () {
  createCookie('cookie-notice-option', 'false', 1);
  document.getElementById('cookie-notice').style.display = 'none';
  location.reload();
});
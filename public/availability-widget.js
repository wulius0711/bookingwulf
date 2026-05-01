(function () {
  var script = document.currentScript;
  if (!script) return;

  var hotel = script.getAttribute('data-hotel');
  if (!hotel) {
    console.error('Availability widget: data-hotel attribute is missing.');
    return;
  }

  var target = script.getAttribute('data-target') || '';
  var lang   = script.getAttribute('data-lang')   || '';
  var months = script.getAttribute('data-months') || '';
  var base   = script.src.replace(/\/availability-widget\.js(\?.*)?$/, '');

  var src = base + '/availability-widget.html?hotel=' + encodeURIComponent(hotel)
    + (target ? '&target=' + encodeURIComponent(target) : '')
    + (lang   ? '&lang='   + encodeURIComponent(lang)   : '')
    + (months ? '&months=' + encodeURIComponent(months) : '');

  var iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.style.cssText = 'width:100%;border:none;overflow:hidden;background:transparent;display:block;height:200px;';
  iframe.scrolling = 'no';
  iframe.title = 'Verfügbarkeits-Kalender';

  script.parentNode.insertBefore(iframe, script.nextSibling);

  window.addEventListener('message', function (e) {
    if (e.source !== iframe.contentWindow) return;
    if (e.data && e.data.type === 'aw-height' && e.data.height > 0) {
      iframe.style.height = e.data.height + 'px';
    }
    if (e.data && e.data.type === 'aw-navigate' && e.data.href) {
      try {
        var arrival = new URL(e.data.href).searchParams.get('arrival');
        if (arrival) {
          localStorage.setItem('bw_booking', JSON.stringify(
            { arrival: arrival, exp: Date.now() + 10 * 60 * 1000 }
          ));
        }
      } catch (ex) {}
      window.top.location.href = e.data.href;
    }
  });
})();

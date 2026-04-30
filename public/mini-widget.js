(function () {
  var script = document.currentScript;
  if (!script) return;

  var hotel = script.getAttribute('data-hotel');
  if (!hotel) {
    console.error('Booking mini widget: data-hotel attribute is missing.');
    return;
  }

  var config = script.getAttribute('data-config') || '';
  var target = script.getAttribute('data-target') || '';
  var lang = script.getAttribute('data-lang') || '';
  var base = script.src.replace(/\/mini-widget\.js(\?.*)?$/, '');

  var iframe = document.createElement('iframe');
  iframe.src = base + '/mini-widget.html?hotel=' + encodeURIComponent(hotel)
    + (config ? '&config=' + encodeURIComponent(config) : '')
    + (target ? '&target=' + encodeURIComponent(target) : '')
    + (lang ? '&lang=' + encodeURIComponent(lang) : '');
  iframe.style.cssText = 'width:100%;border:none;overflow:hidden;background:transparent;display:block;height:120px;';
  iframe.scrolling = 'no';
  iframe.title = 'Booking Mini Widget';

  script.parentNode.insertBefore(iframe, script.nextSibling);

  window.addEventListener('message', function (e) {
    if (e.source !== iframe.contentWindow) return;
    if (e.data && e.data.type === 'mini-widget-height' && e.data.height > 0) {
      iframe.style.height = e.data.height + 'px';
    }
  });
})();

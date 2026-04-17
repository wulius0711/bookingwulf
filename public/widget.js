(function () {
  var script = document.currentScript;
  if (!script) return;

  var hotel = script.getAttribute('data-hotel');
  if (!hotel) {
    console.error('Booking widget: data-hotel attribute is missing.');
    return;
  }

  var base = script.src.replace(/\/widget\.js(\?.*)?$/, '');

  var iframe = document.createElement('iframe');
  iframe.src = base + '/widget.html?hotel=' + encodeURIComponent(hotel);
  iframe.style.cssText =
    'width:100%;border:none;overflow:hidden;background:transparent;display:block;height:1200px;';
  iframe.scrolling = 'no';
  iframe.title = 'Booking Widget';

  script.parentNode.insertBefore(iframe, script.nextSibling);

  var savedHeight = '1200px';
  var lightboxOpen = false;

  window.addEventListener('message', function (e) {
    if (e.source !== iframe.contentWindow) return;
    if (!e.data || !e.data.type) return;

    if (e.data.type === 'booking-widget-resize' && !lightboxOpen && e.data.height > 100) {
      savedHeight = e.data.height + 'px';
      iframe.style.height = savedHeight;
    }

    if (e.data.type === 'booking-widget-lightbox-open') {
      lightboxOpen = true;
      savedHeight = iframe.style.height;
      var vh = window.innerHeight;
      iframe.style.height = vh + 'px';
      iframe.scrollIntoView({ block: 'start' });
    }

    if (e.data.type === 'booking-widget-lightbox-close') {
      lightboxOpen = false;
      iframe.style.height = savedHeight;
    }
  });
})();

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
    'width:100%;border:none;overflow:hidden;background:transparent;min-height:800px;display:block;';
  iframe.scrolling = 'no';
  iframe.title = 'Booking Widget';

  script.parentNode.insertBefore(iframe, script.nextSibling);

  function resize() {
    try {
      var doc = iframe.contentWindow.document;
      var h = Math.max(
        doc.body.scrollHeight,
        doc.documentElement.scrollHeight,
        doc.body.offsetHeight,
        doc.documentElement.offsetHeight
      );
      if (h > 100) iframe.style.height = h + 'px';
    } catch (e) {}
  }

  iframe.addEventListener('load', function () {
    resize();
    try {
      var observer = new MutationObserver(resize);
      observer.observe(iframe.contentWindow.document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });
      iframe.contentWindow.addEventListener('resize', resize);
    } catch (e) {}
    setInterval(resize, 500);
  });
})();

(function () {
  var script = document.currentScript;
  if (!script) return;

  var hotel = script.getAttribute('data-hotel');
  if (!hotel) {
    console.error('Booking widget: data-hotel attribute is missing.');
    return;
  }

  var config = script.getAttribute('data-config') || '';
  var lang = script.getAttribute('data-lang') || '';
  var base = script.src.replace(/\/widget\.js(\?.*)?$/, '');

  var _pqp = new URLSearchParams(window.location.search);
  var _arrival = _pqp.get('arrival') || '';
  var _departure = _pqp.get('departure') || '';
  var _type = _pqp.get('type') || '';
  var _adults = _pqp.get('adults') || '';

  // Fallback: hotel-domain localStorage written by mini-widget.js
  if (!_arrival || !_departure) {
    try {
      var _bwRaw = localStorage.getItem('bw_booking');
      if (_bwRaw) {
        var _bwData = JSON.parse(_bwRaw);
        if (!_bwData.exp || _bwData.exp > Date.now()) {
          if (!_arrival && _bwData.arrival) _arrival = _bwData.arrival;
          if (!_departure && _bwData.departure) _departure = _bwData.departure;
          if (!_type && _bwData.type) _type = _bwData.type;
          if (!_adults && _bwData.adults) _adults = String(_bwData.adults);
        }
        localStorage.removeItem('bw_booking');
      }
    } catch (ex) {}
  }

  var iframe = document.createElement('iframe');
  iframe.src = base + '/widget.html?hotel=' + encodeURIComponent(hotel)
    + (config ? '&config=' + encodeURIComponent(config) : '')
    + (lang ? '&lang=' + encodeURIComponent(lang) : '')
    + (_arrival ? '&arrival=' + encodeURIComponent(_arrival) : '')
    + (_departure ? '&departure=' + encodeURIComponent(_departure) : '')
    + (_type ? '&type=' + encodeURIComponent(_type) : '')
    + (_adults ? '&adults=' + encodeURIComponent(_adults) : '');
  iframe.style.cssText =
    'width:100%;border:none;overflow:hidden;background:transparent;display:block;height:1200px;';
  iframe.scrolling = 'no';
  iframe.title = 'Booking Widget';

  script.parentNode.insertBefore(iframe, script.nextSibling);

  window.addEventListener('message', function (e) {
    if (e.source !== iframe.contentWindow) return;
    if (e.data && e.data.type === 'booking-widget-resize' && e.data.height > 100) {
      iframe.style.height = e.data.height + 'px';
    }
    if (e.data && e.data.type === 'booking-widget-scroll-top') {
      iframe.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
})();

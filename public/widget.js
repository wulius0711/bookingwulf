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

  // Lightbox elements (created once, reused)
  var overlay = null;
  var lbImg = null;
  var lbCounter = null;
  var lbImages = [];
  var lbIndex = 0;

  function createLightbox() {
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s ease;';

    var inner = document.createElement('div');
    inner.style.cssText = 'position:relative;max-width:90vw;max-height:90vh;';

    lbImg = document.createElement('img');
    lbImg.style.cssText = 'max-width:90vw;max-height:80vh;object-fit:contain;display:block;border-radius:8px;';

    // Close
    var close = document.createElement('button');
    close.innerHTML = '&times;';
    close.style.cssText = 'position:fixed;top:16px;right:16px;width:44px;height:44px;border-radius:999px;border:none;background:rgba(255,255,255,0.15);color:#fff;font-size:24px;cursor:pointer;z-index:3;display:flex;align-items:center;justify-content:center;transition:background 0.15s;';
    close.onmouseover = function() { close.style.background = 'rgba(255,255,255,0.3)'; };
    close.onmouseout = function() { close.style.background = 'rgba(255,255,255,0.15)'; };
    close.onclick = closeLb;

    // Prev
    var prev = document.createElement('button');
    prev.innerHTML = '&#8249;';
    prev.style.cssText = 'position:fixed;left:16px;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:999px;border:none;background:rgba(255,255,255,0.15);color:#fff;font-size:24px;cursor:pointer;z-index:3;display:flex;align-items:center;justify-content:center;transition:background 0.15s;';
    prev.onmouseover = function() { prev.style.background = 'rgba(255,255,255,0.3)'; };
    prev.onmouseout = function() { prev.style.background = 'rgba(255,255,255,0.15)'; };
    prev.onclick = function() { navigateLb(-1); };

    // Next
    var next = document.createElement('button');
    next.innerHTML = '&#8250;';
    next.style.cssText = 'position:fixed;right:16px;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:999px;border:none;background:rgba(255,255,255,0.15);color:#fff;font-size:24px;cursor:pointer;z-index:3;display:flex;align-items:center;justify-content:center;transition:background 0.15s;';
    next.onmouseover = function() { next.style.background = 'rgba(255,255,255,0.3)'; };
    next.onmouseout = function() { next.style.background = 'rgba(255,255,255,0.15)'; };
    next.onclick = function() { navigateLb(1); };

    // Counter
    lbCounter = document.createElement('div');
    lbCounter.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);padding:6px 14px;border-radius:8px;background:rgba(0,0,0,0.5);color:#fff;font-size:13px;font-weight:600;';

    overlay.appendChild(inner);
    inner.appendChild(lbImg);
    overlay.appendChild(close);
    overlay.appendChild(prev);
    overlay.appendChild(next);
    overlay.appendChild(lbCounter);

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeLb();
    });

    document.addEventListener('keydown', function(e) {
      if (!overlay || overlay.style.display === 'none') return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') navigateLb(-1);
      if (e.key === 'ArrowRight') navigateLb(1);
    });

    document.body.appendChild(overlay);
  }

  function openLb(images, index) {
    createLightbox();
    lbImages = images;
    lbIndex = index || 0;
    updateLb();
    overlay.style.display = 'flex';
    requestAnimationFrame(function() { overlay.style.opacity = '1'; });
    document.body.style.overflow = 'hidden';
  }

  function closeLb() {
    if (!overlay) return;
    overlay.style.opacity = '0';
    setTimeout(function() {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }, 200);
    iframe.contentWindow.postMessage({ type: 'booking-widget-lightbox-closed' }, '*');
  }

  function navigateLb(dir) {
    if (!lbImages.length) return;
    lbIndex = (lbIndex + dir + lbImages.length) % lbImages.length;
    updateLb();
  }

  function updateLb() {
    if (!lbImg || !lbImages.length) return;
    lbImg.src = lbImages[lbIndex].imageUrl;
    lbImg.alt = lbImages[lbIndex].altText || '';
    lbCounter.textContent = (lbIndex + 1) + ' / ' + lbImages.length;
  }

  window.addEventListener('message', function (e) {
    if (e.source !== iframe.contentWindow) return;
    if (!e.data || !e.data.type) return;

    if (e.data.type === 'booking-widget-resize' && e.data.height > 100) {
      iframe.style.height = e.data.height + 'px';
    }

    if (e.data.type === 'booking-widget-lightbox-open') {
      openLb(e.data.images || [], e.data.index || 0);
    }
  });
})();

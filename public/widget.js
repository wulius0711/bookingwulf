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

  /* ── Image Gallery (dialog in parent) ── */
  var dialog = null;
  var galleryImages = [];
  var galleryIndex = 0;
  var bigImg = null;
  var counter = null;
  var thumbsList = null;

  function createGallery() {
    if (dialog) return;

    dialog = document.createElement('dialog');
    dialog.style.cssText = 'border:none;padding:0;background:transparent;max-width:none;max-height:none;width:100vw;height:100vh;overflow:hidden;';
    dialog.innerHTML = '<style>' +
      '.bw-gallery{display:flex;flex-direction:column;width:100%;height:100%;background:#111;position:relative;font-family:Inter,system-ui,sans-serif;}' +
      '.bw-gallery-main{flex:1;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;min-height:0;}' +
      '.bw-gallery-img{max-width:90%;max-height:100%;object-fit:contain;display:block;}' +
      '.bw-gallery-close{position:absolute;top:16px;right:16px;width:44px;height:44px;border-radius:999px;border:none;background:rgba(255,255,255,0.12);color:#fff;font-size:24px;cursor:pointer;z-index:3;display:flex;align-items:center;justify-content:center;transition:background 0.15s;}' +
      '.bw-gallery-close:hover{background:rgba(255,255,255,0.25);}' +
      '.bw-gallery-nav{position:absolute;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:999px;border:none;background:rgba(255,255,255,0.12);color:#fff;font-size:22px;cursor:pointer;z-index:3;display:flex;align-items:center;justify-content:center;transition:background 0.15s;}' +
      '.bw-gallery-nav:hover{background:rgba(255,255,255,0.25);}' +
      '.bw-gallery-prev{left:16px;}' +
      '.bw-gallery-next{right:16px;}' +
      '.bw-gallery-counter{position:absolute;bottom:12px;left:50%;transform:translateX(-50%);padding:5px 14px;border-radius:8px;background:rgba(0,0,0,0.5);color:#fff;font-size:13px;font-weight:600;}' +
      '.bw-gallery-thumbs{display:flex;gap:6px;padding:10px 16px;overflow-x:auto;background:#1a1a1a;flex-shrink:0;}' +
      '.bw-gallery-thumb{padding:0;border:2px solid transparent;border-radius:4px;overflow:hidden;cursor:pointer;opacity:0.5;transition:opacity 0.15s,border-color 0.15s;flex-shrink:0;background:none;}' +
      '.bw-gallery-thumb:hover{opacity:0.8;}' +
      '.bw-gallery-thumb.active{border-color:#fff;opacity:1;}' +
      '.bw-gallery-thumb img{width:64px;height:44px;object-fit:cover;display:block;}' +
      'dialog::backdrop{background:rgba(0,0,0,0.85);}' +
      '@media(max-width:640px){.bw-gallery-nav{width:36px;height:36px;font-size:18px;}.bw-gallery-prev{left:8px;}.bw-gallery-next{right:8px;}.bw-gallery-thumb img{width:48px;height:34px;}}' +
      '</style>' +
      '<div class="bw-gallery">' +
        '<div class="bw-gallery-main">' +
          '<button type="button" class="bw-gallery-close">&times;</button>' +
          '<button type="button" class="bw-gallery-nav bw-gallery-prev">&#8249;</button>' +
          '<button type="button" class="bw-gallery-nav bw-gallery-next">&#8250;</button>' +
          '<img class="bw-gallery-img" src="" alt="" />' +
          '<div class="bw-gallery-counter"></div>' +
        '</div>' +
        '<div class="bw-gallery-thumbs"></div>' +
      '</div>';

    document.body.appendChild(dialog);

    bigImg = dialog.querySelector('.bw-gallery-img');
    counter = dialog.querySelector('.bw-gallery-counter');
    thumbsList = dialog.querySelector('.bw-gallery-thumbs');

    dialog.querySelector('.bw-gallery-close').onclick = closeGallery;
    dialog.querySelector('.bw-gallery-prev').onclick = function () { navGallery(-1); };
    dialog.querySelector('.bw-gallery-next').onclick = function () { navGallery(1); };

    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) closeGallery();
    });

    dialog.addEventListener('cancel', function (e) {
      e.preventDefault();
      closeGallery();
    });

    document.addEventListener('keydown', function (e) {
      if (!dialog.open) return;
      if (e.key === 'ArrowLeft') navGallery(-1);
      if (e.key === 'ArrowRight') navGallery(1);
    });
  }

  function openGallery(images, index) {
    createGallery();
    galleryImages = images || [];
    galleryIndex = index || 0;
    updateGallery();
    dialog.showModal();
  }

  function closeGallery() {
    if (dialog && dialog.open) dialog.close();
    iframe.contentWindow.postMessage({ type: 'booking-widget-lightbox-closed' }, '*');
  }

  function navGallery(dir) {
    if (!galleryImages.length) return;
    galleryIndex = (galleryIndex + dir + galleryImages.length) % galleryImages.length;
    updateGallery();
  }

  function updateGallery() {
    if (!bigImg || !galleryImages.length) return;
    var img = galleryImages[galleryIndex];
    bigImg.src = img.imageUrl;
    bigImg.alt = img.altText || '';
    counter.textContent = (galleryIndex + 1) + ' / ' + galleryImages.length;

    thumbsList.innerHTML = '';
    galleryImages.forEach(function (img, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bw-gallery-thumb' + (i === galleryIndex ? ' active' : '');
      btn.innerHTML = '<img src="' + img.imageUrl + '" alt="" />';
      btn.onclick = function () { galleryIndex = i; updateGallery(); };
      thumbsList.appendChild(btn);
    });

    // Scroll active thumb into view
    var active = thumbsList.querySelector('.active');
    if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  /* ── Message handling ── */
  window.addEventListener('message', function (e) {
    if (e.source !== iframe.contentWindow) return;
    if (!e.data || !e.data.type) return;

    if (e.data.type === 'booking-widget-resize' && e.data.height > 100) {
      iframe.style.height = e.data.height + 'px';
    }

    if (e.data.type === 'booking-widget-lightbox-open') {
      openGallery(e.data.images || [], e.data.index || 0);
    }
  });
})();

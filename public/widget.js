(function () {
  var script = document.currentScript;
  if (!script) return;

  var hotel = script.getAttribute('data-hotel');
  if (!hotel) {
    console.error('Booking widget: data-hotel attribute is missing.');
    return;
  }

  var config = script.getAttribute('data-config') || '';
  var base = script.src.replace(/\/widget\.js(\?.*)?$/, '');

  var iframe = document.createElement('iframe');
  iframe.src = base + '/widget.html?hotel=' + encodeURIComponent(hotel) + (config ? '&config=' + encodeURIComponent(config) : '');
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
    if (e.data && e.data.type === 'booking-widget-calendar-loading') {
      bwCalOpen(e.data.title, null, e.data.radius);
    }
    if (e.data && e.data.type === 'booking-widget-calendar-open') {
      bwCalOpen(e.data.title, e.data.ranges, e.data.radius);
    }
  });

  // ── Availability Calendar Modal ──────────────────────────────────────────
  var MONTH_NAMES = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  var WD = ['MO','DI','MI','DO','FR','SA','SO'];
  var calState = { offset: 0, ranges: [], open: false };
  var calOverlay = null;

  function bwCalInject() {
    if (calOverlay) return;
    var style = document.createElement('style');
    style.textContent = `
      .bw-cal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:Inter,system-ui,sans-serif;}
      .bw-cal-modal{background:#fff;border-radius:var(--bw-cal-radius,16px);padding:32px 32px 28px;max-width:760px;width:100%;position:relative;box-shadow:0 24px 64px rgba(0,0,0,.18);max-height:90vh;overflow-y:auto;}
      .bw-cal-close{position:absolute;top:14px;right:18px;background:none;border:none;font-size:26px;cursor:pointer;color:#6b7280;line-height:1;padding:2px 8px;}
      .bw-cal-close:hover{color:#111;}
      .bw-cal-title{font-size:17px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin:0 0 24px;padding-right:32px;color:#111;}
      .bw-cal-grid-wrap{display:grid;grid-template-columns:1fr 1fr;gap:32px;}
      @media(max-width:560px){.bw-cal-grid-wrap{grid-template-columns:1fr;}}
      .bw-cal-month-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
      .bw-cal-nav{background:none;border:1px solid #e5e7eb;border-radius:50%;width:30px;height:30px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;color:#374151;}
      .bw-cal-nav:hover{background:#f3f4f6;}
      .bw-cal-nav.hidden{visibility:hidden;pointer-events:none;}
      .bw-cal-mname{text-align:center;}
      .bw-cal-year{font-size:11px;color:#9ca3af;display:block;}
      .bw-cal-mtext{font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:.06em;}
      .bw-cal-days{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;}
      .bw-cal-wd{text-align:center;font-size:11px;font-weight:600;color:#9ca3af;padding:4px 0 6px;text-transform:uppercase;}
      .bw-cal-d{text-align:center;padding:6px 2px;border-radius:4px;font-size:12px;color:#111;}
      .bw-cal-d.bk{background:rgba(239,68,68,.15);color:#9ca3af;}
      .bw-cal-d.bk.fi{border-radius:4px 0 0 4px;}
      .bw-cal-d.bk.la{border-radius:0 4px 4px 0;}
      .bw-cal-d.td{outline:2px solid #06b6d4;outline-offset:-2px;border-radius:4px;font-weight:700;}
      .bw-cal-d.pa{color:#d1d5db;}
      .bw-cal-legend{display:flex;gap:20px;margin-top:20px;font-size:12px;color:#6b7280;align-items:center;flex-wrap:wrap;}
      .bw-cal-legend span{display:flex;align-items:center;gap:6px;}
      .bw-cal-dot{width:14px;height:14px;border-radius:3px;flex-shrink:0;display:inline-block;}
      .bw-cal-loading{padding:40px;text-align:center;color:#9ca3af;grid-column:1/-1;}
    `;
    document.head.appendChild(style);
    calOverlay = document.createElement('div');
    calOverlay.className = 'bw-cal-overlay';
    calOverlay.innerHTML = '<div class="bw-cal-modal"><button class="bw-cal-close">×</button><div class="bw-cal-title"></div><div class="bw-cal-grid-wrap"></div><div class="bw-cal-legend"><span><span class="bw-cal-dot" style="background:rgba(239,68,68,.2);border:1px solid #fca5a5;"></span>Nicht verfügbar</span><span><span class="bw-cal-dot" style="background:#fff;border:2px solid #06b6d4;"></span>Heute</span><span><span class="bw-cal-dot" style="background:#fff;border:1px solid #e5e7eb;"></span>Verfügbar</span></div></div>';
    document.body.appendChild(calOverlay);
    calOverlay.querySelector('.bw-cal-close').addEventListener('click', bwCalClose);
    calOverlay.addEventListener('click', function(e){ if (e.target === calOverlay) bwCalClose(); });
    document.addEventListener('keydown', function(e){ if (calState.open && e.key === 'Escape') bwCalClose(); });
  }

  function bwIsoTs(s){ return new Date(s + 'T00:00:00Z').getTime(); }
  function bwIsBooked(y,m,d){ var ts=Date.UTC(y,m,d); return calState.ranges.some(function(r){ return ts>=bwIsoTs(r.from) && ts<bwIsoTs(r.to); }); }
  function bwIsFirst(y,m,d){ var ts=Date.UTC(y,m,d); return calState.ranges.some(function(r){ return bwIsoTs(r.from)===ts; }); }
  function bwIsLast(y,m,d){ var ts=Date.UTC(y,m,d); return calState.ranges.some(function(r){ return bwIsoTs(r.to)-86400000===ts; }); }

  function bwCalRender() {
    var wrap = calOverlay.querySelector('.bw-cal-grid-wrap');
    wrap.innerHTML = '';
    var now = new Date();
    var ty=now.getFullYear(), tm=now.getMonth(), td=now.getDate();
    for (var mi=0; mi<2; mi++) {
      var offset = calState.offset + mi;
      var d = new Date(ty, tm+offset, 1);
      var y=d.getFullYear(), mo=d.getMonth();
      var dim = new Date(y,mo+1,0).getDate();
      var fw = (new Date(y,mo,1).getDay()+6)%7;
      var html = '<div><div class="bw-cal-month-hd">';
      html += mi===0 ? '<button class="bw-cal-nav'+(calState.offset===0?' hidden':'')+'" data-cal-prev>‹</button>' : '<span></span>';
      html += '<div class="bw-cal-mname"><span class="bw-cal-year">'+y+'</span><span class="bw-cal-mtext">'+MONTH_NAMES[mo]+'</span></div>';
      html += mi===1 ? '<button class="bw-cal-nav" data-cal-next>›</button>' : '<span></span>';
      html += '</div><div class="bw-cal-days">';
      WD.forEach(function(w){ html+='<div class="bw-cal-wd">'+w+'</div>'; });
      for (var ei=0;ei<fw;ei++) html+='<div class="bw-cal-d"></div>';
      for (var day=1;day<=dim;day++) {
        var isT=y===ty&&mo===tm&&day===td;
        var isPast=Date.UTC(y,mo,day)<Date.UTC(ty,tm,td);
        var bk=bwIsBooked(y,mo,day);
        var fi=bk&&bwIsFirst(y,mo,day);
        var la=bk&&bwIsLast(y,mo,day);
        var cls='bw-cal-d'+(bk?' bk':'')+(fi?' fi':'')+(la?' la':'')+(isT?' td':'')+(isPast&&!bk?' pa':'');
        html+='<div class="'+cls+'">'+day+'</div>';
      }
      html+='</div></div>';
      wrap.insertAdjacentHTML('beforeend', html);
    }
    var prev = wrap.querySelector('[data-cal-prev]');
    var next = wrap.querySelector('[data-cal-next]');
    if (prev) prev.addEventListener('click', function(){ calState.offset=Math.max(0,calState.offset-1); bwCalRender(); });
    if (next) next.addEventListener('click', function(){ calState.offset++; bwCalRender(); });
  }

  function bwCalOpen(title, ranges, radius) {
    bwCalInject();
    if (radius) document.documentElement.style.setProperty('--bw-cal-radius', radius);
    calState.open = true;
    calOverlay.querySelector('.bw-cal-title').textContent = title;
    calOverlay.style.display = 'flex';
    if (ranges === null) {
      calOverlay.querySelector('.bw-cal-grid-wrap').innerHTML = '<div class="bw-cal-loading">Lädt…</div>';
    } else {
      calState.ranges = ranges;
      calState.offset = 0;
      bwCalRender();
    }
  }

  function bwCalClose() {
    calState.open = false;
    if (calOverlay) calOverlay.style.display = 'none';
  }
})();

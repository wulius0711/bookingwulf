/*!
 * bookingwulf Chat Widget
 * Einbindung: <script src="https://bookingwulf.com/chat.js" data-hotel="HOTEL-SLUG" data-color="#1a1a1a"></script>
 */
(function () {
  'use strict';

  const script = document.currentScript;
  if (!script) return;

  const HOTEL = script.getAttribute('data-hotel');
  const COLOR = script.getAttribute('data-color') || '#1a1a1a';
  const API   = new URL(script.src).origin + '/api/chat';

  if (!HOTEL) { console.warn('[bookingwulf] data-hotel fehlt'); return; }

  // ── Contrast helper ────────────────────────────────────────────────────────
  function luminance(hex) {
    const c = hex.replace('#', '');
    const r = parseInt(c.slice(0, 2), 16) / 255;
    const g = parseInt(c.slice(2, 4), 16) / 255;
    const b = parseInt(c.slice(4, 6), 16) / 255;
    const lin = function(v) { return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  }
  const ON_COLOR = luminance(COLOR) > 0.4 ? '#111827' : '#ffffff';

  // ── Default avatar SVG ─────────────────────────────────────────────────────
  var DEFAULT_AVATAR_SVG = '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="14" r="7" fill="rgba(255,255,255,0.9)"/><path d="M6 32c0-6.627 5.373-12 12-12s12 5.373 12 12" fill="rgba(255,255,255,0.9)"/></svg>';

  // ── State ──────────────────────────────────────────────────────────────────
  var messages = [];
  var isLoading = false;
  var isOpen = false;
  var greeted = false;

  // ── Host element ───────────────────────────────────────────────────────────
  var host = document.createElement('div');
  host.id = 'bw-chat-host';
  host.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:2147483647;';
  document.body.appendChild(host);

  var shadow = host.attachShadow({ mode: 'open' });

  // ── Template ───────────────────────────────────────────────────────────────
  shadow.innerHTML = [
    '<style>',
    '  *{box-sizing:border-box;margin:0;padding:0;}',
    '  [hidden]{display:none!important;}',
    '  #fab{',
    '    width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;',
    '    background:' + COLOR + ';color:' + ON_COLOR + ';',
    '    display:flex;align-items:center;justify-content:center;',
    '    box-shadow:0 4px 16px rgba(0,0,0,0.18);',
    '    transition:transform 0.2s,box-shadow 0.2s;',
    '    position:relative;',
    '  }',
    '  #fab:hover{transform:scale(1.07);box-shadow:0 6px 24px rgba(0,0,0,0.22);}',
    '  #fab svg{width:24px;height:24px;transition:opacity 0.2s,transform 0.2s;}',
    '  #fab .icon-close{position:absolute;opacity:0;transform:rotate(-90deg);}',
    '  #fab.open .icon-chat{opacity:0;transform:rotate(90deg);}',
    '  #fab.open .icon-close{opacity:1;transform:rotate(0deg);}',

    '  #panel{',
    '    position:absolute;bottom:68px;right:0;',
    '    width:380px;height:560px;',
    '    background:#fff;border-radius:20px;',
    '    box-shadow:0 8px 40px rgba(0,0,0,0.14);',
    '    display:none;flex-direction:column;overflow:hidden;',
    '    font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;',
    '    animation:bw-slide-up 0.25s ease;',
    '  }',
    '  @keyframes bw-slide-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}',

    '  @media(max-width:480px){',
    '    #panel{',
    '      position:fixed;bottom:88px;right:12px;left:12px;',
    '      width:auto;height:72dvh;max-height:520px;border-radius:20px;',
    '    }',
    '    #fab{position:fixed;bottom:max(24px,env(safe-area-inset-bottom));right:24px;}',
    '    #textarea{font-size:16px;}',
    '  }',

    '  #header{',
    '    background:' + COLOR + ';color:' + ON_COLOR + ';',
    '    padding:16px 18px;display:flex;align-items:center;gap:12px;flex-shrink:0;',
    '  }',
    '  #header-avatar{',
    '    width:40px;height:40px;border-radius:50%;',
    '    background:rgba(255,255,255,0.2);',
    '    display:flex;align-items:center;justify-content:center;flex-shrink:0;',
    '    overflow:hidden;',
    '  }',
    '  #header-avatar svg{width:36px;height:36px;}',
    '  #header-avatar img{width:100%;height:100%;object-fit:cover;}',
    '  #header-text{flex:1;min-width:0;}',
    '  #header-name{font-size:15px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '  #header-sub{font-size:12px;opacity:0.75;margin-top:1px;}',

    '  #messages{',
    '    flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;',
    '    scroll-behavior:smooth;',
    '  }',
    '  #messages::-webkit-scrollbar{width:4px;}',
    '  #messages::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:4px;}',

    '  .msg{max-width:82%;line-height:1.5;font-size:14px;padding:10px 14px;border-radius:16px;word-break:break-word;}',
    '  .msg a{color:' + COLOR + ';font-weight:600;text-underline-offset:2px;}',
    '  .msg strong{font-weight:700;}',
    '  .msg.user{',
    '    background:' + COLOR + ';color:' + ON_COLOR + ';',
    '    align-self:flex-end;border-bottom-right-radius:4px;',
    '  }',
    '  .msg.assistant{',
    '    background:#f3f4f6;color:#111827;',
    '    align-self:flex-start;border-bottom-left-radius:4px;',
    '  }',

    '  #typing{',
    '    align-self:flex-start;background:#f3f4f6;border-radius:16px;border-bottom-left-radius:4px;',
    '    padding:10px 16px;display:flex;gap:4px;align-items:center;margin:0 16px 4px;',
    '  }',
    '  .dot{width:7px;height:7px;border-radius:50%;background:#9ca3af;animation:bw-bounce 1.2s infinite;}',
    '  .dot:nth-child(2){animation-delay:0.2s;}',
    '  .dot:nth-child(3){animation-delay:0.4s;}',
    '  @keyframes bw-bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}',

    '  #input-wrap{',
    '    padding:12px 14px;padding-bottom:max(12px,env(safe-area-inset-bottom));border-top:1px solid #f3f4f6;display:flex;gap:8px;align-items:flex-end;flex-shrink:0;',
    '  }',
    '  #textarea{',
    '    flex:1;resize:none;border:1.5px solid #e5e7eb;border-radius:12px;',
    '    padding:9px 12px;font-size:14px;font-family:inherit;line-height:1.45;',
    '    outline:none;max-height:100px;overflow-y:auto;color:#111827;',
    '    transition:border-color 0.15s;',
    '  }',
    '  #textarea:focus{border-color:' + COLOR + ';}',
    '  #textarea::placeholder{color:#9ca3af;}',
    '  #send{',
    '    width:38px;height:38px;border-radius:10px;border:none;cursor:pointer;flex-shrink:0;',
    '    background:' + COLOR + ';color:' + ON_COLOR + ';',
    '    display:flex;align-items:center;justify-content:center;',
    '    transition:opacity 0.15s,transform 0.1s;',
    '  }',
    '  #send:hover:not(:disabled){opacity:0.88;}',
    '  #send:active:not(:disabled){transform:scale(0.94);}',
    '  #send:disabled{opacity:0.4;cursor:not-allowed;}',
    '  #send svg{width:18px;height:18px;}',

    '  #powered{text-align:center;font-size:10px;color:#9ca3af;padding:6px 0 10px;flex-shrink:0;}',
    '  #powered a{color:#9ca3af;text-decoration:none;}',
    '  #powered a:hover{text-decoration:underline;}',
    '  .booking-btn{',
    '    display:block;margin:4px 0 0;padding:11px 16px;',
    '    background:' + COLOR + ';color:' + ON_COLOR + ';',
    '    border-radius:10px;font-size:14px;font-weight:700;',
    '    text-align:center;text-decoration:none;cursor:pointer;',
    '    animation:bw-booking-pulse 2.2s ease-in-out infinite;',
    '  }',
    '  @keyframes bw-booking-pulse{',
    '    0%,100%{box-shadow:0 0 0 0 ' + COLOR + '4d}',
    '    50%{box-shadow:0 0 0 8px ' + COLOR + '00}',
    '  }',
    '</style>',

    '<button id="fab" aria-label="Chat öffnen" aria-expanded="false">',
    '  <svg class="icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
    '    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    '  </svg>',
    '  <svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">',
    '    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    '  </svg>',
    '</button>',

    '<div id="panel" role="dialog" aria-modal="true" aria-label="Buchungs-Assistent">',
    '  <div id="header">',
    '    <div id="header-avatar">' + DEFAULT_AVATAR_SVG + '</div>',
    '    <div id="header-text">',
    '      <div id="header-name">Buchungs-Assistent</div>',
    '      <div id="header-sub">Wie kann ich helfen?</div>',
    '    </div>',
    '  </div>',
    '  <div id="messages"></div>',
    '  <div id="typing" hidden>',
    '    <span class="dot"></span><span class="dot"></span><span class="dot"></span>',
    '  </div>',
    '  <div id="input-wrap">',
    '    <textarea id="textarea" rows="1" placeholder="Nachricht schreiben …" aria-label="Nachricht"></textarea>',
    '    <button id="send" aria-label="Senden">',
    '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">',
    '        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    '      </svg>',
    '    </button>',
    '  </div>',
    '  <div id="powered"><a href="https://bookingwulf.com" target="_blank" rel="noopener">Powered by bookingwulf</a></div>',
    '</div>',
  ].join('\n');

  // ── DOM refs ───────────────────────────────────────────────────────────────
  var fab        = shadow.getElementById('fab');
  var panel      = shadow.getElementById('panel');
  var msgsEl     = shadow.getElementById('messages');
  var typingEl   = shadow.getElementById('typing');
  var textarea   = shadow.getElementById('textarea');
  var sendBtn    = shadow.getElementById('send');
  var headerName = shadow.getElementById('header-name');

  // ── Config fetch ───────────────────────────────────────────────────────────
  function applyConfig(cfg) {
    if (cfg.name && headerName) headerName.textContent = cfg.name;
    if (cfg.avatar) {
      var avatarEl = shadow.getElementById('header-avatar');
      if (avatarEl) {
        var img = document.createElement('img');
        img.src = cfg.avatar;
        img.alt = 'Avatar';
        avatarEl.innerHTML = '';
        avatarEl.appendChild(img);
      }
    }
    if (cfg.color) {
      var onCol = luminance(cfg.color) > 0.4 ? '#111827' : '#ffffff';
      var s = document.createElement('style');
      s.textContent =
        '#fab,#header,#send,.booking-btn{background:' + cfg.color + '!important;color:' + onCol + '!important;}' +
        '.msg.user{background:' + cfg.color + '!important;color:' + onCol + '!important;}' +
        '#textarea:focus{border-color:' + cfg.color + '!important;}';
      shadow.appendChild(s);
    }
  }

  fetch(API + '?hotel=' + HOTEL)
    .then(function(r) { return r.json(); })
    .then(function(cfg) { if (cfg && !cfg.error) applyConfig(cfg); })
    .catch(function() {});

  // ── Helpers ────────────────────────────────────────────────────────────────
  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function formatText(text) {
    return escHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function addMessage(role, text) {
    var urlMatch = role === 'assistant' ? text.match(/(https?:\/\/[^\s]+)/) : null;
    var displayText = urlMatch ? text.replace(urlMatch[0], '').replace(/\n{3,}/g, '\n\n').trim() : text;

    var div = document.createElement('div');
    div.className = 'msg ' + role;
    div.innerHTML = formatText(displayText);
    msgsEl.appendChild(div);

    if (urlMatch) {
      var btn = document.createElement('a');
      btn.href = urlMatch[0];
      btn.target = '_self';
      btn.className = 'booking-btn';
      btn.textContent = 'Jetzt buchen →';
      msgsEl.appendChild(btn);
    }

    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  function autoResize() {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
  }

  // ── Toggle ─────────────────────────────────────────────────────────────────
  function togglePanel() {
    isOpen = !isOpen;
    fab.classList.toggle('open', isOpen);
    fab.setAttribute('aria-expanded', isOpen);
    panel.style.display = isOpen ? 'flex' : 'none';
    if (isOpen) {
      if (!greeted) {
        greeted = true;
        addMessage('assistant', 'Hallo! 👋 Ich helfe gerne bei Ihrer Zimmerbuchung.\n\nWann möchten Sie anreisen, für wie viele Personen — und haben Sie bestimmte Wünsche?');
      }
      setTimeout(function() { textarea.focus(); }, 50);
    }
  }

  // ── Send ───────────────────────────────────────────────────────────────────
  function send() {
    var text = textarea.value.trim();
    if (!text || isLoading) return;

    textarea.value = '';
    textarea.style.height = 'auto';
    addMessage('user', text);
    messages.push({ role: 'user', content: text });

    isLoading = true;
    sendBtn.disabled = true;
    typingEl.hidden = false;
    msgsEl.scrollTop = msgsEl.scrollHeight;

    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hotelSlug: HOTEL, messages: messages }),
    })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        typingEl.hidden = true;
        if (data.assistantName && headerName) { headerName.textContent = data.assistantName; }
        if (data.avatarUrl) {
          var avatarEl = shadow.getElementById('header-avatar');
          if (avatarEl) {
            var img = document.createElement('img');
            img.src = data.avatarUrl;
            img.alt = 'Avatar';
            avatarEl.innerHTML = '';
            avatarEl.appendChild(img);
          }
        }
        if (data.message) {
          messages.push({ role: 'assistant', content: data.message });
          addMessage('assistant', data.message);
        } else {
          addMessage('assistant', 'Entschuldigung, ich konnte keine Antwort laden. Bitte versuchen Sie es erneut.');
        }
      })
      .catch(function() {
        typingEl.hidden = true;
        addMessage('assistant', 'Verbindungsfehler. Bitte versuchen Sie es erneut.');
      })
      .finally(function() {
        isLoading = false;
        sendBtn.disabled = false;
        msgsEl.scrollTop = msgsEl.scrollHeight;
      });
  }

  // ── Events ─────────────────────────────────────────────────────────────────
  fab.addEventListener('click', togglePanel);
  sendBtn.addEventListener('click', send);
  textarea.addEventListener('input', autoResize);
  textarea.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });

  // Close on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isOpen) togglePanel();
  });

})();

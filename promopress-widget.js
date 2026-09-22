/* Promopress — widget de atendimento (vendedora IA) · v0.2
 * Uso: <script src=".../promopress-widget.js" data-endpoint="https://.../webhook/..." data-titulo="Promopress" data-cor="#14213d"></script>
 * Um arquivo só (CSS embutido). Sessão em localStorage. Canal: "web".
 */
(function () {
  if (window.__ppWidget) return; window.__ppWidget = true;
  var S = document.currentScript || (function () { var s = document.getElementsByTagName('script'); return s[s.length - 1]; })();
  var CFG = {
    endpoint: S.getAttribute('data-endpoint') || 'https://go.dosedegrowth.cloud/webhook/promopress-chat-4f1c9a2e',
    titulo: S.getAttribute('data-titulo') || 'Promopress',
    subtitulo: S.getAttribute('data-subtitulo') || 'Orçamento na hora',
    cor: S.getAttribute('data-cor') || '#14213d',
    acento: S.getAttribute('data-acento') || '#e0007a',
    boasVindas: S.getAttribute('data-boas-vindas') || 'Olá! Sou a assistente comercial da Promopress. Me conta o que você precisa imprimir que eu já te passo o valor.',
    sugestoes: (S.getAttribute('data-sugestoes') || 'Cadernos personalizados para brinde|Envelopes de dízimo|Cartão de visita|Calendário de mesa').split('|'),
    origem: S.getAttribute('data-origem') || 'widget-site'
  };
  var KEY = 'pp_chat_session', HKEY = 'pp_chat_hist';
  function uid() { return 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  var session = null; try { session = localStorage.getItem(KEY); } catch (e) {}
  if (!session) { session = uid(); try { localStorage.setItem(KEY, session); } catch (e) {} }
  var hist = []; try { hist = JSON.parse(localStorage.getItem(HKEY) || '[]'); } catch (e) { hist = []; }

  var css = '\
  .pp-w *{box-sizing:border-box;margin:0;padding:0}\
  .pp-w{--pp-ink:' + CFG.cor + ';--pp-ac:' + CFG.acento + ';--pp-paper:#faf7f1;--pp-line:#e6e0d4;position:fixed;right:20px;bottom:20px;z-index:2147483000;font-family:"Instrument Sans",ui-sans-serif,system-ui,-apple-system,sans-serif;font-size:15px;color:#1a1a1a}\
  .pp-btn{display:flex;align-items:center;gap:10px;height:56px;padding:0 20px 0 16px;border:0;border-radius:999px;background:var(--pp-ink);color:#fff;cursor:pointer;box-shadow:0 10px 30px rgba(20,33,61,.28);font-family:inherit;font-weight:600;font-size:15px;line-height:1;transition:transform .18s ease,box-shadow .18s ease}\
  .pp-btn:hover{transform:translateY(-2px);box-shadow:0 14px 34px rgba(20,33,61,.34)}\
  .pp-btn svg{width:22px;height:22px}\
  .pp-btn .pp-dot{position:absolute;top:-3px;right:-3px;width:14px;height:14px;border-radius:50%;background:var(--pp-ac);border:2px solid #fff}\
  .pp-panel{position:absolute;right:0;bottom:70px;width:380px;max-width:calc(100vw - 40px);height:600px;max-height:calc(100vh - 110px);display:flex;flex-direction:column;background:var(--pp-paper);border:1px solid var(--pp-line);border-radius:18px;overflow:hidden;box-shadow:0 24px 60px rgba(20,33,61,.28);opacity:0;transform:translateY(12px) scale(.98);pointer-events:none;transition:opacity .2s ease,transform .22s cubic-bezier(.2,.8,.2,1)}\
  .pp-w.open .pp-panel{opacity:1;transform:none;pointer-events:auto}\
  .pp-head{display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--pp-ink);color:#fff}\
  .pp-ava{width:38px;height:38px;border-radius:50%;background:var(--pp-ac);display:grid;place-items:center;font:700 15px/1 "Fraunces",Georgia,serif;letter-spacing:.02em}\
  .pp-head b{display:block;font-family:inherit;font-weight:600;font-size:15px;line-height:1.2}\
  .pp-head small{display:block;opacity:.75;font-size:12px;margin-top:2px}\
  .pp-head .pp-on{display:inline-block;width:7px;height:7px;border-radius:50%;background:#37d67a;margin-right:5px;vertical-align:middle}\
  .pp-x{margin-left:auto;background:transparent;border:0;color:#fff;opacity:.8;cursor:pointer;width:32px;height:32px;border-radius:8px;font-size:20px;line-height:1}\
  .pp-x:hover{background:rgba(255,255,255,.12);opacity:1}\
  .pp-msgs{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:10px;background:radial-gradient(circle at 20% 0%,#fff 0,transparent 55%),var(--pp-paper)}\
  .pp-m{max-width:86%;padding:10px 13px;border-radius:14px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word;font-size:14.5px;animation:ppin .22s ease}\
  .pp-m.ia{align-self:flex-start;background:#fff;border:1px solid var(--pp-line);border-bottom-left-radius:4px}\
  .pp-m.eu{align-self:flex-end;background:var(--pp-ink);color:#fff;border-bottom-right-radius:4px}\
  .pp-m.sys{align-self:center;background:transparent;color:#777;font-size:12.5px;padding:2px 8px}\
  .pp-m a{color:var(--pp-ac);text-decoration:underline;word-break:break-all}\
  .pp-typing{align-self:flex-start;display:flex;gap:4px;padding:12px 14px;background:#fff;border:1px solid var(--pp-line);border-radius:14px;border-bottom-left-radius:4px}\
  .pp-typing i{width:7px;height:7px;border-radius:50%;background:#b9b2a4;animation:ppb 1.1s infinite}\
  .pp-typing i:nth-child(2){animation-delay:.15s}.pp-typing i:nth-child(3){animation-delay:.3s}\
  .pp-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 8px}\
  .pp-chip{border:1px solid var(--pp-ink);background:#fff;color:var(--pp-ink);border-radius:999px;padding:6px 11px;font-family:inherit;font-weight:500;font-size:13px;line-height:1;cursor:pointer;transition:background .15s,color .15s}\
  .pp-chip:hover{background:var(--pp-ink);color:#fff}\
  .pp-form{display:flex;gap:8px;padding:10px 12px 12px;border-top:1px solid var(--pp-line);background:#fff}\
  .pp-in{flex:1;resize:none;border:1px solid var(--pp-line);border-radius:12px;padding:10px 12px;font-family:inherit;font-size:15px;line-height:1.35;max-height:110px;outline:none;background:var(--pp-paper)}\
  .pp-in:focus{border-color:var(--pp-ink)}\
  .pp-send{width:44px;height:44px;border:0;border-radius:12px;background:var(--pp-ac);color:#fff;cursor:pointer;display:grid;place-items:center;align-self:flex-end;transition:transform .15s}\
  .pp-send:disabled{opacity:.5;cursor:default}.pp-send:not(:disabled):hover{transform:scale(1.05)}\
  .pp-foot{text-align:center;font-size:11px;color:#9a9385;padding:0 0 8px;background:#fff}\
  @keyframes ppin{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}\
  @keyframes ppb{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-4px);opacity:1}}\
  @media (max-width:480px){.pp-w{right:12px;bottom:12px}.pp-w.open .pp-btn{display:none}.pp-panel{position:fixed;inset:0;width:100vw;max-width:100vw;height:100dvh;max-height:100dvh;border-radius:0;bottom:0}.pp-head{padding-top:max(14px,env(safe-area-inset-top))}.pp-form{padding-bottom:max(12px,env(safe-area-inset-bottom))}}\
  ';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  if (!document.querySelector('link[href*="Instrument+Sans"]')) {
    var lf = document.createElement('link'); lf.rel = 'stylesheet'; lf.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700&family=Instrument+Sans:wght@400;500;600&display=swap'; document.head.appendChild(lf);
  }

  var root = document.createElement('div'); root.className = 'pp-w';
  root.innerHTML = '\
  <div class="pp-panel" role="dialog" aria-label="Atendimento ' + CFG.titulo + '">\
    <div class="pp-head"><div class="pp-ava">P</div><div><b>' + CFG.titulo + '</b><small><span class="pp-on"></span>' + CFG.subtitulo + '</small></div><button class="pp-x" aria-label="Fechar">×</button></div>\
    <div class="pp-msgs"></div>\
    <div class="pp-chips"></div>\
    <form class="pp-form"><textarea class="pp-in" rows="1" placeholder="Escreva sua mensagem…" aria-label="Mensagem"></textarea><button class="pp-send" type="submit" aria-label="Enviar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9z"/></svg></button></form>\
    <div class="pp-foot">Atendimento com inteligência artificial · equipe acompanha</div>\
  </div>\
  <button class="pp-btn" aria-label="Abrir atendimento"><span class="pp-dot"></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>Pedir orçamento</span></button>';
  document.body.appendChild(root);

  var $ = function (q) { return root.querySelector(q); };
  var msgs = $('.pp-msgs'), chips = $('.pp-chips'), form = $('.pp-form'), input = $('.pp-in'), send = $('.pp-send'), btn = $('.pp-btn');
  var busy = false;

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function linkify(t) { return esc(t).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>'); }
  function add(papel, texto, save) {
    var d = document.createElement('div'); d.className = 'pp-m ' + papel; d.innerHTML = papel === 'sys' ? esc(texto) : linkify(texto); msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
    if (save !== false) { hist.push({ p: papel, t: texto }); if (hist.length > 60) hist = hist.slice(-60); try { localStorage.setItem(HKEY, JSON.stringify(hist)); } catch (e) {} }
  }
  function typing(on) { var t = msgs.querySelector('.pp-typing'); if (on && !t) { t = document.createElement('div'); t.className = 'pp-typing'; t.innerHTML = '<i></i><i></i><i></i>'; msgs.appendChild(t); msgs.scrollTop = msgs.scrollHeight; } if (!on && t) t.remove(); }
  function renderChips() { chips.innerHTML = ''; if (hist.length > 1) return; CFG.sugestoes.forEach(function (s) { var b = document.createElement('button'); b.type = 'button'; b.className = 'pp-chip'; b.textContent = s; b.onclick = function () { enviar(s); }; chips.appendChild(b); }); }

  function enviar(texto) {
    texto = (texto || '').trim(); if (!texto || busy) return;
    add('eu', texto); input.value = ''; input.style.height = 'auto'; chips.innerHTML = ''; busy = true; send.disabled = true; typing(true);
    var t0 = Date.now();
    fetch(CFG.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: session, message: texto, canal: 'web', pagina: location.href, origem: CFG.origem }) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        typing(false);
        if (d && d.humano) { add('sys', 'A equipe assumiu esta conversa e responde por aqui em horário comercial.'); return; }
        var reply = (d && d.reply) || 'Não consegui responder agora. Pode repetir, por favor?';
        // divide em bolhas por linha em branco
        reply.split(/\n\s*\n/).forEach(function (b, i) { setTimeout(function () { add('ia', b.trim()); }, i * 350); });
        try { window.dispatchEvent(new CustomEvent('pp:resposta', { detail: { etapa: d && d.etapa, lead_id: d && d.lead_id, ms: Date.now() - t0 } })); } catch (e) {}
      })
      .catch(function () { typing(false); add('sys', 'Falha de conexão. Tente novamente em instantes.'); })
      .finally(function () { busy = false; send.disabled = false; input.focus(); });
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); enviar(input.value); });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(input.value); } });
  input.addEventListener('input', function () { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 110) + 'px'; });
  function abrir() { root.classList.add('open'); btn.querySelector('.pp-dot').style.display = 'none'; setTimeout(function () { input.focus(); msgs.scrollTop = msgs.scrollHeight; }, 220); }
  function fechar() { root.classList.remove('open'); }
  btn.addEventListener('click', function () { root.classList.contains('open') ? fechar() : abrir(); });
  $('.pp-x').addEventListener('click', fechar);

  // histórico ou boas-vindas (local, sem chamar a API)
  if (hist.length) { hist.forEach(function (m) { add(m.p, m.t, false); }); } else { add('ia', CFG.boasVindas); }
  renderChips();
  window.PromopressChat = { abrir: abrir, fechar: fechar, enviar: enviar, sessao: session, reset: function () { try { localStorage.removeItem(KEY); localStorage.removeItem(HKEY); } catch (e) {} location.reload(); } };
  // abre sozinho se veio com #orcamento ou ?chat=1
  if (/[#?&](orcamento|chat=1)/.test(location.href)) setTimeout(abrir, 600);
})();

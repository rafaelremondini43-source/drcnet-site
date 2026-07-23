/* ===========================================================================
   DRC — Landing · interações (ref. Active Theory · motion contido)
   =========================================================================== */
(function () {
  'use strict';

  // ---- CONFIG: envio do formulário (backend Supabase; mailto vira plano B) ----
  var EMAIL_TO = 'drc@drcnet.com.br';
  var API_ORC = 'https://wycdpvcvwypxdbpzakym.supabase.co/functions/v1/site-orcamento';
  var API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5Y2RwdmN2d3lweGRicHpha3ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NjMwMjUsImV4cCI6MjA5NzUzOTAyNX0.OqVywUeA0wA7NLqqfM7-0x8fn81BhQMWRvxOoyXTLbI';
  function mailtoLink(subject, body) { return 'mailto:' + EMAIL_TO + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body); }

  var reduce   = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine     = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var saveData = !!(navigator.connection && navigator.connection.saveData);

  // anos de operação dinâmicos (ancorado em 2000, nunca envelhece)
  var anosOp = document.getElementById('anosOp'); if (anosOp) anosOp.dataset.to = String((new Date()).getFullYear() - 2000);

  // ---- SMOOTH SCROLL (Lenis) ----
  var lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true, smoothTouch: false });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })();
  }
  function go(el) {
    if (!el) return;
    // compensa a altura REAL da nav fixa no momento do clique (varia 61-83px conforme .nav.small) —
    // offset fixo de -20 deixava o título das seções (ex.: Obra em destaque) atrás da barra
    var navEl = document.getElementById('nav');
    var navH = navEl ? navEl.getBoundingClientRect().height : 82;
    var off = -(navH + 16);
    if (lenis) lenis.scrollTo(el, { offset: off });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      closeMenu();
      go(el);
    });
  });

  // ---- MENU MOBILE (com gestão de foco/inert) ----
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  var bgEls  = [document.getElementById('conteudo'), document.querySelector('.foot')];
  var hasInert = ('inert' in HTMLElement.prototype);
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    if (burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (drawer) { drawer.setAttribute('aria-hidden', open ? 'false' : 'true'); if (hasInert) drawer.inert = !open; }
    bgEls.forEach(function (el) { if (!el) return; if (hasInert) el.inert = open; el.setAttribute('aria-hidden', open ? 'true' : 'false'); });
    if (open && drawer) { var f = drawer.querySelector('a'); if (f) setTimeout(function () { try { f.focus(); } catch (e) {} }, 40); }
  }
  // focus-trap dentro do drawer (modal) — defesa p/ navegadores sem suporte a inert
  if (drawer) {
    drawer.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var links = drawer.querySelectorAll('a'); if (!links.length) return;
      var first = links[0], last = links[links.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
  function closeMenu() { if (document.body.classList.contains('menu-open')) setMenu(false); }
  if (burger) {
    if (drawer) drawer.setAttribute('aria-hidden', 'true');   // só com JS o drawer é modal oculto; sem JS ele é o menu visível
    if (drawer && hasInert) drawer.inert = true;
    burger.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { closeMenu(); try { burger.focus(); } catch (e2) {} } });
  }

  // ---- CURSOR CUSTOM ----
  var cur = document.querySelector('.cursor'), dot = document.querySelector('.cursor-dot');
  if (fine && !reduce && cur && dot) {
    document.documentElement.classList.add('cursor-custom');   // só agora o CSS esconde o cursor nativo
    var mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, craf = null;
    function cloop() {
      cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2;
      cur.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px) translate(-50%,-50%)';
      if (Math.abs(mx - cx) > 0.1 || Math.abs(my - cy) > 0.1) craf = requestAnimationFrame(cloop); else craf = null;
    }
    addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      if (!craf) craf = requestAnimationFrame(cloop);
    }, { passive: true });
    document.querySelectorAll('a,button,summary,.btn,input,select,textarea,.seg').forEach(function (el) {
      // cursor contextual: CTAs de conversão pintam o anel de vermelho; o resto usa o anel navy
      var isCta = el.classList.contains('btn') || el.classList.contains('navbtn') || !!el.closest('.cta-float');
      el.addEventListener('mouseenter', function () { document.body.classList.add(isCta ? 'hovering-cta' : 'hovering'); });
      el.addEventListener('mouseleave', function () { document.body.classList.remove('hovering'); document.body.classList.remove('hovering-cta'); });
    });
  } else if (cur) { cur.style.display = 'none'; if (dot) dot.style.display = 'none'; }

  // ---- REVEAL + CONTADORES ----
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      en.target.querySelectorAll('.count').forEach(startCount);
      if (en.target.classList.contains('count')) startCount(en.target);
      io.unobserve(en.target);
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -7% 0px' });
  document.querySelectorAll('.reveal, .lines, .count').forEach(function (el) { io.observe(el); });

  // garante que tudo que já está na 1ª dobra (hero) apareça de imediato — não depende do timing do observer
  function revealInView() {
    var vh = innerHeight || document.documentElement.clientHeight || 800;
    document.querySelectorAll('.reveal, .lines, .count').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.96 && r.bottom > 0) {
        el.classList.add('in');
        el.querySelectorAll('.count').forEach(startCount);
        if (el.classList.contains('count')) startCount(el);
        io.unobserve(el);
      }
    });
  }
  revealInView();
  addEventListener('load', revealInView);

  function startCount(el) {
    if (el.dataset.done) return; el.dataset.done = '1';
    var to = parseFloat(el.dataset.to || '0'), suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = fmt(to) + suf; return; }
    var dur = 1300, t0 = null;
    requestAnimationFrame(function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * e) + suf;
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(to) + suf;
    });
  }
  function fmt(n) { return Math.round(n).toLocaleString('pt-BR'); }   // 1000 -> "1.000" (o ano 2000 é estático, não conta)

  // ---- NAV compacta + PARALLAX ----
  var nav = document.getElementById('nav');
  function navState() { if (nav) nav.classList.toggle('small', window.scrollY > 30); }
  addEventListener('scroll', navState, { passive: true }); navState();

  var px = [].slice.call(document.querySelectorAll('[data-parallax]'));
  function updateParallax() {
    for (var i = 0; i < px.length; i++) {
      var el = px[i], host = el.parentElement.getBoundingClientRect();
      var center = host.top + host.height / 2 - innerHeight / 2;
      var off = center * parseFloat(el.dataset.parallax) * -1;
      el.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0) scale(1.08)';
    }
  }
  if (px.length && !reduce && !saveData) {
    var pt = false;
    addEventListener('scroll', function () { if (!pt) { requestAnimationFrame(function () { updateParallax(); pt = false; }); pt = true; } }, { passive: true });
    addEventListener('resize', updateParallax, { passive: true });
    updateParallax();
  }

  // ---- DRILL-PATH (assinatura): scrub por scroll ----
  (function drill() {
    var svg = document.getElementById('sigSvg'); if (!svg) return;
    var bore = document.getElementById('drillBore');
    var duct = document.getElementById('drillDuct');
    var bit  = document.getElementById('drillBit');
    var stage = svg.parentElement;
    var pts = [].slice.call(svg.querySelectorAll('.pt'));
    if (!bore || !bore.getTotalLength) return;
    var len = bore.getTotalLength();
    bore.style.strokeDasharray = len;
    if (duct) duct.style.strokeDasharray = len;

    function setAt(p) {
      p = Math.max(0, Math.min(1, p));
      bore.style.strokeDashoffset = len * (1 - p);
      if (duct) { var dp = Math.max(0, (p - 0.04) / 0.96); duct.style.strokeDashoffset = len * (1 - dp); }
      if (bit) {
        var q = bore.getPointAtLength(len * p);
        bit.setAttribute('transform', 'translate(' + q.x.toFixed(1) + ',' + q.y.toFixed(1) + ')');
        bit.style.opacity = (p > 0.005 && p < 0.995) ? '1' : '0';
      }
      pts.forEach(function (m) { m.classList.toggle('on', p >= parseFloat(m.dataset.at)); });
    }

    if (reduce) { setAt(1); if (bit) bit.style.opacity = '0'; return; }
    setAt(0);
    var visible = true;
    function onScroll() {
      var r = stage.getBoundingClientRect();
      var vh = innerHeight || document.documentElement.clientHeight;
      var p = (vh * 0.80 - r.top) / (vh * 0.60);
      setAt(p);
    }
    // só calcula quando a seção está perto da viewport (evita reflow forçado no scroll do resto da página)
    if ('IntersectionObserver' in window) {
      visible = false;
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) onScroll(); }, { rootMargin: '240px 0px 240px 0px' }).observe(stage);
    }
    var ticking = false;
    addEventListener('scroll', function () { if (!ticking && visible) { requestAnimationFrame(function () { onScroll(); ticking = false; }); ticking = true; } }, { passive: true });
    addEventListener('resize', function () { if (visible) onScroll(); }, { passive: true });
  })();

  // ---- LAZY MAP ----
  var mapFrame = document.querySelector('iframe[data-map]');
  if (mapFrame) {
    var mio = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { mapFrame.src = mapFrame.dataset.map; mio.unobserve(mapFrame); } });
    }, { rootMargin: '400px' });
    mio.observe(mapFrame);
  }

  // ---- FORMULÁRIO → e-mail (mailto) ----
  var form = document.getElementById('orcForm');
  if (form) {
    var err = document.getElementById('formErr'), okBox = document.getElementById('formOk');
    var req = ['f_nome', 'f_tel'];   // só nome + telefone obrigatórios (envio abre o e-mail)
    function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
    function emailOk(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
    function check() {
      var bad = false;
      req.forEach(function (id) {
        var e = document.getElementById(id), ok = e.value.trim().length >= 2;
        e.classList.toggle('bad', !ok); e.setAttribute('aria-invalid', ok ? 'false' : 'true'); if (!ok) bad = true;
      });
      var em = document.getElementById('f_email');   // e-mail é opcional, mas se preenchido tem que ser válido
      if (em.value.trim() && !emailOk(em.value.trim())) { em.classList.add('bad'); em.setAttribute('aria-invalid', 'true'); bad = true; } else { em.classList.remove('bad'); em.setAttribute('aria-invalid', 'false'); }
      return !bad;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!check()) {
        if (err) {
          err.textContent = 'Preencha os campos obrigatórios (*) para continuar.';
          err.hidden = false;
        }
        // o erro só é "descrição" dos campos ENQUANTO existe (senão o leitor de tela o anuncia sempre)
        req.forEach(function (id) { document.getElementById(id).setAttribute('aria-describedby', 'formErr'); });
        var firstBad = form.querySelector('.field input.bad, .field select.bad');
        if (firstBad) firstBad.focus();
        return;
      }
      if (err) err.hidden = true;
      req.forEach(function (id) { document.getElementById(id).removeAttribute('aria-describedby'); });
      var lead = { nome: val('f_nome'), empresa: val('f_empresa'), email: val('f_email'), telefone: val('f_tel'), segmento: val('f_seg'), cidade: val('f_cidade'), mensagem: val('f_msg'), site: val('f_site'), origem: location.href };
      try { form.dispatchEvent(new CustomEvent('drc:lead', { bubbles: true, detail: lead })); } catch (e2) {}
      var btn = document.getElementById('formSend');
      if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }
      function done() { form.classList.add('sent'); if (okBox) { try { okBox.focus(); } catch (e3) {} } }
      function planoB() {
        // sem backend no momento: abre o e-mail do visitante com o resumo (nenhum lead se perde)
        var t = 'Olá! Sou ' + lead.nome + (lead.empresa ? ' (' + lead.empresa + ')' : '') + '. Gostaria de um orçamento de perfuração direcional (MND).';
        if (lead.segmento) t += '\nSegmento: ' + lead.segmento;
        if (lead.cidade) t += '\nObra em: ' + lead.cidade;
        if (lead.mensagem) t += '\nDetalhes: ' + lead.mensagem;
        t += '\nContato: ' + lead.telefone + (lead.email ? ' · ' + lead.email : '');
        if (okBox) okBox.textContent = 'Abrimos o seu e-mail com o resumo do pedido — é só enviar. Se não abriu, escreva para drc@drcnet.com.br.';
        done();
        location.href = mailtoLink('Solicitação de orçamento — perfuração direcional (MND)', t);
      }
      fetch(API_ORC, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + API_KEY, 'apikey': API_KEY },
        body: JSON.stringify(lead)
      }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j && j.ok }; }); })
        .then(function (res) { if (res.ok) { done(); } else { planoB(); } })
        .catch(planoB)
        .finally(function () { if (btn) { btn.disabled = false; btn.innerHTML = 'Solicitar orçamento <span class="ar" aria-hidden="true">→</span>'; } });
    });
  }

  // ---- HERO: vídeo de fundo. preload="none" no HTML mantém o mp4 (~2MB) FORA do
  // caminho crítico; no desktop ele só começa a baixar/tocar após o load da página.
  // Mobile/saveData/reduced-motion: nunca baixa — fica só o poster.
  (function heroVideo() {
    var v = document.querySelector('.hero-vid'); if (!v) return;
    var srcUrl = (function () { var s = v.querySelector('source'); return s ? s.getAttribute('src') : null; })();
    var started = false;
    function start() {
      if (started) return; started = true;
      // garante o <source> (pode ter sido removido num load estreito)
      if (!v.querySelector('source') && srcUrl) {
        var s = document.createElement('source'); s.src = srcUrl; s.type = 'video/mp4'; v.appendChild(s);
      }
      try { v.load(); } catch (e) {}
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    }
    var narrowMq = matchMedia('(max-width:768px)');
    var light = saveData || (matchMedia('(prefers-reduced-motion: reduce)').matches || narrowMq.matches);
    if (light) {
      var s0 = v.querySelector('source'); if (s0) { s0.removeAttribute('src'); v.removeChild(s0); }
      try { v.load(); } catch (e) {}
      // se a janela crescer p/ desktop (não sendo saveData/reduced-motion), o fundo vira vídeo
      if (!saveData && !matchMedia('(prefers-reduced-motion: reduce)').matches && narrowMq.addEventListener) {
        narrowMq.addEventListener('change', function (e) { if (!e.matches) start(); }, { once: true });
      }
      return;
    }
    if (document.readyState === 'complete') start();
    else addEventListener('load', start, { once: true });
  })();

  // ---- SCROLL-SPY (aria-current na seção ativa) ----
  (function spy() {
    var links = [].slice.call(document.querySelectorAll('.nav .links a.navlink'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (a) { var id = a.getAttribute('href'); if (id && id.charAt(0) === '#') { var s = document.querySelector(id); if (s) map[id.slice(1)] = a; } });
    var ids = Object.keys(map); if (!ids.length) return;
    var spyio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        var a = map[en.target.id]; if (a) a.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    ids.forEach(function (id) { var s = document.getElementById(id); if (s) spyio.observe(s); });
  })();

  // ---- CTA flutuante (mobile): some no hero, no form e no rodapé ----
  (function floatCta() {
    var fc = document.getElementById('ctaFloat'); if (!fc) return;
    var hero = document.getElementById('topo'), contato = document.getElementById('contato'), rodape = document.getElementById('rodape');
    var pastHero = false, atForm = false, atFooter = false;
    var fcLinks = fc.querySelectorAll('a');
    function upd() {
      var on = pastHero && !atForm && !atFooter;
      fc.classList.toggle('show', on);
      fc.setAttribute('aria-hidden', on ? 'false' : 'true');
      fcLinks.forEach(function (a) { a.tabIndex = on ? 0 : -1; });
    }
    if (hero) new IntersectionObserver(function (es) { pastHero = !es[0].isIntersecting; upd(); }, { threshold: 0 }).observe(hero);
    if (contato) new IntersectionObserver(function (es) { atForm = es[0].isIntersecting; upd(); }, { threshold: 0.05 }).observe(contato);
    if (rodape) new IntersectionObserver(function (es) { atFooter = es[0].isIntersecting; upd(); }, { threshold: 0 }).observe(rodape);
  })();

  // ---- MOBILE: colapsa <details data-collapse-mobile> + progresso do carrossel de segmentos ----
  (function mobileEnhance() {
    var mq = matchMedia('(max-width:600px)');
    var dets = [].slice.call(document.querySelectorAll('details[data-collapse-mobile]'));
    function applyCollapse() { dets.forEach(function (d) { d.open = !mq.matches; }); }
    applyCollapse();
    if (mq.addEventListener) mq.addEventListener('change', applyCollapse);
    else if (mq.addListener) mq.addListener(applyCollapse);   // Safari antigo

    // carrossel de segmentos: preenche a barra de progresso conforme o scroll horizontal
    var grid = document.querySelector('.seg-grid');
    var prog = document.querySelector('.seg-prog i');
    if (grid && prog) {
      var ticking = false;
      grid.addEventListener('scroll', function () {
        if (ticking) return; ticking = true;
        requestAnimationFrame(function () {
          var max = grid.scrollWidth - grid.clientWidth;
          var p = max > 0 ? grid.scrollLeft / max : 0;
          prog.style.transform = 'scaleX(' + (0.16 + p * 0.84).toFixed(3) + ')';
          ticking = false;
        });
      }, { passive: true });
    }
  })();

  // ---- ano dinâmico ----
  var y = document.getElementById('year'); if (y) y.textContent = (new Date()).getFullYear();
})();

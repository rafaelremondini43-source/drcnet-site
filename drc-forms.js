// Formulários do site DRC → Supabase Edge Functions.
// Substitui o envio do Gravity Forms (WordPress desativado; site estático).
// Mapa: gform_1 newsletter · gform_2 contato · gform_3 orçamento ·
//       gform_4 trabalhe conosco · gform_6 canal de comunicação.
(function () {
  'use strict';

  var API = 'https://wycdpvcvwypxdbpzakym.supabase.co/functions/v1/';
  var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5Y2RwdmN2d3lweGRicHpha3ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NjMwMjUsImV4cCI6MjA5NzUzOTAyNX0.OqVywUeA0wA7NLqqfM7-0x8fn81BhQMWRvxOoyXTLbI';
  var EMAIL = 'drc@drcnet.com.br';

  function val(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? String(el.value || '').trim() : '';
  }

  function confirma(form, html) {
    var wrapper = form.closest('.gform_wrapper') || form;
    var div = document.createElement('div');
    div.className = 'gform_confirmation_wrapper';
    div.innerHTML = '<div class="gform_confirmation_message" tabindex="-1" style="padding:12px 0">' + html + '</div>';
    wrapper.parentNode.insertBefore(div, wrapper);
    wrapper.style.display = 'none';
    try { div.firstChild.focus(); } catch (e) {}
  }

  function erro(form, formId, msg, mailtoAssunto, mailtoCorpo) {
    var box = form.querySelector('.drc-form-erro');
    if (!box) {
      box = document.createElement('div');
      box.className = 'drc-form-erro validation_error';
      box.setAttribute('role', 'alert');
      box.style.cssText = 'color:#b00;padding:8px 0;font-size:13px';
      form.insertBefore(box, form.firstChild);
    }
    var link = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(mailtoAssunto) +
               '&body=' + encodeURIComponent(mailtoCorpo);
    box.innerHTML = (msg || 'Não foi possível enviar.') +
      ' Você pode <a href="' + link + '">enviar por e-mail</a> para ' + EMAIL + '.';
    window['gf_submitting_' + formId] = false;
  }

  function envia(fn, payload, onOk, onErr) {
    fetch(API + fn, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + KEY, 'apikey': KEY },
      body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.ok && j && j.ok) { onOk(); } else { onErr(j && j.erro); }
      });
    }).catch(function () { onErr(); });
  }

  var mapa = {
    1: function (form) { // newsletter (rodapé, todas as páginas)
      var email = val(form, 'input_2');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { erro(form, 1, 'Informe um e-mail válido.', 'Receber notícias da DRC', 'Quero receber notícias. Meu e-mail: '); return; }
      envia('site-newsletter',
        { email: email, site: val(form, 'input_3'), origem: location.href },
        function () { confirma(form, 'E-mail cadastrado. Obrigado.'); },
        function (m) { erro(form, 1, m, 'Receber notícias da DRC', 'Quero receber notícias. Meu e-mail: ' + email); });
    },
    2: function (form) { // contato
      orcamento(form, 2, 'Contato pelo site', 'Mensagem enviada. A DRC retornará em breve.');
    },
    3: function (form) { // orçamento
      orcamento(form, 3, 'Solicitação de orçamento', 'Pedido de orçamento enviado. A DRC retornará em breve.');
    },
    4: function (form) { // trabalhe conosco (currículo segue por e-mail)
      var nome = val(form, 'input_1'), email = val(form, 'input_2'), tel = val(form, 'input_3');
      if (nome.length < 2 || tel.length < 8) { erro(form, 4, 'Preencha nome e telefone.', 'Trabalhe conosco — currículo', ''); return; }
      var mailAssunto = 'Currículo — ' + nome;
      var mailCorpo = 'Nome: ' + nome + '\nTelefone: ' + tel + (email ? '\nE-mail: ' + email : '') + '\n\n(Anexe aqui o seu currículo.)';
      envia('site-orcamento',
        { nome: nome, email: email, telefone: tel, segmento: 'Trabalhe Conosco',
          mensagem: 'Candidatura enviada pelo site. Currículo a receber por e-mail.',
          site: val(form, 'input_5'), origem: location.href },
        function () {
          confirma(form, 'Dados enviados. Para concluir, envie seu currículo para ' +
            '<a href="mailto:' + EMAIL + '?subject=' + encodeURIComponent(mailAssunto) +
            '&body=' + encodeURIComponent(mailCorpo) + '">' + EMAIL + '</a> citando seu nome.');
        },
        function (m) { erro(form, 4, m, mailAssunto, mailCorpo); });
    },
    6: function (form) { // canal de comunicação (anônimo)
      var msg = val(form, 'input_5');
      if (msg.length < 10) { erro(form, 6, 'Descreva a sua comunicação.', 'Canal de Comunicação', ''); return; }
      envia('site-canal',
        { mensagem: msg, site: val(form, 'input_7'), origem: location.href },
        function () { confirma(form, 'Mensagem registrada. Obrigado pela sua comunicação.'); },
        function (m) { erro(form, 6, m, 'Canal de Comunicação', msg); });
    }
  };

  function orcamento(form, id, assunto, okMsg) {
    var d = {
      nome: val(form, 'input_1'), empresa: val(form, 'input_2'), email: val(form, 'input_3'),
      telefone: val(form, 'input_4'), mensagem: val(form, 'input_5'),
      site: val(form, 'input_6'), origem: location.href
    };
    if (d.nome.length < 2 || d.telefone.length < 8) { erro(form, id, 'Preencha nome e telefone.', assunto, ''); return; }
    var corpo = 'Nome: ' + d.nome + (d.empresa ? '\nEmpresa: ' + d.empresa : '') +
      '\nTelefone: ' + d.telefone + (d.email ? '\nE-mail: ' + d.email : '') +
      (d.mensagem ? '\n\n' + d.mensagem : '');
    envia('site-orcamento', d,
      function () { confirma(form, okMsg); },
      function (m) { erro(form, id, m, assunto, corpo); });
  }

  document.addEventListener('submit', function (ev) {
    var form = ev.target;
    if (!form || !form.id) return;
    var m = /^gform_(\d+)$/.exec(form.id);
    if (!m || !mapa[+m[1]]) return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    mapa[+m[1]](form);
  }, true);
})();

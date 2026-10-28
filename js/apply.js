// ROMA Overseas apply page mock: step-by-step form, checks, résumé upload and the reference number.
(function () {
  'use strict';

  var form = document.querySelector('[data-apply-form]');
  if (!form) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll('.form__step'));
  var progress = form.querySelector('[data-progress]');
  var stepCount = form.querySelector('[data-step-count]');
  var stepName = form.querySelector('[data-step-name]');
  var bar = form.querySelector('[data-bar]');
  var backBtn = form.querySelector('[data-back]');
  var nextBtn = form.querySelector('[data-next]');
  var submitBtn = form.querySelector('[data-submit]');
  var card = form.closest('.apply__card');
  var done = document.querySelector('[data-done]');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  var MAX_BYTES = 10 * 1024 * 1024;
  var current = 0;
  var now = new Date();

  // Date of application is today.
  var today = form.querySelector('[data-today]');
  if (today) today.textContent = now.toLocaleDateString('en-PH', { day: 'numeric', month: 'long', year: 'numeric' });

  // Checks: one message per field, shown under it and read out through aria-describedby.
  function errorEl(field) {
    return document.getElementById(field.id + '-err');
  }

  function setError(field, message) {
    var el = errorEl(field);
    if (message) {
      field.setAttribute('aria-invalid', 'true');
      if (el) { el.textContent = message; el.classList.add('is-shown'); }
    } else {
      field.removeAttribute('aria-invalid');
      if (el) { el.textContent = ''; el.classList.remove('is-shown'); }
    }
  }

  function problem(field) {
    if (field.disabled || field.closest('[hidden]:not(.form__step)')) return '';
    var value = field.type === 'file' || field.type === 'checkbox' ? '' : field.value.trim();
    var msg = field.getAttribute('data-msg');

    if (field.type === 'checkbox') return field.required && !field.checked ? msg : '';
    if (field.type === 'file') {
      var file = field.files && field.files[0];
      if (!file) return field.required ? msg : '';
      if (!/\.(pdf|docx?)$/i.test(file.name)) return 'Upload a PDF or Word file.';
      if (file.size > MAX_BYTES) return 'The file is larger than 10 MB. Upload a smaller copy.';
      return '';
    }
    if (!value) return field.required ? msg : '';
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return msg;
    if (field.hasAttribute('data-phone') && (!/^[+\d\s()-]+$/.test(value) || value.replace(/\D/g, '').length < 7)) return msg;
    if (field.hasAttribute('data-year')) {
      var year = Number(value);
      if (!/^\d{4}$/.test(value) || year < 1950 || year > now.getFullYear()) return 'Enter a year from 1950 to ' + now.getFullYear() + ', like 2015.';
    }
    return '';
  }

  function checkField(field) {
    var message = problem(field);
    setError(field, message);
    return !message;
  }

  function fieldsIn(scope) {
    return Array.prototype.slice.call(scope.querySelectorAll('input[id], select[id], textarea[id]'));
  }

  // Focus a field with a problem and bring it clear of the sticky header.
  function focusField(field) {
    field.focus({ preventScroll: true });
    field.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
  }

  function checkStep(step) {
    var firstBad = null;
    fieldsIn(step).forEach(function (field) {
      if (!checkField(field) && !firstBad) firstBad = field;
    });
    return firstBad;
  }

  // Once a field has shown an error, it re-checks as the person types.
  form.addEventListener('input', function (e) {
    if (e.target.getAttribute('aria-invalid') === 'true') checkField(e.target);
  });
  form.addEventListener('change', function (e) {
    if (e.target.id && (e.target.getAttribute('aria-invalid') === 'true' || e.target.type === 'file')) checkField(e.target);
  });
  form.addEventListener('focusout', function (e) {
    var field = e.target;
    if (field.id && field.type !== 'file' && field.type !== 'checkbox' && field.value.trim()) checkField(field);
  });

  // Steps: one fieldset at a time when JS runs; without JS the whole form shows.
  function show(index, moveFocus) {
    current = index;
    steps.forEach(function (step, i) { step.hidden = i !== index; });
    var last = index === steps.length - 1;
    backBtn.hidden = index === 0;
    nextBtn.hidden = last;
    submitBtn.hidden = !last;
    stepCount.textContent = 'Step ' + (index + 1) + ' of ' + steps.length;
    stepName.textContent = steps[index].getAttribute('data-step');
    bar.style.width = ((index + 1) / steps.length * 100) + '%';
    if (moveFocus) {
      var top = card.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.5) card.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
      steps[index].focus({ preventScroll: true });
    }
  }

  form.classList.add('is-stepped');
  progress.hidden = false;
  show(0, false);

  nextBtn.addEventListener('click', function () {
    var bad = checkStep(steps[current]);
    if (bad) { focusField(bad); return; }
    show(current + 1, true);
  });
  backBtn.addEventListener('click', function () { show(current - 1, true); });

  // Enter in a text field moves on instead of sending half a form.
  form.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.target.tagName !== 'INPUT' || /^(checkbox|file|submit|button)$/.test(e.target.type)) return;
    if (current < steps.length - 1) { e.preventDefault(); nextBtn.click(); }
  });

  // Position: "Other position" asks for the name; a job card link fills it in.
  var position = form.querySelector('#f-position');
  var otherWrap = form.querySelector('[data-other-position]');
  var otherInput = form.querySelector('#f-position-other');
  var otherReq = form.querySelector('[data-other-req]');
  var country = form.querySelector('#f-country');

  function syncOther() {
    var isOther = position.value === 'other';
    otherWrap.hidden = !isOther;
    otherInput.required = isOther;
    otherReq.hidden = !isOther;
    if (!isOther) setError(otherInput, '');
  }
  position.addEventListener('change', syncOther);

  function pick(select, value) {
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].text === value) { select.selectedIndex = i; return true; }
    }
    return false;
  }

  var params = new URLSearchParams(window.location.search);
  if (params.get('position') && !pick(position, params.get('position'))) {
    position.value = 'other';
    otherInput.value = params.get('position');
  }
  if (params.get('country')) pick(country, params.get('country'));
  syncOther();

  // WhatsApp: same as mobile.
  var mobile = form.querySelector('#f-mobile');
  var whatsapp = form.querySelector('#f-whatsapp');
  var sameMobile = form.querySelector('[data-same-mobile]');
  function syncWhatsapp() {
    if (sameMobile.checked) { whatsapp.value = mobile.value; setError(whatsapp, ''); }
    whatsapp.readOnly = sameMobile.checked;
  }
  sameMobile.addEventListener('change', syncWhatsapp);
  mobile.addEventListener('input', function () { if (sameMobile.checked) whatsapp.value = mobile.value; });

  // Latest job: no end date while still working there.
  var endDate = form.querySelector('#f-end');
  form.querySelector('[data-still-working]').addEventListener('change', function (e) {
    endDate.disabled = e.target.checked;
    if (e.target.checked) endDate.value = '';
  });

  // Children: the page starts with one row; add more as needed.
  var children = form.querySelector('[data-children]');
  var childTemplate = form.querySelector('[data-child-template]');
  var addChild = form.querySelector('[data-add-child]');
  var MAX_CHILDREN = 8;

  function addChildRow() {
    var n = children.children.length + 1;
    var html = childTemplate.innerHTML.replace(/\bN\b|-N\b|_N_/g, function (m) { return m.replace('N', n); });
    children.insertAdjacentHTML('beforeend', html);
    if (n >= MAX_CHILDREN) addChild.hidden = true;
    children.lastElementChild.querySelector('input').focus();
  }
  addChild.hidden = false;
  addChild.addEventListener('click', addChildRow);

  // Résumé: show the chosen file; drag and drop onto the zone.
  var upload = form.querySelector('[data-upload]');
  var fileInput = form.querySelector('#f-resume');
  var fileName = form.querySelector('#f-resume-file');

  function sizeLabel(bytes) {
    return bytes >= 1024 * 1024 ? (bytes / 1024 / 1024).toFixed(1) + ' MB' : Math.max(1, Math.round(bytes / 1024)) + ' KB';
  }
  fileInput.addEventListener('change', function () {
    var file = fileInput.files && fileInput.files[0];
    fileName.textContent = file ? 'Selected: ' + file.name + ' (' + sizeLabel(file.size) + ')' : '';
  });
  ['dragenter', 'dragover'].forEach(function (type) {
    upload.addEventListener(type, function () { upload.classList.add('is-over'); });
  });
  ['dragleave', 'drop'].forEach(function (type) {
    upload.addEventListener(type, function () { upload.classList.remove('is-over'); });
  });

  // Reference number: YY + month + a 3-digit count, like 26OCT001 (ROMA's ask).
  // The mock counts on this device only; the live site counts on the server.
  function nextReference() {
    var prefix = String(now.getFullYear()).slice(-2) + MONTHS[now.getMonth()];
    var count = 1;
    try {
      count = (parseInt(localStorage.getItem('roma-ref-' + prefix), 10) || 0) + 1;
      localStorage.setItem('roma-ref-' + prefix, String(count));
    } catch (e) {}
    return prefix + String(count).padStart(3, '0');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    for (var i = 0; i < steps.length; i++) {
      var bad = checkStep(steps[i]);
      if (bad) {
        if (i !== current) show(i, false);
        focusField(bad);
        return;
      }
    }
    var first = form.querySelector('#f-name').value.trim().split(/\s+/)[0];
    done.querySelector('[data-done-name]').textContent = first ? ', ' + first : '';
    done.querySelector('[data-ref]').textContent = nextReference();
    form.hidden = true;
    done.hidden = false;
    card.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
    done.focus({ preventScroll: true });
  });
})();

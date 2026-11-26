/* Camp Gan Israel Cherry Hill — shared form handling.
   Every <form data-form="Sheet tab name"> on the site uses this file.
   Submissions are sent to one Google Apps Script web app, which writes each
   form into its own tab of your Google Sheet (see source/google-apps-script.txt).

   To connect: paste your Apps Script web app URL between the quotes below. */
var FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbz0IsIvt_JkuWv48n_OxKDeyMULELWmsLHb-IwyACWfm-UBnc_n_jO1dK3372ruw0Yb/exec';

(function () {
  function money(n) { return '$' + n.toFixed(2); }

  function setStatus(form, msg, isError) {
    var el = form.querySelector('[data-status]');
    if (!el) return;
    el.textContent = msg;
    el.className = 'f-status' + (isError ? ' error' : '');
    el.hidden = false;
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // Adds up every checked box or radio that has a data-price.
  function updateTotal(form) {
    var out = form.querySelector('[data-total]');
    if (!out) return 0;
    var total = 0;
    form.querySelectorAll('[data-price]').forEach(function (el) {
      if (el.checked) total += parseFloat(el.getAttribute('data-price')) || 0;
    });
    out.textContent = money(total);
    return total;
  }

  function collect(form) {
    var data = { form: form.getAttribute('data-form'), submittedAt: new Date().toLocaleString() };
    var fd = new FormData(form);
    fd.forEach(function (value, key) {
      value = String(value).trim();
      if (data[key] !== undefined && data[key] !== '') data[key] += ', ' + value;
      else data[key] = value;
    });
    // Make sure unchecked groups still show up as empty columns.
    form.querySelectorAll('input[type=checkbox][name], input[type=radio][name]').forEach(function (el) {
      if (data[el.name] === undefined) data[el.name] = '';
    });
    if (form.querySelector('[data-total]')) data.total = money(updateTotal(form));
    return data;
  }

  function validate(form) {
    var firstBad = null;
    form.querySelectorAll('[required]').forEach(function (el) {
      var bad = (el.type === 'checkbox') ? !el.checked : !el.checkValidity();
      el.classList.toggle('f-bad', bad);
      if (bad && !firstBad) firstBad = el;
    });
    // <fieldset data-need-one> means: pick at least one option in this group.
    form.querySelectorAll('fieldset[data-need-one]').forEach(function (fs) {
      var ok = !!fs.querySelector('input:checked');
      fs.classList.toggle('f-bad', !ok);
      if (!ok && !firstBad) firstBad = fs;
    });
    if (firstBad) {
      setStatus(form, 'Please fill in the highlighted items.', true);
      if (firstBad.focus) firstBad.focus({ preventScroll: true });
      return false;
    }
    return true;
  }

  function setup(form) {
    form.setAttribute('novalidate', '');
    form.addEventListener('change', function () { updateTotal(form); });
    updateTotal(form);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) return;
      var data = collect(form);
      if (data.website) return; // spam trap filled in: quietly ignore

      if (!FORM_ENDPOINT) {
        setStatus(form, 'This sample form is not connected to a Google Sheet yet, so nothing was sent.', true);
        return;
      }
      var btn = form.querySelector('[type=submit]');
      var label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }

      // text/plain + no-cors lets the browser post to Google Apps Script directly.
      fetch(FORM_ENDPOINT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) })
        .then(function () {
          form.reset();
          updateTotal(form);
          setStatus(form, form.getAttribute('data-thanks') || 'Thank you! Your form was received.', false);
        })
        .catch(function () {
          setStatus(form, 'Sorry, something went wrong. Please try again or call 856-438-0607.', true);
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = label; }
        });
    });
  }

  document.querySelectorAll('form[data-form]').forEach(setup);
})();

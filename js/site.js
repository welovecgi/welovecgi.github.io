/* Camp Gan Israel Cherry Hill — shared behavior.
   Countdown to registration: shows "N days until registration opens on Dec 20",
   or "Registration is open" once Dec 20 arrives. */
(function () {
  var REG_OPEN = new Date(2026, 11, 20); // December 20, 2026, local time

  function updateCountdown() {
    var soon = document.getElementById('count-soon');
    var open = document.getElementById('count-open');
    if (!soon || !open) return;
    var days = Math.ceil((REG_OPEN.getTime() - Date.now()) / 86400000);
    if (days > 0) {
      soon.querySelector('[data-days]').textContent = days;
      soon.hidden = false;
      open.hidden = true;
    } else {
      soon.hidden = true;
      open.hidden = false;
    }
  }

  updateCountdown();

  // Sun rays behind the header logo: wrap the logo so the rays center on it.
  function addRays() {
    document.querySelectorAll('.site-header .brand > img').forEach(function (img) {
      var mark = document.createElement('span');
      mark.className = 'brand-mark';
      mark.innerHTML = '<span class="rays" aria-hidden="true"><i></i></span>';
      img.parentNode.insertBefore(mark, img);
      mark.appendChild(img);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addRays);
  } else {
    addRays();
  }
})();

/* ---------- Main menu (one place for every page) ----------
   To add or rename a menu item, edit NAV below. */
(function () {
  var NAV = [
    ['rates.html', 'Rates & Dates'],
    ['calendars.html', 'Divisions & Calendars'],
    { label: 'Parent Corner', items: [
      ['parent-info.html', 'Parent Corner home'],
      ['hours.html', 'Camp hours & pick-up'],
      ['swimming.html', 'Swimming'],
      ['lunch.html', 'Lunch & snacks'],
      ['trips.html', 'Trips & transportation'],
      ['kiddy.html', 'Kiddy & toddlers'],
      ['communication.html', 'Communication'],
      ['lice.html', 'Lice policy'],
      ['parent-info.html#faq', 'FAQs'],
      ['birthday.html', 'Birthday in camp'],
      ['pioneers.html', 'Pioneer trips'],
      ['photos.html', 'Photos']
    ] },
    { label: 'Staff Zone', items: [
      ['leadership.html', 'Leadership'],
      ['staff-local.html', 'Local staff application'],
      ['staff-apply.html', 'Out-of-town staff application']
      // Hidden from the menu on purpose (send these links to hired staff directly):
      // staff-jobs.html, staff-training.html, staff-signature.html
    ] }
    // No "More" menu: Register is the button in the header, and About, Donate and
    // All forms are linked in the footer of every page (see FOOTER_LINKS below).
  ];
  var FOOTER_LINKS = [['about.html', 'About'], ['donate.html', 'Donate'], ['forms.html', 'All forms']];
  document.querySelectorAll('.site-footer .footer-links').forEach(function (box) {
    var first = box.firstChild;
    FOOTER_LINKS.forEach(function (l) {
      if (box.querySelector('a[href="' + l[0] + '"]')) return;
      var a = document.createElement('a');
      a.href = l[0]; a.textContent = l[1];
      box.insertBefore(a, first);
    });
  });
  var CHEV = '<span class="chev" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></span>';

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  function link(item) {
    var cur = item[0].split('#')[0] === here && item[0].indexOf('#') === -1 ? ' aria-current="page"' : '';
    return '<a href="' + esc(item[0]) + '"' + cur + '>' + esc(item[1]) + '</a>';
  }

  function build(nav) {
    nav.innerHTML = NAV.map(function (n) {
      if (Array.isArray(n)) return link(n);
      var active = n.items.some(function (i) { return i[0].split('#')[0] === here; });
      return '<details><summary' + (active ? ' class="active"' : '') + '>' + esc(n.label) + ' ' + CHEV + '</summary>' +
        '<div class="dropdown">' + n.items.map(link).join('') + '</div></details>';
    }).join('');

    // Menu button for narrower screens (shown by CSS below 940px).
    if (!nav.id) nav.id = 'main-nav';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'menu-toggle';
    btn.setAttribute('aria-controls', nav.id);
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span class="bars" aria-hidden="true"><i></i><i></i><i></i></span><span>Menu</span>';
    nav.parentNode.insertBefore(btn, nav);
    function setOpen(open) {
      nav.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    btn.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });

    // Only one menu open at a time; close when clicking elsewhere or pressing Escape.
    var all = nav.querySelectorAll('details');
    all.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) all.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) all.forEach(function (d) { d.open = false; });
      if (!nav.contains(e.target) && !btn.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { all.forEach(function (d) { d.open = false; }); setOpen(false); }
    });
  }

  document.querySelectorAll('nav[data-nav]').forEach(build);
})();

/* ---------- Gentle scroll effects ----------
   Sections fade up as they come into view, and a few pieces (marked data-parallax)
   drift slightly as you scroll. Skipped for visitors who prefer reduced motion. */
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var SEL = '.section-head, .card, details.qa, .bento > *, .gallery > *, .band-lake .wrap, .form-card, .topic, ' +
            '.prose-block, .cal-card, .info, .page-head .wrap > *, #parent-corner .stack, .table-wrap, ol.big-steps li';
  document.documentElement.classList.add('reveal-on');
  var els = Array.prototype.filter.call(document.querySelectorAll(SEL), function (el) {
    return !el.closest('.site-header');
  });
  els.forEach(function (el) {
    el.setAttribute('data-reveal', '');
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.matches(SEL); });
    el.style.setProperty('--i', Math.min(sibs.indexOf(el), 5));
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  els.forEach(function (el) { io.observe(el); });

  var px = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  if (!px.length) return;
  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight;
    px.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var cur = parseFloat(el.getAttribute('data-py') || '0');
      var offset = (r.top - cur + r.height / 2) - vh / 2;
      var v = Math.max(-60, Math.min(60, -offset * parseFloat(el.getAttribute('data-parallax'))));
      el.setAttribute('data-py', v.toFixed(1));
      el.style.setProperty('--py', v.toFixed(1) + 'px');
    });
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* ---------- Question lists: one answer open at a time ----------
   Clicking another question while one is open just closes the open one.
   Clicking outside an open answer, or pressing Escape, closes it. */
(function () {
  document.querySelectorAll('.qa-list').forEach(function (list) {
    var items = list.querySelectorAll('details.qa');
    items.forEach(function (d) {
      // If another answer is open, the first click only closes it; the next click opens this one.
      d.querySelector('summary').addEventListener('click', function (e) {
        var other = Array.prototype.filter.call(items, function (o) { return o !== d && o.open; });
        if (other.length) {
          e.preventDefault();
          other.forEach(function (o) { o.open = false; });
        }
      });
    });
    document.addEventListener('click', function (e) {
      if (!list.contains(e.target) || !e.target.closest('details.qa')) items.forEach(function (o) { o.open = false; });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') items.forEach(function (o) { o.open = false; });
    });
  });
})();

/* ---------- Photo strip "film reel" effect ----------
   Photos are largest at the middle of the screen and smaller toward the edges,
   all centered on the same line. Skipped for reduced motion. */
(function () {
  var reel = document.querySelector('.reel');
  if (!reel) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var imgs = Array.prototype.slice.call(reel.children);
  var running = false, visible = true;

  function frame(t) {
    if (!visible) { running = false; return; }
    var vw = window.innerWidth, half = vw / 2;
    imgs.forEach(function (img) {
      var r = img.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var d = Math.min(1, Math.abs(cx - half) / (half + r.width / 2));
      var s = 0.84 + 0.26 * Math.cos(d * Math.PI / 2);
      img.style.scale = s.toFixed(3);
    });
    window.requestAnimationFrame(frame);
  }
  function start() { if (!running) { running = true; window.requestAnimationFrame(frame); } }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) start();
    }).observe(reel.parentNode);
  }
  start();
})();

/* =========================================================
   ITRVC Algorithm Lab — core
   - DOM helpers (el, svg)
   - Stepper: เครื่องเล่นแอนิเมชันทีละขั้น (เล่น/หยุด/ย้อน/เลื่อน)
   - Quiz: แบบทดสอบพร้อมเฉลย
   - Router: สลับหน้าด้วย #hash
   ========================================================= */
'use strict';

const DSA = (() => {
  const SVGNS = 'http://www.w3.org/2000/svg';

  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    setAttrs(n, attrs);
    append(n, kids);
    return n;
  }
  function svg(tag, attrs, ...kids) {
    const n = document.createElementNS(SVGNS, tag);
    setAttrs(n, attrs, true);
    append(n, kids);
    return n;
  }
  function setAttrs(n, attrs, isSvg) {
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') isSvg ? n.setAttribute('class', v) : (n.className = v);
      else if (k === 'html') n.innerHTML = v;
      else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
      else n.setAttribute(k, v === true ? '' : v);
    }
  }
  function append(n, kids) {
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      n.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
  }

  const ICON = {
    reset: '<svg viewBox="0 0 24 24"><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3.5 4v5h5"/></svg>',
    prev: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><rect x="6.5" y="5" width="4" height="14" rx="1"/><rect x="13.5" y="5" width="4" height="14" rx="1"/></svg>',
  };

  /**
   * Stepper — สร้างเฟรมทั้งหมดล่วงหน้า (build) แล้ววาดเฟรมใดก็ได้ (render)
   * ทำให้ย้อนกลับ/เลื่อนไปขั้นใดก็ได้ทันที
   */
  class Stepper {
    constructor(host, { build, render, interval = 1100, onFrame } = {}) {
      this.host = typeof host === 'string' ? document.querySelector(host) : host;
      this.build = build;
      this.render = render;
      this.onFrame = onFrame;
      this.base = interval;
      this.speed = 1;
      this.timer = null;
      this.i = 0;
      this.frames = [];
      this.makeUI();
      this.rebuild();
    }
    makeUI() {
      const id = this.host.id || ('st' + Math.random().toString(36).slice(2, 7));
      const btn = (name, label, fn, extra = '') =>
        el('button', { type: 'button', class: 'tbtn ' + extra, title: label, 'aria-label': label, html: ICON[name], onclick: fn });
      this.cap = el('div', { class: 'caption', 'aria-live': 'polite' });
      this.bReset = btn('reset', 'เริ่มใหม่', () => { this.pause(); this.go(0); });
      this.bPrev = btn('prev', 'ย้อนกลับ 1 ขั้น', () => { this.pause(); this.go(this.i - 1); });
      this.bPlay = btn('play', 'เล่นอัตโนมัติ', () => this.toggle(), 'tbtn-play');
      this.bNext = btn('next', 'ขั้นถัดไป', () => { this.pause(); this.go(this.i + 1); });
      this.range = el('input', {
        type: 'range', class: 'scrub', min: 0, max: 0, value: 0, id: id + '-scrub', 'aria-label': 'เลื่อนไปยังขั้นที่ต้องการ',
        oninput: (e) => { this.pause(); this.go(+e.target.value); },
      });
      this.count = el('span', { class: 'tcount' });
      this.speedSel = el('select', {
        class: 'tspeed', id: id + '-speed', 'aria-label': 'ความเร็วการเล่น',
        onchange: (e) => { this.speed = +e.target.value; if (this.timer) { this.pause(); this.play(); } },
      },
      el('option', { value: '0.5' }, 'ช้า'),
      el('option', { value: '1', selected: true }, 'ปกติ'),
      el('option', { value: '2' }, 'เร็ว'),
      el('option', { value: '4' }, 'เร็วมาก'));
      const bar = el('div', { class: 'transport' }, this.bReset, this.bPrev, this.bPlay, this.bNext, this.range, this.count, this.speedSel);
      const slot = this.host.querySelector('[data-transport]') || this.host;
      slot.append(this.cap, bar);
      this.host.addEventListener('keydown', (e) => {
        if (e.target.matches('input[type="number"], input[type="text"], select')) return;
        if (e.key === 'ArrowRight') { this.pause(); this.go(this.i + 1); e.preventDefault(); }
        if (e.key === 'ArrowLeft') { this.pause(); this.go(this.i - 1); e.preventDefault(); }
      });
    }
    rebuild() {
      this.pause();
      this.frames = this.build();
      this.range.max = Math.max(0, this.frames.length - 1);
      this.go(0);
    }
    go(i) {
      const n = this.frames.length;
      if (!n) return;
      this.i = Math.max(0, Math.min(n - 1, i));
      const f = this.frames[this.i];
      this.render(f, this.i, this.frames);
      this.cap.innerHTML = `<span class="cap-step">ขั้นที่ ${this.i + 1}</span>${f.caption || ''}`;
      this.count.textContent = `${this.i + 1} / ${n}`;
      this.range.value = this.i;
      this.bPrev.disabled = this.i === 0;
      this.bReset.disabled = this.i === 0;
      this.bNext.disabled = this.i === n - 1;
      if (this.onFrame) this.onFrame(f, this.i);
    }
    play() {
      if (this.i >= this.frames.length - 1) this.go(0);
      this.bPlay.innerHTML = ICON.pause;
      this.bPlay.setAttribute('aria-label', 'หยุดชั่วคราว');
      this.bPlay.title = 'หยุดชั่วคราว';
      this.timer = setInterval(() => {
        if (this.i >= this.frames.length - 1) { this.pause(); return; }
        this.go(this.i + 1);
      }, this.base / this.speed);
    }
    pause() {
      clearInterval(this.timer);
      this.timer = null;
      if (this.bPlay) {
        this.bPlay.innerHTML = ICON.play;
        this.bPlay.setAttribute('aria-label', 'เล่นอัตโนมัติ');
        this.bPlay.title = 'เล่นอัตโนมัติ';
      }
    }
    toggle() { this.timer ? this.pause() : this.play(); }
  }

  /* ---------- Quiz ---------- */
  function shuffle(a) {
    const b = a.slice();
    for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
    return b;
  }
  function quiz(host, questions) {
    host = typeof host === 'string' ? document.querySelector(host) : host;
    if (!host) return;
    const list = el('div', { class: 'quiz' });
    const scoreB = el('b');
    const bar = el('i');
    const msg = el('span', { class: 'small' });
    const retry = el('button', { class: 'btn btn-sm', type: 'button', onclick: () => draw(true) }, 'ทำใหม่');
    const score = el('div', { class: 'qscore' }, el('span', {}, 'คะแนน'), scoreB, el('div', { class: 'qbar' }, bar), msg, retry);
    host.append(list, score);
    let right = 0, done = 0;
    function update() {
      scoreB.textContent = `${right} / ${questions.length}`;
      bar.style.width = (right / questions.length * 100) + '%';
      if (done < questions.length) msg.textContent = `ตอบแล้ว ${done} ข้อ`;
      else msg.textContent = right / questions.length >= 0.7 ? 'ผ่านเกณฑ์ 70% พร้อมไปหน่วยถัดไป' : 'ยังไม่ถึง 70% ลองทบทวนบทเรียนแล้วทำใหม่';
    }
    function draw(reshuffle) {
      right = 0; done = 0;
      list.replaceChildren();
      questions.forEach((q, qi) => {
        const opts = reshuffle ? shuffle(q.options.map((t, k) => ({ t, k }))) : q.options.map((t, k) => ({ t, k }));
        const exp = el('div', { class: 'qexp', hidden: true });
        const box = el('div', { class: 'qopts' });
        const card = el('article', { class: 'qcard' }, el('h4', {}, el('span', {}, String(qi + 1).padStart(2, '0')), el('div', { html: q.q })), box, exp);
        opts.forEach(({ t, k }) => {
          const b = el('button', { type: 'button', class: 'qopt', html: t, onclick: () => {
            const ok = k === q.answer;
            box.querySelectorAll('.qopt').forEach((x) => {
              x.disabled = true;
              const xk = +x.dataset.k;
              if (xk === q.answer) x.classList.add('is-right');
              else if (x !== b) x.classList.add('is-faded');
            });
            if (!ok) b.classList.add('is-wrong');
            exp.innerHTML = (ok ? '<b class="ok">ถูกต้อง</b> · ' : '<b class="no">ยังไม่ถูก</b> · ') + q.explain;
            exp.hidden = false;
            done++; if (ok) right++;
            update();
          } });
          b.dataset.k = k;
          box.append(b);
        });
        list.append(card);
      });
      update();
    }
    draw(false);
  }

  /* ---------- copy buttons for code blocks ---------- */
  function initCopy(root = document) {
    root.querySelectorAll('.codeblock').forEach((cb) => {
      if (cb.querySelector('.copybtn')) return;
      const pre = cb.querySelector('pre');
      const b = el('button', { type: 'button', class: 'copybtn' }, 'คัดลอก');
      b.addEventListener('click', () => {
        const text = pre.innerText;
        const done = () => { b.textContent = 'คัดลอกแล้ว'; setTimeout(() => (b.textContent = 'คัดลอก'), 1600); };
        const fallback = () => {
          const r = document.createRange(); r.selectNodeContents(pre);
          const s = getSelection(); s.removeAllRanges(); s.addRange(r);
          b.textContent = 'กด Ctrl+C';
        };
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
          else fallback();
        } catch (e) { fallback(); }
      });
      cb.append(b);
    });
  }

  /* ---------- router: #home, #unit-1, #u1-3 ... ---------- */
  function initRouter() {
    const views = [...document.querySelectorAll('.view')];
    const navLinks = [...document.querySelectorAll('.topnav a')];
    function route() {
      const id = decodeURIComponent(location.hash.slice(1)) || 'home';
      let target = document.getElementById(id);
      if (!target) target = document.getElementById('home');
      const view = target.closest('.view') || document.getElementById('home');
      views.forEach((v) => { v.hidden = v !== view; });
      navLinks.forEach((a) => {
        if (a.getAttribute('href') === '#' + view.id) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
      document.title = view.dataset.title || document.title;
      if (target === view) window.scrollTo({ top: 0, behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });
      else requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
    }
    window.addEventListener('hashchange', route);
    route();
  }

  /* highlight the lesson chip that is on screen */
  function initLessonNav(nav) {
    if (!nav || !('IntersectionObserver' in window)) return;
    const links = [...nav.querySelectorAll('a')];
    const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.classList.remove('is-on'));
        const a = map.get(en.target.id);
        if (a) {
          a.classList.add('is-on');
          const strip = a.parentElement;
          strip.scrollLeft = a.offsetLeft - strip.offsetLeft - 16;
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  return { el, svg, Stepper, quiz, initCopy, initRouter, initLessonNav, reduceMotion, rand, shuffle };
})();

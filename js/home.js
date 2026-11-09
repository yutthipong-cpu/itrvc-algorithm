/* หน้าแรก: วิเคราะห์รายวิชา การ์ดหน่วย แผนรายสัปดาห์ และแอนิเมชันหัวเรื่อง */
'use strict';

(() => {
  const { el } = DSA;
  const unitLink = (n) => {
    const u = COURSE.units[n - 1];
    return u.ready
      ? el('a', { class: 'tag tag-ok', href: '#unit-' + n, title: u.title }, 'หน่วย ' + n)
      : el('span', { class: 'tag tag-wait', title: u.title }, 'หน่วย ' + n);
  };

  /* จุดประสงค์ / สมรรถนะ */
  const objList = document.getElementById('objList');
  COURSE.objectives.forEach((o) => objList.append(el('li', {}, el('div', {}, o.text, el('div', { class: 'tags' }, o.units.map(unitLink), o.note && el('span', { class: 'tag tag-wait' }, o.note))))));
  const compList = document.getElementById('compList');
  COURSE.competencies.forEach((o) => compList.append(el('li', {}, el('div', {}, o.text, el('div', { class: 'tags' }, o.units.map(unitLink))))));

  /* คำอธิบายรายวิชา → หน่วย */
  const descBody = document.getElementById('descBody');
  COURSE.description.forEach((d) => descBody.append(el('tr', {}, el('td', {}, d.phrase), el('td', {}, el('div', { class: 'tags' }, d.units.map(unitLink))))));

  /* การ์ดหน่วยการเรียน */
  const grid = document.getElementById('unitGrid');
  COURSE.units.forEach((u) => {
    const wk = u.weeks.length > 1 ? `สัปดาห์ ${u.weeks[0]}–${u.weeks[u.weeks.length - 1]}` : `สัปดาห์ ${u.weeks[0]}`;
    grid.append(el('article', { class: 'ucard' + (u.ready ? ' is-ready' : '') },
      el('div', { class: 'ucard-top' },
        el('div', { class: 'ucard-no' }, String(u.no).padStart(2, '0')),
        el('div', {}, el('h3', {}, u.title), el('div', { class: 'en' }, u.en))),
      el('div', { class: 'ucard-meta' }, el('span', {}, wk), el('span', {}, `${u.theory + u.practice} ชม. (ท ${u.theory} / ป ${u.practice})`)),
      el('details', { open: u.ready || null }, el('summary', {}, `${u.topics.length} หัวข้อ`),
        el('ol', {}, u.topics.map((t) => el('li', {}, t)))),
      el('div', { class: 'ucard-foot' },
        el('div', { class: 'tags' }, u.comp.map((c) => el('span', { class: 'tag', title: COURSE.competencies[c - 1].text }, 'สมรรถนะ ' + c))),
        u.ready ? el('a', { class: 'btn btn-primary btn-sm', href: '#unit-' + u.no }, 'เข้าเรียน') : el('span', { class: 'tag tag-wait' }, 'กำลังจัดทำ'))));
  });

  /* แผนการสอนรายสัปดาห์: กระจายหัวข้อของแต่ละหน่วยไปตามสัปดาห์ */
  const planBody = document.getElementById('planBody');
  let tTotal = 0, pTotal = 0;
  COURSE.units.forEach((u) => {
    const per = Math.ceil(u.topics.length / u.weeks.length);
    u.weeks.forEach((w, k) => {
      const topics = u.topics.slice(k * per, (k + 1) * per);
      tTotal += 1; pTotal += 4;
      planBody.append(el('tr', { class: u.ready ? 'is-hl' : null },
        el('td', { class: 'num' }, w),
        el('td', {}, el('b', {}, `หน่วยที่ ${u.no} `), u.title),
        el('td', {}, el('ul', { style: { margin: 0, paddingLeft: '1.1em' } }, topics.map((t) => el('li', {}, t)))),
        el('td', { class: 'num' }, 1),
        el('td', { class: 'num' }, 4)));
    });
  });
  document.getElementById('planFoot').append(el('tr', {},
    el('td', { colspan: 3 }, el('b', {}, 'รวมตลอดภาคเรียน')),
    el('td', { class: 'num' }, el('b', {}, tTotal)),
    el('td', { class: 'num' }, el('b', {}, pTotal))));

  /* แอนิเมชันหัวเรื่อง: Bubble Sort วนไปเรื่อย ๆ */
  const box = document.getElementById('heroBars');
  const cap = document.getElementById('heroCap');
  if (!box) return;
  const N = 9;
  let vals = [];
  let bars = [];
  const slot = 100 / N;
  function layout() {
    bars.forEach((b, i) => { b.el.style.left = (i * slot + slot * 0.04) + '%'; b.el.style.transform = 'none'; });
  }
  function reset() {
    vals = DSA.shuffle([12, 25, 33, 41, 50, 62, 71, 84, 95]);
    box.replaceChildren();
    bars = vals.map((v) => {
      const e = el('div', { class: 'sortbar', style: { height: (v * 1.75) + 'px' } }, el('span', {}, v));
      box.append(e);
      return { v, el: e };
    });
    layout();
  }
  reset();
  if (DSA.reduceMotion()) {
    bars.sort((a, b) => a.v - b.v); layout();
    bars.forEach((b) => b.el.classList.add('is-ok'));
    cap.textContent = 'Bubble Sort · เรียงจากน้อยไปมากเรียบร้อย';
    return;
  }
  let i = 0, j = 0, swaps = 0, cmps = 0, resting = false;
  function tick() {
    if (resting || document.hidden || document.getElementById('home').hidden) return;
    bars.forEach((b) => b.el.classList.remove('is-cmp'));
    if (i >= N - 1) {
      bars.forEach((b) => b.el.classList.add('is-ok'));
      cap.textContent = `เรียงเสร็จ · เปรียบเทียบ ${cmps} ครั้ง สลับ ${swaps} ครั้ง → เริ่มรอบใหม่`;
      i = 0; j = 0; swaps = 0; cmps = 0; resting = true;
      setTimeout(() => { reset(); resting = false; }, 1800);
      return;
    }
    const a = bars[j], b = bars[j + 1];
    a.el.classList.add('is-cmp'); b.el.classList.add('is-cmp');
    cmps++;
    if (a.v > b.v) {
      bars[j] = b; bars[j + 1] = a; swaps++;
      cap.textContent = `รอบที่ ${i + 1} · ${a.v} > ${b.v} จึงสลับตำแหน่ง`;
      layout();
    } else {
      cap.textContent = `รอบที่ ${i + 1} · ${a.v} ≤ ${b.v} อยู่ถูกที่แล้ว`;
    }
    j++;
    if (j >= N - 1 - i) { bars[N - 1 - i].el.classList.add('is-ok'); j = 0; i++; }
  }
  setInterval(tick, 700);
})();

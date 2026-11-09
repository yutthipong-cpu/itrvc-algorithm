/* =========================================================
   หน่วยที่ 1 — แอนิเมชันและกิจกรรมทั้งหมด
   ทุกแอนิเมชันใช้รูปแบบเดียวกัน: build() สร้างรายการเฟรม
   (สถานะ + คำอธิบาย) ล่วงหน้า แล้ว render(frame) วาดสถานะนั้น
   ========================================================= */
'use strict';

(() => {
  const { el, svg, Stepper, rand } = DSA;
  const $ = (s, r = document) => r.querySelector(s);
  const stageOf = (root) => root.querySelector('[data-stage]');

  /* ---------------------------------------------------------
     1.1-ก ข้อมูล → ประมวลผล → สารสนเทศ
     --------------------------------------------------------- */
  function demoDataInfo() {
    const root = $('#demo-data-info'); if (!root) return;
    const S = [{ n: 'สมชาย', s: 65 }, { n: 'มานี', s: 82 }, { n: 'ปิติ', s: 47 }, { n: 'ชูใจ', s: 90 }, { n: 'วีระ', s: 73 }];
    const stage = stageOf(root);
    const chips = el('div', { class: 'chips' });
    const op = el('div', { class: 'proc-op' });
    const val = el('div', { class: 'proc-val' });
    const info = el('ul', { class: 'info-list' });
    stage.append(el('div', { class: 'flow3' },
      el('section', { class: 'flow-col' }, el('h4', { class: 'flow-h', html: 'ข้อมูล <small>Data</small>' }), chips),
      el('div', { class: 'flow-arrow', 'aria-hidden': 'true' }),
      el('section', { class: 'flow-col flow-proc' }, el('h4', { class: 'flow-h', html: 'ประมวลผล <small>Process</small>' }), op, val),
      el('div', { class: 'flow-arrow', 'aria-hidden': 'true' }),
      el('section', { class: 'flow-col' }, el('h4', { class: 'flow-h', html: 'สารสนเทศ <small>Information</small>' }), info)));
    const chipEls = S.map((x) => { const c = el('div', { class: 'dchip' }, el('b', {}, x.s), el('span', {}, x.n)); chips.append(c); return c; });
    const sum = S.reduce((a, x) => a + x.s, 0);
    const avg = (sum / S.length).toFixed(1);
    const INFO = [
      `คะแนนเฉลี่ยของห้อง = <b>${avg}</b>`,
      'ผ่านเกณฑ์ <b>4 คน</b> ไม่ผ่าน <b>1 คน</b> (ปิติ)',
      'คะแนนสูงสุด <b>90</b> (ชูใจ)',
      '<b>ตัดสินใจ:</b> จัดสอนเสริมให้ปิติก่อนสอบปลายภาค',
    ];
    const build = () => {
      const f = [];
      f.push({ chips: S.map(() => 'wait'), op: 'รอรับข้อมูล', val: '—', info: 0,
        caption: '<b>ข้อมูล (Data)</b> คือข้อเท็จจริงดิบ เช่น คะแนนสอบ 5 จำนวน ตัวเลขแต่ละตัวยังไม่บอกว่าห้องนี้เรียนเป็นอย่างไร' });
      let acc = 0;
      S.forEach((x, k) => {
        const prev = acc; acc += x.s;
        f.push({ chips: S.map((_, j) => (j < k ? 'used' : j === k ? 'cur' : 'wait')), op: 'รวมคะแนน', val: `${prev} + ${x.s} = ${acc}`, info: 0,
          caption: `นำคะแนนของ${x.n} (<b>${x.s}</b>) เข้าสู่การประมวลผล ผลรวมสะสมตอนนี้ = <b>${acc}</b>` });
      });
      f.push({ chips: S.map(() => 'used'), op: 'หาค่าเฉลี่ย', val: `${sum} ÷ ${S.length} = ${avg}`, info: 1,
        caption: `นำผลรวม ${sum} หารด้วยจำนวนนักเรียน ${S.length} คน ได้ค่าเฉลี่ย ${avg} ผลลัพธ์แรกออกมาเป็น<b>สารสนเทศ</b>แล้ว` });
      f.push({ chips: S.map((x) => (x.s >= 50 ? 'ok' : 'bad')), op: 'เทียบเกณฑ์ผ่าน (≥ 50)', val: 'ผ่าน 4 · ไม่ผ่าน 1', info: 2,
        caption: 'เปรียบเทียบคะแนนแต่ละคนกับเกณฑ์ 50 คะแนน (สีเขียว = ผ่าน, สีแดง = ไม่ผ่าน)' });
      f.push({ chips: S.map((x) => (x.s === 90 ? 'cur' : 'used')), op: 'หาค่าสูงสุด', val: 'max = 90', info: 3,
        caption: 'ค้นหาค่าที่มากที่สุดในชุดข้อมูล ได้ 90 คะแนนของชูใจ' });
      f.push({ chips: S.map((x) => (x.s >= 50 ? 'ok' : 'bad')), op: 'สรุปผล', val: 'พร้อมใช้ตัดสินใจ', info: 4,
        caption: '<b>สารสนเทศ (Information)</b> คือข้อมูลที่ผ่านการประมวลผลแล้ว มีความหมาย และนำไปใช้ตัดสินใจได้ทันที' });
      return f;
    };
    const render = (fr) => {
      chipEls.forEach((c, j) => { c.className = 'dchip is-' + fr.chips[j]; });
      op.textContent = fr.op; val.textContent = fr.val;
      if (!fr.info) info.replaceChildren(el('li', { class: 'info-empty' }, 'ยังไม่มีสารสนเทศ'));
      else info.replaceChildren(...INFO.slice(0, fr.info).map((t, j) => el('li', { class: j === fr.info - 1 ? 'is-new' : null, html: t })));
    };
    new Stepper(root, { build, render, interval: 1500 });
  }

  /* ---------------------------------------------------------
     1.1-ข ลำดับชั้นของข้อมูล
     --------------------------------------------------------- */
  function demoHierarchy() {
    const root = $('#demo-hierarchy'); if (!root) return;
    const L = [['บิต', 'Bit'], ['ไบต์', 'Byte'], ['ฟิลด์', 'Field'], ['เรคคอร์ด', 'Record'], ['ไฟล์', 'File'], ['ฐานข้อมูล', 'Database']];
    const stage = stageOf(root);
    const ladder = el('ol', { class: 'ladder', 'aria-label': 'ลำดับชั้นของข้อมูล จากเล็กไปใหญ่' });
    const lis = L.map(([t, e]) => { const li = el('li', {}, el('span', {}, t), el('small', {}, e)); ladder.append(li); return li; });
    const view = el('div', { class: 'hier-view' });
    stage.append(el('div', { class: 'hier' }, ladder, view));
    const byte = (b, ch) => `<div class="byte"><code>${b}</code><b>${ch}</b></div>`;
    const VIEWS = [
      () => `<div class="bits"><span class="bit big on">1</span><span class="bit big">0</span></div>
             <p class="hv-note">บิต (Binary Digit) เก็บค่าได้เพียง 0 หรือ 1 เหมือนสวิตช์ปิด/เปิด</p>`,
      () => `<div class="bits">${'01000001'.split('').map((b) => `<span class="bit${b === '1' ? ' on' : ''}">${b}</span>`).join('')}</div>
             <div class="hv-eq">01000001₂ = 65₁₀ = ตัวอักษร 'A'</div>
             <p class="hv-note">8 บิต = 1 ไบต์ แทนตัวอักษรได้ 1 ตัว (ตามรหัส ASCII)</p>`,
      () => `<div class="bytes">${byte('01000001', 'A')}${byte('01101110', 'n')}${byte('01101110', 'n')}</div>
             <div class="bracket">ฟิลด์ <code>ชื่อ</code> = "Ann"</div>
             <p class="hv-note">หลายไบต์รวมกันเป็นฟิลด์ ซึ่งเก็บข้อมูล 1 เรื่อง เช่น ชื่อ อายุ คะแนน</p>`,
      () => `<div class="rec"><div><small>รหัส</small><b>66001</b></div><div class="is-hl"><small>ชื่อ</small><b>Ann</b></div><div><small>แผนก</small><b>IT</b></div><div><small>คะแนน</small><b>82</b></div></div>
             <p class="hv-note">หลายฟิลด์ที่เกี่ยวข้องกันรวมเป็นเรคคอร์ด = ข้อมูลของนักเรียน 1 คน</p>`,
      () => `<table class="mini-t"><thead><tr><th>รหัส</th><th>ชื่อ</th><th>แผนก</th><th>คะแนน</th></tr></thead><tbody>
             <tr class="is-hl"><td>66001</td><td>Ann</td><td>IT</td><td>82</td></tr><tr><td>66002</td><td>Beam</td><td>IT</td><td>75</td></tr>
             <tr><td>66003</td><td>Chai</td><td>IT</td><td>91</td></tr><tr><td>66004</td><td>Dao</td><td>IT</td><td>68</td></tr></tbody></table>
             <p class="hv-note">ไฟล์ <code>students</code> คือกลุ่มของเรคคอร์ดชนิดเดียวกัน</p>`,
      () => `<div class="dbfiles"><div class="dbfile"><b>students</b><ul><li>รหัส</li><li>ชื่อ</li><li>แผนก</li></ul></div>
             <span class="dblink">⇄ รหัส</span>
             <div class="dbfile"><b>enrollments</b><ul><li>รหัส</li><li>รหัสวิชา</li><li>เกรด</li></ul></div>
             <span class="dblink">⇄ รหัสวิชา</span>
             <div class="dbfile"><b>subjects</b><ul><li>รหัสวิชา</li><li>ชื่อวิชา</li></ul></div></div>
             <p class="hv-note">ฐานข้อมูลคือกลุ่มของไฟล์ที่สัมพันธ์กัน เชื่อมโยงกันด้วยฟิลด์ที่ใช้ร่วมกัน</p>`,
    ];
    const CAP = [
      '<b>บิต (Bit)</b> หน่วยที่เล็กที่สุดที่คอมพิวเตอร์เก็บได้ มีค่า 0 หรือ 1',
      'นำ 8 บิตมาเรียงกันเป็น <b>ไบต์ (Byte)</b> แทนค่าได้ 2⁸ = 256 แบบ พอสำหรับตัวอักษรหนึ่งตัว',
      'นำหลายไบต์มารวมกันเป็น <b>ฟิลด์ (Field)</b> เช่น ฟิลด์ชื่อ "Ann" ใช้ 3 ไบต์',
      'ฟิลด์ที่เกี่ยวข้องกันรวมเป็น <b>เรคคอร์ด (Record)</b> หนึ่งแถว = ข้อมูลของนักเรียนหนึ่งคน',
      'เรคคอร์ดชนิดเดียวกันหลาย ๆ แถวรวมเป็น <b>ไฟล์ (File)</b> หรือตาราง',
      'ไฟล์หลายไฟล์ที่สัมพันธ์กันรวมเป็น <b>ฐานข้อมูล (Database)</b> ทั้งหมดนี้เริ่มจาก 0 กับ 1',
    ];
    new Stepper(root, {
      interval: 1900,
      build: () => L.map((_, k) => ({ k, caption: CAP[k] })),
      render: (fr) => {
        lis.forEach((li, j) => { li.className = j < fr.k ? 'is-done' : j === fr.k ? 'is-cur' : ''; });
        view.innerHTML = VIEWS[fr.k]();
        [...view.children].forEach((c, j) => { c.classList.add('anim-rise'); c.style.animationDelay = (j * 0.12) + 's'; });
      },
    });
  }

  /* ---------------------------------------------------------
     1.2-ก ตัวแปรในหน่วยความจำ
     --------------------------------------------------------- */
  function demoMemory() {
    const root = $('#demo-memory'); if (!root) return;
    const BASE = 1000, CELLS = 16;
    const V = [
      { code: `<span class="k">char</span>  grade  = <span class="s">'A'</span>;`, name: 'grade', type: 'char', bytes: ['41'], value: "'A'", bin: '01000001',
        note: "char ใช้ 1 ไบต์ เก็บรหัส ASCII ของ 'A' คือ 65 (0x41)" },
      { code: `<span class="k">int</span>   age    = 17;`, name: 'age', type: 'int', bytes: ['00', '00', '00', '11'], value: '17', bin: '00000000 00000000 00000000 00010001',
        note: 'int ใช้ 4 ไบต์ (32 บิต) เก็บจำนวนเต็มได้ราว ±2,147 ล้าน' },
      { code: `<span class="k">float</span> gpa    = 3.25;`, name: 'gpa', type: 'float', bytes: ['40', '50', '00', '00'], value: '3.25', bin: '01000000 01010000 00000000 00000000',
        note: 'float ใช้ 4 ไบต์ เก็บทศนิยมตามมาตรฐาน IEEE 754 (เครื่องหมาย · เลขชี้กำลัง · แมนทิสซา)' },
      { code: `<span class="k">bool</span>  passed = <span class="k">true</span>;`, name: 'passed', type: 'bool', bytes: ['01'], value: 'true', bin: '00000001',
        note: 'bool ใช้ 1 ไบต์ ทั้งที่ต้องการแค่ 1 บิต เพราะหน่วยความจำมีเลขที่อยู่ทีละไบต์' },
      { code: `<span class="k">char</span>  name[4] = <span class="s">"Ann"</span>;`, name: 'name', type: 'char[4]', bytes: ['41', '6E', '6E', '00'], value: '"Ann"', bin: '01000001 01101110 01101110 00000000',
        note: 'อาร์เรย์ char 4 ช่องเรียงติดกัน ช่องสุดท้ายเป็น \\0 (00) บอกว่าสตริงจบตรงนี้' },
    ];
    let off = 0;
    V.forEach((v) => { v.start = off; off += v.bytes.length; });
    const stage = stageOf(root);
    const code = el('div', { class: 'codebox', 'aria-label': 'โค้ดภาษา C' });
    const lines = V.map((v, k) => { const l = el('span', { class: 'ln', 'data-n': k + 1, html: v.code }); code.append(l); return l; });
    const grid = el('div', { class: 'memgrid' });
    const cells = Array.from({ length: CELLS }, (_, k) => {
      const box = el('div', { class: 'box' }, '··');
      const tag = el('div', { class: 'tagname' });
      const c = el('div', { class: 'mcell' }, el('div', { class: 'addr' }, BASE + k), box, tag);
      grid.append(c);
      return { c, box, tag };
    });
    const used = el('span');
    const detail = el('dl', { class: 'memdetail' });
    stage.append(el('div', { class: 'mem' },
      el('div', {}, el('div', { class: 'memhead' }, el('span', {}, 'โค้ด (ภาษา C)'), el('span', {}, 'บรรทัดที่ไฮไลต์ = กำลังทำงาน')), code,
        el('p', { class: 'small muted', style: { marginTop: '10px' } }, 'ค่าในช่องหน่วยความจำแสดงเป็นเลขฐานสิบหก (hex) 1 ช่อง = 1 ไบต์ = 8 บิต')),
      el('div', {}, el('div', { class: 'memhead' }, el('span', {}, 'หน่วยความจำ (RAM) · เลขที่อยู่ 1000–1015'), used), grid, detail)));

    const build = () => {
      const f = [{ upto: 0, caption: 'หน่วยความจำหลักเปรียบเหมือน<b>ตู้ล็อกเกอร์</b> แต่ละช่องเก็บได้ 1 ไบต์ และมี<b>เลขที่อยู่ (address)</b> ประจำช่อง ตอนนี้ยังว่างทุกช่อง' }];
      V.forEach((v, k) => f.push({ upto: k + 1, caption: `ประกาศ <code>${v.name}</code> ชนิด <b>${v.type}</b> → จองพื้นที่ ${v.bytes.length} ไบต์ ที่ ${BASE + v.start}${v.bytes.length > 1 ? '–' + (BASE + v.start + v.bytes.length - 1) : ''} · ${v.note}` }));
      f.push({ upto: V.length, end: true, caption: `ประกาศครบ 5 ตัวแปร ใช้หน่วยความจำ ${off} ไบต์ ชนิดข้อมูลจึงกำหนดทั้ง<b>ขนาด</b> <b>ช่วงค่า</b> และ<b>วิธีแปลความหมาย</b>ของบิตในหน่วยความจำ` });
      return f;
    };
    const render = (fr) => {
      lines.forEach((l, k) => l.classList.toggle('on', !fr.end && k === fr.upto - 1));
      cells.forEach(({ c, box, tag }) => { c.className = 'mcell'; box.textContent = '··'; tag.textContent = ''; });
      V.slice(0, fr.upto).forEach((v, k) => {
        v.bytes.forEach((b, j) => {
          const cell = cells[v.start + j];
          cell.c.className = `mcell v${k}` + (!fr.end && k === fr.upto - 1 ? ' is-new' : '');
          cell.box.textContent = b;
          cell.tag.textContent = j === 0 ? v.name : '';
        });
      });
      const usedBytes = V.slice(0, fr.upto).reduce((a, v) => a + v.bytes.length, 0);
      used.textContent = `ใช้ ${usedBytes}/${CELLS} ไบต์`;
      const v = fr.upto && !fr.end ? V[fr.upto - 1] : null;
      detail.replaceChildren();
      const row = (k, val) => detail.append(el('dt', {}, k), el('dd', {}, val));
      if (v) {
        row('ตัวแปร', v.name); row('ชนิด', v.type); row('ขนาด', v.bytes.length + ' ไบต์ = ' + v.bytes.length * 8 + ' บิต');
        row('ที่อยู่เริ่มต้น', String(BASE + v.start)); row('ค่า', v.value); row('ในรูปบิต', v.bin);
      } else if (fr.end) {
        V.forEach((x) => row(x.name, `${x.type} · ${x.bytes.length} ไบต์ · @${BASE + x.start}`));
      } else {
        row('สถานะ', 'ยังไม่มีการจองพื้นที่');
      }
    };
    new Stepper(root, { build, render, interval: 2200 });
  }

  /* ---------------------------------------------------------
     1.2-ข แปลงเลขฐานสิบเป็นฐานสอง
     --------------------------------------------------------- */
  function demoBinary() {
    const root = $('#demo-binary'); if (!root) return;
    const input = $('#bin-n', root);
    const stage = stageOf(root);
    const tbody = el('tbody');
    const res = el('div', { class: 'binres' });
    stage.append(el('div', { class: 'binwrap' },
      el('div', { style: { overflowX: 'auto' } }, el('table', { class: 'divtable' },
        el('thead', {}, el('tr', {}, el('th', {}, 'ตัวตั้ง'), el('th', {}, '÷ 2 ='), el('th', {}, 'ผลหาร'), el('th', { style: { textAlign: 'center' } }, 'เศษ'))), tbody)),
      res));
    let st;
    const build = () => {
      let n = Math.max(0, Math.min(1023, Math.floor(+input.value || 0)));
      input.value = n;
      const N = n;
      const rows = [];
      const f = [{ rows: 0, caption: `ต้องการแปลง <b>${N}</b> เป็นเลขฐานสอง วิธีคือหารด้วย 2 ซ้ำไปเรื่อย ๆ แล้วจดเศษไว้ จนผลหารเป็น 0` }];
      if (N === 0) { rows.push({ a: 0, q: 0, r: 0 }); }
      while (n > 0) { rows.push({ a: n, q: Math.floor(n / 2), r: n % 2 }); n = Math.floor(n / 2); }
      if (N > 0) rows.forEach((r, k) => f.push({ rows: k + 1, caption: `${r.a} ÷ 2 = ${r.q} เศษ <b>${r.r}</b>${r.q === 0 ? ' · ผลหารเป็น 0 แล้ว หยุดหาร' : ''}` }));
      const bits = rows.map((r) => r.r).reverse().join('');
      f.push({ rows: rows.length, read: true, caption: `อ่านเศษจาก<b>ล่างขึ้นบน</b> ได้ ${bits}₂ (เศษตัวแรกคือบิตขวาสุด)` });
      f.push({ rows: rows.length, read: true, verify: true, caption: `ตรวจคำตอบ: คูณแต่ละบิตด้วยค่าประจำหลัก (2ⁿ) แล้วรวมกัน ต้องได้ ${N} กลับมา` });
      st = { rows, bits, N };
      return f;
    };
    const render = (fr) => {
      tbody.replaceChildren(...st.rows.slice(0, fr.rows).map((r, k) => el('tr', { class: !fr.read && k === fr.rows - 1 ? 'is-new' : null },
        el('td', {}, r.a), el('td', {}, '÷ 2 ='), el('td', {}, r.q), el('td', { class: 'rem' + (fr.read ? ' read' : '') }, r.r))));
      res.replaceChildren();
      if (!fr.read) {
        res.append(el('p', { class: 'readarrow' }, fr.rows ? 'เศษที่ได้ (บนลงล่าง): ' + st.rows.slice(0, fr.rows).map((r) => r.r).join(' ') : 'ยังไม่ได้เริ่มหาร'));
        return;
      }
      const b = st.bits.split('');
      res.append(el('p', { class: 'readarrow' }, 'ผลลัพธ์ (อ่านเศษจากล่างขึ้นบน)'),
        el('div', { class: 'binbits' }, b.map((x, k) => el('div', { class: 'binbit anim-pop', style: { animationDelay: (k * 0.08) + 's' } },
          el('b', { class: x === '0' ? 'zero' : null }, x), el('small', {}, '2' + sup(b.length - 1 - k) + '=' + 2 ** (b.length - 1 - k))))),
        el('div', { class: 'hv-eq' }, `${st.N}₁₀ = ${st.bits}₂`));
      if (fr.verify) {
        const parts = b.map((x, k) => (x === '1' ? 2 ** (b.length - 1 - k) : null)).filter((x) => x != null);
        res.append(el('div', { class: 'binsum anim-rise' }, (parts.length ? parts.join(' + ') : '0') + ' = ' + st.N + ' ✓'));
      }
    };
    const sup = (n) => String(n).split('').map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('');
    const stepper = new Stepper(root, { build, render, interval: 1300 });
    input.addEventListener('change', () => stepper.rebuild());
    $('#bin-rand', root).addEventListener('click', () => { input.value = rand(5, 255); stepper.rebuild(); });
  }

  /* ---------------------------------------------------------
     1.3 รูปแบบโครงสร้างข้อมูล (morph ระหว่างโครงสร้าง)
     --------------------------------------------------------- */
  function demoStructures() {
    const root = $('#demo-structures'); if (!root) return;
    const VALS = [12, 7, 25, 3, 18, 9];
    const W = 640, H = 300;
    const R = 25; // รัศมีโหนดวงกลม
    const box = (x, y, w = 60, h = 46) => ({ x, y, w, h, rx: 8 });
    const circ = (x, y) => ({ x, y, w: R * 2, h: R * 2, rx: R });
    const L = [
      { key: 'array', name: 'Array', th: 'อาร์เรย์', kind: 'lin',
        pos: VALS.map((_, i) => box(95 + i * 90, 140, 70, 52)),
        edges: [], labels: VALS.map((_, i) => ({ x: 95 + i * 90, y: 190, t: `[${i}]` })).concat([{ x: 320, y: 86, t: 'ช่องเรียงติดกันในหน่วยความจำ', m: true }]),
        rel: 'หนึ่งต่อหนึ่ง: แต่ละตัวมีตัวก่อนหน้าและตัวถัดไป', access: 'เข้าถึงตรงด้วยดัชนี A[i] ทันที', use: 'รายชื่อนักเรียนตามเลขที่, คะแนนรายวัน',
        caption: '<b>อาร์เรย์ (Array)</b> เก็บข้อมูลชนิดเดียวกันเรียงติดกัน แต่ละช่องมี<b>ดัชนี</b> เริ่มที่ 0 จึงหยิบช่องใดก็ได้ทันที (เชิงเส้น)' },
      { key: 'list', name: 'Linked List', th: 'ลิงค์ลิสต์', kind: 'lin',
        pos: VALS.map((_, i) => box(52 + i * 94, 150, 56, 46)),
        edges: VALS.slice(1).map((_, i) => [i, i + 1, true]),
        labels: [{ x: 52, y: 106, t: 'head' }, { x: 632, y: 154, t: 'null', m: true }],
        rel: 'หนึ่งต่อหนึ่ง: แต่ละโหนดชี้ไปยังโหนดถัดไป', access: 'ต้องเดินตามลูกศรจาก head ทีละโหนด', use: 'เพลย์ลิสต์ที่เพิ่ม/ลบเพลงบ่อย',
        caption: '<b>ลิงค์ลิสต์ (Linked List)</b> แต่ละโหนดเก็บค่าและ<b>ตัวชี้</b>ไปโหนดถัดไป ไม่ต้องอยู่ติดกันในหน่วยความจำ แทรก/ลบง่าย (เชิงเส้น)' },
      { key: 'stack', name: 'Stack', th: 'สแตก', kind: 'lin',
        pos: VALS.map((_, i) => box(320, 262 - i * 42, 84, 38)),
        edges: [], top: 5,
        labels: [{ x: 410, y: 52, t: '← top' }, { x: 160, y: 140, t: 'push / pop ทำที่ด้านบนเท่านั้น', m: true }, { x: 160, y: 160, t: 'เข้าหลัง ออกก่อน (LIFO)', m: true }],
        rel: 'หนึ่งต่อหนึ่ง เรียงซ้อนกันเป็นชั้น', access: 'เห็นและหยิบได้เฉพาะตัวบนสุด (top)', use: 'ปุ่ม Undo, ปุ่ม Back ของเบราว์เซอร์',
        caption: '<b>สแตก (Stack)</b> เหมือนจานที่ซ้อนกัน ใส่ (push) และหยิบ (pop) ได้ที่ด้านบนเท่านั้น ข้อมูลที่เข้าหลังสุดออกก่อน <b>LIFO</b> (เชิงเส้น)' },
      { key: 'queue', name: 'Queue', th: 'คิว', kind: 'lin',
        pos: VALS.map((_, i) => box(120 + i * 80, 150, 62, 48)),
        edges: [], top: 0,
        labels: [{ x: 120, y: 105, t: 'front · ออก' }, { x: 520, y: 105, t: 'rear · เข้า' }, { x: 320, y: 220, t: 'เข้าก่อน ออกก่อน (FIFO)', m: true }],
        rel: 'หนึ่งต่อหนึ่ง เรียงต่อแถว', access: 'เพิ่มที่ท้ายแถว (rear) นำออกที่หัวแถว (front)', use: 'คิวสั่งพิมพ์งาน, คิวรับบริการ',
        caption: '<b>คิว (Queue)</b> เหมือนการต่อแถวซื้อของ เข้าทางท้าย ออกทางหัว ใครมาก่อนได้ก่อน <b>FIFO</b> (เชิงเส้น)' },
      { key: 'tree', name: 'Tree', th: 'ทรี', kind: 'non',
        pos: [circ(320, 50), circ(185, 140), circ(455, 140), circ(110, 236), circ(260, 236), circ(455, 236)],
        edges: [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5]], top: 0,
        labels: [{ x: 382, y: 54, t: '← root' }, { x: 110, y: 284, t: 'leaf', m: true }, { x: 260, y: 284, t: 'leaf', m: true }, { x: 455, y: 284, t: 'leaf', m: true }],
        rel: 'หนึ่งต่อหลาย: หนึ่งโหนดแม่มีโหนดลูกได้หลายตัว', access: 'เริ่มจาก root แล้วเลือกกิ่งลงไป', use: 'โฟลเดอร์ในคอมพิวเตอร์, ผังองค์กร',
        caption: '<b>ทรี (Tree)</b> จัดข้อมูลเป็น<b>ลำดับชั้น</b> มีโหนดบนสุดคือ root แต่ละโหนดมีลูกได้หลายตัว ตัวที่ไม่มีลูกเรียกว่า leaf (ไม่เชิงเส้น)' },
      { key: 'graph', name: 'Graph', th: 'กราฟ', kind: 'non',
        pos: [circ(130, 75), circ(330, 48), circ(520, 95), circ(480, 238), circ(270, 250), circ(105, 205)],
        edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 4], [1, 3], [1, 4]],
        labels: [{ x: 600, y: 40, t: 'vertex = จุด', m: true }, { x: 600, y: 58, t: 'edge = เส้นเชื่อม', m: true }],
        rel: 'หลายต่อหลาย: จุดใดก็เชื่อมกับจุดใดก็ได้', access: 'เดินตามเส้นเชื่อม อาจมีหลายเส้นทาง', use: 'แผนที่เส้นทาง, เครือข่ายเพื่อนในโซเชียล',
        caption: '<b>กราฟ (Graph)</b> ประกอบด้วยจุด (vertex) และเส้นเชื่อม (edge) ความสัมพันธ์เป็นแบบ<b>เครือข่าย</b> หลายต่อหลาย (ไม่เชิงเส้น)' },
    ];

    const stage = stageOf(root);
    const tabs = el('div', { class: 'ds-tabs', role: 'tablist' });
    root.insertBefore(tabs, stage);
    const s = svg('svg', { class: 'ds-svg', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'ภาพโครงสร้างข้อมูล' });
    const defs = svg('defs', {}, svg('marker', { id: 'ds-ah', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, svg('path', { d: 'M0,0 L10,5 L0,10 z', class: 'ah' })));
    const gEdges = svg('g'); const gNodes = svg('g'); const gLabels = svg('g');
    s.append(defs, gEdges, gNodes, gLabels);
    const nodes = VALS.map((v) => {
      const r = svg('rect');
      const g = svg('g', { class: 'sn' }, r, svg('text', { text: v }));
      gNodes.append(g);
      return { g, r };
    });
    const info = el('div', { class: 'ds-info' });
    stage.append(el('div', { class: 'ds-wrap' }, s, info));

    const setRect = (r, p) => {
      const a = { x: -p.w / 2, y: -p.h / 2, width: p.w, height: p.h, rx: p.rx };
      for (const [k, v] of Object.entries(a)) { r.setAttribute(k, v); r.style[k] = v + 'px'; }
    };
    const clip = (p, dx, dy) => {
      const len = Math.hypot(dx, dy) || 1;
      if (p.rx >= p.w / 2 - 0.5) return [dx / len * (p.w / 2), dy / len * (p.w / 2)];
      const t = Math.min(dx ? (p.w / 2) / Math.abs(dx) : Infinity, dy ? (p.h / 2) / Math.abs(dy) : Infinity);
      return [dx * t, dy * t];
    };
    const tabBtns = L.map((l, k) => {
      const b = el('button', { type: 'button', class: 'ds-tab', role: 'tab', 'data-kind': l.kind, onclick: () => { st.pause(); st.go(k); } }, l.name);
      tabs.append(b);
      return b;
    });

    const render = (fr) => {
      const l = L[fr.k];
      tabBtns.forEach((b, k) => { b.classList.toggle('is-on', k === fr.k); b.setAttribute('aria-selected', k === fr.k); });
      nodes.forEach((n, i) => {
        const p = l.pos[i];
        n.g.style.transform = `translate(${p.x}px, ${p.y}px)`;
        n.g.setAttribute('transform', `translate(${p.x} ${p.y})`);
        setRect(n.r, p);
        n.g.classList.toggle('is-top', l.top === i);
      });
      gEdges.replaceChildren(...l.edges.map(([a, b, dir]) => {
        const A = l.pos[a], B = l.pos[b];
        const dx = B.x - A.x, dy = B.y - A.y;
        const [ax, ay] = clip(A, dx, dy); const [bx, by] = clip(B, -dx, -dy);
        return svg('line', { class: 'edge', x1: A.x + ax, y1: A.y + ay, x2: B.x + bx - (dir ? Math.sign(dx) * 2 : 0), y2: B.y + by, 'marker-end': dir ? 'url(#ds-ah)' : null });
      }));
      if (l.key === 'list') {
        const last = l.pos[l.pos.length - 1];
        gEdges.append(svg('line', { class: 'edge', x1: last.x + last.w / 2, y1: last.y, x2: 597, y2: last.y, 'marker-end': 'url(#ds-ah)' }));
        gEdges.append(svg('line', { class: 'edge', x1: 52, y1: 112, x2: 52, y2: 125, 'marker-end': 'url(#ds-ah)' }));
      }
      gLabels.replaceChildren(...l.labels.map((t) => svg('text', { class: t.m ? 'lbl-m' : 'lbl', x: t.x, y: t.y, 'text-anchor': t.x > 560 ? 'end' : 'middle', text: t.t })));
      info.replaceChildren(
        el('span', { class: 'ds-kind' + (l.kind === 'non' ? ' non' : '') }, l.kind === 'non' ? 'NON-LINEAR · ไม่เชิงเส้น' : 'LINEAR · เชิงเส้น'),
        el('h4', {}, `${l.th} (${l.name})`),
        el('dl', {}, el('dt', {}, 'ความสัมพันธ์'), el('dd', {}, l.rel), el('dt', {}, 'การเข้าถึง'), el('dd', {}, l.access), el('dt', {}, 'ตัวอย่างการใช้งาน'), el('dd', {}, l.use)));
    };
    const st = new Stepper(root, { build: () => L.map((l, k) => ({ k, caption: l.caption })), render, interval: 2600 });
  }

  /* ---------------------------------------------------------
     1.4 ADT: Stack เดียวกัน สร้างได้ 2 แบบ
     --------------------------------------------------------- */
  function demoADT() {
    const root = $('#demo-adt'); if (!root) return;
    const CAP = 8;
    let data = [12, 7];
    const log = [{ call: 'push(7)', res: 'ok' }, { call: 'push(12)', res: 'ok' }];
    log.reverse();
    const valIn = $('#adt-val', root);
    const show = $('#adt-show', root);
    const logEl = $('.adt-log', root);
    const arr = $('[data-arr]', root);
    const arrTop = $('[data-arrtop]', root);
    const ll = $('[data-ll]', root);
    const llCount = $('[data-llcount]', root);
    const covers = root.querySelectorAll('.adt-cover');
    const msg = $('.adt-msg', root);
    let lastAct = null;

    function draw() {
      logEl.replaceChildren(...log.slice(0, 12).map((x) => el('li', {}, el('span', {}, x.call), el('span', { class: 'res' + (x.err ? ' err' : '') }, '→ ' + x.res))));
      // array implementation
      arr.replaceChildren(...Array.from({ length: CAP }, (_, i) => {
        const has = i < data.length;
        const isTop = i === data.length - 1;
        const cls = 'cell' + (isTop ? ' is-cur' : has ? ' is-acc' : '') + (isTop && lastAct === 'push' ? ' anim-pop' : '');
        return el('div', { class: 'cellbox' }, el('div', { class: cls }, has ? data[i] : ''), el('span', { class: 'idx' }, `[${i}]`), el('span', { class: 'ptr' + (isTop ? ' hl' : '') }, isTop ? 'top' : ''));
      }));
      arrTop.textContent = `top = ${data.length - 1}`;
      // linked implementation (head = top)
      const parts = [el('span', { class: 'll-head' }, 'top →')];
      [...data].reverse().forEach((v, k) => {
        parts.push(el('span', { class: 'll-node' + (k === 0 ? ' is-top' : '') + (k === 0 && lastAct === 'push' ? ' anim-pop' : '') }, el('b', {}, v), el('i', {}, '•')));
        parts.push(el('span', { class: 'll-arrow' }, '→'));
      });
      parts.push(el('span', { class: 'll-null' }, 'null'));
      ll.replaceChildren(...parts);
      llCount.textContent = `${data.length} โหนด`;
    }
    function act(name) {
      lastAct = name;
      msg.className = 'adt-msg'; msg.textContent = '';
      let res, err = false;
      if (name === 'push') {
        const v = Math.floor(+valIn.value);
        if (!Number.isFinite(v)) { msg.className = 'adt-msg err'; msg.textContent = 'ใส่ตัวเลขก่อนกด push'; return; }
        if (data.length >= CAP) { res = 'Overflow'; err = true; msg.className = 'adt-msg err'; msg.textContent = `Stack Overflow: ตัวอย่างนี้จำกัด ${CAP} ช่อง เต็มแล้ว`; }
        else { data.push(v); res = 'ok'; msg.textContent = `push(${v}) เพิ่ม ${v} ไว้บนสุด ทั้งสองแบบให้ผลเหมือนกัน แต่ภายในทำงานต่างกัน`; }
        log.unshift({ call: `push(${v})`, res, err });
        valIn.value = rand(1, 99);
      } else if (name === 'pop') {
        if (!data.length) { res = 'Underflow'; err = true; msg.className = 'adt-msg err'; msg.textContent = 'Stack Underflow: สแตกว่าง ไม่มีข้อมูลให้นำออก'; }
        else { res = data.pop(); msg.textContent = `pop() นำ ${res} ออกจากด้านบน แบบอาร์เรย์ลดค่า top · แบบลิงค์ลิสต์เลื่อน top ไปโหนดถัดไป`; }
        log.unshift({ call: 'pop()', res, err });
      } else if (name === 'peek') {
        res = data.length ? data[data.length - 1] : 'Underflow'; err = !data.length;
        msg.textContent = data.length ? `peek() ดูค่าบนสุด (${res}) โดยไม่นำออก` : 'สแตกว่าง ไม่มีค่าให้ดู';
        log.unshift({ call: 'peek()', res, err });
      } else if (name === 'isEmpty') {
        res = data.length === 0 ? 'True' : 'False';
        log.unshift({ call: 'isEmpty()', res });
      } else if (name === 'size') {
        res = data.length;
        log.unshift({ call: 'size()', res });
      }
      draw();
    }
    root.querySelectorAll('[data-op]').forEach((b) => b.addEventListener('click', () => act(b.dataset.op)));
    valIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') act('push'); });
    show.addEventListener('change', () => covers.forEach((c) => { c.hidden = show.checked; }));
    covers.forEach((c) => { c.hidden = show.checked; });
    draw();
  }

  /* ---------------------------------------------------------
     1.5 อัลกอริทึมหาค่าสูงสุด: array + รหัสเทียม + ผังงาน
     --------------------------------------------------------- */
  function demoFindMax() {
    const root = $('#demo-findmax'); if (!root) return;
    let A = [23, 41, 15, 58, 37, 62, 29];
    const stage = stageOf(root);

    // --- code panels ---
    const PSEUDO = ['เริ่มต้น', 'max ← A[0]', 'i ← 1', 'ขณะที่ i < n ทำ', '    ถ้า A[i] > max แล้ว', '        max ← A[i]', '    i ← i + 1', 'แสดงผล max', 'จบ'];
    const PY = [
      '<span class="k">def</span> find_max(A):',
      '    max_val = A[0]',
      '    i = 1',
      '    <span class="k">while</span> i &lt; len(A):',
      '        <span class="k">if</span> A[i] &gt; max_val:',
      '            max_val = A[i]',
      '        i = i + 1',
      '    <span class="k">return</span> max_val',
    ];
    const PY_OF = [1, 2, 3, 4, 5, 6, 7, 8, 8]; // บรรทัดรหัสเทียม → บรรทัด Python
    const code = el('div', { class: 'codebox' });
    const tabP = el('button', { type: 'button', class: 'codetab is-on' }, 'รหัสเทียม');
    const tabY = el('button', { type: 'button', class: 'codetab' }, 'Python');
    let mode = 'pseudo';
    let lines = [];
    function drawCode() {
      const src = mode === 'pseudo' ? PSEUDO : PY;
      code.replaceChildren();
      lines = src.map((t, k) => { const l = el('span', { class: 'ln', 'data-n': k + 1, html: mode === 'pseudo' ? t.replace(/</g, '&lt;') : t }); code.append(l); return l; });
    }
    tabP.onclick = () => { mode = 'pseudo'; tabP.classList.add('is-on'); tabY.classList.remove('is-on'); drawCode(); st.go(st.i); };
    tabY.onclick = () => { mode = 'py'; tabY.classList.add('is-on'); tabP.classList.remove('is-on'); drawCode(); st.go(st.i); };
    drawCode();

    // --- array + vars ---
    const cellsWrap = el('div', { class: 'cells' });
    const vN = el('div', { class: 'var' }, el('small', {}, 'n'), el('b'));
    const vI = el('div', { class: 'var' }, el('small', {}, 'i'), el('b'));
    const vMax = el('div', { class: 'var' }, el('small', {}, 'max'), el('b'));
    const vAi = el('div', { class: 'var' }, el('small', {}, 'A[i]'), el('b'));
    const vCond = el('div', { class: 'var' }, el('small', {}, 'เงื่อนไข'), el('b'));
    const vCmp = el('div', { class: 'var' }, el('small', {}, 'เปรียบเทียบ'), el('b'));

    // --- flowchart ---
    const fc = svg('svg', { class: 'fc', viewBox: '0 0 470 512', role: 'img', 'aria-label': 'ผังงานการหาค่าสูงสุด' });
    fc.append(svg('defs', {},
      svg('marker', { id: 'fc-ah', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }, svg('path', { d: 'M0,0 L10,5 L0,10 z', class: 'ah' })),
      svg('marker', { id: 'fc-ah-on', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto-start-reverse' }, svg('path', { d: 'M0,0 L10,5 L0,10 z', class: 'ah-on' }))));
    const X = 230;
    const N = {
      start: { x: X, y: 30, t: 'เริ่มต้น', shape: 'oval' },
      initMax: { x: X, y: 88, t: 'max ← A[0]', shape: 'rect' },
      initI: { x: X, y: 146, t: 'i ← 1', shape: 'rect' },
      loop: { x: X, y: 215, t: 'i < n ?', shape: 'dia' },
      if: { x: X, y: 300, t: 'A[i] > max ?', shape: 'dia' },
      assign: { x: X, y: 375, t: 'max ← A[i]', shape: 'rect' },
      inc: { x: X, y: 445, t: 'i ← i + 1', shape: 'rect' },
      output: { x: 400, y: 215, t: 'แสดง max', shape: 'para' },
      end: { x: 400, y: 290, t: 'จบ', shape: 'oval' },
    };
    const E = [
      ['start', 'initMax', [[X, 48], [X, 68]]],
      ['initMax', 'initI', [[X, 108], [X, 126]]],
      ['initI', 'loop', [[X, 166], [X, 185]]],
      ['loop', 'if', [[X, 245], [X, 270]], 'ใช่', [X + 8, 262]],
      ['loop', 'output', [[305, 215], [342, 215]], 'ไม่', [312, 207]],
      ['output', 'end', [[400, 235], [400, 272]]],
      ['if', 'assign', [[X, 330], [X, 355]], 'ใช่', [X + 8, 347]],
      ['if', 'inc', [[155, 300], [95, 300], [95, 445], [158, 445]], 'ไม่', [112, 292]],
      ['assign', 'inc', [[X, 395], [X, 425]]],
      ['inc', 'loop', [[X, 465], [X, 492], [30, 492], [30, 176], [X - 4, 176]]],
    ];
    const edgeEls = {};
    E.forEach(([a, b, pts, yn, lp]) => {
      const p = svg('polyline', { class: 'ed', points: pts.map((q) => q.join(',')).join(' '), 'marker-end': 'url(#fc-ah)' });
      fc.append(p);
      edgeEls[a + '>' + b] = p;
      if (yn) fc.append(svg('text', { class: 'yn', x: lp[0], y: lp[1] }, yn));
    });
    const nodeEls = {};
    for (const [k, n] of Object.entries(N)) {
      let sh;
      if (n.shape === 'oval') sh = svg('rect', { class: 'sh', x: n.x - 55, y: n.y - 18, width: 110, height: 36, rx: 18 });
      else if (n.shape === 'rect') sh = svg('rect', { class: 'sh', x: n.x - 70, y: n.y - 20, width: 140, height: 40, rx: 4 });
      else if (n.shape === 'dia') sh = svg('polygon', { class: 'sh', points: `${n.x},${n.y - 30} ${n.x + 75},${n.y} ${n.x},${n.y + 30} ${n.x - 75},${n.y}` });
      else sh = svg('polygon', { class: 'sh', points: `${n.x - 46},${n.y - 20} ${n.x + 58},${n.y - 20} ${n.x + 46},${n.y + 20} ${n.x - 58},${n.y + 20}` });
      const g = svg('g', { class: 'nd' }, sh, svg('text', { x: n.x, y: n.y }, n.t));
      fc.append(g);
      nodeEls[k] = g;
    }

    stage.append(el('div', { class: 'trace' },
      el('div', { class: 'trace-l' },
        el('div', {}, el('div', { class: 'memhead' }, el('span', {}, 'ข้อมูลเข้า: อาร์เรย์ A')), cellsWrap),
        el('div', { class: 'vars' }, vN, vI, vMax, vAi, vCond, vCmp),
        el('div', {}, el('div', { class: 'codetabs' }, tabP, tabY), code)),
      el('div', { class: 'trace-r' }, el('div', { class: 'memhead' }, el('span', {}, 'ผังงาน (Flowchart)'), el('span', {}, 'สีเหลือง = ขั้นที่กำลังทำ')), fc)));

    const LINE = { start: 1, initMax: 2, initI: 3, loop: 4, if: 5, assign: 6, inc: 7, output: 8, end: 9 };
    const build = () => {
      const n = A.length, f = [];
      let i = null, max = null, maxIdx = null, cmps = 0, prev = null;
      const push = (node, extra) => { f.push({ node, prev, i, max, maxIdx, cmps, ...extra }); prev = node; };
      push('start', { caption: `เริ่มต้นอัลกอริทึม รับข้อมูลเข้าเป็นอาร์เรย์ A จำนวน n = ${n} ตัว เป้าหมายคือหาค่าที่มากที่สุด` });
      max = A[0]; maxIdx = 0;
      push('initMax', { chg: 'max', caption: `สมมติให้ตัวแรกมากที่สุดไว้ก่อน → max = A[0] = <b>${max}</b>` });
      i = 1;
      push('initI', { chg: 'i', caption: 'เริ่มตรวจตัวถัดไปที่ตำแหน่ง i = 1' });
      for (;;) {
        const c = i < n;
        push('loop', { cond: c, condText: `${i} < ${n}`, caption: `ตรวจเงื่อนไขวนซ้ำ i < n → ${i} < ${n} เป็น<b>${c ? 'จริง' : 'เท็จ'}</b>${c ? ' จึงเข้าไปทำในลูป' : ' จึงออกจากลูป'}` });
        if (!c) break;
        cmps++;
        const g = A[i] > max;
        push('if', { cmp: i, cond: g, condText: `${A[i]} > ${max}`, caption: `เปรียบเทียบ A[${i}] = ${A[i]} กับ max = ${max} → ${A[i]} > ${max} เป็น<b>${g ? 'จริง' : 'เท็จ'}</b>` });
        if (g) {
          max = A[i]; maxIdx = i;
          push('assign', { chg: 'max', caption: `พบค่าที่มากกว่าเดิม อัปเดต max = <b>${max}</b>` });
        }
        i++;
        push('inc', { chg: 'i', caption: `เลื่อนไปตัวถัดไป i = ${i}` });
      }
      push('output', { done: true, caption: `แสดงผลลัพธ์: ค่าที่มากที่สุดคือ <b>${max}</b> (อยู่ที่ตำแหน่ง ${maxIdx})` });
      push('end', { done: true, caption: `จบการทำงาน ใช้การเปรียบเทียบ ${cmps} ครั้ง = n − 1 ครั้ง ไม่ว่าข้อมูลจะเรียงแบบใด` });
      return f;
    };
    const render = (fr) => {
      const n = A.length;
      cellsWrap.replaceChildren(...A.map((v, k) => {
        let cls = 'cell';
        if (fr.done && k === fr.maxIdx) cls += ' is-found';
        else if (fr.cmp === k) cls += ' is-cmp';
        else if (fr.i != null && k === fr.i && !fr.done) cls += ' is-cur';
        else if (k === fr.maxIdx) cls += ' is-acc';
        else if (fr.i != null && k < fr.i) cls += ' is-dim';
        const ptr = [];
        if (fr.i != null && k === fr.i && !fr.done) ptr.push('i');
        if (k === fr.maxIdx) ptr.push('max');
        return el('div', { class: 'cellbox' }, el('div', { class: cls }, v), el('span', { class: 'idx' }, `[${k}]`), el('span', { class: 'ptr' + (k === fr.maxIdx ? ' hl' : '') }, ptr.join('·')));
      }));
      vN.lastChild.textContent = n;
      vI.lastChild.textContent = fr.i ?? '—';
      vMax.lastChild.textContent = fr.max ?? '—';
      vAi.lastChild.textContent = fr.i != null && fr.i < n ? A[fr.i] : '—';
      vCond.lastChild.textContent = fr.cond == null ? '—' : (fr.cond ? 'จริง' : 'เท็จ');
      vCmp.lastChild.textContent = fr.cmps + ' ครั้ง';
      vI.classList.toggle('is-chg', fr.chg === 'i');
      vMax.classList.toggle('is-chg', fr.chg === 'max');
      vCond.className = 'var' + (fr.cond == null ? '' : fr.cond ? ' is-true' : ' is-false');
      const ln = mode === 'pseudo' ? LINE[fr.node] : PY_OF[LINE[fr.node] - 1];
      lines.forEach((l, k) => l.classList.toggle('on', k === ln - 1));
      Object.entries(nodeEls).forEach(([k, g]) => g.classList.toggle('on', k === fr.node));
      Object.entries(edgeEls).forEach(([k, p]) => {
        const on = k === fr.prev + '>' + fr.node;
        p.classList.toggle('on', on);
        p.setAttribute('marker-end', on ? 'url(#fc-ah-on)' : 'url(#fc-ah)');
      });
    };
    const st = new Stepper(root, { build, render, interval: 1200 });
    $('#fm-rand', root).addEventListener('click', () => {
      const n = rand(5, 8);
      A = Array.from({ length: n }, () => rand(10, 99));
      st.rebuild();
    });
    $('#fm-worst', root).addEventListener('click', () => {
      A = [12, 25, 33, 41, 56, 68, 74, 90];
      st.rebuild();
    });
  }

  /* ---------------------------------------------------------
     1.6-ก ลูปเดียว vs ลูปซ้อน
     --------------------------------------------------------- */
  function demoLoops() {
    const root = $('#demo-loops'); if (!root) return;
    const nIn = $('#loops-n', root);
    const stage = stageOf(root);
    const gA = el('div', { class: 'gridbox' });
    const gB = el('div', { class: 'gridbox' });
    const cA = el('div', { class: 'bignum' });
    const cB = el('div', { class: 'bignum' });
    const codeA = el('div', { class: 'codebox', html: '<span class="ln" data-n="1"><span class="k">for</span> i <span class="k">in</span> range(n):</span><span class="ln" data-n="2">    count += 1</span>' });
    const codeB = el('div', { class: 'codebox', html: '<span class="ln" data-n="1"><span class="k">for</span> i <span class="k">in</span> range(n):</span><span class="ln" data-n="2">    <span class="k">for</span> j <span class="k">in</span> range(n):</span><span class="ln" data-n="3">        count += 1</span>' });
    stage.append(el('div', { class: 'loops' },
      el('div', { class: 'loop-col' }, el('h4', { html: 'ลูปชั้นเดียว · <span class="o-badge cplx-2">O(n)</span>' }), codeA, cA, gA),
      el('div', { class: 'loop-col' }, el('h4', { html: 'ลูปซ้อน 2 ชั้น · <span class="o-badge cplx-5">O(n²)</span>' }), codeB, cB, gB)));
    let n, aCells, bCells;
    const build = () => {
      n = Math.max(2, Math.min(12, Math.floor(+nIn.value || 6)));
      nIn.value = n;
      gA.style.gridTemplateColumns = `repeat(${n}, minmax(0, 1fr))`;
      gB.style.gridTemplateColumns = `repeat(${n}, minmax(0, 1fr))`;
      aCells = Array.from({ length: n }, () => el('div', { class: 'gcell lin' }));
      bCells = Array.from({ length: n * n }, () => el('div', { class: 'gcell' }));
      gA.replaceChildren(...aCells); gB.replaceChildren(...bCells);
      const f = [{ k: 0, caption: `ให้ n = ${n} ทุกครั้งที่คำสั่ง <code>count += 1</code> ทำงาน จะระบายสี 1 ช่อง มาดูว่าแต่ละโค้ดทำงานกี่ครั้ง` }];
      for (let k = 1; k <= n * n; k++) {
        let cap;
        if (k < n) cap = `ทั้งสองโค้ดทำงานไปแล้ว ${k} ครั้ง`;
        else if (k === n) cap = `ลูปชั้นเดียว<b>จบแล้ว</b>ที่ ${n} ครั้ง แต่ลูปซ้อนเพิ่งจบแถวแรก (i = 0) เท่านั้น`;
        else if (k % n === 0) cap = `ลูปซ้อนจบแถว i = ${k / n - 1} รวม ${k} ครั้ง ลูปในต้องวน n รอบ <b>ทุกครั้ง</b>ที่ลูปนอกวน 1 รอบ`;
        else cap = `ลูปซ้อน i = ${Math.floor((k - 1) / n)}, j = ${(k - 1) % n} → ทำงานครั้งที่ ${k}`;
        f.push({ k, caption: cap });
      }
      f.push({ k: n * n, end: true, caption: `สรุป n = ${n}: ลูปเดียวทำ <b>${n}</b> ครั้ง ลูปซ้อนทำ <b>${n * n}</b> ครั้ง ถ้า n = 1,000 จะเป็น 1,000 กับ 1,000,000 ครั้ง ต่างกัน 1,000 เท่า` });
      return f;
    };
    const render = (fr) => {
      const ka = Math.min(fr.k, n);
      aCells.forEach((c, j) => { c.className = 'gcell lin' + (j < ka ? ' on' : '') + (!fr.end && j === ka - 1 && fr.k <= n ? ' now' : ''); });
      bCells.forEach((c, j) => { c.className = 'gcell' + (j < fr.k ? ' on' : '') + (!fr.end && j === fr.k - 1 ? ' now' : ''); });
      cA.innerHTML = `${ka}<small>ครั้ง${ka === n ? ' · จบแล้ว' : ''}</small>`;
      cB.innerHTML = `${fr.k}<small>ครั้ง${fr.k === n * n ? ' · จบแล้ว' : ''}</small>`;
      codeA.querySelectorAll('.ln').forEach((l, j) => l.classList.toggle('on', !fr.end && fr.k > 0 && fr.k <= n && j === 1));
      codeB.querySelectorAll('.ln').forEach((l, j) => l.classList.toggle('on', !fr.end && fr.k > 0 && j === 2));
    };
    const st = new Stepper(root, { build, render, interval: 420 });
    nIn.addEventListener('change', () => st.rebuild());
  }

  /* ---------------------------------------------------------
     1.6-ข Linear Search vs Binary Search
     --------------------------------------------------------- */
  function demoRace() {
    const root = $('#demo-race'); if (!root) return;
    const nSel = $('#race-n', root);
    const tIn = $('#race-t', root);
    const stage = stageOf(root);
    const race = el('div', { class: 'race' });
    const rowL = el('div', { class: 'cells' });
    const rowB = el('div', { class: 'cells' });
    const cntL = el('span', { class: 'counter' });
    const cntB = el('span', { class: 'counter' });
    race.append(
      el('div', { class: 'race-row' }, el('div', { class: 'race-h' }, el('h4', { html: 'ค้นหาแบบลำดับ <small>Linear Search · O(n)</small>' }), cntL), rowL),
      el('div', { class: 'race-row' }, el('div', { class: 'race-h' }, el('h4', { html: 'ค้นหาแบบทวิภาค <small>Binary Search · O(log n)</small>' }), cntB), rowB));
    stage.append(race);
    let A = [];
    function makeArray(n) {
      A = []; let v = rand(1, 4);
      for (let k = 0; k < n; k++) { A.push(v); v += rand(1, 4); }
    }
    makeArray(+nSel.value);
    tIn.value = A[Math.floor(A.length * 0.78)];
    let cellsL = [], cellsB = [];
    const build = () => {
      const n = A.length, t = Math.floor(+tIn.value);
      race.classList.toggle('n64', n > 40);
      cellsL = A.map((v) => el('div', { class: 'cell' }, v));
      cellsB = A.map((v) => el('div', { class: 'cell' }, v));
      rowL.replaceChildren(...cellsL); rowB.replaceChildren(...cellsB);
      // linear steps
      const LS = []; let foundL = -1;
      for (let k = 0; k < n; k++) { LS.push(k); if (A[k] === t) { foundL = k; break; } }
      // binary steps
      const BS = []; let lo = 0, hi = n - 1, foundB = -1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        BS.push({ lo, hi, mid, v: A[mid] });
        if (A[mid] === t) { foundB = mid; break; }
        if (A[mid] < t) lo = mid + 1; else hi = mid - 1;
      }
      const total = Math.max(LS.length, BS.length);
      const f = [{ k: 0, caption: `ข้อมูล ${n} ตัว <b>เรียงจากน้อยไปมากแล้ว</b> ต้องการค้นหา <b>${t}</b> ทั้งสองวิธีจะเปรียบเทียบพร้อมกันทีละครั้ง` }];
      for (let k = 1; k <= total; k++) {
        const parts = [];
        if (k <= LS.length) {
          const idx = LS[k - 1];
          parts.push(`Linear: ตรวจ A[${idx}] = ${A[idx]}${A[idx] === t ? ' <b>พบแล้ว!</b>' : ' ไม่ใช่ ไปตัวถัดไป'}`);
        } else parts.push(`Linear: ${foundL >= 0 ? 'จบแล้ว' : 'ไม่พบ'} (${LS.length} ครั้ง)`);
        if (k <= BS.length) {
          const b = BS[k - 1];
          parts.push(`Binary: ดูตัวกลาง A[${b.mid}] = ${b.v}${b.v === t ? ' <b>พบแล้ว!</b>' : b.v < t ? ` น้อยกว่า ${t} → ตัดครึ่งซ้ายทิ้ง` : ` มากกว่า ${t} → ตัดครึ่งขวาทิ้ง`}`);
        } else parts.push(`Binary: ${foundB >= 0 ? 'จบแล้ว' : 'ไม่พบ'} (${BS.length} ครั้ง)`);
        f.push({ k, caption: parts.join('<br>') });
      }
      f.push({ k: total, end: true, caption: `สรุป: Linear ใช้ <b>${LS.length}</b> ครั้ง · Binary ใช้ <b>${BS.length}</b> ครั้ง (ไม่เกิน ⌊log₂ ${n}⌋ + 1 = ${Math.floor(Math.log2(n)) + 1} ครั้งเสมอ) ${foundL < 0 ? '· ค่านี้ไม่มีในข้อมูล' : ''}` });
      build.LS = LS; build.BS = BS; build.foundL = foundL; build.foundB = foundB; build.t = t;
      return f;
    };
    const render = (fr) => {
      const { LS, BS, foundL, foundB } = build;
      const kl = Math.min(fr.k, LS.length);
      cellsL.forEach((c, j) => {
        let cls = 'cell';
        if (kl > 0) {
          const cur = LS[kl - 1];
          if (j === cur) cls += (j === foundL ? ' is-found' : ' is-cur');
          else if (j < cur) cls += ' is-dim';
        }
        if (kl === LS.length && foundL < 0 && kl > 0) cls = 'cell is-dim';
        c.className = cls;
      });
      const kb = Math.min(fr.k, BS.length);
      cellsB.forEach((c, j) => {
        let cls = 'cell';
        if (kb > 0) {
          const b = BS[kb - 1];
          if (j === b.mid) cls += (j === foundB ? ' is-found' : ' is-cur');
          else if (j < b.lo || j > b.hi) cls += ' is-dim';
          else cls += ' is-acc';
        }
        if (kb === BS.length && foundB < 0 && kb > 0) cls = 'cell is-dim';
        c.className = cls;
      });
      cntL.textContent = `เปรียบเทียบ ${kl} ครั้ง`;
      cntB.textContent = `เปรียบเทียบ ${kb} ครั้ง`;
      cntL.classList.toggle('done', kl === LS.length && fr.k > 0);
      cntB.classList.toggle('done', kb === BS.length && fr.k > 0);
    };
    const st = new Stepper(root, { build, render, interval: 900 });
    nSel.addEventListener('change', () => { makeArray(+nSel.value); tIn.value = A[Math.floor(A.length * 0.78)]; st.rebuild(); });
    tIn.addEventListener('change', () => st.rebuild());
    $('#race-rand', root).addEventListener('click', () => { tIn.value = A[rand(0, A.length - 1)]; st.rebuild(); });
    $('#race-miss', root).addEventListener('click', () => { tIn.value = A[A.length - 1] + 1; st.rebuild(); });
  }

  /* ---------------------------------------------------------
     1.6-ค กราฟอัตราการเติบโต + ตารางเวลา
     --------------------------------------------------------- */
  const FN = [
    { id: 'o1', name: 'O(1)', th: 'คงที่', f: () => 1, c: 1 },
    { id: 'olog', name: 'O(log n)', th: 'ลอการิทึม', f: (n) => Math.log2(n), c: 2 },
    { id: 'on', name: 'O(n)', th: 'เชิงเส้น', f: (n) => n, c: 3 },
    { id: 'onlog', name: 'O(n log n)', th: 'เชิงเส้นลอการิทึม', f: (n) => n * Math.log2(n), c: 4 },
    { id: 'on2', name: 'O(n²)', th: 'กำลังสอง', f: (n) => n * n, c: 5 },
    { id: 'o2n', name: 'O(2ⁿ)', th: 'เอกซ์โพเนนเชียล', f: (n) => 2 ** n, c: 6 },
  ];
  function demoGrowth() {
    const root = $('#demo-growth'); if (!root) return;
    const W = 560, H = 340, PL = 46, PR = 16, PT = 16, PB = 40;
    const XMAX = 20, YMAX = 120;
    const sx = (n) => PL + (n / XMAX) * (W - PL - PR);
    const sy = (v) => PT + (1 - Math.min(v, YMAX * 1.2) / YMAX) * (H - PT - PB);
    const chart = svg('svg', { class: 'gchart', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'กราฟเปรียบเทียบจำนวนขั้นตอนของแต่ละ Big-O' });
    chart.append(svg('defs', {}, svg('clipPath', { id: 'g-clip' }, svg('rect', { x: PL, y: PT, width: W - PL - PR, height: H - PT - PB }))));
    for (let v = 0; v <= YMAX; v += 20) {
      chart.append(svg('line', { class: 'gl', x1: PL, x2: W - PR, y1: sy(v), y2: sy(v) }));
      chart.append(svg('text', { class: 'tk', x: PL - 8, y: sy(v) + 4, 'text-anchor': 'end' }, v));
    }
    for (let n = 0; n <= XMAX; n += 5) chart.append(svg('text', { class: 'tk', x: sx(n), y: H - PB + 18, 'text-anchor': 'middle' }, n));
    chart.append(svg('line', { class: 'ax', x1: PL, x2: W - PR, y1: H - PB, y2: H - PB }), svg('line', { class: 'ax', x1: PL, x2: PL, y1: PT, y2: H - PB }));
    chart.append(svg('text', { class: 'axl', x: W - PR, y: H - 4, 'text-anchor': 'end' }, 'ขนาดข้อมูล n →'));
    chart.append(svg('text', { class: 'axl', x: 6, y: PT + 4, transform: `rotate(-90 6 ${PT + 4})`, 'text-anchor': 'end', dy: '0.8em' }, 'จำนวนขั้นตอน →'));
    const gC = svg('g', { 'clip-path': 'url(#g-clip)' });
    chart.append(gC);
    const paths = FN.map((fn) => {
      let d = '';
      for (let n = 1; n <= XMAX; n += 0.25) d += (d ? 'L' : 'M') + sx(n).toFixed(1) + ',' + sy(fn.f(n)).toFixed(1);
      const p = svg('path', { class: 'cv', d, style: `stroke: var(--c${fn.c})` });
      gC.append(p);
      return p;
    });
    const mk = svg('line', { class: 'mk', y1: PT, y2: H - PB });
    const mkL = svg('text', { class: 'mklabel', y: PT + 12 });
    chart.append(mk, mkL);
    const dots = FN.map((fn) => { const c = svg('circle', { class: 'dot', r: 5, style: `fill: var(--c${fn.c})` }); chart.append(c); return c; });

    const legend = $('.glegend', root);
    const vals = FN.map((fn, k) => {
      const cb = el('input', { type: 'checkbox', checked: true, id: 'g-' + fn.id });
      const v = el('span', { class: 'v' });
      cb.addEventListener('change', () => { paths[k].style.display = cb.checked ? '' : 'none'; dots[k].style.display = cb.checked ? '' : 'none'; });
      legend.append(el('label', { for: 'g-' + fn.id }, cb, el('span', { class: 'sw', style: { background: `var(--c${fn.c})` } }), el('span', {}, el('span', { class: 'nm' }, fn.name), ' ', el('span', { class: 'small muted' }, fn.th)), v));
      return v;
    });
    const slider = $('#g-n', root);
    const nOut = $('#g-nout', root);
    function setN() {
      const n = +slider.value;
      nOut.textContent = n;
      mk.setAttribute('x1', sx(n)); mk.setAttribute('x2', sx(n));
      mkL.setAttribute('x', sx(n) + 6); mkL.textContent = 'n = ' + n;
      mkL.setAttribute('text-anchor', n > 16 ? 'end' : 'start');
      if (n > 16) mkL.setAttribute('x', sx(n) - 6);
      FN.forEach((fn, k) => {
        const v = fn.f(n);
        vals[k].textContent = Number.isInteger(v) ? v.toLocaleString('th-TH') : v.toFixed(1);
        dots[k].setAttribute('cx', sx(n));
        dots[k].setAttribute('cy', sy(v));
        dots[k].style.visibility = v > YMAX ? 'hidden' : 'visible';
      });
    }
    slider.addEventListener('input', setN);
    setN();
    $('[data-chart]', root).append(chart);
    $('#g-draw', root).addEventListener('click', () => {
      paths.forEach((p) => { const len = p.getTotalLength(); p.style.setProperty('--len', len); p.style.strokeDasharray = len; });
      chart.classList.remove('drawing'); void chart.getBoundingClientRect(); chart.classList.add('drawing');
      let n = 1; slider.value = 1; setN();
      const t = setInterval(() => { n++; slider.value = n; setN(); if (n >= XMAX) clearInterval(t); }, 80);
    });

    /* ตารางจำนวนขั้นตอน + เวลา (สมมติ 1 ล้านขั้นตอน/วินาที) */
    const tbody = $('#growth-body');
    const NS = [10, 100, 1000, 1000000];
    const fmtCount = (log10) => {
      if (log10 < 15) return Math.round(10 ** log10).toLocaleString('th-TH');
      const e = Math.floor(log10); const m = 10 ** (log10 - e);
      return `${m.toFixed(1)} × 10<sup>${e}</sup>`;
    };
    const fmtTime = (log10ops) => {
      const sec = log10ops - 6; // ops / 1e6
      if (sec > 17.64) return 'นานกว่าอายุจักรวาล';
      const s = 10 ** sec;
      if (s < 1e-3) return (s * 1e6).toFixed(s * 1e6 < 10 ? 1 : 0) + ' ไมโครวินาที';
      if (s < 1) return (s * 1e3).toFixed(1) + ' มิลลิวินาที';
      if (s < 60) return s.toFixed(1) + ' วินาที';
      if (s < 3600) return (s / 60).toFixed(1) + ' นาที';
      if (s < 86400) return (s / 3600).toFixed(1) + ' ชั่วโมง';
      if (s < 86400 * 365) return (s / 86400).toFixed(1) + ' วัน';
      const y = s / (86400 * 365);
      return (y < 1e6 ? Math.round(y).toLocaleString('th-TH') : fmtCount(Math.log10(y))) + ' ปี';
    };
    const L10 = {
      o1: () => 0, olog: (n) => Math.log10(Math.log2(n)), on: (n) => Math.log10(n),
      onlog: (n) => Math.log10(n * Math.log2(n)), on2: (n) => 2 * Math.log10(n), o2n: (n) => n * Math.log10(2),
    };
    FN.forEach((fn) => {
      tbody.append(el('tr', {},
        el('td', {}, el('span', { class: 'o-badge cplx-' + fn.c }, fn.name)),
        NS.map((n) => {
          const lg = L10[fn.id](n);
          return el('td', { class: 'num', html: `${fmtCount(lg)}<span class="ttime">${fmtTime(lg)}</span>` });
        })));
    });
  }

  /* ---------------------------------------------------------
     แบบทดสอบท้ายหน่วย
     --------------------------------------------------------- */
  const QUIZ = [
    { q: 'ข้อใดเป็น <b>สารสนเทศ</b>', options: ['คะแนนสอบ 65, 82, 47, 90, 73', 'คะแนนเฉลี่ยของห้องคือ 71.4 คะแนน', 'ชื่อนักเรียน 40 คน', 'ตัวเลข 01000001'], answer: 1,
      explain: 'สารสนเทศคือข้อมูลที่ผ่านการประมวลผลแล้ว (ในที่นี้คือการหาค่าเฉลี่ย) ข้ออื่นเป็นข้อมูลดิบ' },
    { q: 'ลำดับชั้นของข้อมูลจาก <b>เล็กไปใหญ่</b> ข้อใดถูกต้อง', options: ['บิต → ไบต์ → ฟิลด์ → เรคคอร์ด → ไฟล์ → ฐานข้อมูล', 'ไบต์ → บิต → ฟิลด์ → ไฟล์ → เรคคอร์ด → ฐานข้อมูล', 'บิต → ไบต์ → เรคคอร์ด → ฟิลด์ → ไฟล์ → ฐานข้อมูล', 'ฟิลด์ → บิต → ไบต์ → เรคคอร์ด → ไฟล์ → ฐานข้อมูล'], answer: 0,
      explain: '8 บิตเป็น 1 ไบต์ หลายไบต์เป็นฟิลด์ หลายฟิลด์เป็นเรคคอร์ด หลายเรคคอร์ดเป็นไฟล์ หลายไฟล์ที่สัมพันธ์กันเป็นฐานข้อมูล' },
    { q: 'ตัวแปรชนิด <code>int</code> ขนาด 4 ไบต์ ใช้พื้นที่กี่บิต', options: ['4 บิต', '8 บิต', '16 บิต', '32 บิต'], answer: 3,
      explain: '1 ไบต์ = 8 บิต ดังนั้น 4 ไบต์ = 4 × 8 = 32 บิต' },
    { q: 'เลข 13 ฐานสิบ เขียนเป็นเลขฐานสองได้อย่างไร', options: ['1011', '1101', '1110', '0111'], answer: 1,
      explain: '13÷2=6 เศษ 1, 6÷2=3 เศษ 0, 3÷2=1 เศษ 1, 1÷2=0 เศษ 1 อ่านจากล่างขึ้นบนได้ 1101 (8+4+1 = 13)' },
    { q: 'ข้อใดเป็นโครงสร้างข้อมูลแบบ <b>ไม่เชิงเส้น (Non-linear)</b>', options: ['Array', 'Stack', 'Tree', 'Queue'], answer: 2,
      explain: 'Tree จัดข้อมูลเป็นลำดับชั้น หนึ่งโหนดมีลูกได้หลายตัว ส่วน Array, Stack, Queue เป็นเชิงเส้น' },
    { q: 'ปุ่ม Undo ในโปรแกรมพิมพ์เอกสาร เหมาะกับโครงสร้างข้อมูลใดที่สุด', options: ['Queue เพราะเข้าก่อนออกก่อน', 'Stack เพราะการกระทำล่าสุดต้องถูกยกเลิกก่อน', 'Graph เพราะมีหลายเส้นทาง', 'Array เพราะเข้าถึงด้วยดัชนี'], answer: 1,
      explain: 'Undo ยกเลิกการกระทำล่าสุดก่อน ตรงกับหลัก LIFO (เข้าหลัง ออกก่อน) ของสแตก' },
    { q: '<b>ข้อมูลแบบนามธรรม (ADT)</b> หมายถึงข้อใด', options: ['ข้อมูลที่มองไม่เห็นในหน่วยความจำ', 'การนิยามข้อมูลและการดำเนินการ โดยไม่ระบุวิธีสร้างภายใน', 'ชนิดข้อมูลพื้นฐาน เช่น int และ float', 'โค้ดที่เขียนด้วยภาษาไพทอนเท่านั้น'], answer: 1,
      explain: 'ADT บอกว่าข้อมูลทำอะไรได้บ้าง (เช่น push, pop) แต่ไม่บังคับว่าภายในต้องใช้อาร์เรย์หรือลิงค์ลิสต์' },
    { q: 'คุณสมบัติของอัลกอริทึมที่ว่า "ต้องจบการทำงานได้ภายในจำนวนขั้นตอนที่จำกัด" คือข้อใด', options: ['Definiteness', 'Effectiveness', 'Finiteness', 'Input'], answer: 2,
      explain: 'Finiteness (ความจำกัด) อัลกอริทึมต้องหยุดทำงานได้เสมอ ไม่วนซ้ำไม่รู้จบ' },
    { q: 'สัญลักษณ์ผังงาน <b>รูปข้าวหลามตัด</b> ใช้แทนสิ่งใด', options: ['จุดเริ่มต้น/สิ้นสุด', 'การประมวลผล', 'การรับ/แสดงผลข้อมูล', 'การตัดสินใจ (เงื่อนไข)'], answer: 3,
      explain: 'ข้าวหลามตัดใช้ตรวจเงื่อนไขและแยกทางเดินเป็น "ใช่" กับ "ไม่"' },
    { q: 'อัลกอริทึมหาค่าสูงสุดในอาร์เรย์ n ตัว ต้องเปรียบเทียบกี่ครั้ง', options: ['1 ครั้ง', 'n − 1 ครั้ง', 'n² ครั้ง', 'log₂ n ครั้ง'], answer: 1,
      explain: 'ให้ตัวแรกเป็น max แล้วเปรียบเทียบกับตัวที่เหลืออีก n − 1 ตัว ตัวละ 1 ครั้ง' },
    { q: 'Big-O ของ <code>3n² + 5n + 2</code> คือข้อใด', options: ['O(3n²)', 'O(n)', 'O(n²)', 'O(n² + n)'], answer: 2,
      explain: 'ตัดค่าคงที่ทิ้งและเก็บเฉพาะพจน์ที่โตเร็วที่สุด เหลือ O(n²)' },
    { q: 'ข้อมูล 1,024 ตัวที่เรียงแล้ว ใช้ Binary Search เปรียบเทียบ <b>มากที่สุด</b> กี่ครั้ง', options: ['10 ครั้ง', '11 ครั้ง', '512 ครั้ง', '1,024 ครั้ง'], answer: 1,
      explain: '⌊log₂ 1024⌋ + 1 = 10 + 1 = 11 ครั้ง ทุกครั้งตัดข้อมูลทิ้งครึ่งหนึ่ง: 1024 → 512 → … → 1 ตัว' },
  ];

  function init() {
    demoDataInfo();
    demoHierarchy();
    demoMemory();
    demoBinary();
    demoStructures();
    demoADT();
    demoFindMax();
    demoLoops();
    demoRace();
    demoGrowth();
    DSA.quiz('#quiz-u1', QUIZ);
    DSA.initLessonNav(document.querySelector('#unit-1 .lessonnav-in'));
  }
  init();
})();

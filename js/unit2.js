/* =========================================================
   หน่วยที่ 2 อาร์เรย์และเรคคอร์ด — แอนิเมชันและแบบทดสอบ
   รูปแบบเดียวกับหน่วยที่ 1: build() สร้างเฟรม, render(frame) วาด
   ========================================================= */
'use strict';

(() => {
  const { el, Stepper } = DSA;
  const $ = (s, r = document) => r.querySelector(s);
  const stageOf = (root) => root.querySelector('[data-stage]');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* แสดงสูตรทีละบรรทัด: lines = [html, ...], upto = จำนวนบรรทัดที่เห็น */
  function formulaBox() {
    const box = el('div', { class: 'formula', 'aria-live': 'off' });
    return {
      box,
      show(lines, upto) {
        box.replaceChildren(...lines.map((t, k) => el('div', {
          class: 'fl' + (k < upto ? '' : ' is-hidden') + (k === upto - 1 ? ' on' : ''), html: t,
        })));
      },
    };
  }

  /* ---------------------------------------------------------
     2.1 อาร์เรย์แบบขยายได้ (Dynamic Array) — วิธีที่ list ของ Python ทำงาน
     --------------------------------------------------------- */
  function demoDynamic() {
    const root = $('#demo-dynamic'); if (!root) return;
    const SEQ = [8, 3, 6, 1, 9];
    const stage = stageOf(root);
    const rowCur = el('div', { class: 'cells' });
    const rowNew = el('div', { class: 'cells' });
    const newWrap = el('div', { class: 'dyn-row' }, el('div', { class: 'dyn-label' }, el('b', {}, 'อาร์เรย์ใหม่'), el('span', { 'data-newcap': '' })), rowNew);
    const stats = el('div', { class: 'vars' });
    const sSize = el('div', { class: 'var' }, el('small', {}, 'size (ใช้จริง)'), el('b'));
    const sCap = el('div', { class: 'var' }, el('small', {}, 'capacity (ความจุ)'), el('b'));
    const sCopy = el('div', { class: 'var' }, el('small', {}, 'คัดลอกไปแล้ว'), el('b'));
    const sOps = el('div', { class: 'var' }, el('small', {}, 'ขั้นตอนทั้งหมด'), el('b'));
    stats.append(sSize, sCap, sCopy, sOps);
    stage.append(el('div', { class: 'dyn' },
      el('div', { class: 'memhead' }, el('span', {}, 'คำสั่ง: ' + SEQ.map((v) => `append(${v})`).join(' → ')), el('span', {}, 'ช่องเส้นประ = ช่องว่างสำรอง')),
      el('div', { class: 'dyn-row' }, el('div', { class: 'dyn-label' }, el('b', {}, 'อาร์เรย์ที่ใช้งาน'), el('span', { 'data-curcap': '' })), rowCur),
      newWrap, stats));

    const build = () => {
      const f = [];
      let cur = [], cap = 2, copies = 0, ops = 0;
      const push = (o) => f.push({ cur: cur.slice(), cap, copies, ops, next: null, nextCap: 0, ...o });
      push({ caption: 'list ของ Python และ ArrayList ของ Java สร้างจาก<b>อาร์เรย์</b>ที่มีความจุคงที่ เริ่มต้นจองไว้ 2 ช่อง ยังว่างทั้งหมด' });
      for (const v of SEQ) {
        if (cur.length === cap) {
          const nextCap = cap * 2;
          const next = [];
          push({ next: [], nextCap, full: true, caption: `จะ append(${v}) แต่อาร์เรย์<b>เต็ม</b>แล้ว (size = capacity = ${cap}) ต้องจองอาร์เรย์ใหม่ที่ใหญ่ขึ้น <b>2 เท่า</b> = ${nextCap} ช่อง` });
          for (let k = 0; k < cur.length; k++) {
            next.push(cur[k]); copies++; ops++;
            push({ next: next.slice(), nextCap, from: k, to: k, caption: `คัดลอก A[${k}] = ${cur[k]} ไปไว้ในอาร์เรย์ใหม่ (คัดลอกแล้ว ${copies} ครั้ง)` });
          }
          cur = next; cap = nextCap;
          push({ swapped: true, caption: `ย้ายมาใช้อาร์เรย์ใหม่ความจุ ${cap} ช่อง แล้วคืนพื้นที่อาร์เรย์เดิม ตอนนี้มีที่ว่างพอแล้ว` });
        }
        cur.push(v); ops++;
        push({ placed: cur.length - 1, caption: `append(${v}) วางที่ A[${cur.length - 1}] ทันที ใช้ 1 ขั้นตอน` });
      }
      push({ end: true, caption: `เพิ่ม ${SEQ.length} ค่า ใช้ทั้งหมด ${ops} ขั้นตอน (วาง ${SEQ.length} + คัดลอก ${copies}) เฉลี่ยราว 2 ขั้นตอนต่อครั้ง การขยายทีละ 2 เท่าจึงทำให้ append เป็น <b>O(1) แบบเฉลี่ย (amortized)</b>` });
      return f;
    };
    const cells = (vals, cap, hl) => Array.from({ length: cap }, (_, k) => {
      const has = k < vals.length;
      let cls = 'cell' + (has ? '' : ' is-empty');
      if (hl && hl.k === k) cls += ' ' + hl.cls;
      return el('div', { class: 'cellbox' }, el('div', { class: cls }, has ? vals[k] : ''), el('span', { class: 'idx' }, `[${k}]`));
    });
    const render = (fr) => {
      rowCur.replaceChildren(...cells(fr.cur, fr.cap,
        fr.placed != null ? { k: fr.placed, cls: 'is-cur' } : fr.from != null ? { k: fr.from, cls: 'is-cmp' } : null));
      rowCur.classList.toggle('is-full', !!fr.full);
      $('[data-curcap]', root).textContent = `ความจุ ${fr.cap} ช่อง`;
      newWrap.hidden = !fr.next;
      if (fr.next) {
        rowNew.replaceChildren(...cells(fr.next, fr.nextCap, fr.to != null ? { k: fr.to, cls: 'is-cur' } : null));
        $('[data-newcap]', root).textContent = `ความจุ ${fr.nextCap} ช่อง`;
      }
      sSize.lastChild.textContent = fr.cur.length;
      sCap.lastChild.textContent = fr.cap;
      sCopy.lastChild.textContent = fr.copies;
      sOps.lastChild.textContent = fr.ops;
      sCap.classList.toggle('is-chg', !!fr.swapped);
      sCopy.classList.toggle('is-chg', fr.from != null);
    };
    new Stepper(root, { build, render, interval: 1300 });
  }

  /* ---------------------------------------------------------
     2.2 คำนวณตำแหน่งอาร์เรย์ 1 มิติ
     --------------------------------------------------------- */
  function demoAddr1D() {
    const root = $('#demo-addr1d'); if (!root) return;
    const TYPES = {
      char: { w: 1, vals: ['P', 'Y', 'T', 'H', 'O', 'N'].map((c) => `'${c}'`) },
      int: { w: 4, vals: [15, 42, 7, 23, 56, 31] },
      double: { w: 8, vals: [1.5, 4.2, 0.7, 2.3, 5.6, 3.1] },
    };
    const BASE = 1000;
    const selT = $('#a1-type', root), selL = $('#a1-low', root), inI = $('#a1-i', root);
    const stage = stageOf(root);
    const blocks = el('div', { class: 'blocks' });
    const fx = formulaBox();
    stage.append(el('div', { class: 'addr-wrap' },
      el('div', {}, el('div', { class: 'memhead' }, el('span', { 'data-decl': '' }), el('span', {}, 'สี่เหลี่ยมเล็ก 1 ช่อง = 1 ไบต์')), blocks),
      el('div', {}, el('div', { class: 'memhead' }, el('span', {}, 'สูตรคำนวณตำแหน่ง')), fx.box)));
    let S;
    const build = () => {
      const t = selT.value, L = +selL.value, T = TYPES[t];
      const i = clamp(Math.floor(+inI.value || 0), L, L + 5);
      inI.min = L; inI.max = L + 5; inI.value = i;
      const k = i - L, off = k * T.w, addr = BASE + off;
      S = { t, L, T, i, k, off, addr };
      $('[data-decl]', root).textContent = `${t} A[6];  ·  Base = ${BASE}  ·  w = ${T.w} ไบต์`;
      const lines = [
        'Loc(A[i]) = Base + (i − L) × w',
        `= ${BASE} + (${i} − ${L}) × ${T.w}`,
        `= ${BASE} + ${k} × ${T.w}`,
        `= ${BASE} + ${off}`,
        `= <b>${addr}</b>`,
      ];
      S.lines = lines;
      return [
        { fl: 0, caption: `อาร์เรย์ ${t} 6 ช่อง เก็บ<b>ติดกัน</b>ในหน่วยความจำ ช่องละ ${T.w} ไบต์ เริ่มที่ที่อยู่ ${BASE} ดัชนีเริ่มที่ ${L}` },
        { fl: 1, base: true, caption: `สูตร: <b>Base</b> = ที่อยู่ของช่องแรก (${BASE}) · <b>L</b> = ดัชนีแรก (${L}) · <b>w</b> = ขนาดของ 1 ช่อง (${T.w} ไบต์)` },
        { fl: 2, caption: `ต้องการหาที่อยู่ของ A[${i}] แทนค่าลงในสูตร` },
        { fl: 3, skip: true, caption: `i − L = ${k} หมายความว่าก่อนถึง A[${i}] มีช่องอยู่ข้างหน้า <b>${k} ช่อง</b> ที่ต้องข้ามไป` },
        { fl: 4, skip: true, caption: `${k} ช่อง × ${T.w} ไบต์ = ข้ามไป <b>${off} ไบต์</b> จากจุดเริ่มต้น` },
        { fl: 5, found: true, caption: `ได้ที่อยู่ ${addr} และพบ A[${i}] = ${T.vals[k]} โดยคำนวณครั้งเดียว ไม่ต้องไล่ทีละช่อง การเข้าถึงอาร์เรย์จึงเป็น <b>O(1)</b>` },
      ];
    };
    const render = (fr) => {
      const { T, L, k } = S;
      blocks.replaceChildren(...T.vals.map((v, j) => {
        let cls = 'blk';
        if (fr.found && j === k) cls += ' is-found';
        else if (fr.skip && j < k) cls += ' is-skip';
        else if (fr.base && j === 0) cls += ' is-base';
        const a0 = BASE + j * T.w, a1 = a0 + T.w - 1;
        return el('div', { class: cls },
          el('div', { class: 'blk-h' }, `A[${L + j}]`),
          el('div', { class: 'blk-v' }, v),
          el('div', { class: 'ticks' }, Array.from({ length: T.w }, () => el('i'))),
          el('div', { class: 'blk-a' }, T.w > 1 ? `${a0}–${a1}` : `${a0}`));
      }));
      fx.show(S.lines, fr.fl);
    };
    const st = new Stepper(root, { build, render, interval: 1700 });
    [selT, selL, inI].forEach((c) => c.addEventListener('change', () => st.rebuild()));
  }

  /* ---------------------------------------------------------
     2.3 อาร์เรย์ 2 มิติ: Row-major / Column-major
     --------------------------------------------------------- */
  function demoAddr2D() {
    const root = $('#demo-addr2d'); if (!root) return;
    const M = 3, N = 4, BASE = 2000, W = 4;
    const V = (i, j) => (i + 1) * 10 + (j + 1);
    const selO = $('#a2-order', root), selI = $('#a2-i', root), selJ = $('#a2-j', root);
    const stage = stageOf(root);
    const mat = el('div', { class: 'matrix', style: { gridTemplateColumns: `auto repeat(${N}, minmax(0, 1fr))` } });
    const strip = el('div', { class: 'memstrip' });
    const fx = formulaBox();
    stage.append(el('div', { class: 'm2d' },
      el('div', { class: 'm2d-top' },
        el('div', {}, el('div', { class: 'memhead' }, el('span', {}, `int A[${M}][${N}]  (M = ${M} แถว, N = ${N} คอลัมน์)`)), mat),
        el('div', {}, el('div', { class: 'memhead' }, el('span', {}, 'สูตรคำนวณตำแหน่ง')), fx.box)),
      el('div', {}, el('div', { class: 'memhead' }, el('span', {}, `หน่วยความจำจริงเป็นแถวเดียว · Base = ${BASE} · w = ${W} ไบต์`)), strip)));
    let S;
    const build = () => {
      const row = selO.value === 'row';
      const ti = +selI.value, tj = +selJ.value;
      const order = [];
      if (row) { for (let i = 0; i < M; i++) for (let j = 0; j < N; j++) order.push([i, j]); }
      else { for (let j = 0; j < N; j++) for (let i = 0; i < M; i++) order.push([i, j]); }
      const pos = row ? ti * N + tj : tj * M + ti;
      const addr = BASE + pos * W;
      S = { row, ti, tj, order, pos };
      S.lines = row
        ? ['Loc(A[i][j]) = Base + (i × N + j) × w', `= ${BASE} + (${ti} × ${N} + ${tj}) × ${W}`, `= ${BASE} + ${pos} × ${W}`, `= <b>${addr}</b>`]
        : ['Loc(A[i][j]) = Base + (j × M + i) × w', `= ${BASE} + (${tj} × ${M} + ${ti}) × ${W}`, `= ${BASE} + ${pos} × ${W}`, `= <b>${addr}</b>`];
      const f = [{ placed: 0, fl: 0, caption: `เมทริกซ์ ${M}×${N} ดูเป็นตาราง แต่หน่วยความจำจริงเป็นแถวยาวแถวเดียว ต้องเลือกว่าจะเรียงแบบ <b>${row ? 'Row-major (ทีละแถว)' : 'Column-major (ทีละคอลัมน์)'}</b>` }];
      order.forEach(([i, j], k) => {
        let cap = `วาง A[${i}][${j}] = ${V(i, j)} ลงช่องที่ ${k} (ที่อยู่ ${BASE + k * W})`;
        if (row && j === 0) cap = `เริ่มแถวที่ ${i}: ` + cap;
        if (!row && i === 0) cap = `เริ่มคอลัมน์ที่ ${j}: ` + cap;
        f.push({ placed: k + 1, cur: k, fl: 0, caption: cap });
      });
      f.push({ placed: order.length, fl: 1, caption: row
        ? `แบบ Row-major ก่อนถึง A[i][j] ต้องผ่าน <b>i แถวเต็ม</b> (แถวละ N ตัว) แล้วผ่านอีก <b>j ตัว</b> ในแถวเดียวกัน`
        : `แบบ Column-major ก่อนถึง A[i][j] ต้องผ่าน <b>j คอลัมน์เต็ม</b> (คอลัมน์ละ M ตัว) แล้วผ่านอีก <b>i ตัว</b> ในคอลัมน์เดียวกัน` });
      f.push({ placed: order.length, fl: 2, caption: `หาที่อยู่ของ A[${ti}][${tj}] แทนค่าลงในสูตร` });
      f.push({ placed: order.length, fl: 3, skip: true, caption: row
        ? `${ti} แถว × ${N} + ${tj} = ข้ามไป <b>${pos} ช่อง</b> (ช่องสีเทา)`
        : `${tj} คอลัมน์ × ${M} + ${ti} = ข้ามไป <b>${pos} ช่อง</b> (ช่องสีเทา)` });
      f.push({ placed: order.length, fl: 4, skip: true, found: true, caption: `${pos} ช่อง × ${W} ไบต์ = ${pos * W} → ที่อยู่ <b>${addr}</b> พบ A[${ti}][${tj}] = ${V(ti, tj)} ลองสลับเป็น${row ? ' Column-major' : ' Row-major'} แล้วเทียบตำแหน่ง` });
      return f;
    };
    const render = (fr) => {
      const { order, ti, tj, pos } = S;
      const placedIdx = new Map(order.slice(0, fr.placed).map(([i, j], k) => [i + ',' + j, k]));
      const curKey = fr.cur != null ? order[fr.cur].join(',') : null;
      const kids = [el('div', { class: 'mh' })];
      for (let j = 0; j < N; j++) kids.push(el('div', { class: 'mh' }, `[${j}]`));
      for (let i = 0; i < M; i++) {
        kids.push(el('div', { class: 'mh' }, `[${i}]`));
        for (let j = 0; j < N; j++) {
          const key = i + ',' + j;
          let cls = 'mc';
          if (fr.found && i === ti && j === tj) cls += ' is-found';
          else if (key === curKey) cls += ' is-cur';
          else if (placedIdx.has(key)) cls += ' is-done';
          kids.push(el('div', { class: cls }, el('b', {}, V(i, j)), placedIdx.has(key) ? el('small', {}, '#' + placedIdx.get(key)) : null));
        }
      }
      mat.replaceChildren(...kids);
      strip.replaceChildren(...order.map(([i, j], k) => {
        const has = k < fr.placed;
        let cls = 'slot' + (has ? '' : ' is-empty');
        if (fr.found && k === pos) cls += ' is-found';
        else if (fr.cur === k) cls += ' is-cur';
        else if (fr.skip && k < pos) cls += ' is-skip';
        const band = S.row ? i : j;
        return el('div', { class: cls + ' band' + (band % 2) },
          el('span', { class: 'slot-k' }, k),
          el('b', {}, has ? V(i, j) : ''),
          el('span', { class: 'slot-ij' }, has ? `[${i}][${j}]` : ''),
          el('span', { class: 'slot-a' }, BASE + k * W));
      }));
      fx.show(S.lines, fr.fl);
    };
    const st = new Stepper(root, { build, render, interval: 900 });
    [selO, selI, selJ].forEach((c) => c.addEventListener('change', () => st.rebuild()));
  }

  /* ---------------------------------------------------------
     2.4 แทรก ลบ ค้นหาในอาร์เรย์
     --------------------------------------------------------- */
  function demoOps() {
    const root = $('#demo-ops'); if (!root) return;
    const CAP = 8;
    const START = [10, 20, 30, 40, 50];
    let base = START.slice();
    const selOp = $('#a3-op', root), inK = $('#a3-k', root), inX = $('#a3-x', root);
    const CODE = {
      insert: ['<span class="k">def</span> insert(A, n, k, x):', '    <span class="k">for</span> j <span class="k">in</span> range(n - 1, k - 1, -1):', '        A[j + 1] = A[j]      <span class="c"># เลื่อนไปทางขวา</span>', '    A[k] = x', '    <span class="k">return</span> n + 1'],
      delete: ['<span class="k">def</span> delete(A, n, k):', '    <span class="k">for</span> j <span class="k">in</span> range(k, n - 1):', '        A[j] = A[j + 1]      <span class="c"># เลื่อนไปทางซ้าย</span>', '    A[n - 1] = <span class="k">None</span>', '    <span class="k">return</span> n - 1'],
      search: ['<span class="k">def</span> search(A, n, x):', '    <span class="k">for</span> i <span class="k">in</span> range(n):', '        <span class="k">if</span> A[i] == x:', '            <span class="k">return</span> i', '    <span class="k">return</span> -1'],
    };
    const stage = stageOf(root);
    const row = el('div', { class: 'cells ops-row' });
    const code = el('div', { class: 'codebox' });
    const vN = el('div', { class: 'var' }, el('small', {}, 'n (จำนวนข้อมูล)'), el('b'));
    const vMv = el('div', { class: 'var' }, el('small', { 'data-cntlabel': '' }, 'เลื่อนข้อมูล'), el('b'));
    const vBig = el('div', { class: 'var' }, el('small', {}, 'ความซับซ้อน'), el('b'));
    stage.append(el('div', { class: 'ops' },
      el('div', {}, el('div', { class: 'memhead' }, el('span', {}, `อาร์เรย์ A ความจุ ${CAP} ช่อง`), el('span', {}, 'ช่องเส้นประ = ว่าง')), row,
        el('div', { class: 'vars', style: { marginTop: '14px' } }, vN, vMv, vBig)),
      el('div', {}, el('div', { class: 'memhead' }, el('span', { 'data-codetitle': '' })), code)));
    let S;
    const syncInputs = () => {
      const op = selOp.value, n = base.length;
      inX.disabled = op === 'delete';
      $('[for="a3-x"]', root).style.opacity = op === 'delete' ? 0.4 : 1;
      const maxK = op === 'insert' ? n : Math.max(0, n - 1);
      inK.max = maxK;
      inK.disabled = op === 'search';
      $('[for="a3-k"]', root).style.opacity = op === 'search' ? 0.4 : 1;
      $('[data-range]', root).textContent = op === 'search' ? '' : `(0–${maxK})`;
    };
    const build = () => {
      const op = selOp.value;
      const n = base.length;
      const A = Array.from({ length: CAP }, (_, k) => (k < n ? base[k] : null));
      const x = Math.floor(+inX.value || 0);
      const k = clamp(Math.floor(+inK.value || 0), 0, op === 'insert' ? n : Math.max(0, n - 1));
      if (op !== 'search') inK.value = k;
      const f = [];
      let moves = 0;
      const push = (o) => f.push({ A: A.slice(), n, moves, ...o });
      if (op === 'insert') {
        push({ line: 1, mark: k, caption: `แทรก <b>${x}</b> ที่ตำแหน่ง ${k} ตอนนี้มีข้อมูล n = ${n} ตัว` });
        if (n === CAP) {
          push({ line: 1, err: true, caption: `อาร์เรย์เต็มแล้ว (n = ความจุ = ${CAP}) แทรกไม่ได้ เกิด <b>Overflow</b> กด "รีเซ็ตข้อมูล" หรือลบข้อมูลก่อน` });
        } else {
          if (k === n) push({ line: 2, caption: `ตำแหน่ง ${k} คือท้ายสุด ไม่มีข้อมูลต้องเลื่อน ลูปจึงไม่ทำงานเลย` });
          for (let j = n - 1; j >= k; j--) {
            A[j + 1] = A[j]; moves++;
            push({ line: 3, src: j, dst: j + 1, caption: `เลื่อน A[${j}] = ${A[j]} ไปไว้ที่ A[${j + 1}] เพื่อเปิดช่องว่าง (เลื่อนแล้ว ${moves} ครั้ง)` });
          }
          A[k] = x;
          push({ line: 4, dst: k, caption: `ช่อง ${k} ว่างแล้ว วาง ${x} ลงไป` });
          push({ line: 5, n: n + 1, done: k, end: true, caption: `เสร็จ: n = ${n + 1} เลื่อนข้อมูล <b>${moves}</b> ครั้ง (n − k = ${n} − ${k}) ถ้าแทรกที่หน้าสุดต้องเลื่อนทั้ง n ตัว → <b>O(n)</b>` });
        }
      } else if (op === 'delete') {
        const v = A[k];
        push({ line: 1, mark: k, caption: `ลบ A[${k}] = <b>${v}</b> ตอนนี้มีข้อมูล n = ${n} ตัว` });
        for (let j = k; j < n - 1; j++) {
          A[j] = A[j + 1]; moves++;
          push({ line: 3, src: j + 1, dst: j, caption: `เลื่อน A[${j + 1}] = ${A[j]} มาทับ A[${j}] เพื่อปิดช่องว่าง (เลื่อนแล้ว ${moves} ครั้ง)` });
        }
        if (k === n - 1) push({ line: 2, caption: 'ลบตัวท้ายสุด ไม่มีข้อมูลต้องเลื่อน' });
        A[n - 1] = null;
        push({ line: 4, cleared: n - 1, caption: `ล้างช่องสุดท้าย A[${n - 1}] เพราะข้อมูลถูกเลื่อนไปแล้ว` });
        push({ line: 5, n: n - 1, end: true, caption: `เสร็จ: n = ${n - 1} เลื่อนข้อมูล <b>${moves}</b> ครั้ง (n − k − 1) ลบตัวหน้าสุดต้องเลื่อน n − 1 ตัว → <b>O(n)</b>` });
      } else {
        let found = -1;
        for (let i = 0; i < n; i++) {
          moves++;
          const eq = A[i] === x;
          push({ line: 3, cmp: i, caption: `เปรียบเทียบ A[${i}] = ${A[i]} กับ ${x} → ${eq ? '<b>เท่ากัน</b>' : 'ไม่เท่ากัน'} (ครั้งที่ ${moves})` });
          if (eq) { found = i; break; }
        }
        if (found >= 0) push({ line: 4, done: found, end: true, caption: `พบ ${x} ที่ตำแหน่ง ${found} เปรียบเทียบ ${moves} ครั้ง ข้อมูลไม่ได้เรียง จึงต้องไล่ทีละตัว → <b>O(n)</b>` });
        else push({ line: 5, end: true, caption: `ไม่พบ ${x} เปรียบเทียบครบทั้ง ${moves} ตัว (กรณีแย่ที่สุด) คืนค่า −1` });
      }
      S = { op, final: f[f.length - 1], committed: false };
      return f;
    };
    /* เมื่อเล่นถึงขั้นสุดท้าย ผลลัพธ์จะกลายเป็นข้อมูลตั้งต้นของคำสั่งถัดไป */
    const onFrame = (fr, i) => {
      if (!fr.end || S.committed) return;
      S.committed = true;
      base = fr.A.slice(0, fr.n).filter((v) => v != null);
      syncInputs();
    };
    const render = (fr) => {
      row.replaceChildren(...fr.A.map((v, j) => {
        let cls = 'cell';
        if (v == null) cls += ' is-empty';
        if (fr.done === j) cls += ' is-found';
        else if (fr.dst === j) cls += ' is-cur';
        else if (fr.src === j) cls += ' is-cmp';
        else if (fr.cmp === j) cls += ' is-cmp';
        else if (fr.mark === j) cls += ' is-acc';
        else if (fr.cleared === j) cls += ' is-dim';
        let ptr = '';
        if (fr.src === j) ptr = 'จาก';
        if (fr.dst === j) ptr = 'ไป';
        if (fr.mark === j) ptr = S.op === 'insert' ? 'k' : 'ลบ';
        if (fr.cmp === j) ptr = 'i';
        return el('div', { class: 'cellbox' }, el('div', { class: cls }, v ?? ''), el('span', { class: 'idx' }, `[${j}]`), el('span', { class: 'ptr' + (ptr ? ' hl' : '') }, ptr));
      }));
      const src = CODE[S.op];
      code.replaceChildren(...src.map((t, k) => el('span', { class: 'ln' + (k === fr.line - 1 ? ' on' : ''), 'data-n': k + 1, html: t })));
      $('[data-codetitle]', root).textContent = { insert: 'โค้ด Python: แทรก', delete: 'โค้ด Python: ลบ', search: 'โค้ด Python: ค้นหาแบบลำดับ' }[S.op];
      $('[data-cntlabel]', root).textContent = S.op === 'search' ? 'เปรียบเทียบ' : 'เลื่อนข้อมูล';
      vN.lastChild.textContent = fr.n;
      vMv.lastChild.textContent = fr.moves + ' ครั้ง';
      vBig.lastChild.textContent = fr.end ? (fr.moves === 0 && S.op !== 'search' ? 'O(1)' : 'O(n)') : '—';
      vN.classList.toggle('is-chg', !!fr.end && S.op !== 'search');
    };
    syncInputs();
    const st = new Stepper(root, { build, render, onFrame, interval: 1100 });
    $('#a3-run', root).addEventListener('click', () => { syncInputs(); st.rebuild(); st.play(); });
    $('#a3-reset', root).addEventListener('click', () => { base = START.slice(); syncInputs(); st.rebuild(); });
    [selOp, inK, inX].forEach((c) => c.addEventListener('change', () => { syncInputs(); st.rebuild(); }));
  }

  /* ---------------------------------------------------------
     2.5 เรคคอร์ดและอาร์เรย์ของเรคคอร์ด
     --------------------------------------------------------- */
  function demoRecord() {
    const root = $('#demo-record'); if (!root) return;
    const BASE = 3000;
    const F = [
      { name: 'id', type: 'int', size: 4 },
      { name: 'name', type: 'char[12]', size: 12 },
      { name: 'gpa', type: 'float', size: 4 },
    ];
    let o = 0; F.forEach((f) => { f.off = o; o += f.size; });
    const SIZE = o;
    const DATA = [
      { id: 66001, name: '"Ann"', gpa: '3.25' },
      { id: 66002, name: '"Beam"', gpa: '2.80' },
      { id: 66003, name: '"Chai"', gpa: '3.45' },
      { id: 66004, name: '"Dao"', gpa: '3.90' },
    ];
    const selI = $('#a4-i', root), selF = $('#a4-f', root);
    const stage = stageOf(root);
    const layout = el('div', { class: 'rec-layout' });
    const table = el('div', { class: 'rec-table' });
    const fx = formulaBox();
    stage.append(el('div', { class: 'recdemo' },
      el('div', { class: 'rec-top' },
        el('div', {}, el('div', { class: 'memhead' }, el('span', {}, `struct Student · ขนาด ${SIZE} ไบต์`), el('span', {}, 'offset = ระยะจากต้นเรคคอร์ด')), layout),
        el('div', {}, el('div', { class: 'memhead' }, el('span', {}, 'สูตรคำนวณตำแหน่ง')), fx.box)),
      el('div', {}, el('div', { class: 'memhead' }, el('span', {}, `Student students[4]  ·  Base = ${BASE}`), el('span', {}, 'ความกว้างของช่องเทียบตามจำนวนไบต์')), table)));
    let S;
    const build = () => {
      const i = +selI.value; const f = F.find((x) => x.name === selF.value);
      const jump = i * SIZE, addr = BASE + jump + f.off;
      S = { i, f };
      S.lines = [
        'Loc(students[i].field) = Base + i × size + offset',
        `= ${BASE} + ${i} × ${SIZE} + ${f.off}`,
        `= ${BASE} + ${jump} + ${f.off}`,
        `= <b>${addr}</b>`,
      ];
      return [
        { fl: 0, step: 'struct', caption: `เรคคอร์ด Student มี 3 ฟิลด์<b>ต่างชนิดกัน</b> เรียงต่อกัน: id (4 ไบต์) name (12 ไบต์) gpa (4 ไบต์) รวม ${SIZE} ไบต์ ตำแหน่งเริ่มของแต่ละฟิลด์เรียกว่า <b>offset</b>` },
        { fl: 0, step: 'table', caption: `อาร์เรย์ของเรคคอร์ด 4 ตัว แต่ละเรคคอร์ดยาว ${SIZE} ไบต์ จึงเริ่มที่ ${DATA.map((_, k) => BASE + k * SIZE).join(', ')} เหมือนตารางที่มี 4 แถว` },
        { fl: 2, step: 'table', caption: `ต้องการ <code>students[${i}].${f.name}</code> แทนค่าลงในสูตร` },
        { fl: 3, step: 'row', caption: `i × size = ${i} × ${SIZE} = ${jump} → กระโดดข้าม ${i} เรคคอร์ดแรก ไปถึงต้นเรคคอร์ดที่ ${i} (ที่อยู่ ${BASE + jump})` },
        { fl: 4, step: 'field', caption: `+ offset ของ ${f.name} (${f.off}) → ที่อยู่ <b>${addr}</b> ได้ค่า ${f.name} = ${DATA[i][f.name]} ใช้การคำนวณครั้งเดียว จึงเป็น O(1) เหมือนอาร์เรย์` },
      ];
    };
    const render = (fr) => {
      const { i, f } = S;
      layout.replaceChildren(...F.map((x) => el('div', { class: 'rf' + (fr.step === 'struct' || x === f && fr.step === 'field' ? ' is-hl' : ''), style: { flexGrow: x.size } },
        el('b', {}, x.name), el('span', {}, x.type), el('small', {}, `offset ${x.off} · ${x.size} B`))));
      table.hidden = fr.step === 'struct';
      table.replaceChildren(...DATA.map((d, r) => {
        const rowOn = (fr.step === 'row' || fr.step === 'field') && r === i;
        const rowSkip = (fr.step === 'row' || fr.step === 'field') && r < i;
        return el('div', { class: 'rt-row' + (rowOn ? ' is-on' : '') + (rowSkip ? ' is-skip' : '') },
          el('div', { class: 'rt-h' }, el('b', {}, `[${r}]`), el('span', {}, BASE + r * SIZE)),
          el('div', { class: 'rt-fields' }, F.map((x) => el('div', {
            class: 'rt-f' + (fr.step === 'field' && rowOn && x === f ? ' is-found' : ''), style: { flexGrow: x.size },
          }, el('span', {}, x.name), el('b', {}, d[x.name]), el('small', {}, BASE + r * SIZE + x.off)))));
      }));
      fx.show(S.lines, fr.fl);
    };
    const st = new Stepper(root, { build, render, interval: 2000 });
    [selI, selF].forEach((c) => c.addEventListener('change', () => st.rebuild()));
  }

  /* ---------------------------------------------------------
     แบบทดสอบท้ายหน่วยที่ 2
     --------------------------------------------------------- */
  const QUIZ = [
    { q: 'ข้อใด<b>ไม่ใช่</b>คุณสมบัติของอาร์เรย์', options: ['เก็บข้อมูลชนิดเดียวกัน', 'เก็บเรียงติดกันในหน่วยความจำ', 'แต่ละช่องเก็บข้อมูลต่างชนิดกันได้', 'เข้าถึงด้วยดัชนีได้ทันที'], answer: 2,
      explain: 'อาร์เรย์เก็บข้อมูลชนิดเดียวกันทุกช่อง ข้อมูลต่างชนิดกันต้องใช้เรคคอร์ด' },
    { q: '<code>int A[10]</code> เริ่มที่ Base = 500 ใช้ช่องละ 4 ไบต์ ดัชนีเริ่มที่ 0 ที่อยู่ของ <code>A[6]</code> คือข้อใด', options: ['506', '520', '524', '530'], answer: 2,
      explain: '500 + (6 − 0) × 4 = 500 + 24 = 524' },
    { q: 'อาร์เรย์ดัชนีเริ่มที่ 1 (L = 1) Base = 1000 ช่องละ 2 ไบต์ ที่อยู่ของ <code>A[5]</code> คือข้อใด', options: ['1005', '1008', '1010', '1012'], answer: 1,
      explain: '1000 + (5 − 1) × 2 = 1000 + 8 = 1008 ต้องลบดัชนีเริ่มต้นออกก่อน' },
    { q: 'การจัดเก็บแบบ <b>Row-major</b> หมายถึงข้อใด', options: ['เก็บทีละคอลัมน์จากซ้ายไปขวา', 'เก็บทีละแถวจากบนลงล่าง', 'เก็บเฉพาะช่องที่ไม่เป็นศูนย์', 'เก็บแบบสุ่มตำแหน่ง'], answer: 1,
      explain: 'Row-major เก็บแถวที่ 0 ทั้งแถวก่อน ตามด้วยแถวที่ 1, 2, ... ภาษา C และ Python ใช้แบบนี้' },
    { q: 'อาร์เรย์ <code>A[3][4]</code> แบบ Row-major เริ่มที่ 0 ช่องละ 1 ไบต์ <code>A[2][1]</code> อยู่ที่ตำแหน่งใด', options: ['5', '7', '9', '11'], answer: 2,
      explain: '(i × N + j) × w = (2 × 4 + 1) × 1 = 9' },
    { q: 'อาร์เรย์เดียวกัน <code>A[3][4]</code> ถ้าเก็บแบบ <b>Column-major</b> <code>A[2][1]</code> อยู่ที่ตำแหน่งใด', options: ['5', '6', '9', '7'], answer: 0,
      explain: '(j × M + i) × w = (1 × 3 + 2) × 1 = 5' },
    { q: 'แทรกข้อมูลที่<b>ตำแหน่งแรก</b>ของอาร์เรย์ที่มีข้อมูล n ตัว ต้องเลื่อนข้อมูลกี่ตัว', options: ['0 ตัว', '1 ตัว', 'n − 1 ตัว', 'n ตัว'], answer: 3,
      explain: 'ต้องเลื่อนทุกตัวไปทางขวา 1 ช่องเพื่อเปิดช่องแรก จึงเลื่อน n ตัว เป็น O(n)' },
    { q: 'การดำเนินการใดในอาร์เรย์เป็น <b>O(1)</b>', options: ['ค้นหาค่าในอาร์เรย์ที่ไม่ได้เรียง', 'ลบข้อมูลตัวแรก', 'อ่านค่า A[i]', 'แทรกข้อมูลตรงกลาง'], answer: 2,
      explain: 'อ่าน A[i] ใช้สูตรคำนวณที่อยู่ครั้งเดียว ข้ออื่นต้องไล่หรือเลื่อนข้อมูลจำนวนมาก' },
    { q: 'list ของ Python เมื่อ append จนเต็มความจุ จะทำอย่างไร', options: ['เกิดข้อผิดพลาด Overflow', 'จองอาร์เรย์ใหม่ที่ใหญ่ขึ้น แล้วคัดลอกข้อมูลเดิมไป', 'ลบข้อมูลตัวแรกทิ้ง', 'เขียนทับข้อมูลตัวสุดท้าย'], answer: 1,
      explain: 'list เป็นอาร์เรย์แบบขยายได้ (dynamic array) จองพื้นที่ใหม่แล้วคัดลอก ทำให้ append เป็น O(1) แบบเฉลี่ย' },
    { q: '<b>เรคคอร์ด (Record)</b> ต่างจากอาร์เรย์อย่างไร', options: ['เรคคอร์ดเก็บฟิลด์ต่างชนิดกันได้', 'เรคคอร์ดเข้าถึงด้วยดัชนีตัวเลข', 'เรคคอร์ดเก็บข้อมูลได้ทีละ 1 ค่า', 'เรคคอร์ดเร็วกว่าอาร์เรย์เสมอ'], answer: 0,
      explain: 'เรคคอร์ดรวมฟิลด์หลายชนิด เช่น int, char[], float และเข้าถึงด้วยชื่อฟิลด์' },
    { q: 'struct Student มี id (4 ไบต์), name (12 ไบต์), gpa (4 ไบต์) อาร์เรย์ <code>students</code> เริ่มที่ 3000 ที่อยู่ของ <code>students[3].gpa</code> คือ', options: ['3016', '3060', '3076', '3080'], answer: 2,
      explain: 'size = 20, offset ของ gpa = 16 → 3000 + 3 × 20 + 16 = 3076' },
  ];

  demoDynamic();
  demoAddr1D();
  demoAddr2D();
  demoOps();
  demoRecord();
  DSA.quiz('#quiz-u2', QUIZ);
  DSA.initLessonNav(document.querySelector('#unit-2 .lessonnav-in'));
})();

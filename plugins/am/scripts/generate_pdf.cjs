#!/usr/bin/env node
/* am · generador de PDF · versión 1
   Uso:  node generate_pdf.cjs <datos.json> <salida.pdf>
   Archivo fijo del plugin: no se edita ni se copia modificado. El formato de
   <datos.json> está en PDF-FORMAT.md. Solo necesita Node: la librería de PDF va
   incluida en pdfkit.bundle.cjs, en esta misma carpeta. */
'use strict';
const fs = require('fs');
const path = require('path');
const PDFDocument = require('./pdfkit.bundle.cjs');

const VERSION = 1;
const [, , dataPath, outPath] = process.argv;
if (!dataPath || !outPath) {
  console.error('Uso: node generate_pdf.cjs <datos.json> <salida.pdf>');
  process.exit(2);
}
let D;
try { D = JSON.parse(fs.readFileSync(dataPath, 'utf8').replace(/^﻿/, '')); }
catch (e) { console.error('No se pudo leer ' + dataPath + ': ' + e.message); process.exit(2); }
const BASE = path.resolve(D.baseDir || path.dirname(dataPath));

function fail(msgs) {
  console.error('Datos no válidos en ' + dataPath + ':');
  msgs.forEach((m) => console.error('  - ' + m));
  process.exit(2);
}
function validate() {
  const e = [];
  const txt = (o, k, name) => { if (typeof o[k] !== 'string' || !o[k].trim()) e.push('falta "' + (name || k) + '"'); };
  const list = (o, k, name) => { if (!Array.isArray(o[k]) || !o[k].length) e.push('"' + (name || k) + '" debe ser una lista con al menos un elemento'); };
  if (D.type !== 'finding' && D.type !== 'summary') fail(['"type" debe ser "finding" o "summary"']);
  if (D.type === 'summary') {
    txt(D, 'period'); list(D, 'sections');
    (D.sections || []).forEach((s, i) => { if (!s || typeof s.title !== 'string' || !Array.isArray(s.blocks)) e.push('sections[' + i + '] necesita "title" y "blocks"'); });
    if (D.cards !== undefined && !Array.isArray(D.cards)) e.push('"cards" debe ser una lista');
    (Array.isArray(D.cards) ? D.cards : []).forEach((c, i) => { if (!c || c.k == null || c.v == null) e.push('cards[' + i + '] necesita "k" y "v"'); });
  } else {
    const states = ['draft', 'fixed', 'already-fixed', 'false-positive', 'wont-fix'];
    if (!states.includes(D.state)) e.push('"state" debe ser uno de: ' + states.join(', '));
    ['app', 'module', 'category', 'pattern', 'objectName', 'analysisDate'].forEach((k) => txt(D, k));
    list(D, 'path'); list(D, 'affected'); list(D, 'cause'); list(D, 'solution');
    (Array.isArray(D.path) ? D.path : []).forEach((p, i) => { if (!p || typeof p.name !== 'string') e.push('path[' + i + '] necesita "name"'); });
    const ev = D.evidence || {}, fin = D.final || {}, figs = Array.isArray(ev.figures) ? ev.figures : [];
    if (ev.figures !== undefined && !Array.isArray(ev.figures)) e.push('"evidence.figures" debe ser una lista');
    figs.forEach((f, i) => { if (!f || typeof f.caption !== 'string') e.push('evidence.figures[' + i + '] necesita "caption"'); });
    if (D.state && D.state !== 'draft') {
      txt(fin, 'closedOn', 'final.closedOn');
      if (D.state === 'fixed' || D.state === 'already-fixed') {
        if (!figs.length || figs.some((f) => !f || !f.file)) e.push('con "' + D.state + '", evidence.figures necesita al menos una figura y todas con "file"');
      }
      if (D.state === 'already-fixed') txt(fin, 'verified', 'final.verified');
      if (D.state === 'false-positive' || D.state === 'wont-fix') { txt(fin, 'justification', 'final.justification'); txt(fin, 'approvedBy', 'final.approvedBy'); }
    }
  }
  if (e.length) fail(e);
}
validate();

/* ---------- estilo ---------- */
const C = {
  accent: '#FF5249', accentText: '#B33933', accentSoft: '#FFEEED',
  black: '#000000', white: '#FFFFFF',
  g900: '#1A1A1A', g700: '#4D4D4D', g500: '#6E6E6E', g200: '#E6E6E6', g100: '#F5F5F5',
};
const F = { r: 'Helvetica', b: 'Helvetica-Bold', i: 'Helvetica-Oblique', m: 'Courier', mb: 'Courier-Bold' };
const mm = (v) => v * 2.83465;
const PAGE = { w: 595.28, h: 841.89, top: mm(22), bottom: mm(20), side: mm(18) };
const W = PAGE.w - 2 * PAGE.side;
const X0 = PAGE.side;
const BODY = 9.2;
const LH = 1.5;

const STATES = {
  'draft':          { label: 'BORRADOR',       badge: 'Pendiente de implementación', soft: true,  s4: 'Solución propuesta' },
  'fixed':          { label: 'FIXED',          badge: 'Fixed',          s4: 'Solución aplicada' },
  'already-fixed':  { label: 'ALREADY FIXED',  badge: 'Already fixed',  s4: 'Solución aplicada' },
  'false-positive': { label: 'FALSE POSITIVE', badge: 'False positive', s4: 'Solución aplicada' },
  'wont-fix':       { label: "WON'T FIX",      badge: "Won't fix",      s4: 'Solución aplicada' },
};

/* ---------- documento ---------- */
const doc = new PDFDocument({
  size: 'A4', bufferPages: true, autoFirstPage: false,
  margins: { top: PAGE.top, bottom: 0, left: PAGE.side, right: PAGE.side },
  info: { Title: docTitle(), Creator: 'am', Producer: 'am generate_pdf v' + VERSION },
});
const chunks = [];
doc.on('data', (c) => chunks.push(c));
let y = 0;
const BOTTOM = PAGE.h - PAGE.bottom;

function newPage() { doc.addPage(); y = PAGE.top; }
function ensure(h) { if (y + h > BOTTOM + 0.5) newPage(); }
function gap(h) { y += h; }

/* Las fuentes estándar solo cubren WinAnsi: lo demás se sustituye. */
const SUBST = { '→': '->', '←': '<-', '≥': '>=', '≤': '<=', '≠': '!=', '✓': 'OK',
  '−': '-', ' ': ' ', '​': '', '‑': '-', ' ': ' ', ' ': ' ' };
const WINANSI_EXTRA = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';
function clean(s) {
  return String(s == null ? '' : s).replace(/[^\x20-\x7E¡-ÿ]/g, (ch) => {
    if (ch in SUBST) return SUBST[ch];
    if (WINANSI_EXTRA.includes(ch)) return ch;
    if (ch === '\n' || ch === '\t') return ' ';
    return '?';
  });
}
function width(text, font, size, cs) {
  doc.font(font).fontSize(size);
  return doc.widthOfString(text, cs ? { characterSpacing: cs } : undefined);
}
function draw(text, x, yy, font, size, color, cs) {
  doc.font(font).fontSize(size).fillColor(color);
  doc.text(text, x, yy, { lineBreak: false, characterSpacing: cs || 0 });
}

/* ---------- texto con formato: **negrita**, *cursiva*, `identificador` ---------- */
function parseInline(str) {
  const out = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g;
  let last = 0, m;
  const s = clean(str);
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ t: s.slice(last, m.index), st: 'r' });
    const tok = m[0];
    if (tok[0] === '`') out.push({ t: tok.slice(1, -1), st: 'code' });
    else if (tok.startsWith('**')) out.push({ t: tok.slice(2, -2), st: 'b' });
    else out.push({ t: tok.slice(1, -1), st: 'i' });
    last = m.index + tok.length;
  }
  if (last < s.length) out.push({ t: s.slice(last), st: 'r' });
  return out;
}
function splitToFit(text, font, size, maxW, atSeparators) {
  const parts = [];
  let rest = text;
  while (rest.length && width(rest, font, size) > maxW) {
    let cut = -1;
    if (atSeparators) {
      for (let i = rest.length - 1; i > 0; i--) {
        if ('>/.\\ '.includes(rest[i - 1]) && width(rest.slice(0, i), font, size) <= maxW) { cut = i; break; }
      }
    }
    if (cut < 1) {
      for (let i = rest.length - 1; i > 3; i--) {
        const camel = /[a-z0-9]/.test(rest[i - 1]) && /[A-Z]/.test(rest[i]);
        if ((camel || rest[i - 1] === '_') && width(rest.slice(0, i), font, size) <= maxW) { cut = i; break; }
      }
    }
    if (cut < 1) { cut = rest.length - 1; while (cut > 1 && width(rest.slice(0, cut), font, size) > maxW) cut--; }
    parts.push(rest.slice(0, cut)); rest = rest.slice(cut);
  }
  if (rest.length) parts.push(rest);
  return parts;
}
/* Devuelve líneas de elementos ya medidos. */
function layout(str, maxW, o) {
  o = o || {};
  const size = o.size || BODY, base = o.font || F.r, bold = o.bold || F.b;
  const codeSize = size * 0.9, pad = 2.6;
  const items = [];
  for (const run of (Array.isArray(str) ? str : parseInline(str))) {
    if (run.st === 'code') {
      const pieces = splitToFit(run.t, F.m, codeSize, maxW - 2 * pad, true);
      pieces.forEach((p) => items.push({ t: p, font: F.m, size: codeSize, chip: true, w: width(p, F.m, codeSize) + 2 * pad, pad }));
      continue;
    }
    const font = run.st === 'b' ? bold : run.st === 'i' ? F.i : base;
    for (const tok of run.t.split(/( +)/)) {
      if (!tok) continue;
      if (/^ +$/.test(tok)) { items.push({ space: true, w: width(' ', font, size) }); continue; }
      for (const p of splitToFit(tok, font, size, maxW, false)) {
        items.push({ t: p, font, size, w: width(p, font, size), color: run.st === 'b' ? (o.boldColor || C.black) : run.st === 'muted' ? C.g500 : null });
      }
    }
  }
  const lines = [];
  let line = [], lw = 0;
  for (const it of items) {
    if (it.space) { if (line.length) { line.push(it); lw += it.w; } continue; }
    if (line.length && lw + it.w > maxW + 0.01) {
      while (line.length && line[line.length - 1].space) line.pop();
      lines.push(line); line = []; lw = 0;
    }
    line.push(it); lw += it.w;
  }
  while (line.length && line[line.length - 1].space) line.pop();
  if (line.length) lines.push(line);
  return { lines, lh: size * (o.lh || LH), size, color: o.color || C.g900 };
}
function drawLines(L, x, yy) {
  for (const line of L.lines) {
    let cx = x;
    for (const it of line) {
      if (it.space) { cx += it.w; continue; }
      if (it.chip) {
        doc.roundedRect(cx, yy + L.size * 0.08, it.w, L.size * 1.22, 2).fill(C.g100);
        draw(it.t, cx + it.pad, yy + (L.size - it.size) * 0.62 + L.size * 0.14, it.font, it.size, C.black);
      } else {
        draw(it.t, cx, yy + L.size * 0.14, it.font, it.size, it.color || L.color);
      }
      cx += it.w;
    }
    yy += L.lh;
  }
  return yy;
}
const heightOf = (L) => L.lines.length * L.lh;
/* Párrafo que puede partirse entre páginas. */
function para(str, o) {
  o = o || {};
  const x = o.x == null ? X0 : o.x, w = o.w == null ? W : o.w;
  const L = layout(str, w, o);
  for (const line of L.lines) {
    ensure(L.lh);
    drawLines({ lines: [line], lh: L.lh, size: L.size, color: L.color }, x, y);
    y += L.lh;
  }
}
function label(text, x, yy, o) {
  o = o || {};
  const size = o.size || 7, cs = o.cs == null ? 0.6 : o.cs;
  draw(clean(text).toUpperCase(), x, yy, o.font || F.b, size, o.color || C.g500, cs);
  return width(clean(text).toUpperCase(), o.font || F.b, size, cs);
}
function pill(text, xRight, yy, kind) {
  const size = 7.5, padX = 6.8, h = 14.5;
  const t = clean(text), w = width(t, F.b, size) + 2 * padX, x = xRight - w;
  if (kind === 'line') { doc.roundedRect(x, yy, w, h, h / 2).lineWidth(0.75).stroke(C.g700); draw(t, x + padX, yy + 4.1, F.b, size, C.g900); }
  else if (kind === 'soft') { doc.roundedRect(x, yy, w, h, h / 2).fill(C.accentSoft); draw(t, x + padX, yy + 4.1, F.b, size, C.accentText); }
  else { doc.roundedRect(x, yy, w, h, h / 2).fill(C.black); draw(t, x + padX, yy + 4.1, F.b, size, C.white); }
  return w;
}
function arrow(x1, yy, x2) {
  doc.lineWidth(0.8).strokeColor(C.g500).moveTo(x1, yy).lineTo(x2, yy).stroke();
  doc.moveTo(x2 - 3.2, yy - 2.4).lineTo(x2, yy).lineTo(x2 - 3.2, yy + 2.4).stroke();
}

/* ---------- componentes ---------- */
function docTitle() {
  if (D.type === 'summary') return 'Resumen de avance' + (D.period ? ' — ' + D.period : '');
  return (D.parent ? D.parent + ' › ' : '') + (D.objectName || '') + ' — Atención de hallazgo';
}
function cover(o) {
  doc.rect(X0, y, W, 3).fill(C.accent); y += 3 + mm(6);
  label(o.eyebrow, X0, y + 3, { size: 8, cs: 0.65 });
  const lt = clean(o.label), lw = width(lt, F.b, 7, 1) + 15;
  doc.roundedRect(X0 + W - lw, y - 1.5, lw, 15.5, 1.5).lineWidth(0.75).stroke(C.accentText);
  draw(lt, X0 + W - lw + 7.5, y + 3.2, F.b, 7, C.accentText, 1);
  y += 15.5 + mm(2.5);
  title(o.parts);
  if (!o.cards || !o.cards.length) { y += mm(4); return; }
  y += mm(6);
  const pad = 11;
  const ratios = o.cards.length === 4 ? [0.2, 0.28, 0.21, 0.31] : o.cards.map(() => 1 / o.cards.length);
  const cws = ratios.map((r) => r * W), cxs = cws.map((_, i) => X0 + cws.slice(0, i).reduce((a, b) => a + b, 0));
  const blocks = o.cards.map((c, i) => (c.pill ? null : layout(c.v, cws[i] - 2 * pad, { size: c.small ? 8.5 : 10, font: F.b, lh: 1.4, color: C.black })));
  const hh = Math.max(...blocks.map((b) => (b ? heightOf(b) : 16))) + 9 + 12 + 9;
  doc.roundedRect(X0, y, W, hh, 3).lineWidth(0.75).stroke(C.g200);
  o.cards.forEach((c, i) => {
    const cx = cxs[i];
    if (i) doc.moveTo(cx, y).lineTo(cx, y + hh).lineWidth(0.75).stroke(C.g200);
    label(c.k, cx + pad, y + 9, { size: 7 });
    if (c.pill) { const tw = width(clean(c.v), F.b, 7.5) + 13.6; pill(c.v, cx + pad + tw, y + 21, c.pill); }
    else drawLines(blocks[i], cx + pad, y + 20);
  });
  y += hh + mm(4);
}
function title(parts) {
  let size = 20;
  const segs = parts.map(clean);
  const fit = () => Math.max(...segs.map((s) => width(s, F.b, size)));
  while (size > 12 && fit() > W) size -= 0.5;
  const sepW = () => width(' › ', F.r, size);
  const one = segs.reduce((a, s) => a + width(s, F.b, size), 0) + sepW() * (segs.length - 1);
  const lh = size * 1.2;
  if (one <= W) {
    let cx = X0;
    segs.forEach((s, i) => {
      if (i) { draw('›', cx + width(' ', F.r, size) * 0.9, y, F.r, size, C.accent); cx += sepW(); }
      draw(s, cx, y, F.b, size, C.black); cx += width(s, F.b, size);
    });
    y += lh;
  } else {
    segs.forEach((s, i) => {
      draw(s, X0, y, F.b, size, C.black);
      if (i < segs.length - 1) draw('›', X0 + width(s, F.b, size) + width(' ', F.r, size) * 0.9, y, F.r, size, C.accent);
      y += lh;
    });
  }
}
function section(num, text, need) {
  gap(mm(6)); ensure(Math.min(Math.max(60, 12 * 1.35 + mm(5.5) + (need || 0)), BOTTOM - PAGE.top));
  draw(String(num).padStart(2, '0'), X0, y + 2.2, F.b, 10, C.accentText);
  draw(clean(text), X0 + mm(6) + mm(3), y, F.b, 12, C.black);
  y += 12 * 1.35 + mm(2);
  doc.moveTo(X0, y).lineTo(X0 + W, y).lineWidth(0.75).stroke(C.g200);
  y += mm(3.5);
}
function subhead(text) { gap(mm(4)); ensure(30); label(text, X0, y, { size: 8, color: C.g700, cs: 0.65 }); y += 8 * 1.4 + mm(1.5); }
function kvRows(rows) {
  const tw = mm(34);
  return rows.map((r) => {
    const isPath = Array.isArray(r[1]) && (r[1].length === 0 || r[1][0].name !== undefined);
    const L = isPath ? null : layout(r[1], W - tw, { color: C.black });
    return { r, isPath, L, h: (isPath ? r[1].length * 14.2 : heightOf(L)) + 2 * mm(1.7) };
  });
}
const kvHeight = (rows) => kvRows(rows).reduce((a, x) => a + x.h, 0);
function kv(rows, keep) {
  const tw = mm(34), items = kvRows(rows);
  const total = items.reduce((a, x) => a + x.h, 0);
  if (keep && total <= BOTTOM - PAGE.top) ensure(total);
  items.forEach(({ r, isPath, L, h }, i) => {
    ensure(h);
    draw(clean(r[0]), X0, y + mm(1.7) + 1.8, F.r, 8, C.g500);
    if (isPath) pathList(r[1], X0 + tw, y + mm(1.7));
    else drawLines(L, X0 + tw, y + mm(1.7));
    y += h;
    if (i < rows.length - 1) doc.moveTo(X0, y).lineTo(X0 + W, y).lineWidth(0.75).stroke(C.g100);
  });
}
function pathList(items, x, yy) {
  const step = 14.2, r = 2.3;
  items.forEach((it, i) => {
    const cy = yy + i * step + 7, last = i === items.length - 1;
    if (!last) doc.moveTo(x + r, cy + r + 1).lineTo(x + r, cy + step - r - 1).lineWidth(0.75).stroke(C.g200);
    if (last) doc.circle(x + r, cy, r).fill(C.accent);
    else doc.circle(x + r, cy, r).lineWidth(0.75).fillAndStroke(C.white, C.g500);
    const name = clean(it.name);
    draw(name, x + mm(5), yy + i * step + 1.3, last ? F.b : F.r, BODY, C.black);
    if (it.type) draw(clean(it.type), x + mm(5) + width(name, last ? F.b : F.r, BODY) + mm(1.5), yy + i * step + 2.6, F.r, 8, C.g500);
  });
}
function note(text) {
  const pad = 11, L = layout(text, W - 2 * pad, { size: 8.5, color: C.g700 });
  const h = heightOf(L) + 2 * 8.5;
  gap(mm(4)); ensure(h);
  doc.roundedRect(X0, y, W, h, 3).lineWidth(0.75).fillAndStroke(C.g100, C.g200);
  drawLines(L, X0 + pad, y + 8.5); y += h;
}
function callout(o) {
  const pad = 11, Ls = (Array.isArray(o.text) ? o.text : [o.text]).map((t) => layout(t, W - 3 - 2 * pad, {}));
  const h = Ls.reduce((a, L) => a + heightOf(L), 0) + (Ls.length - 1) * mm(2) + 8.5 * 2 + (o.title ? 12 : 0);
  gap(mm(4)); ensure(h);
  doc.rect(X0, y, W, h).fill(C.accentSoft);
  doc.rect(X0, y, 3, h).fill(C.accent);
  let yy = y + 8.5;
  if (o.title) { label(o.title, X0 + 3 + pad, yy, { size: 7.5, color: C.accentText, cs: 0.6 }); yy += 12; }
  Ls.forEach((L) => { yy = drawLines(L, X0 + 3 + pad, yy) + mm(2); }); y += h;
}
function bullets(items) {
  const ind = mm(5);
  items.forEach((it, i) => {
    const L = layout(it, W - ind, {});
    if (i) gap(mm(1));
    L.lines.forEach((line, j) => {
      ensure(L.lh);
      if (!j) doc.circle(X0 + 2.2, y + L.lh / 2 - 0.5, 1.4).fill(C.g700);
      drawLines({ lines: [line], lh: L.lh, size: L.size, color: L.color }, X0 + ind, y); y += L.lh;
    });
  });
}
function steps(items) {
  const ind = mm(10), padY = mm(2);
  items.forEach((it, i) => {
    const o = typeof it === 'string' ? { text: it } : it;
    const L = layout(o.text, W - ind, {});
    const subs = (o.sub || []).map((s) => layout('– ' + s, W - ind, {}));
    const h = heightOf(L) + subs.reduce((a, s) => a + heightOf(s) + 1.5, 0) + 2 * padY;
    ensure(h);
    doc.circle(X0 + 7.8, y + padY + 7, 7.8).fill(C.black);
    const n = String(i + 1);
    draw(n, X0 + 7.8 - width(n, F.b, 7.5) / 2, y + padY + 4.2, F.b, 7.5, C.white);
    let yy = drawLines(L, X0 + ind, y + padY);
    subs.forEach((s) => { yy = drawLines(s, X0 + ind, yy + 1.5); });
    y += h;
    if (i < items.length - 1) doc.moveTo(X0, y).lineTo(X0 + W, y).lineWidth(0.75).stroke(C.g100);
  });
}
function table(o) {
  const n = o.head.length;
  const ratios = o.widths && o.widths.length === n ? o.widths : (n === 3 ? [0.5, 0.15, 0.35] : Array(n).fill(1 / n));
  const sum = ratios.reduce((a, b) => a + b, 0), cols = ratios.map((r) => (r / sum) * W), gapX = 9;
  const xs = cols.map((_, i) => X0 + cols.slice(0, i).reduce((a, b) => a + b, 0));
  const heads = o.head.map((h, i) => layout([{ t: clean(h).toUpperCase(), st: 'b' }], cols[i] - (i < n - 1 ? gapX : 0), { size: 7, lh: 1.3, boldColor: C.g700 }));
  const headH = Math.max(...heads.map(heightOf));
  const head = () => {
    heads.forEach((L, i) => drawLines(L, xs[i], y + 2));
    y += headH + 6; doc.moveTo(X0, y).lineTo(X0 + W, y).lineWidth(0.9).stroke(C.black);
  };
  ensure(headH + 30); head();
  o.rows.forEach((row) => {
    const Ls = row.map((c, i) => layout(c, cols[i] - (i < n - 1 ? gapX : 0), { size: 8.5 }));
    const h = Math.max(...Ls.map(heightOf)) + 2 * mm(1.7);
    if (y + h > BOTTOM + 0.5) { newPage(); head(); }
    Ls.forEach((L, i) => drawLines(L, xs[i], y + mm(1.7)));
    y += h; doc.moveTo(X0, y).lineTo(X0 + W, y).lineWidth(0.75).stroke(C.g100);
  });
}
function flow(o) {
  const nodes = (o.nodes || []).slice(0, 5); if (!nodes.length) return;
  const aw = mm(7), nw = (W - aw * (nodes.length - 1)) / nodes.length, pad = 8.5;
  const parts = nodes.map((nd) => ({
    name: layout([{ t: clean(nd.name || ''), st: 'b' }], nw - 2 * pad, { size: 8, lh: 1.35 }),
    detail: nd.detail ? layout([{ t: clean(nd.detail), st: 'r' }], nw - 2 * pad, { size: 7.5, lh: 1.35, color: C.g500 }) : null,
    lbl: layout([{ t: clean(nd.label || '').toUpperCase(), st: 'b' }], nw - 2 * pad, { size: 6.5, lh: 1.35 }),
  }));
  const h = Math.max(...parts.map((p) => heightOf(p.lbl) + 3 + heightOf(p.name) + (p.detail ? heightOf(p.detail) + 1 : 0))) + 2 * pad;
  const capL = o.caption ? layout(o.caption, W, { size: 7.5, color: C.g500 }) : null;
  gap(mm(4)); ensure(h + (capL ? heightOf(capL) + 4 : 0));
  nodes.forEach((nd, i) => {
    const x = X0 + i * (nw + aw), p = parts[i];
    doc.roundedRect(x, y, nw, h, 3).lineWidth(nd.hit ? 0.9 : 0.75).stroke(nd.hit ? C.accent : C.g200);
    p.lbl.color = nd.hit ? C.accentText : C.g500; p.lbl.lines.forEach((l) => l.forEach((it) => { it.color = p.lbl.color; }));
    let yy = drawLines(p.lbl, x + pad, y + pad) + 3;
    yy = drawLines(p.name, x + pad, yy);
    if (p.detail) drawLines(p.detail, x + pad, yy + 1);
    if (i < nodes.length - 1) arrow(x + nw + 5, y + h / 2, x + nw + aw - 5);
  });
  y += h;
  if (capL) { y += 4; drawLines(capL, X0, y); y += heightOf(capL); }
  gap(mm(3));
}
function blocks(list) {
  let first = true;
  for (const b of list || []) {
    if (b.p != null) { if (!first) gap(mm(2.5)); para(b.p); }
    else if (b.h != null) subhead(b.h);
    else if (b.steps) steps(b.steps);
    else if (b.list) { if (!first) gap(mm(2)); bullets(b.list); }
    else if (b.callout) callout(b.callout);
    else if (b.note != null) note(b.note);
    else if (b.table) { if (!first) gap(mm(1)); table(b.table); }
    else if (b.flow) flow(b.flow);
    else if (b.kv) kv(b.kv);
    first = false;
  }
}

/* ---------- evidencia ---------- */
function tagChip(kind, x, yy) {
  const names = { antes: 'Antes', despues: 'Después', validacion: 'Validación' };
  const t = clean(names[kind] || kind).toUpperCase(), w = width(t, F.b, 6.5, 0.7) + 11.5;
  doc.roundedRect(x, yy, w, 12, 1.5).fill(kind === 'antes' ? C.g100 : C.accent);
  draw(t, x + 5.7, yy + 3.2, F.b, 6.5, kind === 'antes' ? C.g700 : C.black, 0.7);
}
function loadImage(file) {
  if (!file) return null;
  const p = path.isAbsolute(file) ? file : path.join(BASE, file);
  try { const buf = fs.readFileSync(p); const img = doc.openImage(buf); return { img, w: img.width, h: img.height }; }
  catch (e) { warnings.push('No se pudo cargar la imagen ' + file + ': ' + e.message); return null; }
}
function figureBox(fg, w, maxH, emptyH) {
  const cap = layout([{ t: 'Figura ' + fg.n + '. ', st: 'b' }].concat(parseInline(fg.caption || '')), w, { size: 7.5, lh: 1.4, color: C.g700 });
  let ih = emptyH, iw = w;
  if (fg.image) { const s = Math.min(w / fg.image.w, maxH / fg.image.h); iw = fg.image.w * s; ih = fg.image.h * s; }
  return { cap, ih, iw, h: 12 + 4.2 + ih + 4.2 + heightOf(cap) };
}
function drawFigure(fg, box, x, w) {
  tagChip(fg.kind, x, y);
  const fy = y + 12 + 4.2;
  if (fg.image) {
    doc.image(fg.image.img, x + (w - box.iw) / 2, fy, { width: box.iw, height: box.ih });
    doc.roundedRect(x, fy, w, box.ih, 3).lineWidth(0.75).stroke(C.g200);
  } else {
    doc.roundedRect(x, fy, w, box.ih, 3).fill(C.g100);
    doc.roundedRect(x, fy, w, box.ih, 3).lineWidth(0.75).dash(3, { space: 2.5 }).stroke(C.g500).undash();
    const L = layout(fg.expect || 'Captura pendiente', w - 30, { size: 8, color: C.g500 });
    let yy = fy + (box.ih - heightOf(L)) / 2;
    L.lines.forEach((line) => {
      const lw = line.reduce((a, it) => a + it.w, 0);
      drawLines({ lines: [line], lh: L.lh, size: L.size, color: L.color }, x + (w - lw) / 2, yy); yy += L.lh;
    });
  }
  drawLines(box.cap, x, fy + box.ih + 4.2);
}
function evidence(ev) {
  const figs = (ev.figures || []).map((f, i) => ({ kind: f.kind || 'validacion', caption: f.caption, expect: f.expect, n: i + 1, image: loadImage(f.file) }));
  if (ev.environment !== undefined || ev.version !== undefined || ev.validatedOn !== undefined || figs.length) {
    let cx = X0;
    [['Ambiente', ev.environment], ['Versión publicada', ev.version], ['Fecha de validación', ev.validatedOn]].forEach(([k, v]) => {
      draw(k + ':', cx, y, F.r, 8, C.g500); cx += width(k + ': ', F.r, 8);
      const val = clean(v || '—'); draw(val, cx, y, F.b, 8, C.black); cx += width(val, F.b, 8) + mm(6);
    });
    y += 8 * 1.5 + mm(4);
  }
  blocks(ev.text);
  if (ev.text && ev.text.length && figs.length) gap(mm(4));
  const colW = (W - mm(5)) / 2;
  for (let i = 0; i < figs.length; i++) {
    const a = figs[i], b = figs[i + 1];
    if (a.kind === 'antes' && b && b.kind === 'despues') {
      const ba = figureBox(a, colW, mm(62), mm(62)), bb = figureBox(b, colW, mm(62), mm(62));
      const h = Math.max(ba.h, bb.h); ensure(h);
      drawFigure(a, ba, X0, colW); drawFigure(b, bb, X0 + colW + mm(5), colW);
      y += h + mm(6); i++;
    } else {
      const bx = figureBox(a, W, mm(110), mm(75)); ensure(bx.h);
      drawFigure(a, bx, X0, W); y += bx.h + mm(6);
    }
  }
  if (figs.length) y -= mm(6);
}
function statusRow(text, badge, soft) {
  const pad = 11, bw = width(clean(badge), F.b, 7.5) + 13.6;
  const L = layout(text, W - 3 - 2 * pad - bw - mm(6), { size: 8.5, color: C.g700 });
  const h = Math.max(heightOf(L), 14.5) + 2 * mm(3.5);
  ensure(h);
  doc.rect(X0, y, W, h).lineWidth(0.75).stroke(C.g200);
  doc.rect(X0, y, 3, h).fill(C.accent);
  drawLines(L, X0 + 3 + pad, y + (h - heightOf(L)) / 2);
  pill(badge, X0 + W - pad, y + (h - 14.5) / 2, soft ? 'soft' : 'dark');
  y += h;
}

/* ---------- documentos ---------- */
const warnings = [];
function finding() {
  const st = STATES[D.state];
  newPage();
  cover({
    eyebrow: 'Documento de atención de hallazgo · AI Mentor', label: st.label,
    parts: D.parent ? [D.parent, D.objectName] : [D.objectName],
    cards: [
      { k: 'Categoría', v: D.category, pill: 'line' },
      { k: 'Patrón', v: D.pattern, small: true },
      { k: 'Fecha de análisis', v: D.analysisDate },
      { k: 'Estado', v: st.badge, pill: st.soft ? 'soft' : 'dark' },
    ],
  });
  y -= mm(6) - mm(2);
  section(1, 'Identificación del hallazgo');
  kv([['App', D.app], ['Módulo', '`' + D.module + '`'],
    ['Objeto', [{ t: clean(D.objectName), st: 'code' }].concat(D.objectType ? [{ t: '  ' + clean(D.objectType), st: 'muted' }] : [])],
    ['Ruta del objeto', D.path || []]]);
  section(2, 'Módulo afectado'); blocks(D.affected);
  section(3, 'Causa identificada'); blocks(D.cause);
  section(4, st.s4); blocks(D.solution);
  const ev = D.evidence || {};
  section(5, 'Evidencia de corrección', (ev.figures || []).length ? mm(62) + 70 : 0);
  if (!(ev.figures || []).length && !(ev.text || []).length) {
    para(D.state === 'draft' ? 'Pendiente. Se adjunta al cerrar la atención.' : 'Este estado no requiere capturas.', { color: C.g500 });
  } else evidence(ev);
  const fin = D.final || {};
  const rows6 = [['Estado final', st.badge]].concat(['closedOn', 'verified', 'justification', 'approvedBy', 'fixChange'].filter((k) => fin[k]).map((k) => [k, fin[k]]));
  section(6, 'Estado final de la atención', D.state === 'draft' ? 40 : 40 + mm(3) + kvHeight(rows6));
  if (D.state === 'draft') statusRow('Se actualiza al cerrar la atención con la evidencia adjunta.', st.badge, true);
  else {
    statusRow(fin.note || (D.state === 'fixed' || D.state === 'already-fixed' ? 'Atención cerrada con la evidencia adjunta.' : 'Atención cerrada.'), st.badge, false);
    const rows = [['Estado final', st.badge]];
    if (fin.closedOn) rows.push(['Fecha de cierre', fin.closedOn]);
    if (fin.verified) rows.push(['Qué se verificó', fin.verified]);
    if (fin.justification) rows.push(['Justificación', fin.justification]);
    if (fin.approvedBy) rows.push(['Aprobó', fin.approvedBy]);
    if (fin.fixChange) rows.push(['Cambio de /am:fix', fin.fixChange]);
    gap(mm(3)); kv(rows, true);
  }
  return { left: 'AI Mentor · Atención de hallazgo', right: D.app };
}
function summary() {
  newPage();
  cover({ eyebrow: 'Resumen de avance · AI Mentor', label: 'CORTE ' + (D.cutoff || ''), parts: ['Resumen de avance'],
    cards: (D.cards || []).slice(0, 4).map((c) => ({ k: c.k, v: c.v, small: String(c.v).length > 14 })) });
  y -= mm(6) - mm(2);
  (D.sections || []).forEach((s, i) => { section(i + 1, s.title); blocks(s.blocks); });
  return { left: 'AI Mentor · Resumen de avance', right: D.period || '' };
}

process.on('uncaughtException', (e) => {
  console.error('Error inesperado al generar el PDF: ' + (e && e.message ? e.message : e));
  process.exit(4);
});
const hf = D.type === 'summary' ? summary() : finding();
const range = doc.bufferedPageRange();
for (let i = 0; i < range.count; i++) {
  doc.switchToPage(range.start + i);
  const hy = PAGE.top - mm(4) - 7.5;
  draw(clean(hf.left).toUpperCase(), X0, hy, F.r, 7.5, C.g500, 0.3);
  const r = clean(hf.right || ''); draw(r, X0 + W - width(r, F.b, 7.5), hy, F.b, 7.5, C.black);
  const fy = BOTTOM + mm(4);
  draw('Confidencial — uso interno', X0, fy, F.r, 7.5, C.g500);
  const pg = 'Página ' + (i + 1) + ' de ' + range.count; draw(pg, X0 + W - width(pg, F.r, 7.5), fy, F.r, 7.5, C.g700);
}
doc.on('end', () => {
  try { fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true }); fs.writeFileSync(outPath, Buffer.concat(chunks)); }
  catch (e) { console.error('No se pudo escribir ' + outPath + ': ' + e.message + ' (¿está abierto en un visor?)'); process.exit(1); }
  warnings.forEach((w) => console.error('AVISO: ' + w));
  console.log(JSON.stringify({ ok: true, pdf: path.resolve(outPath), pages: range.count, warnings: warnings.length }));
  process.exit(warnings.length ? 3 : 0);
});
doc.end();

import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost:5173/',
  pretendToBeVisual: true,
});

globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
  writable: true,
});
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.HTMLInputElement = dom.window.HTMLInputElement;
globalThis.Element = dom.window.Element;
globalThis.Node = dom.window.Node;
globalThis.MouseEvent = dom.window.MouseEvent;
globalThis.Event = dom.window.Event;
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);

// jsdom has no layout engine, so scrollIntoView is absent.
dom.window.Element.prototype.scrollIntoView = function () {};

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const { run } = await import('./dist/entry.js');

let results;
try {
  results = run();
} catch (err) {
  console.error('\n  HARNESS THREW:', err && err.stack ? err.stack : err);
  process.exit(1);
}

let failed = 0;
for (const r of results) {
  if (!r.ok) failed++;
  const mark = r.ok ? 'PASS' : 'FAIL';
  console.log(`  ${mark}  ${r.name}${r.ok || !r.detail ? '' : `  [got: ${r.detail}]`}`);
}

console.log(`\n  ${results.length - failed}/${results.length} checks passed`);
process.exit(failed === 0 ? 0 : 1);

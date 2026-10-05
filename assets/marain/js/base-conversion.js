(function () {
'use strict';

function d2m(n) {
  n = BigInt(n);
  if (n < 0n) throw new RangeError('Use a nonnegative whole number.');
  const tmp = [];
  do { tmp.push(Number(n % 9n)); n /= 9n; } while (n > 0n);
  return Uint8Array.from(tmp.reverse());
}
function m2d(digits) {
  let n = 0n;
  for (const d of digits) {
    if (!Number.isInteger(d) || d < 0 || d > 8) throw new RangeError('Invalid base-9 digit.');
    n = n * 9n + BigInt(d);
  }
  return n;
}
function decimalToMarain(value) {
  return Array.from(d2m(value), d => d === 0 ? '9' : String(d)).join('');
}
function marainToDecimal(value) {
  return m2d(Array.from(value, c => c === '9' || c === '0' ? 0 : Number(c))).toString();
}

if (typeof module === 'object' && module.exports) { module.exports = { d2m, m2d, decimalToMarain, marainToDecimal }; return; }
function init() {
if (!document.getElementById('base-conversion')) return;
  const decimal = document.getElementById('decimal-number');
  const marain = document.getElementById('marain-number');
  const keys = document.getElementById('marain-keys');
  const error = document.getElementById('base-error');
  function update(source, target, convert) {
    error.textContent = '';
    decimal.removeAttribute('aria-invalid'); marain.removeAttribute('aria-invalid');
    if (source === marain) {
      const start = source.selectionStart, end = source.selectionEnd;
      source.value = source.value.replace(/0/g, '9');
      source.setSelectionRange(start, end);
    }
    const value = source.value;
    if (value === '') { target.value = ''; keys.textContent = ''; return; }
    if (!/^[0-9]+$/.test(value)) {
      source.setAttribute('aria-invalid', 'true');
      error.textContent = 'Enter digits only (a nonnegative whole number).';
      target.value = ''; keys.textContent = ''; return;
    }
    target.value = convert(value);
    keys.textContent = marain.value.replace(/9/g, '0');
  }
  decimal.addEventListener('input', () => update(decimal, marain, decimalToMarain));
  marain.addEventListener('input', () => update(marain, decimal, marainToDecimal));

}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

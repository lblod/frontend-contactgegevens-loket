const NR_WITH_COUNTRY = /^(?:\+|00)(\d\d)(\d{8,9})$/;
const NR_WITHOUT_COUNTY = /^0(\d{8,9})$/;
const SHORT_NR = /^\d{4}$/;
const FREE_NR = /^0800(\d{4,9})$/;
const TEL_PREFIX = /^tel\:/;

/**
 *
 * @param {string} digits
 */
export function formatSeriesDigitsFree(digits) {
  if (digits.length < 4) throw new Error('Stopping because of less numbers then 4');
  const even = digits.length % 2 === 0;
  let input = digits;
  const output = [];
  // Takes bites of 2
  while (input.length > 3) {
    output.push(input.slice(0, 2));
    input = input.slice(2);
  }
  // Take last bite of 2 or 3
  if (even) {
    output.push(input.slice(0, 2));
    input = input.slice(2);
  } else {
    output.push(input.slice(0, 3));
    input = input.slice(3);
  }
  return output.join(' ');
}

/**
 *
 * @param {string} digits
 */
export function formatSeriesDigitsNormal(digits) {
  if (digits.length < 4)
    throw new Error('Stopping because of less numbers then 4');
  const even = digits.length % 2 === 0;
  let input = digits;
  const output = [];
  // Take first bite of 3 or 2
  if (even) {
    output.push(input.slice(0, 2));
    input = input.slice(2);
  } else {
    output.push(input.slice(0, 3));
    input = input.slice(3);
  }
  // Takes bites of 2
  while (input.length > 0) {
    output.push(input.slice(0, 2));
    input = input.slice(2);
  }
  return output.join(' ');
}

export default function formatTel(...args) {
  if (args.length !== 1) throw new Error('Exactly 1 parameter expected');

  const input = args[0];

  // If input is empty, return an empty string
  if (input === '') return '';

  if (typeof input !== 'string') throw new Error('Parameter must be a string');

  const stripped = input.replace(/[\s\t\n]+/g, '').replace(/[^\d+]/g, '');
  if (SHORT_NR.test(stripped)) return stripped;
  if (FREE_NR.test(stripped)) {
    const match = stripped.match(FREE_NR);
    const rest = match[1];
    return `0800 ${formatSeriesDigitsFree(rest)}`;
  }
  const { country, rest } = (() => {
    const match1 = stripped.match(NR_WITH_COUNTRY);
    if (match1) {
      return {
        country: match1[1],
        rest: match1[2],
      };
    }
    const match2 = stripped.match(NR_WITHOUT_COUNTY);
    if (match2) {
      return {
        country: '32',
        rest: match2[1],
      };
    }
    throw new Error('Could not match any telnr regex.');
  })();
  return `+${country} ${formatSeriesDigitsNormal(rest)}`;
}

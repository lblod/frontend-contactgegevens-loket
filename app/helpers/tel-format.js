import { helper } from '@ember/component/helper';

export default helper(function telFormat([tel]) {
  if (!tel) throw new Error('Tel format helper requires one parameter');

  if (typeof tel !== 'string')
    throw new Error('Tel format helper expects a string as a parameter.');

  let formattedTel = '';

  // Remove 'tel:' if present
  if (tel.includes('tel:')) {
    tel = tel.split(':')[1];
  }
  console.log('before', tel);

  // Remove all non-numeric characters
  tel = tel.replace(/[^\d+]/g, '');
  console.log('tel:', tel);
  // Format according to specifications
  if (tel.startsWith('0800')) {
    // Special case: 0800 numbers
    formattedTel += '0800 ';
    tel = tel.slice(4);
  } else {
    // Normal numbers
    if (tel.startsWith('00')) {
      formattedTel += '+';
      tel = tel.slice(2);
    } else if (tel.startsWith('+')) {
      formattedTel += '+';
      tel = tel.slice(1);
    }

    if (tel.length >= 2) {
      formattedTel += tel.slice(0, 2) + ' ';
      tel = tel.slice(2);
    }

    if (tel.length === 4) {
      formattedTel += tel;
      return formattedTel;
    }

    if (tel.length % 2 !== 0) {
      formattedTel += tel.slice(0, 3) + ' ';
      tel = tel.slice(3);
    }

    while (tel.length > 2) {
      formattedTel += tel.slice(0, 2) + ' ';
      tel = tel.slice(2);
    }
  }

  formattedTel += tel;

  return formattedTel.trim();
});

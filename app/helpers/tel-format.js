import { helper } from '@ember/component/helper';

export default helper(function telFormat([tel]) {
  if (!tel) throw new Error('Tel format helper requires one parameter');

  if (typeof tel !== 'string')
    throw new Error('Tel format helper expects a string as a parameter.');

  if (tel.includes('tel:')) {
    tel = tel.split(':')[1];
  }
  return tel;
});

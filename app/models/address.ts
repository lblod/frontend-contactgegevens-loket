import Model, { attr, belongsTo } from '@ember-data/model';
interface Adress {
  street: string;
  number: string;
  boxNumber: string;
  postcode: string;
  municipality: string;
  country: string;
}
export default class AddressModel extends Model {
  @attr declare number: string;
  @attr declare boxNumber: string;
  @attr declare street: string;
  @attr declare postcode: string;
  @attr declare municipality: string;
  @attr declare province: string;
  @attr declare addressRegisterUri: string;
  @attr declare country: string;;
  @attr declare fullAddress: string;

  @belongsTo('concept', {
    inverse: null,
    async: true,
  })
  source: any;
}

export function combineFullAddress(address: Adress) {
  let fullAddress = [];

  const fullStreet = `${address.street || ''} ${address.number || ''} ${
    address.boxNumber || ''
  }`.trim();

  if (fullStreet) fullAddress.push(fullStreet);

  const municipalityInformation = `
    ${address.postcode || ''} ${address.municipality || ''}
  `.trim();

  if (municipalityInformation) fullAddress.push(municipalityInformation);

  const countryInformation = `${address.country || ''}`;

  if (countryInformation) fullAddress.push(countryInformation);

  if (fullAddress.length) {
    return fullAddress.join(', ');
  } else {
    return null;
  }
}

export function createAddress(store: any) {
  let record = store.createRecord('address');
  return record;
}

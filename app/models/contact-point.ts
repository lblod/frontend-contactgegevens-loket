import Model, { attr, belongsTo } from '@ember-data/model';
import type AddressModel from '../models/address';

export const CONTACT_TYPE = {
  PRIMARY: 'Primary',
  SECONDARY: 'Secondary',
};

export default class ContactPointModel extends Model {
  @attr declare email: string;
  @attr declare telephone: string;
  @attr declare fax: string;
  @attr declare website: string;
  @attr declare type: string;

  @belongsTo('address', {
    inverse: null,
    async: true,
  })
  contactAddress: AddressModel | undefined;
}

export function createPrimaryContact(store: any) {
  let record = store.createRecord('contact-point');
  record.type = CONTACT_TYPE.PRIMARY; // Workaround for: https://github.com/emberjs/ember-inspector/issues/1898

  return record;
}

export function createSecondaryContact(store: any) {
  let record = store.createRecord('contact-point');
  record.type = CONTACT_TYPE.SECONDARY; // Workaround for: https://github.com/emberjs/ember-inspector/issues/1898

  return record;
}

export function findPrimaryContact(contactList) {
  return contactList.find((contact) => contact.type === CONTACT_TYPE.PRIMARY);
}

export function findSecondaryContact(contactList) {
  return contactList.find((contact) => contact.type === CONTACT_TYPE.SECONDARY);
}

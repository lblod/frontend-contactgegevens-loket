import Model, { hasMany, belongsTo } from '@ember-data/model';
import type AddressModel from '../models/address';
import type ContactPointModel from '../models/contact-point';
import type SiteTypeModel from '../models/site-type';
import EmberArray from '@ember/array';
export default class SiteModel extends Model {
  @belongsTo('address', {
    inverse: null,
    async: true,
  })
  address: AddressModel | undefined;

  @hasMany('contact-point', {
    inverse: null,
    async: true,
  })
  contacts: EmberArray<ContactPointModel> | undefined;

  @belongsTo('site-type', {
    inverse: null,
    async: true,
  })
  siteType: SiteTypeModel | undefined;
}

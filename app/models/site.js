import Model, { hasMany, belongsTo } from '@ember-data/model';

export default class SiteModel extends Model {
  @belongsTo('address', {
    inverse: null,
    async: true,
  })
  address;

  @hasMany('contact-point', {
    inverse: null,
    async: true,
  })
  contacts;

  @belongsTo('site-type', {
    inverse: null,
    async: true,
  })
  siteType;

  // Maybe await and get primary site if not loaded?
  isPrimaryOf(adminUnit) {
    if (!adminUnit.primarySite)
      throw new Error('Admin unit primary site not loaded.');
    return this.id === adminUnit.primarySite.id;
  }
}

import Model, { hasMany, belongsTo, attr } from '@ember-data/model';

export default class SiteModel extends Model {
  @attr('date') modified;
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

  @belongsTo('organization', {
    inverse: 'sites',
    async: true,
  })
  organization;

  @belongsTo('administrative-unit', {
    inverse: null,
    async: true,
  })
  modifiedBy;

  @attr siteTypeName;

  // Maybe await and get primary site if not loaded?
  isPrimaryOf(adminUnit) {
    if (!adminUnit.primarySite)
      throw new Error('Admin unit primary site not loaded.');
    return this.id === adminUnit.primarySite.id;
  }
  get isOtherSite() {
    return (
      this.siteType &&
      this.siteType.get('id') === 'dcc01338-842c-4fbd-ba68-3ca6f3af975c'
    );
  }
}
export const SITE_CODE = {
  MAATSCHAPPELIJKE_ZETEL: 'f1381723dec42c0b6ba6492e41d6f5dd',
  HOOFDGEBOUW_EREDIENSTEN: 'dd0418307e7038c0c3809e3ec03a0932',
  GEMEENTEHUIS: '57e8e5498ca84056b8a87631a26c90af',
  ANDER_ADMINISTRATIEF_ADRES: 'fbec5e94aba343b0a7361aca8a0c7d79',
  CORRESPODENTIE_ADDRESS: 'dcc01338-842c-4fbd-ba68-3ca6f3af975c',
  PROVINCIEHUIS: '15f2683c61b74541b27b64b4365806c7',
  DISTRICTHUIS: 'db13a289b78e42d19d8d1d269b61b18f',
  HOOFDCOMMISARIAAT: '0ed15289-1f3d-4172-8c46-0506de5aa2a3',
};

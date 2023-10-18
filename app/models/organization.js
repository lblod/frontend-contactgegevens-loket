import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class OrganizationModel extends Model {
  @attr name;
  @attr alternativeName;
  @attr('date') expectedEndDate;
  @attr purpose;
  @attr('boolean', { defaultValue: false }) isCity;

  @belongsTo('site', {
    inverse: null,
    async: true,
  })
  primarySite;

  @belongsTo('organization-status-code', {
    inverse: null,
    async: true,
  })
  organizationStatus;

  @hasMany('identifier', {
    inverse: null,
    async: true,
  })
  identifiers;

  @hasMany('site', {
    inverse: null,
    async: true,
  })
  sites;

  @hasMany('organization', {
    inverse: 'isSubOrganizationOf',
    async: true,
  })
  subOrganizations;

  @belongsTo('organization', {
    inverse: 'subOrganizations',
    async: true,
  })
  isSubOrganizationOf;
}

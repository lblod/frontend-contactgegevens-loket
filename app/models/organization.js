import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class OrganizationModel extends Model {
  @attr name;
  @attr legalName;
  @attr alternativeName;
  @attr('date') expectedEndDate;
  @attr purpose;
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

  @hasMany('change-event', {
    inverse: 'originalOrganizations',
    async: true,
    as: 'organization',
    polymorphic: false,
  })
  changedBy;

  @hasMany('change-event', {
    inverse: 'resultingOrganizations',
    async: true,
    polymorphic: false,
    as: 'organization',
  })
  resultedFrom;

  get abbName() {
    return this.legalName ?? this.name;
  }

  setAbbName(name) {
    this.name = name;
    this.legalName = name;
  }

  setAlternativeName(names) {
    this.alternativeName = names
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '');
  }
}

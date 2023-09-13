import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
import type IdentifierModel from '../models/identifier';
import type OrganizationStatusCodeModel from '../models/organization-status-code';
import type SiteModel from '../models/site';
import EmberArray from '@ember/array';
export default class OrganizationModel extends Model {
  @attr declare name: string;
  @attr declare alternativeName: string;
  @attr('date') declare expectedEndDate: Date;
  @attr declare purpose: string;

  @belongsTo('site', {
    inverse: null,
    async: true,
  })
  primarySite: SiteModel | undefined;

  @belongsTo('organization-status-code', {
    inverse: null,
    async: true,
  })
  organizationStatus: OrganizationStatusCodeModel | undefined;

  @hasMany('identifier', {
    inverse: null,
    async: true,
  })
  identifiers: EmberArray<IdentifierModel> | undefined;

  @hasMany('site', {
    inverse: null,
    async: true,
  })
  sites: EmberArray<SiteModel> | undefined;
}

import Model, { attr } from '@ember-data/model';

export const ORGANIZATION_STATUS = {
  ACTIVE: '63cc561de9188d64ba5840a42ae8f0d6',
  INACTIVE: 'd02c4e12bf88d2fdf5123b07f29c9311',
  IN_FORMATION: 'abf4fee82019f88cf122f986830621ab',
};

export const ORGANIZATION_LABELS = {
  ACTIVE: 'Actief',
  INACTIVE: 'Niet actief',
  IN_FORMATION: 'In oprichting',
};

export default class OrganizationStatusCodeModel extends Model {
  @attr label;
}

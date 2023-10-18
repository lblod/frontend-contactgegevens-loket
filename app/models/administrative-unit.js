import { belongsTo } from '@ember-data/model';
import OrganizationModel from './organization';

export default class AdministrativeUnitModel extends OrganizationModel {
  @belongsTo('administrative-unit-classification-code', {
    inverse: null,
    async: true,
  })
  classification;

  @belongsTo('location', { async: true, inverse: null })
  scope;

  @belongsTo('location', { async: true, inverse: null })
  locatedWithin;
}

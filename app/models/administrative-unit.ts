import { belongsTo } from '@ember-data/model';
import type OrganizationModel from './organization';
import type AdministrativeUnitClassificationCodeModel from '../models/administrative-unit-classification-code';

export default class AdministrativeUnitModel extends OrganizationModel {
  @belongsTo('administrative-unit-classification-code', {
    inverse: null,
    async: true,
  })
  declare classification: AdministrativeUnitClassificationCodeModel;
}

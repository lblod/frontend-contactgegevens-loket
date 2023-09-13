import Model, { attr, hasMany } from '@ember-data/model';
import type AccountModel from '../models/account';
import type AdministrativeUnitModel from '../models/administrative-unit';
import EmberArray from '@ember/array';

export default class UserModel extends Model {
  @attr declare firstName: string;
  @attr declare familyName: string;
  @hasMany('account', { inverse: null, async: true }) account:
    | EmberArray<AccountModel>
    | undefined;
  @hasMany('administrative-unit', { inverse: null, async: true })
  declare groups: EmberArray<AdministrativeUnitModel> | undefined;

  get group(): AdministrativeUnitModel | undefined {
    if (!this.groups) return undefined;
    return this.groups.firstObject;
  }

  // used for mock login
  get fullName() {
    return `${this.firstName} ${this.familyName}`.trim();
  }
}

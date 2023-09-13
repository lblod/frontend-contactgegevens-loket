import Model, { attr, belongsTo } from '@ember-data/model';
import type User from "../models/user"

export default class AccountModel extends Model {
  @attr declare voId: string;
  @attr declare provider: string;
  @belongsTo('user', { inverse: null, async: true }) declare user: User;
}

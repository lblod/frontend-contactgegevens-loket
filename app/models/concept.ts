import Model, { attr } from '@ember-data/model';

export default class ConceptsModel extends Model {
  @attr declare label: string;
  @attr declare altLabel: string;
  @attr declare notation: string;
}

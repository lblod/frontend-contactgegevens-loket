import Model, { attr } from '@ember-data/model';

export default class StructuredIdentifierModel extends Model {
  @attr declare localId: string;
}

import Model, { attr, belongsTo } from '@ember-data/model';
import type StructuredIdentifierModel from '../models/structured-identifier';

export const ID_NAME = {
  KBO: 'KBO nummer',
  SHAREPOINT: 'SharePoint identificator',
  SSN: 'Rijksregisternummer',
  NIS: 'NIS code',
  OVO: 'OVO-nummer',
};

export default class IdentifierModel extends Model {
  @attr declare idName: string;

  @belongsTo('structured-identifier', {
    inverse: null,
    async: true,
  })
  structuredIdentifier: StructuredIdentifierModel | undefined;
}

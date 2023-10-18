import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class LocationModel extends Model {
  /** @type { string }*/
  @attr label;
  /** @type { string }*/
  @attr level;

  /** @type { Promise<[AdminUnitModel]> }*/
  @hasMany('administrative-unit', {
    async: true,
    inverse: null,
  })
  administrativeUnits;

  /** @type { Promise<LocationModel> }*/
  @belongsTo('location', { async: true, inverse: null })
  locatedWithin;

  /** @type { Promise<[LocationModel]> }*/
  @hasMany('location', { async: true, inverse: null })
  locations;

  /** @type { Promise<ConceptModel> }*/
  @belongsTo('concept', { async: true, inverse: null })
  exactMatch;
}

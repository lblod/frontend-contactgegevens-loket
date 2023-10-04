import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CountriesService extends Service {
  @service store;
  countryNames = null; // This is the countries cache

  async getCountries() {
    if (this.countryNames) return this.countryNames;
    // const nationalities = await this.store.query('nationality', {
    //   sort: 'country-label',
    //   page: {
    //     size: 200, // There are about 195 countries in the world
    //   },
    // });
    // this.countryNames = nationalities.map(
    //   (nationality) => nationality.countryLabel,
    // );
    this.countryNames = [
      'België',
      'Duitsland',
      'Frankrijk',
      'Nederland',
      'Groot-Brittanië',
      'Luxemburg',
    ];
    return this.countryNames;
  }
}

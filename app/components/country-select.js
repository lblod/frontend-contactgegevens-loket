import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class CountrySelectComponent extends Component {
  @service countriesService;

  // Always get the countries while constructing this component
  constructor(...args) {
    super(...args);
    this.searchCountriesTask.perform();
  }

  /** @type {null|[string]} */
  @tracked
  countryNames = null;

  searchCountriesTask = task(async () => {
    this.countryNames = await this.countriesService.getCountries(); // This service will make a request on first invocation. But after that all country names are cached in the service.
  });
}

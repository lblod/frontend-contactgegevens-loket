import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';

/** @typedef { Pick<import('../au-address-search').Address,"municipality"|"province"|"postalCode"> } PartialAddress */

/**
 * @typedef { 'not-initialized' |'initializing' | 'postalName-first' | 'postalCode-first' | 'province-first' | 'loading' | 'wait-first-input'} State
 */

/**
 * @typedef {('West-Vlaanderen' | 'Oost-Vlaanderen' | 'Antwerpen' | 'Vlaams-Brabant' | 'Limburg')} Province
 */

/**
 * @typedef {Object} PostalNameSuggestion
 * @property {string} postalName - The postal name.
 * @property {string} postalCode - The postal code.
 * @property {Province} province - The province associated with the postal name.
 * @property {boolean} isMunicipality- Indicates if it's a municipality.
 * @property {string} associatedMunicipality - The associated municipality.
 */

/**
 * @typedef {Object} PostalCodeSuggestion
 * @property {string} postalCode - The postal code.
 * @property {Province} province - The province associated with the postal code.
 * @property {Array<{ name: string, isMunicipality: boolean }>} postalNames - An array of postal names associated with the postal code.
 */

/**
 *
 * @param {Record<string,any>} params
 * @returns string
 */
function generateQueryString(params) {
  return Object.keys(params)
    .reduce((acc, key) => {
      if (params[key]) acc.append(key, params[key]);
      return acc;
    }, new URLSearchParams())
    .toString();
}

export default class AuAddressSearchManualControlsBelgiumComponent extends Component {
  initializingTask = task(async () => {
    this.fetchPostalCodesTask.perform({});
    this.fetchPostalNamesTask.perform({});
    this.fetchProvincesTask.perform({});
  });

  constructor(...args) {
    super(...args);
    this.initializingTask.perform();
  }

  /** @type { Partial<Address> } */
  @tracked manualAddressSuggestion = {};

  /** @type { {postalNameSelection: PostalNameSuggestion | null, postalCodeSelection: PostalCodeSuggestion | null, provinceSelection: Province | null} } */
  @tracked selections = {
    postalNameSelection: null,
    postalCodeSelection: null,
    provinceSelection: null,
  };

  fetchPostalNamesTask = task(async ({ postalCode, province }, callback) => {
    const response = await fetch(
      `http://localhost:9300/postal-names?${generateQueryString({
        postalCode,
        province,
      })}`,
    );
    /** @type {PostalNameSuggestion[]} */
    const postalNameSuggestions = await response.json();
    if (callback) callback();
    return postalNameSuggestions;
  });

  get postalNameOptions() {
    return this.fetchPostalNamesTask.last?.value ?? [];
  }

  _restartAllFetches() {
    if (this.completed) return;
    // Restart the other tasks
    const province = this.selections.provinceSelection
      ? this.selections.provinceSelection
      : undefined;
    const postalCode = this.selections.postalCodeSelection
      ? this.selections.postalCodeSelection.postalCode
      : undefined;
    const postalName = this.selections.postalNameSelection
      ? this.selections.postalNameSelection.postalName
      : undefined;
    console.log('Restarting fetches', {
      completed: this.completed,
      province,
      postalCode,
      postalName,
    });
    if (!this.selections.postalCodeSelection)
      this.fetchPostalCodesTask.perform({ province, postalName });
    if (!this.selections.provinceSelection)
      this.fetchProvincesTask.perform({ postalName, postalCode });
    if (!this.selections.postalNameSelection)
      this.fetchPostalNamesTask.perform({ province, postalCode });
  }

  get completed() {
    return Object.values(this.selections).every((item) => item !== null);
  }

  _triggerOnChangeComplete() {
    /** @type { PartialAddress } */
    const newPartialAddress = {
      municipality: this.selections.postalNameSelection.associatedMunicipality,
      postalCode: this.selections.postalCodeSelection.postalCode,
      province: this.selections.provinceSelection,
    };
    this.args.onChange(newPartialAddress);
  }

  _triggerOnChangeClear() {
    /** @type { Partial<PartialAddress> } */
    const newPartialAddress = {
      municipality: undefined,
      postalCode: undefined,
      province: undefined,
    };
    this.args.onChange(newPartialAddress);
  }

  /**
   *
   * @param {PostalNameSuggestion} newSuggestion
   */
  @action handlePostalNameChange(newSuggestion) {
    this.selections.postalNameSelection = newSuggestion;
    this._restartAllFetches();
    if (this.completed) this._triggerOnChangeComplete();
  }

  fetchPostalCodesTask = task(async ({ postalName, province }, callback) => {
    const response = await fetch(
      `http://localhost:9300/postal-codes?${generateQueryString({
        postalName,
        province,
      })}`,
    );
    /** @type {PostalCodeSuggestion[]} */
    const postalCodeSuggestions = await response.json();
    if (callback) callback();
    return postalCodeSuggestions;
  });

  get postalCodeOptions() {
    return this.fetchPostalCodesTask.last?.value ?? [];
  }

  /**
   *
   * @param {PostalCodeSuggestion} newSuggestion
   */
  @action handlePostalCodeChange(newSuggestion) {
    this.selections.postalCodeSelection = newSuggestion;
    this._restartAllFetches();
    if (this.completed) this._triggerOnChangeComplete();
  }

  fetchProvincesTask = task(async ({ postalName, postalCode }, callback) => {
    const response = await fetch(
      `http://localhost:9300/provinces?${generateQueryString({
        postalName,
        postalCode,
      })}`,
    );
    /** @type {Province[]} */
    const provinces = await response.json();
    if (callback) callback();
    return provinces;
  });

  get provinceOptions() {
    return this.fetchProvincesTask.last?.value ?? [];
  }

  /**
   *
   * @param {Province} newSuggestion
   */
  @action handleProvinceChange(newSuggestion) {
    this.selections.provinceSelection = newSuggestion;
    this._restartAllFetches();
    if (this.completed) this._triggerOnChangeComplete();
  }

  get anyLoading() {
    return (
      this.fetchPostalNamesTask.isRunning ||
      this.fetchPostalCodesTask.isRunning ||
      this.fetchProvincesTask.isRunning
    );
  }

  /**
   * Helper function to print postal code suggestions
   * @param {PostalCodeSuggestion} suggestion
   * @returns {string}
   */
  // eslint-disable-next-line no-unused-vars
  printPostalCodeSuggestion(suggestion) {
    const names = suggestion.postalNames
      .map((postalName) => postalName.name)
      .sort();
    return `${suggestion.postalCode} (${names.join(', ')})`;
  }
}

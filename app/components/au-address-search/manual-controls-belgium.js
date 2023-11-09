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
 * Helper function to print postal code suggestions
 * @param {PostalCodeSuggestion} suggestion
 * @returns {string}
 */
// eslint-disable-next-line no-unused-vars
function printPostalCodeSuggestion(suggestion) {
  const names = suggestion.postalNames
    .map((postalName) => postalName.name)
    .sort();
  return `${suggestion.postalCode} (${names.join()})`;
}

export default class AuAddressSearchManualControlsBelgiumComponent extends Component {
  initializingTask = task(async () => {
    this.fetchPostalCodesTask.perform();
    this.fetchPostalNamesTask.perform();
    this.fetchProvincesTask.perform();
  });

  constructor(...args) {
    super(...args);
    this.initializingTask.perform();
  }

  /** @type { State } */
  @tracked state = 'not-initialized';

  /** @type { Partial<Address> } */
  @tracked manualAddressSuggestion = {};

  /** @type { {postalNameSelection: PostalNameSuggestion | null, postalCodeSelection: PostalCodeSuggestion | null, provinceSelection: Province | null} } */
  @tracked selections = {
    postalNameSelection: null,
    postalCodeSelection: null,
    provinceSelection: null,
  };

  @action async stateChange() {
    console.log('Activate statemachine', this.state);
    switch (this.state) {
      case 'initializing':
        // No operation, taken care for during the init task
        break;
      case 'loading':
        // No operation
        break;
      default:
        throw new Error(`Impossible state: ${this.state}`);
    }
  }

  fetchPostalNamesTask = task(async ({ postalCode, province }, callback) => {
    const response = await fetch(
      `/address-search-add-on/postal-names?${new URLSearchParams({
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
      `/address-search-add-on/postal-codes?${new URLSearchParams({
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
      `/address-search-add-on/provinces?${new URLSearchParams({
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
  @action handeProvinceChange(newSuggestion) {
    this.selections.provinceSelection = newSuggestion;
    this._restartAllFetches();
    if (this.completed) this._triggerOnChangeComplete();
  }

  get anyLoading() {
    return (
      this.fetchPostalNamesTask.isRunning ||
      this.fetchPostalCodesTask.isRunning ||
      this.fetchProvincesTask
    );
  }
}

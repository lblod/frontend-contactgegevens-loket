import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';

/**
 * @typedef {Object} Address
 * @property {string} country
 * @property {string} province
 * @property {string} municipality
 * @property {string} postalCode
 * @property {string} street
 * @property {string} houseNumber
 * @property {string | null} boxNumber
 */

/**
 * @typedef {Object} LocationInFlanders
 * @property {string} municipality
 * @property {string} postalCode
 * @property {string} street
 * @property {string} housenumber
 */

/**
 * @typedef {'manual'|'automatic'} AddressSearchMode
 */

export default class AuAddressSearchComponent extends Component {
  constructor(...args) {
    super(...args);
    this.fetchCountryTask.perform();
  }

  /** @type {} */
  @tracked serverErrorMessage = undefined;

  /** @type {AddressSearchMode | null} */
  @tracked _mode = null;

  /** @type {AddressSearchMode} */
  get mode() {
    return this._mode ?? this.args.initialMode ?? 'automatic';
  }

  @tracked freeInputChecked = false;

  get freeInputDisplayValue() {
    return this.manualAddressSuggestion?.country !== 'België'
      ? true
      : this.freeInputChecked;
  }

  get freeInputDisabled() {
    return this.manualAddressSuggestion?.country !== 'België';
  }

  @action handleFreeInputChecked(newValue) {
    this.freeInputChecked = newValue;
  }

  /** @type {Address | null} */
  _currentAddress = null;

  /** @type {Address | null} */
  get initialAddress() {
    return this.args.initialAddress ?? null;
  }

  /** @type {Address | null} */
  get currentAddress() {
    return this._currentAddress ?? this.initialAddress;
  }

  /** @type {Boolean} */
  get isAutomatic() {
    return this.mode === 'automatic';
  }
  // This is unfortunate because the AuSwitch component tries to use old fashioned two way data binding
  set isAutomatic(value) {
    this._mode = value ? 'automatic' : 'manual';
  }

  /** @type {Boolean} */
  get automaticAddressOk() {
    return !!this.selectedAddressSuggestion;
  }

  @action
  handleModeSwitchChange(automatic) {
    this._mode = automatic ? 'automatic' : 'manual';
  }

  fuzzySearchTask = task({ restartable: true }, async (query) => {
    await timeout(500); // Debounce

    const response = await fetch(
      `/address-search-add-on/search?query=${encodeURIComponent(query)}`,
    );
    const locationsInflanders = await response.json();
    return locationsInflanders;
  });

  get fuzzySearchOptions() {
    return this.fuzzySearchTask?.lastComplete?.value ?? [];
  }

  /** @type {LocationInFlanders | null} */
  @tracked selectedLocation = null;

  @action handleFuzzySearch(query) {
    this.fuzzySearchTask.perform(query);
  }

  @action handleFuzzySearchChange(selectedLocation) {
    console.log('selectedLocation', selectedLocation);
    this.selectedLocation = selectedLocation;
    if (selectedLocation)
      // When the location is set then we search for verified addresses.
      this.findAddressesFromLocationTask.perform(selectedLocation);
    else {
      // When the loation is unset (dropdown cleared) we unset the addressSuggestions as well
      this.selectedAddressSuggestion = null;
      this.findAddressesFromLocationTask.lastComplete = undefined;
    }
  }

  findAddressesFromLocationTask = task(async (location) => {
    const response = await fetch(
      `/address-search-add-on/verified-addresses?${new URLSearchParams(
        location,
      )}`,
    );
    if (response.status !== 200) {
      // Nuke the component, show error message
    }
    /** @type {Address[]} */
    const addresses = await response.json();
    // The return value will set the boxNumberOptions 'attribute'. But we need to set the value
    const addressToSelect = addresses.find(
      (address) => address.boxNumber === null,
    );
    if (!addressToSelect)
      throw new Error(
        `Backend sent back a list of addresses and none of which has the boxnumber unset. This is normally impossible.`,
      );
    this.selectedAddressSuggestion = addressToSelect;
    return addresses;
  });

  get boxNumberActive() {
    if (!this.selectedLocation) false;
    return (
      this.findAddressesFromLocationTask?.lastComplete?.value?.length ?? false
    );
  }

  get boxNumberOptions() {
    return this.findAddressesFromLocationTask?.lastComplete?.value ?? [];
  }

  /** @type {Address | null} */
  @tracked selectedAddressSuggestion = null;

  @action handleBoxNumberChange(selectedAddressSuggestion) {
    console.log('handleBoxNumberChange', selectedAddressSuggestion);
    if (!selectedAddressSuggestion) {
      console.warn(
        `Handler invoked of box number change with falsy value:${selectedAddressSuggestion}`,
      );
      return;
    }
    this.selectedAddressSuggestion = selectedAddressSuggestion;
  }

  /** @type {Partial<Address>} */
  @tracked manualAddressSuggestion = {};

  get manualAddressComplete() {
    return !Object.values(this.manualAddressSuggestion).some(
      (value) => value === undefined,
    );
  }
  /** @type { (fieldName: keyof<Address>) => ((e:UIEvent)=>void) } */
  handleSimpleManualInputEventChange(fieldName) {
    return function (e) {
      e.preventDefault();
      const newValue = e.target.value ?? undefined;
      this.manualAddressSuggestion = {
        ...this.manualAddressSuggestion,
        [fieldName]: newValue,
      };
    };
  }

  /** @type {'yes' | 'no' } */
  @tracked manualBoxnumberSpecified = 'no';

  @action handleBoxnumberSpecifiedChange(choice) {
    this.manualBoxnumberSpecified = choice;
    if (choice === 'no') {
      this.manualAddressSuggestion = {
        ...this.manualAddressSuggestion,
        boxNumber: null,
      };
    }
  }

  fetchCountryTask = task(async () => {
    const response = await fetch(`/address-search-add-on/countries`);
    const countries = await response.json();
    // Set the manual country as belgium by default
    this.manualAddressSuggestion = {
      ...this.manualAddressSuggestion,
      country: 'België',
    };
    return countries;
  });

  get countryOptions() {
    return this.fetchCountryTask.last?.value;
  }

  @action handleCountryChange(country) {
    if (
      country === 'België' &&
      this.manualAddressSuggestion.country !== 'België'
    ) {
      // When switching from something else to belgium we want to remove everything
      this.manualBoxnumberSpecified = 'no';
      this.manualAddressSuggestion = {
        ...this.manualAddressSuggestion,
        country,
        street: undefined,
        houseNumber: undefined,
        boxNumber: undefined,
        municipality: undefined,
        postalCode: undefined,
        province: undefined,
      };
    }
    this.manualAddressSuggestion = {
      ...this.manualAddressSuggestion,
      country,
    };
  }

  get showBelgiumManualControls() {
    return (
      this.manualAddressSuggestion.country === 'België' &&
      !this.freeInputChecked
    );
  }

  @action handleChangeManualControlsBelgium(newAddressSuggesion) {
    this.manualAddressSuggestion = {
      ...this.manualAddressSuggestion,
      ...newAddressSuggesion,
    };
  }
}

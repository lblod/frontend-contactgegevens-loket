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

const ADDRESS_KEYS = [
  'country',
  'province',
  'municipality',
  'postalCode',
  'street',
  'houseNumber',
  'boxNumber',
];

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

/** @type { (fieldName: keyof<Address>) => ((e:UIEvent)=>void) } */
function handleSimpleManualInputEventChange(fieldName) {
  return function (e) {
    e.preventDefault();
    const newValue = e.target.value ?? undefined;
    this.args.address = {
      ...this.args.address,
      [fieldName]: newValue,
    };
    this._updateParent();
  };
}

/**
 *
 * @param { LocationInFlanders } location
 * @returns { string }
 */
function locationToString(location) {
  return `${location.street} ${location.housenumber}, ${location.postalCode} ${location.municipality}`;
}

export default class AuAddressSearchComponent extends Component {
  constructor(...args) {
    super(...args);
    this.fetchCountryTask.perform();
  }

  get classes() {
    if (this.args.errorMessage) return 'address-search-error-container';
    if (this.args.warningMessage) return 'address-search-warning-container';
    return '';
  }

  get extraMessage() {
    if (this.args.errorMessage) return this.args.errorMessage;
    if (this.args.warningMessage) return this.args.warningMessage;
    return '';
  }

  /**
   * A little helper function to pretty print an address
   * @param { Address } address
   * @returns { string }
   */
  printAddress(address) {
    return address.boxNumber
      ? `${address.street} ${address.houseNumber} (Bus: ${address.boxNumber}), ${address.postalCode} ${address.municipality}`
      : `${address.street} ${address.houseNumber}, ${address.postalCode} ${address.municipality}`;
  }

  /** @type {AddressSearchMode | null} */
  @tracked _mode = null;

  /** @type {AddressSearchMode} */
  get mode() {
    if (
      this.args.initialMode &&
      !(
        this.args.initialMode === 'automatic' ||
        this.args.initialMode === 'manual'
      )
    ) {
      throw new Error(`Illegal initialmode ${this.args.initialMode}`);
    }
    return this._mode ?? this.args.initialMode ?? 'automatic';
  }

  @tracked freeInputChecked = false;

  get freeInputDisplayValue() {
    return this.args.address?.country !== 'België'
      ? true
      : this.freeInputChecked;
  }

  get freeInputDisabled() {
    return this.args.address?.country !== 'België';
  }

  @action handleFreeInputChecked(newValue) {
    this.freeInputChecked = newValue;
  }

  /** @type {Address | null} */
  currentAddress = null;

  /** @type {Boolean} */
  get isAutomatic() {
    return this.mode === 'automatic';
  }

  set isAutomatic(value) {
    this._mode = value ? 'automatic' : 'manual';
  }

  /** @type {Boolean} */
  get addressOk() {
    // If one value is undefined then the address is not OK
    return !Object.values(this.args.address).some(
      (value) => value === undefined,
    );
  }

  _updateParent() {
    this.args.onChange(this.args.address);
  }

  @action
  handleModeSwitchChange(automatic) {
    const oldMode = this.mode;
    const newMode = automatic ? 'automatic' : 'manual';
    this.args.address = {};
    // From auto to manual, TODO: Copy information from auto address to manual controls as the manual control constructs
    // if (oldMode === 'automatic' && newMode === 'manual') {
    // }
    // From manual to auto fill in some things in the fuzzy search
    if (oldMode === 'manual' && newMode === 'automatic') {
      if (this.addressOk) {
        this.fuzzySearchTask.perform(
          locationToString({
            housenumber: this.args.address.houseNumber,
            municipality: this.args.address.municipality,
            postalCode: this.args.address.postalCode,
            street: this.args.address.street,
          }),
          false,
        );
      }
      this.selectedLocation = null;
    }
    this._mode = newMode;
    this._updateParent();
  }

  fuzzySearchTask = task(
    { restartable: true },
    async (query, debounce = true) => {
      if (debounce) await timeout(500);
      const response = await fetch(
        `http://localhost:9300/search?query=${encodeURIComponent(query)}`,
      );
      const locationsInflanders = await response.json();
      return locationsInflanders;
    },
  );

  get fuzzySearchOptions() {
    return this.fuzzySearchTask?.lastComplete?.value ?? [];
  }

  /** @type {LocationInFlanders | null} */
  @tracked selectedLocation = null;

  @action handleFuzzySearch(query) {
    this.fuzzySearchTask.perform(query);
  }

  @action handleFuzzySearchChange(selectedLocation) {
    this.selectedLocation = selectedLocation;
    if (selectedLocation)
      // When the location is set then we search for verified addresses.
      this.findAddressesFromLocationTask.perform(selectedLocation);
    else {
      // When the loation is unset (dropdown cleared) we unset the addressSuggestions as well
      this.args.address = null;
      this._updateParent();
      this.findAddressesFromLocationTask.lastComplete = undefined;
    }
  }

  findAddressesFromLocationTask = task(async (location) => {
    this.args.address = null;
    this._updateParent();
    const response = await fetch(
      `http://localhost:9300/verified-addresses?${new URLSearchParams(
        location,
      )}`,
    );
    if (response.status !== 200) {
      // Nuke the component, show error message
    }
    /** @type {Address[]} */
    const addresses = await response.json();
    if (addresses.length === 1) {
      // Select the first one if there is only one
      this.selectedAddressSuggestion = addresses[0];
      this.args.address = { ...addresses[0] };
      this._updateParent();
    } else {
      // Select the value with no busnumber by default if a value exists with no busnumber and if more then one value is given
      const addressToSelect = addresses.find(
        (address) => address.boxNumber === null,
      );
      if (addressToSelect) {
        this.selectedAddressSuggestion = addressToSelect;
        this.args.address = { ...addressToSelect };
        this._updateParent();
      }
    }
    return addresses;
  });

  get boxNumberActive() {
    if (!this.selectedLocation) false;
    return (
      this.findAddressesFromLocationTask?.lastComplete?.value?.length ?? false
    );
  }

  get addressSuggestionOptions() {
    return this.findAddressesFromLocationTask?.lastComplete?.value ?? [];
  }

  @action handleAddressSuggestionChange(newSuggestion) {
    this.selectedAddressSuggestion = newSuggestion;
    this.args.address = newSuggestion ? { ...newSuggestion } : null;
    this._updateParent();
  }

  get isLoading() {
    return this.findAddressesFromLocationTask.isRunning;
  }

  updateStreet = handleSimpleManualInputEventChange('street').bind(this);
  updateHouseNumber =
    handleSimpleManualInputEventChange('houseNumber').bind(this);
  updateBoxNumber = handleSimpleManualInputEventChange('boxNumber').bind(this);
  updateMunicipality =
    handleSimpleManualInputEventChange('municipality').bind(this);
  updatePostalCode =
    handleSimpleManualInputEventChange('postalCode').bind(this);
  updateProvince = handleSimpleManualInputEventChange('province').bind(this);

  /** @type {'yes' | 'no' } */
  get manualBoxnumberSpecified() {
    return this.args.address.boxNumber !== null ? 'yes' : 'no';
  }

  @action handleBoxnumberSpecifiedChange(choice) {
    if (choice === 'no') {
      this.args.address = {
        ...this.args.address,
        boxNumber: null,
      };
    } else {
      this.args.address = {
        ...this.args.address,
        boxNumber: '',
      };
    }
  }

  fetchCountryTask = task(async () => {
    const response = await fetch(`http://localhost:9300/countries`);
    const countries = await response.json();
    if (!this.args.address?.country) {
      // Set the manual country as belgium by default
      this.args.address = {
        ...this.args.address,
        country: 'België',
      };
    }
    return countries;
  });

  get countryOptions() {
    return this.fetchCountryTask.last?.value ?? [];
  }

  @action handleCountryChange(country) {
    if (country === 'België' && this.args.address.country !== 'België') {
      // When switching from something else to belgium we want to remove everything
      this.manualBoxnumberSpecified = 'no';
      this.args.address = {
        ...this.args.address,
        country,
        street: undefined,
        houseNumber: undefined,
        boxNumber: undefined,
        municipality: undefined,
        postalCode: undefined,
        province: undefined,
      };
    }
    this._updateParent();
  }

  get showBelgiumManualControls() {
    return this.args.address.country === 'België' && !this.freeInputChecked;
  }

  @action handleChangeManualControlsBelgium(newAddressSuggesion) {
    this.args.address = {
      ...this.args.address,
      ...newAddressSuggesion,
    };
    this._updateParent();
  }
}

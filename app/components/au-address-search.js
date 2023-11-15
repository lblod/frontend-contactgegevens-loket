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
    this.manualAddressSuggestion = {
      ...this.manualAddressSuggestion,
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

  get displayMessage() {
    return !!this.extraMessage;
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
  currentAddress = null;

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

  /** @type {Boolean} */
  get manualAddressOk() {
    return (
      this.manualAddressSuggestion.country &&
      this.manualAddressSuggestion.province &&
      this.manualAddressSuggestion.municipality &&
      this.manualAddressSuggestion.street &&
      this.manualAddressSuggestion.houseNumber &&
      this.manualAddressSuggestion.boxNumber !== undefined
    );
  }

  _updateParent() {
    if (this.mode === 'automatic') {
      this.args.onChange(
        this.automaticAddressOk ? this.selectedAddressSuggestion : null,
      );
    } else {
      this.args.onChange(
        this.manualAddressOk ? this.manualAddressSuggestion : null,
      );
    }
  }

  @action
  handleModeSwitchChange(automatic) {
    const oldMode = this.mode;
    const newMode = automatic ? 'automatic' : 'manual';
    console.log('Mode switch', {
      oldMode,
      newMode,
      automaticOk: this.automaticAddressOk,
      manualOk: this.manualAddressOk,
    });
    // From auto to manual, TODO: Copy information from auto address to manual controls as the manual control constructs
    if (oldMode === 'automatic' && newMode === 'manual') {
      this.manualAddressSuggestion = {};
    }
    // From manual to auto fill in some things in the fuzzy search
    if (oldMode === 'manual' && newMode === 'automatic') {
      if (this.manualAddressOk) {
        this.fuzzySearchTask.perform(
          locationToString({
            housenumber: this.manualAddressSuggestion.houseNumber,
            municipality: this.manualAddressSuggestion.municipality,
            postalCode: this.manualAddressSuggestion.postalCode,
            street: this.manualAddressSuggestion.street,
          }),
        );
      } else {
        this.selectedLocation = null;
      }
    }
    this._mode = newMode;
    this._updateParent();
  }

  fuzzySearchTask = task({ restartable: true }, async (query) => {
    await timeout(500); // Debounce

    const response = await fetch(
      `http://localhost:9300/search?query=${encodeURIComponent(query)}`,
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
    this.selectedLocation = selectedLocation;
    if (selectedLocation)
      // When the location is set then we search for verified addresses.
      this.findAddressesFromLocationTask.perform(selectedLocation);
    else {
      // When the loation is unset (dropdown cleared) we unset the addressSuggestions as well
      this.selectedAddressSuggestion = null;
      this._updateParent();
      this.findAddressesFromLocationTask.lastComplete = undefined;
    }
  }

  findAddressesFromLocationTask = task(async (location) => {
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
    // Select the value with no busnumber by default if a value exists with no busnumber
    const addressToSelect = addresses.find(
      (address) => address.boxNumber === null,
    );
    if (addressToSelect) {
      this.selectedAddressSuggestion = addressToSelect;
      this._updateParent();
    }
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
    if (!selectedAddressSuggestion) {
      return;
    }
    this.selectedAddressSuggestion = selectedAddressSuggestion;
    this._updateParent();
  }

  get isLoading() {
    return this.findAddressesFromLocationTask.isRunning;
  }

  /** @type {Partial<Address>} */
  @tracked manualAddressSuggestion = {
    boxNumber: null,
  };

  get manualAddressComplete() {
    return !Object.values(this.manualAddressSuggestion).some(
      (value) => value === undefined,
    );
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
    const response = await fetch(`http://localhost:9300/countries`);
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
    this._updateParent();
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
    this._updateParent();
  }
}

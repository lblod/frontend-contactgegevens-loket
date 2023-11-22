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

/** @type { (fieldName: keyof<Address>) => ((e:UIEvent)=>void) } */
function handleSimpleManualInputEventChange(fieldName) {
  return function (e) {
    e.preventDefault();
    const newValue = e.target.value ?? undefined;
    this.selectedAddress = {
      ...this.selectedAddress,
      [fieldName]: newValue,
    };
  };
}

export default class AuAddressSearchComponent extends Component {
  constructor(...args) {
    super(...args);
    // We use a task here because by the time ember concurrency invokes it the args will be
    // passed to the component. When this constructor runs the ember framework has not yet
    // passed `this.args`
    this._initTask.perform();
  }

  /** Initialse the component with args */
  _initTask = task(async () => {
    if (this.addressOk) {
      // If the passed address is already OK we pre fill the addrress suggestion
      this.selectedAddressSuggestion = this.args.address;
    }
  });

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

  /** @type { Partial<Address> } */
  get selectedAddress() {
    return this.args.address;
  }

  set selectedAddress(value) {
    this.args.onChange(value);
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
    return this.selectedAddress?.country !== 'België'
      ? true
      : this.freeInputChecked;
  }

  get freeInputDisabled() {
    return this.selectedAddress?.country !== 'België';
  }

  @action handleFreeInputChecked(newValue) {
    this.freeInputChecked = newValue;
  }

  /** @type {Boolean} */
  get isAutomatic() {
    return this.mode === 'automatic';
  }

  set isAutomatic(value) {
    this._mode = value ? 'automatic' : 'manual';
  }

  /** @type {Boolean} */
  get addressOk() {
    return (
      this.selectedAddress.country &&
      this.selectedAddress.street &&
      this.selectedAddress.municipality &&
      this.selectedAddress.province &&
      this.selectedAddress.postalCode &&
      this.selectedAddress.houseNumber &&
      this.selectedAddress.boxNumber !== undefined
    );
  }

  @action
  handleModeSwitchChange(automatic) {
    const oldMode = this.mode;
    const newMode = automatic ? 'automatic' : 'manual';
    // this.selectedAddress = {};
    // From auto to manual, TODO: Copy information from auto address to manual controls as the manual control constructs
    if (oldMode === 'automatic' && newMode === 'manual') {
      // Check if the fetchCountriestask has been performed. If not perform it
      if (!this.fetchCountryTask.last) this.fetchCountryTask.perform();
    }
    // From manual to auto fill in some things in the fuzzy search
    if (oldMode === 'manual' && newMode === 'automatic') {
      if (this.addressOk) {
        // this.addressSuggestionOptions = [this.args.address];
        this.selectedAddressSuggestion = this.args.address;
      }
      // In any case clear the location search
      this.selectedLocation = null;
    }
    this._mode = newMode;
  }

  fuzzySearchTask = task(
    { restartable: true },
    async (query, debounce = true) => {
      if (debounce) await timeout(500);
      const response = await fetch(
        `http://localhost:9300/search?query=${encodeURIComponent(query)}`,
      );
      // API error. Nuke the component
      if (response.status !== 200) {
        this.apiError = `Status ${response.status}:\n${(
          await response.text()
        ).slice(0, 1_000)}`;
        return [];
      }
      const locationsInflanders = await response.json();
      return locationsInflanders;
    },
  );

  get fuzzySearchOptions() {
    return this.fuzzySearchTask?.lastComplete?.value ?? [];
  }

  /** @type {LocationInFlanders | null} */
  @tracked selectedLocation = null;

  /** @type {Address | null} */
  @tracked selectedAddressSuggestion = null;

  @action handleFuzzySearch(query) {
    this.fuzzySearchTask.perform(query);
  }

  @action handleFuzzySearchChange(selectedLocation) {
    this.selectedLocation = selectedLocation;
    if (selectedLocation)
      // When the location is set then we search for verified addresses.
      this.findAddressesFromLocationTask.perform(selectedLocation);
    else {
      // When the location is unset (dropdown cleared) we unset the addressSuggestions as well
      // And we clear the selectedaddress
      this.selectedAddressSuggestion = null;
      this.selectedAddress = {};
      this.findAddressesFromLocationTask.lastComplete = undefined;
    }
  }

  findAddressesFromLocationTask = task(async (location) => {
    this.selectedAddress = {};
    const response = await fetch(
      `http://localhost:9300/verified-addresses?${new URLSearchParams(
        location,
      )}`,
    );
    // API error. Nuke the component
    if (response.status !== 200) {
      this.apiError = `Status ${response.status}:\n${(
        await response.text()
      ).slice(0, 1_000)}`;
      return [];
    }
    /** @type {Address[]} */
    const addresses = await response.json();
    if (addresses.length === 1) {
      // Select the first one if there is only one
      this.selectedAddressSuggestion = addresses[0];
      this.selectedAddress = { ...addresses[0] };
    } else {
      // Select the value with no busnumber by default if a value exists with no busnumber and if more then one value is given
      const addressToSelect = addresses.find(
        (address) => address.boxNumber === null,
      );
      if (addressToSelect) {
        this.selectedAddressSuggestion = addressToSelect;
        this.selectedAddress = { ...addressToSelect };
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
    this.selectedAddress = newSuggestion ? { ...newSuggestion } : {};
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
    return this.selectedAddress.boxNumber !== null ? 'yes' : 'no';
  }

  @action handleBoxnumberSpecifiedChange(choice) {
    if (choice === 'no') {
      this.selectedAddress = {
        ...this.selectedAddress,
        boxNumber: null,
      };
    } else {
      this.selectedAddress = {
        ...this.selectedAddress,
        boxNumber: '',
      };
    }
  }

  fetchCountryTask = task(async () => {
    const response = await fetch(`http://localhost:9300/countries`);
    // API error. Nuke the component
    if (response.status !== 200) {
      this.apiError = `Status ${response.status}:\n${(
        await response.text()
      ).slice(0, 1_000)}`;
      return [];
    }
    const countries = await response.json();
    if (!this.selectedAddress?.country) {
      // Set the manual country as belgium by default in case the address is not filled in yet
      this.selectedAddress.country = 'België';
    }
    return countries;
  });

  get countryOptions() {
    return this.fetchCountryTask.last?.value ?? [];
  }

  @action handleCountryChange(country) {
    if (country === 'België' && this.selectedAddress.country !== 'België') {
      // When switching from something else to belgium we want to remove everything
      this.manualBoxnumberSpecified = 'no';
      this.selectedAddress = {
        ...this.selectedAddress,
        country,
        street: undefined,
        houseNumber: undefined,
        boxNumber: undefined,
        municipality: undefined,
        postalCode: undefined,
        province: undefined,
      };
    }
  }

  get showBelgiumManualControls() {
    return this.selectedAddress.country === 'België' && !this.freeInputChecked;
  }

  @action handleChangeManualControlsBelgium(newAddressSuggesion) {
    this.selectedAddress = {
      ...this.selectedAddress,
      ...newAddressSuggesion,
    };
  }

  // In case of API error
  // Empty string means no error
  // Set this string to any value to show an error message instead of the controls
  @tracked apiError = '';

  get apiErrorMailContent() {
    if (!this.apiError) return '';
    let mail = 'support-team-todo@vlaanderen.be';
    let subject = encodeURIComponent('Adres API foutief');
    // The indentation is intentional, otherwise the email would display white space in the front
    // TODO: look for some de-indent solution since we could use it in other places as well
    let message = encodeURIComponent(`\
Beste CLBV team,

Ik heb een boodschap ontvangen van de interface dat de adres API niet beschikbaar is.
Dit was het foutbericht:

${this.apiError}

TODO: Expand this message with more information.

Mvg,

`);
    return `mailto:${mail}?subject=${subject}&body=${message}`;
  }
}

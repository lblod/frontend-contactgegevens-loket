import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { CLASSIFICATION_CODE } from 'frontend-contactgegevens-loket/models/administrative-unit-classification-code';

export default class AddressSearchComponent extends Component {
  @service addressRegister;
  @service store;

  /** @type {boolean} */
  @tracked isAddressSearchMode = true;

  /** @type {null | AddressSuggestion} */
  @tracked selectedAddressSuggestion = null;

  /** @type {[AddressSuggestion]} */
  @tracked addressSuggestionsWithBusNumber = [];

  get disableBusNumberSelect() {
    return this.addressSuggestionsWithBusNumber.length <= 1;
  }

  get isManualInputMode() {
    return !this.isAddressSearchMode;
  }

  constructor() {
    super(...arguments);
    this.detectInitialInputMode();
    // The constructor of the addressRegisterSelector component will construct a full name
  }

  @action
  toggleInputMode() {
    this.isAddressSearchMode = !this.isAddressSearchMode;
    if (this.isAddressSearchMode) {
      // From manual to automatic transition
    } else {
      // From automatic to manual transition
    }
  }

  /**
   * When an address is selected from the address register
   */
  @action
  async handleAddressChange(addressSuggestions) {
    // Reset
    this.selectedAddressSuggestion = null;
    // If we received suggestions
    if (addressSuggestions && addressSuggestions.length) {
      // If we receive more than one suggestion it is assumed we have different bus numbers
      this.addressHasBusNumber = addressSuggestions.length > 1;

      this.addressSuggestionsWithBusNumber = this.addressHasBusNumber
        ? addressSuggestions.toSorted((a, b) =>
            a.busNumber < b.busNumber ?? true ? -1 : 1,
          )
        : [];
      //By default we set the first one as selected
      this.selectedAddressSuggestion = addressSuggestions[0]; // This returns a an object of type AddressSuggestion
      this.updateAddressAttributes(this.selectedAddressSuggestion); // Write the data of the selection to the address model which will populate the manual input controls, except province
      // By definition the suggestion does not have the correct province information. We should get it fresh. But do a sanity check first
      if (!this.selectedAddressSuggestion.municipality) {
        console.warn(
          `Backend address register returned address without municipality: ${this.selectedAddressSuggestion.municipality}`,
        );
        return;
      }
      this.args.address.province = await this.getProvinceFromMunicipality(
        this.selectedAddressSuggestion.municipality,
      );
    }
  }

  async getProvinceFromMunicipality(municipalityName) {
    const result = await this.store.query('administrative-unit', {
      filter: {
        'sub-organizations': {
          ':exact:name': municipalityName,
        },
        classification: {
          id: CLASSIFICATION_CODE.PROVINCE,
        },
      },
    });
    // Sanity check
    if (result.length !== 1)
      throw new Error(
        `Zero or more then one provinces found (${result.length}) for the municipality '${municipalityName}'`,
      );
    return result[0].name;
  }

  @action
  handleBusNumberChange(addressSuggestion) {
    console.log('handleBusNumberChange', addressSuggestion);
    this.args.address.boxNumber = addressSuggestion.busNumber;
  }

  // Unneccasary type check?
  detectInitialInputMode() {
    if (typeof this.args.isSearchEnabledInitially === 'boolean') {
      this.isAddressSearchMode = this.args.isSearchEnabledInitially;
    } else {
      this.isAddressSearchMode = true;
    }
  }

  updateAddressAttributes(addressSuggestion) {
    this.args.address.setProperties({
      street: addressSuggestion.street,
      number: addressSuggestion.housenumber,
      boxNumber: addressSuggestion.busNumber,
      postcode: addressSuggestion.zipCode,
      municipality: addressSuggestion.municipality,
      province: null,
      country: addressSuggestion.country,
      addressRegisterUri: addressSuggestion.uri,
    });
  }
  resetAddressAttributes() {
    this.args.address.setProperties({
      street: null,
      number: null,
      boxNumber: null,
      postcode: null,
      source: null,
      municipality: null,
      province: null,
      country: null,
      addressRegisterUri: null,
    });
  }
}

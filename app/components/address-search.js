import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { CLASSIFICATION_CODE } from 'frontend-contactgegevens-loket/models/administrative-unit-classification-code';
import { task } from 'ember-concurrency';
import { combineFullAddress } from 'frontend-contactgegevens-loket/models/address';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';

export default class AddressSearchComponent extends Component {
  @service addressRegister;
  @service store;

  initComponentAfterArgs = task(async () => {
    if (!this.args.address)
      throw new Error(
        'address search component does not have access to a valid address argument when initializing.',
      );
    const suggestion = addressInstanceToAddressSuggestion(this.args.address);
    return suggestion;
  });

  trackedInitComponentAfterArgs = trackedTask(
    this,
    this.initComponentAfterArgs,
    () => [this.args.address],
  );

  /** @type {boolean} */
  @tracked isAddressSearchMode = true;

  /** @type {null | AddressSuggestion} */
  @tracked selectedAddressSuggestion = this.trackedInitComponentAfterArgs.value;

  /** @type {[AddressSuggestion] | null} */
  @tracked addressSuggestionsWithBusNumber = null; // Null means never loaded

  get hasNoBusNumbers() {
    return (
      this.addressSuggestionsWithBusNumber === null ||
      this.addressSuggestionsWithBusNumber.length === 0
    );
  }

  get busNumberActive() {
    if (!this.addressSuggestionsWithBusNumber.length) return false;
    return this.addressSuggestionsWithBusNumber.every(
      (suggestion) => suggestion.busNumber,
    );
  }

  get isManualInputMode() {
    return !this.isAddressSearchMode;
  }

  constructor() {
    super(...arguments);
    this.detectInitialInputMode();
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
    if (!this.selectedAddressSuggestion) {
      this.selectedAddressSuggestion = this.trackedInitComponentAfterArgs.value;
    }
    const lastBusNumber = this.selectedAddressSuggestion.busNumber;
    this.selectedAddressSuggestion = null;
    this.addressSuggestionsWithBusNumber = [];
    // If we received suggestions, at least one
    if (addressSuggestions && addressSuggestions.length) {
      const justBusNumbers = new Set(
        addressSuggestions.map((suggestion) => suggestion.busNumber),
      );
      // If we receive more than one suggestion we sort them by bus number. toSorted create a new instance
      this.addressSuggestionsWithBusNumber = addressSuggestions
        .reduce((acc, curr) => {
          // Only keep addresses with unique bus numbers
          if (justBusNumbers.has(curr.busNumber)) {
            acc.push(curr);
            justBusNumbers.delete(curr.busNumber);
          }
          return acc;
        }, [])
        .sort((a, b) => {
          const aa = parseInt(a.busNumber);
          const bb = parseInt(b.busNumber);
          if (isNaN(aa) && !isNaN(b)) {
            // a is string and b is not push to front
            return 1;
          } else if (!isNaN(aa) && isNaN(bb)) {
            // b is a string and a is not, push to back
            return -1;
          } else {
            // When both are integers, normal sort
            return aa < bb ? -1 : 1;
          }
        });

      // We set the last selected value, including null which is a valid value
      // The fallback, which is unexpected, is just the first result of the suggestions
      this.selectedAddressSuggestion =
        this.addressSuggestionsWithBusNumber.find(
          (suggestion) => suggestion.busNumber === lastBusNumber,
        ) ?? addressSuggestions[0];
      this.updateAddressAttributes(this.selectedAddressSuggestion); // Write the data of the selection to the address model which will populate the manual input controls, except province
      // By definition the suggestion does not have the correct province information. We should get it fresh. But do a sanity check first
      if (!this.selectedAddressSuggestion.municipality) {
        console.warn(
          `Backend address register returned address without municipality: ${this.selectedAddressSuggestion.municipality}`,
        );
        return;
      }
      // Update the province as well.
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
    this.selectedAddressSuggestion = addressSuggestion;
    this.args.address.set(
      'boxNumber',
      addressSuggestion ? addressSuggestion.busNumber : null,
    );
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
      fullAddress: addressSuggestion.fullAddress,
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

function addressInstanceToAddressSuggestion(addressInstance) {
  return {
    uri: addressInstance.id,
    addressRegisterId: addressInstance.addressRegisterUri,
    busNumber: addressInstance.boxNumber ?? null,
    fullAddress: combineFullAddress(addressInstance),
    street: addressInstance.street,
    housenumber: addressInstance.number,
    zipCode: addressInstance.postcode,
    municipality: addressInstance.municipality,
    country: addressInstance.country,
  };
}

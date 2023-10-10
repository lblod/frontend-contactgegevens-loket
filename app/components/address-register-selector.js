import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task, timeout, perform } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { combineFullAddress } from 'frontend-contactgegevens-loket/models/address';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';

/**
 * @typedef {uri: string, addressRegisterId: string, fullAddress: string, street:string,housenumber:string,busNumber:string | null,zipCode:string,municipality:string,country:string | null} AddressSuggestion
 */

export default class AddressRegisterSelectorComponent extends Component {
  @service addressRegister;
  @service store;

  initComponentAfterArgs = task(async () => {
    if (!this.args.address)
      throw new Error(
        'AddressRegisterSelect component does not have access to a valid address argument when initializing.',
      );
    // Derive address string from address parameter upon construction
    // Careful! address arg is not completely the same type as the address data structure we get back from addressRegister
    // this.args.address -> Address model instance
    // address suggestion -> 'AddressSuggestion' type defined above
    console.log('args.address.number', this.args.address.number);
    const suggestion = addressInstanceToAddressSuggestion(this.args.address);
    // Start the selectSuggestion async task to start checking if this address has bus numbers available
    // but only if the address is in belgium
    if (this.args.address.country === 'België') {
      this.selectSuggestion.perform(suggestion);
    }
    return suggestion;
  });

  trackedInitComponentAfterArgs = trackedTask(
    this,
    this.initComponentAfterArgs,
    () => [this.args.address],
  );

  /** @type {AddressSuggestion | null} */
  @tracked addressSuggestion = this.trackedInitComponentAfterArgs.value;
  /** @type {[AddressSuggestion]} */
  @tracked options = [];

  selectSuggestion = task(async (selectedAddressSuggestion) => {
    console.log('Performing selectSuggestion task', selectedAddressSuggestion);
    if (!selectedAddressSuggestion) return;
    /**@type {[AddressSuggestion]} */
    const adressesFromRegister = await this.addressRegister.findAll(
      selectedAddressSuggestion,
    );
    adressesFromRegister.forEach((option) => {
      option.country = 'België'; // By definition any address found by the search service has Belgium as its country
    });
    // If we get nothing back we send nothing.
    // This may conceal an error!
    if (!adressesFromRegister) {
      console.warn(
        `Did not receive address suggestions for search string "${selectedAddressSuggestion}"`,
      );
      this.args.onChange([]);
      this.options = [];
      return;
    }
    this.args.onChange(adressesFromRegister);
    // After selecting we update the options list. We transform this to a list of strings for the options
    this.options = adressesFromRegister;
    this.addressSuggestion = selectedAddressSuggestion;
  });

  /**
   * The search task populates the options list
   */
  search = task({ restartable: true }, async (searchData) => {
    await timeout(400); // Debounce
    const options = await this.addressRegister.suggest(searchData);
    options.forEach((option) => {
      option.country = 'België'; // By definition any address found by the search service has Belgium as its country
    });
    this.options = options;
  });
}

function addressInstanceToAddressSuggestion(addressInstance) {
  return {
    uri: addressInstance.id,
    addressRegisterId: addressInstance.addressRegisterUri,
    busNumber: addressInstance.boxNumber,
    fullAddress: fullAddressFromAddressInstance(addressInstance),
    street: addressInstance.street,
    housenumber: addressInstance.number,
    zipCode: addressInstance.postcode,
    municipality: addressInstance.municipality,
    country: addressInstance.country,
  };
}

function fullAddressFromAddressInstance(addressInstance) {
  return `${addressInstance.street} ${addressInstance.number}, ${addressInstance.postcode} ${addressInstance.municipality}`;
}

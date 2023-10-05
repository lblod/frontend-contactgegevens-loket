import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { combineFullAddress } from 'frontend-contactgegevens-loket/models/address';

/**
 * @typedef {uri: string, addressRegisterId: string, fullAddress: string, street:string,housenumber:string,busNumber:string | null,zipCode:string,municipality:string,country:string | null} AddressSuggestion
 */

export default class AddressRegisterSelectorComponent extends Component {
  @service addressRegister;
  @service store;
  /** @type {AddressSuggestion | null} */
  @tracked addressSuggestion = null;
  /** @type {[AddressSuggestion]} */
  @tracked options = [];

  // DVE: Address register setup is one time and has been moved to application route.
  constructor() {
    super(...arguments);
    console.log('contstructing an addressRegisterSelector');
    if (this.args.initialAddress) {
      // Derive address string from address parameter upon construction
      // Careful! address arg is not completely the same type as the address data structure we get back from addressRegister
      // this.args.address -> Address model instance
      // address suggestion -> 'AddressSuggestion' type defined above

      this.addressSuggestion = addressInstanceToAddressSuggestion(
        this.args.initialAddress,
      );
      // Start the search async task to start checking if this address has bus numbers available
      // but only if the address is in belgium
      if (this.args.initialAddress.country)
        this.selectSuggestion.perform(this.addressSuggestion); //This will trigger the onChange. But it should change nothing
    }
  }
  /**
   * When we select a suggestion we trigger the onChange function passed as an arguement.
   * We pass it a list of lists with the inner list consisting of two items:
   * 0: full address as string
   * 1: the address suggestion object (NOT a address instance!)
   * The address select component will process this data further, specifically the logic of turning controls on or off
   */
  selectSuggestion = task(async (selectedAddressSuggestion) => {
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
    fullAddress: addressInstance.fullAddress,
    street: addressInstance.street,
    housenumber: addressInstance.number,
    zipCode: addressInstance.postcode,
    municipality: addressInstance.municipality,
    country: addressInstance.country,
  };
}

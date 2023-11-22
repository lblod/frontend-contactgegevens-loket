import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { combineFullAddress } from 'frontend-contactgegevens-loket/models/address';

function assert(value, message) {
  if (!value) throw new Error(message);
}

/**
 *
 * @param { import('../../../models/address').AddressModel } addressModel
 * @param { import('../../../components/au-address-search').Address } addressSearchAddress
 */
function copyAddressSearchAddressToAddressModel(
  addressModel,
  addressSearchAddress,
) {
  addressModel.number = addressSearchAddress.houseNumber;
  addressModel.boxNumber = addressSearchAddress.boxNumber;
  addressModel.street = addressSearchAddress.street;
  addressModel.postcode = addressSearchAddress.postalCode;
  addressModel.municipality = addressSearchAddress.municipality;
  addressModel.province = addressSearchAddress.province;
  addressModel.country = addressSearchAddress.country;
  addressModel.fullAddress = combineFullAddress(addressModel);
}

/**
 *
 * @param { import('../../../models/address').AddressModel } addressModel
 * @returns { import('../../../components/au-address-search').Address }
 */
function createAddressSearchAddressFromAddressModel(addressModel) {
  return {
    houseNumber: addressModel?.number,
    boxNumber: addressModel?.boxNumber ?? null,
    street: addressModel?.street,
    postalCode: addressModel?.postcode,
    municipality: addressModel?.municipality,
    province: addressModel?.province,
    country: addressModel?.country,
  };
}

export default class ContactDataEditSiteController extends Controller {
  @service router;

  // Varies with user select
  @tracked selectedPrimaryStatus = this.currentIsPrimary;

  get addressSearchAddress() {
    const newAddress = createAddressSearchAddressFromAddressModel(
      this.model.address,
    );
    console.log('edit passed to ausearchAddress', newAddress);
    return newAddress;
  }

  set addressSearchAddress(value) {
    copyAddressSearchAddressToAddressModel(this.model.address, value);
  }

  // Quasi constant
  get currentIsPrimary() {
    return this.model.site.id === this.model.primarySite.id ? true : false;
  }

  get isLoading() {
    return this.saveTask.isRunning || this.cancelTask.isRunning;
  }

  saveTask = task(async (event) => {
    event.preventDefault();
    const { site, address, primaryContact, secondaryContact, adminUnit } =
      this.model;

    const nonPrimarySites = await adminUnit.sites;
    const currentPrimarySite = await adminUnit.primarySite;
    // Sanity checks
    assert(nonPrimarySites, 'Adminunit needs nonprimarysites');
    assert(currentPrimarySite, 'Adminunit must always have a primary site');
    if (this.currentIsPrimary && !this.selectedPrimaryStatus)
      throw new Error(
        'Cannot turn a primary site into a non primary. This would lead to the primary site being null.',
      );

    // Change relationships

    // we select yes for the primary site, non primary -> primary
    if (!this.currentIsPrimary && this.selectedPrimaryStatus) {
      nonPrimarySites.push(currentPrimarySite);
      adminUnit.sites = nonPrimarySites.filter((nonPrimarySite) => {
        return nonPrimarySite.id !== site.id;
      });
      adminUnit.primarySite = site;
    }

    // The address search component has a different structure to the address search model
    copyAddressSearchAddressToAddressModel(address, this.addressSearchAddress);

    // Save the models.
    await site.save();
    await address.save();
    await primaryContact.save();
    if (secondaryContact) await secondaryContact.save();
    await adminUnit.save();
    this.router.replaceWith('sites.site', site.id);
  });

  @action
  cancel(event) {
    event.preventDefault();
    const { site, address, primaryContact, secondaryContact, adminUnit } =
      this.model;
    // Undo any changes
    site.rollback();
    address.rollback();
    primaryContact.rollback();
    if (secondaryContact) secondaryContact.rollback();
    adminUnit.rollback();
    // Navigate away
    this.router.transitionTo('sites.site.index');
  }

  @action
  handleChangeAddress(addressSearchAddress) {
    console.log('edit handle change address', addressSearchAddress);
    copyAddressSearchAddressToAddressModel(
      this.model.address,
      addressSearchAddress,
    );
  }
}

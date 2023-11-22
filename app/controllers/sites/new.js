import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { combineFullAddress } from 'frontend-contactgegevens-loket/models/address';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';

/**
 *
 * @param { import('../../models/address').AddressModel } addressModel
 * @param { import('../../components/au-address-search').Address } addressSearchAddress
 */
function copyAddressSearchAddressToAddressModel(
  addressModel,
  addressSearchAddress,
) {
  addressModel.number = addressSearchAddress.houseNumber;
  addressModel.boxNumber = addressSearchAddress.boxNumber ?? null;
  addressModel.street = addressSearchAddress.street;
  addressModel.postcode = addressSearchAddress.postalCode;
  addressModel.municipality = addressSearchAddress.municipality;
  addressModel.province = addressSearchAddress.province;
  addressModel.country = addressSearchAddress.country;
  addressModel.fullAddress = combineFullAddress(addressModel);
}

/**
 *
 * @param { import('../../models/address').AddressModel } addressModel
 * @returns { import('../../components/au-address-search').Address }
 */
function createAddressSearchAddressFromAddressModel(addressModel) {
  return {
    houseNumber: addressModel?.number,
    boxNumber: addressModel?.boxNumber,
    street: addressModel?.street,
    postalCode: addressModel?.postcode,
    municipality: addressModel?.municipality,
    province: addressModel?.province,
    country: addressModel?.country,
  };
}

export default class CreateSitesNewController extends Controller {
  @service router;
  @service store;
  @tracked isPrimarySite = false;

  get addressSearchAddress() {
    return createAddressSearchAddressFromAddressModel(this.model.address);
  }

  get isLoading() {
    return this.saveTask.isRunning || this.cancelTask.isRunning;
  }

  saveTask = task(async (event) => {
    event.preventDefault();
    const { address, primaryContact, secondaryContact, site, adminUnit } =
      this.model;
    await primaryContact.save();
    await secondaryContact.save();
    await address.save();
    site.contacts = [primaryContact, secondaryContact];
    site.address = address;
    await site.save();
    const nonPrimarySites = await adminUnit.sites;

    if (this.isPrimarySite) {
      const previousPrimarySite = await adminUnit.primarySite;
      if (previousPrimarySite) {
        nonPrimarySites.push(previousPrimarySite);
      }
      adminUnit.primarySite = site;
    } else {
      nonPrimarySites.push(site);
    }

    await adminUnit.save();
    this.router.transitionTo('sites.index'); // Model does not reload?
  });

  cancelTask = task(async (event) => {
    event.preventDefault();
    const { address, primaryContact, secondaryContact, site, adminUnit } =
      this.model;
    // Destroy the newly created models
    address.deleteRecord();
    await address.save();
    primaryContact.deleteRecord();
    await primaryContact.save();
    secondaryContact.deleteRecord();
    await secondaryContact.save();
    site.deleteRecord();
    await site.save();
    // Roll back the changes to admin unit if any
    adminUnit.rollback();

    this.router.transitionTo('sites.index'); // Model does not reload?
  });

  reset() {
    this.isPrimarySite = false;
    this.removeUnsavedRecords();
  }

  removeUnsavedRecords() {
    let { site, address, primaryContact, secondaryContact } = this.model;

    if (site.isNew) {
      site.destroyRecord();
    }

    if (address.isNew) {
      address.destroyRecord();
    }

    if (primaryContact.isNew) {
      primaryContact.destroyRecord();
    }

    if (secondaryContact.isNew) {
      secondaryContact.destroyRecord();
    }
  }

  @action
  handleChangeAddress(addressSearchAddress) {
    console.log('new handle change address', addressSearchAddress);
    copyAddressSearchAddressToAddressModel(
      this.model.address,
      addressSearchAddress,
    );
  }
}

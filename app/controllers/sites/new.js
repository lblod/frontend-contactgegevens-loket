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
  @tracked validationErrors = {};
  @tracked validationWarnings = {};
  @tracked saveButtonPressed = 0;
  @tracked hasError = false;
  @tracked hasWarning = false;

  get addressSearchAddress() {
    return createAddressSearchAddressFromAddressModel(this.model.address);
  }

  get isLoading() {
    return this.saveTask.isRunning || this.cancelTask.isRunning;
  }

  get isLoading() {
    return this.saveTask.isRunning;
  }

  validateFormData() {
    const { address, primaryContact, secondaryContact, site } = this.model;
    const validationData = {
      siteType: site.siteType.get('label'),
      street: address.street,
      country: address.country,
      number: address.number,
      postcode: address.postcode,
      municipality: address.municipality,
      province: address.province,
      fullAddress: address.fullAddress,
      telephonePrimary: primaryContact.telephone,
      emailPrimary: primaryContact.email,
      websitePrimary: primaryContact.website,
      telephoneSecondary: secondaryContact.telephone,
    };

    const errorValidationResult = errorValidation.validate(validationData);
    const warningValidationResult = warningValidation.validate(validationData);
    return {
      errors: errorValidationResult.error
        ? mapValidationDetailsToErrors(errorValidationResult.error.details)
        : {},
      warnings: warningValidationResult.error
        ? mapValidationDetailsToErrors(warningValidationResult.error.details)
        : {},
    };
  }

  saveTask = task(async () => {
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
    // Saving is complete. Navigate away
    this.reset();
    this.router.transitionTo('sites.index');
  });

  @action
  clearValidationError(field) {
    this.validationErrors = {
      ...this.validationErrors,
      [field]: undefined,
    };
  }

  @action
  handleSubmit(event) {
    event.preventDefault();

    this.validationErrors = {};
    this.validationWarnings = {};
    const validationResult = this.validateFormData();
    if (Object.keys(validationResult.errors).length > 0) {
      // Validation failed. Return
      this.validationErrors = validationResult.errors;
      this.hasError = true;
      this.saveButtonPressed = 0;
      return;
    }

    if (Object.keys(validationResult.warnings).length > 0) {
      this.saveButtonPressed = this.saveButtonPressed + 1;
      this.hasError = false;
      this.hasWarning = true;
      if (this.saveButtonPressed === 2) {
        this.saveTask.perform();
      }
      this.validationWarnings = validationResult.warnings;
      return;
    }

    // No errors and no warnings, we can save
    this.saveTask.perform();
  }

  @action
  handleCancel(event) {
    event.preventDefault();
    const { address, primaryContact, secondaryContact, site, adminUnit } =
      this.model;
    address.rollbackAttributes();
    primaryContact.rollbackAttributes();
    secondaryContact.rollbackAttributes();
    site.rollbackAttributes();
    adminUnit.rollbackAttributes();
    this.reset();
    this.router.transitionTo('sites.index');
  }

  @action
  handleChangeAddress(addressSearchAddress) {
    copyAddressSearchAddressToAddressModel(
      this.model.address,
      addressSearchAddress,
    );
  }
}

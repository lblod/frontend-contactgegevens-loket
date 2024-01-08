import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
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
  @service store;
  @tracked isPrimarySite = false;
  @tracked validationErrors = {};
  @tracked validationWarnings = {};
  @tracked saveButtonPressed = 0;
  @tracked hasError = false;
  @tracked hasWarning = false;
  // Varies with user select
  @tracked selectedPrimaryStatus;

  get addressSearchAddress() {
    const newAddress = createAddressSearchAddressFromAddressModel(
      this.model.address,
    );
    return newAddress;
  }

  set addressSearchAddress(value) {
    copyAddressSearchAddressToAddressModel(this.model.address, value);
  }

  // Quasi constant
  get currentIsPrimary() {
    return this.model.site.id === this.model.primarySite.id ? true : false;
  }
  setup() {
    this.selectedPrimaryStatus = this.currentIsPrimary;
  }

  reset() {
    this.isPrimarySite = false;
    this.validationErrors = {};
    this.validationWarnings = {};
    this.saveButtonPressed = 0;
    this.hasError = false;
    this.hasWarning = false;
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
  handleSubmit(event) {
    event.preventDefault();

    this.validationErrors = {};
    this.validationWarnings = {};
    const validationResult = this.validateFormData();
    if (Object.keys(validationResult.errors).length > 0) {
      // Validation failed. Return
      this.validationErrors = validationResult.errors;
      this.saveButtonPressed = 0;
      this.hasError = true;
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
  clearValidationError(field) {
    this.validationErrors = {
      ...this.validationErrors,
      [field]: undefined,
    };
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
    this.router.replaceWith('sites.site', site.id);
  }

  @action
  handleChangeAddress(addressSearchAddress) {
    copyAddressSearchAddressToAddressModel(
      this.model.address,
      addressSearchAddress,
    );
  }
}

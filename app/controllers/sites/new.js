import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { combineFullAddress } from 'frontend-contactgegevens-loket/models/address';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import {
  errorValidation,
  warningValidation,
} from '../../validations/site-validation';

/**
 * Transforms a Joi validation error to a simple hash of keys and error massages
 * @param { import("joi").ValidationError['details'] } validationDetails
 * @returns { Record<string,string> }
 */
function mapValidationDetailsToErrors(validationDetails) {
  return validationDetails.reduce((accumulator, detail) => {
    accumulator[detail.context.key] = detail.message;
    return accumulator;
  }, {});
}

export default class CreateSitesNewController extends Controller {
  @service router;
  @service store;
  @tracked isPrimarySite = false;
  @tracked validationErrors = {};
  @tracked validationWarnings = {};
  @tracked buttonCounter = 0;

  reset() {
    this.isPrimarySite = false;
    this.validationErrors = {};
    this.validationWarnings = {};
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
    address.fullAddress = combineFullAddress(address);

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
  handleSubmit(event) {
    event.preventDefault();

    this.validationErrors = {};
    this.validationWarnings = {};
    const validationResult = this.validateFormData();
    if (Object.keys(validationResult.errors).length > 0) {
      // Validation failed. Return
      this.validationErrors = validationResult.errors;
      return;
    }

    if (Object.keys(validationResult.warnings).length > 0) {
      this.buttonCounter = this.buttonCounter + 1;
      if (this.buttonCounter == 2) {
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
    this.router.replaceWith('sites.site', site.id);
  }
}

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

export default class CreateSitesNewController extends Controller {
  @service router;
  @service store;
  @tracked isPrimarySite = false;
  @tracked validationErrors = {};
  @tracked validationWarnings = {};
  @tracked showWarningModal = false;

  @action
  reset() {
    this.isPrimarySite = false;
    this.validationErrors = {};
    this.validationWarnings = {};
    this.showWarningModal = false;
  }

  get isLoading() {
    return this.saveTask.isRunning || this.cancelTask.isRunning;
  }

  async validateData() {
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
      errors: errorValidationResult.error,
      warnings: warningValidationResult.error,
    };
  }

  saveTask = task(async (event) => {
    event.preventDefault();
    this.validationErrors = {};
    this.validationWarnings = {};
    const validationResult = await this.validateData();
    if (
      validationResult.errors &&
      Object.keys(validationResult.errors).length > 0
    ) {
      // Handle errors
      this.validationErrors = validationResult.errors.details.reduce(
        (errors, detail) => {
          errors[detail.context.key] = detail.message;
          return errors;
        },
        {},
      );
      return;
    }
    if (
      validationResult.warnings &&
      validationResult.warnings.details.length > 0
    ) {
      console.log('er zijn warnings');
      this.showWarningModal = true;
      this.validationWarnings = validationResult.warnings.details.reduce(
        (warnings, detail) => {
          warnings[detail.context.key] = detail.message;
          return warnings;
        },
        {},
      );
      return;
    }
    // No errors and no warnings
    await this.save();
    this.reset();
    this.router.transitionTo('sites.index');
  });

  handleWarningModalOK = task(async (event) => {
    event.preventDefault();
    await this.save();
    this.reset();
    this.router.transitionTo('sites.index');
  });

  @action
  handleWarningModalBack(event) {
    event.preventDefault();
    this.showWarningModal = false;
  }

  cancelTask = task(async (event) => {
    event.preventDefault();
    const { address, primaryContact, secondaryContact, site, adminUnit } =
      this.model;

    address.deleteRecord();
    await address.save();
    primaryContact.deleteRecord();
    await primaryContact.save();
    secondaryContact.deleteRecord();
    await secondaryContact.save();
    site.deleteRecord();
    await site.save();
    if (adminUnit) {
      adminUnit.rollbackAttributes();
      adminUnit.save();
    }
    this.reset();
    this.router.transitionTo('sites.index');
  });

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

  async save() {
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
  }
}

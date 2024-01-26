import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import {
  allowedSiteMatrix,
  errorValidation,
  warningValidation,
} from '../../validations/site-validation';
import {
  copyAddressSearchAddressToAddressModel,
  createAddressSearchAddressFromAddressModel,
  mapValidationDetailsToErrors,
} from 'frontend-contactgegevens-loket/helpers/address-helpers';
import { SITE_CODE } from '../../models/site';
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
    return this.saveTask.isRunning || this.handleCancel.isRunning;
  }

  reset() {
    this.isPrimarySite = false;
    this.validationErrors = {};
    this.validationWarnings = {};
    this.saveButtonPressed = 0;
    this.hasError = false;
    this.hasWarning = false;
  }
  validateFormData() {
    let maxReachedMessage = '';
    const { address, primaryContact, secondaryContact, site, siteTypeCount } =
      this.model;
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

    const max =
      allowedSiteMatrix[this.model.adminUnit.classification.id][
        this.model.site.siteType.id
      ];

    const key = Object.keys(SITE_CODE).find(
      (key) => SITE_CODE[key] === this.model.site.siteType.id,
    );
    if (this.model.siteTypeCount[key] > max) {
      maxReachedMessage = 'Je hebt je maximum bereikt';
    }
    let errors = {};
    let warnings = {};

    if (errorValidationResult && errorValidationResult.error) {
      errors = mapValidationDetailsToErrors(
        errorValidationResult.error.details,
      );
    }

    if (warningValidationResult && warningValidationResult.error) {
      warnings = mapValidationDetailsToErrors(
        warningValidationResult.error.details,
      );
    }

    // Voeg de maxReachedMessage toe aan de foutmeldingen als het aantal site types dat wordt ingevoerd niet groter is dan het maximum
    if (maxReachedMessage) {
      errors['siteType'] = maxReachedMessage;
    }

    return {
      errors: errors,
      warnings: warnings,
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
    //ToDO Check if there are not to many sitetypes the same

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

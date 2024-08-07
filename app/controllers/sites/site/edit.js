import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { combineFullAddress } from 'frontend-contactgegevens-loket/models/address';
import { action } from '@ember/object';
import {
  allowedSiteMatrix,
  errorValidation,
  warningValidation,
} from '../../../validations/site-validation';
import {
  copyAddressSearchAddressToAddressModel,
  createAddressSearchAddressFromAddressModel,
  mapValidationDetailsToErrors,
} from 'frontend-contactgegevens-loket/helpers/address-helpers';
import { SITE_CODE } from '../../../models/site';

import { transformPhoneNumbers } from '../../../utils/transform-phone-numbers';
import { setEmptyStringsToNull } from '../../../utils/empty-string-to-null';

function assert(value, message) {
  if (!value) throw new Error(message);
}

export default class ContactDataEditSiteController extends Controller {
  @service router;
  @service store;
  @service currentSession;
  @tracked isPrimarySite = false;
  @tracked validationErrors = {};
  @tracked validationWarnings = {};
  @tracked saveButtonPressed = 0;
  @tracked hasError = false;
  @tracked hasWarning = false;
  // Varies with user select
  @tracked selectedPrimaryStatus;

  // Quasi constant
  get currentIsPrimary() {
    return this.model.site.id === this.model.primarySite.id ? true : false;
  }
  setup() {
    this.selectedPrimaryStatus = this.currentIsPrimary;
  }

  reset() {
    const { address, primaryContact, secondaryContact, site, adminUnit } =
      this.model;
    address.rollbackAttributes();
    primaryContact.rollbackAttributes();

    if (!secondaryContact.isDestroyed) {
      secondaryContact.rollbackAttributes();
    }

    site.rollbackAttributes();
    adminUnit.rollbackAttributes();
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

  get addressSearchAddress() {
    return createAddressSearchAddressFromAddressModel(this.model.address);
  }

  validateFormData() {
    let maxReachedMessage = '';
    const { address, primaryContact, secondaryContact, site } = this.model;

    /** @type {Record<keyof SITE_CODE,number>} */
    const siteTypeCountBeforeSave = this.model.siteTypeCount;

    /** @type {keyof SITE_CODE} */
    const siteTypeKeyBeforeSave = this.model.siteTypeKeyBeforeSave;

    const validationData = {
      siteType: site.siteType.get('label'),
      street: address.street,
      country: address.country,
      number: address.number,
      postcode: address.postcode,
      municipality: address.municipality,
      province: address.province,
      fullAddress: address.fullAddress || combineFullAddress(address),
      telephonePrimary: primaryContact.telephone,
      emailPrimary: primaryContact.email,
      websitePrimary: primaryContact.website,
      telephoneSecondary: secondaryContact.telephone,
    };

    const errorValidationResult = errorValidation.validate(validationData);
    const warningValidationResult = warningValidation.validate(validationData);

    const currentAdminUnitClassificationId =
      this.model.adminUnit.classification.id;
    const currentSiteTypeId = this.model.site.siteType.id;
    const maxAllowedSitesOfThisType =
      allowedSiteMatrix[currentAdminUnitClassificationId] &&
      allowedSiteMatrix[currentAdminUnitClassificationId][currentSiteTypeId];

    const siteTypeKeyAfterSave = Object.keys(SITE_CODE).find(
      (key) => SITE_CODE[key] === currentSiteTypeId,
    );
    if (!siteTypeKeyAfterSave)
      throw new Error(
        `Impossible. Cannot find site type id in site type data structure.`,
      );

    const siteTypeCountAfterSave = { ...siteTypeCountBeforeSave };
    siteTypeCountAfterSave[siteTypeKeyBeforeSave] =
      siteTypeCountBeforeSave[siteTypeKeyBeforeSave] - 1;
    siteTypeCountAfterSave[siteTypeKeyAfterSave] =
      siteTypeCountAfterSave[siteTypeKeyAfterSave] + 1;
    if (
      (maxAllowedSitesOfThisType || maxAllowedSitesOfThisType === 0) &&
      siteTypeCountAfterSave[siteTypeKeyAfterSave] > maxAllowedSitesOfThisType
    ) {
      maxReachedMessage =
        'Deze vestiging is al eerder aangemaakt. Als je wijzigingen wilt aanbrengen, bewerk dan de reeds geregistreerde vestiging.';
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

    if (maxReachedMessage) {
      errors['siteType'] = maxReachedMessage;
    }

    return {
      errors: errors,
      warnings: warnings,
    };
  }

  saveTask = task(async () => {
    let { site, address, primaryContact, secondaryContact, adminUnit } =
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

    this.model.site.modified = new Date();
    this.model.site.modifiedBy = this.currentSession.group;
    // Save the models.

    if (primaryContact.hasDirtyAttributes) {
      primaryContact.telephone = transformPhoneNumbers(
        primaryContact.telephone,
      );
      if (primaryContact.isNew) {
        (await site.contacts).push(primaryContact);
      }
      primaryContact = setEmptyStringsToNull(primaryContact);

      await primaryContact.save();
    }
    if (secondaryContact.hasDirtyAttributes) {
      secondaryContact.telephone = transformPhoneNumbers(
        secondaryContact.telephone,
      );
      if (secondaryContact.isNew) {
        (await site.contacts).push(secondaryContact);
      }
      secondaryContact = setEmptyStringsToNull(secondaryContact);

      await secondaryContact.save();
    }

    await site.save();
    address.fullAddress = combineFullAddress(address) ?? 'Adres niet compleet';
    await address.save();
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
    this.reset();
    this.router.replaceWith('sites.site', this.model.site.id);
  }

  @action
  handleChangeAddress(addressSearchAddress) {
    copyAddressSearchAddressToAddressModel(
      this.model.address,
      addressSearchAddress,
    );
  }
  @action
  setSiteTypeName(e) {
    this.model.site.siteTypeName = e.target.value;
  }
}

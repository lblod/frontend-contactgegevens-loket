import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { combineFullAddress } from 'frontend-contactgegevens-loket/models/address';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { errorValidation } from '../../validations/site-validation';

export default class CreateSitesNewController extends Controller {
  @service router;
  @service store;
  @tracked isPrimarySite = false;
  @tracked validationErrors = {};

  get isLoading() {
    return this.saveTask.isRunning || this.cancelTask.isRunning;
  }

  async validateData() {
    const { address, primaryContact, secondaryContact, site, adminUnit } =
      this.model;

    const validationData = {
      siteType: site.siteType.get('label'),
      street: address.street,
      country: address.country,
      housenumber: address.number,
      postcode: address.postcode,
      municipality: address.municipality,
      province: address.province,
      fullAddress: address.fullAddress,
      telephonePrimary: primaryContact.telephone,
      emailPrimary: primaryContact.email,
      websitePrimary: primaryContact.website,
      telephoneSecondary: secondaryContact.telephone,
    };
    return errorValidation.validate(validationData);
  }

  saveTask = task(async (event) => {
    event.preventDefault();
    const validationResult = await this.validateData();
    if (!validationResult.error) {
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
      this.router.transitionTo('sites.index');
    } else {
      this.validationErrors = validationResult.error.details.reduce((errors, detail) => {
        errors[detail.context.key] = detail.message;
          return errors;
        },
        {},
      );
      console.log('Validation Errors:', this.validationErrors);
    }
  });

  cancelTask = task(async (event) => {
    event.preventDefault();
    const { address, primaryContact, secondaryContact, site, adminUnit } = this.model;

    address.deleteRecord();
    await address.save();
    primaryContact.deleteRecord();
    await primaryContact.save();
    secondaryContact.deleteRecord();
    await secondaryContact.save();
    site.deleteRecord();
    await site.save();

    adminUnit.rollback();
    this.router.transitionTo('sites.index');
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
}

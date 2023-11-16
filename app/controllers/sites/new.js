import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { combineFullAddress } from 'frontend-contactgegevens-loket/models/address';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class CreateSitesNewController extends Controller {
  @service router;
  @service store;
  @tracked isPrimarySite = false;

  get isLoading() {
    return this.saveTask.isRunning || this.cancelTask.isRunning;
  }

  saveTask = task(async (event) => {
    event.preventDefault();
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
    if (adminUnit) {
      adminUnit.rollbackAttributes();
      adminUnit.save();
    }

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
}

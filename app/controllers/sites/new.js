import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { combineFullAddress } from 'frontend-contactgegevens-loket/models/address';
import { setEmptyStringsToNull } from 'frontend-contactgegevens-loket/utils/empty-string-to-null';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CreateSitesNewController extends Controller {
  @service router;
  @service store;
  @tracked isPrimarySite = false;

  @action
  async createSite(event) {
    event.preventDefault();
    const { address, primaryContact, secondaryContact, site, adminUnit } =
      this.model;
    address.fullAddress = combineFullAddress(address);
    await Promise.allSettled([
      primaryContact.save(),
      secondaryContact.save(),
      address.save(),
    ]);
    site.contacts = [primaryContact, secondaryContact];
    site.address = address;
    await site.save();
    /**
     * TODO: MISSING! You have to add the new site to the sites list of admin-unit.
     * Don't know how to do this. Check the ember data docs.
     */
    if (this.isPrimarySite) {
      adminUnit.primarySite = site;
      await adminUnit.save();
    }
    this.router.transitionTo('sites.index');
  }

  reset() {
    this.isPrimarySite = false;
    this.removeUnsavedRecords();
  }

  removeUnsavedRecords() {
    let { site, address, primaryContact, secondaryContact } = this.model;
    if (site.isNew) site.destroyRecord();
    if (address.isNew) address.destroyRecord();
    if (primaryContact.isNew) primaryContact.destroyRecord();
    if (secondaryContact.isNew) secondaryContact.destroyRecord();
  }
}

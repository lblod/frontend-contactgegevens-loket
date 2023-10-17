import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { combineFullAddress } from 'frontend-contactgegevens-loket/models/address';
import getIsPrimarySite from 'frontend-contactgegevens-loket/utils/get-is-primary-site';
export default class ContactDataEditSiteController extends Controller {
  @service router;

  constructor() {
    super(...arguments);
  }

  get isPrimarySite() {
    return getIsPrimarySite(this.model.site, this.model.primarySite);
  }

  save = task(async (event) => {
    event.preventDefault();
    const { site, address, primaryContact, secondaryContact } = this.model;

    address.fullAddress = combineFullAddress(address);

    site.save();
    address.save();
    primaryContact.save();
    secondaryContact ? secondaryContact.save() : null;

    this.router.transitionTo('sites.site.index');
  });

  @action
  cancel(event) {
    event.preventDefault();
    this.router.transitionTo('sites.site.index');
  }
}

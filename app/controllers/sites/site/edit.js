import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { combineFullAddress } from 'frontend-contactgegevens-loket/models/address';
import { tracked } from '@glimmer/tracking';
export default class ContactDataEditSiteController extends Controller {
  @service router;
  @tracked isPrimarySite;
  // get isPrimarySite() {
  //   return this.model.site.id === this.model.primarySite.id ? 'Ja' : 'Neen';
  // }

  save = task(async (event) => {
    event.preventDefault();
    const { site, address, primaryContact, secondaryContact, adminUnit } =
      this.model;

    address.fullAddress = combineFullAddress(address);

    site.save();
    address.save();
    primaryContact.save();
    secondaryContact ? secondaryContact.save() : null;
    let nonPrimarySites = await adminUnit.sites;

    if (this.isPrimarySite) {
      let previousPrimarySite = await adminUnit.primarySite;
      if (previousPrimarySite) {
        nonPrimarySites.push(previousPrimarySite);
      }

      adminUnit.primarySite = site;
    } else {
      nonPrimarySites.push(site);
    }
    adminUnit.save();

    this.router.transitionTo('sites.site.index');
  });

  @action
  cancel(event) {
    event.preventDefault();
    this.router.transitionTo('sites.site.index');
  }
}

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { combineFullAddress } from 'frontend-contactgegevens-loket/models/address';
import { tracked } from '@glimmer/tracking';

function assert(value, message) {
  if (!value) throw new Error(message);
}

export default class ContactDataEditSiteController extends Controller {
  @service router;
  // Varies with user select
  @tracked selectedPrimaryStatus = this.currentIsPrimary;

  // Quasi constant
  get currentIsPrimary() {
    return this.model.site.id === this.model.primarySite.id ? true : false;
  }

  save = task(async (event) => {
    event.preventDefault();
    const { site, address, primaryContact, secondaryContact, adminUnit } =
      this.model;

    let nonPrimarySites = await adminUnit.sites;
    const previousPrimarySite = await adminUnit.primarySite;
    // we select yes for the primary site
    if (this.selectedPrimaryStatus) {
      // if there is a previous primary site
      if (previousPrimarySite) {
        // check if the previous primary site is in the nonPrimarySites array, if not , add it
        nonPrimarySites.push(previousPrimarySite);
        adminUnit.sites = nonPrimarySites.filter((nonPrimarySite) => {
          return nonPrimarySite.id !== site.id;
        });
        adminUnit.primarySite = site; // set the new primary site
      }
    } else {
      if (!nonPrimarySites.includes(site)) {
        nonPrimarySites.push(site);
      }
    }
    await site.save();
    await address.save();
    await primaryContact.save();
    if (secondaryContact) await secondaryContact.save();
    await adminUnit.save();

    this.router.transitionTo('sites.site.index');
  });

  @action
  cancel(event) {
    event.preventDefault();
    this.router.transitionTo('sites.site.index');
  }
}

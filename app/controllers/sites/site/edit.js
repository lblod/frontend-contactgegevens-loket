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
    assert(nonPrimarySites, 'Should always get a list of non primary sites.');
    const currentPrimarySite = await adminUnit.primarySite;
    assert(
      currentPrimarySite,
      'An admin-unit should always have a primary site',
    );
    // if (this.currentIsPrimary && !this.selectedPrimaryStatus)
    //   throw new Error(
    //     'User is never allow to change from primary to non primary when the current site is primary.',
    //   );

    // console.log(nonPrimarySites);

    // // User selects yes for primary site, Change from non primary to primary
    // if (!this.currentIsPrimary && this.selectedPrimaryStatus) {
    //   adminUnit.primarySite = site;
    //   // Remove the site from the list of nonPrimarySites
    //   console.log('nonPrimarySites', nonPrimarySites);
    //   nonPrimarySites = nonPrimarySites.filter((item) => item !== site);
    // }

    console.log('nonPrimarySites.length before saving', nonPrimarySites.length);
    console.log('this.selectedPrimaryStatus', this.selectedPrimaryStatus);

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

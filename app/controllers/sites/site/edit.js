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
    assert(nonPrimarySites, 'Should always get a list of non primary sites.');
    const currentPrimarySite = await adminUnit.primarySite;
    assert(
      currentPrimarySite,
      'An admin-unit should always have a primary site',
    );
    if (this.currentIsPrimary && !this.selectedPrimaryStatus)
      throw new Error(
        'User is never allow to change from primary to non primary when the current site is primary.',
      );

    console.log(nonPrimarySites);

    // User selects yes for primary site, Change from non primary to primary
    if (!this.currentIsPrimary && this.selectedPrimaryStatus) {
      adminUnit.primarySite = site;
      // Remove the site from the list of nonPrimarySites
      nonPrimarySites.removeObject(site);
    }

    const nonPrimarySites = await adminUnit.sites;
    const previousPrimarySite = await adminUnit.primarySite;
    console.log('nonPrimarySites.length before saving', nonPrimarySites.length);
    console.log('this.isPrimarySite', this.isPrimarySite);

    // we select yes for the primary site
    if (this.isPrimarySite) {
      // if there is a previous primary site
      if (previousPrimarySite) {
        console.log(
          'previousPrimarySite.address',
          previousPrimarySite.address.get('fullAddress'),
        );
        console.log(
          'new primary site address:',
          site.address.get('fullAddress'),
        );
        // check if the previous primary site is in the nonPrimarySites array, if not , add it
        if (!nonPrimarySites.includes(previousPrimarySite)) {
          nonPrimarySites.push(previousPrimarySite);
        }
        console.log('nonPrimarySites.length', nonPrimarySites.length);

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

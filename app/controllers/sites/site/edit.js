import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { combineFullAddress } from 'frontend-contactgegevens-loket/models/address';
import { tracked } from '@glimmer/tracking';
export default class ContactDataEditSiteController extends Controller {
  @service router;
  @tracked isPrimarySite;

  get isPrimarySiteValue() {
    return this.model.site.id === this.model.primarySite.id ? true : false;
  }

  save = task(async (event) => {
    event.preventDefault();
    const { site, address, primaryContact, secondaryContact, adminUnit } =
      this.model;

    address.fullAddress = combineFullAddress(address);

    await site.save();
    await address.save();
    await primaryContact.save();
    if (secondaryContact) await secondaryContact.save();

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
    await adminUnit.save();

    this.router.transitionTo('sites.site.index');
  });

  @action
  cancel(event) {
    event.preventDefault();
    this.router.transitionTo('sites.site.index');
  }
}

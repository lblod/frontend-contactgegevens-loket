import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  createPrimaryContact,
  createSecondaryContact,
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-contactgegevens-loket/models/contact-point';

export default class ContactDataViewSiteRoute extends Route {
  @service store;
  @service currentSession;

  async model() {
    let siteId = this.paramsFor('contact-data.view-site').id;
    let administrativeUnit = await this.store.findRecord(
      'administrative-unit',
      this.currentSession.group.id,
    );
    let site = await this.store.findRecord('site', siteId);
    let contacts = await site.contacts;
    let contact = findPrimaryContact(contacts);
    if (!contact) {
      contact = createPrimaryContact(this.store);
    }

    let secondaryContact = findSecondaryContact(contacts);
    if (!secondaryContact) {
      secondaryContact = createSecondaryContact(this.store);
    }
    return {
      site,
      siteId,
      contact,
      secondaryContact,
      administrativeUnit,
    };
  }
}

// const sites = this.modelFor('contact-data.sites');
// const primaryContact = site['contacts'].find(
//   (contact) => contact.type === 'Primary',
// );
// const secondaryContact = site['contacts'].find(
//   (contact) => contact.type === 'Secondary',
// );
// console.log(
//   this.store
//     .findRecord('site', '981a82bb-f144-402c-8445-474f62b67a24')
//     .then((site) => {
//       console.log(site.get('address'));
//     }),
// );
// return { site, sites, primaryContact, secondaryContact };

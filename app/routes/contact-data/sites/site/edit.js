import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getSiteValidations } from 'frontend-contactgegevens-loket/validations/sites';
import { getAddressValidations } from 'frontend-contactgegevens-loket/validations/address';
import contactValidations from 'frontend-contactgegevens-loket/validations/contact-point';
import secondaryContactValidations from 'frontend-contactgegevens-loket/validations/secondary-contact-point';
import { createValidatedChangeset } from 'frontend-contactgegevens-loket/utils/changeset';
// import {
//   createPrimaryContact,
//   createSecondaryContact,
//   findPrimaryContact,
//   findSecondaryContact,
// } from 'frontend-contactgegevens-loket/models/contact-point';

export default class ContactDataSitesSiteEditRoute extends Route {
  @service currentSession;
  @service store;
  @service router;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }

  async model() {
    // the following code is a workaround for the mock data
    let sites = this.modelFor('contact-data.sites');
    let { id: siteId } = this.paramsFor('contact-data.sites.site');
    let site = sites['sites'].find((site) => site.id === siteId);
    let address = site.address;
    let contact = site['contacts'].find(
      (contact) => contact.type === 'Primary',
    );
    let secondaryContact = site['contacts'].find(
      (contact) => contact.type === 'Secondary',
    );

    // let contact = findPrimaryContact(contacts); // uncomment when backend works

    if (!contact) {
      // contact = createPrimaryContact(this.store); // uncomment when backend works
      contact = true; // delete this when backend works
    }

    if (!secondaryContact) {
      // secondaryContact = createSecondaryContact(this.store); // uncomment when backend works
      secondaryContact = true; // change this when backend works
    }

    return {
      site: createValidatedChangeset(site, getSiteValidations()),
      sites,
      contact: createValidatedChangeset(contact, contactValidations),
      secondaryContact: createValidatedChangeset(
        secondaryContact,
        secondaryContactValidations,
      ),
      address: createValidatedChangeset(address, getAddressValidations()),
    };
  }
}

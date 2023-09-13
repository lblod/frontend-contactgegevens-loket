import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getSiteValidations } from 'frontend-loket/validations/sites';
import { getAddressValidations } from 'frontend-loket/validations/address';
import contactValidations from 'frontend-loket/validations/contact-point';
import secondaryContactValidations from 'frontend-loket/validations/secondary-contact-point';
import { createValidatedChangeset } from 'frontend-loket/utils/changeset';

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
    let sites = this.modelFor('contact-data.sites');
    let { id: siteId } = this.paramsFor('contact-data.sites.site');
    let site = sites['sites'].find((site) => site.id === siteId);

    let primaryContact = site['contacts'].find(
      (contact) => contact.type === 'Primary'
    );

    let secondaryContact = site['contacts'].find(
      (contact) => contact.type === 'Secondary'
    );

    let address = site.address;

    if (!primaryContact) {
      primaryContact = true; // change this when models are available
    }

    if (!secondaryContact) {
      secondaryContact = true; // change this when models are available
    }

    return {
      site: createValidatedChangeset(site, getSiteValidations()),
      primaryContact: createValidatedChangeset(
        primaryContact,
        contactValidations
      ),
      secondaryContact: createValidatedChangeset(
        secondaryContact,
        secondaryContactValidations
      ),
      address: createValidatedChangeset(address, getAddressValidations()),
    };
  }
}

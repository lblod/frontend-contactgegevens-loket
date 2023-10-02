import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
// import { getSiteValidations } from 'frontend-contactgegevens-loket/validations/sites';
// import { getAddressValidations } from 'frontend-contactgegevens-loket/validations/address';
// import contactValidations from 'frontend-contactgegevens-loket/validations/contact-point';
// import secondaryContactValidations from 'frontend-contactgegevens-loket/validations/secondary-contact-point';
// import { createValidatedChangeset } from 'frontend-contactgegevens-loket/utils/changeset';
import {
  createPrimaryContact,
  createSecondaryContact,
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-contactgegevens-loket/models/contact-point';

export default class ContactDataEditSiteRoute extends Route {
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

  async model(params) {
    let administrativeUnit = await this.store.findRecord(
      'administrative-unit',
      this.currentSession.group.id,
    );
    let site = await this.store.findRecord('site', params.id);
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
      contact,
      secondaryContact,
      administrativeUnit,
    };
  }
}

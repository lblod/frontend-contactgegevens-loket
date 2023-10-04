import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getSiteValidations } from 'frontend-contactgegevens-loket/validations/sites';
import { getAddressValidations } from 'frontend-contactgegevens-loket/validations/address';
import contactValidations from 'frontend-contactgegevens-loket/validations/contact';
import secondaryContactValidations from 'frontend-contactgegevens-loket/validations/secondary-contact-point';
import { createValidatedChangeset } from 'frontend-contactgegevens-loket/utils/changeset';
import {
  createPrimaryContact,
  createSecondaryContact,
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-contactgegevens-loket/models/contact-point';
import adminUnitValidations from 'frontend-contactgegevens-loket/validations/administrative-unit';

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

  async model() {
    const administrativeUnitRecord = await this.store.findRecord(
      'administrative-unit',
      this.currentSession.group.id,
      {
        reload: true,
        include: 'primary-site,primary-site.address,primary-site.contacts',
      },
    );

    if (!administrativeUnitRecord) {
      throw new Error(
        `The user, derived from the currentSession service, should always be associated with at least one administrative unit (also called a 'group'). This administrative unit is not present.`,
      );
    }

    const primarySite = await administrativeUnitRecord.primarySite;

    const { site } = await this.modelFor('sites.site');

    const contacts = await site.contacts;

    const address = await primarySite.get('address');

    let contact = findPrimaryContact(contacts);

    if (!contact) {
      contact = createPrimaryContact(this.store);
    }

    let secondaryContact = findSecondaryContact(contacts);

    if (!secondaryContact) {
      secondaryContact = createSecondaryContact(this.store);
    }

    const result = {
      site: createValidatedChangeset(site, getSiteValidations(true)),
      adminUnit: createValidatedChangeset(
        administrativeUnitRecord,
        adminUnitValidations,
      ),
      primarySite,
      address: createValidatedChangeset(address, getAddressValidations(true)),
      contact: createValidatedChangeset(contact, contactValidations),
      secondaryContact: createValidatedChangeset(
        secondaryContact,
        secondaryContactValidations,
      ),
    };

    return result;
  }
}

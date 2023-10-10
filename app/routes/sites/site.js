import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  createPrimaryContact,
  createSecondaryContact,
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-contactgegevens-loket/models/contact-point';
import { createValidatedChangeset } from 'frontend-contactgegevens-loket/utils/changeset';
import siteValidations from 'frontend-contactgegevens-loket/validations/sites';
import getAddressValidations from 'frontend-contactgegevens-loket/validations/address';
import {
  primaryContactValidations,
  secondaryContactValidations,
} from 'frontend-contactgegevens-loket/validations/contact';

export default class ContactDataViewSiteRoute extends Route {
  @service store;
  @service currentSession;

  async model(params) {
    const siteId = params.id;
    const site = await this.store.findRecord('site', siteId, {
      reload: true,
      include: 'address,contacts,site-type',
    });
    const contacts = await site.contacts;
    const address = await site.address;

    const primaryContact =
      findPrimaryContact(contacts) ?? createPrimaryContact(this.store);
    const secondaryContact =
      findSecondaryContact(contacts) ?? createSecondaryContact(this.store);

    return {
      site: createValidatedChangeset(site, siteValidations),
      address: createValidatedChangeset(address, getAddressValidations(true)),
      siteId,
      primaryContact: createValidatedChangeset(
        primaryContact,
        primaryContactValidations,
      ),
      secondaryContact: createValidatedChangeset(
        secondaryContact,
        secondaryContactValidations,
      ),
    };
  }
}

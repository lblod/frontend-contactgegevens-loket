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

  async model(params) {
    let siteId = params.id;
    let administrativeUnit = await this.store.findRecord(
      'administrative-unit',
      this.currentSession.group.id,
    );
    let site = await this.store.findRecord('site', siteId, {
      reload: true,
      include: ['address', 'contacts', 'site-type'].join(),
    });

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

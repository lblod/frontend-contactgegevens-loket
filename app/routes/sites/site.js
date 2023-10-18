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
    const siteId = params.id;
    const site = await this.store.findRecord('site', siteId, {
      reload: true,
      include: 'address,contacts,site-type',
    });
    const adminUnit = await this.currentSession.group;
    const contacts = await site.contacts;
    const address = await site.address;

    const primaryContact =
      findPrimaryContact(contacts) ?? createPrimaryContact(this.store);
    const secondaryContact =
      findSecondaryContact(contacts) ?? createSecondaryContact(this.store);
    return {
      site,
      address,
      siteId,
      primaryContact,
      secondaryContact,
      adminUnit,
    };
  }
}

import Route from '@ember/routing/route';
import {
  createPrimaryContact,
  createSecondaryContact,
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-contactgegevens-loket/models/contact-point';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ContactDataViewSiteRoute extends Route {
  @service store;
  @service currentSession;
  @service router;

  @action
  error() {
    this.router.transitionTo('index');
  }

  async model() {
    const params = this.paramsFor('sites.site');
    const siteId = params.id;
    const site = await this.store.findRecord('site', siteId, {
      reload: true,
      include: 'address,contacts,site-type',
    });
    const adminUnit = await this.store.findRecord(
      'administrative-unit',
      this.currentSession.group.id,
      {
        reload: true,
      },
    );

    const contacts = await site.contacts;
    const address = await site.address;
    const primarySite = await this.currentSession.group.get('primarySite');
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
      primarySite,
    };
  }
}

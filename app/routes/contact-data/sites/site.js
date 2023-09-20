import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ContactDataSitesSiteIndexRoute extends Route {
  @service store;

  async model({id}) {
    const site = await this.store.findRecord('site', id);
    const sites = [];

    const primaryContact = (await site.contacts).find(
      (contact) => contact.type === 'Primary'
    );
    const secondaryContact = (await site.contacts).find(
      (contact) => contact.type === 'Secondary'
    );
    return { site, sites, primaryContact, secondaryContact };
  }
}

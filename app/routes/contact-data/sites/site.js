import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ContactDataSitesSiteIndexRoute extends Route {
  @service store;

  async model() {
    const sites = this.modelFor('contact-data.sites');
    let { id: siteId } = this.paramsFor('contact-data.sites.site');
    const site = sites['sites'].find((site) => site.id === siteId);
    const primaryContact = site['contacts'].find(
      (contact) => contact.type === 'Primary',
    );
    const secondaryContact = site['contacts'].find(
      (contact) => contact.type === 'Secondary',
    );
    console.log(
      this.store
        .findRecord('site', '981a82bb-f144-402c-8445-474f62b67a24')
        .then((site) => {
          console.log(site.get('address'));
        }),
    );
    return { site, sites, primaryContact, secondaryContact };
  }
}

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ContactDataSitesOverviewRoute extends Route {
  @service store;
  @service currentSession;

  async model() {
    // TODO: Not every site seems to get an address? Why?
    let sites = await this.currentSession.group.get('sites');
    let primarySite = await this.currentSession.group.get('primarySite');
    console.log('Route word aangeroepen');
    return {
      sites: [...sites, primarySite],
      primarySiteId: primarySite.id,
    };
  }
}

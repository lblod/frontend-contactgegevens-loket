import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ContactDataSitesOverviewRoute extends Route {
  @service store;
  @service currentSession;

  async model() {
    // TODO: Not every site seems to get an address? Why?
    const sites = await this.currentSession.group.get('sites');
    const primarySite = await this.currentSession.group.get('primarySite');

    return {
      sites: [primarySite, ...sites],
      primarySiteId: primarySite.id,
    };
  }
}

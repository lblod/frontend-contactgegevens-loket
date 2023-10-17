import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { sort } from '@ember/object/computed';

export default class ContactDataSitesOverviewRoute extends Route {
  @service store;
  @service currentSession;

  async model() {
    // TODO: Not every site seems to get an address? Why?
    let sites = await this.currentSession.group.get('sites');
    const primarySite = await this.currentSession.group.get('primarySite');

    return {
      sites,
      primarySiteId: primarySite.id,
    };
  }
}
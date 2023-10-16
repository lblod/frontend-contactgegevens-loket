import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ContactDataSitesOverviewRoute extends Route {
  @service store;
  @service currentSession;

  async model() {
    // TODO: Not every site seems to get an address? Why?
    const sites = await this.currentSession.group.get('sites', {
      include: ['address', 'siteType', 'primarySite'],
    });
    return { sites };
  }
}

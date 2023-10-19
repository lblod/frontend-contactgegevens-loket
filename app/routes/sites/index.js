import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
export default class ContactDataViewSiteRoute extends Route {
  @service store;
  @service currentSession;

  async model() {
    // TODO: Not every site seems to get an address? Why?
    let sites = await this.currentSession.group.get('sites');
    let primarySite = await this.currentSession.group.get('primarySite');
    const allSites = A([...sites, primarySite]);
    console.log('allSites', allSites);
    return {
      allSites,
      primarySiteId: primarySite.id,
    };
  }
}

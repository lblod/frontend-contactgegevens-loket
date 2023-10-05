import Route from '@ember/routing/route';

export default class ContactDataViewSiteRoute extends Route {
  async model() {
    return await this.modelFor('sites.site');
  }
}

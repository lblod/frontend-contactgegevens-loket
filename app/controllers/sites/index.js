import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
export default class ContactDataSitesOverviewController extends Controller {
  @service currentSession;
  @service store;

  @action
  async updateSiteModifiedDate(siteId) {
    const site = await this.store.findRecord('site', siteId);
    site.modified = new Date();
    await site.save();
  }
}

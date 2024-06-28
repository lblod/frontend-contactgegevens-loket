import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class SitesSiteIndexController extends Controller {
  constructor() {
    super(...arguments);
  }
  @service currentSession;
  @service session;
  get isPrimarySite() {
    return this.model.site.id === this.model.primarySite.id ? 'Ja' : 'Neen';
  }
}

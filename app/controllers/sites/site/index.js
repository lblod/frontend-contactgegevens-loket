import Controller from '@ember/controller';
export default class SitesSiteIndexController extends Controller {
  constructor() {
    super(...arguments);
  }

  get isPrimarySite() {
    return this.model.site.id === this.model.primarySite.id ? 'Ja' : 'Neen';
  }
}

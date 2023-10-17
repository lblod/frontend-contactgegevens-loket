import Controller from '@ember/controller';

export default class SitesSiteIndexController extends Controller {
  constructor() {
    super(...arguments);
  }

  getIsPrimarySite(site, primarySite) {
    console.log(site.id);
    console.log(primarySite.id);
    if (site.id === primarySite.id) {
      return 'Ja';
    }
    return 'Nee';
  }
}

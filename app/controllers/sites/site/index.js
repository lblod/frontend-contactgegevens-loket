import Controller from '@ember/controller';
import getIsPrimarySite from '../../../utils/get-is-primary-site';
export default class SitesSiteIndexController extends Controller {
  constructor() {
    super(...arguments);
  }

  get isPrimarySite() {
    return getIsPrimarySite(this.model.site, this.model.primarySite);
  }
}

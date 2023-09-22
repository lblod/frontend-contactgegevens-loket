import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ContactDataViewSiteController extends Controller {
  // @service currentSession;

  constructor(...args) {
    super(...args);
    console.log('ContactDataSitesViewController constructed');
  }
}

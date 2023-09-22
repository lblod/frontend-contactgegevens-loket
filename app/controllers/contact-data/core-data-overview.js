import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ContactDataCoreDataOverviewController extends Controller {
  @service currentSession;

  queryParams = ['fake'];

  fake = false;

  get hasContactData() {
    return (
      this.model.address &&
      this.model.primaryContact &&
      this.model.secondaryContact
    );
  }
}

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
export default class CoreDataAdminUnitIndexController extends Controller {
  @service currentSession;

  get adminUnitNoKboAndDistrict() {
    return !this.model.kbo && this.model.isDistrict;
  }
}

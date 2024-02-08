import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
export default class CoreDataAdminUnitIndexController extends Controller {
  @service currentSession;
  get hasKbo() {
    return this.model.kbo && this.model.kbo.localId;
  }
}

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CoreDataAdminUnitEditRoute extends Route {
  @service currentSession;

  async model() {
    return await this.modelFor('core-data.admin-unit');
  }
}

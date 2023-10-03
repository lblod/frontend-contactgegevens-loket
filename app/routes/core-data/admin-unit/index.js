import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CoreDataAdminUnitIndexRoute extends Route {
  @service store;
  @service currentSession;

  async model() {
    const modelFor = await this.modelFor('core-data.admin-unit');
    return modelFor;
  }
}

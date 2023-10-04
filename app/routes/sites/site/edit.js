import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ContactDataEditSiteRoute extends Route {
  @service currentSession;
  @service router;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }

  async model() {
    return await this.modelFor('sites.site');
  }
}

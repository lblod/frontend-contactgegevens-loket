import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import {
  createPrimaryContact,
  createSecondaryContact,
} from 'frontend-contactgegevens-loket/models/contact-point';

export default class CreateSitesNewRoute extends Route {
  @service store;
  @service currentSession;
  @service router;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }
  @action
  async model() {
    const address = this.store.createRecord('address');
    address.country = 'België';
    return {
      adminUnit: this.currentSession.group,
      site: this.store.createRecord('site'),
      address: address,
      primaryContact: createPrimaryContact(this.store),
      secondaryContact: createSecondaryContact(this.store),
    };
  }
}

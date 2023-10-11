import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import {
  createPrimaryContact,
  createSecondaryContact,
} from 'frontend-contactgegevens-loket/models/contact-point';
import { createValidatedChangeset } from 'frontend-contactgegevens-loket/utils/changeset';
import getAddressValidations from 'frontend-contactgegevens-loket/validations/address';
import getSiteValidations from 'frontend-contactgegevens-loket/validations/sites';

import {
  primaryContactValidations,
  secondaryContactValidations,
} from 'frontend-contactgegevens-loket/validations/contact';

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

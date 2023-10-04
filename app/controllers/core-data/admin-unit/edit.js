/* eslint-disable ember/no-get */
import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class CoreDataAdminUnitEditController extends Controller {
  @service router;
  @service currentSession;
  @task
  *save(event) {
    event.preventDefault();

    const {
      adminUnit,
      primarySite,
      organizationStatus,
      address,
      primaryContact,
      secondaryContact,
      kbo,
      ovo,
      nis,
    } = this.model;

    console.log({ kbo, localId: kbo.localId });

    const functionCalls = [
      adminUnit.validate(),
      address.validate(),
      kbo ? kbo.validate() : null,
      ovo ? ovo.validate() : null,
      nis ? nis.validate() : null,
      primaryContact ? primaryContact.validate() : null,
      secondaryContact ? secondaryContact.validate() : null,
    ].filter((item) => item !== null);
    yield Promise.all(functionCalls);
  }

  @action
  cancel(event) {
    event.preventDefault();
    this.router.transitionTo('contact-data.contact-data.index');
  }
}

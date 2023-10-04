/* eslint-disable ember/no-get */
import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class CoreDataAdminUnitEditController extends Controller {
  @service router;
  @service currentSession;

  get formValid() {
    return Object.values(this.model).some((changeSetOrNull) => {
      if (changeSetOrNull === null || !changeSetOrNull.error) return false;
      return Object.values(changeSetOrNull.error).length > 0;
    });
  }

  save = task(async (event) => {
    event.preventDefault();
    const {
      adminUnit,
      address,
      primaryContact,
      secondaryContact,
      kbo,
      ovo,
      nis,
    } = this.model;

    const validateCalls = [
      adminUnit.validate(),
      address.validate(),
      kbo ? kbo.validate() : null,
      ovo ? ovo.validate() : null,
      nis ? nis.validate() : null,
      primaryContact.validate(),
      secondaryContact ? secondaryContact.validate() : null,
    ].filter((item) => item !== null);
    await Promise.all(validateCalls);

    if (!this.formValid) return;

    //Save the models

    //Todo: Error handling
    const saveCalls = [
      adminUnit.save(),
      address.save(),
      kbo ? kbo.save() : null,
      ovo ? ovo.save() : null,
      nis ? nis.save() : null,
      primaryContact.save(),
      secondaryContact ? secondaryContact.save() : null,
    ].filter((item) => item !== null);
    const results = await Promise.allSettled(saveCalls);
    console.log(results);

    this.router.transitionTo('core-data.admin-unit.index');
  });

  @action
  cancel(event) {
    event.preventDefault();
    this.router.transitionTo('core-data.admin-unit.index');
  }
}

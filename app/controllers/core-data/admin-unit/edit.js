/* eslint-disable ember/no-get */
import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { combineFullAddress } from 'frontend-contactgegevens-loket/models/address';

export default class CoreDataAdminUnitEditController extends Controller {
  @service router;
  @service currentSession;

  get formValid() {
    return !Object.values(this.model).some((changeSetOrNull) => {
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

    // !Important. Update full address string before saving
    address.fullAddress = combineFullAddress(address);
    adminUnit.validate();
    address.validate();
    if (kbo) kbo.validate();
    if (ovo) ovo.validate();
    if (nis) nis.validate();
    primaryContact.validate();
    if (secondaryContact) secondaryContact.validate();

    if (!this.formValid) return;

    //Save the models

    //Todo: Error handling when saving goes wrong
    const saveCalls = [
      adminUnit.save(),
      address.save(),
      kbo ? kbo.save() : null,
      ovo ? ovo.save() : null,
      nis ? nis.save() : null,
      primaryContact.save(),
      secondaryContact ? secondaryContact.save() : null,
    ].filter((item) => item !== null);
    const resultOfSave = await Promise.allSettled(saveCalls);
    this.router.transitionTo('core-data.admin-unit.index');
  });

  @action
  cancel(event) {
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
    // Revert to previous
    adminUnit.rollbackAttributes();
    address.rollbackAttributes();
    if (kbo) kbo.rollbackAttributes();
    if (ovo) ovo.rollbackAttributes();
    if (nis) nis.rollbackAttributes();
    primaryContact.rollbackAttributes();
    if (secondaryContact) secondaryContact.rollbackAttributes();
    // Go back to overview
    this.router.transitionTo('core-data.admin-unit.index');
  }
}

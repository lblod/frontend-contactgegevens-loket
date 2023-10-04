import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';

export default class ContactDataEditSiteController extends Controller {
  @service router;

  @dropTask
  *save(event) {
    event.preventDefault();
    yield console.log('save function called');

    const { address, primaryContact, secondaryContact } = this.model;

    const functionCalls = [
      yield address.validate(),
      yield primaryContact.validate(),
      yield secondaryContact ? secondaryContact.validate() : null,
    ];
    yield Promise.all(functionCalls);
  }
}

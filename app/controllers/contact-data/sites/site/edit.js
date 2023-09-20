import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';

export default class ContactDataSitesSiteEditController extends Controller {
  @service router;

  @dropTask
  *save(event) {
    console.log('save function called'); // debug

    event.preventDefault();

    let { site, address, primaryContact, secondaryContact } = this.model;
    console.log('this.model', this.model);
    console.log('site', site);
    console.log('address', address);
    console.log('primaryContact', primaryContact);
    console.log('secondaryContact', secondaryContact);

    yield site.validate();
    yield address.validate();
    yield primaryContact.validate();
    yield secondaryContact.validate();
  }
}

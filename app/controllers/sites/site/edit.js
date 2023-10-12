import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { combineFullAddress } from 'frontend-contactgegevens-loket/models/address';

export default class ContactDataEditSiteController extends Controller {
  @service router;

  save = task(async (event) => {
    console.log('ik geraak in de controllaaaaa');
    event.preventDefault();
    const { site, address, primaryContact, secondaryContact } = this.model;

    address.fullAddress = combineFullAddress(address);

    site.save();
    address.save();
    primaryContact.save();
    secondaryContact ? secondaryContact.save() : null;

    this.router.transitionTo('sites.site.index');
  });

  @action
  cancel(event) {
    event.preventDefault();
    this.router.transitionTo('sites.site.index');
  }
}

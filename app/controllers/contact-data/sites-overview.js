import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ContactDataSitesOverviewController extends Controller {
  @service currentSession;
}

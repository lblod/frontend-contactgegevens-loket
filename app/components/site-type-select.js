import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class SiteTypeSelectComponent extends Component {
  @service store;
  siteTypes;
  constructor(...args) {
    super(...args);

    this.siteTypes = this.store.findAll('site-type');
  }
}

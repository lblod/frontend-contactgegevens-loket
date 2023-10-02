import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
import { CLASSIFICATION_CODE } from '../models/administrative-unit-classification-code';

export default class MunicipalitySelectComponent extends Component {
  @service store;

  municipalities = trackedTask(this, this.loadMunicipalitiesTask, () => [
    this.args.selectedProvince,
  ]);

  @task
  *loadMunicipalitiesTask() {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details
    yield Promise.resolve();

    if (this.args.selectedProvince && this.args.selectedProvince.length) {
      // If a province is selected, load the municipalities in it
      let municipalities = yield this.store.query('bestuurseenheid', {
        filter: {
          'is-sub-organization-of': {
            ':exact:name': this.args.selectedProvince,
          },
          classification: {
            id: CLASSIFICATION_CODE.MUNICIPALITY,
          },
        },
        sort: 'name',
        page: {
          size: 400,
        },
      });

      return municipalities;
    } else {
      // Else load all the municipalities
      const query = {
        filter: {
          classification: {
            id: CLASSIFICATION_CODE.MUNICIPALITY,
          },
        },
        sort: 'name',
        page: {
          size: 400,
        },
      };

      return yield this.store.query('administrative-unit', query);
    }
  }
}

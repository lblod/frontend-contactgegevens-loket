import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
import { CLASSIFICATION_CODE } from '../models/administrative-unit-classification-code';

export default class MunicipalitySelectByNameComponent extends Component {
  @service store;

  loadMunicipalitiesTask = task(async () => {
    const municipalities = await (async () => {
      // If a province is selected, load the municipalities in it
      if (this.args.selectedProvince && this.args.selectedProvince.length) {
        return await this.store.query('administrative-unit', {
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
            size: 400, // There are 300 municipalities in belgium. But this is a very sloppy network call
          },
        });
      } else {
        // Else load all the municipalities
        return await this.store.query('administrative-unit', {
          filter: {
            classification: {
              id: CLASSIFICATION_CODE.MUNICIPALITY,
            },
          },
          sort: 'name',
          page: {
            size: 400,
          },
        });
      }
    })();
    if (!municipalities || municipalities.length === 0)
      throw new Error('Did not receive any municipalities from the back-end.');
    return municipalities.map((item) => item.name);
  });

  municipalities = trackedTask(this, this.loadMunicipalitiesTask, () => [
    this.args.selectedProvince,
  ]);
}

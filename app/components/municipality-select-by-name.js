import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { trackedTask } from 'ember-resources/util/ember-concurrency';
import { CLASSIFICATION_CODE } from '../models/administrative-unit-classification-code';

export default class MunicipalitySelectByNameComponent extends Component {
  @service store;

  municipalities = null;

  loadMunicipalitiesTask = task(async () => {
    if (this.args.selectedProvince && this.args.selectedProvince.length) {
      // If a province is selected, load the municipalities in it
      let municipalities = await this.store.query('administrative-unit', {
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

      return municipalities.map((item) => item.name);
    } else {
      const municipalities = await this.store.query('administrative-unit', {
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

      return municipalities.map((item) => item.name);
    }
  });
}

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { CLASSIFICATION_CODE } from 'frontend-contactgegevens-loket/models/administrative-unit-classification-code';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class ProvinceSelectComponent extends Component {
  @service store;

  loadProvincesTask = task(async () => {
    console.log('Loadprovinces task');
    const provinces = await (async () => {
      // Municipality is selected, get only the province we need
      if (this.args.selectedMunicipality) {
        const result = await this.store.query('administrative-unit', {
          filter: {
            'sub-organizations': {
              ':exact:name': this.args.selectedMunicipality,
            },
            classification: {
              id: CLASSIFICATION_CODE.PROVINCE,
            },
          },
        });
        // Sanit check
        if (result.length !== 1)
          console.warn(
            `Normally a municipality may only be associated with one and only one province. But got a list of ${provinces.lengh} provinces? Something is wrong...`,
          );
        return result.map((item) => item.name);
      }
      // If not municipality selected get ALL provinces
      return await this.store.query('administrative-unit', {
        filter: {
          classification: {
            id: CLASSIFICATION_CODE.PROVINCE,
          },
        },
        sort: 'name',
      });
    })();
    // From the provinces get their names and make them options
    return provinces.map((item) => item.name);
  });

  provinces = trackedTask(this, this.loadProvincesTask, () => [
    this.args.selectedMunicipality,
  ]);
}

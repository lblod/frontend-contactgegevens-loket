import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { CLASSIFICATION_CODE } from 'frontend-contactgegevens-loket/models/administrative-unit-classification-code';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class ProvinceSelectComponent extends Component {
  @service store;

  prevSelectedMunicipality = null;
  prevProvinces = null;

  loadProvincesTask = task(async () => {
    // Short circuit in case the reference but not the value has changed
    // The short circuit prevents infinite cycling between province select and municipality select
    if (this.args.selectedMunicipality === this.prevSelectedMunicipality) {
      return this.prevProvinces;
    }
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
        // Sanity check
        if (result.length !== 1)
          console.warn(
            `Normally a municipality may only be associated with one and only one province. But got a list of ${provinces.lengh} provinces? Something is wrong...`,
          );
        return result;
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
    const result = provinces.map((item) => item.name);
    this.prevProvinces = result;
    this.prevSelectedMunicipality = this.args.selectedMunicipality;
    // From the provinces get their names and make them options
    return provinces.map((item) => item.name);
  });

  // Please note. When an attribute of the address changes (e.g. street) this change tracker fires as well for some reason
  // The shortcut prevents the task from reloading and causing an infinite loop.
  provinces = trackedTask(this, this.loadProvincesTask, () => [
    this.args.selectedMunicipality,
  ]);
}

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { task as trackedTask } from 'ember-resources/util/ember-concurrency';
import { CLASSIFICATION_CODE } from '../models/administrative-unit-classification-code';

export default class MunicipalitySelectByNameComponent extends Component {
  @service store;

  prevSelectedProvince = null;
  prevMunicipalities = null;

  loadMunicipalitiesTask = task(async () => {
    // Short circuit in case the reference but not the value has changed
    // The short circuit prevents infinite cycling between province select and municipality select
    if (this.args.selectedProvince === this.prevSelectedProvince) {
      return this.prevMunicipalities;
    }
    const municipalities = await (async () => {
      // If a province is selected, load the municipalities in it
      if (this.args.selectedProvince) {
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
            size: 400,
          },
        });
      }
      // Else load all the municipalities
      return await this.store.query('administrative-unit', {
        filter: {
          classification: {
            id: CLASSIFICATION_CODE.MUNICIPALITY,
          },
        },
        sort: 'name',
        page: {
          size: 400, // There are 300 municipalities in belgium. We'll get a lot of data at once.
        },
      });
    })();
    if (!municipalities || municipalities.length === 0)
      throw new Error('Did not receive any municipalities from the back-end.');
    //Filter out Agentschap Binnenlands Bestuur as it's not a real gemeente
    const result = municipalities.filter((item) => item.id !== '3183ade3-7ee8-409c-8394-296b1fbfe478').map((item) => item.name)

    this.prevMunicipalities = result;
    this.prevSelectedProvince = this.args.selectedProvince;
    return result;
  });

  // Please note. When an attribute of the address changes (e.g. street) this change tracker fires as well for some reason
  // The shortcut prevents the task from reloading and causing an infinite loop.
  municipalities = trackedTask(this, this.loadMunicipalitiesTask, () => [
    this.args.selectedProvince,
  ]);
}

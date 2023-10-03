import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { CLASSIFICATION_CODE } from '../models/administrative-unit-classification-code';
import { trackedTask } from 'ember-resources/util/ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class ProvinceSelectComponent extends Component {
  @service store;

  @tracked previousMunicipality;
  @tracked previousProvince;

  loadProvincesTask = task(async () => {
    let provinces = [];
    if (
      this.args.selectedMunicipality &&
      this.args.selectedMunicipality.length // SelectedMunicipality may not be 0
    ) {
      if (
        this.previousMunicipality &&
        this.args.selectedMunicipality === this.previousMunicipality
      ) {
        this.args.onChange(this.previousProvince);

        this.provinces.cancel(); //  prevent infinite loop.
        return [this.previousProvince];
      }

      // If a municipality is selected, load the provinces it belongs to
      provinces = await this.store.query('administrative-unit', {
        filter: {
          'sub-organizations': {
            ':exact:name': this.args.selectedMunicipality,
          },
          classification: {
            id: CLASSIFICATION_CODE.PROVINCE,
          },
        },
      });
      if (provinces.length !== 1)
        console.warn(
          `Normally a municipality may only be associated with one and only one province. But got a list of ${provinces.lengh} provinces? Something is wrong...`,
        );
    } else {
      provinces = await this.store.query('administrative-unit', {
        filter: {
          classification: {
            id: CLASSIFICATION_CODE.PROVINCE,
          },
        },
        sort: 'name',
      });
    }
    const names = provinces.map((item) => item.name);
    if (provinces.length === 1) {
      this.previousMunicipality = this.args.selectedMunicipality;
      this.previousProvince = names[0];
      this.args.onChange(this.previousProvince);
    } else {
      this.previousMunicipality = null;
      this.previousProvince = null;
    }
    return names;
  });

  provinces = trackedTask(this, this.loadProvincesTask, () => [
    this.args.selectedMunicipality,
  ]);
}

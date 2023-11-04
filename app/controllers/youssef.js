import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { FORM_GRAPHS } from '../routes/youssef';

export default class YoussefController extends Controller {
  saveTask = task(async (event) => {
    console.log('dit is boven de event preventdefault');
    event.preventDefault();
    console.log('dit is onder de prevent default', event.preventDefault());
    let { adminUnitId, siteId, formData } = this.model;
    console.log(
      `http://localhost:8000/semantic-forms/${adminUnitId}/form/${siteId}`,
    );
    console.log('dit is je siteid', siteId);
    await this.saveFormData(adminUnitId, siteId, formData);
  });

  async saveFormData(adminUnitId, siteId, formData) {
    console.log(
      `http://localhost:8000/semantic-forms/${adminUnitId}/form/${siteId}`,
    );

    await fetch(
      `http://localhost:8000/semantic-forms/${adminUnitId}/form/${siteId}`,
      {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
}

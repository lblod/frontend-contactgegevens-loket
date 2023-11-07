import Controller from '@ember/controller';
import { task, timeout } from 'ember-concurrency';

export default class YoussefController extends Controller {
  get site() {
    return this.model.site;
  }
  get adminUnitId() {
    return this.model.adminUnitId;
  }
  get formData() {
    return this.model.formData;
  }

  saveTask = task(async (siteId, adminUnitId, formData) => {
    // Simulate an asynchronous operation (remove this part in your actual code)
    await timeout(1000);
    await this.model.site.save();

    await this.saveFormData(siteId, adminUnitId, formData);
  });

  // Define the saveFormData function
  async saveFormData(adminUnitId, formData) {
    console.log(`/semantic-forms/${this.model.site.id}/form/site-form`);
    console.log(this.model.site.id);

    console.log('Dit is een call die word gemaakt');
    // Perform the HTTP request to save the form data
    const response = await fetch(
      `/semantic-forms/${this.model.site.id}/form/site-form`,
      {
        method: 'PUT',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return response;
    // console.log(response);
    // return response;
  }
}

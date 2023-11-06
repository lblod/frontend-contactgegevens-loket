import Controller from '@ember/controller';
import { task, timeout } from 'ember-concurrency';
import { action } from '@ember/object';

export default class YoussefController extends Controller {
  @task
  *saveTask(event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    let { adminUnitId, siteId, formData } = this.model;

    console.log(
      `http://localhost:8000/semantic-forms/${adminUnitId}/form/${siteId}`,
    );
    console.log('dit is je siteid', siteId);

    // Simulate an asynchronous operation (remove this part in your actual code)
    yield timeout(1000);

    yield this.saveFormData(adminUnitId, siteId, formData);
  }

  // Define the saveFormData function
  async saveFormData(adminUnitId, siteId, formData) {
    console.log(
      `http://localhost:8000/semantic-forms/${adminUnitId}/form/${siteId}`,
    );

    try {
      console.log('Dit is je siteID', siteId)
      // Perform the HTTP request to save the form data
      const response = await fetch(
        `http://localhost:8000/semantic-forms/${adminUnitId}/form/${siteId}`,
        {
          method: 'POST',
          body: JSON.stringify(formData),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        console.log('success');
      } else {
        console.log('failed');
      }
    } catch (error) {
      // Handle any network or request errors
    }
  }
}

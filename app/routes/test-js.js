import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class TestJsRoute extends Route {
  @service() session;

  async model(params) {
    console.log('Test JS route params', params);
  }
}

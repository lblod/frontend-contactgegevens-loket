import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import LoketSessionService from 'frontend-contactgegevens-loket/services/session';

export default class TestTsRoute extends Route {
  @service() declare session: LoketSessionService;

  async model(params: any) {
    console.log('Test TS route params', params);
  }
}

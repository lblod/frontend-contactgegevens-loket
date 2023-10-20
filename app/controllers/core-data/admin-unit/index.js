import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { CLASSIFICATION_CODE } from 'frontend-contactgegevens-loket/models/administrative-unit-classification-code';

export default class CoreDataAdminUnitIndexController extends Controller {
  @service currentSession;

  get isMunicipality() {
    return this.model.classification.id === CLASSIFICATION_CODE.MUNICIPALITY;
  }
}

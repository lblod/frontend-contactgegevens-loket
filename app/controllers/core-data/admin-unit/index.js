import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { CLASSIFICATION_CODE } from 'frontend-contactgegevens-loket/models/administrative-unit-classification-code';

export default class CoreDataAdminUnitIndexController extends Controller {
  @service currentSession;

  get isMunicipality() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.MUNICIPALITY
    );
  }

  get isIGS() {
    const typesThatAreIGS = [
      CLASSIFICATION_CODE.PROJECTVERENIGING,
      CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
    ];
    return typesThatAreIGS.includes(
      this.model.administrativeUnit.classification?.get('id'),
    );
  }

  get expiredExpectedEndDate() {
    const expectedEndDate = this.model.administrativeUnit.expectedEndDate;
    return expectedEndDate && expectedEndDate < new Date();
  }
}

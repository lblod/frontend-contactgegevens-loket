import Component from '@glimmer/component';
import { CLASSIFICATION } from '../models/administrative-unit-classification-code';
import { ORGANIZATION_LABELS } from '../models/organization-status-code';

export default class CoreDataEditCard extends Component {
  selectStatusOptions = Object.values(ORGANIZATION_LABELS);
  selectRegionOptions = [];
  selectAdminTypeOptions = Object.values(CLASSIFICATION).map(
    (value) => value.label,
  );
}

import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class ContactDataEditCard extends Component {
  get isCountryBelgium() {
    return this.args.address.country === 'België';
  }

  @action
  handleAddressUpdate(newAddress) {
    this.args.onChangeAddress(newAddress);
  }
}

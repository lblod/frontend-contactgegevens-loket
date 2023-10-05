import Component from '@glimmer/component';

export default class AddressRegisterBusNumberSelectorComponent extends Component {
  get placeholder() {
    return this.args.disabled ? '/' : '';
  }
}

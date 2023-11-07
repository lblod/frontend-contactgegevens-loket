import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * @typedef {Object} Address
 * @property {string} country
 * @property {string} province
 * @property {string} municipality
 * @property {string} postalCode
 * @property {string} street
 * @property {string} houseNumber
 * @property {string | null} boxNumber
*/

/**
 * @typedef {'manual'|'automatic'} AddressSearchMode
 */

export default class AuAddressSearchComponent extends Component {
  /** @type {AddressSearchMode | null} */
  @tracked _mode = null;

  /** @type {AddressSearchMode} */
  get mode() {
    return (this._mode ?? this.args.initialMode) ?? 'automatic';
  }

  /** @type {Address | null} */
  _currentAddress = null;

  /** @type {Address | null} */
  get initialAddress() {
    return this.args.initialAddress ?? null;
  }

  /** @type {Address | null} */
  get currentAddress() {
    return this._currentAddress ?? this.initialAddress;
  }

  /** @type {Boolean} */
  get modeSwitchValue() {
    return this.mode === 'automatic';
  }

  @action
  handleModeSwitchChange(automatic) {
    this._mode = automatic ? 'automatic' : 'manual';
  }

}

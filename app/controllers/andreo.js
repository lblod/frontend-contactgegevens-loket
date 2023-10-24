import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class AndreoController extends Controller {
  @action
  validateForm() {
    console.log('validateForm');
  }
}

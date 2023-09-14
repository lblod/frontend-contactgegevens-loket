import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class TestJsController extends Controller {
  @tracked personName = "Pommetje Horlepiep";
  @tracked show = false

  @action
  action() {
    console.log('Action');
    this.show = !this.show;
  }
}

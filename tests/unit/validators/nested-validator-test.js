import { module, test } from 'qunit';
import validateNestedValidator from 'frontend-contactgegevens-loket/validators/nested-validator';

module('Unit | Validator | nested-validator');

test('it exists', function (assert) {
  assert.ok(validateNestedValidator());
});

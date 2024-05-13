import { helper } from '@ember/component/helper';
import { isBefore } from 'date-fns';

export function isModifiedWithinLast6Months(params) {
  const [modifiedDate] = params;
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  let result = {};
  if (isBefore(new Date(modifiedDate), sixMonthsAgo)) {
    result = { skin: 'warning', icon: 'alert-triangle' };
  } else {
    result = { skin: 'success', icon: 'circle-check' };
  }
  return result;
}

export default helper(isModifiedWithinLast6Months);

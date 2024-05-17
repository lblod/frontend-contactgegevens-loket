import { helper } from '@ember/component/helper';
import { format, isBefore } from 'date-fns';

export function isModifiedWithinLast6Months([modifiedDate]) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const today = new Date();
  let result = {};
  if (format(today, 'dd-MM-yyyy') === format(modifiedDate, 'dd-MM-yyyy')) {
    result = { skin: 'success', icon: 'circle-check' };
  } else if (isBefore(new Date(modifiedDate), sixMonthsAgo)) {
    result = { skin: 'warning', icon: 'alert-triangle' };
  } else if (format(modifiedDate, 'dd-MM-yyyy') === undefined || null) {
    result = { skin: 'warning', icon: 'alert-triangle' };
  } else {
    result = { skin: 'regular', icon: 'info-circle' };
  }
  return result;
}

export default helper(isModifiedWithinLast6Months);

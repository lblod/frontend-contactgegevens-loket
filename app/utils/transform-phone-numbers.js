export function transformPhoneNumbers(tel) {
  if (tel) {
    if (!tel.includes('tel')) {
      tel = 'tel:' + tel;
    }
  }
  return tel;
}

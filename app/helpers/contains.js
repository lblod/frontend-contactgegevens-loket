export default function contains(list, item) {
  const validationError = new Error(
    'Contains helper takes an array as first element and requires a second element of any primitive type',
  );
  if (!(list instanceof Array)) throw validationError;
  if (!item) throw validationError;
  return list.includes(item);
}

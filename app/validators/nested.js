export default function validateNested(nestedKey, validator) {
  return (key, newValue, oldValue, changes, content) => {
    return validator(
      nestedKey,
      newValue,
      oldValue,
      changes,
      content.get(nestedKey),
    );
  };
}

export function setEmptyStringsToNull(changeset) {
  for (const property in changeset) {
    if (changeset.hasOwnProperty(property) && changeset[property] === '') {
      changeset[property] = null;
    }
  }

  return changeset;
}

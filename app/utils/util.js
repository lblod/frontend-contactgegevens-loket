/**
 * Tries to find a contact with a specific type and return it. Returns null if not found
 */
export function findContactByType(contacts, contactType) {
  if (contacts.length === 0) return null;
  const result = contacts.find(
    (contactPoint) => contactPoint.type === contactType,
  );
  if (!result) return null;
  return result;
}

/**
 * Tries to find a structured identifier in an identifier array (ember array) efficiently. Returns null if not found.
 */
export async function findStructuredIdentifierByIdName(identifiers, idName) {
  if (identifiers.length === 0) return null;
  const resultIdentifier = identifiers.find(
    (identifier) => identifier.idName === idName,
  );
  if (!resultIdentifier) return null;
  const structuredIdentifier = await resultIdentifier.structuredIdentifier;
  if (!structuredIdentifier)
    throw new Error(
      `Identifier with id ${identifier.id} does not have an associated structuredIdentifier. Is not possible.`,
    );
  return structuredIdentifier;
}

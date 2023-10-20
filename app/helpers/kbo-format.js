const unformattedKboRegex = /[0-1][0-9]{9}/;

export default function kboFormat(kbo) {
  if (!(typeof kbo === 'string'))
    throw new Error(
      'kboFormat helper requires a single argument which has to be a string.',
    );
  if (!kbo.match(unformattedKboRegex)) {
    console.warn(
      `Kbo numbers in the backend are supposed to be formatted as a continuous sequence of 10 digits of which the first digit is either 0 or 1. Found "${kbo}". Bad data quality`,
    );
    return kbo;
  }
  const [one, two, three] = [
    kbo.slice(0, 4),
    kbo.slice(4, 7),
    kbo.slice(7, 10),
  ];
  return `${one}.${two}.${three}`;
}

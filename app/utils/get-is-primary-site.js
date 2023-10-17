export default function getIsPrimarySite(site, primarySite) {
  if (site.id === primarySite.id) {
    return 'Ja';
  }
  return 'Neen';
}

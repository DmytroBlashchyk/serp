import axios from 'axios';

async function getGoogleDomains() {
  const googleDomain = axios.get(
    'https://assets.api-cdn.com/valueserp/valueserp_google_domains.json',
  );
  const result = await googleDomain.then((result) => {
    return result.data as { google_domain: string; country_name: string }[];
  });
  return result.map((item) => {
    return {
      name: item.google_domain,
      countryName: item.country_name,
    };
  });
}
export const googleDomains = getGoogleDomains();

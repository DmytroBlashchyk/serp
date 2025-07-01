import axios from 'axios';
import process from 'process';

async function getLanguages(): Promise<
  {
    language_name: string;
    language_code: string;
  }[]
> {
  const locations = axios.get(
    'https://api.dataforseo.com/v3/serp/google/languages',
    {
      auth: {
        username: process.env.DATA_FOR_SEO_LOGIN,
        password: process.env.DATA_FOR_SEO_PASSWORD,
      },
      headers: {
        'content-type': 'application/json',
      },
    },
  );
  const result = await locations.then((result) => {
    return result.data.tasks[0].result;
  });
  return result;
}
export const languages = getLanguages();

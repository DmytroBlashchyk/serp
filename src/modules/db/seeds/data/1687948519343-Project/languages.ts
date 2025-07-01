const { getLangNameFromCode, getLangCodeList } = require('language-name-map');

function getLanguages() {
  const languageCodes = getLangCodeList();
  const language = [];
  for (const languageCode of languageCodes) {
    language.push({
      name: getLangNameFromCode(`${languageCode}`),
      code: languageCode ?? '',
    });
  }
  return language;
}

export const languages = getLanguages().map((item) => {
  return {
    name: item.name.name,
    code: item.code,
  };
});

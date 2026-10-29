// Textes de l'interface dans la langue de Chrome, lus dans _locales/<langue>/messages.json
// (l'anglais quand la langue n'est pas traduite).
// Dans le HTML : data-i18n="clé" pour le texte, data-i18n-placeholder, data-i18n-title
// et data-i18n-aria-label pour les attributs.
const t = (key, ...subs) => chrome.i18n.getMessage(key, subs.map(String)) || key;

const translatePage = (root = document) => {
  for (const el of root.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const attr of ['placeholder', 'title', 'aria-label']) {
    for (const el of root.querySelectorAll(`[data-i18n-${attr}]`)) el.setAttribute(attr, t(el.getAttribute(`data-i18n-${attr}`)));
  }
  document.documentElement.lang = chrome.i18n.getUILanguage();
  document.documentElement.dir = chrome.i18n.getMessage('@@bidi_dir') || 'ltr';
};

translatePage();

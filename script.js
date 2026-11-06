const toggle = document.getElementById('language-toggle');
const cvLink = document.getElementById('cv-link');
let translations;

function setLanguage(lang) {
  const content = translations[lang];
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const value = content[el.dataset.i18n];
    if (value !== undefined) el.textContent = value;
  });
  document.querySelectorAll('[data-i18n-list]').forEach(el => {
    el.replaceChildren(...content[el.dataset.i18nList].map(text => {
      const item = document.createElement('span');
      item.textContent = text;
      return item;
    }));
  });
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    el.dataset.i18nAttr.split(',').forEach(attribute => {
      const [name, key] = attribute.split(':');
      el.setAttribute(name, content[key]);
    });
  });
  cvLink.href = lang === 'en' ? 'cv-en.pdf' : 'cv-sv.pdf';
  try { localStorage.setItem('portfolio-lang',lang); } catch (_) {}
}

async function initialize() {
  const response = await fetch('content.json');
  if (!response.ok) throw new Error(`Could not load content.json: ${response.status}`);
  translations = await response.json();
  let saved = 'en';
  try { saved = localStorage.getItem('portfolio-lang') || (navigator.language.toLowerCase().startsWith('sv') ? 'sv' : 'en'); } catch (_) {}
  setLanguage(saved === 'sv' ? 'sv' : 'en');
  toggle.addEventListener('click',() => setLanguage(document.documentElement.lang === 'en' ? 'sv' : 'en'));
  document.getElementById('year').textContent = new Date().getFullYear();
}

initialize().catch(error => {
  console.error(error);
});

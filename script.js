const toggle = document.getElementById('language-toggle');
const cvLink = document.getElementById('cv-link');
const projectDialog = document.getElementById('project-dialog');
let translations;

function resolveContent(value) {
  if (Array.isArray(value)) return value.map(resolveContent);
  if (value && typeof value === 'object') {
    if (Object.keys(value).length === 1 && Array.isArray(value.$join)) {
      if (!value.$join.every(segment => typeof segment === 'string')) {
        throw new Error('String segments must all be strings');
      }
      return value.$join.join(' ');
    }
    return Object.keys(value).reduce((resolved, key) => {
      resolved[key] = resolveContent(value[key]);
      return resolved;
    }, {});
  }
  return value;
}

function renderProjectImages(container, images) {
  container.replaceChildren(...images.map(({ src, alt }) => {
    const image = document.createElement('img');
    image.src = src;
    image.alt = alt;
    image.loading = 'lazy';
    return image;
  }));
}

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
  document.querySelectorAll('[data-i18n-images]').forEach(el => {
    renderProjectImages(el, content[el.dataset.i18nImages]);
  });
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    el.dataset.i18nAttr.split(',').forEach(attribute => {
      const [name, key] = attribute.split(':');
      el.setAttribute(name, content[key]);
    });
  });
  if (projectDialog.open) {
    showProjectDetails(projectDialog.dataset.activeProject);
  }
  cvLink.href = lang === 'en' ? 'cv-en.pdf' : 'cv-sv.pdf';
  try { localStorage.setItem('portfolio-lang',lang); } catch (_) {}
}

function showProjectDetails(project) {
  const content = translations[document.documentElement.lang];
  document.getElementById('project-dialog-title').textContent = content[`${project}Title`];
  document.getElementById('project-dialog-description').textContent = content[`${project}More`];
  renderProjectImages(document.getElementById('project-dialog-images'), content[`${project}Images`]);
  const links = document.getElementById('project-dialog-links');
  links.replaceChildren(...content[`${project}Links`].map(({ label, url }) => {
    const link = document.createElement('a');
    link.className = 'button primary';
    link.href = url;
    link.textContent = label;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  }));
}

async function initialize() {
  const response = await fetch('content.json');
  if (!response.ok) throw new Error(`Could not load content.json: ${response.status}`);
  translations = resolveContent(await response.json());
  let saved = 'en';
  try { saved = localStorage.getItem('portfolio-lang') || (navigator.language.toLowerCase().startsWith('sv') ? 'sv' : 'en'); } catch (_) {}
  setLanguage(saved === 'sv' ? 'sv' : 'en');
  toggle.addEventListener('click',() => setLanguage(document.documentElement.lang === 'en' ? 'sv' : 'en'));
  document.querySelectorAll('[data-project]').forEach(card => {
    card.addEventListener('click',() => {
      projectDialog.dataset.activeProject = card.dataset.project;
      showProjectDetails(card.dataset.project);
      projectDialog.showModal();
    });
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        card.click();
      }
    });
  });
  projectDialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      projectDialog.close();
    }
  });
  document.getElementById('year').textContent = new Date().getFullYear();
}

initialize().catch(error => {
  console.error(error);
});

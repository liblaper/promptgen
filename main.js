const STORAGE_KEY = 'promptForgeProjects';
const MAX_SAVED = 12;

const templates = {
  clima: {
    projectName: 'Estación climática de escritorio',
    board: 'ESP32 DevKit v1',
    experience: 'principiante',
    goal: 'Medir temperatura, humedad y presión cada 30 segundos. Mostrar los datos en una pantalla OLED y crear una página web local accesible desde el móvil cuando el ESP32 esté conectado a Wi-Fi.',
    components: 'Sensor BME280, pantalla OLED I2C 0.96, ESP32 DevKit v1, protoboard y cables Dupont.',
    connectivity: 'Wi-Fi',
    power: 'USB 5 V',
    constraints: 'Explicar la dirección I2C, evitar bloqueos si el sensor no responde y mostrar un mensaje de error en pantalla.'
  },
  riego: {
    projectName: 'Riego automático para macetas',
    board: 'ESP32 DevKit v1',
    experience: 'principiante',
    goal: 'Leer la humedad del sustrato y activar una bomba durante unos segundos cuando la tierra esté seca. Mostrar el estado con un LED y permitir ajustar el umbral desde una página web local.',
    components: 'Sensor capacitivo de humedad, módulo relé, mini bomba de agua de 5 V, depósito, LED verde, resistencia de 220 ohm y fuente externa.',
    connectivity: 'Wi-Fi',
    power: '5 V regulados',
    constraints: 'No alimentar la bomba desde un pin del ESP32. Incluir diodo o protección adecuada, masa común y un modo seguro al arrancar.'
  },
  alarma: {
    projectName: 'Alarma de apertura con aviso IoT',
    board: 'ESP32-C3 SuperMini',
    experience: 'intermedio',
    goal: 'Detectar la apertura de una puerta con un sensor magnético, activar un zumbador durante 10 segundos y publicar un aviso MQTT con el estado y la hora del evento.',
    components: 'ESP32-C3 SuperMini, sensor reed, zumbador activo, LED rojo, resistencia de 220 ohm y pulsador de desarme.',
    connectivity: 'Wi-Fi y MQTT',
    power: 'USB 5 V',
    constraints: 'Usar resistencia pull-up interna si es estable. Añadir antirrebote, reconexión Wi-Fi/MQTT y no bloquear el bucle principal.'
  }
};

const $ = (id) => document.getElementById(id);
let localCatalog = {};

const t = (key, values) => {
  if (typeof window.miniappI18n?.t === 'function') return window.miniappI18n.t(key, values);
  const parts = key.split('.');
  let value = localCatalog;
  for (const part of parts) value = value?.[part];
  if (typeof value !== 'string') return key;
  return Object.entries(values || {}).reduce((text, [name, replacement]) => text.replaceAll(`{${name}}`, String(replacement)), value);
};

function getStorage() {
  if (window.miniappsAI?.storage) return window.miniappsAI.storage;
  return {
    getItem: async (key) => window.localStorage.getItem(key),
    setItem: async (key, value) => window.localStorage.setItem(key, value)
  };
}

async function loadCatalog() {
  if (window.miniappI18n?.t) return;
  try {
    const response = await fetch('./locales/es-419.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('locale unavailable');
    localCatalog = await response.json();
  } catch (error) {
    localCatalog = {};
  }
}

function localizeDocument() {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel));
  });
}

let savedProjects = [];
let currentProject = null;
let noticeTimer;

function showNotice(message, type = '') {
  const notice = $('appNotice');
  if (!notice) return;
  notice.textContent = message;
  notice.className = `notice${type ? ` ${type}` : ''}`;
  notice.hidden = false;
  window.clearTimeout(noticeTimer);
  noticeTimer = window.setTimeout(() => { notice.hidden = true; }, 4200);
}

async function readProjects() {
  try {
    const raw = await getStorage().getItem(STORAGE_KEY);
    if (raw === null || raw === undefined) {
      const seeds = [makeSeed('clima'), makeSeed('riego')];
      savedProjects = seeds;
      await writeProjects();
      return;
    }
    const parsed = JSON.parse(raw);
    savedProjects = Array.isArray(parsed) ? parsed.filter(isProject) : [];
  } catch (error) {
    savedProjects = [];
    showNotice(t('messages.storageReadError'), 'error');
  }
  renderSavedProjects();
}

async function writeProjects() {
  try {
    await getStorage().setItem(STORAGE_KEY, JSON.stringify(savedProjects));
    renderSavedProjects();
  } catch (error) {
    showNotice(t('messages.storageWriteError'), 'error');
  }
}

function isProject(value) {
  return Boolean(value && typeof value === 'object' && value.id && value.projectName && value.prompt);
}

function makeSeed(templateKey) {
  const data = { ...templates[templateKey] };
  return { ...data, id: `seed-${templateKey}`, prompt: buildPrompt(data), createdAt: Date.now() - (templateKey === 'clima' ? 86400000 : 172800000) };
}

function formData() {
  return {
    projectName: $('projectName').value.trim(),
    board: $('board').value,
    experience: $('experience').value,
    goal: $('goal').value.trim(),
    components: $('components').value.trim() || t('prompt.notSpecified'),
    connectivity: $('connectivity').value,
    power: $('power').value,
    constraints: $('constraints').value.trim() || t('prompt.none')
  };
}

function buildPrompt(data) {
  const experience = t(`form.experience${data.experience.charAt(0).toUpperCase()}${data.experience.slice(1)}`);
  return `${t('prompt.role')}\n\n${t('prompt.project')}\n- ${t('prompt.name')}: ${data.projectName}\n- ${t('prompt.board')}: ${data.board}\n- ${t('prompt.experience')}: ${experience}\n- ${t('prompt.connectivity')}: ${data.connectivity}\n- ${t('prompt.power')}: ${data.power}\n\n${t('prompt.objective')}\n${data.goal}\n\n${t('prompt.available')}\n${data.components}\n\n${t('prompt.constraints')}\n${data.constraints}\n\n${t('prompt.deliverables')}\n1. ${t('prompt.delivery1')}\n2. ${t('prompt.delivery2')}\n3. ${t('prompt.delivery3')}\n4. ${t('prompt.delivery4')}\n5. ${t('prompt.delivery5')}\n6. ${t('prompt.delivery6')}\n\n${t('prompt.rules')}\n- ${t('prompt.rule1')}\n- ${t('prompt.rule2')}\n- ${t('prompt.rule3')}\n- ${t('prompt.rule4')}\n- ${t('prompt.rule5')}\n\n${t('prompt.format')}\n${t('prompt.formatText')}`;
}

function updateOutput(project) {
  currentProject = project;
  $('emptyOutput').hidden = true;
  $('generatedOutput').hidden = false;
  $('promptResult').textContent = project.prompt;
  const words = project.prompt.trim().split(/\s+/).filter(Boolean).length;
  $('promptWordCount').textContent = t('output.wordCount', { count: words });
  $('outputState').textContent = t('output.readyState');
  $('outputState').classList.add('ready');
}

function fillForm(data) {
  for (const field of ['projectName', 'board', 'experience', 'goal', 'components', 'connectivity', 'power', 'constraints']) {
    if ($(field) && data[field] !== undefined) $(field).value = data[field];
  }
}

function renderSavedProjects() {
  const list = $('savedList');
  const empty = $('savedEmpty');
  $('savedCount').textContent = String(savedProjects.length);
  list.replaceChildren();
  empty.hidden = savedProjects.length > 0;
  list.hidden = savedProjects.length === 0;
  savedProjects.forEach((project) => {
    const card = document.createElement('article');
    card.className = 'saved-card';
    const title = document.createElement('h3');
    title.textContent = project.projectName;
    const summary = document.createElement('p');
    summary.textContent = project.goal;
    const meta = document.createElement('div');
    meta.className = 'saved-card-meta';
    const board = document.createElement('span');
    board.textContent = project.board;
    const actions = document.createElement('div');
    actions.className = 'card-actions';
    const load = document.createElement('button');
    load.type = 'button';
    load.className = 'card-action';
    load.textContent = t('saved.load');
    load.addEventListener('click', () => { fillForm(project); updateOutput(project); window.scrollTo({ top: 0, behavior: 'smooth' }); showNotice(t('messages.loaded'), 'success'); });
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'card-action delete';
    remove.textContent = t('saved.delete');
    remove.addEventListener('click', () => removeProject(project.id));
    actions.append(load, remove);
    meta.append(board, actions);
    card.append(title, summary, meta);
    list.append(card);
  });
}

async function removeProject(id) {
  savedProjects = savedProjects.filter((project) => project.id !== id);
  await writeProjects();
  showNotice(t('messages.deleted'), 'success');
}

async function saveCurrent() {
  if (!currentProject) return;
  const project = { ...currentProject, id: `project-${Date.now()}`, createdAt: Date.now() };
  savedProjects = [project, ...savedProjects.filter((item) => item.projectName !== project.projectName)].slice(0, MAX_SAVED);
  await writeProjects();
  showNotice(t('messages.saved'), 'success');
}

async function copyPrompt() {
  if (!currentProject) return;
  try {
    await navigator.clipboard.writeText(currentProject.prompt);
    showNotice(t('messages.copied'), 'success');
  } catch (error) {
    const range = document.createRange();
    range.selectNodeContents($('promptResult'));
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    showNotice(t('messages.copyFallback'));
  }
}

function downloadPrompt() {
  if (!currentProject) return;
  const blob = new Blob([currentProject.prompt], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${slugify(currentProject.projectName) || 'prompt-schematik'}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
  showNotice(t('messages.downloaded'), 'success');
}

function slugify(value) { return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

function applyTemplate(key) {
  const data = templates[key];
  if (!data) return;
  fillForm(data);
  showNotice(t('messages.templateApplied'), 'success');
  $('projectName').focus();
}

function handleSubmit(event) {
  event.preventDefault();
  const data = formData();
  if (!data.projectName || !data.goal) {
    showNotice(t('messages.required'), 'error');
    $('projectName').focus();
    return;
  }
  const button = event.submitter || document.querySelector('.primary-button');
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  window.setTimeout(() => {
    updateOutput({ ...data, id: `draft-${Date.now()}`, prompt: buildPrompt(data), createdAt: Date.now() });
    button.disabled = false;
    button.removeAttribute('aria-busy');
    $('outputTitle').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 320);
}

async function init() {
  await loadCatalog();
  localizeDocument();
  $('promptForm')?.addEventListener('submit', handleSubmit);
  $('copyButton')?.addEventListener('click', copyPrompt);
  $('saveButton')?.addEventListener('click', saveCurrent);
  $('downloadButton')?.addEventListener('click', downloadPrompt);
  document.querySelectorAll('[data-template]').forEach((button) => button.addEventListener('click', () => applyTemplate(button.dataset.template)));
  readProjects();
}

document.addEventListener('DOMContentLoaded', init);
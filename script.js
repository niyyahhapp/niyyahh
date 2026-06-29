const STORAGE_KEY = "ayahCanvasState.v1";
const AYAH_CACHE_KEY = "ayahCanvasAyahCache.v1";
const MAX_REFLECTION_LENGTH = 600;
const LOOKUP_DEBOUNCE_MS = 850;
const API_BASE_URL = "https://api.alquran.cloud/v1/ayah";

const surahs = [
  ["Al-Fatihah", 7],
  ["Al-Baqarah", 286],
  ["Ali 'Imran", 200],
  ["An-Nisa", 176],
  ["Al-Ma'idah", 120],
  ["Al-An'am", 165],
  ["Al-A'raf", 206],
  ["Al-Anfal", 75],
  ["At-Tawbah", 129],
  ["Yunus", 109],
  ["Hud", 123],
  ["Yusuf", 111],
  ["Ar-Ra'd", 43],
  ["Ibrahim", 52],
  ["Al-Hijr", 99],
  ["An-Nahl", 128],
  ["Al-Isra", 111],
  ["Al-Kahf", 110],
  ["Maryam", 98],
  ["Taha", 135],
  ["Al-Anbya", 112],
  ["Al-Hajj", 78],
  ["Al-Mu'minun", 118],
  ["An-Nur", 64],
  ["Al-Furqan", 77],
  ["Ash-Shu'ara", 227],
  ["An-Naml", 93],
  ["Al-Qasas", 88],
  ["Al-'Ankabut", 69],
  ["Ar-Rum", 60],
  ["Luqman", 34],
  ["As-Sajdah", 30],
  ["Al-Ahzab", 73],
  ["Saba", 54],
  ["Fatir", 45],
  ["Ya-Sin", 83],
  ["As-Saffat", 182],
  ["Sad", 88],
  ["Az-Zumar", 75],
  ["Ghafir", 85],
  ["Fussilat", 54],
  ["Ash-Shuraa", 53],
  ["Az-Zukhruf", 89],
  ["Ad-Dukhan", 59],
  ["Al-Jathiyah", 37],
  ["Al-Ahqaf", 35],
  ["Muhammad", 38],
  ["Al-Fath", 29],
  ["Al-Hujurat", 18],
  ["Qaf", 45],
  ["Adh-Dhariyat", 60],
  ["At-Tur", 49],
  ["An-Najm", 62],
  ["Al-Qamar", 55],
  ["Ar-Rahman", 78],
  ["Al-Waqi'ah", 96],
  ["Al-Hadid", 29],
  ["Al-Mujadila", 22],
  ["Al-Hashr", 24],
  ["Al-Mumtahanah", 13],
  ["As-Saff", 14],
  ["Al-Jumu'ah", 11],
  ["Al-Munafiqun", 11],
  ["At-Taghabun", 18],
  ["At-Talaq", 12],
  ["At-Tahrim", 12],
  ["Al-Mulk", 30],
  ["Al-Qalam", 52],
  ["Al-Haqqah", 52],
  ["Al-Ma'arij", 44],
  ["Nuh", 28],
  ["Al-Jinn", 28],
  ["Al-Muzzammil", 20],
  ["Al-Muddaththir", 56],
  ["Al-Qiyamah", 40],
  ["Al-Insan", 31],
  ["Al-Mursalat", 50],
  ["An-Naba", 40],
  ["An-Nazi'at", 46],
  ["'Abasa", 42],
  ["At-Takwir", 29],
  ["Al-Infitar", 19],
  ["Al-Mutaffifin", 36],
  ["Al-Inshiqaq", 25],
  ["Al-Buruj", 22],
  ["At-Tariq", 17],
  ["Al-A'la", 19],
  ["Al-Ghashiyah", 26],
  ["Al-Fajr", 30],
  ["Al-Balad", 20],
  ["Ash-Shams", 15],
  ["Al-Layl", 21],
  ["Ad-Duhaa", 11],
  ["Ash-Sharh", 8],
  ["At-Tin", 8],
  ["Al-'Alaq", 19],
  ["Al-Qadr", 5],
  ["Al-Bayyinah", 8],
  ["Az-Zalzalah", 8],
  ["Al-'Adiyat", 11],
  ["Al-Qari'ah", 11],
  ["At-Takathur", 8],
  ["Al-'Asr", 3],
  ["Al-Humazah", 9],
  ["Al-Fil", 5],
  ["Quraysh", 4],
  ["Al-Ma'un", 7],
  ["Al-Kawthar", 3],
  ["Al-Kafirun", 6],
  ["An-Nasr", 3],
  ["Al-Masad", 5],
  ["Al-Ikhlas", 4],
  ["Al-Falaq", 5],
  ["An-Nas", 6],
].map(([name, ayahs], index) => ({ number: index + 1, name, ayahs }));

const defaultState = {
  reference: "",
  ayahText: "",
  translation: "",
  surahName: "",
  surahNumber: "",
  ayahNumber: "",
  reflection: "",
  theme: "sage",
  composition: "classic",
  shareMode: false,
};

const reflectionPrompts = [
  "What does this ayah make clear?",
  "What do you want to remember from this?",
  "What would you tell a friend about this ayah?",
  "What part of this ayah feels close today?",
  "What action does this ayah point you toward?",
  "What du'a comes from this reflection?",
];

let state = { ...defaultState };
let ayahCache = {};
let lastResetState = null;
let saveTimer = null;
let counterTimer = null;
let lookupTimer = null;
let activeLookupKey = "";

const elements = {};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();
  ayahCache = readAyahCache();
  populateSurahSelect();
  state = sanitizeState({ ...defaultState, ...readSavedState() });
  hydrateForm();
  bindEvents();
  applyTheme(state.theme);
  applyComposition(state.composition);
  applyShareMode(state.shareMode);
  updateCounter(false);
  updateLoadedAyah();
  updatePreview();
  autosizeAllTextareas();
}

function cacheElements() {
  elements.form = document.querySelector("#reflectionForm");
  elements.textareas = Array.from(document.querySelectorAll("textarea"));
  elements.reference = document.querySelector("#ayahReference");
  elements.searchButton = document.querySelector("#searchButton");
  elements.lookupSpinner = document.querySelector("#lookupSpinner");
  elements.lookupMessage = document.querySelector("#lookupMessage");
  elements.surahSelect = document.querySelector("#surahSelect");
  elements.ayahSelect = document.querySelector("#ayahSelect");
  elements.loadedAyah = document.querySelector("#loadedAyah");
  elements.loadedSurah = document.querySelector("#loadedSurah");
  elements.loadedTranslation = document.querySelector("#loadedTranslation");
  elements.reflection = document.querySelector("#reflection");
  elements.charCounter = document.querySelector("#charCounter");
  elements.promptButton = document.querySelector("#promptButton");
  elements.promptText = document.querySelector("#promptText");
  elements.themeButtons = Array.from(document.querySelectorAll(".theme-button[data-theme]"));
  elements.compositionButtons = Array.from(
    document.querySelectorAll(".composition-button[data-composition]"),
  );
  elements.generateButton = document.querySelector("#generateButton");
  elements.exportButton = document.querySelector("#exportButton");
  elements.copyReflectionButton = document.querySelector("#copyReflectionButton");
  elements.copyCardButton = document.querySelector("#copyCardButton");
  elements.shareModeButton = document.querySelector("#shareModeButton");
  elements.resetButton = document.querySelector("#resetButton");
  elements.undoResetButton = document.querySelector("#undoResetButton");
  elements.statusLine = document.querySelector("#statusLine");
  elements.saveState = document.querySelector("#saveState");
  elements.previewPanel = document.querySelector(".preview-panel");
  elements.card = document.querySelector("#reflectionCard");
  elements.emptyState = document.querySelector("#emptyState");
  elements.cardContent = document.querySelector("#cardContent");
  elements.previewSurahName = document.querySelector("#previewSurahName");
  elements.previewReference = document.querySelector("#previewReference");
  elements.previewAyah = document.querySelector("#previewAyah");
  elements.previewTranslation = document.querySelector("#previewTranslation");
  elements.previewReflection = document.querySelector("#previewReflection");
}

function bindEvents() {
  elements.reference.addEventListener("input", () => {
    state.reference = elements.reference.value;
    queueSave();
    scheduleReferenceLookup();
  });

  elements.reference.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      lookupFromReference(true);
    }
  });

  elements.searchButton.addEventListener("click", () => lookupFromReference(true));

  elements.surahSelect.addEventListener("change", () => {
    populateAyahSelect(Number(elements.surahSelect.value), 1);
    lookupFromSelects();
  });

  elements.ayahSelect.addEventListener("change", lookupFromSelects);

  elements.reflection.addEventListener("input", () => {
    state.reflection = elements.reflection.value;
    updateCounter(true);
    autosizeTextarea(elements.reflection);
    updatePreview();
    queueSave();
  });

  elements.themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.theme = button.dataset.theme;
      applyTheme(state.theme);
      updatePreview();
      queueSave();
    });
  });

  elements.compositionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.composition = button.dataset.composition;
      applyComposition(state.composition);
      updatePreview();
      queueSave();
    });
  });

  elements.promptButton.addEventListener("click", showRandomPrompt);
  elements.generateButton.addEventListener("click", generateCard);
  elements.exportButton.addEventListener("click", exportCardAsPng);
  elements.copyReflectionButton.addEventListener("click", copyReflection);
  elements.copyCardButton.addEventListener("click", copyCardText);
  elements.shareModeButton.addEventListener("click", toggleShareMode);
  elements.resetButton.addEventListener("click", resetInputs);
  elements.undoResetButton.addEventListener("click", undoReset);
  document.addEventListener("keydown", handleKeyboardShortcuts);
}

function populateSurahSelect() {
  elements.surahSelect.innerHTML = surahs
    .map((surah) => `<option value="${surah.number}">${surah.number}. ${surah.name}</option>`)
    .join("");
  populateAyahSelect(1, 1);
}

function populateAyahSelect(surahNumber, selectedAyah) {
  const surah = surahs[surahNumber - 1] || surahs[0];
  const ayahOptions = Array.from({ length: surah.ayahs }, (_, index) => {
    const ayah = index + 1;
    return `<option value="${ayah}">${ayah}</option>`;
  }).join("");

  elements.ayahSelect.innerHTML = ayahOptions;
  elements.ayahSelect.value = String(Math.min(selectedAyah, surah.ayahs));
}

function hydrateForm() {
  elements.reference.value = state.reference;
  elements.reflection.value = state.reflection;

  if (state.surahNumber) {
    elements.surahSelect.value = String(state.surahNumber);
    populateAyahSelect(Number(state.surahNumber), Number(state.ayahNumber) || 1);
  }
}

function scheduleReferenceLookup() {
  clearTimeout(lookupTimer);
  const parsed = parseReference(elements.reference.value);

  if (!elements.reference.value.trim()) {
    clearAyahData(false);
    setLookupMessage("Try 2:255, 36:58, or 55:13.");
    return;
  }

  if (!parsed) {
    setLookupMessage("Use a reference like 2:255.");
    return;
  }

  setLookupMessage("Ready to search.");
  lookupTimer = window.setTimeout(() => lookupAyah(parsed.surah, parsed.ayah), LOOKUP_DEBOUNCE_MS);
}

function lookupFromReference(immediate) {
  clearTimeout(lookupTimer);
  const parsed = parseReference(elements.reference.value);

  if (!parsed) {
    setLookupMessage("Use a reference like 2:255.");
    return;
  }

  if (immediate) {
    lookupAyah(parsed.surah, parsed.ayah);
  }
}

function lookupFromSelects() {
  const surah = Number(elements.surahSelect.value);
  const ayah = Number(elements.ayahSelect.value);
  elements.reference.value = `${surah}:${ayah}`;
  state.reference = elements.reference.value;
  lookupAyah(surah, ayah);
}

async function lookupAyah(surahNumber, ayahNumber) {
  const validation = validateReference(surahNumber, ayahNumber);

  if (!validation.valid) {
    setLookupMessage(validation.message);
    return;
  }

  const cacheKey = `${surahNumber}:${ayahNumber}`;
  activeLookupKey = cacheKey;
  setLookupLoading(true);

  if (ayahCache[cacheKey]) {
    applyAyahData(ayahCache[cacheKey], true);
    setLookupLoading(false);
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/${cacheKey}/editions/quran-uthmani,en.sahih`,
    );

    if (!response.ok) {
      throw new Error("Ayah could not be found.");
    }

    const result = await response.json();
    const data = normalizeApiResponse(result, surahNumber, ayahNumber);

    if (!data) {
      throw new Error("Ayah could not be found.");
    }

    ayahCache[cacheKey] = data;
    saveAyahCache();

    if (activeLookupKey === cacheKey) {
      applyAyahData(data, false);
    }
  } catch (error) {
    if (activeLookupKey === cacheKey) {
      setLookupMessage(
        error.message || "The ayah could not be loaded. Check your connection and try again.",
      );
      setStatus("Ayah lookup was not available.");
    }
  } finally {
    if (activeLookupKey === cacheKey) {
      setLookupLoading(false);
    }
  }
}

function normalizeApiResponse(result, surahNumber, ayahNumber) {
  if (!result || result.code !== 200 || !Array.isArray(result.data)) {
    return null;
  }

  const arabic = result.data.find((item) => item.edition && item.edition.language === "ar");
  const english = result.data.find((item) => item.edition && item.edition.language === "en");
  const localSurah = surahs[surahNumber - 1];

  if (!arabic || !english) {
    return null;
  }

  return {
    reference: `${surahNumber}:${ayahNumber}`,
    ayahText: arabic.text || "",
    translation: english.text || "",
    surahName: arabic.surah?.englishName || localSurah.name,
    surahNumber,
    ayahNumber,
  };
}

function applyAyahData(data, fromCache) {
  state = sanitizeState({
    ...state,
    ...data,
    reference: data.reference,
  });

  elements.reference.value = state.reference;
  elements.surahSelect.value = String(state.surahNumber);
  populateAyahSelect(Number(state.surahNumber), Number(state.ayahNumber));
  updateLoadedAyah();
  updatePreview();
  queueSave();
  setLookupMessage(fromCache ? "Loaded from saved ayahs." : "Ayah loaded.");
  setStatus("Ayah ready for reflection.");
  window.setTimeout(() => elements.reflection.focus(), 80);
}

function clearAyahData(save) {
  state = {
    ...state,
    reference: "",
    ayahText: "",
    translation: "",
    surahName: "",
    surahNumber: "",
    ayahNumber: "",
  };
  updateLoadedAyah();
  updatePreview();

  if (save) {
    queueSave();
  }
}

function parseReference(value) {
  const match = String(value || "")
    .trim()
    .match(/^(\d{1,3})\s*[:.]\s*(\d{1,3})$/);

  if (!match) {
    return null;
  }

  return {
    surah: Number(match[1]),
    ayah: Number(match[2]),
  };
}

function validateReference(surahNumber, ayahNumber) {
  const surah = surahs[surahNumber - 1];

  if (!surah) {
    return { valid: false, message: "Choose a Surah between 1 and 114." };
  }

  if (!Number.isInteger(ayahNumber) || ayahNumber < 1 || ayahNumber > surah.ayahs) {
    return {
      valid: false,
      message: `${surah.name} has ${surah.ayahs} ayah${surah.ayahs === 1 ? "" : "s"}.`,
    };
  }

  return { valid: true, message: "" };
}

function setLookupLoading(isLoading) {
  elements.lookupSpinner.hidden = !isLoading;
  elements.searchButton.disabled = isLoading;
  setLookupMessage(isLoading ? "Loading ayah..." : elements.lookupMessage.textContent);
}

function setLookupMessage(message) {
  elements.lookupMessage.textContent = message;
}

function updateLoadedAyah() {
  const hasAyah = Boolean(state.ayahText && state.translation);
  elements.loadedAyah.hidden = !hasAyah;

  if (!hasAyah) {
    return;
  }

  elements.loadedSurah.textContent = `${state.surahName} ${state.ayahNumber}`;
  elements.loadedTranslation.textContent = state.translation;
}

// Keeps the preview, copy text, and export source in sync with form state.
function updatePreview() {
  const hasContent = Boolean(state.ayahText || state.translation || state.reflection.trim());

  elements.emptyState.hidden = hasContent;
  elements.cardContent.hidden = !hasContent;

  elements.previewSurahName.textContent = state.surahName || "Ayah Reflection";
  elements.previewReference.textContent =
    state.surahNumber && state.ayahNumber
      ? `Qur'an ${state.surahNumber}:${state.ayahNumber}`
      : "Qur'an reflection";
  elements.previewAyah.textContent = state.ayahText || "";
  elements.previewAyah.hidden = !state.ayahText;
  elements.previewTranslation.textContent = state.translation || "";
  elements.previewTranslation.hidden = !state.translation;
  elements.previewReflection.textContent = state.reflection.trim();
  elements.previewReflection.hidden = !state.reflection.trim();
}

function applyTheme(theme) {
  const activeTheme = ["sage", "cream", "sand", "sky", "blossom"].includes(theme)
    ? theme
    : defaultState.theme;

  state.theme = activeTheme;
  document.documentElement.dataset.theme = activeTheme;
  elements.card.classList.remove(
    "theme-sage",
    "theme-cream",
    "theme-sand",
    "theme-sky",
    "theme-blossom",
  );
  elements.card.classList.add(`theme-${activeTheme}`);

  elements.themeButtons.forEach((button) => {
    const isActive = button.dataset.theme === activeTheme;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-checked", String(isActive));
  });
}

function applyComposition(composition) {
  const activeComposition = ["classic", "editorial", "minimal"].includes(composition)
    ? composition
    : defaultState.composition;

  state.composition = activeComposition;
  elements.card.classList.remove("composition-classic", "composition-editorial", "composition-minimal");
  elements.card.classList.add(`composition-${activeComposition}`);

  elements.compositionButtons.forEach((button) => {
    const isActive = button.dataset.composition === activeComposition;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-checked", String(isActive));
  });
}

function applyShareMode(enabled) {
  elements.card.classList.toggle("share-layout", enabled);
  elements.shareModeButton.setAttribute("aria-pressed", String(enabled));
}

function updateCounter(animate) {
  const count = state.reflection.length;
  elements.charCounter.textContent = `${count}/${MAX_REFLECTION_LENGTH}`;
  elements.charCounter.classList.toggle("is-near-limit", count >= 540);

  if (!animate) {
    return;
  }

  clearTimeout(counterTimer);
  elements.charCounter.classList.add("is-bumping");
  counterTimer = window.setTimeout(() => {
    elements.charCounter.classList.remove("is-bumping");
  }, 180);
}

function showRandomPrompt() {
  const currentPrompt = elements.promptText.textContent;
  const availablePrompts = reflectionPrompts.filter((prompt) => prompt !== currentPrompt);
  const prompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
  elements.promptText.textContent = prompt;
  elements.reflection.setAttribute("aria-label", prompt);
  setStatus("Prompt updated.");
}

function generateCard() {
  updatePreview();
  elements.card.classList.remove("card-pulse");
  void elements.card.offsetWidth;
  elements.card.classList.add("card-pulse");

  if (window.matchMedia("(max-width: 979px)").matches) {
    elements.previewPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  setStatus("Card refreshed.");
}

// Renders the card at a high scale so exported PNGs stay crisp on mobile and desktop.
async function exportCardAsPng() {
  const originalText = elements.exportButton.textContent;
  elements.exportButton.disabled = true;
  elements.exportButton.textContent = "Preparing...";
  setStatus("Preparing PNG.");

  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    if (!window.html2canvas) {
      throw new Error("Export is still loading. Try again in a moment.");
    }

    const canvas = await html2canvas(elements.card, {
      backgroundColor: null,
      scale: Math.min(4, Math.max(2, window.devicePixelRatio * 2)),
      useCORS: true,
      scrollX: -window.scrollX,
      scrollY: -window.scrollY,
      windowWidth: document.documentElement.clientWidth,
      windowHeight: document.documentElement.clientHeight,
    });

    downloadCanvas(canvas, buildFilename());
    setStatus("PNG downloaded.");
  } catch (error) {
    setStatus(error.message || "Export could not be completed.");
  } finally {
    elements.exportButton.disabled = false;
    elements.exportButton.textContent = originalText;
  }
}

function downloadCanvas(canvas, filename) {
  canvas.toBlob((blob) => {
    if (!blob) {
      setStatus("Export could not be completed.");
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
}

async function copyReflection() {
  const text = state.reflection.trim();
  if (!text) {
    setStatus("Write a reflection first.");
    return;
  }

  await copyText(text, "Reflection copied.");
}

async function copyCardText() {
  if (!hasUserContent()) {
    setStatus("Load an ayah or write a reflection first.");
    return;
  }

  const text = buildCardText();
  await copyText(text, "Card text copied.");
}

async function copyText(text, successMessage) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      fallbackCopy(text);
    }
    setStatus(successMessage);
  } catch (error) {
    setStatus("Copy was not available in this browser.");
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function toggleShareMode() {
  state.shareMode = !state.shareMode;
  applyShareMode(state.shareMode);
  queueSave();
  setStatus(state.shareMode ? "Square card enabled." : "Square card disabled.");
}

function resetInputs() {
  lastResetState = { ...state };
  state = {
    ...state,
    reference: "",
    ayahText: "",
    translation: "",
    surahName: "",
    surahNumber: "",
    ayahNumber: "",
    reflection: "",
  };

  elements.reference.value = "";
  elements.surahSelect.value = "1";
  populateAyahSelect(1, 1);
  hydrateForm();
  autosizeAllTextareas();
  updateCounter(true);
  updateLoadedAyah();
  updatePreview();
  setLookupMessage("Try 2:255, 36:58, or 55:13.");
  queueSave();
  elements.undoResetButton.hidden = false;
  setStatus("Cleared. Undo is available.");
}

function undoReset() {
  if (!lastResetState) {
    return;
  }

  state = sanitizeState({ ...lastResetState });
  hydrateForm();
  applyTheme(state.theme);
  applyComposition(state.composition);
  applyShareMode(state.shareMode);
  autosizeAllTextareas();
  updateCounter(true);
  updateLoadedAyah();
  updatePreview();
  queueSave();
  elements.undoResetButton.hidden = true;
  setStatus("Restored.");
}

function handleKeyboardShortcuts(event) {
  const isModifierPressed = event.metaKey || event.ctrlKey;

  if (event.key === "Enter" && document.activeElement === elements.reference) {
    event.preventDefault();
    lookupFromReference(true);
    return;
  }

  if (!isModifierPressed) {
    return;
  }

  const key = event.key.toLowerCase();

  if (key === "enter") {
    event.preventDefault();
    generateCard();
  }

  if (key === "e") {
    event.preventDefault();
    exportCardAsPng();
  }

  if (event.shiftKey && key === "c") {
    event.preventDefault();
    copyCardText();
  }
}

function queueSave() {
  elements.saveState.textContent = "Saving";
  elements.saveState.classList.add("is-saving");
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(saveState, 260);
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    elements.saveState.textContent = "Saved";
    elements.saveState.classList.remove("is-saving");
  } catch (error) {
    elements.saveState.textContent = "Not saved";
    elements.saveState.classList.remove("is-saving");
    setStatus("Autosave is off in this browser.");
  }
}

function readSavedState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch (error) {
    return {};
  }
}

function readAyahCache() {
  try {
    return JSON.parse(localStorage.getItem(AYAH_CACHE_KEY) || "{}");
  } catch (error) {
    return {};
  }
}

function saveAyahCache() {
  try {
    localStorage.setItem(AYAH_CACHE_KEY, JSON.stringify(ayahCache));
  } catch (error) {
    ayahCache = {};
  }
}

function sanitizeState(nextState) {
  const cleanReflection = String(nextState.reflection || "").slice(0, MAX_REFLECTION_LENGTH);
  const cleanTheme = ["sage", "cream", "sand", "sky", "blossom"].includes(nextState.theme)
    ? nextState.theme
    : defaultState.theme;
  const cleanComposition = ["classic", "editorial", "minimal"].includes(nextState.composition)
    ? nextState.composition
    : defaultState.composition;

  return {
    ...defaultState,
    ...nextState,
    reference: String(nextState.reference || ""),
    ayahText: String(nextState.ayahText || ""),
    translation: String(nextState.translation || ""),
    surahName: String(nextState.surahName || ""),
    surahNumber: nextState.surahNumber ? Number(nextState.surahNumber) : "",
    ayahNumber: nextState.ayahNumber ? Number(nextState.ayahNumber) : "",
    reflection: cleanReflection,
    theme: cleanTheme,
    composition: cleanComposition,
    shareMode: Boolean(nextState.shareMode),
  };
}

function autosizeAllTextareas() {
  elements.textareas.forEach(autosizeTextarea);
}

function autosizeTextarea(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function buildCardText() {
  const lines = [];

  if (state.surahName || state.reference) {
    lines.push(`${state.surahName || "Qur'an"} ${state.reference}`.trim());
  }

  if (state.ayahText) {
    lines.push(state.ayahText);
  }

  if (state.translation) {
    lines.push(state.translation);
  }

  if (state.reflection.trim()) {
    lines.push(state.reflection.trim());
  }

  lines.push("Ayah Canvas");
  return lines.join("\n\n");
}

function buildFilename() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `ayah-canvas-${year}-${month}-${day}.png`;
}

function setStatus(message) {
  elements.statusLine.textContent = message;
}

function hasUserContent() {
  return Boolean(state.ayahText || state.translation || state.reflection.trim());
}
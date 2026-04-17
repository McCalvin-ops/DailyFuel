const FALLBACK_QUOTES = [
  { id: "q1", text: "Discipline is choosing what you want most over what you want now.", author: "Abraham Lincoln", category: "Discipline" },
  { id: "q2", text: "Success is rented, and rent is due every day.", author: "Rory Vaden", category: "Success" },
  { id: "q3", text: "Your life changes the moment your standards do.", author: "Tony Robbins", category: "Life" },
  { id: "q4", text: "Money is a tool. Master your habits, and the tool serves you.", author: "Robert Kiyosaki", category: "Money" },
  { id: "q5", text: "Consistency is a superpower most people underestimate.", author: "James Clear", category: "Discipline" },
  { id: "q6", text: "Create the life you cannot wait to wake up to.", author: "Jay Shetty", category: "Life" },
  { id: "q7", text: "Do what is hard now, and your future will be easy.", author: "Les Brown", category: "Discipline" },
  { id: "q8", text: "Success is built quietly before it is celebrated loudly.", author: "Simon Sinek", category: "Success" },
  { id: "q9", text: "Your first investment should be in your skills and mindset.", author: "Naval Ravikant", category: "Money" },
  { id: "q10", text: "You become unstoppable when your mission is bigger than your mood.", author: "Mel Robbins", category: "Life" },
  { id: "q11", text: "Small wins repeated daily create legendary outcomes.", author: "Robin Sharma", category: "Success" },
  { id: "q12", text: "Freedom follows structure. Build systems, not excuses.", author: "Jocko Willink", category: "Discipline" },
  { id: "q13", text: "The quality of your future is hidden in your routine.", author: "Ed Mylett", category: "Life" },
  { id: "q14", text: "Earn with value, keep with discipline, multiply with patience.", author: "Warren Buffett", category: "Money" },
  { id: "q15", text: "Your network can open doors, but your effort keeps them open.", author: "Gary Vaynerchuk", category: "Success" },
  { id: "q16", text: "The strongest mindset is built in the moments nobody applauds.", author: "David Goggins", category: "Discipline" },
  { id: "q17", text: "Dream big, execute small, repeat daily.", author: "Ali Abdaal", category: "Success" },
  { id: "q18", text: "A meaningful life is crafted, not found.", author: "Brene Brown", category: "Life" },
  { id: "q19", text: "Money rewards clarity, courage, and consistency.", author: "Alex Hormozi", category: "Money" },
  { id: "q20", text: "Self-respect grows every time you keep your own promise.", author: "Unknown", category: "Discipline" },
  { id: "q21", text: "Progress beats perfection every single day.", author: "Marie Forleo", category: "Success" },
  { id: "q22", text: "Protect your peace like your future depends on it, because it does.", author: "Oprah Winfrey", category: "Life" },
  { id: "q23", text: "Wealth favors people who can delay comfort for purpose.", author: "Morgan Housel", category: "Money" },
  { id: "q24", text: "When your why is clear, your hustle gets lighter.", author: "Vusi Thembekwayo", category: "Life" },
  { id: "q25", text: "You do not need more time. You need fewer distractions.", author: "Cal Newport", category: "Discipline" }
];

const QUOTABLE_API = "https://api.quotable.io/random";
const ZEN_QUOTES_API = "https://zenquotes.io/api/random";
const FAVORITES_KEY = "dailyFuelFavorites";
const CATEGORIES = ["All", "Success", "Discipline", "Life", "Money"];
const CATEGORY_TAGS = {
  Success: "success",
  Discipline: "inspirational",
  Life: "life",
  Money: "business"
};

const refs = {
  categoryChips: document.getElementById("categoryChips"),
  quoteCard: document.getElementById("quoteCard"),
  quoteText: document.getElementById("quoteText"),
  quoteAuthor: document.getElementById("quoteAuthor"),
  quoteCategory: document.getElementById("quoteCategory"),
  loadingOverlay: document.getElementById("loadingOverlay"),
  generateBtn: document.getElementById("generateBtn"),
  refreshBtn: document.getElementById("refreshBtn"),
  saveBtn: document.getElementById("saveBtn"),
  shareBtn: document.getElementById("shareBtn"),
  openFavoritesBtn: document.getElementById("openFavoritesBtn"),
  closeFavoritesBtn: document.getElementById("closeFavoritesBtn"),
  favoritesSheet: document.getElementById("favoritesSheet"),
  favoritesList: document.getElementById("favoritesList"),
  favoriteCountBadge: document.getElementById("favoriteCountBadge"),
  sheetBackdrop: document.getElementById("sheetBackdrop"),
  toast: document.getElementById("toast")
};

const state = {
  category: "All",
  currentQuote: null,
  favorites: loadFavorites(),
  toastTimer: null,
  isGenerating: false
};

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(state.favorites));
}

function createQuoteId(text, author, category) {
  const seed = `${author}|${category}|${text}`;
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 2147483647;
  }

  return `api-${Math.abs(hash).toString(36)}`;
}

function normalizeCategoryFromTags(tags, preferredCategory = "All") {
  if (preferredCategory !== "All") {
    return preferredCategory;
  }

  const lowercaseTags = Array.isArray(tags) ? tags.map((tag) => String(tag).toLowerCase()) : [];

  if (lowercaseTags.some((tag) => tag.includes("success") || tag.includes("achievement"))) {
    return "Success";
  }

  if (lowercaseTags.some((tag) => tag.includes("business") || tag.includes("money") || tag.includes("finance"))) {
    return "Money";
  }

  if (lowercaseTags.some((tag) => tag.includes("discipline") || tag.includes("wisdom") || tag.includes("inspirational"))) {
    return "Discipline";
  }

  return "Life";
}

function sanitizeQuote(rawQuote) {
  const text = String(rawQuote?.text ?? "").trim();
  if (!text) {
    return null;
  }

  const author = String(rawQuote?.author ?? "Unknown").trim() || "Unknown";
  const category = CATEGORIES.includes(rawQuote?.category) ? rawQuote.category : "Life";
  const id = String(rawQuote?.id ?? createQuoteId(text, author, category));

  return { id, text, author, category };
}

function pickRandomQuote(list, excludeId) {
  if (!list.length) {
    return null;
  }

  if (list.length === 1) {
    return list[0];
  }

  let nextQuote = list[Math.floor(Math.random() * list.length)];
  while (nextQuote.id === excludeId) {
    nextQuote = list[Math.floor(Math.random() * list.length)];
  }

  return nextQuote;
}

function getFallbackQuote(excludeId) {
  const scopedQuotes = state.category === "All"
    ? FALLBACK_QUOTES
    : FALLBACK_QUOTES.filter((quote) => quote.category === state.category);
  const quotePool = scopedQuotes.length ? scopedQuotes : FALLBACK_QUOTES;
  return pickRandomQuote(quotePool, excludeId) ?? FALLBACK_QUOTES[0];
}

async function fetchFromQuotable() {
  const url = new URL(QUOTABLE_API);
  const categoryTag = CATEGORY_TAGS[state.category];
  if (categoryTag) {
    url.searchParams.set("tags", categoryTag);
  }

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Quotable unavailable.");
  }

  const payload = await response.json();
  const quote = sanitizeQuote({
    id: payload?._id,
    text: payload?.content,
    author: payload?.author,
    category: normalizeCategoryFromTags(payload?.tags, state.category)
  });

  if (!quote) {
    throw new Error("Invalid quote data from Quotable.");
  }

  return quote;
}

async function fetchFromZenQuotes() {
  const response = await fetch(ZEN_QUOTES_API, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("ZenQuotes unavailable.");
  }

  const payload = await response.json();
  const firstQuote = Array.isArray(payload) ? payload[0] : null;
  const quote = sanitizeQuote({
    text: firstQuote?.q,
    author: firstQuote?.a,
    category: state.category === "All" ? "Life" : state.category
  });

  if (!quote) {
    throw new Error("Invalid quote data from ZenQuotes.");
  }

  return quote;
}

async function fetchLiveQuote(excludeId) {
  const providers = [fetchFromQuotable, fetchFromZenQuotes];

  for (const provider of providers) {
    try {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const quote = await provider();
        if (quote && quote.id !== excludeId) {
          return quote;
        }
      }
    } catch {
      // Move to the next provider if this one fails.
    }
  }

  return null;
}

function quoteShareText(quote) {
  return `"${quote.text}" - ${quote.author} (${quote.category})\n\n#DailyFuel`;
}

function isCurrentFavorite() {
  if (!state.currentQuote) {
    return false;
  }

  return state.favorites.some((quote) => quote.id === state.currentQuote.id);
}

function setQuote(quote) {
  if (!quote) {
    return;
  }

  state.currentQuote = quote;
  refs.quoteText.textContent = `"${quote.text}"`;
  refs.quoteAuthor.textContent = quote.author;
  refs.quoteCategory.textContent = quote.category;
  refs.saveBtn.classList.toggle("is-favorite", isCurrentFavorite());
}

function showToast(message) {
  refs.toast.textContent = message;
  refs.toast.classList.add("show");

  if (state.toastTimer) {
    clearTimeout(state.toastTimer);
  }

  state.toastTimer = setTimeout(() => {
    refs.toast.classList.remove("show");
  }, 1700);
}

function animatePress(event) {
  const button = event.currentTarget;
  button.classList.remove("haptic-pop");
  void button.offsetWidth;
  button.classList.add("haptic-pop");
}

function updateFavoriteCount() {
  refs.favoriteCountBadge.textContent = String(state.favorites.length);
}

function renderCategories() {
  refs.categoryChips.innerHTML = "";

  CATEGORIES.forEach((category) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `chip pressable ${state.category === category ? "active" : ""}`;
    chip.textContent = category;
    chip.dataset.category = category;
    chip.addEventListener("click", animatePress);
    chip.addEventListener("click", async () => {
      if (state.category === category) {
        return;
      }

      state.category = category;
      renderCategories();
      await generateQuote({ withLoader: true, showFallbackToast: true });
    });
    refs.categoryChips.append(chip);
  });
}

function renderFavorites() {
  updateFavoriteCount();

  if (state.favorites.length === 0) {
    refs.favoritesList.innerHTML = '<p class="empty-favorites">No favorites yet. Save your first quote.</p>';
    return;
  }

  refs.favoritesList.innerHTML = state.favorites
    .slice()
    .reverse()
    .map(
      (quote) => `
        <article class="favorite-item">
          <p>"${quote.text}"</p>
          <small>${quote.author} • ${quote.category}</small>
          <div class="favorite-controls">
            <button type="button" data-remove-id="${quote.id}">Remove</button>
          </div>
        </article>
      `
    )
    .join("");
}

function openFavorites() {
  refs.favoritesSheet.classList.add("open");
  refs.favoritesSheet.setAttribute("aria-hidden", "false");
  refs.sheetBackdrop.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeFavorites() {
  refs.favoritesSheet.classList.remove("open");
  refs.favoritesSheet.setAttribute("aria-hidden", "true");
  refs.sheetBackdrop.hidden = true;
  document.body.style.overflow = "";
}

function setLoadingState(isLoading) {
  refs.generateBtn.disabled = isLoading;
  refs.refreshBtn.disabled = isLoading;
  refs.loadingOverlay.classList.toggle("active", isLoading);
}

async function copyText(value) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const area = document.createElement("textarea");
  area.value = value;
  area.setAttribute("readonly", "");
  area.style.position = "absolute";
  area.style.left = "-9999px";
  document.body.append(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}

async function shareQuote() {
  if (!state.currentQuote) {
    return;
  }

  const text = quoteShareText(state.currentQuote);
  const payload = {
    title: "Daily Fuel",
    text
  };

  try {
    if (navigator.share) {
      await navigator.share(payload);
      showToast("Shared successfully.");
      return;
    }

    await copyText(text);
    showToast("Quote copied to clipboard.");
  } catch {
    showToast("Could not share this quote.");
  }
}

function toggleFavorite() {
  if (!state.currentQuote) {
    return;
  }

  const exists = isCurrentFavorite();
  if (exists) {
    state.favorites = state.favorites.filter((quote) => quote.id !== state.currentQuote.id);
    showToast("Removed from favorites.");
  } else {
    state.favorites.push(state.currentQuote);
    showToast("Saved to favorites.");
  }

  persistFavorites();
  renderFavorites();
  refs.saveBtn.classList.toggle("is-favorite", !exists);
}

async function generateQuote(options = { withLoader: true, showFallbackToast: true }) {
  if (state.isGenerating) {
    return;
  }

  state.isGenerating = true;
  const withLoader = options.withLoader ?? true;
  const showFallbackToast = options.showFallbackToast ?? true;
  const previousQuoteId = state.currentQuote?.id;

  refs.quoteCard.classList.add("is-changing");
  if (withLoader) {
    setLoadingState(true);
  }

  let nextQuote = null;
  let isFallback = false;

  try {
    nextQuote = await fetchLiveQuote(previousQuoteId);
    if (!nextQuote) {
      isFallback = true;
      nextQuote = getFallbackQuote(previousQuoteId);
    }
  } catch {
    isFallback = true;
    nextQuote = getFallbackQuote(previousQuoteId);
  }

  window.setTimeout(() => {
    setQuote(nextQuote);
    refs.quoteCard.classList.remove("is-changing");
    if (withLoader) {
      setLoadingState(false);
    }

    state.isGenerating = false;
    if (isFallback && showFallbackToast) {
      showToast("Live quote unavailable. Showing backup fuel.");
    }
  }, withLoader ? 430 : 220);
}

function initializeEvents() {
  const buttons = document.querySelectorAll(".pressable:not(.chip)");
  buttons.forEach((button) => {
    button.addEventListener("click", animatePress);
  });

  refs.generateBtn.addEventListener("click", () => generateQuote({ withLoader: true, showFallbackToast: true }));
  refs.refreshBtn.addEventListener("click", () => generateQuote({ withLoader: true, showFallbackToast: true }));
  refs.saveBtn.addEventListener("click", toggleFavorite);
  refs.shareBtn.addEventListener("click", shareQuote);
  refs.openFavoritesBtn.addEventListener("click", openFavorites);
  refs.closeFavoritesBtn.addEventListener("click", closeFavorites);
  refs.sheetBackdrop.addEventListener("click", closeFavorites);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeFavorites();
    }
  });

  refs.favoritesList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const removeId = target.dataset.removeId;
    if (!removeId) {
      return;
    }

    state.favorites = state.favorites.filter((quote) => quote.id !== removeId);
    persistFavorites();
    renderFavorites();
    refs.saveBtn.classList.toggle("is-favorite", isCurrentFavorite());
    showToast("Favorite removed.");
  });
}

async function initialize() {
  renderCategories();
  renderFavorites();
  initializeEvents();
  await generateQuote({ withLoader: true, showFallbackToast: false });
}

initialize();

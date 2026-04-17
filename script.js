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

const FAVORITES_KEY = "dailyFuelFavorites";
const CATEGORIES = ["All", "Success", "Discipline", "Life", "Money"];

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
  quoteLibrary: [],
  favorites: loadFavorites(),
  toastTimer: null
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

function filteredQuotes() {
  if (state.category === "All") {
    return state.quoteLibrary;
  }

  return state.quoteLibrary.filter((quote) => quote.category === state.category);
}

function pickRandomQuote(excludeId) {
  const list = filteredQuotes();
  if (list.length === 0) {
    return state.quoteLibrary[0] ?? null;
  }

  if (list.length === 1) {
    return list[0];
  }

  let next = list[Math.floor(Math.random() * list.length)];
  while (next.id === excludeId) {
    next = list[Math.floor(Math.random() * list.length)];
  }
  return next;
}

function quoteShareText(quote) {
  return `\"${quote.text}\" - ${quote.author} (${quote.category})\n\n#DailyFuel`;
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
    chip.addEventListener("click", () => {
      if (state.category === category) {
        return;
      }
      state.category = category;
      renderCategories();
      generateQuote({ withLoader: false });
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

function generateQuote(options = { withLoader: true }) {
  if (!state.quoteLibrary.length) {
    return;
  }

  const nextQuote = pickRandomQuote(state.currentQuote?.id);
  const withLoader = options.withLoader ?? true;

  refs.quoteCard.classList.add("is-changing");
  if (withLoader) {
    refs.loadingOverlay.classList.add("active");
  }

  window.setTimeout(() => {
    setQuote(nextQuote);
    refs.quoteCard.classList.remove("is-changing");
    refs.loadingOverlay.classList.remove("active");
  }, withLoader ? 430 : 230);
}

function initializeEvents() {
  const buttons = document.querySelectorAll(".pressable:not(.chip)");
  buttons.forEach((button) => {
    button.addEventListener("click", animatePress);
  });

  refs.generateBtn.addEventListener("click", () => generateQuote({ withLoader: true }));
  refs.refreshBtn.addEventListener("click", () => generateQuote({ withLoader: true }));
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

async function loadQuoteLibrary() {
  try {
    const response = await fetch("quotes.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Quote data could not be loaded.");
    }

    const payload = await response.json();
    if (!Array.isArray(payload) || payload.length === 0) {
      throw new Error("Invalid quote format.");
    }

    state.quoteLibrary = payload;
  } catch {
    state.quoteLibrary = FALLBACK_QUOTES;
  }
}

async function initialize() {
  refs.generateBtn.disabled = true;
  refs.refreshBtn.disabled = true;
  refs.loadingOverlay.classList.add("active");

  await loadQuoteLibrary();

  refs.loadingOverlay.classList.remove("active");
  refs.generateBtn.disabled = false;
  refs.refreshBtn.disabled = false;

  renderCategories();
  renderFavorites();
  initializeEvents();
  setQuote(pickRandomQuote());
}

initialize();

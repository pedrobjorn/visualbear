/**
 * Teachr Training Prototype
 *
 * Data-driven single-page prototype. The dashboard is the landing view; a
 * learner's first training entry runs the training flow:
 *   1. Language (step 1 of the training experience)
 *   2. Registration wizard (fixed header/progress, scrollable option list,
 *      segmented progress bar, back arrow)
 *   3. Lesson (questions unlock top-to-bottom; selecting stages an answer,
 *      the sticky Submit button evaluates it — wrong answers can be retried,
 *      after two misses the right answer is revealed — and feedback lives in
 *      the sticky bottom bar, fading out as the user scrolls down)
 *
 * Layout: the app is a fixed-height column (100dvh). Header, progress and
 * footer bars are static; only the option/question list scrolls, spanning the
 * full body width with the content centered in a narrow column.
 */

/* ---------------------------------- Data ---------------------------------- */
/* All mock data lives in src/mock.js (SPEC D1) — this destructure is the
 * one binding between the app and the dataset. */
const {
    LANGUAGES, COUNTRIES, REG_STEPS, LESSONS,
    MARKET_COMPLETION, AVG_COMPLETION, MARKET_DEMOGRAPHICS, AGE_GROUPS,
    MIGRANT_STATUS, GENDER_SPLIT, TOTAL_LEARNERS,
    SHIFT_COMPLETION, OVERDUE_TEAMS, JOB_LEVELS,
    MONTHLY_TREND, WEEKS, WEEKLY_ACTIVITY, NEW_LEARNERS_30D,
    LESSON_AVG, LESSON_COMPLETION_HISTORY,
    KEY_MESSAGE_SCORES, AVG_PERFORMANCE, GENDER_COLORS,
    PLANS,
} = window.TEACHR_DATA;

/* Derived insights (D3): every takeaway and quoted number is computed from
 * the dataset — nothing hand-copied, so panels and prose cannot drift. */
const topMarket = MARKET_COMPLETION.reduce((a, b) => (b.pct > a.pct ? b : a));
const worstMarket = MARKET_COMPLETION.reduce((a, b) => (b.pct < a.pct ? b : a));
const topLesson = LESSON_AVG.reduce((a, b) => (b.pct > a.pct ? b : a));
const topAgeGroup = AGE_GROUPS
    .map((a) => ({ age: a.age, total: a.female + a.male + a.other }))
    .reduce((a, b) => (b.total > a.total ? b : a));
const domesticShare = Math.round(
    (MIGRANT_STATUS.find((m) => m.status === "Domestic workers").female +
        MIGRANT_STATUS.find((m) => m.status === "Domestic workers").male +
        MIGRANT_STATUS.find((m) => m.status === "Domestic workers").other) / TOTAL_LEARNERS * 100);
const monthTrend = MONTHLY_TREND[MONTHLY_TREND.length - 1][1] - MONTHLY_TREND[MONTHLY_TREND.length - 2][1];
const periodTrend = MONTHLY_TREND[MONTHLY_TREND.length - 1][1] - MONTHLY_TREND[0][1];
const shiftGap = Math.max(...SHIFT_COMPLETION.map((s) => s.pct)) - Math.min(...SHIFT_COMPLETION.map((s) => s.pct));
const overdueTotal = OVERDUE_TEAMS.reduce((s, t) => s + t.overdue, 0);
const lastWeekActivity = WEEKLY_ACTIVITY[WEEKLY_ACTIVITY.length - 1];
const heatmapTrend = Math.round(
    LESSON_COMPLETION_HISTORY.reduce((s, l) => s + l.weeks[l.weeks.length - 1], 0) / LESSON_COMPLETION_HISTORY.length) -
    Math.round(
        LESSON_COMPLETION_HISTORY.reduce((s, l) => s + l.weeks[l.weeks.length - 6], 0) / LESSON_COMPLETION_HISTORY.length);

// Dashboard sidebar sections.
const DASH_SECTIONS = [
    { id: "assistant", label: "Teachr Assistant", icon: "ph-sparkle" },
    { id: "plans", label: "Course Planning", icon: "ph-clipboard-text" },
    { id: "demographics", label: "Demographics", icon: "ph-squares-four" },
    { id: "outcomes", label: "Outcomes", icon: "ph-chart-bar" },
    { id: "share", label: "Share training", icon: "ph-share-network" },
];
/* DS5: the Design system section is NOT a rail item — it is reachable from
 * the Settings menu (and the ?section=ds deep link). It still gets a
 * keep-alive container on demand via patchDashContent. */
const DS_SECTION_ID = "ds";

/* ---------------------------------- State --------------------------------- */

const state = {
    tab: "dashboard",        // dashboard | library — which experience this tab runs
    view: "dashboard",       // library | language | registration | dashboard | lesson | settings
    dashSection: "share",    // dashboard sidebar selection
    dashCollapsed: false,    // dashboard sidebar collapsed to icons
    mobileNav: false,        // mobile (<md) navigation drawer open
    menuOpen: false,         // user profile pop-up menu
    lessonExitAsk: false,    // R7-11: the leave-lesson confirmation is open
    lessonScrolledUp: false, // R7 follow-up 13: scrolled away from the latest
    supportOpen: false,      // R7-12: the support chat panel is open
    supportThread: [],       // R7-12: { role, text } — session-scoped
    registrationDone: false, // registration completed once (first library entry)
    libraryEmerge: false,    // the training list reveal — runs once, after registration
    shareSelection: ["access"], // share panel: trainings selected to share
    shareChannel: null,         // share panel: link | email | qr
    shareDone: false,           // share panel: confirmation showing
    assistantDrawer: false,  // AI assistant drawer open
    aiSettings: { context: true, charts: true, length: "concise" },
    aiSettingsOpen: false,
    aiDrawerMenu: false,     // drawer "…" options menu open
    aiLanding: [],           // assistant landing thread [{ role, text }]
    aiDrawer: [],            // drawer thread [{ role, text, chart, chips, feedback, liked, disliked }]
    aiTyping: null,          // "landing" | "drawer" | null
    aiTypingStep: 0,         // R4-5: rotating thinking-step index
    aiThinkInterval: null,   // R4-5: step-rotation interval while thinking
    aiUses: {},              // template rotation counter per intent (E5)
    aiDrawerContext: null,   // section the drawer is summarizing
    aiDrawerPanel: null,     // panel whose context chip is showing (§4.1)
    aiDrawerPanelTakeaway: null, // that panel's takeaway line (E3)
    chatId: null,            // current portal conversation id (L6: null = not yet saved)
    chatsOpen: false,        // portal chats list expanded
    story: { node: null },   // demo story pointer (workstream L) — shared by portal + drawer
    collapsedPanels: {},     // dashboard panels collapsed by id (§4.1)
    plans: null,             // training plans (SPEC M3) — seeded at boot
    planDetailId: null,      // plans section: null = list, else the detail subpage
    planPicking: false,      // plan detail: course picker open
    planPicks: [],           // picker selection (lesson ids)
    planReturn: null,        // plan id to return to after a lesson opened from it (M5)
    language: "en",
    regIndex: 0,             // 0-based step index
    answers: {},             // registration answers by step id
    currentLesson: null,
    lessonAnswers: {},       // lessonId -> array of completed question indexes
    lessonFeedback: {},      // lessonId -> { qIndex: { wrong, wrongPicks, selected, status } }
    lessonVideoDone: {},     // lessonId -> { before: true } once playback reached the end (gate)
    videoAdvanced: {},       // lessonId -> { before: true } once its Continue was clicked (frontier moves)
    videoPlayback: {},       // lessonId -> { elapsed, playing } — transient, not persisted
    lessonStart: {},         // lessonId -> entry timestamp (completion Speed tile)
    profileEdit: null,       // { returnTo: "profile" | "review" } while editing one registration step (T4/B5)
    profileReturn: null,     // view to return to from My details (T4)
    settingsReturn: "dashboard",
    settingsPage: null,      // null | 'about-app' | 'about-company' | 'language' | 'privacy'
    countryFilter: undefined,
};

/* Session state that crosses the tab threshold (SPEC I2). localStorage, not
 * sessionStorage: the dashboard and library tabs must read each other's
 * writes, and sessionStorage neither syncs nor fires events across tabs. */
const SESSION_KEY = "teachr-session";
// R8 B13: videoAdvanced rides the session too — the videos' Continue gates
// (the frontier's "a video holds the frontier until … its Continue") must
// survive the round-trips.
const SESSION_KEYS = ["registrationDone", "language", "lessonAnswers", "lessonFeedback", "lessonVideoDone", "lessonStart", "dashCollapsed", "videoAdvanced"];

function persistSession() {
    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(
            Object.fromEntries(SESSION_KEYS.map((k) => [k, state[k]]))));
    } catch {}
}

function restoreSession() {
    try {
        const saved = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
        if (saved) for (const k of SESSION_KEYS) if (saved[k] !== undefined) state[k] = saved[k];
    } catch {}
}

/* L6 — saved portal chats. One store, newest first: { id, title, messages, ts }.
 * Every completed landing exchange upserts by chatId; boot restores the most
 * recent conversation. Logout does NOT clear the store (chats are history,
 * not session state) — "Delete" in the Chats list is the only removal. */
const CHATS_KEY = "teachr.chats";

function loadChats() {
    try { return JSON.parse(localStorage.getItem(CHATS_KEY) || "[]"); }
    catch { return []; }
}

function savePortalChat() {
    if (!state.chatId || state.aiLanding.length < 2) return;
    const chats = loadChats().filter((c) => c.id !== state.chatId);
    const first = state.aiLanding.find((m) => m.role === "user");
    chats.unshift({
        id: state.chatId,
        title: first ? first.text : "New chat",
        messages: state.aiLanding.map(({ role, text, chart, chips }) => ({ role, text, chart, chips })),
        story: state.story.node,
        ts: Date.now(),
    });
    try { localStorage.setItem(CHATS_KEY, JSON.stringify(chats)); } catch {}
}

function timeAgo(ts) {
    const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
    if (s < 60) return "just now";
    const m = Math.round(s / 60);
    if (m < 60) return m + "m ago";
    const h = Math.round(m / 60);
    if (h < 24) return h + "h ago";
    return Math.round(h / 24) + "d ago";
}

/* L6: boot restores the most recent saved portal conversation. */
(function () {
    const chats = loadChats();
    if (chats.length) {
        state.chatId = chats[0].id;
        state.aiLanding = (chats[0].messages || []).map((m) => ({ ...m }));
        if (chats[0].story) state.story.node = chats[0].story;
    }
})();

function resetState() {
    state.view = "dashboard";
    state.dashSection = "share";
    state.dashCollapsed = false;
    state.mobileNav = false;
    state.menuOpen = false;
    state.registrationDone = false;
    state.libraryEmerge = false;
    state.shareSelection = ["access"];
    state.shareChannel = null;
    state.shareDone = false;
    state.assistantDrawer = false;
    state.aiSettings = { context: true, charts: true, length: "concise" };
    state.aiSettingsOpen = false;
    state.aiDrawerMenu = false;
    state.aiLanding = [];
    state.chatId = null;
    state.chatsOpen = false;
    state.story = { node: null };
    // Training plans reset to the seed (M3): fresh copies, list view.
    state.plans = JSON.parse(JSON.stringify(PLANS));
    state.planDetailId = null;
    state.planPicking = false;
    state.planPicks = [];
    state.planReturn = null;
    state.aiDrawer = [];
    stopThinking();
    state.aiUses = {};
    state.aiDrawerContext = null;
    state.aiDrawerPanel = null;
    state.aiDrawerPanelTakeaway = null;
    state.language = "en";
    state.regIndex = 0;
    state.answers = {};
    state.currentLesson = null;
    state.lessonAnswers = {};
    state.lessonFeedback = {};
    state.lessonVideoDone = {};
    state.videoPlayback = {};
    state.videoAdvanced = {};
    state.lessonStart = {};
    state.profileEdit = null;
    state.profileReturn = null;
    state.settingsPage = null;
    state.settingsReturn = "dashboard";
    state.countryFilter = undefined;
    try { localStorage.removeItem(SESSION_KEY); } catch {}
}

/* -------------------------------- Utilities ------------------------------- */

const app = () => document.getElementById("app");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[c]));

// Full-width header shell (logo/gear row spans the body width).
const shell = (extra = "") => `max-w-[1024px] mx-auto w-full ${extra}`;

function scrollShell(id, inner) {
    return `
        <div class="relative flex-1 min-h-0 w-full">
            <main ${id ? `id="${id}"` : ""} class="scroll-area absolute inset-0">${inner}</main>
        </div>`;
}

// Narrow centered content column inside the full-width scroll areas.
const column = (extra = "", width = "512px") => `max-w-[${width}] mx-auto w-full ${extra}`;

// The scrollable region of a view — spans the full body width.
function speakerBtn(extra = "") {
    // A span, not a button: it often sits inside clickable cards (buttons).
    // Focusable so the Listen affordance stays keyboard-reachable (§2.3).
    return `<span role="button" aria-label="Listen" tabindex="0"
        class="shrink-0 w-9 h-9 rounded-full inline-flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors ${extra}">
        <i class="ph ph-speaker-high text-xl"></i>
    </span>`;
}

function logo(size = "h-8 w-8") {
    return `<div class="dash-logo flex items-center gap-2 shrink-0">
        <img src="teachr-logo.svg" alt="Teachr logo" class="dash-logo-mark ${size} shrink-0">
        <span class="dash-collapse-label dash-logo-wordmark text-lg font-black tracking-tight text-brand-600">Teachr</span>
    </div>`;
}

function gearBtn() {
    return userMenuBtn();
}

/** Account button + pop-up menu (Settings, Log out). */
function userMenuBtn() {
    return `
    <div class="user-menu-root relative">
        <button type="button" data-action="toggle-user-menu" aria-label="Account" aria-expanded="${state.menuOpen}" aria-haspopup="menu"
            class="w-9 h-9 rounded-full flex items-center justify-center ${state.menuOpen ? "text-gray-900" : "text-gray-400"} hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <i class="ph ph-user-circle text-2xl"></i>
        </button>
        ${state.menuOpen ? `
        <div class="absolute right-0 top-full w-44 rounded-xl border border-gray-200 bg-white shadow-lg z-50 py-2">
            <button type="button" data-action="profile-open"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <i class="ph ph-identification-card text-lg"></i>My details
            </button>
            <button type="button" data-action="settings-open"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <i class="ph ph-gear-six text-lg"></i>Settings
            </button>
            <button type="button" data-action="logout"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                <i class="ph ph-sign-out text-lg"></i>Log out
            </button>
        </div>` : ""}
    </div>`;
}

function backBtn(onClick, label = "Back", showLabel = false) {
    // R7-10: the course page's back control grows a visible text label.
    // R9-3: at mobile the label hides (the arrow is the control; the
    // aria-label keeps the full text) — the header is too tight for it.
    return `<button type="button" data-action="${onClick}" aria-label="${label}"
        class="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors ${showLabel ? "text-sm font-medium" : ""}">
        <i class="ph ph-arrow-left text-xl"></i>${showLabel ? `<span class="hidden md:inline">${label}</span>` : ""}
    </button>`;
}

/**
 * Shared view header — spans the full shell width. Back button far left,
 * logo next to it, view title optically centered between logo and gear.
 * opts.hideLogo drops the logo (the course page carries it as the support
 * FAB instead — DR-T19); opts.backLabel gives its back control a visible
 * text label.
 */
function viewHeader(back = null, title = "", opts = {}) {
    return `
    <header class="${shell("relative z-30 flex items-center justify-between h-14 px-4 md:h-auto md:p-4 shrink-0")}">
        <div class="flex items-center gap-4">
            ${back ? backBtn(back, opts.backLabel || "Back", !!opts.backLabel) : ""}
            ${opts.hideLogo ? "" : logo()}
        </div>
        ${title ? `<h1 class="min-w-0 flex-1 text-center text-sm font-medium text-gray-700 line-clamp-2 break-words md:absolute md:left-1/2 md:-translate-x-1/2 md:max-w-[45%] md:line-clamp-none md:truncate">${esc(title)}</h1>` : ""}
        ${gearBtn()}
    </header>`;
}

/** Segmented progress bar: one segment per registration step (left-to-right). */
function segmentInner(filled, total) {
    let segs = "";
    for (let i = 0; i < total; i++) {
        segs += `<div class="h-1.5 flex-1 rounded-full transition-colors duration-300 ${i < filled ? "bg-brand-700" : "bg-gray-300"}"></div>`;
    }
    return segs;
}

function segmentBar(filled, total) {
    return `<div class="flex gap-1 pt-2">${segmentInner(filled, total)}</div>`;
}

/* ================= Design-system builders (workstream DS) =================
 * Single source for the app's chrome elements. The Design system section
 * (?section=ds) renders these as live reference; app call sites call the
 * same functions, so the view and the product cannot drift. */
const uiBtn = (label, action, variant = "primary", attrs = "", cls = "") => {
    /* R7 follow-up 17: ghost and danger share the primary's full size —
     * the CTA's padding, radius and scale — as text-only buttons. Ink +
     * a hover tint carry the variant; the ghost rides the paper ground
     * (the page's #F7F6F4) instead of a transparent fill, so a ghost on
     * the floating lesson bar never lets scrolled content bleed through. */
    const styles = {
        primary: "bg-brand-700 hover:bg-brand-800 disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:bg-gray-200 text-white font-bold",
        ghost: "bg-paper text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium",
        danger: "bg-transparent text-red-600 hover:text-red-700 font-medium",
        // R8 B7: the text button — ink only, no fill — at the primary's full
        // height (the leave-lesson dialog's pair; the reviewer's unification).
        text: "bg-transparent text-gray-500 hover:text-gray-900 font-medium",
    }[variant];
    return `<button type="button" data-action="${action}" ${attrs}
        class="w-full ${styles} py-4 px-6 rounded-full text-lg transition-colors ${cls}">${label}</button>`;
};
function continueBtn(action, label = "Continue", attrs = "") {
    return uiBtn(label, action, "primary", attrs);
}

/** R7 follow-up 17 + amendment: the scrolled-up "Scroll down" state is a
 * ghost button — the DS ghost variant (ink + a hover tint on the paper
 * ground, so the floating bar never lets content bleed through), the edge
 * arrows riding its padding in the ink colour (follow-up 16's lockup,
 * ink-toned). */
/** R8 B12: the label reads the destination, not the direction — the ride
 * goes to the NEXT QUESTION (the scroll's own target), per the review. */
const scrollDownBtnHTML = () => uiBtn(
    `<i class="ph-bold ph-arrow-down text-xl absolute left-6 top-1/2 -translate-y-1/2" aria-hidden="true"></i>Scroll to next question<i class="ph-bold ph-arrow-down text-xl absolute right-6 top-1/2 -translate-y-1/2" aria-hidden="true"></i>`,
    "scroll-to-latest", "ghost", 'aria-label="Scroll to next question"', "relative");

/** Suggestion / quick chip (assistant threads, portal empty state). */
const uiChip = (label, attrs = "") => `<button type="button" ${attrs}
    class="flex items-center gap-2 rounded-lg bg-white hover:text-gray-900 px-3 py-1 text-xs font-medium text-gray-600 shadow-sm transition-colors">
    <span class="w-1 h-1 rounded-full bg-gray-400"></span>${esc(label)}</button>`;

/** Status pill on lesson cards. kind: done | active | locked. */
const uiBadge = (kind, label) => {
    const map = {
        done: ["text-green-600 bg-green-50 border-green-200", '<i class="ph-fill ph-check-circle text-base"></i>'],
        active: ["text-brand-600 bg-brand-50 border-brand-200", '<i class="ph ph-play text-base"></i>'],
        locked: ["text-gray-400 bg-gray-50 border-gray-200", '<i class="ph ph-lock text-base"></i>'],
    }[kind];
    return `<span class="flex items-center gap-1 border rounded-full px-3 py-1 text-sm font-medium ${map[0]}">${map[1]}${esc(label)}</span>`;
};

/** 44px ghost icon button (the circular icon-button pattern). */
const uiIconBtn = (icon, label, attrs = "", cls = "") => `<button type="button" ${attrs}
    title="${esc(label)}" aria-label="${esc(label)}"
    class="w-11 h-11 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors ${cls}">
    <i class="ph ${icon} text-lg"></i></button>`;

/** Progress bar track+fill (lesson header, plan rows). */
const uiProgress = (pct, cls = "") => `<span class="block w-full h-2 rounded-full bg-gray-200 overflow-hidden ${cls}">
    <span class="block h-full rounded-full bg-brand-600" style="width:${Math.round(pct)}%"></span></span>`;

/** Empty state — portal/drawer screens (full) and list-empty (compact). */
const uiEmptyState = ({ icon = "ph-sparkle", title, sub, chips = [], compact = false }) => compact
    ? `<p class="text-sm font-normal text-gray-400 text-center py-8">${esc(sub)}</p>`
    : `<div class="h-full flex flex-col items-center justify-center text-center px-6 pt-8">
        <div class="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mb-3">
            <i class="ph ${icon} text-2xl"></i></div>
        <h2 class="text-2xl font-black tracking-tight">${esc(title)}</h2>
        <p class="text-gray-500 text-sm font-normal pt-1">${esc(sub)}</p>
        ${chips.length ? `<div class="flex flex-wrap justify-center gap-2 pt-5">${chips.map((c) =>
            uiChip(c.label || c, c.attrs || `data-action="ai-suggest" data-chat="landing" data-q="${esc(c.label || c)}"`)).join("")}</div>` : ""}
      </div>`;

/** Selectable option row (registration / country picker). */
const uiOptionRow = (label, { sub = "", flag = "", selected = false, action = "pick-option", index = 0, speaker = true } = {}) => `
        <button type="button" data-action="${action}" data-index="${index}"
            class="opt-card w-full flex items-center gap-4 text-left p-4 min-h-[3.5rem] rounded-2xl border-2 transition-colors
                   ${selected ? "border-brand-600 bg-brand-50 text-brand-600" : "border-gray-200 bg-gray-50 hover:border-brand-500 hover:bg-brand-50"}">
            <span class="flex-1">
                <span class="block font-medium ${selected ? "" : "text-gray-900"}">${esc(label)}</span>
                ${sub ? `<span class="block text-sm font-normal text-gray-500 mt-0.5">${esc(sub)}</span>` : ""}
            </span>
            ${flag ? `<span class="text-2xl">${flag}</span>` : ""}
            ${speaker ? speakerBtn() : ""}
        </button>`;

/** Preserve a scroll container's position across an innerHTML re-render. */
function scrollTopOf(id) {
    const el = document.getElementById(id);
    return el ? el.scrollTop : 0;
}
function restoreScroll(id, top) {
    const el = document.getElementById(id);
    if (el) el.scrollTop = top;
}

/* ------------------------------- Library view ----------------------------- *
 * The learner's door into the training experience — its own tab, opened by
 * the dashboard's Start training button. The training list emerges once,
 * after registration (SPEC I3); the library never links back to the
 * dashboard — separate experiences (SPEC I5). */

function libraryCardsHTML() {
    const cards = LESSONS.map((lesson, i) =>
        `<div style="animation-delay:${i * 60}ms">${lessonCard(lesson, i)}</div>`).join("");
    return state.libraryEmerge ? `<div class="library-emerge space-y-3">${cards}</div>` : `<div class="space-y-3">${cards}</div>`;
}

function renderLibrary() {
    // R8 B6 (+follow-up): the title stays fixed while the courses scroll —
    // in the FULL SCREENSPACE (the R7f5 pattern — no inner lane, no inner
    // scrollbar); the sticky block carries the fading paper ground so the
    // cards dissolve beneath it (the fuzzy edge), and the page's scroll is
    // restored after the lesson round-trip (stashed in open-lesson).
    app().innerHTML = `
        ${viewHeader(null, "Training library")}
        ${scrollShell("library-scroll", `
            <div class="${shell("px-4 pt-8 pb-6")}">
                <div class="library-title sticky top-0 z-20 pt-2 pb-9 -mt-2">
                    <h1 class="text-2xl md:text-3xl font-black tracking-tight text-center mb-3">Course 01: Internal Security</h1>
                    <p class="text-lg font-normal text-gray-900 text-center">${LESSONS.length} lessons. Your progress is saved as you go.</p>
                </div>
                ${libraryCardsHTML()}
            </div>
        `)}
        ${supportFABHTML()}
    `;
    const sc = document.getElementById("library-scroll");
    requestAnimationFrame(() => requestAnimationFrame(() => {
        if (libraryLaneScroll != null) sc.scrollTop = libraryLaneScroll;
    }));
    updateBarButtonMode();
}

/* ------------------------------- Language view ---------------------------- */

function renderLanguage() {
    const cards = LANGUAGES.map((lang) => `
        <button type="button" data-action="pick-lang" data-lang="${lang.id}"
            class="lang-card w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-colors
                   ${state.language === lang.id
                       ? "border-brand-600 bg-brand-50 text-gray-900"
                       : "border-gray-200 bg-gray-50 text-gray-900 hover:border-brand-500 hover:bg-brand-50"}">
            <span class="text-lg font-medium">${lang.native}</span>${speakerBtn()}
        </button>`).join("");

    app().innerHTML = `
        ${viewHeader(null, "Language")}
        ${scrollShell("language-scroll", `
            <div class="${column("px-6 pt-6")}">
                <h1 class="text-2xl md:text-3xl font-black tracking-tight text-center mb-2">Welcome to your training</h1>
                <p class="text-lg font-normal text-gray-900 text-center mb-8">Choose your language to get started.</p>
                <div class="space-y-3">
                    ${cards}
                </div>
            </div>
        `)}
        <footer class="shrink-0">
            <div class="${column("px-6 py-4")}">
                ${continueBtn("lang-continue", `Continue in ${esc(LANGUAGES.find((l) => l.id === state.language).label)}`)}
            </div>
        </footer>
    `;
}

/* ---------------------------- Registration view ---------------------------- */

function optionCard(stepId, opt, index) {
    return uiOptionRow(opt.label, {
        sub: opt.sub, flag: opt.flag,
        selected: state.answers[stepId] === opt.label,
        index,
    });
}

function regStepBody(step) {
    if (step.type === "text") {
        // T-reg: the AI chat input's card look (rounded-2xl, 2px border, the
        // DS text input's treatment — the selected state carries the colour
        // (gray-900), not the thickness; B1: any input field) — minus its drop shadow.
        // R8 B17: validated fields (name, workerId) — the validation message
        // sits 4px under the field, left, small; the error carries red.
        return `<div class="w-full rounded-2xl border-2 border-gray-200 bg-white p-3 transition-colors hover:border-gray-900 focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-gray-100">
            <input type="text" data-field="${step.id}" value="${esc(state.answers[step.id] || "")}"
                placeholder="${esc(step.placeholder || "")}" autocomplete="${step.id === "name" ? "given-name" : "off"}"
                class="w-full px-1 py-1.5 bg-transparent focus:outline-none text-lg placeholder:text-gray-400">
            <p class="field-error hidden text-xs text-signal-bad text-left mt-1" aria-live="polite"></p>
        </div>`;
    }

    if (step.type === "search") {
        const list = state.countryFilter === undefined ? step.options : step.options.filter(
            (c) => c.label.toLowerCase().includes(String(state.countryFilter || "").toLowerCase())
        );
        return `
            <div class="reg-search-field relative mb-4 rounded-2xl border-2 border-gray-200 bg-white p-3 transition-colors hover:border-gray-900 focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-gray-100">
                <i class="ph ph-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
                <input type="text" data-field="country-search" value="${esc(state.countryFilter || "")}"
                    placeholder="${esc(step.searchPlaceholder)}"
                    class="w-full pl-8 pr-1 py-1.5 bg-transparent focus:outline-none text-lg placeholder:text-gray-400">
            </div>
            <div class="space-y-3">
                ${list.map((c) => optionCard(step.id, c, step.options.indexOf(c))).join("") || `
                    <p class="text-gray-400 text-center py-6">No country found</p>`}
            </div>`;
    }

    if (step.type === "review") {
        // T4: every field, from the one source of labels (REG_STEPS) — the
        // summary used to show only four of the nine answers.
        // R8 B5: every row carries an Edit affordance — it jumps to that
        // step with the answer staged (profileEdit, returnTo the review), the pick/continue
        // commits and returns straight here instead of walking the flow.
        const rows = REG_STEPS.filter((s) => s.type !== "review")
            .map((s) => [s.label, state.answers[s.id], s.id])
            .filter(([, v]) => v);
        return `
            <!-- R13-11: padded, rounded panel on a 90%-opaque body-base veil
                 (amends R13-9's solid rect); the certificate note rides
                 inside the padding, under the list. -->
            <div class="rounded-2xl bg-[var(--gnd-panel)] px-4 py-3">
                <div class="divide-y divide-[#E4F1EE]">
                    ${rows.map(([k, v, id]) => `
                        <div class="flex items-center justify-between gap-3 py-4">
                            <span class="font-normal text-gray-500 shrink-0">${esc(k)}</span>
                            <span class="flex items-center gap-3 min-w-0">
                                <span class="font-semibold truncate">${esc(v)}</span>
                                ${editAffordance("reg-edit", id, k, { withText: true })}
                            </span>
                        </div>`).join("")}
                </div>
                <div class="flex items-start gap-3 pt-4 text-gray-600">
                    <i class="ph ph-certificate text-2xl shrink-0"></i>
                    <p class="text-sm font-normal">Your certificate will be issued in <b>${esc(LANGUAGES.find((l) => l.id === state.language).label)}</b> when you complete your training.</p>
                </div>
            </div>`;
    }

    // choice
    return `<div class="space-y-3">${step.options.map((opt, i) => optionCard(step.id, opt, i)).join("")}</div>`;
}

function metaInner(editing) {
    if (editing) return `<div class="pt-2"></div>`;
    return `
        <div class="flex gap-1 pt-2">${segmentInner(state.regIndex, REG_STEPS.length)}</div>
        <div class="text-center text-sm font-normal text-gray-900 pt-3 pb-5">
            Step ${state.regIndex + 1} of ${REG_STEPS.length}
        </div>`;
}

function bindRegStep(step) {
    const btn = document.getElementById("reg-cta");
    // R8 B17: the text fields validate — min 3 chars, no special symbols,
    // the Worker ID capped at 30. The error state: Continue disabled, a red
    // outline + red text, the message 4px under the field, left; cleared
    // (the default active field) when the condition is met.
    const validate = (v) => {
        if (v.length < 3) return "At least 3 characters.";
        if (step.id === "workerId" && v.length > 30) return "At most 30 characters.";
        if (/[^a-zA-Z0-9 \-]/.test(v)) return "No special symbols.";
        return null;
    };
    const applyError = (err) => {
        const card = input.closest("div");
        const msg = card.querySelector(".field-error");
        card.classList.toggle("border-signal-bad", !!err);
        card.classList.toggle("focus-within:border-brand-600", !err);
        card.classList.toggle("hover:border-gray-900", !err);
        card.classList.toggle("focus-within:ring-gray-100", !err);
        input.classList.toggle("text-signal-bad", !!err);
        if (msg) {
            msg.textContent = err || "";
            msg.classList.toggle("hidden", !err);
        }
    };
    const canContinue = step.type === "review" || (state.answers[step.id] !== undefined && state.answers[step.id] !== "");
    if (btn) btn.disabled = !canContinue;
    const input = document.querySelector(`[data-field="${step.id}"]`);
    if (input) {
        if (step.type === "text") {
            const staged = state.answers[step.id] || "";
            const stagedErr = validate(staged);
            applyError(staged === "" ? null : stagedErr);
            if (btn) btn.disabled = staged === "" || !!stagedErr;
        }
        input.addEventListener("input", (e) => {
            state.answers[step.id] = e.target.value.trim();
            const err = step.type === "text" ? validate(state.answers[step.id]) : null;
            applyError(err);
            btn.disabled = state.answers[step.id] === "" || !!err;
        });
        if (step.type === "text") input.focus();
    }
    const search = document.querySelector('[data-field="country-search"]');
    if (search) {
        search.addEventListener("input", (e) => {
            state.countryFilter = e.target.value;
            renderRegistration();
            const s = document.querySelector('[data-field="country-search"]');
            s.focus();
            s.setSelectionRange(s.value.length, s.value.length);
        });
    }
}

function footerNeeded(step) {
    return step.type === "text" || step.type === "review";
}

/* R13-13 (amended): the footer floats over the scroller with NO background;
 * while it is visible the scroller clips at the button's midway
 * (.reg-foot-on #reg-scroll { bottom: 50px }). The review panel gets pb-12 —
 * extra margin below the container so at max scroll its bottom edge is NOT
 * covered by the button (it sits clear above the button's top edge), while
 * the scroll still stops at the button's midway. Text steps get pb-28 so
 * the input scrolls fully clear of the bar. */
function regBodyPad(step) {
    if (step.type === "review") return "px-6 py-4 pb-12";
    if (footerNeeded(step)) return "px-6 py-4 pb-28";
    return "px-6 py-4 pb-6";
}

function renderRegistration() {
    // R7-16: a step change inside the wizard patches — the shell (header,
    // title, scroll frame, footer) persists and only the changing regions
    // (meta, subtitle, body, footer state) are updated, so the title never
    // repaints and the step change never reads as a reload.
    if (document.getElementById("reg-shell") && !state.profileEdit) {
        return patchRegistration();
    }
    const step = REG_STEPS[state.regIndex];
    // T4: editing one field from My details — no wizard chrome, a back arrow
    // to the details page instead of the step flow.
    const editing = !!state.profileEdit;

    app().innerHTML = `
        <div id="reg-shell" class="relative flex flex-col h-full min-h-0 ${footerNeeded(step) ? "reg-foot-on" : ""}">
        ${viewHeader("reg-back", editing ? "Edit your details" : "Registration")}
        <div class="${column("px-6 shrink-0")}" id="reg-meta">
            ${metaInner(editing)}
        </div>
        <div class="${column("px-6 shrink-0")}">
            <div class="flex items-start gap-2">
                <h2 id="reg-title" class="q-title flex-1 pt-0.5">${esc(step.title)}</h2>
                ${speakerBtn()}
            </div>
            <div id="reg-sub">
                ${step.subtitle ? `<p class="text-lg font-normal text-gray-900 pt-1 pb-6">${esc(step.subtitle)}</p>` : `<div class="pb-4"></div>`}
            </div>
        </div>
        ${scrollShell("reg-scroll", `
            <div class="${column(regBodyPad(step))}" id="reg-body">
                ${regStepBody(step)}
            </div>
        `)}
        <!-- R13-13 (amended: no fade, no background): the footer floats over
             the scroller (absolute, z-20) and stays transparent — the opaque
             button itself occludes the list, which disappears behind it. -->
        <footer id="reg-footer" class="absolute inset-x-0 bottom-0 z-20 ${footerNeeded(step) ? "" : "hidden"}">
            <div class="relative ${column("px-6 pt-4 pb-6 md:py-4")}">
                ${continueBtn("reg-continue", step.type === "review" ? "Start my training" : "Continue", 'id="reg-cta"')}
            </div>
        </footer>
        </div>
    `;
    bindRegStep(step);
}

function patchRegistration() {
    const step = REG_STEPS[state.regIndex];
    const prevScroll = scrollTopOf("reg-scroll");

    document.getElementById("reg-meta").innerHTML = metaInner(!!state.profileEdit);
    document.getElementById("reg-title").textContent = step.title;
    document.getElementById("reg-sub").innerHTML =
        step.subtitle ? `<p class="text-lg font-normal text-gray-900 pt-1 pb-6">${esc(step.subtitle)}</p>` : `<div class="pb-4"></div>`;

    // R7-16: the body content swaps through one rising fade — the fresh
    // wrapper node plays the animation exactly once per step.
    // R13-13: the bottom padding follows the step (floating footer).
    const regBody = document.getElementById("reg-body");
    regBody.className = column(regBodyPad(step));
    regBody.innerHTML =
        `<div class="step-fade">${regStepBody(step)}</div>`;

    const footer = document.getElementById("reg-footer");
    footer.classList.toggle("hidden", !footerNeeded(step));
    // R13-13: the scroller clips at the button's midway only while the
    // footer is visible.
    document.getElementById("reg-shell").classList.toggle("reg-foot-on", footerNeeded(step));
    const btn = document.getElementById("reg-cta");
    if (btn) btn.textContent = step.type === "review" ? "Start my training" : "Continue";

    restoreScroll("reg-scroll", prevScroll);
    bindRegStep(step);
}

/* ------------------------------- Lessons view ------------------------------ */

function lessonCard(lesson, i) {
    const answered = (state.lessonAnswers[lesson.id] || []).length;
    const total = lesson.questions.length;
    const pct = total ? Math.round((answered / total) * 100) : 0;

    let badge, action, disabled = "";
    if (lesson.status === "done") {
        badge = uiBadge("done", "Completed");
        action = `<span class="flex items-center gap-2 text-gray-400 font-medium">Review <i class="ph ph-arrow-right text-lg"></i></span>`;
    } else if (lesson.status === "active") {
        badge = uiBadge("active", answered ? "In progress" : "Start");
        // R9 (user review): no Continue/Start text — the arrow stands alone
        // in its bubble; the state lives in the badge.
        action = `<span aria-hidden="true" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 transition-colors group-hover:border-brand-500 group-hover:text-brand-700"><i class="ph ph-arrow-right text-lg"></i></span>`;
    } else {
        badge = uiBadge("locked", "Locked");
        action = `<span aria-hidden="true" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-400"><i class="ph ph-lock text-lg"></i></span>`;
        disabled = "cursor-not-allowed";
    }

    return `
        <button type="button" data-action="open-lesson" data-lesson="${lesson.id}"
            class="group relative w-full text-left rounded-2xl border-2 overflow-hidden flex flex-col md:flex-row md:items-stretch transition-colors
                   ${lesson.status === "locked" ? "border-gray-200 bg-white " + disabled : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"}">
            <!-- R9-12 (user review): the status icon lives on the media's
                 top-left corner, the badge on the right-aligned edge; the
                 title moves up to lead the text pane. The overlays are card
                 children (NOT inside the aria-hidden media pane) so the
                 badge stays in the a11y tree. -->
            <div class="w-full h-44 md:h-auto md:w-[30%] shrink-0 relative overflow-hidden ${lesson.status === "done" ? "bg-green-50" : lesson.status === "active" ? "bg-brand-100" : "bg-gray-100"}" aria-hidden="true">
                <img src="teachr-logo.svg" alt="" class="absolute inset-0 m-auto w-14 opacity-25">
                ${lesson.cover ? `<img src="${lesson.cover}" alt="" loading="lazy" onerror="this.onerror=null;this.style.display='none'" class="absolute inset-0 h-full w-full object-cover">` : ""}
            </div>
            <div class="absolute top-3 left-3 z-10 flex items-center">
                <div class="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-sm
                    ${lesson.status === "done" ? "bg-green-50 text-green-600" : lesson.status === "active" ? "bg-brand-50 text-brand-600" : "bg-gray-100 text-gray-400"}">
                    <i class="ph ${lesson.status === "done" ? "ph-medal" : lesson.status === "active" ? "ph-shield-check" : "ph-lock"}"></i>
                </div>
            </div>
            <div class="absolute top-3 right-3 z-10 flex items-center">
                ${badge}
            </div>
            <div class="flex-1 p-5 min-w-0">
                <p class="text-xl font-black tracking-tight leading-tight mt-1">${esc(lesson.subtitle)}</p>
                <h3 class="text-xs font-medium text-gray-400 leading-tight mt-1 mb-3">Lesson ${i + 1} of ${LESSONS.length}</h3>
                <p class="text-sm font-normal mb-4 ${lesson.status === "locked" ? "text-gray-400" : "text-gray-900"}">${esc(lesson.description)}</p>
                <div class="flex items-center justify-between">
                    <span class="flex items-center gap-1.5 text-sm text-gray-400">
                        <i class="ph ph-clock text-base"></i>${lesson.duration}
                        ${total ? `${total} questions, ${pct}% done` : ""}
                    </span>
                    ${action}
                </div>
            </div>
        </button>`;
}

/* Training overview — the lesson list lives inside the dashboard, so the
 * sidebar nav stays put. */

const chart = (id, h, legend = "") =>
    `<div id="${id}" class="${h}"></div>${legend}`;

/* C3: legends whose swatches carry their series colour — hovering or focusing
 * a swatch dims the other series' bars in the sibling chart (fade, not
 * re-render). Only series legends carry data-series; band legends (perf)
 * stay static. */
const legendItem = (color, label) => `
    <span class="flex items-center gap-1.5 rounded cursor-default outline-offset-2" tabindex="0"
        data-series="${color}" aria-label="Highlight ${esc(label)} in chart">${color ? `<span class="w-2 h-2 rounded-sm" style="background:${color}"></span>` : ""}${esc(label)}</span>`;

const perfLegend = `
    <div class="flex flex-wrap justify-center gap-4 pt-2 text-xs text-gray-500">
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-sm bg-brand-700"></span>(85% and above) — High</span>
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-sm bg-brand-300"></span>(75% – 84%) — Medium</span>
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-sm bg-gray-200"></span>(74% and below) — Low</span>
    </div>`;

const filterBar = `
    <div class="flex flex-wrap items-center gap-2 px-3 py-2 mb-3">
        <span class="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 text-gray-700 px-2.5 py-1 text-xs font-medium">
            From 2026-10-05 to 2026-10-12 <i class="ph-fill ph-x-circle text-sm"></i>
        </span>
        <button type="button" class="text-xs font-medium text-gray-700">Clear all</button>
        <button type="button" class="ml-auto flex items-center gap-1.5 rounded-full border border-gray-200 bg-white text-xs font-medium text-gray-700 px-3 py-1 hover:border-gray-400 hover:text-gray-900 transition-colors">
            <i class="ph ph-funnel text-sm"></i>Filters
        </button>
    </div>`;

const genderLegend = `
    <div class="chart-legend flex justify-center gap-4 pt-2 text-xs text-gray-500">
        ${legendItem("#14A08D", "Female")}
        ${legendItem("#8AD8CC", "Male")}
        ${legendItem("#E5E7EB", "Other")}
    </div>`;

function dashContentHTML(section) {
    /* Section header: title top-left (aligned with the sidebar profile row
     * and the drawer title), assistant toggle top-right (sparkle when
     * closed, carets when open). The assistant view itself has no toggle —
     * the chat is the view there, no drawer needed. */
    const cardHeader = (showToggle = true) => `
        <div class="flex items-center justify-between px-4 pt-4 pb-2">
            <h1 class="text-lg font-bold tracking-tight text-gray-900">${esc(sectionLabel)}</h1>
            ${showToggle ? `
            <button type="button" data-action="ai-drawer" aria-expanded="${state.assistantDrawer}" title="${state.assistantDrawer ? "Close assistant" : "Open Teachr Assistant"}"
                class="w-11 h-11 -m-2 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white transition-colors">
                ${state.assistantDrawer ? `<i class="ph-bold ph-caret-double-right text-sm"></i>` : `<i class="ph-fill ph-sparkle text-sm"></i>`}
            </button>` : ""}
        </div>`;

    const sectionLabel = (DASH_SECTIONS.find((s) => s.id === section)
        || { label: section === DS_SECTION_ID ? "Design system" : section }).label;

    if (section === "assistant") {
        /* N9: the Chats + New chat controls sit in the header row, right,
         * vertically aligned with the title. N10 + DR-M2: the saved-chats
         * list REPLACES the thread in this container (no state.view swap,
         * no shell render) and the title follows the body — "Saved Chats"
         * when open. The list icon is the only way back (M5: no Back). */
        const chats = loadChats();
        return `
        <div class="flex flex-col h-full rounded-t-2xl border border-b-0 border-gray-200 overflow-hidden">
            <div class="flex items-center justify-between px-4 pt-4 pb-2">
                <h1 class="text-lg font-bold tracking-tight text-gray-900">${state.chatsOpen ? "Saved Chats" : "Teachr Assistant"}</h1>
                <span class="flex items-center gap-2">
                    <button type="button" data-action="chats-page" title="Saved conversations" aria-expanded="${state.chatsOpen}"
                        class="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <i class="ph ph-list text-sm"></i>Saved chats
                    </button>
                    <button type="button" data-action="ai-new" data-chat="landing" title="Start a new conversation"
                        class="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <i class="ph ph-plus text-sm"></i>New chat
                    </button>
                </span>
            </div>
            ${state.chatsOpen ? chatsListHTML(chats) : `
            <div id="ai-thread" class="flex-1 min-h-0 overflow-y-auto px-5">${aiLandingThreadHTML()}</div>
            <div class="p-4">
                ${aiInputHTML("ai-landing-input", "landing")}
            </div>`}
        </div>`;
    }

    const header = cardHeader();

    if (section === "plans") {
        return state.planDetailId ? planDetailHTML() : plansListHTML();
    }

    if (section === "share") {
        const channel = (id, icon, label) => `
            <button type="button" data-action="share-channel" data-channel="${id}"
                class="flex-1 min-w-0 flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-colors
                       ${state.shareChannel === id
                           ? "border-gray-900 bg-gray-100 text-gray-900"
                           : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"}">
                <i class="ph ${icon} text-lg"></i><span class="truncate">${label}</span>
            </button>`;
        return `
        <div class="flex flex-col h-full rounded-t-2xl border border-b-0 border-gray-200 overflow-hidden">
            ${header}
            <div class="dash-body flex-1 min-h-0 overflow-y-auto px-4 pb-4">
                ${state.shareDone ? `
                <div class="rounded-xl border border-gray-200 bg-white p-6 text-center">
                    <i class="ph-fill ph-check-circle text-3xl text-green-600"></i>
                    <p class="pt-2 font-bold tracking-tight">Shared</p>
                    <p class="text-sm font-normal text-gray-500 pt-1">Learners can open ${state.shareSelection.length === 1
                        ? `"${esc((LESSONS.find((l) => l.id === state.shareSelection[0]) || {}).subtitle || "")}" from their training library.`
                        : `${state.shareSelection.length} trainings from their training library.`}</p>
                    <button type="button" data-action="share-reset"
                        class="mt-4 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors">Share another training</button>
                </div>` : `
                <p class="text-sm font-normal text-gray-500 pb-4">Send a training to your workforce. Learners get it in their own language.</p>
                <div class="space-y-2 pb-4">
                    ${LESSONS.map((l) => `
                    <button type="button" data-action="share-pick" data-lesson="${l.id}"
                        class="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors
                               ${state.shareSelection.includes(l.id) ? "border-gray-900 bg-gray-100" : "border-gray-200 bg-gray-50 hover:border-gray-300"}
                               ${l.status === "locked" ? "" : ""}">
                        <i class="ph ${state.shareSelection.includes(l.id) ? "ph-fill ph-check-circle text-gray-900" : "ph-circle text-gray-300"} text-xl shrink-0"></i>
                        <span class="flex-1 min-w-0">
                            <span class="block text-sm font-medium truncate">${esc(l.subtitle)}</span>
                            <span class="block text-xs font-normal text-gray-500">${esc(l.title)}, ${esc(l.duration)}${l.status === "locked" ? ", locked" : ""}</span>
                        </span>
                    </button>`).join("")}
                </div>
                <p class="text-xs font-medium text-gray-500 pb-2">Send as</p>
                <div class="flex gap-2 pb-4">
                    ${channel("link", "ph-link", "Copy link")}
                    ${channel("email", "ph-envelope-simple", "Email")}
                    ${channel("qr", "ph-qr-code", "QR code")}
                </div>
            </div>`}
        </div>`;
    }

    if (section === "demographics") {
        return `
        <div class="flex flex-col h-full rounded-t-2xl border border-b-0 border-gray-200 overflow-hidden">
            ${header}
            <div class="dash-body flex-1 min-h-0 overflow-y-auto px-4 pb-4">
                ${filterBar}
                <div class="space-y-2">
                    ${dashPanel("dash-market", "Training market", `${topMarket.market} leads — ${topMarket.pct}% completion`, chart("dash-market", "h-56", genderLegend))}
                    ${dashPanel("dash-gender", "Gender", `Cohorts skew female — ${GENDER_SPLIT.female}% women, ${GENDER_SPLIT.male}% men, ${GENDER_SPLIT.other}% other`, chart("dash-gender", "h-56",
                        `<div class="chart-legend flex flex-wrap justify-center gap-4 pt-2 text-xs text-gray-500">
                            ${legendItem(GENDER_COLORS.female, `Female ${GENDER_SPLIT.female}%`)}
                            ${legendItem(GENDER_COLORS.male, `Male ${GENDER_SPLIT.male}%`)}
                            ${legendItem(GENDER_COLORS.other, `Other ${GENDER_SPLIT.other}%`)}
                        </div>`))}
                    ${dashPanel("dash-age", "Age group", `${topAgeGroup.age.replace("-", "–")} is the largest cohort`, chart("dash-age", "h-56", genderLegend))}
                    ${dashPanel("dash-migrant", "Migrant status", `${domesticShare}% of the workforce is domestic`, chart("dash-migrant", "h-56", genderLegend))}
                </div>
            </div>
        </div>`;
    }

    if (section === "outcomes") {
        return `
        <div class="flex flex-col h-full rounded-t-2xl border border-b-0 border-gray-200 overflow-hidden">
            ${header}
            <div class="dash-body flex-1 min-h-0 overflow-y-auto px-4 pb-4">
                ${filterBar}
                <div class="space-y-2">
                    ${dashPanel("dash-messages", "Performance on key messages", `${AVG_PERFORMANCE}% average — all ${KEY_MESSAGE_SCORES.length} in the high band`, chart("dash-messages", "h-56", perfLegend))}
                    ${dashPanel("dash-scores", "Average score by lesson", `${topLesson.lesson} tops at ${topLesson.pct}%`, chart("dash-scores", "h-56"))}
                    ${dashPanel("dash-activity", "Weekly activity", `${lastWeekActivity} lessons completed last week`, chart("dash-activity", "h-56"))}
                    ${dashPanel("dash-heatmap", "Score heatmap", `${heatmapTrend >= 0 ? "Up" : "Down"} ${Math.abs(heatmapTrend)} points over six weeks`, chart("dash-heatmap", "h-56"))}
                </div>
            </div>
        </div>`;
    }

    if (section === "ds") {
        return `
        <div class="flex flex-col h-full rounded-t-2xl border border-b-0 border-gray-200 overflow-hidden">
            ${header}
            <div class="dash-body flex-1 min-h-0 overflow-y-auto px-4 pb-4">
                ${dsViewHTML()}
            </div>
        </div>`;
    }

    return `
    <div class="flex flex-col h-full rounded-t-2xl border border-b-0 border-gray-200 overflow-hidden">
        ${header}
        <div class="dash-body flex-1 min-h-0 overflow-y-auto px-4 pb-4">
            <div class="p-8 text-center">
                <i class="ph ph-chart-bar text-3xl text-gray-300"></i>
                <p class="pt-2 font-normal text-gray-400">The ${esc(section)} section is not part of the prototype yet.</p>
            </div>
        </div>
    </div>`;
}

/* ------------------------- Design system view (DS) -------------------------
 * Live reference for the tokens and components. Every sample is rendered
 * through the DS builders above — the same functions the app's call sites
 * use — so this view cannot drift from the product. */

const DS_COLORS = [
    ["ledger-ink", "#10231F", "text"], ["audit-teal", "#14A08D", "brand / the one accent"],
    ["signal-good", "#15803D", "positive"], ["signal-warn", "#B45309", "watch"],
    ["signal-bad", "#B91C1C", "failure"], ["paper", "#F5FAF7", "ground (R13 ramp top)"],
    ["ground-lo", "#E3EFE8", "ground ramp end"], ["wave-back", "#C6EDE7", "ambient wave (back)"],
    ["wave-front", "#9BDBCF", "ambient wave (front)"],
    ["hairline", "#E5E7EB", "borders"],
];
const DS_BRAND = [["50", "#F0FAF8"], ["100", "#D9F2EE"], ["200", "#B3E5DD"], ["300", "#8AD8CC"],
    ["400", "#4FBFAB"], ["500", "#23B096"], ["600", "#14A08D"], ["700", "#0E8073"],
    ["800", "#0C6A5F"], ["900", "#0A544C"]];
const DS_TYPE = [
    ["Display 24/700 tracking-tight", "text-2xl font-black tracking-tight"],
    ["Title 18/700 (section h1)", "text-lg font-bold tracking-tight"],
    ["Body 14/1.45", "text-sm"],
    ["Meta 12 grey", "text-xs text-gray-500"],
    ["Caption 11 grey (floor)", "text-[11px] text-gray-400"],
];
const DS_SPACE = [4, 8, 12, 16, 24, 32];
const DS_RADII = [["8px", "rounded-lg"], ["12px", "rounded-xl"], ["16px", "rounded-2xl"], ["full", "rounded-full"]];

/* DS specimen tags: every sample carries its semantic CSS identifier —
 * class-style names (not utility lists), so the docs read as an API. */
const dsTag = (id) => `<span class="inline-block font-mono text-[10px] leading-none text-gray-400 bg-gray-100 rounded px-1.5 py-1 select-none">.${esc(id)}</span>`;

/* A specimen cell: the sample plus its identifier tag underneath. */
const dsCell = (id, inner) => `<div class="min-w-0 space-y-1.5">${inner}${dsTag(id)}</div>`;

function dsGroup(title, inner, id) {
    return `<section class="pt-4">
        <h3 class="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500 pb-2">${esc(title)}${id ? dsTag(id) : ""}</h3>
        <div class="rounded-xl border border-gray-200 bg-white p-4">${inner}</div>
    </section>`;
}

function dsSection(title, ...groups) {
    return `<section class="pt-6 first:pt-2">
        <h2 class="text-base font-bold tracking-tight text-gray-900 pb-1">${esc(title)}</h2>
        ${groups.join("")}
    </section>`;
}

/* DS as its own training-side view (R7-13): same content as the dashboard's
 * DS section, in the training tab's chrome. Back returns to Settings. */
function renderDSView() {
    app().innerHTML = `
        ${viewHeader("ds-back", "Design system")}
        ${scrollShell("ds-scroll", `
            <div class="${shell("px-4 pt-2 pb-8")}">
                ${dsViewHTML()}
            </div>
        `)}
    `;
}

function dsViewHTML() {
    const swatch = (name, hex, role) => `
        <div class="min-w-0">
            <span class="block h-10 rounded-lg border border-gray-200" style="background:${hex}"></span>
            <span class="block text-xs font-medium text-gray-700 pt-1 truncate">${esc(name)}</span>
            <span class="block text-[11px] font-normal text-gray-400">${esc(hex)}${role ? " · " + esc(role) : ""}</span>
        </div>`;
    return `
    <div>
        <p class="text-sm font-normal text-gray-500 pb-2">Tokens, elements and components of this prototype, rendered live. The app's call sites use the same builder functions as these samples.</p>

        ${dsSection("Tokens",
            dsGroup("Colour — semantic tokens", `<div class="grid grid-cols-4 gap-3">${DS_COLORS.map(([n, h, r]) => swatch(n, h, r)).join("")}</div>`),
            dsGroup("Colour — brand scale (audit-teal)", `<div class="grid grid-cols-5 gap-3">${DS_BRAND.map(([n, h]) => swatch("brand-" + n, h)).join("")}</div>`),
            dsGroup("Type — IBM Plex Sans, tabular numerals on metrics", `<div class="space-y-2">${DS_TYPE.map(([label, cls]) => `<p class="${cls}">${esc(label)} — 10,039 learners</p>`).join("")}</div>`),
            dsGroup("Space (4px base)", `<div class="flex items-end gap-3">${DS_SPACE.map((s) => `<div class="text-center"><span class="block bg-brand-200 rounded" style="width:${s}px;height:${s}px"></span><span class="text-[11px] text-gray-400">${s}</span></div>`).join("")}</div>`),
            dsGroup("Radius", `<div class="flex items-center gap-3">${DS_RADII.map(([label, cls]) => `<span class="block w-10 h-10 bg-brand-100 border border-brand-200 ${cls}"></span><span class="text-[11px] text-gray-400">${label}</span>`).join("")}</div>`),
            dsGroup("Motion", `<p class="text-sm text-gray-600">State changes: <b>200ms var(--ease-out)</b> · reveals: <b>240ms var(--ease-in-out)</b> · <code>prefers-reduced-motion</code> drops all travel and keeps content.</p>`)
        )}

        ${dsSection("Elements",
            dsGroup("Buttons", `<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                ${dsCell("btn-primary", uiBtn("Continue", "ds-none", "primary"))}
                ${dsCell("btn-primary-disabled", uiBtn("Continue", "ds-none", "primary", "disabled"))}
                ${dsCell("btn-ghost", uiBtn("Settings", "ds-none", "ghost"))}
                ${dsCell("btn-text", uiBtn("Leave lesson", "ds-none", "text"))}
                ${dsCell("btn-danger", uiBtn("Log out", "ds-none", "danger"))}
                ${dsCell("btn-scroll-down", scrollDownBtnHTML())}
            </div>`, "btn"),
            dsGroup("Icon button", `<div class="flex flex-wrap items-start gap-x-6 gap-y-3">
                ${dsCell("icon-btn-gear", uiIconBtn("ph-gear-six", "Settings", 'data-action="ds-none"'))}
                ${dsCell("icon-btn-close", uiIconBtn("ph-x", "Close", 'data-action="ds-none"'))}
                ${dsCell("icon-btn-add", uiIconBtn("ph-plus", "Add", 'data-action="ds-none"'))}
            </div>`, "icon-btn"),
            dsGroup("Chip", `<div class="flex flex-wrap items-start gap-x-6 gap-y-3">
                ${dsCell("chip-suggest", uiChip("Per-market breakdown", 'data-action="ds-none"'))}
                ${dsCell("chip-suggest-alt", uiChip("Who is behind?", 'data-action="ds-none"'))}
            </div>`, "chip"),
            dsGroup("Badge", `<div class="flex flex-wrap items-start gap-x-6 gap-y-3">
                ${dsCell("badge-done", uiBadge("done", "Completed"))}
                ${dsCell("badge-active", uiBadge("active", "Start"))}
                ${dsCell("badge-locked", uiBadge("locked", "Locked"))}
            </div>`, "badge"),
            dsGroup("Text input", `<input type="text" placeholder="Your name" class="w-full max-w-xs p-4 rounded-2xl border-2 border-gray-200 bg-gray-50 focus:border-gray-900 focus:outline-none text-lg">`, "input-text"),
            dsGroup("Checkbox", `<label class="flex items-center justify-between max-w-xs text-sm cursor-pointer">
                <span>Use page context</span>
                <input type="checkbox" checked class="accent-gray-900 w-5 h-5">
            </label>`, "checkbox"),
            dsGroup("Link", `<a href="#" class="text-sm font-semibold text-gray-900 underline decoration-gray-300 underline-offset-2">Open course</a>`, "link")
        )}

        ${dsSection("Components",
            dsGroup("Option row", `<div class="space-y-3 max-w-md">
                ${dsCell("option-row-selected", uiOptionRow("Site Access & Visitors", { sub: "Lesson 1 · 10 min", selected: true, action: "ds-none" }))}
                ${dsCell("option-row", uiOptionRow("Machines & Storage Security", { sub: "Lesson 2 · 12 min", action: "ds-none" }))}
            </div>`),
            dsGroup("Chat bubbles", `<div class="max-w-md space-y-3">
                ${dsCell("bubble-user", aiUserBubble({ text: "Which teams need my attention?" }, 0, "landing"))}
                ${dsCell("bubble-assistant", aiAssistantBubble({ text: "28 learners are overdue across three teams — Riverside alone accounts for 12.", chips: ["Send a reminder", "Per-market breakdown"] }, 1, "landing", true))}
            </div>`),
            dsGroup("Chat input card", aiInputHTML("ds-input", "landing"), "chat-input"),
            dsGroup("Empty state", `<div class="h-48 border border-dashed border-gray-200 rounded-xl">
                ${uiEmptyState({ icon: "ph-sparkle", title: "Teachr Assistant", sub: "Ask about this page, or press Summarize." })}
            </div>`, "empty-state"),
            dsGroup("Progress bar", `<div class="max-w-xs space-y-3">${uiProgress(64)}<div class="flex justify-between text-[11px] text-gray-400"><span>4 of 6 questions</span><span>64%</span></div></div>`, "progress-bar"),
            dsGroup("Segmented bar", `<div class="max-w-xs">${segmentBar(2, 4)}</div>`, "segmented-bar"),
            dsGroup("Filter bar", filterBar, "filter-bar"),
            dsGroup("Confirmation card", `<div class="max-w-xs rounded-xl border border-gray-200 bg-white p-6 text-center">
                <i class="ph-fill ph-check-circle text-3xl text-green-600"></i>
                <p class="pt-2 font-bold tracking-tight">Shared</p>
                <p class="text-sm font-normal text-gray-500 pt-1">Learners can open 2 trainings from their training library.</p>
            </div>`, "confirm-card"),
            dsGroup("Option row states (R7: hover = accent)", `<div class="space-y-3 max-w-md">
                ${dsCell("option-row", uiOptionRow("Unselected — hover me", { sub: "Hover takes the accent", action: "ds-none" }))}
                ${dsCell("option-row-selected", uiOptionRow("Selected", { sub: "State keeps the neutral look", selected: true, action: "ds-none" }))}
            </div>`),
            dsGroup("Media course card (R7-9)", `<div class="ds-frame max-w-xl">${lessonCard(LESSONS.find((l) => l.status === "active"), 1)}</div>`, "course-card"),
            dsGroup("Leave-lesson dialog (R7-11)", `<div class="ds-frame bg-gray-900/30 flex items-center justify-center h-80">${lessonExitCardHTML()}</div>`, "dialog-leave"),
            dsGroup("Support FAB + panel (R7-12)", `<div class="ds-frame relative h-[26rem] bg-gray-50">
                ${supportFABOnlyHTML().replace('id="support-fab"', 'id="ds-support-fab"').replace(/fixed bottom-\[18px\] right-6/, "absolute bottom-3 right-5")}
                ${supportPanelHTML().replace('id="support-panel"', 'id="ds-support-panel"').replace(/fixed bottom-\[4\.875rem\] right-6/, "absolute bottom-[3.25rem] right-5")}
            </div>`, "fab-support"),
            dsGroup("Scroll-down button, ghost state (R7f17)", scrollDownBtnHTML(), "btn-scroll-down"),
        )}
    </div>`;
}

/* --------------------------- Plan training (M) ----------------------------
 * The plans section: a list view of training plans (M3) and a detail
 * subpage (M4) — plan header, progress chart, the course list split into
 * required (progress rolls up from these only) and a supplemental optional
 * group, deadline editing, course add/remove. Everything is computed from
 * the dataset (PLANS) + session state (lessonAnswers) — no hand-copied
 * numbers (D3). */

const DAY = 24 * 60 * 60 * 1000;

function planCourse(planId, lessonId) {
    const p = state.plans.find((x) => x.id === planId);
    return p && p.courses.find((c) => c.lesson === lessonId);
}

/* A course's effective completion: the seeded cohort share, or 100% when
 * this session's user has answered every question in the course (M5 — the
 * plan shows updated progress after finishing a course). */
function courseDone(c) {
    const lesson = LESSONS.find((l) => l.id === c.lesson);
    const answered = (state.lessonAnswers[c.lesson] || []).length;
    if (lesson && lesson.questions && answered >= lesson.questions.length) return 100;
    return c.done;
}

function planProgress(p) {
    const required = p.courses.filter((c) => c.required);
    const requiredDone = required.filter((c) => courseDone(c) === 100).length;
    const pct = required.length
        ? Math.round(required.reduce((s, c) => s + courseDone(c), 0) / required.length)
        : 0;
    return { pct, requiredDone, requiredTotal: required.length };
}

function deadlineState(p) {
    const days = Math.round((new Date(p.deadline) - Date.now()) / DAY);
    const fmt = new Date(p.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    if (days < 0) return { cls: "text-red-600", label: `Overdue — was due ${fmt}` };
    if (days <= 7) return { cls: "text-amber-700", label: days === 0 ? `Due today (${fmt})` : `Due in ${days}d (${fmt})` };
    return { cls: "text-gray-500", label: `Due ${fmt}` };
}

function plansListHTML() {
    const rows = state.plans.map((p) => {
        const prog = planProgress(p);
        const dl = deadlineState(p);
        const optional = p.courses.length - prog.requiredTotal;
        return `
        <button type="button" data-action="plan-open" data-plan="${p.id}"
            class="w-full text-left p-4 rounded-xl border-2 border-gray-200 bg-gray-50 hover:border-gray-300 transition-colors">
            <span class="flex items-center gap-3">
                <span class="flex-1 min-w-0">
                    <span class="block text-sm font-semibold truncate">${esc(p.title)}</span>
                    <span class="block text-xs font-normal text-gray-500 pt-0.5">${esc(p.audience)}</span>
                </span>
                <span class="text-xs font-medium ${dl.cls} shrink-0">${dl.label}</span>
            </span>
            <span class="flex items-center gap-3 pt-3">
                <span class="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden block">
                    <span class="h-full rounded-full bg-brand-600 block" style="width:${prog.pct}%"></span>
                </span>
                <span class="text-xs font-semibold text-gray-700 w-9 text-right">${prog.pct}%</span>
            </span>
            <span class="block text-[11px] font-normal text-gray-500 pt-2">${prog.requiredDone} of ${prog.requiredTotal} required courses complete${optional ? `, ${optional} optional` : ""}</span>
        </button>`;
    }).join("");
    const aiToggle = `
        <button type="button" data-action="ai-drawer" aria-expanded="${state.assistantDrawer}" title="${state.assistantDrawer ? "Close assistant" : "Open Teachr Assistant"}"
            class="w-11 h-11 -m-2 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white transition-colors">
            ${state.assistantDrawer ? `<i class="ph-bold ph-caret-double-right text-sm"></i>` : `<i class="ph-fill ph-sparkle text-sm"></i>`}
        </button>`;
    return `
    <div class="flex flex-col h-full rounded-t-2xl border border-b-0 border-gray-200 overflow-hidden">
        <div class="flex items-center justify-between px-4 pt-4 pb-2">
            <h1 class="text-lg font-bold tracking-tight text-gray-900">Course Planning</h1>
            ${aiToggle}
        </div>
        <div class="dash-body flex-1 min-h-0 overflow-y-auto px-4 pb-4">
            <p class="text-sm font-normal text-gray-500 pb-4">Training plans group courses for an audience and track their progress against a deadline.</p>
            <div class="space-y-2">${rows}</div>
        </div>
    </div>`;
}

function planCourseRow(p, c) {
    const lesson = LESSONS.find((l) => l.id === c.lesson);
    const pct = courseDone(c);
    const locked = lesson && lesson.status === "locked";
    return `
    <div class="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 bg-gray-50">
        <button type="button" data-action="plan-toggle-req" data-plan="${p.id}" data-course="${c.lesson}"
            title="Mark as ${c.required ? "optional" : "required"}"
            aria-pressed="${c.required}"
            class="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                   ${c.required ? "bg-brand-600 text-white" : "border border-gray-300 text-gray-400 bg-white hover:border-gray-400"}"
            ${pct === 100 ? "disabled" : ""}>${c.required ? "R" : "O"}</button>
        <span class="flex-1 min-w-0">
            <span class="block text-sm font-medium truncate">${esc(lesson ? lesson.subtitle : c.lesson)}</span>
            <span class="block text-xs font-normal text-gray-500">${esc(lesson ? `${lesson.title}, ${lesson.duration}` : "")}${locked ? ", locked" : ""}</span>
        </span>
        <span class="flex items-center gap-2 w-28 shrink-0">
            <span class="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden block">
                <span class="h-full rounded-full ${pct === 100 ? "bg-green-600" : "bg-brand-600"} block" style="width:${pct}%"></span>
            </span>
            <span class="text-xs font-semibold text-gray-700 w-8 text-right">${pct}%</span>
        </span>
        <button type="button" data-action="plan-course-open" data-lesson="${c.lesson}"
            ${locked ? "disabled" : ""}
            class="shrink-0 flex items-center gap-1 text-xs font-semibold text-gray-900 underline decoration-gray-300 underline-offset-2 hover:decoration-gray-900 disabled:text-gray-300 disabled:no-underline transition-colors">
            Open<i class="ph ph-arrow-up-right text-xs" aria-hidden="true"></i>
        </button>
        <button type="button" data-action="plan-remove-course" data-plan="${p.id}" data-course="${c.lesson}"
            title="Remove course" aria-label="Remove ${esc(lesson ? lesson.subtitle : c.lesson)} from the plan"
            class="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors">
            <i class="ph ph-x text-sm"></i>
        </button>
    </div>`;
}

function planDetailHTML() {
    const p = state.plans.find((x) => x.id === state.planDetailId);
    if (!p) { state.planDetailId = null; return plansListHTML(); }
    const prog = planProgress(p);
    const dl = deadlineState(p);
    const required = p.courses.filter((c) => c.required);
    const optional = p.courses.filter((c) => !c.required);
    const picker = state.planPicking ? `
        <div class="rounded-xl border-2 border-dashed border-gray-300 p-3 space-y-2">
            <p class="text-xs font-semibold text-gray-500">Pick courses to add — they join as required; toggle any row to make it optional.</p>
            ${LESSONS.filter((l) => !p.courses.some((c) => c.lesson === l.id)).map((l) => `
            <button type="button" data-action="plan-pick" data-lesson="${l.id}"
                class="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors
                       ${state.planPicks.includes(l.id) ? "border-gray-900 bg-gray-100" : "border-gray-200 bg-gray-50 hover:border-gray-300"}
                       ${l.status === "locked" ? "" : ""}">
                <i class="ph ${state.planPicks.includes(l.id) ? "ph-fill ph-check-circle text-gray-900" : "ph-circle text-gray-300"} text-xl shrink-0"></i>
                <span class="flex-1 min-w-0">
                    <span class="block text-sm font-medium truncate">${esc(l.subtitle)}</span>
                    <span class="block text-xs font-normal text-gray-500">${esc(l.title)}, ${esc(l.duration)}${l.status === "locked" ? ", locked" : ""}</span>
                </span>
            </button>`).join("")}
            <button type="button" data-action="plan-save" ${state.planPicks.length ? "" : "disabled"}
                class="w-full bg-brand-700 hover:bg-brand-800 disabled:bg-gray-300 text-white font-bold py-2.5 px-6 rounded-full transition-colors text-sm">Add ${state.planPicks.length || ""} course${state.planPicks.length === 1 ? "" : "s"}</button>
        </div>` : "";
    return `
    <div class="flex flex-col h-full rounded-t-2xl border border-b-0 border-gray-200 overflow-hidden">
        <div class="flex items-center gap-3 px-4 pt-4 pb-2">
            ${backBtn("plan-back", "Plans")}
            <h1 class="text-lg font-bold tracking-tight text-gray-900 truncate">${esc(p.title)}</h1>
            <span class="ml-auto">${`
            <button type="button" data-action="ai-drawer" aria-expanded="${state.assistantDrawer}" title="${state.assistantDrawer ? "Close assistant" : "Open Teachr Assistant"}"
                class="w-11 h-11 -m-2 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white transition-colors">
                ${state.assistantDrawer ? `<i class="ph-bold ph-caret-double-right text-sm"></i>` : `<i class="ph-fill ph-sparkle text-sm"></i>`}
            </button>`}</span>
        </div>
        <div class="dash-body flex-1 min-h-0 overflow-y-auto px-4 pb-4">
            <div class="rounded-xl border border-gray-200 bg-white p-4 mb-6">
                <div class="flex items-center gap-3">
                    <span class="flex-1 min-w-0 text-sm text-gray-600">${esc(p.audience)}</span>
                    <span class="text-xs font-medium ${dl.cls}">${dl.label}</span>
                </div>
                <div class="flex items-center gap-3 pt-3">
                    <span class="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden block">
                        <span class="h-full rounded-full bg-brand-600 block" style="width:${prog.pct}%"></span>
                    </span>
                    <span class="text-lg font-black tracking-tight text-gray-900">${prog.pct}%</span>
                </div>
                <p class="text-[11px] font-normal text-gray-500 pt-2">${prog.requiredDone} of ${prog.requiredTotal} required courses complete — progress counts required courses only.</p>
                <label class="flex items-center gap-2 pt-3 text-xs font-medium text-gray-500">
                    Deadline
                    <input type="date" data-action="plan-deadline" data-plan="${p.id}" value="${p.deadline}"
                        class="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 focus:border-gray-900 focus:outline-none">
                </label>
            </div>
            <p class="text-xs font-semibold text-gray-500 pb-2">Required courses</p>
            <div class="space-y-2 mb-6">${required.map((c) => planCourseRow(p, c)).join("")}</div>
            ${optional.length ? `
            <p class="text-xs font-semibold text-gray-500 pb-2">Optional <span class="font-normal text-gray-400">(documented, not counted in progress)</span></p>
            <div class="space-y-2">${optional.map((c) => planCourseRow(p, c)).join("")}</div>` : ""}
            ${state.planPicking ? picker : `
            <button type="button" data-action="plan-picker"
                class="mt-6 w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-gray-300 text-sm font-medium text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors">
                <i class="ph ph-plus text-sm"></i>Add course
            </button>`}
        </div>
    </div>`;
}

/* Re-render the plans section in place (no charts live there — keep-alive
 * is not at risk). */
function patchPlans() {
    const sec = document.querySelector('[data-dash-sec="plans"]');
    if (sec) sec.innerHTML = dashContentHTML("plans");
}

/* M5: returning from a course opened from a plan — back to the plan detail,
 * whose progress now reflects the completed course (courseDone). The
 * keep-alive stash re-attaches the pre-lesson plans DOM, so the section is
 * refreshed in place (no charts live there — safe to re-render). */
function returnFromPlan() {
    const planId = state.planReturn;
    state.planReturn = null;
    state.view = "dashboard";
    state.dashSection = "plans";
    state.planDetailId = planId;
    render();
    patchPlans();
}

/* Re-render the Share training section in place (no charts live there, so
 * keep-alive is not at risk). */
function patchSharePanel() {
    const sec = document.querySelector('[data-dash-sec="share"]');
    if (sec) sec.innerHTML = dashContentHTML("share");
}

/* Replace the dashboard's content column in place — the shell and charts
 * of other sections are never touched. */
function patchDashContent() {
    const content = document.getElementById("dash-content");
    if (!content) return;
    /* Keep-alive: each section renders ONCE into its own container and keeps
     * its DOM + chart roots across switches — only the target container is
     * revealed; first-visit containers are populated here. */
    let sec = content.querySelector(`[data-dash-sec="${state.dashSection}"]`);
    if (!sec) {
        sec = document.createElement("div");
        sec.dataset.dashSec = state.dashSection;
        sec.className = "h-full";
        content.appendChild(sec);
    }
    if (!sec.innerHTML.trim()) sec.innerHTML = dashContentHTML(state.dashSection);
    content.querySelectorAll("[data-dash-sec]").forEach((el) => {
        el.hidden = el.dataset.dashSec !== state.dashSection;
    });
    // Mount charts after the patched shell has painted (double-rAF): the
    // section switch then feels instant — structure first, charts pop in
    // ~2 frames later instead of a 100-200ms chart mount inside the click
    // task. Stale deferred mounts self-heal: renderDashCharts unmounts roots
    // and skips disconnected hosts.
    const section = state.dashSection;
    // stagger=true — one chart mount per frame, so a first visit never
    // batches every Nivo render into one long task. P3: the 2MB charts
    // bundle is lazy — imported on first dashboard use, never on
    // language/registration/lesson/library.
    requestAnimationFrame(() => requestAnimationFrame(() => {
        ensureCharts().then(() => window.renderDashCharts && window.renderDashCharts(section, true));
    }));
    const body = sec.querySelector(".dash-body");
    if (body) body.scrollTop = 0;
}

/* Switch the visible dashboard section exactly the way the rail's nav does
 * (E4/open question 3): assistant-driven switches reuse the same path, so
 * they animate and behave identically to user-driven ones. */
function showDashSection(section) {
    if (!section || state.dashSection === section) return;
    // The assistant view IS the chat — never show the drawer there (P0:
    // the drawer closes by node removal, not a shell rebuild).
    if (section === "assistant") setAssistantDrawer(false);
    state.dashSection = section;
    const slot = document.getElementById("dash-sidebar-slot");
    if (slot) slot.outerHTML = dashSidebarHTML();
    patchDashContent();
    // Keep the open drawer's context chip in sync with the visible section.
    const drawer = document.getElementById("ai-drawer");
    if (drawer && (state.aiDrawerContext || state.aiDrawerPanel)) {
        state.aiDrawerContext = section;
        state.aiDrawerPanel = null; // section switch invalidates panel context
        drawer.outerHTML = aiDrawerHTML();
        patchChat("drawer");
    }
}

/* P0: open/close the assistant drawer by patching its own node — the shell
 * (and every chart root in it) is never rebuilt for a drawer toggle (R1/R2).
 * Falls back to a full render only when no dashboard shell exists. */
function setAssistantDrawer(open) {
    state.assistantDrawer = open;
    if (!open) {
        state.aiDrawerPanel = null;
        state.aiDrawerPanelTakeaway = null;
    }
    const existing = document.getElementById("ai-drawer");
    const main = document.querySelector("#dash-content")?.closest("main");
    if (!main && !existing) { render(); return; }
    if (open && !existing) main.insertAdjacentHTML("afterend", aiDrawerHTML());
    if (!open && existing) existing.remove();
    // Sync every header toggle (icon + aria) in place — one per section.
    for (const btn of document.querySelectorAll('[data-action="ai-drawer"]')) {
        btn.setAttribute("aria-expanded", String(state.assistantDrawer));
        btn.title = state.assistantDrawer ? "Close assistant" : "Open Teachr Assistant";
        btn.innerHTML = state.assistantDrawer
            ? '<i class="ph-bold ph-caret-double-right text-sm"></i>'
            : '<i class="ph-fill ph-sparkle text-sm"></i>';
    }
}

/* Reveal a dashboard panel (E4): scroll it into view. Panels no longer
 * collapse (SPEC J5 removed the toggle), so reveal is just the scroll. */
function revealDashPanel(id) {
    if (!id) return;
    const panel = document.querySelector(`[data-panel="${id}"]`);
    if (!panel) return;
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* ------------------------------ Lesson view ------------------------------- *
 * The lesson is a persistent skeleton (header, progress, scroller, bottom
 * bar) rendered once on entry. Interactions mutate it surgically: pages are
 * appended as they unlock, option states are patched in place, and the
 * scroll position is never reset — that is the fix for both the scroll
 * jumps and the scroll jank.                                              */

function optionRowHTML(lesson, qIndex, opt, i) {
    const completedList = state.lessonAnswers[lesson.id] || [];
    const completed = completedList.includes(qIndex);
    const fb = (state.lessonFeedback[lesson.id] || {})[qIndex] || {};
    const q = lesson.questions[qIndex];
    const locked = completed || fb.status === "correct" || fb.status === "revealed";
    const wrongPicks = fb.wrongPicks || [];
    const isWrongPick = wrongPicks.includes(i);
    // Round 6c: the radio is back for idle/staged rows (pick-one semantics,
    // native keyboard). The moment an answer settles, the radio is replaced
    // by the state mark; the speaker keeps the right slot in every state.
    // The correct answer is green; the revealed info uses blue in the strip.
    const interactive = !locked && !isWrongPick;

    let cls, textCls = "text-gray-900", mark = "";
    if (locked && i === q.correct) {
        // Green = correct (self-answered); blue + lightbulb = info (revealed
        // after two misses) — the list element adapts per state (round 6h).
        // fb.status stays "revealed" once revealed, so the info row persists.
        const revealed = fb.status === "revealed";
        cls = revealed ? "border-blue-600 bg-blue-50 cursor-default" : "border-green-600 bg-green-50 cursor-default";
        textCls = revealed ? "text-blue-700" : "text-green-700";
        mark = revealed
            ? `<i class="ph-fill ph-lightbulb text-xl text-blue-600"></i>`
            : `<i class="ph-fill ph-check-circle text-xl text-green-600"></i>`;
    } else if (isWrongPick) {
        cls = "border-red-400 bg-red-50 cursor-default";
        textCls = locked ? "text-gray-400 line-through" : "text-red-600";
        mark = `<i class="ph-fill ph-x-circle text-xl text-red-400"></i>`;
    } else if (locked) {
        cls = "border-gray-200 bg-gray-50 cursor-default";
        textCls = "text-gray-400";
    } else if (fb.selected === i) {
        cls = "border-brand-600 bg-brand-50 cursor-pointer";
    } else {
        cls = "border-gray-200 bg-gray-50 hover:border-brand-500 hover:bg-brand-50 cursor-pointer";
    }

    // R7 follow-up 4: the current answer pins while a long list scrolls —
    // the staged selection before submit, or the settled correct row after.
    const isAnswerRow = (fb.selected === i && !completed) || (locked && i === q.correct);

    const left = interactive
        ? `<input type="radio" name="lesson-q-${qIndex}" class="w-5 h-5 shrink-0" ${fb.selected === i ? "checked" : ""} data-question="${qIndex}" data-option="${i}">`
        : `<span class="w-5 h-5 shrink-0 inline-flex items-center justify-center">${mark}</span>`;
    return `
        <label class="opt-row ${isAnswerRow ? "sticky-answer" : ""} w-full flex items-center gap-4 text-left p-4 min-h-[3.5rem] rounded-2xl border-2 transition-colors ${interactive ? "cursor-pointer" : "cursor-default"} ${cls}">
            ${left}
            <span class="flex-1 font-medium ${textCls}">${esc(opt.label)}</span>
            ${speakerBtn()}
        </label>`;
}

function questionInner(lesson, qIndex) {
    const q = lesson.questions[qIndex];
    // R7 follow-up 4: the question anchors at a fixed height above centre —
    // every question lands on the same spot whatever the answers do — and
    // the options run in their own capped lane, scrolling when a list is
    // longer than the space between the question and the floating bar.
    return `
        <div class="${column("w-full px-6")}">
            <div class="q-anchor flex items-start gap-2 pb-6">
                <h2 class="q-title flex-1 pt-0.5">${esc(q.title)}</h2>
                ${speakerBtn()}
            </div>
            <div class="space-y-3 pb-6">${q.options.map((opt, i) => optionRowHTML(lesson, qIndex, opt, i)).join("")}</div>
        </div>`;
}

function questionPageHTML(lesson, qIndex, fresh = false) {
    // R7-6/R7-7: `fresh` marks a page revealed as the new frontier — its
    // content rises once (CSS .page-enter). Refreshes and already-passed
    // pages render plain, so selections and scroll-backs never replay it.
    return `<section class="lesson-q lesson-page ${fresh ? "page-enter" : ""}" data-question="${qIndex}">${questionInner(lesson, qIndex)}</section>`;
}

/* R8 B15: the confetti pieces — deterministic (no Math.random: the probes
 * are stable), token vocabulary only (audit-teal + the three signals),
 * fanned left→right from under the seal-check, falling + spinning. */
const CONFETTI_COLORS = ["#14A08D", "#15803D", "#B45309", "#B91C1C"];
const CONFETTI_PIECES = Array.from({ length: 24 }, (_, i) => ({
    x: Math.round(-180 + 360 * (i / 23) + ((i % 3) - 1) * 24),
    y: 320 + ((i * 37) % 260),
    r: (i % 2 ? 1 : -1) * (120 + ((i * 53) % 240)),
    delay: ((i * 13) % 10) * 30,
    dur: 1200 + ((i * 29) % 700),
    c: CONFETTI_COLORS[i % 4],
}));

function confettiHTML() {
    return `\n                <div class="confetti" aria-hidden="true">\n                    ${CONFETTI_PIECES.map((p) => `\n                    <i style="--px:${p.x}px;--py:${p.y}px;--pr:${p.r}deg;--pdelay:${p.delay}ms;--pdur:${p.dur}ms;--pc:${p.c}"></i>`).join("")}\n                </div>`;
}

function completionPageHTML(lesson, fresh = false) {
    // Round 6c: the app's layout language — icon + title top, stat tiles
    // middle (the dashboard's diagram-card KPI family), Continue bottom.
    const fbs = state.lessonFeedback[lesson.id] || [];
    const answered = state.lessonAnswers[lesson.id] || [];
    let wrongs = 0, rightFirstTry = 0;
    for (const qi of answered) {
        const w = (fbs[qi] && fbs[qi].wrong) || 0;
        wrongs += w;
        if (!w) rightFirstTry++;
    }
    const start = state.lessonStart[lesson.id];
    // Speed readout caps at 5:12 (312s) — real elapsed (leftover lesson
    // starts, idle tabs) otherwise reads as silly multi-hour times.
    const elapsed = start ? Math.min(312, Math.max(1, Math.round((Date.now() - start) / 1000))) : 0;
    const perQ = answered.length ? Math.max(1, Math.round(elapsed / answered.length)) : 0;
    // Mobile: single-line cards (label + sublabel left, big teal number
    // right), tall enough to fill the space under the title. The whole KPI
    // block sits in flow (flex-1), so the badge's padding pushes the title
    // and the KPIs down together, and nothing overlaps.
    // Tablet/desktop: fixed 256px squares — flex-none so the size holds even
    // where the row spills past the 512px column.
    const tile = (label, value, sub) => `
            <div class="flex-1 md:flex-none md:size-64 md:shrink-0 rounded-2xl diagram-card px-4 py-3.5 md:p-6">
                <span class="md:hidden flex items-center justify-between gap-4 w-full">
                    <span class="block min-w-0 text-left">
                        <span class="block text-base font-semibold text-brand-700 truncate">${esc(label)}</span>
                        <span class="block text-[11px] font-normal text-gray-500 pt-0.5">${esc(sub)}</span>
                    </span>
                    <span class="shrink-0 text-4xl font-black tracking-tight text-brand-700 tnum">${esc(value)}</span>
                </span>
                <span class="hidden md:flex flex-col items-center justify-center text-center h-full">
                    <span class="text-xl font-semibold text-brand-700">${esc(label)}</span>
                    <span class="text-6xl font-black tracking-tight text-brand-700 tnum pt-3">${esc(value)}</span>
                    <span class="text-base font-normal text-gray-500 pt-2">${esc(sub)}</span>
                </span>
            </div>`;
    return `
        <section id="lesson-complete" class="lesson-page relative ${fresh ? "page-enter" : ""}">
            ${fresh ? confettiHTML() : ""}
            <div class="${column("relative w-full flex-1 flex flex-col items-center px-6 text-center")}">
                <!-- R8 B13 (clarified by the reviewer): the badge IS this
                     roundel — the checkmark became a star, one size up
                     (w-20 / text-5xl); the colours stay green (success).
                     Centred, the layout unchanged. -->
                <div class="w-20 h-20 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center mt-10 md:mt-4">
                    <i class="ph-fill ph-star text-5xl"></i>
                </div>
                <h2 class="text-2xl md:text-5xl font-bold tracking-tight mt-3 mb-1">Lesson complete!</h2>
                <p class="text-gray-500 text-sm font-normal">Great job, ${esc(state.answers.name || "there")}. Your answers have been saved.</p>
                <!-- KPIs sit in flow (flex-1), centred in the space under the
                     title — pushed down with it, never overlapping. On
                     desktop the bottom padding biases the squares up, clear
                     of the floating bar's button. -->
                <div class="flex-1 w-full flex items-start md:items-center px-6 pt-8 pb-3 md:px-0 md:pt-2 md:pb-24">
                    <div class="flex flex-col gap-2 md:flex-row md:gap-4 md:justify-center w-full">
                        ${tile("Correct answers", rightFirstTry, "first try")}
                        ${tile("Incorrect answers", wrongs, wrongs === 1 ? "wrong try" : "wrong tries")}
                        ${tile("Speed", fmtTime(elapsed), `≈ ${perQ}s / question`)}
                    </div>
                </div>
            </div>
        </section>`;
}

/** Patch one question page in place — never touches scroll position. */
function refreshQuestionPage(lesson, qIndex) {
    const el = document.querySelector(`.lesson-q[data-question="${qIndex}"]`);
    if (el) {
        // R7-6: mute the entrance before swapping content — selections and
        // feedback updates never replay the stagger.
        el.classList.add("page-settled");
        el.innerHTML = questionInner(lesson, qIndex);
    }
}

/* ----------------------------- Video page (T3) -----------------------------
 * Mocked player (SPEC T3 / DR-T4): no media — play runs a 1× timer that
 * drives the scrub fill and the elapsed readout. Playback reaching the end
 * sets lessonVideoDone, which un-gates the bar's Continue; seeking to the
 * end counts (real-player behaviour). The timer patches the DOM directly
 * and self-stops when the page is gone — no cleanup wiring on view switches. */

/* Round 6e: videos are first-class lesson pages. The sequence interleaves
 * videos (data: videos: [{ before, duration }], "before question k") with
 * questions; the frontier is the first not-yet-passed page — a question is
 * passed when answered, a video when playback reached its end. The bar's
 * gated Continue advances from a video; question Continue as before. */

function videosOf(lesson) {
    return (lesson.videos || []).slice().sort((a, b) => a.before - b.before);
}

/* Session-shape guard: round 6e generalised lessonVideoDone from a boolean
 * (intro only) to { before: true }; older sessions migrate on read. */
function videoDoneMap(lesson) {
    let v = state.lessonVideoDone[lesson.id];
    if (v === true) v = state.lessonVideoDone[lesson.id] = { 0: true };
    return v || (state.lessonVideoDone[lesson.id] = {});
}

function lessonSequence(lesson) {
    const videos = videosOf(lesson);
    const seq = [];
    for (let k = 0; k < lesson.questions.length; k++) {
        for (const v of videos.filter((vv) => vv.before === k)) seq.push({ type: "video", video: v });
        seq.push({ type: "q", qIndex: k });
    }
    for (const v of videos.filter((vv) => vv.before >= lesson.questions.length)) seq.push({ type: "video", video: v });
    return seq;
}

function lessonFrontier(lesson) {
    const seq = lessonSequence(lesson);
    const answered = state.lessonAnswers[lesson.id] || [];
    const adv = state.videoAdvanced[lesson.id] || {};
    for (let i = 0; i < seq.length; i++) {
        const p = seq[i];
        // a video holds the frontier until its gate is open AND its Continue
        // was clicked — a ended-but-not-advanced video stays current
        if (p.type === "video" && !(videoEnded(lesson, p.video) && adv[p.video.before])) return { seq, frontier: i };
        if (p.type === "q" && !answered.includes(p.qIndex)) return { seq, frontier: i };
    }
    return { seq, frontier: seq.length };
}

function videoDuration(video) {
    const [m, sec] = video.duration.split(":").map(Number);
    return m * 60 + sec;
}

function fmtTime(sec) {
    return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
}

function videoStateOf(lesson, video) {
    const k = `${lesson.id}:${video.before}`;
    return state.videoPlayback[k] || (state.videoPlayback[k] = { elapsed: 0, playing: false });
}

function videoEnded(lesson, video) {
    return !!videoDoneMap(lesson)[video.before];
}

// Prototype speed-up (user review): playback sweeps the full displayed
// duration in one wall-clock second — the timer readout stays honest
// (the real name + duration), only the pace is compressed.
const VIDEO_PLAYBACK_S = 1000;

let videoTimer = null;
function stopVideoTimer() {
    if (videoTimer) { clearInterval(videoTimer); videoTimer = null; }
}

function startVideoTimer(lesson, video) {
    stopVideoTimer();
    const dur = videoDuration(video);
    const fillId = `video-fill-${video.before}`;
    videoTimer = setInterval(() => {
        if (!document.getElementById(fillId)) { stopVideoTimer(); return; } // page left
        const vs = videoStateOf(lesson, video);
        if (!vs.playing) return;
        vs.elapsed = Math.min(dur, vs.elapsed + dur / (VIDEO_PLAYBACK_S / 100));
        patchVideoScrub(lesson, video, dur);
        if (vs.elapsed >= dur) onVideoEnded(lesson, video);
    }, 100);
}

/* Patch only the moving parts of the player — fill, time, slider a11y. */
function patchVideoScrub(lesson, video, dur) {
    const vs = videoStateOf(lesson, video);
    const fill = document.getElementById(`video-fill-${video.before}`);
    const time = document.getElementById(`video-time-${video.before}`);
    const track = document.getElementById(`video-track-${video.before}`);
    if (fill) fill.style.width = `${Math.min(100, (vs.elapsed / dur) * 100)}%`;
    if (time) time.textContent = `${fmtTime(vs.elapsed)} / ${video.duration}`;
    if (track) track.setAttribute("aria-valuenow", String(Math.round(vs.elapsed)));
}

function refreshVideoPage(lesson, video) {
    const el = document.getElementById(`lesson-video-${video.before}`);
    if (el) el.outerHTML = videoPageHTML(lesson, video);
}

function onVideoEnded(lesson, video) {
    const vs = videoStateOf(lesson, video);
    vs.playing = false;
    stopVideoTimer();
    const first = !videoEnded(lesson, video);
    videoDoneMap(lesson)[video.before] = true;
    persistSession();
    refreshVideoPage(lesson, video);
    if (first) updateBar(lesson); // the gated Continue unlocks — no re-render
}

function videoToggle(lesson, video) {
    const dur = videoDuration(video);
    const vs = videoStateOf(lesson, video);
    if (vs.elapsed >= dur) { // ended → replay from the top
        vs.elapsed = 0;
        vs.playing = true;
    } else {
        vs.playing = !vs.playing;
    }
    if (vs.playing) startVideoTimer(lesson, video); else stopVideoTimer();
    refreshVideoPage(lesson, video);
}

function videoSeek(lesson, video, clientX) {
    const track = document.getElementById(`video-track-${video.before}`);
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const dur = videoDuration(video);
    const vs = videoStateOf(lesson, video);
    // Seeking into the last ~5% lands on the end (real-player behaviour,
    // forgiving the pixel-perfect click a gated demo would otherwise need).
    vs.elapsed = pct > 0.95 ? dur : Math.round(pct * dur);
    if (vs.elapsed >= dur) { onVideoEnded(lesson, video); return; }
    patchVideoScrub(lesson, video, dur);
}

/* R11-3 (DR-T22): the rail came off at user review (R11a) — videoLike and
 * its action branch left with it; videoStateOf carries no liked field. */

function videoPageHTML(lesson, video, fresh = false) {
    const dur = videoDuration(video);
    const vs = videoStateOf(lesson, video);
    const ended = videoEnded(lesson, video) && vs.elapsed >= dur;
    const pct = dur ? Math.min(100, (vs.elapsed / dur) * 100) : 0;
    const playIcon = vs.playing ? "ph-pause" : ended ? "ph-arrow-clockwise" : "ph-play";
    const playLabel = vs.playing ? "Pause" : ended ? "Replay" : "Play";
    // R7 follow-up 18: the transport bar exists only mid-playback (started,
    // not ended — playing or paused) and hides until the pointer (or focus)
    // is over the player. Fresh and ended states carry just the big
    // Play / Replay overlay button.
    const mid = !ended && (vs.playing || vs.elapsed > 0);
    const idSuffix = `-${video.before}`;
    // Poster overlay sits before the controls in the DOM, so the control bar
    // stays clickable while paused.
    const overlay = vs.playing ? "" : `
                <div class="absolute inset-0 flex items-center justify-center bg-gray-900/10">
                    <button type="button" data-action="video-toggle" data-video="${video.before}" aria-label="${playLabel} video"
                        class="w-16 h-16 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                        <i class="ph-fill ${playIcon} text-2xl"></i>
                    </button>
                </div>`;
    // Round 6c/6g: the video is the one page allowed out of the 512px column,
    // with breathing room below so the following question never crowds it.
    // Its only Continue is the bar's (DR-T11).
    return `
        <section id="lesson-video-${video.before}" class="lesson-page ${fresh ? "page-enter" : ""}">
            <div class="w-full pb-16 max-md:mt-2 md:my-auto">
                <!-- R13-12 (supersedes R13-8's 1024px, R12's 60%/960px cap):
                     md+ landscape 16:9 in the 960px breakout — the 60% floor
                     dropped, the cap binds first at 1440. R14: the breakout
                     drops to 768px (aspect-video keeps 16:9 — 768×432).
                     < md unchanged: R12's control-bar-aware height keeps
                     poster + controls clear of the chrome. -->
                <div class="w-full md:max-w-[768px] mx-auto">
                    <!-- R9-1: the eyebrow stays in the mobile text lane
                         (px-6) — only the PLAYER bleeds. -->
                    <div class="pb-3 px-6 md:px-0 text-sm font-medium text-gray-500">${esc(video.name || "Lesson video")} · ${video.duration}</div>
                    <div class="video-player ${mid ? "video-live" : ""} relative aspect-[9/16] md:aspect-video rounded-none md:rounded-2xl overflow-hidden bg-brand-100 select-none max-md:h-[calc(100vw*16/9-120px)] max-md:aspect-auto">
                    <!-- R7 follow-up 7: the same placeholder language as the
                         course-card media (owl logomark watermark); light
                         field per follow-up 8. -->
                    <img src="teachr-logo.svg" alt="" class="absolute inset-0 m-auto w-14 opacity-25">
                    <!-- R9 IMG: the video's poster frame sits over the
                         watermark, under the overlays/controls (loads, then
                         onerror hides it back to the placeholder). -->
                    ${video.poster ? `<img src="${video.poster}" alt="" class="absolute inset-0 h-full w-full object-cover" onerror="this.onerror=null;this.style.display='none'">` : ""}
                    ${overlay}
                    ${mid ? `
                    <div class="video-controls absolute bottom-0 inset-x-0 flex items-center gap-3 px-4 py-3 bg-gray-900/80 text-white">
                        <button type="button" data-action="video-toggle" data-video="${video.before}" title="${playLabel}"
                            aria-label="${playLabel}" aria-pressed="${vs.playing}"
                            class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                            <i class="ph-fill ${playIcon} text-lg"></i>
                        </button>
                        <div id="video-track-${video.before}" role="slider" tabindex="0" data-action="video-seek" data-video="${video.before}"
                            aria-label="Seek" aria-valuemin="0" aria-valuemax="${dur}" aria-valuenow="${Math.round(vs.elapsed)}"
                            class="relative flex-1 h-1.5 rounded-full bg-white/25 cursor-pointer">
                            <span id="video-fill-${video.before}" class="absolute left-0 top-0 h-full rounded-full bg-brand-400" style="width:${pct}%"></span>
                        </div>
                        <span id="video-time-${video.before}" class="text-xs tabular-nums shrink-0">${fmtTime(vs.elapsed)} / ${video.duration}</span>
                        <button type="button" title="Volume (demo)" aria-label="Volume (demo)" class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                            <i class="ph ph-speaker-high text-lg"></i>
                        </button>
                        <button type="button" title="Fullscreen (demo)" aria-label="Fullscreen (demo)" class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                            <i class="ph ph-corners-out text-lg"></i>
                        </button>
                    </div>` : ""}
                    <!-- R11-3 (DR-T22): the floating rail — REMOVED at user
                         review (the social buttons go); the vertical format
                         stays (DR-T22), the R11a note in SPEC §17 records it. -->
                </div>
            </div>
        </section>`;
}


/** Update the sticky bottom bar (feedback + action) for the active page.
 *  Round 6e: the active page comes from the lesson sequence (videos
 *  interleaved with questions). DR-T1: the bar is always visible in a
 *  lesson — on the completion page its action is "Back to lessons". */
function updateBar(lesson) {
    const bar = document.getElementById("lesson-bar");
    const feedbackEl = document.getElementById("lesson-feedback");
    const actionEl = document.getElementById("lesson-action");
    if (!bar || !feedbackEl || !actionEl) return;

    const { seq, frontier } = lessonFrontier(lesson);
    const cur = seq[frontier];
    const done = frontier >= seq.length; // every page passed
    const onVideo = cur && cur.type === "video";
    const qIndex = cur && cur.type === "q" ? cur.qIndex : 0;
    const fb = !done && !onVideo ? (state.lessonFeedback[lesson.id] || {})[qIndex] || {} : {};
    const q = !done && !onVideo ? lesson.questions[qIndex] : null;

    // Feedback strip — one rhythm value (py-3): 12px above AND below the
    // text (DR-T2); softness from borderless tints, never a hard border;
    // shadow-sm for a hint of elevation. The wrong strip shows only while
    // the error is fresh — staging a new answer clears it (round 6b #1).
    let feedback = "";
    if (!done && !onVideo && fb.status === "correct") {
        feedback = `<div class="feedback-pop w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-green-50 shadow-sm">
            <i class="ph-fill ph-check-circle text-xl text-green-600"></i>
            <p class="text-base font-bold text-green-700">Correct! Great job.</p>
        </div>`;
    } else if (!done && !onVideo && fb.status === "wrong" && fb.selected === undefined) {
        feedback = `<div class="feedback-pop w-full flex flex-col items-center justify-center gap-0.5 px-5 py-3 rounded-2xl bg-red-50 shadow-sm">
            <p class="flex items-center gap-2 text-base font-bold text-red-600"><i class="ph-fill ph-x-circle text-lg"></i>Not quite. Try again!</p>
            <p class="text-sm font-normal text-red-600">Pick another answer to try again.</p>
        </div>`;
    } else if (!done && !onVideo && fb.status === "revealed") {
        // Round 6h (DR-T16): the info bubble is back — 6d folding it into the
        // button was wrong. The button stays teal in every state.
        feedback = `<div class="feedback-pop w-full flex flex-col items-center justify-center gap-0.5 px-5 py-3 rounded-2xl bg-blue-50 shadow-sm">
            <p class="flex items-center gap-2 text-base font-bold text-blue-700"><i class="ph-fill ph-lightbulb text-lg text-blue-600"></i>Right answer:</p>
            <p class="text-sm font-normal text-gray-600">${esc(q.options[q.correct].label)}</p>
        </div>`;
    }

    // Action button — always present during a question (DR-T1); teal always.
    // R7 follow-up 17: while the user has scrolled up away from the latest
    // content, the big button becomes "Scroll down" — as a ghost button
    // (the DS ghost variant, built by the shared scrollDownBtnHTML) — one
    // click returns to the current page, and only that state turns it
    // (clicking Continue lands at the bottom and leaves the button as
    // Continue/Submit). The edge arrows ride the ghost in the ink colour.
    let action = "";
    if (state.lessonScrolledUp) {
        action = scrollDownBtnHTML();
    } else if (onVideo) {
        action = continueBtn("lesson-video-continue", "Continue",
            videoEnded(lesson, cur.video) ? `data-before="${cur.video.before}"`
                : `disabled data-before="${cur.video.before}" title="Watch the video to continue"`); // gate = reached the end
    } else if (done) {
        action = continueBtn("lesson-finish", "Back to lessons"); // DR-T11: regular button position
    } else if (fb.status === "correct" || fb.status === "revealed") {
        action = continueBtn("lesson-continue", qIndex + 1 < lesson.questions.length ? "Continue" : "Finish lesson", `data-question="${qIndex}"`);
    } else {
        const has = fb.selected !== undefined;
        action = `<button type="button" data-action="lesson-submit" data-question="${qIndex}" ${has ? "" : "disabled"}
            class="w-full bg-brand-700 hover:bg-brand-800 text-white font-bold py-4 px-6 rounded-full text-lg transition-colors disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:bg-gray-200 disabled:cursor-not-allowed">
            Submit answer
        </button>`;
    }

    feedbackEl.innerHTML = feedback;
    actionEl.innerHTML = action;
    // Round 6f: the bar floats over the scroll content — it takes no layout
    // space, so feedback can never shift content (DR-T15 retires the
    // reservation entirely).
    bar.classList.remove("hidden"); // DR-T11: the bar never hides in a lesson
}

function updateProgress(lesson) {
    // R8 B11 follower amendment: the bars are owned by updateScrollProgress
    // (the trailing bar follows the scroll's high-water, not the answered
    // count). This keeps only the question counter.
    const list = state.lessonAnswers[lesson.id] || [];
    const total = lesson.questions.length;
    const counter = document.getElementById("lesson-counter");
    if (counter) counter.textContent = `${list.length} of ${total} questions`;
}

/* After the current page settles (a question answered / a video watched),
 * reveal the sequence's next page — plus the completion page once everything
 * has passed. Returns the revealed page so callers can scroll to it. */
function revealNextPages(lesson) {
    const { seq, frontier } = lessonFrontier(lesson);
    const pagesEl = document.getElementById("lesson-pages");
    if (frontier < seq.length) {
        const cur = seq[frontier];
        if (cur.type === "video") {
            if (!document.getElementById(`lesson-video-${cur.video.before}`)) {
                pagesEl.insertAdjacentHTML("beforeend", videoPageHTML(lesson, cur.video, true));
            }
            return { type: "video", cur };
        }
        if (!document.querySelector(`.lesson-q[data-question="${cur.qIndex}"]`)) {
            pagesEl.insertAdjacentHTML("beforeend", questionPageHTML(lesson, cur.qIndex, true));
        }
        return { type: "q", cur };
    }
    if (!document.getElementById("lesson-complete")) {
        pagesEl.insertAdjacentHTML("beforeend", completionPageHTML(lesson, true));
    }
    return { type: "done" };
}

/* Full render — only when the lesson view is (re)entered. */
function renderLesson() {
    const lesson = LESSONS.find((l) => l.id === state.currentLesson);
    const completedList = state.lessonAnswers[lesson.id] || [];
    const total = lesson.questions.length;
    // C7: the Speed tile's clock starts on first entry of this lesson.
    if (!state.lessonStart[lesson.id]) {
        state.lessonStart[lesson.id] = Date.now();
        persistSession();
    }

    // Round 6e: render every page up to the frontier — passed pages stay for
    // review, the frontier page is current. The completion page renders only
    // once the whole sequence has passed.
    const { seq, frontier } = lessonFrontier(lesson);
    const pages = seq.slice(0, frontier + 1).map((p) =>
        p.type === "video" ? videoPageHTML(lesson, p.video) : questionPageHTML(lesson, p.qIndex)
    ).join("") + (frontier >= seq.length ? completionPageHTML(lesson) : "");

    // R8 B4: the header's tie to the bar pulls in by one -8px margin (the
    // reviewed "a bit less of a space, like -8px") — on the wrapper, so bar
    // + counter ride as one block; the counter's 4px pad keeps its own tie
    // to the track and the sticky pin rides the wrapper as before.
    app().innerHTML = `
        ${viewHeader("lesson-back", `${lesson.title} — ${lesson.subtitle}`,
            { hideLogo: true, backLabel: "Back to course page" })}
        <div class="shrink-0 mt-0 md:-mt-2 relative">
            <div class="${column("px-6 pt-1 pb-8 md:pb-2")}">
                <!-- R8 B11: the faded teal holds the answered progress; the
                     saturated leading segment rides the scroll — a reading
                     bar to where the user has travelled. -->
                <div class="relative w-full bg-gray-200 h-2 rounded-full">
                    <div id="progress-bar" class="absolute left-0 top-0 bg-brand-300 h-2 rounded-full transition-[width] duration-300"
                        style="width:0%"></div>
                    <div id="scroll-bar" class="absolute left-0 top-0 bg-brand-600 h-2 rounded-full transition-[width] duration-300"
                        style="width:0%"></div>
                </div>
                <div id="lesson-counter" class="text-center text-sm font-normal text-gray-900 pt-1">
                    ${completedList.length} of ${total} questions
                </div>
            </div>
            <!-- R9: the fuzzy paper dissolve under the progress container,
                 hanging over the scroller's top. -->
            <div class="progress-fade pointer-events-none absolute inset-x-0 top-full h-4 md:h-8 z-10" aria-hidden="true"></div>
        </div>
        ${scrollShell("lesson-scroll", `
            <div id="lesson-pages" class="w-full">${pages}</div>
        `)}
        <!-- R13-7: the bottom scroll fade is gone — with the wave field living
             in the ground, the fade's flat bottom stop no longer matched the
             local ground; content scrolls under the bar unfaded. -->
        <div id="lesson-bar" class="hidden absolute inset-x-0 bottom-0 z-20">
            <div class="relative">
                <div id="lesson-feedback" class="${column("px-6 pt-2 pb-2 text-center")}"></div>
                <!-- R9-2 amended: at mobile the pr reserves the FAB's lane
                     (24 edge + 48 FAB) + the 8px gap; md restores px-6. -->
                <div id="lesson-action" class="${column("pl-6 pr-[80px] md:px-6 pt-2 pb-5 md:pb-3")}"></div>
            </div>
        </div>
        ${supportFABHTML()}
    `;

    updateBar(lesson);
    measureSlideH();
    updateCurrentPageVisibility();
    updateBarButtonMode();

    // Delegated change handling — appended pages need no re-binding.
    document.getElementById("lesson-scroll").addEventListener("change", (e) => {
        if (e.target.matches("input[type='radio']")) {
            onLessonSelect(lesson, Number(e.target.dataset.question), Number(e.target.dataset.option));
        }
    });
}

/* R7 follow-up 5: the page under the viewport renders fully visible
 * (content-visibility) so its sticky answer row can pin; the rest keep the
 * off-screen skip. Called on scroll (passive, rAF-batched) and on changes. */
function updateCurrentPageVisibility() {
    const scroller = document.getElementById("lesson-scroll");
    if (!scroller) return;
    const pages = document.querySelectorAll("#lesson-pages .lesson-page");
    if (!pages.length) return;
    const raf = updateCurrentPageVisibility._raf;
    if (raf) cancelAnimationFrame(raf);
    updateCurrentPageVisibility._raf = requestAnimationFrame(() => {
        updateCurrentPageVisibility._raf = null;
        const scTop = scroller.getBoundingClientRect().top;
        pages.forEach((pg) => {
            const r = pg.getBoundingClientRect();
            pg.classList.toggle("cv-on", r.top <= scTop + 1 && r.bottom > scTop + 1);
        });
    });
}

/* --------------------------- Lesson interactions --------------------------- */

/** Selecting an option only stages the choice — feedback waits for Submit. */
function onLessonSelect(lesson, qIndex, optIndex) {
    const fbs = state.lessonFeedback[lesson.id] = state.lessonFeedback[lesson.id] || {};
    const fb = fbs[qIndex] = fbs[qIndex] || { wrong: 0, wrongPicks: [] };
    fb.selected = optIndex;
    refreshQuestionPage(lesson, qIndex);
    updateBar(lesson);
}

function onLessonSubmit(qIndex) {
    const lesson = LESSONS.find((l) => l.id === state.currentLesson);
    const q = lesson.questions[qIndex];
    const fbs = state.lessonFeedback[lesson.id] = state.lessonFeedback[lesson.id] || {};
    const fb = fbs[qIndex] = fbs[qIndex] || { wrong: 0, wrongPicks: [] };
    if (fb.selected === undefined) return;

    if (fb.selected === q.correct) {
        fb.status = "correct";
    } else {
        fb.wrongPicks.push(fb.selected);
        fb.wrong++;
        fb.status = fb.wrong >= 2 ? "revealed" : "wrong";
        fb.selected = undefined; // must pick (a different) answer before resubmitting
    }
    persistSession();
    refreshQuestionPage(lesson, qIndex); // mark picked / right options in place
    updateBar(lesson);                   // feedback + Continue (or nothing)
    // Round 6c #6: content never shifts for feedback — the bar reserves its
    // height for the whole lesson, so no scroll compensation here.
}

function onLessonContinue(qIndex) {
    const lesson = LESSONS.find((l) => l.id === state.currentLesson);
    const list = state.lessonAnswers[lesson.id] || [];
    if (!list.includes(qIndex)) list.push(qIndex);
    state.lessonAnswers[lesson.id] = list;
    persistSession();

    refreshQuestionPage(lesson, qIndex); // completed state (green, disabled)
    updateProgress(lesson);

    // Round 6e: the next page in the sequence — a question, a video, or the
    // completion page. Measure between the reveal and the flight: scrolling
    // to a stale page height let the snap drag the view back (round 6b #7).
    const nxt = revealNextPages(lesson);
    updateBar(lesson); // the bar re-targets whatever became current
    measureSlideH();
    const target = nxt.type === "video" ? document.getElementById(`lesson-video-${nxt.cur.video.before}`)
        : nxt.type === "q" ? document.querySelector(`.lesson-q[data-question="${nxt.cur.qIndex}"]`)
        : document.getElementById("lesson-complete");
    showPage(target, true); // smooth flight everywhere; 6b #7 holds
}

/* --------------------------- Lesson scroll utils --------------------------- */

let slideH = null;
let libraryLaneScroll = null; // R8 B6: the courses lane's scroll across the lesson round-trip
/** Stable page height. T2: the bottom bar is a permanent resident during
 *  questions (DR-T1) — it no longer appears/disappears mid-scroll, so the
 *  old measure-only-while-hidden guard is gone; the height is stable and
 *  measured on every call. */
function measureSlideH() {
    const scroller = document.getElementById("lesson-scroll");
    if (!scroller) return;
    slideH = scroller.clientHeight;
    scroller.style.setProperty("--slide-h", slideH + "px");
}

/** Scroll the lesson list to an exact offset. Snap is disabled for the
 *  duration of a smooth flight; the scrollend listener is attached on a
 *  later task so the scrollend of a preceding instant jump cannot re-enable
 *  snap mid-flight (that was the "snaps back to the previous answer" bug).
 *  A timeout acts as a fallback where scrollend is unsupported. */
function scrollToY(top, smooth = false) {
    const scroller = document.getElementById("lesson-scroll");
    if (!scroller) return;
    if (!smooth || typeof scroller.scrollTo !== "function") {
        scroller.scrollTop = top;
        return;
    }
    // R7 follow-up 13: during a smooth flight the scroll passes earlier
    // pages — the bar's scroll-down transform must not flicker mid-ride.
    lessonFlight = true;
    scroller.style.scrollSnapType = "none";
    scroller.scrollTo({ top, behavior: "smooth" });
    const reenable = () => {
        scroller.style.scrollSnapType = "";
        lessonFlight = false;
        updateBarButtonMode();
    };
    setTimeout(() => {
        if ("onscrollend" in scroller) scroller.addEventListener("scrollend", reenable, { once: true });
    }, 50);
    setTimeout(reenable, 900);
}

/** Smoothly align a question page with the top of the list. */
function showPage(target, smooth = false) {
    const scroller = document.getElementById("lesson-scroll");
    if (!scroller || !target) return;
    const top = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
    scrollToY(top, smooth);
}

let resizeBound = false;
let lessonFlight = false; // a smooth lesson flight is in progress — the bar mode holds

/** Re-measure page height on window resize (bound once at boot — a no-op
 * when the lesson view isn't rendered). The capture-phase scroll listener
 * drives the per-page content-visibility swap (sticky support) and the
 * bar's scroll-down mode. */
function bindLessonResize() {
    if (resizeBound) return;
    resizeBound = true;
    window.addEventListener("resize", measureSlideH);
    document.addEventListener("scroll", (e) => {
        updateCurrentPageVisibility();
        updateBarButtonMode();
        updateScrollProgress();
    }, { passive: true, capture: true });
    // Scroll snap was removed (the momentum overshoot + proximity correction
    // read as a spring); the stops return as this gentle settle: after a
    // fling ends near a page top, one slow glide finishes the alignment.
    document.addEventListener("scrollend", (e) => {
        if (e.target && e.target.id === "lesson-scroll") settleLessonScroll();
    }, { passive: true, capture: true });
}

/* Magnetic settle onto the nearest page top, only when the scroll already
 * ended within a third of a slide of it — small, slow, and it never fires
 * mid-flight (lessonFlight guards the reveal glides). */
const SETTLE_FRACTION = 1 / 3;
function settleLessonScroll() {
    const sc = document.getElementById("lesson-scroll");
    if (!sc || lessonFlight || !slideH) return;
    const pages = document.querySelectorAll("#lesson-pages .lesson-page");
    if (!pages.length) return;
    const scTop = sc.getBoundingClientRect().top;
    let best = null;
    for (const p of pages) {
        const top = p.getBoundingClientRect().top - scTop + sc.scrollTop;
        const d = Math.abs(top - sc.scrollTop);
        if (d > 2 && d <= slideH * SETTLE_FRACTION && (best === null || d < best.d)) best = { top, d };
    }
    if (best) scrollToY(best.top, true);
}

/* R8 B11: the saturated leading segment rides the scroll. Revised twice
 * (user review): (1) full progress is the lesson's latest-most step only —
 * while the completion page doesn't exist, the denominator spans the whole
 * lesson (every step at its slide height), so an interim latest page no
 * longer pins 100%; (2) the faded bar no longer tracks the answered count —
 * it FOLLOWS the main bar: same scroll, same denominator, and it holds the
 * high-water mark when the scroll recedes. Equal at every rest stop, never
 * ahead. (The previous answered-count model jumped the trailing bar ahead of
 * the main on every commit and never landed on the same value — 22 vs 25.) */
let scrollHighWater = 0; // px — the furthest the lesson scroller has reached
let scrollHighWaterScroller = null;

function updateScrollProgress() {
    const sc = document.getElementById("lesson-scroll");
    const bar = document.getElementById("scroll-bar");
    const light = document.getElementById("progress-bar");
    if (!sc || !bar || !light) return;
    if (scrollHighWaterScroller !== sc) { // a fresh lesson view resets the ride
        scrollHighWaterScroller = sc;
        scrollHighWater = 0;
    }
    const max = Math.max(0, sc.scrollHeight - sc.clientHeight);
    // clamp to the live max first — content (and so scrollHeight) shrinks
    // when long pages settle (cv-on), and a stale high-water must not pin 100.
    scrollHighWater = Math.max(sc.scrollTop, Math.min(scrollHighWater, max));
    let denom = max;
    const lesson = LESSONS.find((l) => l.id === state.currentLesson);
    if (lesson && !document.getElementById("lesson-complete")) {
        const total = lessonSequence(lesson).length + 1; // + the completion page
        denom = Math.max(max, total * slideH - sc.clientHeight);
    }
    const satPct = denom > 0 ? Math.min(100, Math.round((sc.scrollTop / denom) * 100)) : 0;
    const lightPct = denom > 0 ? Math.min(100, Math.round((scrollHighWater / denom) * 100)) : 0;
    bar.style.width = `${satPct}%`;
    light.style.width = `${lightPct}%`;
}

/* --------------- Support FAB + leave-lesson dialog (Round 7d) --------------
 * DR-T19, amended by the R7 follow-up: the logomark is the support entry in
 * EVERY view it renders (lesson, library) — one fixed corner position,
 * bottom 24 / right 24, matching the shell's margin rhythm. No action row
 * alignment: the bar's 512px column never reaches the FAB's lane.
 * DR-T20: leaving is confirmed; the copy leads with the save. */

const SUPPORT_CANNED = {
    "How do answers work?": "Pick an option and press Submit. Two misses reveal the right answer with a short explanation — nothing is lost, your progress saves as you go.",
    "Progress & saving": "Everything saves automatically after each answer. Leaving mid-lesson keeps your place, and the bar above the lessons shows your overall progress.",
    "Something's broken": "Sorry about that — try reloading the page first. If it keeps happening, write to support@teachr.example and we'll sort it quickly.",
};
const SUPPORT_FALLBACK = "Thanks! A tutor will follow up by email. Meanwhile, the quick topics above cover most questions.";

const FAB_REST = "fixed bottom-[18px] right-6";
const PANEL_REST = "fixed bottom-[4.875rem] right-6";

function supportFABOnlyHTML() {
    // R7 follow-up 13: the FAB is always the Get-help entry (the scroll-down
    // transform moved to the lesson bar's big button).
    // R9-2 amended (user review): the FAB keeps its rest corner on mobile
    // too — IN LINE with the action button (the two are vertically centred
    // by their shared geometry); the button shrinks to leave the 8px gap
    // (the lesson-action column's pr-[80px] at mobile). No overlap, no lift.
    return `
    <button type="button" id="support-fab" data-action="support-toggle" aria-label="Get help" aria-expanded="${state.supportOpen}"
        class="support-fab fixed ${state.view === "lesson" ? "bottom-[26px] md:bottom-[18px]" : "bottom-[18px]"} right-6 z-40 h-12 w-12 rounded-full bg-white border border-gray-200 shadow-lg
               flex items-center justify-center hover:border-brand-500 transition-colors">
        <img src="teachr-logo.svg" alt="" class="w-8 h-8">
    </button>`;
}

function supportFABHTML() {
    return `${supportFABOnlyHTML()}${state.supportOpen ? supportPanelHTML() : ""}`;
}

function supportPanelInnerHTML() {
    // R7-12 follow-up: bubbles have chat-room height — about twice the old
    // pill: roomy padding, Relaexed leading, one 72px floor per bubble.
    const bubbles = state.supportThread.map((m) => m.role === "user"
        ? `<div class="flex justify-end"><div class="support-bubble min-h-[4.5rem] max-w-[85%] bg-brand-700 text-white text-sm font-medium rounded-2xl rounded-br-sm px-4 py-3.5 leading-relaxed flex items-center">${esc(m.text)}</div></div>`
        : `<div class="flex justify-start"><div class="support-bubble min-h-[4.5rem] max-w-[85%] bg-gray-100 text-gray-900 text-sm rounded-2xl rounded-bl-sm px-4 py-3.5 leading-relaxed flex items-center">${esc(m.text)}</div></div>`
    ).join("");
    const asked = state.supportThread.filter((m) => m.role === "user").map((m) => m.text);
    const chips = Object.keys(SUPPORT_CANNED).filter((q) => !asked.includes(q));
    return `
        <div class="flex items-center justify-between px-4 py-3 bg-brand-700 text-white">
            <span class="flex items-center gap-2 font-bold text-sm"><i class="ph-fill ph-lifebuoy text-lg"></i>Need a hand?</span>
            <button type="button" data-action="support-toggle" aria-label="Close support"
                class="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <i class="ph ph-x text-lg"></i>
            </button>
        </div>
        <div id="support-thread" class="flex flex-col gap-2 px-4 py-3 max-h-64 overflow-y-auto">
            ${bubbles || `<p class="text-sm font-normal text-gray-500">Ask anything about this course — or pick a question below.</p>`}
        </div>
        ${chips.length ? `<div class="flex flex-wrap gap-2 px-4 pb-2">
            ${chips.map((q) => `<button type="button" data-action="support-ask" data-q="${esc(q)}"
                class="text-xs font-medium text-gray-600 border border-gray-200 rounded-full px-3 py-1.5 hover:border-brand-500 hover:text-brand-700 transition-colors">${esc(q)}</button>`).join("")}
        </div>` : ""}
        <div class="flex items-center gap-2 border-t border-gray-200 px-4 py-3">
            <input id="support-input" type="text" placeholder="Type your question…"
                class="flex-1 bg-transparent focus:outline-none text-sm placeholder:text-gray-400">
            <button type="button" data-action="support-send" aria-label="Send"
                class="w-8 h-8 rounded-full bg-brand-700 hover:bg-brand-800 text-white flex items-center justify-center transition-colors">
                <i class="ph ph-paper-plane-right text-sm"></i>
            </button>
        </div>`;
}

function supportPanelHTML() {
    // The panel's content lives in supportPanelInnerHTML (shared with the
    // DS sample, workstream R7-14). Fixed corner geometry: 12px above the
    // FAB's top (FAB = 48px at an 18px bottom, centre-aligned with the
    // lesson bar's Continue) — same in every view.
    return `
    <div id="support-panel" role="dialog" aria-modal="false" aria-label="Support"
        class="support-panel ${PANEL_REST} z-40 w-80 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">
        ${supportPanelInnerHTML()}
    </div>`;
}


function supportReply(question) {
    return SUPPORT_CANNED[question] || SUPPORT_FALLBACK;
}

/* R7 follow-up 17: scrolled up away from the latest content (more than
 * 150px), the big button in the floating bar becomes the ghost "Scroll down"
 * — one click rides back; it never turns on its own (Clicking Continue lands
 * at the bottom and leaves it be; the flight is exempt so the label
 * doesn't flicker mid-ride). */
function updateBarButtonMode() {
    if (lessonFlight) return;
    const sc = document.getElementById("lesson-scroll");
    if (!sc || state.view !== "lesson") return;
    const fromBottom = sc.scrollHeight - sc.scrollTop - sc.clientHeight;
    const scrolledUp = fromBottom > 150;
    if (scrolledUp !== state.lessonScrolledUp) {
        state.lessonScrolledUp = scrolledUp;
        const lesson = LESSONS.find((l) => l.id === state.currentLesson);
        if (lesson) updateBar(lesson);
    }
}

function toggleSupport(open = !state.supportOpen) {
    state.supportOpen = open;
    const fab = document.getElementById("support-fab");
    if (!fab) return;
    fab.setAttribute("aria-expanded", String(open));
    const existing = document.getElementById("support-panel");
    if (open && !existing) {
        fab.insertAdjacentHTML("afterend", supportPanelHTML());
        document.getElementById("support-input")?.focus();
    } else if (!open && existing) {
        existing.remove();
    }
}

function supportAsk(question) {
    state.supportThread.push({ role: "user", text: question });
    state.supportThread.push({ role: "assistant", text: supportReply(question) });
    // Re-render the panel in place (keeps focus in the input).
    const panel = document.getElementById("support-panel");
    if (panel) {
        panel.outerHTML = supportPanelHTML();
        const thread = document.getElementById("support-thread");
        if (thread) thread.scrollTop = thread.scrollHeight;
        document.getElementById("support-input")?.focus();
    }
}

function lessonExitCardHTML() {
    // R8 B7/B8: the pair renders through the DS builders — Keep learning =
    // the primary, Leave lesson = the text variant at the primary's full
    // height (the reviewer's unification); the ✕ is the keyboard-reachable
    // close beside the backdrop (the same cancel action).
    return `
        <div class="dialog-card relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 text-center"
            role="alertdialog" aria-modal="true" aria-labelledby="exit-title" aria-describedby="exit-desc">
            <button type="button" data-action="lesson-exit-cancel" aria-label="Close"
                class="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                <i class="ph ph-x text-lg"></i>
            </button>
            <div class="w-12 h-12 mx-auto rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
                <i class="ph ph-floppy-disk text-2xl"></i>
            </div>
            <h2 id="exit-title" class="text-lg font-bold tracking-tight pt-3">Leave this lesson?</h2>
            <p id="exit-desc" class="text-sm font-normal text-gray-500 pt-1">Your progress is saved — you can pick up where you left off.</p>
            <div class="pt-5 space-y-1">
                ${uiBtn("Keep learning", "lesson-exit-cancel")}
                ${uiBtn("Leave lesson", "lesson-exit-confirm", "text")}
            </div>
        </div>`;
}

function lessonExitDialogHTML() {
    return `
    <div id="lesson-exit-dialog" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="dialog-backdrop absolute inset-0 bg-gray-900/30" data-action="lesson-exit-cancel"></div>
        ${lessonExitCardHTML()}
    </div>`;
}

function openLessonExit() {
    if (state.lessonExitAsk) return;
    state.lessonExitAsk = true;
    app().insertAdjacentHTML("beforeend", lessonExitDialogHTML());
    // Button-scoped: the backdrop shares the cancel action but can't focus.
    document.querySelector('#lesson-exit-dialog button[data-action="lesson-exit-cancel"]')?.focus();
}

function closeLessonExit(leave) {
    if (!state.lessonExitAsk) return;
    state.lessonExitAsk = false;
    document.getElementById("lesson-exit-dialog")?.remove();
    if (leave) {
        state.view = "library";
        render();
    } else {
        document.querySelector('[data-action="lesson-back"]')?.focus();
    }
}

/* Focus trap + Escape for the open dialog (R7-8/DR-T20). */
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.supportOpen) { toggleSupport(false); return; }
    if (e.key === "Enter" && document.activeElement === document.getElementById("support-input")) {
        const text = document.getElementById("support-input").value.trim();
        if (text) supportAsk(text);
        return;
    }
    if (!state.lessonExitAsk) return;
    if (e.key === "Escape") { closeLessonExit(false); return; }
    if (e.key !== "Tab") return;
    const focusables = document.querySelectorAll("#lesson-exit-dialog button");
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
});

/* T4: the account menu lives in two hosts — the dashboard's profile row and
 * the shared header button (every view). One patch for both, so the menu
 * opens/closes on training views too without rebuilding the shell. */
function patchUserMenuHost() {
    const root = document.querySelector(".user-menu-root");
    if (!root) return;
    root.outerHTML = root.classList.contains("dash-user-row") ? dashUserRowHTML() : userMenuBtn();
}

/* ------------------------------- Dashboard view ---------------------------- *
 * Base supervisor dashboard: sidebar navigation plus a demographics overview
 * with placeholder charts. Reached from the lessons page; "Training" in the
 * sidebar returns there.                                                    */

/* Collapsible, insight-first, AI-native dashboard panel (plan §4.1): the
 * header leads with the takeaway line and carries the panel's collapse
 * chevron plus an "ask about this" affordance; the chart body supports the
 * takeaway. Collapse is an instant hide + chevron turn — no height
 * animation, the chart inside would relayout per frame (principle 6); the
 * body fades in when re-opened. */
/* J5: diagram panels are containers, not cards — no collapse/expand or
 * panel-ask actions (removed with SPEC J5), no border/background; the
 * light gradient ground comes from .diagram-card (chat-bubble family). */
function dashPanel(id, title, takeaway, body) {
    return `
    <section class="dash-panel diagram-card" data-panel="${id}">
        <div class="px-4 pt-3">
            <span class="block text-xs font-semibold text-gray-600">${esc(title)}</span>
            <span class="dash-panel-takeaway block pt-1 text-sm font-bold tracking-tight text-gray-900 truncate">${esc(takeaway)}</span>
        </div>
        <div class="dash-panel-body px-3 pb-3 pt-1">${body}</div>
    </section>`;
}

// Shared by every dash-collapse-label consumer (sidebar, user row).
const labelCls = `dash-collapse-label min-w-0 overflow-hidden whitespace-nowrap`;

function dashSidebarHTML() {
    const collapsed = state.dashCollapsed;
    /* Labels stay in the DOM and fade as the aside width animates, so the
     * collapse runs as a live CSS width transition — no re-render jump. */
    return `
    <div id="dash-sidebar-slot" class="relative hidden md:block py-2 pl-2 pr-2 shrink-0 h-full">
        <aside class="w-52 ${collapsed ? "dash-nav-collapsed" : ""} h-full flex flex-col p-2 transition-[width] duration-200 ease-out">
            <!-- Logo row: while collapsed, the expand toggle appears here on
                 hover, in the logomark's place. -->
            <div class="dash-nav-top relative h-10 flex items-center ml-[0.45rem] shrink-0">
                <!-- Collapsed rail: the logomark IS the expand control (visible,
                     so Tab reaches it — Chromium excludes opacity-0 buttons from
                     sequential focus); the caret toggle handles the hover swap
                     for mouse users and only acts when collapsed. -->
                <button type="button" data-action="dash-logo" title="${collapsed ? "Expand" : "Teachr"}"
                    aria-label="${collapsed ? "Expand navigation" : "Teachr"}"
                    class="dash-logo-btn h-8 w-8 flex items-center justify-center shrink-0">
                    <img src="teachr-logo.svg" alt="Teachr logo" class="dash-logo-mark h-8 w-8">
                </button>
                <span class="dash-collapse-label dash-logo-wordmark text-lg font-black tracking-tight text-brand-600 ml-2">Teachr</span>
                <button type="button" data-action="dash-collapse" title="${collapsed ? "Expand" : "Collapse"}"
                    aria-label="${collapsed ? "Expand" : "Collapse"} navigation"
                    class="dash-collapse-toggle absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                    <i class="ph-bold ph-caret-double-${collapsed ? "right" : "left"} text-sm"></i>
                </button>
            </div>
            <nav class="flex-1 space-y-1 pt-2">
                ${DASH_SECTIONS.map((s) => `
                    <button type="button" data-action="dash-nav" data-section="${s.id}" title="${esc(s.label)}"
                        class="dash-nav-item w-full h-10 flex items-center gap-2 px-3 rounded-xl text-[13px] transition-colors
                               ${state.dashSection === s.id
                                   ? "bg-gray-100 text-gray-900 font-semibold"
                                   : "text-gray-600 hover:bg-gray-50 hover:text-gray-700 font-normal"}">
                        <i class="ph ${s.icon} text-lg shrink-0"></i>
                        <span class="${labelCls} flex-1 flex items-center">
                            <span class="truncate text-left">${esc(s.label)}</span>
                            ${s.id !== "assistant" ? `<i class="ph ph-caret-right text-xs text-gray-300 shrink-0 ml-auto pl-1"></i>` : ""}
                        </span>
                    </button>`).join("")}
            </nav>
            <button type="button" data-action="start-training" title="Start training"
                class="dash-nav-cta w-full h-10 flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold rounded-full transition-colors mt-2">
                <i class="ph ph-graduation-cap text-lg shrink-0"></i>
                <span class="${labelCls}">Start training</span>
            </button>
            ${dashUserRowHTML()}
        </aside>
    </div>`;
}

/** Mobile (<md) nav drawer — the sidebar equivalent for narrow viewports,
 * where the desktop slot is hidden. Overlay + left sheet, same nav items as
 * the rail; opened/closed by patching its own node so chart roots persist. */
function mobileNavHTML() {
    return `
    <div id="mobile-nav" class="md:hidden fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Navigation">
        <div class="absolute inset-0 bg-gray-900/40" data-action="mobile-nav-close"></div>
        <aside class="absolute left-0 top-0 h-full w-64 bg-white shadow-xl p-2 flex flex-col">
            <div class="relative h-10 flex items-center justify-between shrink-0 px-1">
                <span class="dash-logo-wordmark text-lg font-black tracking-tight text-brand-600">Teachr</span>
                <button type="button" data-action="mobile-nav-close" title="Close" aria-label="Close navigation"
                    class="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                    <i class="ph ph-x text-lg"></i>
                </button>
            </div>
            <nav class="flex-1 space-y-1 pt-2">
                ${DASH_SECTIONS.map((s) => `
                    <button type="button" data-action="dash-nav" data-section="${s.id}"
                        class="dash-nav-item w-full h-10 flex items-center gap-2 px-3 rounded-xl text-[13px] transition-colors
                               ${state.dashSection === s.id
                                   ? "bg-gray-100 text-gray-900 font-semibold"
                                   : "text-gray-600 hover:bg-gray-50 hover:text-gray-700 font-normal"}">
                        <i class="ph ${s.icon} text-lg shrink-0"></i>
                        <span class="flex-1 flex items-center">
                            <span class="truncate text-left">${esc(s.label)}</span>
                            ${s.id !== "assistant" ? `<i class="ph ph-caret-right text-xs text-gray-300 shrink-0 ml-auto pl-1"></i>` : ""}
                        </span>
                    </button>`).join("")}
            </nav>
            <button type="button" data-action="start-training" title="Start training"
                class="w-full h-10 flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold rounded-full transition-colors mt-2">
                <i class="ph ph-graduation-cap text-lg shrink-0"></i>
                <span>Start training</span>
            </button>
            ${dashUserRowHTML()}
        </aside>
    </div>`;
}

/** Open/close the mobile nav drawer by patching its own node. */
function setMobileNav(open) {
    state.mobileNav = open;
    const existing = document.getElementById("mobile-nav");
    if (!open) {
        if (existing) existing.remove();
    } else if (!existing) {
        app().insertAdjacentHTML("beforeend", mobileNavHTML());
    }
    for (const btn of document.querySelectorAll('[data-action="dash-mobile-nav"]'))
        btn.setAttribute("aria-expanded", String(open));
}

/** Profile row — patched in place on menu toggle; never re-renders the shell. */
function dashUserRowHTML() {
    const name = esc(state.answers.name || "Pedro");
    return `
            <div class="dash-user-row user-menu-root relative pt-2 flex">
                <button type="button" data-action="toggle-user-menu" title="${name}" aria-label="Account menu"
                    aria-expanded="${state.menuOpen}" aria-haspopup="menu"
                    class="dash-user-btn w-full h-10 px-3 rounded-full flex items-center gap-2 border border-gray-200 bg-transparent text-gray-700 hover:bg-gray-50 transition-colors">
                    <span class="w-7 h-7 rounded-full text-gray-900 flex items-center justify-center text-xs font-bold shrink-0">
                        <i class="ph-fill ph-user"></i>
                    </span>
                    <span class="${labelCls} pr-2 text-sm font-medium">${name}</span>
                </button>
                ${state.menuOpen ? `
                <div class="dash-user-menu absolute right-0 bottom-full w-44 rounded-xl border border-gray-200 bg-white shadow-lg py-2">
                    <button type="button" data-action="profile-open"
                        class="w-full h-10 flex items-center gap-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
                        <i class="ph ph-identification-card text-lg"></i>My details
                    </button>
                    <button type="button" data-action="settings-open"
                        class="w-full h-10 flex items-center gap-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
                        <i class="ph ph-gear-six text-lg"></i>Settings
                    </button>
                    <button type="button" data-action="reg-reset"
                        class="w-full h-10 flex items-center gap-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
                        <i class="ph ph-arrow-counter-clockwise text-lg"></i>Register again
                    </button>
                    <button type="button" data-action="logout"
                        class="w-full h-10 flex items-center gap-3 px-4 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap">
                        <i class="ph ph-sign-out text-lg"></i>Log out
                    </button>
                </div>` : ""}
            </div>`;
}


function renderDashboard() {
    // P1: re-attach the stashed section containers into the fresh shell —
    // chart roots persist for the whole session, not just this shell's
    // lifetime (render() no longer orphans them, R2).
    const keep = dashSectionCache;
    dashSectionCache = new Map();
    app().innerHTML = `
        <div class="flex h-full">
            ${dashSidebarHTML()}
            <main class="flex-1 min-w-0 flex flex-col">
                <div class="md:hidden shrink-0 flex items-center gap-4 p-4 border-b border-[#E4F1EE]">
                    ${state.dashSection !== "share" ? backBtn("dash-back") : ""}
                    ${logo()}
                    <button type="button" data-action="dash-mobile-nav" title="Open navigation" aria-label="Open navigation"
                        aria-expanded="${state.mobileNav}"
                        class="ml-auto w-10 h-10 -mr-2 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                        <i class="ph ph-list text-xl"></i>
                    </button>
                </div>
                <!-- py-3 matches the drawer's py-3 gutter, so the section
                     containers and the drawer are the same height. -->
                <div class="flex-1 min-h-0 w-full pt-2 pb-0">
                    <!-- Keep-alive: one container per section; switches toggle
                         hidden and populate on first visit (patchDashContent). -->
                    <div id="dash-content" class="h-full">
                        ${DASH_SECTIONS.map((s) => `
                            <div data-dash-sec="${s.id}" class="h-full" hidden></div>`).join("")}
                    </div>
                </div>
            </main>
            ${state.assistantDrawer && state.dashSection !== "assistant" ? aiDrawerHTML() : ""}
        </div>
    `;
    const content = document.getElementById("dash-content");
    if (content) {
        for (const [id, node] of keep) {
            const fresh = content.querySelector(`[data-dash-sec="${id}"]`);
            if (fresh) fresh.replaceWith(node);
        }
    }
    // Fill empty sections, sync visibility, schedule the staggered chart
    // mount (skipped wholesale for containers that kept their charts).
    patchDashContent();
}

/* ------------------- Sidebar collapse / expand ------------------- */

/* While the nav rail animates, the dashboard is held completely still — the
 * charts never resize during the motion. They re-measure once, batched, on
 * release when the rail is done.
 *  1. #dash-content gets a fixed pixel width: the current width when
 *     collapsing, the target width when expanding — always the side that
 *     keeps the panels inside the viewport. The dash-freeze class
 *     (input.css) also lifts it onto its own compositor layer with
 *     layout+paint containment, so the per-frame rail reflow never touches
 *     the dashboard subtree.
 *  2. Each chart host is pinned at its old pixel width, so the Nivo
 *     ResizeObservers stay silent. While expanding, panels narrow around
 *     the pinned charts — the dash-freeze rule in input.css crops them
 *     inside their panels instead of letting them paint over neighbours.
 * Release clears the pins once the rail is done; every chart then
 * re-measures in one batch, off the animation. */

/* Sidebar rail widths — w-52 expanded / w-20 collapsed per input.css; the
 * flex-1 content column gains/loses exactly this difference. */
const DASH_ASIDE_W = { expanded: 208, collapsed: 80 };

let dashFreeze = null;

function freezeDashContent(expanding) {
    if (dashFreeze) return dashFreeze.release;
    const content = document.getElementById("dash-content");
    if (!content) return null;

    // Measure before freezing: on expand the column is about to shrink to
    // its target, which would hand unpinned hosts their final size.
    const hosts = [...content.querySelectorAll('[id^="dash-"]')]
        .filter((el) => el !== content && el.childElementCount);
    const hostWidths = hosts.map((host) => host.getBoundingClientRect().width);
    const current = content.getBoundingClientRect().width;
    const width = expanding
        ? current - (DASH_ASIDE_W.expanded - DASH_ASIDE_W.collapsed)
        : current;

    content.dataset.dashFreeze = "1";
    content.classList.add("dash-freeze");
    content.style.width = `${width}px`;
    for (const [i, host] of hosts.entries()) {
        host.style.width = `${hostWidths[i]}px`;
    }

    const release = () => {
        if (!dashFreeze || dashFreeze.release !== release) return;
        dashFreeze = null;
        content.classList.remove("dash-freeze");
        delete content.dataset.dashFreeze;
        content.style.width = "";
        for (const host of hosts) host.style.width = "";
    };
    dashFreeze = { release };
    return release;
}

/* The toggle patches the sidebar in place — render() isn't called — so the
 * caret direction and tooltip must be flipped by hand. */
function updateCollapseToggle(aside) {
    const collapsed = state.dashCollapsed;
    const btn = aside.querySelector('[data-action="dash-collapse"]');
    if (!btn) return;
    btn.title = collapsed ? "Expand" : "Collapse";
    btn.setAttribute("aria-label", `${collapsed ? "Expand" : "Collapse"} navigation`);
    const icon = btn.querySelector("i");
    if (icon) {
        icon.classList.toggle("ph-caret-double-right", collapsed);
        icon.classList.toggle("ph-caret-double-left", !collapsed);
    }
}

function toggleDashSidebar() {
    state.dashCollapsed = !state.dashCollapsed;
    persistSession(); // toggle patches in place, no render() boundary to save it
    const aside = document.querySelector("#dash-sidebar-slot aside");
    if (!aside) return;
    // Reduced motion: the width transition is disabled in CSS, so there is
    // no animation to protect the charts from — skip the freeze.
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const release = reduced ? null : freezeDashContent(!state.dashCollapsed);
    aside.classList.toggle("dash-nav-collapsed", state.dashCollapsed);
    updateCollapseToggle(aside);
    if (release) {
        const done = (e) => {
            // The labels' opacity fades bubble transitionend here — only the
            // aside's own width transition may release the freeze.
            if (e && (e.target !== aside || e.propertyName !== "width")) return;
            release();
            aside.removeEventListener("transitionend", done);
        };
        aside.addEventListener("transitionend", done);
        setTimeout(done, 260); // covers an interrupted transition on rapid toggles
    }
}



function settingsRow(page, icon, label, value = "") {
    return `
        <button type="button" data-action="settings-open" data-page="${page}"
            class="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-200 bg-gray-50 hover:border-gray-900 transition-colors text-left">
            <i class="ph ${icon} text-2xl text-gray-500"></i>
            <span class="flex-1 font-medium">${label}</span>
            ${value ? `<span class="text-gray-500">${esc(value)}</span>` : ""}
            <i class="ph ph-caret-right text-gray-400"></i>
        </button>`;
}

function renderSettings() {
    const sub = state.settingsPage;
    const langLabel = LANGUAGES.find((l) => l.id === state.language).label;

    let body;
    if (sub === "about-app") {
        body = `
            <div class="flex flex-col items-center text-center gap-3 p-6 rounded-2xl border-2 border-gray-200 bg-gray-50">
                <div class="flex items-center gap-1 font-black text-gray-900">
                    <img src="teachr-logo.svg" alt="Teachr logo" class="h-12 w-12"><span class="text-2xl font-black tracking-tight">Teachr</span>
                </div>
                <p class="text-sm font-normal text-gray-500">Version 1.0 (prototype)</p>
            </div>
            <p class="font-normal text-gray-600 leading-relaxed">Teachr is a workplace training app that helps teams build safer, more equal and more respectful workplaces — one short lesson at a time.</p>
            <p class="font-normal text-gray-600 leading-relaxed">Lessons are bite-sized, audio-supported and available in multiple languages, so everyone can learn regardless of reading level or background.</p>`;
    } else if (sub === "about-company") {
        body = `
            <p class="font-normal text-gray-600 leading-relaxed">Teachr helps companies train their frontline workforce with engaging, mobile-first lessons on equality, safety and respect.</p>
            <p class="font-normal text-gray-600 leading-relaxed">We partner with organisations in over 40 countries, reaching workers in factories, warehouses, farms and stores — in their own language, at their own pace.</p>
            <p class="font-normal text-gray-600 leading-relaxed">Contact: hello@teachr.example</p>`;
    } else if (sub === "language") {
        body = LANGUAGES.map((lang) => `
            <button type="button" data-action="settings-lang" data-lang="${lang.id}"
                class="w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-colors
                       ${state.language === lang.id
                           ? "border-gray-900 bg-gray-100 text-gray-900"
                           : "border-gray-200 bg-gray-50 text-gray-900 hover:border-brand-500 hover:bg-brand-50"}">
                <span class="text-lg font-medium">${lang.native}</span>
                ${state.language === lang.id ? `<i class="ph-fill ph-check-circle text-xl"></i>` : speakerBtn()}
            </button>`).join("");
    } else if (sub === "privacy") {
        body = `
            <p class="font-normal text-gray-600 leading-relaxed">Your answers are used to tailor your training experience and to issue your certificate. They are never shared with third parties without your consent.</p>
            <p class="font-normal text-gray-600 leading-relaxed">Aggregated, anonymised results may be shared with your employer to help them improve workplace policies. Individual answers are never shown to managers.</p>
            <p class="font-normal text-gray-600 leading-relaxed">You can request a copy of your data or delete your account at any time by contacting privacy@teachr.example.</p>`;
    } else {
        body = `
            <div class="space-y-3">
                ${settingsRow("demographics", "ph-chart-line-up", "Dashboard")}
                ${settingsRow("ds", "ph-swatches", "Design system")}
                ${settingsRow("profile", "ph-identification-card", "My details", state.answers.name || "")}
                ${settingsRow("about-app", "ph-info", "About the app")}
                ${settingsRow("about-company", "ph-building", "About the company")}
                ${settingsRow("language", "ph-translate", "Language", langLabel)}
                ${settingsRow("privacy", "ph-shield-check", "Privacy policy")}
            </div>
            <button type="button" data-action="logout"
                class="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-red-200 bg-red-50 text-red-600 font-medium hover:border-red-300 transition-colors mt-6">
                <i class="ph ph-sign-out text-xl"></i>Log out
            </button>`;
    }

    const titles = {
        "about-app": "About the app",
        "about-company": "About the company",
        "language": "Language",
        "privacy": "Privacy policy",
    };

    app().innerHTML = `
        ${viewHeader(null, sub ? titles[sub] : "Settings")}
        <div class="${column("px-6 shrink-0")}">
            <div class="flex items-center gap-3 py-4">
                ${sub ? backBtn("settings-sub-back") : backBtn("settings-back")}
            </div>
        </div>
        ${scrollShell(null, `
            <div class="${column("px-6 pt-6 pb-10 space-y-4")}">
                ${body}
            </div>
        `)}
    `;
}

/* ---------------------------- My details view (T4) ------------------------- *
 * Review + edit every registration answer (DR-T3). Reached from the account
 * menu ("My details") and from Settings; each row jumps into that single
 * registration step in edit mode and returns here. */

/** R8 B5 (reviewer pass 3): ONE edit affordance, 1-to-1 on both detail
 * lists — the confirm-details review rows and the My details page both
 * render pen + "Edit" text. Same element, same hooks (data-step on both
 * actions): the lists cannot drift. `nested` renders a span (My details'
 * rows are buttons themselves — no nested button). */
const editAffordance = (action, stepId, label, { withText = false, nested = false } = {}) => {
    const Tag = nested ? "span" : "button";
    return `<${Tag} ${nested ? 'aria-hidden="true"' : `type="button" aria-label="Edit ${esc(label)}"`}
        data-action="${action}" data-step="${stepId}"
        class="shrink-0 flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
        <i class="ph ph-pencil-simple text-base"></i>${withText ? "Edit" : ""}
    </${Tag}>`;
};

function renderProfile() {
    const rows = REG_STEPS.filter((s) => s.type !== "review");
    app().innerHTML = `
        ${viewHeader("profile-back", "My details")}
        ${scrollShell("profile-scroll", `
            <div class="${column("px-6 pt-6 pb-10")}">
                <h1 class="text-2xl md:text-3xl font-black tracking-tight mb-2">Your details</h1>
                <p class="text-lg font-normal text-gray-500 mb-8">Collected at registration. Tap a row to edit it.</p>
                <!-- R13-11: padded, rounded panel on a 90%-opaque body-base veil
                     (amends R13-9's solid rect); the certificate note rides
                     inside the padding, under the list. -->
                <div class="rounded-2xl bg-[var(--gnd-panel)] px-4 py-3">
                    <div class="divide-y divide-[#E4F1EE]">
                        ${rows.map((step) => `
                            <button type="button" data-action="profile-edit" data-step="${step.id}"
                                class="w-full flex items-center justify-between gap-4 py-4 text-left group">
                                <span class="font-normal text-gray-500 shrink-0">${esc(step.label)}</span>
                                <span class="flex items-center gap-2 min-w-0">
                                    <span class="font-semibold text-right truncate">${esc(state.answers[step.id] || "—")}</span>
                                    ${editAffordance("profile-edit", step.id, step.label, { withText: true, nested: true })}
                                </span>
                            </button>`).join("")}
                    </div>
                    <div class="flex items-start gap-3 pt-4 text-gray-600">
                        <i class="ph ph-certificate text-2xl shrink-0"></i>
                        <p class="text-sm font-normal">Your certificate will be issued in <b>${esc(LANGUAGES.find((l) => l.id === state.language).label)}</b> when you complete your training.</p>
                    </div>
                </div>
            </div>
        `)}
    `;
}

/* Shared chat input card — placeholder, send, +, and Model row per the mockups. */
function aiInputHTML(id, chat, placeholder = "Placeholder text") {
    return `
    <div id="${id}-row" class="rounded-2xl border-2 border-gray-200 bg-white shadow-sm p-3 transition-colors focus-within:border-gray-900 focus-within:ring-2 focus-within:ring-gray-100">
        <div class="flex items-start gap-2">
            <input id="${id}" type="text" placeholder="${placeholder}" class="flex-1 bg-transparent focus:outline-none text-sm placeholder:text-gray-500">
            ${state.aiTyping === chat
                ? `<button type="button" data-action="ai-stop" data-chat="${chat}" title="Stop generating"
                    class="p-2 -m-1.5 shrink-0 flex items-center justify-center text-gray-500 hover:text-red-600 transition-colors">
                    <i class="ph ph-stop-circle text-lg"></i>
                </button>`
                : `<button type="button" data-action="ai-send" data-chat="${chat}" title="Send"
                    class="p-2 -m-1.5 shrink-0 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
                    <i class="ph ph-paper-plane-tilt text-lg"></i>
                </button>`}
        </div>
        <div class="flex items-center justify-between pt-2">
            <button type="button" title="Attach (demo)" class="w-11 h-11 -m-2.5 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
                <i class="ph ph-plus text-base"></i>
            </button>
            <span class="flex items-center gap-1 text-xs text-gray-500">Model <i class="ph ph-arrow-clockwise text-xs"></i></span>
        </div>
    </div>`;
}

/* The typing flip swaps Send ↔ Stop without a shell rebuild (N8). */
function patchInputRow(chat) {
    const inputId = chat === "drawer" ? "ai-drawer-input" : "ai-landing-input";
    const row = document.getElementById(`${inputId}-row`);
    if (row) row.outerHTML = aiInputHTML(inputId, chat);
}

/* M7: menu + settings toggles patch their own nodes — the drawer shell,
 * the thread (and its chart hosts) are never rebuilt for these clicks. */
function syncDrawerMenuBtn() {
    const btn = document.querySelector('[data-action="ai-drawer-menu"]');
    if (btn) btn.setAttribute("aria-expanded", String(state.aiDrawerMenu));
}
function patchDrawerMenu() {
    const root = document.querySelector(".ai-drawer-menu-root");
    if (!root) return;
    const existing = document.getElementById("ai-drawer-menu-pop");
    if (state.aiDrawerMenu && !existing) root.insertAdjacentHTML("beforeend", `<div id="ai-drawer-menu-pop">${aiDrawerMenuHTML()}</div>`);
    if (!state.aiDrawerMenu && existing) existing.remove();
    syncDrawerMenuBtn();
}
function patchDrawerSettings() {
    const slot = document.getElementById("ai-settings-slot");
    if (slot) slot.innerHTML = state.aiSettingsOpen ? aiSettingsPanelHTML() : "";
}
function setDrawerMenu(open) {
    state.aiDrawerMenu = open;
    patchDrawerMenu();
}
function setDrawerSettings(open) {
    state.aiSettingsOpen = open;
    patchDrawerSettings();
    setDrawerMenu(false);
}
function stamp() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const mon = d.toLocaleString("en", { month: "short" });
    const day = d.getDate();
    return `${hh}:${mm} ${day} ${mon}`;
}

/* Mock AI agent in two surfaces:
 *   1. Landing chat — a "Teachr Assistant" section in the sidebar: portal
 *      view with suggestion chips and a mock conversation.
 *   2. Context drawer — a side panel that pushes (not overlays) the dashboard
 *      in any section, aware of the current section, with quick actions,
 *      hover message actions, an embedded mock chart and mock settings.
 * All replies are canned placeholders.                                      */

const AI_SUGGESTIONS = [
    "How is training going across my sites?",
    "Which teams need my attention?",
    "What changed in the last 30 days?",
];

/* R4-4/5: the assistant "thinks" for AI_THINK_MS with rotating step labels. */
const AI_THINK_MS = 10000;
const AI_THINK_STEPS = [
    "Reading the dashboard…",
    "Comparing the last 30 days…",
    "Picking the right chart…",
    "Drawing the diagram…",
];

function startThinking(chat) {
    state.aiTyping = chat;
    state.aiTypingStep = 0;
    clearInterval(state.aiThinkInterval);
    // Reduced motion: one static label, no rotation (M8).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // M7/M8: the label mutates its own node — the thread (bubbles, chart
    // hosts) is never re-rendered during the thinking window.
    state.aiThinkInterval = setInterval(() => {
        state.aiTypingStep = (state.aiTypingStep || 0) + 1;
        const label = document.getElementById("ai-typing-label");
        if (label) label.textContent = AI_THINK_STEPS[(state.aiTypingStep || 0) % AI_THINK_STEPS.length];
    }, AI_THINK_MS / 4);
}
function stopThinking() {
    clearInterval(state.aiThinkInterval);
    state.aiThinkInterval = null;
    state.aiTyping = null;
}

function aiTypingHTML() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const label = reduced ? "Thinking…" : AI_THINK_STEPS[(state.aiTypingStep || 0) % AI_THINK_STEPS.length];
    return `
    <div id="ai-typing" class="flex items-center gap-2 py-2" aria-live="polite" aria-label="Assistant is thinking">
        <span class="ai-typing-dots flex items-center gap-1.5" aria-hidden="true">
            <span class="ai-dot"></span>
            <span class="ai-dot"></span>
            <span class="ai-dot"></span>
        </span>
        <span id="ai-typing-label" class="text-xs font-normal text-gray-500">${esc(label)}</span>
    </div>`;
}

/* Assistant scripts (E1): every intent pairs matchers with reply templates
 * (rotated per thread so no two replies in a row repeat), a diagram kind,
 * and the follow-up chips it offers next. */
const AI_INTENTS = [
    {
        match: /complet|going|progress|overview/i,
        replies: [
            `Training completion is at ${AVG_COMPLETION}% across your sites this period, up ${periodTrend} points since ${MONTHLY_TREND[0][0]}. ${topLesson.lesson} leads at ${topLesson.pct}%. Want a per-market breakdown?`,
            `Completion is climbing: ${AVG_COMPLETION}% this period, up ${monthTrend} point${monthTrend === 1 ? "" : "s"} on ${MONTHLY_TREND[MONTHLY_TREND.length - 2][0]}. The night shifts trail the day shifts by ${shiftGap} points — say who is behind and I will name the teams.`,
        ],
        chart: "weekly",
        chips: ["Per-market breakdown", "Who is behind?"],
    },
    {
        match: /per-market|which markets|by market/i,
        replies: [
            `By market: ${topMarket.market} leads at ${topMarket.pct}%, Indonesia follows at ${MARKET_COMPLETION[1].pct}%, India holds ${MARKET_COMPLETION[3].pct}%, and ${worstMarket.market} trails at ${worstMarket.pct}% — mostly night-shift learners who have not started. A reminder campaign there is the fastest lever.`,
            `${worstMarket.market} is the outlier at ${worstMarket.pct}%. ${topMarket.market} (${topMarket.pct}%), Indonesia (${MARKET_COMPLETION[1].pct}%) and India (${MARKET_COMPLETION[3].pct}%) are healthy. Say send a reminder and I will set one up for ${worstMarket.market}.`,
        ],
        chart: "markets",
        goto: { section: "demographics", panel: "dash-market" },
        chips: ["Send a reminder", "Completion overview"],
    },
    {
        match: /send a reminder|reminder campaign/i,
        replies: [
            "Reminder set for the two teams furthest behind — you will see completion move in the next weekly numbers.",
            `On it: a reminder campaign goes out to ${OVERDUE_TEAMS[0].team.toLowerCase()} and ${OVERDUE_TEAMS[1].team.toLowerCase()} today.`,
        ],
        chart: "weekly",
        chips: ["Completion overview", "Who is behind?"],
    },
    {
        match: /attention|behind|risk|overdue|need/i,
        replies: [
            `${overdueTotal} learners are overdue across the three teams on the watchlist — ${OVERDUE_TEAMS[0].team} alone accounts for ${OVERDUE_TEAMS[0].overdue}. A reminder campaign covers all three.`,
            `The teams furthest behind are ${OVERDUE_TEAMS[0].team.toLowerCase()} (${OVERDUE_TEAMS[0].overdue} overdue) and ${OVERDUE_TEAMS[1].team.toLowerCase()} (${OVERDUE_TEAMS[1].overdue}). A reminder campaign is the fastest lever for both.`,
        ],
        chart: "rank",
        goto: { section: "outcomes", panel: "dash-scores" },
        chips: ["Send a reminder", "Per-market breakdown"],
    },
    {
        match: /chang|last 30|month|week/i,
        replies: [
            `Over the last 30 days: ${NEW_LEARNERS_30D} new learners started, completion rose from ${MONTHLY_TREND[0][1]}% to ${MONTHLY_TREND[MONTHLY_TREND.length - 1][1]}%, and the gender split held at ${GENDER_SPLIT.female}% female. Age group ${topAgeGroup.age.replace("-", " to ")} drives the largest cohort.`,
            `The last month brought ${NEW_LEARNERS_30D} new learners and a ${monthTrend}-point completion gain. ${worstMarket.market} remains the slow starter; ${topMarket.market} and Indonesia absorbed most of the growth.`,
        ],
        chart: "trend",
        goto: { section: "outcomes", panel: "dash-activity" },
        chips: ["Per-market breakdown", "Completion overview"],
    },
    {
        match: /\b(gender|women|men|female|male|split|workforce)\b|who is trained/i,
        replies: [
            `The workforce is ${GENDER_SPLIT.female}% women and ${GENDER_SPLIT.male}% men (${GENDER_SPLIT.other}% other) — ${TOTAL_LEARNERS.toLocaleString("en")} trainees across ${MARKET_COMPLETION.length} markets. The split holds in every market; the largest cohort is ${topAgeGroup.age.replace("-", "–")}.`,
            `Women make up ${GENDER_SPLIT.female}% of the ${TOTAL_LEARNERS.toLocaleString("en")} trainees. Men account for ${GENDER_SPLIT.male}%, the rest other or undisclosed. Ask for the market split to see where the cohorts differ.`,
        ],
        chart: "split",
        goto: { section: "demographics", panel: "dash-gender" },
        chips: ["Per-market breakdown", "Completion overview"],
    },
];
function aiKey(q) {
    return q.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/* Reply for a question or chip: match the intent, rotate its templates
 * (E5), and hand back text + diagram + the next chips down the chain. */
function aiAnswerFor(q) {
    const intent = AI_INTENTS.find((i) => i.match.test(q)) || {
        replies: [`Here is what I can see in your training data: ${AVG_COMPLETION}% completion this period, ${AVG_PERFORMANCE}% average performance on key messages, and ${NEW_LEARNERS_30D} new learners in the last 30 days. Pick a thread to drill into.`],
        chart: "weekly",
        chips: AI_SUGGESTIONS,
    };
    const key = aiKey(q);
    const n = state.aiUses[key] = (state.aiUses[key] || 0) + 1;
    return {
        text: intent.replies[(n - 1) % intent.replies.length],
        chart: intent.chart,
        goto: intent.goto,
        chips: intent.chips,
    };
}



function drawerSummaryText(context) {
    if (context === "outcomes") {
        const strongest = KEY_MESSAGE_SCORES.reduce((a, b) => (b.pct > a.pct ? b : a));
        const weakest = KEY_MESSAGE_SCORES.reduce((a, b) => (b.pct < a.pct ? b : a));
        return `All ${KEY_MESSAGE_SCORES.length} key messages sit in the High performance band (85% and above), averaging ${AVG_PERFORMANCE}% correct. The strongest is ${strongest.message} (${strongest.pct}%); the weakest is ${weakest.message} (${weakest.pct}%). Would you like a per-market breakdown?`;
    }
    if (context === "share") {
        const completed = LESSON_AVG.filter((l) => LESSONS.some((ls) => ls.subtitle === l.lesson && ls.status !== "locked"));
        const avgDone = completed.length
            ? Math.round(completed.reduce((s, l) => s + l.pct, 0) / completed.length)
            : AVG_PERFORMANCE;
        return `Share training covers Course 01, Internal Security: ${LESSONS.length} lessons, from ${LESSONS[0].subtitle} (${LESSONS[0].status}) to ${LESSONS[LESSONS.length - 1].subtitle}. The average score across completed lessons is ${avgDone}%. Ask me about completion, performance or demographics, or use the panel to send a training to your workforce.`;
    }
    return `Your demographics overview covers ${MARKET_COMPLETION.length} training markets this period. Most trainees are in ${MARKET_DEMOGRAPHICS.reduce((a, b) => (b.female + b.male + b.other > a.female + a.male + a.other ? b : a)).country}, the majority are women (${GENDER_SPLIT.female}%), and the largest age group is ${topAgeGroup.age.replace("-", "–")}. Training is concentrated in domestic workers (${domesticShare}%). Would you like to see training completion, or how these learners performed?`;
}

/* Mock diagram cards rendered inside assistant replies. */
/* O4: the assistant's diagram kinds mount the SAME Nivo charts the
 * dashboard panels render — window.mountChart(kind, host) looks the
 * element up in charts.jsx's registry and tracks the root. The diagram
 * spans the full thread width (125% of the 4/5 drawer bubble, 200% of the
 * 1/2 portal bubble, N11's full-width diagrams) — otherwise the dashboard
 * charts' wide left margins leave a zero-width plot and no hover targets
 * (J2). */
function miniChartHTML(kind) {
    /* R4-1: the host is tall (h-64) so the chart fills the diagram card.
     * R4-6: the whole card is clickable — it adds the diagram as the drawer's
     * context chip. R4-2: the card spans the full thread (a w-full sibling of
     * the shrink-to-fit text bubble, not a % of it). */
    const title = {
        kpi: "Average performance",
        weekly: "Training completion by week",
        markets: "Training completion by market",
        trend: "Completion trend",
        split: "Trainees by gender",
        rank: "Key message scores",
        messages: "Key message scores",
    }[kind] || "";
    return `
    <div class="rounded-xl diagram-card p-3 my-2 w-full cursor-pointer" data-minichart
         role="button" tabindex="0" data-action="diagram-context" data-title="${esc(title)}"
         title="Add this diagram to the assistant context">
        <p class="text-xs font-semibold text-gray-600 pb-2">${esc(title)}</p>
        <div class="h-64" data-chart-host="${kind}"></div>
    </div>`;
}

/* P3: the charts bundle (react + nivo, ~2MB) loads lazily, once, on first
 * use — cached promise; no-op afterwards. */
let chartsPromise = null;
function ensureCharts() {
    if (window.renderDashCharts) return Promise.resolve();
    chartsPromise = chartsPromise || import("./charts.js");
    return chartsPromise;
}

/* P4: mount chat diagram hosts one per animation frame (like the dashboard's
 * staggered mounts) instead of all in one task. */
async function mountChatCharts() {
    await ensureCharts();
    if (!window.mountChart) return;
    const hosts = [...document.querySelectorAll("[data-chart-host]:not([data-mounted])")];
    const mountNext = () => {
        const host = hosts.shift();
        if (!host) return;
        window.mountChart(CHART_KIND_TO_ID[host.dataset.chartHost] || host.dataset.chartHost, host);
        if (hosts.length) requestAnimationFrame(mountNext);
    };
    mountNext();
}

/* O4: the assistant's diagram kinds mount the SAME Nivo charts the
 * dashboard panels render — the kind maps to the dashboard panel id. */
const CHART_KIND_TO_ID = {
    kpi: "dash-market",   // fallback: no KPI chart in the dashboard yet
    weekly: "dash-activity",
    markets: "dash-market",
    trend: "dash-activity",
    split: "dash-gender",
    rank: "dash-messages",
    messages: "dash-messages",
};
function aiUserBubble(m, i, chat) {
    /* R4-2/3: shrink-to-fit — as wide as the text, capped at half the thread,
     * hugging the right edge. */
    return `
    <div class="ml-auto w-fit max-w-[80%] flex flex-col items-end py-1.5 group">
        <div class="w-full flex flex-col items-end">
            <div class="w-full bg-brand-600 text-white rounded-2xl rounded-br-md px-3.5 py-2 text-sm break-words">${esc(m.text)}</div>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 pt-1">
                <button type="button" data-action="ai-edit" data-chat="${chat}" data-i="${i}" title="Edit"
                    class="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-white transition-colors">
                    <i class="ph ph-pencil-simple text-xs"></i>
                </button>
                <button type="button" data-action="ai-redo" data-chat="${chat}" data-i="${i}" title="Regenerate"
                    class="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-white transition-colors">
                    <i class="ph ph-arrow-counter-clockwise text-xs"></i>
                </button>
                <button type="button" data-action="ai-copy" data-chat="${chat}" data-i="${i}" title="Copy"
                    class="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-white transition-colors">
                    <i class="ph ph-copy text-xs"></i>
                </button>
            </div>
        </div>
    </div>`;
}

function aiAssistantBubble(m, i, chat, isLast = false) {
    const showCharts = state.aiSettings.charts;
    /* R4-2: the message is full thread width; the TEXT bubble inside is
     * shrink-to-fit (max-w-[80%]) and the diagram below spans the full thread
     * (J2), as a sibling of the text — not a % of the shrunken bubble. */
    let html = `<div class="w-fit max-w-[80%] bg-gray-50 rounded-2xl rounded-bl-md px-3.5 py-2 text-sm text-gray-700 leading-relaxed whitespace-pre-line break-words">${esc(m.text)}</div>`;
    const diagram = m.chart && showCharts ? miniChartHTML(m.chart) : "";
    if (m.chips && showCharts) html += `
        <div class="flex flex-wrap gap-2 py-1.5">
            ${m.chips.map((c) => uiChip(c, `data-action="ai-quick" data-chat="${chat}" data-q="${esc(c)}"`)).join("")}
        </div>`;
    return `
    <div class="${isLast ? "ai-msg-reveal " : ""}py-1.5 group">
        ${html}
        ${diagram}
        <div class="flex items-center gap-1 pt-1 text-gray-400 opacity-40 group-hover:opacity-100 transition-opacity">
            <button type="button" data-action="ai-rate" data-chat="${chat}" data-i="${i}" data-v="up" title="Helpful"
                class="w-5 h-5 flex items-center justify-center hover:text-gray-900 transition-colors">
                <i class="ph ph-thumbs-up text-xs"></i>
            </button>
            <button type="button" data-action="ai-rate" data-chat="${chat}" data-i="${i}" data-v="down" title="Not helpful"
                class="w-5 h-5 flex items-center justify-center hover:text-red-500 transition-colors">
                <i class="ph ph-thumbs-down text-xs"></i>
            </button>
            <button type="button" data-action="ai-copy" data-chat="${chat}" data-i="${i}" title="Copy"
                class="w-5 h-5 flex items-center justify-center hover:text-gray-900 transition-colors">
                <i class="ph ph-copy text-xs"></i>
            </button>
            <button type="button" data-action="ai-redo" data-chat="${chat}" data-i="${i}" title="Regenerate"
                class="w-5 h-5 flex items-center justify-center hover:text-gray-900 transition-colors">
                <i class="ph ph-arrow-counter-clockwise text-xs"></i>
            </button>
            ${m.ts ? `<span class="text-[11px] font-normal pl-1">${esc(m.ts)}</span>` : ""}
        </div>
    </div>`;
}

/* Assistant landing — portal view with suggestions and a mock chat. */
function aiLandingThreadHTML() {
    if (!state.aiLanding.length && state.aiTyping !== "landing") {
        return uiEmptyState({
            icon: "ph-sparkle", title: "Teachr Assistant",
            sub: "Ask anything about your classes, students or lessons.",
            chips: AI_SUGGESTIONS,
        });
    }
    return state.aiLanding.map((m, i) => m.role === "user" ? aiUserBubble(m, i, "landing") : aiAssistantBubble(m, i, "landing", i === state.aiLanding.length - 1)).join("")
        + (state.aiTyping === "landing" ? aiTypingHTML() : "");
}

/* N10 revision: the saved-chats list, embedded in the assistant section
 * container (not an isolated view) — resume on click, delete per row.
 * The header's Back toggle returns to the thread. */
function chatsListHTML(chats) {
    /* M4: empty state — the full pattern (icon + title + sub + CTA chip),
     * not the one-line compact note. The chip lands on the thread. */
    const body = chats.length ? `
            <div class="flex items-center justify-between pb-3">
                <span class="text-xs font-normal text-gray-400">${chats.length} saved</span>
            </div>
            <div class="space-y-2">${chats.map((c) => `
        <div class="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-gray-50 hover:border-gray-300 transition-colors">
            <button type="button" data-action="chat-open" data-id="${c.id}" class="flex-1 min-w-0 text-left p-3">
                <span class="block text-sm font-medium truncate">${esc(c.title)}</span>
                <span class="block text-[11px] font-normal text-gray-400">${timeAgo(c.ts)}</span>
            </button>
            <button type="button" data-action="chat-delete" data-id="${c.id}" title="Delete chat"
                aria-label="Delete chat: ${esc(c.title)}"
                class="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors mr-2">
                <i class="ph ph-trash text-sm"></i>
            </button>
        </div>`).join("")}</div>`
        : uiEmptyState({
            icon: "ph-list", title: "No saved chats",
            sub: "Conversations you have are saved here automatically.",
            chips: [{ label: "Ask the assistant", attrs: 'data-action="chats-page"' }],
        });
    return `
        <div class="flex-1 min-h-0 overflow-y-auto px-5 pb-4">${body}</div>`;
}

/* Re-render the assistant section in place (chats list toggle, chat resume,
 * delete) — the shell, sidebar and other sections' chart roots untouched. */
function patchAssistant() {
    const sec = document.querySelector('[data-dash-sec="assistant"]');
    if (sec) sec.innerHTML = dashContentHTML("assistant");
    mountChatCharts();
}


function aiDrawerThreadHTML() {
    storySeed("drawer");
    if (!state.aiDrawer.length && state.aiTyping !== "drawer") {
        return uiEmptyState({
            icon: "ph-sparkle", title: "Teachr Assistant",
            sub: "Ask about this page, or press Summarize.",
        });
    }
    return state.aiDrawer.map((m, i) => m.role === "user" ? aiUserBubble(m, i, "drawer") : aiAssistantBubble(m, i, "drawer", i === state.aiDrawer.length - 1)).join("")
        + (state.aiTyping === "drawer" ? aiTypingHTML() : "");
}

/* The drawer is a flex sibling of the dashboard content — it pushes the
 * dashboard instead of overlaying it, so context stays in view. */
/* M7: menu + settings are their own nodes — toggles patch them in place,
 * the drawer shell and thread are never rebuilt for a menu/settings click. */
function aiDrawerMenuHTML() {
    return `
    <div class="absolute right-0 top-full mt-1 w-44 rounded-xl border border-gray-200 bg-white shadow-lg z-50 py-1.5">
        <button type="button" data-action="ai-settings"
            class="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
            <i class="ph ph-gear-six text-base"></i>Assistant settings
        </button>
        <button type="button" title="History (demo)"
            class="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
            <i class="ph ph-list-dashes text-base"></i>History
        </button>
        <button type="button" data-action="ai-new" data-chat="drawer"
            class="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
            <i class="ph ph-plus text-base"></i>New chat
        </button>
    </div>`;
}

function aiSettingsPanelHTML() {
    const s = state.aiSettings;
    return `
    <div class="px-4 py-3 border-b border-[#E4F1EE] bg-gray-50 space-y-2">
        <p class="text-xs font-semibold text-gray-500">Assistant settings (demo)</p>
        <div class="flex items-center justify-between text-sm">
            <span>Model</span>
            <span class="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">Teachr-1</span>
        </div>
        <label class="flex items-center justify-between text-sm cursor-pointer">
            <span>Use page context</span>
            <input type="checkbox" data-action="ai-setting" data-key="context" ${s.context ? "checked" : ""} class="accent-gray-900">
        </label>
        <label class="flex items-center justify-between text-sm cursor-pointer">
            <span>Show charts</span>
            <input type="checkbox" data-action="ai-setting" data-key="charts" ${s.charts ? "checked" : ""} class="accent-gray-900">
        </label>
        <div class="flex items-center justify-between text-sm">
            <span>Response length</span>
            <div class="flex gap-1">
                <button type="button" data-action="ai-setting-len" data-v="concise"
                    class="text-xs px-2 py-0.5 rounded-full ${s.length === "concise" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"} transition-colors">Concise</button>
                <button type="button" data-action="ai-setting-len" data-v="detailed"
                    class="text-xs px-2 py-0.5 rounded-full ${s.length === "detailed" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"} transition-colors">Detailed</button>
            </div>
        </div>
    </div>`;
}

function aiDrawerHTML() {
    return `
    <aside id="ai-drawer" class="ai-drawer h-full py-2 pl-2 pr-2 shrink-0 w-[24rem]">
        <div class="h-full flex flex-col rounded-2xl border border-gray-200 overflow-hidden">
        <div class="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200">
            <h2 class="text-sm font-bold truncate">${state.aiDrawerContext ? "Summarize this page" : "Teachr Assistant"}</h2>
            <div class="flex items-center gap-1">
                <div class="relative ai-drawer-menu-root">
                    <button type="button" data-action="ai-drawer-menu" title="Assistant options" aria-expanded="${state.aiDrawerMenu}"
                        class="w-11 h-11 -m-1.5 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                        <i class="ph-bold ph-dots-three text-lg"></i>
                    </button>
                    ${state.aiDrawerMenu ? `<div id="ai-drawer-menu-pop">${aiDrawerMenuHTML()}</div>` : ""}
                </div>
                <button type="button" data-action="ai-drawer" title="Close"
                    class="w-11 h-11 -m-1.5 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                    <i class="ph ph-x text-lg"></i>
                </button>
            </div>
        </div>
        <div id="ai-settings-slot">${state.aiSettingsOpen ? aiSettingsPanelHTML() : ""}</div>
        <div id="ai-drawer-thread" class="flex-1 min-w-0 overflow-y-auto px-4 py-3">${aiDrawerThreadHTML()}</div>
        <div class="px-4 pb-3">
            <div class="flex flex-wrap items-center gap-2 pb-2">
                ${(state.aiDrawerPanel || state.aiDrawerContext) ? `
                <span class="flex items-center gap-1.5 rounded-full bg-gray-100 text-gray-600 px-3 py-1.5 text-xs font-medium">
                    <i class="ph ph-file text-sm"></i>${esc(state.aiDrawerPanel || state.aiDrawerContext)}
                    <button type="button" data-action="ai-context-clear" title="Remove context" class="text-gray-400 hover:text-gray-600">
                        <i class="ph ph-x text-sm"></i>
                    </button>
                </span>` : ""}
                <button type="button" data-action="ai-summarize"
                    class="flex items-center gap-1.5 rounded-full border border-gray-300 text-gray-700 px-3 py-1.5 text-xs font-semibold hover:bg-gray-100 transition-colors">
                    <i class="ph-fill ph-sparkle text-sm"></i>Summarize
                </button>
            </div>
            ${aiInputHTML("ai-drawer-input", "drawer", "Ask a question...")}
            <p class="text-[11px] font-normal text-gray-600 text-center pt-2">AI makes mistakes, be sure to verify the information.</p>
        </div>
        </div>
    </aside>`;
}

function patchChat(chat) {
    if (chat === "drawer") {
        const el = document.getElementById("ai-drawer-thread");
        if (el) {
            el.innerHTML = aiDrawerThreadHTML();
            el.scrollTop = el.scrollHeight;
        }
    } else {
        const el = document.getElementById("ai-thread");
        if (el) {
            el.innerHTML = aiLandingThreadHTML();
            el.scrollTop = el.scrollHeight;
        }
    }
    mountChatCharts(); // O4: every fresh chart host fills immediately
}

/* ------------------------- The demo story (L) -----------------------------
 * One graph (window.TEACHR_STORY), one progress pointer shared by the
 * portal and the drawer. Conversations always open on the empty state
 * (chapter 0: prompt options) — the assistant never speaks first; P0 lands
 * as the reply to the first prompt. The drawer resumes the standing beat
 * when the story is in progress; with no story it keeps the J6 empty state. */

function storyActive() {
    return !!(state.story && state.story.node && state.story.node !== "done");
}

function pushStoryBeat(list, id) {
    const n = window.TEACHR_STORY.nodes[id];
    list.push({ role: "assistant", text: n.text, chart: n.chart, chips: n.chips.map((c) => c.label) });
}

function storySeed(chat) {
    const story = window.TEACHR_STORY;
    if (!story || chat !== "drawer") return;
    if (!state.aiDrawer.length && storyActive()) {
        pushStoryBeat(state.aiDrawer, state.story.node);
    }
}

function storyAnswerFor(chat, q) {
    const story = window.TEACHR_STORY;
    if (!story) return null;
    if (!state.story.node) {
        // Chapter 0 → 1: the first prompt starts the story broad (P0).
        if (chat !== "landing") return null;
        state.story.node = story.start;
        const n0 = story.nodes[story.start];
        return { story: true, text: n0.text, chart: n0.chart, chips: n0.chips.map((c) => c.label) };
    }
    if (state.story.node === "done") return null;
    const nodes = story.nodes;
    const node = nodes[state.story.node];
    const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
    const nq = norm(q);
    const hit = node.chips.find((c) => {
        const nc = norm(c.label);
        return nq.includes(nc) || nc.includes(nq);
    });
    if (!hit) {
        // L5: graceful re-entry — the story's overview answer, the current
        // node's chips re-offered, pointer unchanged.
        return {
            story: true,
            text: nodes[story.start].text,
            chart: null,
            chips: node.chips.map((c) => c.label),
        };
    }
    if (hit.act === "share") {
        // L4: the act drives the real UI — preselect the course now, the
        // section switch happens after the reply lands (aiSend's goto).
        state.shareSelection = [story.courseId];
        state.story.node = "done";
        return {
            story: true, act: "share",
            text: nodes.ACT.text, chart: null, chips: [],
            goto: { section: "share" },
        };
    }
    state.story.node = hit.next;
    const next = nodes[hit.next];
    return { story: true, text: next.text, chart: next.chart, chips: next.chips.map((c) => c.label) };
}

function aiSend(chat, q) {
    if (!q || state.aiTyping === chat) return;
    if (chat === "landing") state.chatId = state.chatId || ("chat-" + Date.now());
    const list = chat === "drawer" ? state.aiDrawer : state.aiLanding;
    list.push({ role: "user", text: q });
    startThinking(chat);
    patchChat(chat);
    patchInputRow(chat); // Send → Stop (N8: the pending reply is cancellable)
    // N8: the pending timer is cancellable — Stop clears it and the reply's
    // guard below keeps a stopped reply from ever landing.
    state.aiTypingTimer = setTimeout(() => {
        if (state.aiTyping !== chat) return; // stopped while pending — no orphaned reply
        stopThinking();
        // The story engine answers first (L1); unmatched input falls through
        // to the intent table (L5's fallback lives inside the story engine).
        const a = storyAnswerFor(chat, q) || aiAnswerFor(q);
        list.push({
            role: "assistant",
            text: (!a.story && state.aiSettings.length === "detailed") ? a.text + "\n\nHappy to break this down further — say which slice you want." : a.text,
            chart: a.chart,
            chips: a.chips,
        });
        if (chat === "landing") {
            savePortalChat(); // after the reply lands — save the full exchange
            // keep the header's Chats count in sync without re-rendering the section
            // (M3: the toggle label is static; the count lives in the list header)
            const cb = document.querySelector('[data-action="chats-page"]');
            if (cb && !state.chatsOpen)
                cb.innerHTML = `<i class="ph ph-list text-sm"></i>Saved chats`;
        }
        patchInputRow(chat); // Send is back (O2: Stop exists only while pending)
        patchChat(chat);
        // The story's act drives the dashboard from either surface (L4 —
        // the portal IS a dashboard section); intent gotos stay drawer-only
        // (E4/E6). Assistant-driven switches reuse the nav path, so they
        // animate the same way (open question 3).
        if (a.goto && state.view === "dashboard" && (a.act || chat === "drawer")) {
            showDashSection(a.goto.section);
            revealDashPanel(a.goto.panel);
            if (a.act && chat === "drawer") setAssistantDrawer(false); // hand-off: the product takes over
        }
    }, AI_THINK_MS);
}

function drawerSummarize() {
    if (state.aiTyping === "drawer") return;
    if (!state.aiDrawerContext) {
        state.aiDrawerContext = ["plans", "demographics", "outcomes", "share"].includes(state.dashSection) ? state.dashSection : null;
    }
    startThinking("drawer");
    patchInputRow("drawer");
    patchChat("drawer");
    setTimeout(() => {
        stopThinking();
        state.aiDrawer.push({
            role: "assistant",
            text: drawerSummaryText(state.aiDrawerContext),
            chart: "weekly",
            chips: ["Training completion", "Training performance"],
        });
        patchInputRow("drawer");
        patchChat("drawer");
    }, AI_THINK_MS);
}

function seedDrawerThread() {
    state.aiDrawerContext = ["plans", "demographics", "outcomes", "share"].includes(state.dashSection) ? state.dashSection : null;
    // E3: a panel context opens with that panel's takeaway, not the generic
    // section summary.
    if (state.aiDrawerPanel && state.aiDrawerPanelTakeaway) {
        state.aiDrawer.push({
            role: "assistant",
            text: `Looking at ${state.aiDrawerPanel}: ${state.aiDrawerPanelTakeaway}. Ask me for the slice behind that number — per market, per shift, or the teams behind it.`,
            chart: "markets",
            chips: ["Per-market breakdown", "Who is behind?"],
        });
        return;
    }
    state.aiDrawer.push({
        role: "assistant",
        text: drawerSummaryText(state.aiDrawerContext),
        chart: "weekly",
        chips: ["Training completion", "Training performance"],
    });
}

function finishRegistration() {
    state.registrationDone = true;
    state.view = "library";
    state.libraryEmerge = true; // the training list reveal — runs once
    state.regIndex = 0;
    render();
}

let lastRenderedView = null;
let dashSectionCache = new Map(); // P1: live section containers between dashboard visits
function render() {
    persistSession(); // every render is a state-change boundary (SPEC I2)
    const viewChanged = state.view !== lastRenderedView;
    // P1: leaving the dashboard — stash its live section containers so the
    // next dashboard render re-attaches them and the chart roots survive
    // the whole session (R2). Same-view re-renders keep the DOM anyway.
    if (lastRenderedView === "dashboard" && state.view !== "dashboard") {
        const content = document.getElementById("dash-content");
        dashSectionCache = new Map();
        if (content) {
            content.querySelectorAll("[data-dash-sec]").forEach((el) => dashSectionCache.set(el.dataset.dashSec, el));
        }
    }
    if (state.view === "library") renderLibrary();
    else if (state.view === "language") renderLanguage();
    else if (state.view === "registration") renderRegistration();
    else if (state.view === "dashboard") renderDashboard();
    else if (state.view === "ds") renderDSView();
    else if (state.view === "lesson") renderLesson();
    else if (state.view === "profile") renderProfile();
    else if (state.view === "settings") renderSettings();
    // O4: fill any fresh chart hosts after the render — dashboard only, so
    // non-dashboard views never trigger the lazy charts import (P3).
    if (state.view === "dashboard") mountChatCharts();
    // F1: fade/slide the view in — only on genuine view switches; re-renders
    // of the same view (menu toggles, drawer) never replay the transition.
    if (viewChanged) {
        // T4: a navigation always dismisses the account menu — a menu that
        // survives into the next view is a stale popover.
        state.menuOpen = false;
        state.supportOpen = false; // the FAB/panel are per-view (lesson only)
        state.lessonExitAsk = false;
        const root = document.getElementById("app") && document.getElementById("app").firstElementChild;
        if (root) root.classList.add("view-enter");
    }
    lastRenderedView = state.view;

    // Browser tab title — the lesson page names its course; the dashboard is standalone.
    const lesson = LESSONS.find((l) => l.id === state.currentLesson);
    document.title = state.view === "lesson" && lesson
        ? `${lesson.title} — ${lesson.subtitle} | Teachr`
        : state.view === "library"
            ? "Training library | Teachr"
            : state.view === "profile"
                ? "My details | Teachr"
                : state.view === "ds"
                    ? "Design system | Teachr"
                    : state.view === "dashboard"
                        ? "Dashboard | Teachr"
                        : "Course 01: Internal Security | Teachr";

    // P2: scroll ownership — only a genuine view switch starts at the top;
    // same-view re-renders (menu, drawer, chat) keep every scroll position.
    if (viewChanged) {
        document.querySelectorAll(".scroll-area").forEach((el) => { el.scrollTop = 0; });
    }
}

/* Boot — which experience this tab runs is decided by the URL: the dashboard
 * is the landing view; the library (opened by Start training) boots into the
 * registration gate on first entry, straight to the list afterwards. */
document.addEventListener("DOMContentLoaded", () => {
    bindLessonResize();
    state.tab = new URLSearchParams(location.search).get("view") === "library"
        ? "library" : "dashboard";
    restoreSession();
    // Training plans are seeded fresh on every boot (M3) — the dataset is
    // the single source; the plan views never mutate it directly.
    state.plans = JSON.parse(JSON.stringify(PLANS));
    state.settingsReturn = state.tab === "library" ? "library" : "dashboard";
    if (state.tab === "library") {
        state.view = state.registrationDone ? "library" : "language";
    }
    // Deep-link affordances for review/probes: ?section=<id> picks the
    // dashboard section, ?drawer=1 opens the assistant drawer on boot.
    const q = new URLSearchParams(location.search);
    const sec = q.get("section");
    if (state.tab === "dashboard" && sec &&
        (DASH_SECTIONS.some((s) => s.id === sec) || sec === DS_SECTION_ID))
        state.dashSection = sec;
    if (state.tab === "dashboard" && q.get("drawer") === "1")
        state.assistantDrawer = true;
    render();
});

/* Deadline editing (M4): the date input's change event, not a click.
 * N2: surgical — the detail's deadline label and the list row patch in
 * place; the section (and its chart-free DOM) is never rebuilt. */
document.addEventListener("change", (e) => {
    const el = e.target.closest('[data-action="plan-deadline"]');
    if (!el || !el.value) return;
    const p = state.plans.find((x) => x.id === el.dataset.plan);
    if (!p) return;
    p.deadline = el.value;
    const dl = deadlineState(p);
    const label = el.closest(".rounded-xl")?.querySelector("span.text-xs");
    if (label) { label.textContent = dl.label; label.className = `text-xs font-medium ${dl.cls}`; }
    const listRow = document.querySelector(`[data-action="plan-open"][data-plan="${p.id}"] span.text-xs.font-medium`);
    if (listRow) { listRow.textContent = dl.label; listRow.className = `text-xs font-medium ${dl.cls} shrink-0`; }
});

document.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");    // Clicking anywhere outside the account menu closes it.
    if (state.menuOpen && !(target && target.closest(".user-menu-root"))) {
        state.menuOpen = false;
        // Surgical patch - same rule as the toggle: never rebuild the shell (and its charts) to close a dropdown.
        patchUserMenuHost();
    }
    // Clicking anywhere outside the drawer options menu closes it (M7: node patch).
    if (state.aiDrawerMenu && !(target && target.closest(".ai-drawer-menu-root"))) {
        setDrawerMenu(false);
    }
    if (!target) return;
    const action = target.dataset.action;

    if (action === "toggle-user-menu") {
        state.menuOpen = !state.menuOpen;
        // Surgical patch: swap only the menu host, never the shell —
        // a full render() here remounts every chart on the dashboard.
        patchUserMenuHost();
    } else if (action === "pick-lang") {
        state.language = target.dataset.lang;
        persistSession();
        renderLanguage();
    } else if (action === "lang-continue") {
        // Language is the first step of the training experience — continue
        // into the registration questionnaire, not the library list.
        state.view = "registration";
        state.regIndex = 0;
        state.countryFilter = undefined;
        render();
    } else if (action === "reg-back") {
        if (state.profileEdit) {
            // T4/B5: editing one field — back to what opened the edit: the
            // details page (settings) or the review step (the confirm-details Edit).
            const returnTo = state.profileEdit.returnTo || "profile";
            state.profileEdit = null;
            if (returnTo === "review") {
                state.regIndex = REG_STEPS.findIndex((s) => s.type === "review");
            } else {
                state.regIndex = 0;
                state.view = "profile";
            }
            render();
        } else if (state.regIndex > 0) {
            state.regIndex--;
            state.countryFilter = undefined;
            render();
        } else {
            // Registration is step 2; back goes to the training flow's
            // step 1 (language), not the dashboard.
            state.view = "language";
            render();
        }
    } else if (action === "reg-edit") {
        // R8 B5 (reviewer pass 2): the review rows carry the shared single-pen
        // affordance (data-step) — the edit enters the T4 editing view with
        // returnTo the review; the settings' profile-edit rows share the
        // element, so the two lists cannot drift.
        state.profileEdit = { returnTo: "review" };
        state.regIndex = REG_STEPS.findIndex((s) => s.id === target.dataset.step);
        state.countryFilter = undefined;
        state.view = "registration";
        render();
    } else if (action === "pick-option") {
        const step = REG_STEPS[state.regIndex];
        state.answers[step.id] = step.options[Number(target.dataset.index)].label;
        if (state.profileEdit) {
            // T4/B5: a pick commits and returns to what opened the edit —
            // the details page, or (B5) straight back to the review.
            const returnTo = state.profileEdit.returnTo || "profile";
            state.profileEdit = null;
            if (returnTo === "review") {
                state.regIndex = REG_STEPS.findIndex((s) => s.type === "review");
            } else {
                state.regIndex = 0;
                state.view = "profile";
            }
            render();
        } else if (state.regIndex < REG_STEPS.length - 1) {
            // Selecting an option commits it and advances instantly — the
            // Continue footer only exists on the input and review steps.
            state.regIndex++;
            state.countryFilter = undefined;
            render();
        } else {
            finishRegistration();
        }
    } else if (action === "reg-continue") {
        if (state.profileEdit) {
            // T4/B5: a text step's commit — same returnTo routing as the pick.
            const returnTo = state.profileEdit.returnTo || "profile";
            state.profileEdit = null;
            if (returnTo === "review") {
                state.regIndex = REG_STEPS.findIndex((s) => s.type === "review");
            } else {
                state.regIndex = 0;
                state.view = "profile";
            }
            render();
        } else if (state.regIndex < REG_STEPS.length - 1) {
            state.regIndex++;
            state.countryFilter = undefined;
            render();
        } else {
            finishRegistration();
        }
    } else if (action === "open-lesson") {
        const lesson = LESSONS.find((l) => l.id === target.dataset.lesson);
        if (lesson.status === "locked") return;
        // Registration has gated this library entry — lessons open directly.
        // R8 B6: stash the courses list's page scroll — it survives the
        // round-trip.
        const sc = document.getElementById("library-scroll");
        libraryLaneScroll = sc ? sc.scrollTop : null;
        state.currentLesson = lesson.id;
        state.view = "lesson";
        slideH = null; // re-measure page height for this lesson
        render();
    } else if (action === "lesson-back") {
        if (state.planReturn) returnFromPlan();
        else openLessonExit(); // R7-11: confirm first — progress is saved
    } else if (action === "lesson-exit-cancel") {
        closeLessonExit(false);
    } else if (action === "lesson-exit-confirm") {
        closeLessonExit(true);
    } else if (action === "scroll-to-latest") {
        // R7 follow-up 13: the bar's Scroll-down click — one smooth ride
        // back to the latest content; the button reverts on arrival.
        const sc = document.getElementById("lesson-scroll");
        if (sc) scrollToY(sc.scrollHeight, true);
    } else if (action === "support-toggle") {
        toggleSupport();
    } else if (action === "support-ask") {
        supportAsk(target.dataset.q);
    } else if (action === "support-send") {
        const input = document.getElementById("support-input");
        const text = (input?.value || "").trim();
        if (text) { supportAsk(text); }
    } else if (action === "lesson-submit") {
        onLessonSubmit(Number(target.dataset.question));
    } else if (action === "lesson-continue") {
        onLessonContinue(Number(target.dataset.question));
    } else if (action === "lesson-video-continue") {
        // Round 6e: the video's gated Continue — mark the video advanced, then
        // reveal the NEXT page in the sequence (a question, or completion) and
        // glide to it smoothly.
        const lesson = LESSONS.find((l) => l.id === state.currentLesson);
        if (!lesson) return;
        const adv = state.videoAdvanced[lesson.id] = state.videoAdvanced[lesson.id] || {};
        const before = Number(target.dataset.before || 0);
        if (!videoEnded(lesson, videosOf(lesson).find((v) => v.before === before))) return;
        adv[before] = true;
        const nxt = revealNextPages(lesson);
        updateBar(lesson);
        updateProgress(lesson); // R8 B11 amendment: the faded bar moves with every passed step, videos included
        measureSlideH();
        // targetEl, not target: the listener's `target` const is in TDZ inside
        // this block (an earlier line reads it) — shadowing it breaks the TDZ.
        const targetEl = nxt.type === "video" ? document.getElementById(`lesson-video-${nxt.cur.video.before}`)
            : nxt.type === "q" ? document.querySelector(`.lesson-q[data-question="${nxt.cur.qIndex}"]`)
            : document.getElementById("lesson-complete");
        showPage(targetEl, true); // smooth scroll from the video (round 6e)
    } else if (action === "video-toggle") {
        const lesson = LESSONS.find((l) => l.id === state.currentLesson);
        const video = lesson && videosOf(lesson).find((v) => v.before === Number(target.dataset.video));
        if (lesson && video) videoToggle(lesson, video);
    } else if (action === "video-seek") {
        const lesson = LESSONS.find((l) => l.id === state.currentLesson);
        const video = lesson && videosOf(lesson).find((v) => v.before === Number(target.dataset.video));
        if (lesson && video) videoSeek(lesson, video, e.clientX);
    } else if (action === "lesson-finish") {
        if (state.planReturn) returnFromPlan();
        else { state.view = "library"; render(); }
    } else if (action === "plan-open") {
        state.planDetailId = target.dataset.plan;
        patchPlans();
    } else if (action === "plan-back") {
        state.planDetailId = null;
        state.planPicking = false;
        state.planPicks = [];
        patchPlans();
    } else if (action === "plan-toggle-req") {
        const c = planCourse(target.dataset.plan, target.dataset.course);
        if (c && courseDone(c) !== 100) c.required = !c.required;
        patchPlans();
    } else if (action === "plan-remove-course") {
        const p = state.plans.find((x) => x.id === target.dataset.plan);
        if (p) p.courses = p.courses.filter((c) => c.lesson !== target.dataset.course);
        patchPlans();
    } else if (action === "plan-picker") {
        state.planPicking = true;
        state.planPicks = [];
        patchPlans();
    } else if (action === "plan-pick") {
        // N2: surgical — the row's check state and the Save button's count
        // patch in place; the section (and any chart roots) is untouched.
        const id = target.dataset.lesson;
        state.planPicks = state.planPicks.includes(id)
            ? state.planPicks.filter((x) => x !== id)
            : [...state.planPicks, id];
        const picked = state.planPicks.includes(id);
        const icon = target.querySelector("i");
        if (icon) icon.className = `ph ${picked ? "ph-fill ph-check-circle text-gray-900" : "ph-circle text-gray-300"} text-xl shrink-0`;
        target.className = `w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors
               ${picked ? "border-gray-900 bg-gray-100" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`;
        const save = document.querySelector('[data-action="plan-save"]');
        if (save) {
            save.textContent = `Add ${state.planPicks.length || ""} course${state.planPicks.length === 1 ? "" : "s"}`;
            save.disabled = !state.planPicks.length;
        }
    } else if (action === "plan-save") {
        const p = state.plans.find((x) => x.id === state.planDetailId);
        if (p) for (const id of state.planPicks) {
            if (!p.courses.some((c) => c.lesson === id)) p.courses.push({ lesson: id, required: true, done: 0 });
        }
        state.planPicking = false;
        state.planPicks = [];
        patchPlans();
    } else if (action === "plan-course-open") {
        // M5: a plan's course opens through the normal lesson flow; finishing
        // it returns to the plan detail with updated progress.
        const lesson = LESSONS.find((l) => l.id === target.dataset.lesson);
        if (!lesson || lesson.status === "locked") return;
        state.planReturn = state.planDetailId;
        state.currentLesson = lesson.id;
        state.view = "lesson";
        slideH = null;
        render();
    } else if (action === "start-training") {
        // The library is a separate experience — it opens in its own tab and
        // the dashboard stays where it is (SPEC I1).
        window.open("index.html?view=library", "_blank");
    } else if (action === "share-pick") {
        // Multi-select: toggling a lesson adds or removes it from the share.
        const id = target.dataset.lesson;
        const sel = state.shareSelection;
        state.shareSelection = sel.includes(id) ? sel.filter((l) => l !== id) : [...sel, id];
        patchSharePanel();
    } else if (action === "share-channel") {
        state.shareChannel = target.dataset.channel;
        // M13: picking a channel IS the share — no separate send step. The
        // link channel performs the copy immediately; the confirmation
        // dialogue auto-closes after 2.5s.
        if (target.dataset.channel === "link" && state.shareSelection.length) {
            const first = (LESSONS.find((l) => l.id === state.shareSelection[0]) || {}).subtitle || "";
            navigator.clipboard && navigator.clipboard.writeText(`https://teachr.example/s/${state.shareSelection.join(",")}`).catch(() => {});
        }
        state.shareDone = true;
        patchSharePanel();
        clearTimeout(state.shareDoneTimer);
        state.shareDoneTimer = setTimeout(() => { state.shareDone = false; patchSharePanel(); }, 2500);
    } else if (action === "share-reset") {
        state.shareDone = false;
        state.shareChannel = null;
        patchSharePanel();
    } else if (action === "dash-logo") {
        // The logomark is the keyboard/touch expand control for the collapsed
        // rail; while expanded it's just the logo — no action.
        if (!state.dashCollapsed) return;
        toggleDashSidebar();
    } else if (action === "dash-collapse") {
        toggleDashSidebar();
    } else if (action === "dash-nav") {
        // Patch sidebar + content in place — no full re-render, no chart remounts.
        showDashSection(target.dataset.section);
        setMobileNav(false); // picking from the mobile drawer closes it
    } else if (action === "dash-mobile-nav") {
        setMobileNav(true);
    } else if (action === "mobile-nav-close") {
        setMobileNav(false);
    } else if (action === "dash-back") {
        state.dashSection = "share";
        const slot = document.getElementById("dash-sidebar-slot");
        if (slot) slot.outerHTML = dashSidebarHTML();
        patchDashContent();
    } else if (action === "open-settings") {
        state.settingsReturn = state.view;
        state.settingsPage = null;
        state.view = "settings";
        render();
    } else if (action === "settings-back") {
        state.view = state.settingsReturn;
        state.settingsPage = null;
        render();
    } else if (action === "settings-sub-back") {
        state.settingsPage = null;
        render();
    } else if (action === "profile-open") {
        // T4: My details — remember where we came from (menu lives everywhere).
        if (state.view !== "profile") state.profileReturn = state.view;
        state.view = "profile";
        render();
    } else if (action === "profile-back") {
        state.view = state.profileReturn || "library";
        state.profileReturn = null;
        render();
    } else if (action === "profile-edit") {
        // T4: jump into that single registration step, pre-filled; the
        // step's own commit path routes back to the details page.
        const idx = REG_STEPS.findIndex((s) => s.id === target.dataset.step);
        if (idx === -1) return;
        state.profileEdit = { returnTo: "profile" };
        state.regIndex = idx;
        state.countryFilter = undefined;
        state.view = "registration";
        render();
    } else if (action === "ds-back") {
        state.view = "settings";
        state.settingsPage = null;
        render();
    } else if (action === "settings-open") {
        if (target.dataset.page === "profile") {
            state.profileReturn = "settings";
            state.settingsPage = null;
            state.view = "profile";
        } else if (target.dataset.page === "demographics" || target.dataset.page === "ds") {
            // DS5: rail shortcuts from Settings — Dashboard and Design system
            // open the dashboard on that section. R7-13: from the training
            // experience the DS opens as its own view in this tab instead —
            // the training tab never jumps into the dashboard.
            if (target.dataset.page === "ds" && state.tab === "library") {
                state.view = "ds";
            } else {
                state.view = "dashboard";
                state.dashSection = target.dataset.page === "ds" ? "ds" : "demographics";
            }
        } else {
            state.settingsPage = target.dataset.page;
            if (state.view !== "settings") state.settingsReturn = state.view;
            state.view = "settings";
        }
        render();
    } else if (action === "ai-drawer") {
        // J6: the drawer opens empty (the portal's empty state), like the
        // assistant landing page — the conversation starts on a question.
        setAssistantDrawer(!state.assistantDrawer);
    } else if (action === "ai-drawer-menu") {
        setDrawerMenu(!state.aiDrawerMenu);
    } else if (action === "ai-settings") {
        setDrawerSettings(!state.aiSettingsOpen);
    } else if (action === "ai-setting") {
        state.aiSettings[target.dataset.key] = !state.aiSettings[target.dataset.key];
        patchDrawerSettings(); // panel node only — thread untouched
    } else if (action === "ai-setting-len") {
        state.aiSettings.length = target.dataset.v;
        patchDrawerSettings(); // panel node only — thread untouched
    } else if (action === "ai-edit") {
        const list = target.dataset.chat === "drawer" ? state.aiDrawer : state.aiLanding;
        const m = list[Number(target.dataset.i)];
        const input = document.getElementById(target.dataset.chat === "drawer" ? "ai-drawer-input" : "ai-landing-input");
        if (m && input) { input.value = m.text; input.focus(); }
    } else if (action === "ai-redo") {
        const chat = target.dataset.chat;
        const list = target.dataset.chat === "drawer" ? state.aiDrawer : state.aiLanding;
        // Drop everything after the user message being redone, then re-answer.
        let i = Number(target.dataset.i);
        while (i >= 0 && list[i].role !== "user") i--;
        if (i >= 0) {
            const q = list[i].text;
            list.length = i + 1; // keep the user message — the reply regenerates under it
            startThinking(chat);
            // N8 parity: the redo's pending reply is cancellable via Stop,
            // same timer + guard as aiSend.
            state.aiTypingTimer = setTimeout(() => {
                if (state.aiTyping !== chat) return; // stopped while pending
                stopThinking();
                const a = aiAnswerFor(q);
                list.push({
                    role: "assistant",
                    text: a.text, // M9: clean rotation — no "updated view" prefix
                    chart: a.chart,
                    chips: a.chips,
                });
                patchInputRow(chat); // Send is back the moment the ask lands (O2)
                patchChat(chat);
            }, AI_THINK_MS);
            patchInputRow(chat); // Stop → Send the moment the ask goes in (O2)
        }
    } else if (action === "ai-copy") {
        const list = target.dataset.chat === "drawer" ? state.aiDrawer : state.aiLanding;
        const m = list[Number(target.dataset.i)];
        if (m && navigator.clipboard) navigator.clipboard.writeText(m.text).catch(() => {});
        // M9: transient confirmation — the button itself flips to a check,
        // no redraw (inner patch, back after 1.2s).
        if (target.dataset.copyPending !== "1") {
            target.dataset.copyPending = "1";
            const icon = target.querySelector("i");
            target.innerHTML = '<i class="ph-fill ph-check text-xs"></i>';
            target.title = "Copied";
            setTimeout(() => {
                delete target.dataset.copyPending;
                target.innerHTML = '<i class="ph ph-copy text-xs"></i>';
                target.title = "Copy";
            }, 1200);
        }
    } else if (action === "ai-context-clear") {
        state.aiDrawerContext = null;
        state.aiDrawerPanel = null;
        const d = document.getElementById("ai-drawer");
        if (d) d.outerHTML = aiDrawerHTML(); // the chip row lives in the drawer chrome
        patchChat("drawer");
    } else if (action === "diagram-context") {
        // R4-6: clicking a diagram card adds it as the drawer's context chip
        // (the E3 panel-ask pattern, one level up). Opens the drawer if closed.
        state.aiDrawerPanel = null;
        state.aiDrawerPanelTakeaway = null;
        state.aiDrawerContext = target.dataset.title || "Diagram";
        if (!state.assistantDrawer) setAssistantDrawer(true);
        else {
            const d = document.getElementById("ai-drawer");
            if (d) d.outerHTML = aiDrawerHTML();
        }
        patchChat("drawer");
    } else if (action === "chats-page") {
        // N10 revision: the chats list is embedded in the portal container —
        // toggle thread/list in place, no view switch, no shell re-render.
        state.chatsOpen = !state.chatsOpen;
        patchAssistant();
    } else if (action === "chat-open") {
        // N10 revision: resume a saved chat in the embedded list — thread
        // loaded verbatim, list closed, section patched in place; the story
        // pointer rides along so the narrative continues.
        const c = loadChats().find((x) => x.id === target.dataset.id);
        if (c) {
            state.chatId = c.id;
            state.aiLanding = (c.messages || []).map((m) => ({ ...m }));
            state.story.node = c.story || null;
        }
        state.chatsOpen = false;
        patchAssistant();
    } else if (action === "chat-delete") {
        const remaining = loadChats().filter((x) => x.id !== target.dataset.id);
        try { localStorage.setItem(CHATS_KEY, JSON.stringify(remaining)); } catch {}
        if (state.chatId === target.dataset.id) state.chatId = null;
        patchAssistant();
    } else if (action === "ai-stop") {
        // N8: cancel the pending reply — the typing clears, the input
        // re-enables, and the reply's guard in aiSend keeps it from landing.
        clearTimeout(state.aiTypingTimer);
        stopThinking();
        patchInputRow(target.dataset.chat || "landing"); // Send is back (O2)
        patchChat(target.dataset.chat || "landing");
    } else if (action === "ai-new") {
        // New chat archives the loaded thread (already persisted on every
        // exchange — this only resets the pointer) and leaves the empty
        // state (J6); Summarize (drawerSummarize) is the explicit way to
        // get the section summary in the drawer.
        if (target.dataset.chat === "drawer") { state.aiDrawer = []; patchChat("drawer"); }
        // A new portal conversation starts clean: chapter 0 (empty state +
        // prompt options); the story restarts broad on the first prompt.
        // M14: from the saved-chats list the thread element doesn't exist —
        // close the list and re-render the section so the fresh thread shows.
        else {
            state.aiLanding = []; state.chatId = null; state.story.node = null;
            state.chatsOpen = false;
            patchAssistant();
        }
    } else if (action === "ai-send") {
        const input = document.getElementById(target.dataset.chat === "drawer" ? "ai-drawer-input" : "ai-landing-input");
        const q = input ? input.value.trim() : "";
        if (q) {
            input.value = "";
            aiSend(target.dataset.chat, q);
        }
    } else if (action === "ai-suggest" || action === "ai-quick") {
        const chat = target.dataset.chat || (action === "ai-suggest" ? "landing" : "drawer");
        aiSend(chat, target.dataset.q || "");
    } else if (action === "ai-summarize") {
        drawerSummarize();
    } else if (action === "settings-lang") {
        state.language = target.dataset.lang;
        render();
    } else if (action === "reg-reset") {
        // M12: redo the registration — clears the gate and lands on the
        // language step. The registration flow lives in the library tab, so
        // the tab switches too.
        state.registrationDone = false;
        state.regIndex = 0;
        state.libraryEmerge = false;
        state.lessonVideoDone = {}; // a fresh learner watches the video again
        state.tab = "library";
        persistSession();
        state.view = "language";
        render();
    } else if (action === "logout") {
        const tab = state.tab;
        resetState();
        state.tab = tab;
        // Fresh session: the dashboard tab lands on the dashboard; the
        // library tab re-runs the registration gate.
        state.view = tab === "library" ? "language" : "dashboard";
        state.settingsReturn = state.view;
        render();
    }
});


/* C3: hovering or focusing a legend swatch dims the other series' bars in
 * the sibling chart — opacity fade on the SVG nodes, no re-render.
 * Colour matching is format-agnostic: Nivo paints fills as rgba(), the
 * legends carry hex — both normalize through a computed rgb() string. */
const normColorCache = new Map();
function normColor(c) {
    if (!normColorCache.has(c)) {
        const probe = document.createElement("span");
        probe.style.color = c;
        document.body.appendChild(probe);
        normColorCache.set(c, getComputedStyle(probe).color);
        probe.remove();
    }
    return normColorCache.get(c);
}
/* P8: dims coalesce to one rAF — rapid legend swatch hovers cost one pass
 * per frame, not one querySelectorAll + style pass per event. The cached
 * node list is dropped as soon as the chart's svg was replaced (React
 * re-render), detected via the sentinel's isConnected. */
const dimNodesCache = new WeakMap();
let dimRAF = 0;
let dimQueued = null;
function dimChartSeries(chartEl, keep) {
    dimQueued = [chartEl, keep];
    if (dimRAF) return;
    dimRAF = requestAnimationFrame(() => {
        dimRAF = 0;
        const [el, k] = dimQueued;
        dimQueued = null;
        let nodes = dimNodesCache.get(el);
        if (!nodes || !nodes.length || !nodes[0].isConnected) {
            nodes = [...el.querySelectorAll("svg rect, svg path")];
            dimNodesCache.set(el, nodes);
        }
        const keepRgb = k ? normColor(k) : null;
        for (const node of nodes) {
            const fill = node.getAttribute("fill");
            if (!fill || fill === "transparent") continue;
            node.style.opacity = keepRgb && normColor(fill) !== keepRgb ? 0.25 : "";
        }
    });
}
function legendChartEl(item) {
    const legend = item.closest(".chart-legend");
    return legend ? legend.previousElementSibling : null;
}
document.addEventListener("mouseover", (e) => {
    const item = e.target.closest("[data-series]");
    if (item) dimChartSeries(legendChartEl(item), item.dataset.series);
});
document.addEventListener("mouseout", (e) => {
    const item = e.target.closest("[data-series]");
    if (item && !(e.relatedTarget && item.contains(e.relatedTarget)))
        dimChartSeries(legendChartEl(item), null);
});
document.addEventListener("focusin", (e) => {
    const item = e.target.closest("[data-series]");
    if (item) dimChartSeries(legendChartEl(item), item.dataset.series);
});
document.addEventListener("focusout", (e) => {
    const item = e.target.closest("[data-series]");
    if (item) dimChartSeries(legendChartEl(item), null);
});

/* R4-6: diagram cards are role=button — Enter/Space activates them too. */
document.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches?.('[data-action="diagram-context"]')) {
        e.preventDefault();
        e.target.click();
    }
});

/* Enter presses the primary action of the current view (Continue / Submit). */
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.mobileNav) {
        setMobileNav(false);
        return;
    }
    if (e.key !== "Enter") return;
    // The assistant chat inputs send on Enter.
    if (e.target.id === "ai-landing-input" || e.target.id === "ai-drawer-input") {
        e.preventDefault();
        const chat = e.target.id === "ai-drawer-input" ? "drawer" : "landing";
        const q = e.target.value.trim();
        e.target.value = "";
        aiSend(chat, q);
        return;
    }
    for (const action of ["lang-continue", "reg-continue", "lesson-submit", "lesson-continue", "lesson-video-continue"]) {
        const btn = document.querySelector(`[data-action="${action}"]`);
        if (btn && !btn.disabled) {
            e.preventDefault();
            btn.click();
            return;
        }
    }
});

/* Escape closes the account menu and returns focus to the profile button
 * (M2: the popover is dismissed without a click, focus never strands). */
document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !state.menuOpen) return;
    state.menuOpen = false;
    patchUserMenuHost();
    const btn = document.querySelector('[data-action="toggle-user-menu"]');
    if (btn) btn.focus();
});

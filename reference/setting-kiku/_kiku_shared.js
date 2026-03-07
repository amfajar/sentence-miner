import { A as Suspense, B as createUniqueId, D as For, E as ErrorBoundary, F as createEffect, G as onMount, H as lazy, I as createMemo, J as useContext, K as runWithOwner, M as createComponent, N as createComputed, O as Match, P as createContext, R as createResource, V as getOwner, W as onCleanup, a as h, c as Portal, h as isServer, j as Switch, k as Show, o as createStore, q as untrack, s as unwrap, z as createSignal } from "./_kiku_libs.js";

//#region src/types.ts
const ankiFieldsSkeleton = {
	"Expression": "",
	"ExpressionFurigana": "",
	"ExpressionReading": "",
	"ExpressionAudio": "",
	"SelectionText": "",
	"MainDefinition": "",
	"DefinitionPicture": "",
	"Sentence": "",
	"SentenceFurigana": "",
	"SentenceAudio": "",
	"Picture": "",
	"Glossary": "",
	"Hint": "",
	"IsWordAndSentenceCard": "",
	"IsClickCard": "",
	"IsSentenceCard": "",
	"IsAudioCard": "",
	"PitchPosition": "",
	"PitchCategories": "",
	"Frequency": "",
	"FreqSort": "",
	"MiscInfo": "",
	"Tags": "",
	"CardID": "",
	"furigana:ExpressionFurigana": "",
	"kana:ExpressionFurigana": "",
	"furigana:Sentence": "",
	"kanji:Sentence": "",
	"furigana:SentenceFurigana": "",
	"kana:SentenceFurigana": ""
};

//#endregion
//#region src/components/shared/CardContext.tsx
var CardStoreContext = createContext();
function CardStoreContextProvider(props) {
	const [$card, $setCard] = createStore({
		side: props.side,
		page: "main",
		ready: false,
		expressionReady: false,
		isNsfw: false,
		uniqueId: createUniqueId(),
		expressionAudioRef: void 0,
		sentenceFieldRef: void 0,
		sentenceAudioRef: void 0,
		sentenceAudios: void 0,
		pictureModal: void 0,
		query: {
			status: "loading",
			sameReading: void 0,
			sameExpression: void 0,
			noteList: []
		},
		focus: {
			kanji: void 0,
			noteId: void 0
		},
		navigateBack: [],
		nested: props.nested ?? false,
		nestedAnkiFields: ankiFieldsSkeleton,
		nestedNoteId: void 0,
		nestedIsMergePreview: false,
		isMergePreview: props.isMergePreview ?? false
	});
	return createComponent(CardStoreContext.Provider, {
		value: [$card, $setCard],
		get children() {
			return props.children;
		}
	});
}
function useCardContext() {
	const cardStore = useContext(CardStoreContext);
	if (!cardStore) throw new Error("Missing CardStoreContext");
	return cardStore;
}

//#endregion
//#region src/util/general.ts
const env = {
	KIKU_VERSION: "1.7.0",
	KIKU_NOTE_TYPE: "Kiku",
	KIKU_CARD_TYPE: "Mining",
	KIKU_CONFIG_FILE: "_kiku_config.json",
	KIKU_CONFIG_SESSION_STORAGE_KEY: "kiku-config",
	KIKU_IS_THEME_CHANGED_SESSION_STORAGE_KEY: "kiku-is-theme-changed",
	KIKU_FRONT_FILE: "_kiku_front.html",
	KIKU_BACK_FILE: "_kiku_back.html",
	KIKU_STYLE_FILE: "_kiku_style.css",
	KIKU_NOTES_MANIFEST: "_kiku_notes_manifest.json",
	KIKU_DB_MAIN_TAR: "_kiku_db_main.tar",
	KIKU_DB_MAIN_MANIFEST_JSON: "_kiku_db_main_manifest.json",
	KIKU_DB_KANJI_COMPACT: "kiku_db_kanji_compact.json.gz",
	KIKU_PLUGIN_MODULE: "_kiku_plugin.js",
	KIKU_IMPORTANT_FILES: [
		"_kiku.js",
		"_kiku_libs.js",
		"_kiku_shared.js",
		"_kiku_lazy.js",
		"_kiku_worker.js",
		"_kiku_plugin.js",
		"_kiku_plugin.css",
		"_kiku_front.html",
		"_kiku_back.html",
		"_kiku_style.css",
		"_kiku.css",
		"_kiku_font_hina-mincho.woff2",
		"_kiku_font_ibm-plex-sans-jp.woff2",
		"_kiku_font_klee-one.woff2",
		"_kiku_db_main.tar",
		"_kiku_db_main_manifest.json"
	]
};
function extractKanji(str) {
	const matches = str.match(/[\u4E00-\u9FFF]/g);
	return matches ? Array.from(new Set(matches)) : [];
}
function getAnkiFields() {
	let divs = false ? void 0 : document.querySelectorAll("#anki-fields > div");
	return divs ? Object.fromEntries(Array.from(divs).map((el) => [el.dataset.field, el.innerHTML.trim()])) : ankiFieldsSkeleton;
}
function isHtmlEffectivelyEmpty(html) {
	if (!html || html.trim() === "") return true;
	const doc = new DOMParser().parseFromString(html, "text/html");
	doc.querySelectorAll("script, style, template").forEach((el) => {
		el.remove();
	});
	const text = doc.body.textContent?.replace(/\u00a0/g, "").trim();
	if (text && text.length > 0) return false;
	return ![
		"img",
		"video",
		"audio",
		"svg",
		"iframe",
		"canvas"
	].some((sel) => doc.body.querySelector(sel));
}
function parseHtml(html) {
	return new DOMParser().parseFromString(html, "text/html");
}
function nodesToString(nodes) {
	return nodes.map((node) => {
		if (node.nodeType === Node.ELEMENT_NODE) return node.outerHTML;
		return node.textContent ?? "";
	}).join("");
}
function unique(arr) {
	return Array.from(new Set(arr));
}

//#endregion
//#region src/components/shared/AnkiFieldsContext.tsx
var AnkiFieldsContext = createContext();
function AnkiFieldContextProvider(props) {
	const ankiFields = props.ankiFields ?? getAnkiFields();
	return createComponent(AnkiFieldsContext.Provider, {
		get value() {
			return {
				ankiFields,
				noteId: props.noteId
			};
		},
		get children() {
			return props.children;
		}
	});
}
function useAnkiFieldContext() {
	const ankiField = useContext(AnkiFieldsContext);
	if (!ankiField) throw new Error("Missing AnkiFieldContext");
	return ankiField;
}

//#endregion
//#region src/components/shared/BreakpointContext.tsx
var breakpoints = {
	base: 0,
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	"2xl": 1536
};
var order = [
	"base",
	"sm",
	"md",
	"lg",
	"xl",
	"2xl"
];
function getBreakpoint(width) {
	if (width < breakpoints.sm) return "base";
	if (width < breakpoints.md) return "sm";
	if (width < breakpoints.lg) return "md";
	if (width < breakpoints.xl) return "lg";
	if (width < breakpoints["2xl"]) return "xl";
	return "2xl";
}
function createBreakpoint() {
	const [breakpoint, setBreakpoint] = createSignal("base");
	const update = () => {
		const value = breakpoint();
		const newValue = getBreakpoint(window.innerWidth);
		if (value !== newValue) setBreakpoint(newValue);
	};
	onMount(() => {
		setBreakpoint(getBreakpoint(window.innerWidth));
		window.addEventListener("resize", update);
		onCleanup(() => {
			window.removeEventListener("resize", update);
		});
	});
	const isAtLeast = (bp) => order.indexOf(breakpoint()) >= order.indexOf(bp);
	return {
		breakpoint,
		isAtLeast
	};
}
var BreakpointContext = createContext();
function BreakpointContextProvider(props) {
	const { breakpoint, isAtLeast } = createBreakpoint();
	return createComponent(BreakpointContext.Provider, {
		value: {
			breakpoint,
			isAtLeast
		},
		get children() {
			return props.children;
		}
	});
}
function useBreakpointContext() {
	const breakpointSignal = useContext(BreakpointContext);
	if (!breakpointSignal) throw new Error("Missing BreakpointContext");
	return breakpointSignal;
}

//#endregion
//#region src/util/defaulConfig.ts
const defaultConfig = {
	theme: "light",
	webFontPrimary: "Klee One",
	systemFontPrimary: "'Inter', 'SF Pro Display', 'Liberation Sans', 'Segoe UI', 'Hiragino Kaku Gothic ProN', 'Noto Sans CJK JP', 'Noto Sans JP', 'Meiryo', HanaMinA, HanaMinB, sans-serif",
	useSystemFontPrimary: true,
	webFontSecondary: "IBM Plex Sans JP",
	systemFontSecondary: "'Hiragino Mincho ProN', 'Noto Serif CJK JP', 'Noto Serif JP', 'Yu Mincho', HanaMinA, HanaMinB, serif",
	useSystemFontSecondary: true,
	blurNsfw: true,
	muteNsfw: true,
	pictureOnFront: false,
	showTheme: true,
	showStartupTime: true,
	ankiConnectAddress: "http://127.0.0.1:8765",
	ankiDroidEnableIntegration: true,
	ankiDroidReverseSwipeDirection: false,
	volume: 100,
	swapSentenceAndDefinitionOnMobile: true,
	preferAnkiConnect: false,
	modHidden: false,
	modHiddenDuration: 2e3,
	modVertical: false,
	fontSizeBaseExpression: "5xl",
	fontSizeBasePitch: "xl",
	fontSizeBaseSentence: "2xl",
	fontSizeBaseMiscInfo: "sm",
	fontSizeBaseHint: "lg",
	fontSizeSmExpression: "6xl",
	fontSizeSmPitch: "2xl",
	fontSizeSmSentence: "4xl",
	fontSizeSmMiscInfo: "sm",
	fontSizeSmHint: "2xl",
	layoutMaxWidth: "4xl"
};

//#endregion
//#region src/util/fonts.ts
const webFonts = [
	"Hina Mincho",
	"Klee One",
	"IBM Plex Sans JP"
];

//#endregion
//#region src/util/theme.ts
const daisyUIThemes = [
	"light",
	"dark",
	"cupcake",
	"bumblebee",
	"emerald",
	"corporate",
	"synthwave",
	"retro",
	"cyberpunk",
	"valentine",
	"halloween",
	"garden",
	"forest",
	"aqua",
	"lofi",
	"pastel",
	"fantasy",
	"wireframe",
	"black",
	"luxury",
	"dracula",
	"cmyk",
	"autumn",
	"business",
	"acid",
	"lemonade",
	"night",
	"coffee",
	"winter",
	"dim",
	"nord",
	"sunset",
	"caramellatte",
	"abyss",
	"silk"
];
const colorBase100Map = {
	light: "oklch(100% 0 0)",
	dark: "oklch(25.33% .016 252.42)",
	cupcake: "oklch(97.788% .004 56.375)",
	bumblebee: "oklch(100% 0 0)",
	emerald: "oklch(100% 0 0)",
	corporate: "oklch(100% 0 0)",
	synthwave: "oklch(15% .09 281.288)",
	retro: "oklch(91.637% .034 90.515)",
	cyberpunk: "oklch(94.51% .179 104.32)",
	valentine: "oklch(97% .014 343.198)",
	halloween: "oklch(21% .006 56.043)",
	garden: "oklch(92.951% .002 17.197)",
	forest: "oklch(20.84% .008 17.911)",
	aqua: "oklch(37% .146 265.522)",
	lofi: "oklch(100% 0 0)",
	pastel: "oklch(100% 0 0)",
	fantasy: "oklch(100% 0 0)",
	wireframe: "oklch(100% 0 0)",
	black: "oklch(0% 0 0)",
	luxury: "oklch(14.076% .004 285.822)",
	dracula: "oklch(28.822% .022 277.508)",
	cmyk: "oklch(100% 0 0)",
	autumn: "oklch(95.814% 0 0)",
	business: "oklch(24.353% 0 0)",
	acid: "oklch(98% 0 0)",
	lemonade: "oklch(98.71% .02 123.72)",
	night: "oklch(20.768% .039 265.754)",
	coffee: "oklch(24% .023 329.708)",
	winter: "oklch(100% 0 0)",
	dim: "oklch(30.857% .023 264.149)",
	nord: "oklch(95.127% .007 260.731)",
	sunset: "oklch(22% .019 237.69)",
	caramellatte: "oklch(98% .016 73.684)",
	abyss: "oklch(20% .08 209)",
	silk: "oklch(97% .0035 67.78)"
};
function nextTheme() {
	const current = document.documentElement.getAttribute("data-theme");
	const index = daisyUIThemes.indexOf(current);
	return daisyUIThemes[(index + 1) % daisyUIThemes.length];
}

//#endregion
//#region src/util/config.ts
const tailwindSize = [
	"xs",
	"sm",
	"md",
	"lg",
	"xl",
	"2xl",
	"3xl",
	"4xl",
	"5xl",
	"6xl",
	"7xl",
	"8xl",
	"9xl"
];
const tailwindFontSizeVar = {
	xs: {
		fontSize: "var(--text-xs)",
		lineHeight: "var(--text-xs--line-height)"
	},
	sm: {
		fontSize: "var(--text-sm)",
		lineHeight: "var(--text-sm--line-height)"
	},
	md: {
		fontSize: "var(--text-base)",
		lineHeight: "var(--text-base--line-height)"
	},
	lg: {
		fontSize: "var(--text-lg)",
		lineHeight: "var(--text-lg--line-height)"
	},
	xl: {
		fontSize: "var(--text-xl)",
		lineHeight: "var(--text-xl--line-height)"
	},
	"2xl": {
		fontSize: "var(--text-2xl)",
		lineHeight: "var(--text-2xl--line-height)"
	},
	"3xl": {
		fontSize: "var(--text-3xl)",
		lineHeight: "var(--text-3xl--line-height)"
	},
	"4xl": {
		fontSize: "var(--text-4xl)",
		lineHeight: "var(--text-4xl--line-height)"
	},
	"5xl": {
		fontSize: "var(--text-5xl)",
		lineHeight: "var(--text-5xl--line-height)"
	},
	"6xl": {
		fontSize: "var(--text-6xl)",
		lineHeight: "var(--text-6xl--line-height)"
	},
	"7xl": {
		fontSize: "var(--text-7xl)",
		lineHeight: "var(--text-7xl--line-height)"
	},
	"8xl": {
		fontSize: "var(--text-8xl)",
		lineHeight: "var(--text-8xl--line-height)"
	},
	"9xl": {
		fontSize: "var(--text-9xl)",
		lineHeight: "var(--text-9xl--line-height)"
	}
};
const tailwindContainerSize = [
	"4xl",
	"5xl",
	"6xl",
	"7xl"
];
const tailwindContainerSizeVar = {
	"4xl": { maxWidth: "var(--container-4xl)" },
	"5xl": { maxWidth: "var(--container-5xl)" },
	"6xl": { maxWidth: "var(--container-6xl)" },
	"7xl": { maxWidth: "var(--container-7xl)" }
};
var rootDatasetArray = [
	"theme",
	"blurNsfw",
	"modVertical"
];
const rootDatasetConfigWhitelist = new Set(rootDatasetArray);
rootDatasetConfigWhitelist.forEach((key) => {
	if (!Object.keys(defaultConfig).includes(key)) throw new Error(`RootDataset key "${key}" is not in defaultConfig`);
});
function validateConfig(config) {
	try {
		KIKU_STATE.logger.info("Validating config:", config);
		if (typeof config !== "object" || config === null) throw new Error();
		return {
			theme: daisyUIThemes.includes(config.theme) ? config.theme : defaultConfig.theme,
			webFontPrimary: webFonts.includes(config.webFontPrimary) ? config.webFontPrimary : defaultConfig.webFontPrimary,
			systemFontPrimary: typeof config.systemFontPrimary === "string" ? config.systemFontPrimary : defaultConfig.systemFontPrimary,
			useSystemFontPrimary: typeof config.useSystemFontPrimary === "boolean" ? config.useSystemFontPrimary : defaultConfig.useSystemFontPrimary,
			webFontSecondary: webFonts.includes(config.webFontSecondary) ? config.webFontSecondary : defaultConfig.webFontSecondary,
			systemFontSecondary: typeof config.systemFontSecondary === "string" ? config.systemFontSecondary : defaultConfig.systemFontSecondary,
			useSystemFontSecondary: typeof config.useSystemFontSecondary === "boolean" ? config.useSystemFontSecondary : defaultConfig.useSystemFontSecondary,
			blurNsfw: typeof config.blurNsfw === "boolean" ? config.blurNsfw : defaultConfig.blurNsfw,
			muteNsfw: typeof config.muteNsfw === "boolean" ? config.muteNsfw : defaultConfig.muteNsfw,
			pictureOnFront: typeof config.pictureOnFront === "boolean" ? config.pictureOnFront : defaultConfig.pictureOnFront,
			showTheme: typeof config.showTheme === "boolean" ? config.showTheme : defaultConfig.showTheme,
			showStartupTime: typeof config.showStartupTime === "boolean" ? config.showStartupTime : defaultConfig.showStartupTime,
			ankiConnectAddress: typeof config.ankiConnectAddress === "string" ? config.ankiConnectAddress : defaultConfig.ankiConnectAddress,
			ankiDroidEnableIntegration: typeof config.ankiDroidEnableIntegration === "boolean" ? config.ankiDroidEnableIntegration : defaultConfig.ankiDroidEnableIntegration,
			ankiDroidReverseSwipeDirection: typeof config.ankiDroidReverseSwipeDirection === "boolean" ? config.ankiDroidReverseSwipeDirection : defaultConfig.ankiDroidReverseSwipeDirection,
			volume: typeof config.volume === "number" && config.volume >= 0 && config.volume <= 100 ? config.volume : defaultConfig.volume,
			swapSentenceAndDefinitionOnMobile: typeof config.swapSentenceAndDefinitionOnMobile === "boolean" ? config.swapSentenceAndDefinitionOnMobile : defaultConfig.swapSentenceAndDefinitionOnMobile,
			preferAnkiConnect: typeof config.preferAnkiConnect === "boolean" ? config.preferAnkiConnect : defaultConfig.preferAnkiConnect,
			modHidden: typeof config.modHidden === "boolean" ? config.modHidden : defaultConfig.modHidden,
			modHiddenDuration: typeof config.modHiddenDuration === "number" && config.modHiddenDuration > 0 ? config.modHiddenDuration : defaultConfig.modHiddenDuration,
			modVertical: typeof config.modVertical === "boolean" ? config.modVertical : defaultConfig.modVertical,
			fontSizeBaseExpression: tailwindSize.includes(config.fontSizeBaseExpression) ? config.fontSizeBaseExpression : defaultConfig.fontSizeBaseExpression,
			fontSizeBasePitch: tailwindSize.includes(config.fontSizeBasePitch) ? config.fontSizeBasePitch : defaultConfig.fontSizeBasePitch,
			fontSizeBaseSentence: tailwindSize.includes(config.fontSizeBaseSentence) ? config.fontSizeBaseSentence : defaultConfig.fontSizeBaseSentence,
			fontSizeBaseMiscInfo: tailwindSize.includes(config.fontSizeBaseMiscInfo) ? config.fontSizeBaseMiscInfo : defaultConfig.fontSizeBaseMiscInfo,
			fontSizeBaseHint: tailwindSize.includes(config.fontSizeBaseHint) ? config.fontSizeBaseHint : defaultConfig.fontSizeBaseHint,
			fontSizeSmExpression: tailwindSize.includes(config.fontSizeSmExpression) ? config.fontSizeSmExpression : defaultConfig.fontSizeSmExpression,
			fontSizeSmPitch: tailwindSize.includes(config.fontSizeSmPitch) ? config.fontSizeSmPitch : defaultConfig.fontSizeSmPitch,
			fontSizeSmSentence: tailwindSize.includes(config.fontSizeSmSentence) ? config.fontSizeSmSentence : defaultConfig.fontSizeSmSentence,
			fontSizeSmMiscInfo: tailwindSize.includes(config.fontSizeSmMiscInfo) ? config.fontSizeSmMiscInfo : defaultConfig.fontSizeSmMiscInfo,
			fontSizeSmHint: tailwindSize.includes(config.fontSizeSmHint) ? config.fontSizeSmHint : defaultConfig.fontSizeSmHint,
			layoutMaxWidth: tailwindContainerSize.includes(config.layoutMaxWidth) ? config.layoutMaxWidth : defaultConfig.layoutMaxWidth
		};
	} catch {
		return defaultConfig;
	}
}
function getCssVar(config) {
	return {
		"--font-primary": config.useSystemFontPrimary ? config.systemFontPrimary : config.webFontPrimary,
		"--font-secondary": config.useSystemFontSecondary ? config.systemFontSecondary : config.webFontSecondary,
		"--font-size-base-expression": tailwindFontSizeVar[config.fontSizeBaseExpression].fontSize,
		"--line-height-base-expression": tailwindFontSizeVar[config.fontSizeBaseExpression].lineHeight,
		"--font-size-base-pitch": tailwindFontSizeVar[config.fontSizeBasePitch].fontSize,
		"--line-height-base-pitch": tailwindFontSizeVar[config.fontSizeBasePitch].lineHeight,
		"--font-size-base-sentence": tailwindFontSizeVar[config.fontSizeBaseSentence].fontSize,
		"--line-height-base-sentence": tailwindFontSizeVar[config.fontSizeBaseSentence].lineHeight,
		"--font-size-base-misc-info": tailwindFontSizeVar[config.fontSizeBaseMiscInfo].fontSize,
		"--line-height-base-misc-info": tailwindFontSizeVar[config.fontSizeBaseMiscInfo].lineHeight,
		"--font-size-base-hint": tailwindFontSizeVar[config.fontSizeBaseHint].fontSize,
		"--line-height-base-hint": tailwindFontSizeVar[config.fontSizeBaseHint].lineHeight,
		"--font-size-sm-expression": tailwindFontSizeVar[config.fontSizeSmExpression].fontSize,
		"--line-height-sm-expression": tailwindFontSizeVar[config.fontSizeSmExpression].lineHeight,
		"--font-size-sm-pitch": tailwindFontSizeVar[config.fontSizeSmPitch].fontSize,
		"--line-height-sm-pitch": tailwindFontSizeVar[config.fontSizeSmPitch].lineHeight,
		"--font-size-sm-sentence": tailwindFontSizeVar[config.fontSizeSmSentence].fontSize,
		"--line-height-sm-sentence": tailwindFontSizeVar[config.fontSizeSmSentence].lineHeight,
		"--font-size-sm-misc-info": tailwindFontSizeVar[config.fontSizeSmMiscInfo].fontSize,
		"--line-height-sm-misc-info": tailwindFontSizeVar[config.fontSizeSmMiscInfo].lineHeight,
		"--font-size-sm-hint": tailwindFontSizeVar[config.fontSizeSmHint].fontSize,
		"--line-height-sm-hint": tailwindFontSizeVar[config.fontSizeSmHint].lineHeight,
		"--layout-max-width": tailwindContainerSizeVar[config.layoutMaxWidth].maxWidth,
		"--color-base-100": colorBase100Map[config.theme]
	};
}
function updateConfigState(el, config) {
	if (document.documentElement.getAttribute("data-theme") !== "none") document.documentElement.setAttribute("data-theme", config.theme);
	el.dataset.theme = config.theme;
	el.dataset.blurNsfw = config.blurNsfw ? "true" : "false";
	el.dataset.pictureOnFront = config.pictureOnFront ? "true" : "false";
	el.dataset.modVertical = config.modVertical ? "true" : "false";
	const cssVar = getCssVar(config);
	Object.entries(cssVar).forEach(([key, value]) => {
		document.documentElement.style.setProperty(key, value);
		el.style.setProperty(key, value);
	});
}
function generateCssVars(vars) {
	return `:root,\n:host {\n${Object.entries(vars).map(([key, value]) => `  ${key}: ${value};`).join("\n")}\n}`;
}

//#endregion
//#region src/components/_kiku_lazy/util/ankiConnect.ts
const base64 = {
	decode: (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)),
	encode: (b) => btoa(String.fromCharCode(...new Uint8Array(b))),
	decodeToString: (s) => new TextDecoder().decode(base64.decode(s)),
	encodeString: (s) => base64.encode(new TextEncoder().encode(s).buffer)
};
var ankiConnectAddress = "";
const AnkiConnect = {
	changeAddress: (address) => {
		ankiConnectAddress = address;
	},
	invoke: async (action, params = {}) => {
		const result = await (await fetch(ankiConnectAddress, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				action,
				version: 6,
				params
			})
		})).json();
		if (result.error) throw new Error(result.error);
		return result;
	},
	getVersion: async () => {
		return await AnkiConnect.invoke("version");
	},
	saveConfig: async (config) => {
		await AnkiConnect.invoke("storeMediaFile", {
			filename: env.KIKU_CONFIG_FILE,
			data: base64.encodeString(JSON.stringify(config))
		});
		const [frontRes, backRes, styleRes] = await Promise.all([
			fetch(env.KIKU_FRONT_FILE, { cache: "no-store" }),
			fetch(env.KIKU_BACK_FILE, { cache: "no-store" }),
			fetch(env.KIKU_STYLE_FILE, { cache: "no-store" })
		]);
		if (!frontRes.ok || !backRes.ok || !styleRes.ok) throw new Error(`Failed to load template files: ${[
			!frontRes.ok && env.KIKU_FRONT_FILE,
			!backRes.ok && env.KIKU_BACK_FILE,
			!styleRes.ok && env.KIKU_STYLE_FILE
		].filter(Boolean).join(", ")}`);
		const [frontSrc, backSrc, styleSrc] = await Promise.all([
			frontRes.text(),
			backRes.text(),
			styleRes.text()
		]);
		const frontTemplate = frontSrc.replace("__DATA_THEME__", config.theme).replace("__DATA_BLUR_NSFW__", config.blurNsfw ? "true" : "false").replace("__DATA_PICTURE_ON_FRONT__", config.pictureOnFront ? "true" : "false").replace("__DATA_MOD_VERTICAL__", config.modVertical ? "true" : "false");
		const backTemplate = backSrc.replace("__DATA_THEME__", config.theme).replace("__DATA_BLUR_NSFW__", config.blurNsfw ? "true" : "false").replace("__DATA_PICTURE_ON_FRONT__", config.pictureOnFront ? "true" : "false").replace("__DATA_MOD_VERTICAL__", config.modVertical ? "true" : "false");
		const cssVar = getCssVar(config);
		const cssVarTemplate = generateCssVars(cssVar);
		const styleTemplate = styleSrc.replace("/* __CSS_VARIABLE__ */", cssVarTemplate);
		await AnkiConnect.invoke("updateModelTemplates", { model: {
			name: env.KIKU_NOTE_TYPE,
			templates: { [env.KIKU_CARD_TYPE]: {
				Front: frontTemplate,
				Back: backTemplate
			} }
		} });
		await AnkiConnect.invoke("updateModelStyling", { model: {
			name: env.KIKU_NOTE_TYPE,
			css: styleTemplate
		} });
	},
	getKikuFiles: async () => {
		return (await AnkiConnect.invoke("getMediaFilesNames", { pattern: "_kiku*" })).result.sort((a, b) => {
			const extA = a.split(".").pop();
			const extB = b.split(".").pop();
			if (extA !== extB) return extA?.localeCompare(extB ?? "");
			return a.localeCompare(b);
		});
	}
};

//#endregion
//#region src/components/shared/GeneralContext.tsx
var GeneralContext = createContext();
function GeneralContextProvider(props) {
	let timeout;
	const success = (message) => {
		if (timeout) clearTimeout(timeout);
		$setGeneral("toast", {
			message,
			type: "success"
		});
		timeout = setTimeout(() => {
			$setGeneral("toast", {
				message: void 0,
				type: "success"
			});
		}, 3e3);
	};
	const error = (message) => {
		if (timeout) clearTimeout(timeout);
		$setGeneral("toast", {
			message,
			type: "error"
		});
		timeout = setTimeout(() => {
			$setGeneral("toast", {
				message: void 0,
				type: "error"
			});
		}, 3e3);
	};
	async function checkAnkiConnect() {
		try {
			const version = await AnkiConnect.getVersion();
			if (version) {
				KIKU_STATE.logger.info("AnkiConnect version:", version);
				$setGeneral("isAnkiConnectAvailable", true);
			}
		} catch {
			KIKU_STATE.logger.warn("AnkiConnect is not available");
			$setGeneral("isAnkiConnectAvailable", false);
		}
	}
	function useCheckAnkiConnect() {
		const bp = useBreakpointContext();
		onMount(() => {
			if (!bp.isAtLeast("sm")) return;
			$general.checkAnkiConnect();
		});
	}
	const [$general, $setGeneral] = createStore({
		plugin: void 0,
		isThemeChanged: false ? false : JSON.parse(sessionStorage.getItem(env.KIKU_IS_THEME_CHANGED_SESSION_STORAGE_KEY) ?? "false"),
		aborter: props.aborter,
		isAnkiConnectAvailable: false,
		notesManifest: void 0,
		layoutRef: void 0,
		contentRef: void 0,
		toast: {
			success,
			error,
			message: void 0,
			type: "success"
		},
		SAME_READING: Symbol.for("SAME_READING"),
		SAME_EXPRESSION: Symbol.for("SAME_EXPRESSION"),
		lookupKanjiCache: /* @__PURE__ */ new Map(),
		nexClientPromise: Promise.withResolvers(),
		checkAnkiConnect,
		useCheckAnkiConnect
	});
	return createComponent(GeneralContext.Provider, {
		value: [$general, $setGeneral],
		get children() {
			return props.children;
		}
	});
}
function useGeneralContext() {
	const generalContext = useContext(GeneralContext);
	if (!generalContext) throw new Error("Missing GeneralContext");
	return generalContext;
}

//#endregion
//#region src/components/shared/ConfigContext.tsx
var ConfigContext = createContext();
function ConfigContextProvider(props) {
	const [$config] = props.value;
	const [$general, $setGeneral] = useGeneralContext();
	let initialTheme;
	createEffect(() => {
		({ ...$config });
		KIKU_STATE.logger.debug("Updating config:", $config);
		if (!KIKU_STATE.root) throw new Error("Missing root");
		updateConfigState(KIKU_STATE.root, $config);
		AnkiConnect.changeAddress($config.ankiConnectAddress);
		$general.nexClientPromise.promise.then((nexClient) => {
			nexClient.nex.then((nex) => {
				nex.init({
					env,
					config: unwrap($config),
					assetsPath: KIKU_STATE.assetsPath,
					preferAnkiConnect: $config.preferAnkiConnect && !!KIKU_STATE.isAnkiDesktop
				});
			});
		});
		sessionStorage.setItem(env.KIKU_CONFIG_SESSION_STORAGE_KEY, JSON.stringify($config));
		if (!initialTheme) initialTheme = $config.theme;
		else if (initialTheme && initialTheme !== $config.theme) {
			sessionStorage.setItem(env.KIKU_IS_THEME_CHANGED_SESSION_STORAGE_KEY, "true");
			$setGeneral("isThemeChanged", true);
		}
	});
	return createComponent(ConfigContext.Provider, {
		get value() {
			return props.value;
		},
		get children() {
			return props.children;
		}
	});
}
function useConfigContext() {
	const config = useContext(ConfigContext);
	if (!config) throw new Error("Missing ConfigContext");
	return config;
}

//#endregion
//#region src/worker/client.ts
function wrap(worker) {
	let msgId = 0;
	const pending = /* @__PURE__ */ new Map();
	worker.onmessage = (e) => {
		const { id, result, error, log } = e.data;
		if (log) {
			KIKU_STATE.logger.push(log.level, log.args);
			return;
		}
		const { resolve, reject } = pending.get(id);
		pending.delete(id);
		error ? reject(error) : resolve(result);
	};
	return new Proxy({}, { get(_, fn) {
		if (fn === "then") return void 0;
		return (...args) => new Promise((resolve, reject) => {
			const id = ++msgId;
			pending.set(id, {
				resolve,
				reject
			});
			worker.postMessage({
				id,
				fn,
				args
			});
		});
	} });
}
var NexClient = class {
	constructor(payload) {
		let worker;
		let nex;
		if (KIKU_STATE.nexClient) {
			worker = KIKU_STATE.nexClient.worker;
			nex = KIKU_STATE.nexClient.nex;
		} else if (KIKU_STATE.assetsPath !== window.location.origin) worker = new Worker(`${KIKU_STATE.assetsPath}/_kiku_worker.js`, { type: "module" });
		else worker = new Worker(new URL(
			/* @vite-ignore */
			"/_kiku_worker.js",
			"" + import.meta.url
		), { type: "module" });
		if (nex) this.nex = new Promise((resolve) => {
			nex.then((Nex) => {
				Nex.init(payload).then(() => {
					resolve(Nex);
				});
			});
		});
		else {
			const Nex = wrap(worker);
			this.nex = new Promise((resolve) => {
				Nex.init(payload).then(() => {
					resolve(Nex);
				});
			});
		}
		this.worker = worker;
	}
};

//#endregion
//#region src/util/hooks.ts
function useViewTransition() {
	function startViewTransition(callback, { beforeCallback } = {}) {
		if (document.startViewTransition && typeof pycmd === "undefined" && !KIKU_STATE.isAnkiWeb) {
			beforeCallback?.();
			return document.startViewTransition(callback);
		} else callback();
	}
	return startViewTransition;
}
function useNavigationTransition() {
	const [$card, $setCard] = useCardContext();
	const bp = useBreakpointContext();
	const startViewTransition = useViewTransition();
	function navigate(destination, direction, navigateBack$1) {
		if (navigateBack$1) $setCard("navigateBack", (old) => [...old, navigateBack$1]);
		const start = () => {
			if (typeof destination === "function") destination();
			else $setCard("page", destination);
		};
		if (!bp.isAtLeast("sm")) startViewTransition(start, { beforeCallback() {
			document.documentElement.dataset.transitionDirection = direction;
		} })?.finished.then(() => {
			document.documentElement.removeAttribute("data-transition-direction");
		});
		else start();
	}
	function navigateBack() {
		const last = $card.navigateBack[$card.navigateBack.length - 1];
		$setCard("navigateBack", (list) => list.slice(0, -1));
		last?.();
	}
	return {
		navigate,
		navigateBack
	};
}
function useThemeTransition() {
	const [$config, $setConfig] = useConfigContext();
	const startViewTransition = useViewTransition();
	const [$card, $setCard] = useCardContext();
	function changeTheme(theme) {
		if ($card.query.status === "loading") $setConfig("theme", theme);
		else startViewTransition(() => $setConfig("theme", theme), { beforeCallback() {
			document.documentElement.dataset.themeTransition = "true";
		} })?.finished.then(() => {
			document.documentElement.removeAttribute("data-theme-transition");
		});
	}
	return changeTheme;
}
function useKanji() {
	const [$config] = useConfigContext();
	const [$card, $setCard] = useCardContext();
	const { ankiFields } = useAnkiFieldContext();
	const [$general, $setGeneral] = useGeneralContext();
	let set = false;
	async function setKanji() {
		set = true;
		try {
			const kanjiList = extractKanji(ankiFields.ExpressionFurigana ? $card.nested ? ankiFields.Expression : ankiFields["furigana:ExpressionFurigana"] : ankiFields.Expression);
			const readingList = ankiFields.ExpressionReading ? [ankiFields.ExpressionReading] : [];
			const expressionList = ankiFields.Expression ? [ankiFields.Expression] : [];
			const nexClient = new NexClient({
				env,
				config: unwrap($config),
				assetsPath: KIKU_STATE.assetsPath,
				preferAnkiConnect: $config.preferAnkiConnect && !!KIKU_STATE.isAnkiDesktop
			});
			KIKU_STATE.nexClient = nexClient;
			$general.nexClientPromise.resolve(nexClient);
			const nex = await nexClient.nex;
			const { kanjiResult, readingResult, expressionResult } = await nex.queryShared({
				kanjiList,
				readingList,
				ankiFields: unwrap(ankiFields),
				expressionList
			});
			if ($general.aborter.signal.aborted) return;
			$setCard("query", {
				status: "success",
				noteList: Object.entries(kanjiResult),
				sameReading: readingResult[ankiFields.ExpressionReading],
				sameExpression: expressionResult[ankiFields.Expression]
			});
			nex.notesManifest().then((manifest) => $setGeneral("notesManifest", manifest)).catch(() => {
				KIKU_STATE.logger.warn("Failed to load manifest");
			});
		} catch (e) {
			$setCard("query", { status: "error" });
			KIKU_STATE.logger.error("Failed to load kanji information:", e instanceof Error ? e.message : "");
		}
	}
	createEffect(() => {
		if (!set && $card.ready) setKanji();
	});
}

//#endregion
//#region src/util/plugin.ts
async function getPlugin() {
	try {
		return (await import(
			/* @vite-ignore */
			`${KIKU_STATE.assetsPath}/${env.KIKU_PLUGIN_MODULE}`
)).plugin;
	} catch (e) {
		KIKU_STATE.logger.warn("Failed to load plugin:", e instanceof Error ? e.message : e);
	}
}

//#endregion
//#region src/components/shared/FieldGroupContext.tsx
var FieldGroupContext = createContext();
function FieldGroupContextProvider(props) {
	const { ankiFields } = useAnkiFieldContext();
	const [$card] = useCardContext();
	const sentenceField = () => {
		if ($card.side === "front") return ankiFields["kanji:Sentence"];
		if ($card.nested) return ankiFields.Sentence;
		return ankiFields["furigana:SentenceFurigana"] ? ankiFields["furigana:SentenceFurigana"] : ankiFields["kanji:Sentence"];
	};
	const pictureField = ankiFields.Picture;
	const sentenceAudioField = ankiFields.SentenceAudio;
	const miscInfoField = ankiFields.MiscInfo;
	const [$group, $setGroup] = createStore({
		sentenceField: sentenceField(),
		pictureField,
		sentenceAudioField,
		miscInfoField,
		index: 0,
		ids: []
	});
	const ids = /* @__PURE__ */ new Set();
	const addIds = (id) => {
		if (id) ids.add(id);
		$setGroup("ids", Array.from(ids));
	};
	createEffect(() => {
		const sentenceFieldDoc = parseHtml(sentenceField());
		const sentenceFieldWithGroup = sentenceFieldDoc.querySelectorAll("[data-group-id]");
		sentenceFieldWithGroup.forEach((el) => {
			const id = el.dataset.groupId;
			addIds(id);
		});
		const sentenceFieldWithoutGroup = Array.from(sentenceFieldDoc.body.childNodes).filter((el) => !el.dataset?.groupId);
		const sentenceFieldWithoutGroupHtml = nodesToString(sentenceFieldWithoutGroup);
		const sentenceAudioFieldDoc = parseHtml(sentenceAudioField);
		const sentenceAudioFieldWithGroup = sentenceAudioFieldDoc.querySelectorAll("[data-group-id]");
		sentenceAudioFieldWithGroup.forEach((el) => {
			const id = el.dataset.groupId;
			addIds(id);
		});
		const sentenceAudioFieldWithoutGroup = Array.from(sentenceAudioFieldDoc.body.childNodes).filter((el) => !el.dataset?.groupId);
		const sentenceAudioFieldWithoutGroupHtml = nodesToString(sentenceAudioFieldWithoutGroup);
		const miscInfoFieldDoc = parseHtml(miscInfoField);
		const miscInfoFieldWithGroup = miscInfoFieldDoc.querySelectorAll("[data-group-id]");
		miscInfoFieldWithGroup.forEach((el) => {
			const id = el.dataset.groupId;
			addIds(id);
		});
		const miscInfoFieldWithoutGroup = Array.from(miscInfoFieldDoc.body.childNodes).filter((el) => !el.dataset?.groupId);
		const miscInfoFieldWithoutGroupHtml = nodesToString(miscInfoFieldWithoutGroup);
		const pictureFieldWithGroup = parseHtml(pictureField).querySelectorAll("img");
		pictureFieldWithGroup.forEach((el, i) => {
			let id = el.dataset.groupId;
			if (!id) {
				id = (i * -1).toString();
				el.dataset.groupId = id;
			}
			addIds(id);
		});
		let dummyImg;
		if (!Array.from($group.ids).map(Number).some((id) => id <= 0) && (sentenceFieldWithoutGroupHtml.trim() || sentenceAudioFieldWithoutGroupHtml.trim() || miscInfoFieldWithoutGroupHtml.trim())) {
			const img = document.createElement("img");
			img.dataset.groupId = "0";
			dummyImg = img;
			addIds("0");
		}
		if ($group.ids.length > 0) {
			const id = $group.ids.map((id$1) => Number(id$1)).sort((a, b) => b - a)[$group.index];
			let sentenceField$1;
			let sentenceAudioField$1;
			let miscInfoField$1;
			let pictureField$1;
			if (id > 0) {
				sentenceField$1 = Array.from(sentenceFieldWithGroup).find((el) => el.dataset.groupId === id.toString())?.outerHTML;
				sentenceAudioField$1 = Array.from(sentenceAudioFieldWithGroup).find((el) => el.dataset.groupId === id.toString())?.outerHTML;
				miscInfoField$1 = Array.from(miscInfoFieldWithGroup).find((el) => el.dataset.groupId === id.toString())?.outerHTML;
				const pictureFieldArray = Array.from(pictureFieldWithGroup);
				if (dummyImg) pictureFieldArray.push(dummyImg);
				pictureField$1 = pictureFieldArray.find((el) => {
					return el.dataset.groupId === id.toString();
				})?.outerHTML;
			} else {
				sentenceField$1 = sentenceFieldWithoutGroupHtml;
				sentenceAudioField$1 = sentenceAudioFieldWithoutGroupHtml;
				miscInfoField$1 = miscInfoFieldWithoutGroupHtml;
				pictureField$1 = Array.from(pictureFieldWithGroup).find((el) => {
					return el.dataset.groupId === id.toString();
				})?.outerHTML;
			}
			$setGroup("sentenceField", sentenceField$1 ?? "");
			$setGroup("sentenceAudioField", sentenceAudioField$1 ?? "");
			$setGroup("miscInfoField", miscInfoField$1 ?? "");
			$setGroup("pictureField", pictureField$1 ?? "");
			KIKU_STATE.logger.info("[Groups] sentenceField:", sentenceField$1);
			KIKU_STATE.logger.info("[Groups] sentenceAudioField:", sentenceAudioField$1);
			KIKU_STATE.logger.info("[Groups] miscInfoField:", miscInfoField$1);
			KIKU_STATE.logger.info("[Groups] pictureField:", pictureField$1);
		}
	});
	function $next() {
		let changed = false;
		$setGroup("index", (prev) => {
			const newIndex = (prev + 1 + $group.ids.length) % $group.ids.length;
			if (newIndex !== prev) changed = true;
			return newIndex;
		});
		return changed;
	}
	function $prev() {
		let changed = false;
		$setGroup("index", (prev) => {
			const newIndex = (prev - 1 + $group.ids.length) % $group.ids.length;
			if (newIndex !== prev) changed = true;
			return newIndex;
		});
		return changed;
	}
	return createComponent(FieldGroupContext.Provider, {
		value: {
			$group,
			$setGroup,
			$next,
			$prev,
			ankiFields
		},
		get children() {
			return props.children;
		}
	});
}
function useFieldGroupContext() {
	const fieldGroup = useContext(FieldGroupContext);
	if (!fieldGroup) throw new Error("Missing FieldGroupContext");
	return fieldGroup;
}
var RootFieldGroupConext = createContext();
function RootFieldGroupContextProvider(props) {
	const value = useFieldGroupContext();
	return createComponent(RootFieldGroupConext.Provider, {
		value,
		get children() {
			return props.children;
		}
	});
}
function useRootFieldGroupContext() {
	const fieldGroup = useContext(RootFieldGroupConext);
	if (!fieldGroup) throw new Error("Missing RootFieldGroupContext");
	return fieldGroup;
}

//#endregion
//#region src/components/shared/CtxContext.tsx
var CtxContext = createContext();
function CtxContextProvider(props) {
	const { ankiFields } = useAnkiFieldContext();
	const ctx = {
		h,
		createSignal,
		createEffect,
		createMemo,
		createResource,
		createComputed,
		onMount,
		onCleanup,
		createContext,
		useContext,
		lazy,
		ErrorBoundary,
		For,
		Portal,
		Show,
		Suspense,
		Switch,
		Match,
		untrack,
		runWithOwner,
		getOwner,
		createStore,
		ankiFields,
		ankiDroidAPI: () => KIKU_STATE.ankiDroidAPI,
		useAnkiFieldContext,
		useBreakpointContext,
		useCardContext,
		useConfigContext
	};
	return createComponent(CtxContext.Provider, {
		value: ctx,
		get children() {
			return props.children;
		}
	});
}
function useCtxContext() {
	const ctx = useContext(CtxContext);
	if (!ctx) throw new Error("Missing CtxContext");
	return ctx;
}

//#endregion
//#region src/util/debug.ts
const debug = {
	printDocument() {
		const root = document.documentElement.outerHTML;
		const shadowRoot = document.getElementById("kiku-shadow-parent")?.shadowRoot;
		let shadow = shadowRoot?.getHTML?.();
		if (!shadow) shadow = shadowRoot?.getInnerHTML?.();
		return {
			root,
			shadow
		};
	},
	getLogs() {
		const logs = KIKU_STATE.logger.logs;
		const length = logs.length;
		const size = logs.reduce((total, str) => total + str.length * 2, 0) + logs.length * 8;
		return {
			logs,
			length,
			size
		};
	},
	getSessionStorage() {
		return Object.fromEntries(Object.entries(sessionStorage).map(([key, value]) => [key, JSON.parse(value)]));
	},
	print() {
		const data = {
			document: this.printDocument(),
			logs: this.getLogs(),
			sessionStorage: this.getSessionStorage(),
			timestamp: (/* @__PURE__ */ new Date()).toISOString()
		};
		const text = JSON.stringify(data, null, 2);
		console.log(text);
	}
};

//#endregion
//#region src/util/logger.ts
var Logger = class Logger {
	static {
		this.levels = [
			"trace",
			"debug",
			"info",
			"warn",
			"error",
			"fatal"
		];
	}
	constructor(options = {}) {
		this.logs = [];
		this.minLevelIndex = options.level ? Logger.levels.indexOf(options.level) : 0;
		this.onUpdate = options.onUpdate;
		if (!false) this.attachToGlobalErrors();
	}
	attachToGlobalErrors() {
		window.addEventListener("error", (event) => {
			this.error("GlobalError:", event.message, {
				file: event.filename,
				line: event.lineno,
				col: event.colno,
				error: event.error?.stack ?? String(event.error)
			});
		});
		window.addEventListener("unhandledrejection", (event) => {
			this.error("UnhandledRejection:", { reason: event.reason instanceof Error ? event.reason.stack : event.reason });
		});
		const originalConsoleError = console.error;
		console.error = (...args) => {
			this.error("ConsoleError:", ...args);
			originalConsoleError.apply(console, args);
		};
	}
	format(level, args) {
		const time = (/* @__PURE__ */ new Date()).toISOString().split("T")[1].replace("Z", "");
		const msg = args.map((a) => typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)).join(" ");
		return `[${time}] [${level.toUpperCase()}] ${msg}`;
	}
	push(level, args) {
		if (Logger.levels.indexOf(level) < this.minLevelIndex) return;
		const line = this.format(level, args);
		this.logs.push(line);
		if (this.logs.length > 1e3) this.logs.shift();
		if (this.onUpdate) this.onUpdate(this.logs.join("\n"));
	}
	trace(...args) {
		this.push("trace", args);
	}
	debug(...args) {
		this.push("debug", args);
	}
	info(...args) {
		this.push("info", args);
	}
	warn(...args) {
		this.push("warn", args);
	}
	error(...args) {
		this.push("error", args);
	}
	fatal(...args) {
		this.push("fatal", args);
	}
	get() {
		return this.logs.join("\n");
	}
	clear() {
		this.logs = [];
		if (this.onUpdate) this.onUpdate("");
	}
};

//#endregion
export { BreakpointContextProvider as A, CardStoreContextProvider as B, tailwindSize as C, nextTheme as D, daisyUIThemes as E, extractKanji as F, ankiFieldsSkeleton as H, isHtmlEffectivelyEmpty as I, nodesToString as L, AnkiFieldContextProvider as M, useAnkiFieldContext as N, webFonts as O, env as P, parseHtml as R, tailwindFontSizeVar as S, validateConfig as T, useCardContext as V, useGeneralContext as _, FieldGroupContextProvider as a, rootDatasetConfigWhitelist as b, useRootFieldGroupContext as c, useNavigationTransition as d, useThemeTransition as f, GeneralContextProvider as g, useConfigContext as h, useCtxContext as i, useBreakpointContext as j, defaultConfig as k, getPlugin as l, ConfigContextProvider as m, debug as n, RootFieldGroupContextProvider as o, useViewTransition as p, CtxContextProvider as r, useFieldGroupContext as s, Logger as t, useKanji as u, AnkiConnect as v, updateConfigState as w, tailwindContainerSize as x, getCssVar as y, unique as z };
import { A as Suspense, F as createEffect, G as onMount, H as lazy, K as runWithOwner, L as createRenderEffect, M as createComponent, O as Match, S as spread, T as use, U as mergeProps, V as getOwner, _ as render, b as setProperty, c as Portal, d as getNextElement, f as getNextMarker, g as memo, h as isServer, j as Switch, l as addEventListener, m as insert, o as createStore, p as hydrate, u as classList, v as runHydrationEvents, w as template, x as setStyleProperty, z as createSignal } from "./_kiku_libs.js";
import { A as BreakpointContextProvider, B as CardStoreContextProvider, M as AnkiFieldContextProvider, N as useAnkiFieldContext, P as env, T as validateConfig, V as useCardContext, _ as useGeneralContext, a as FieldGroupContextProvider, d as useNavigationTransition, g as GeneralContextProvider, h as useConfigContext, i as useCtxContext, k as defaultConfig, l as getPlugin, m as ConfigContextProvider, n as debug, o as RootFieldGroupContextProvider, r as CtxContextProvider, s as useFieldGroupContext, t as Logger, u as useKanji, w as updateConfigState } from "./_kiku_shared.js";

//#region src/components/PicturePaginationSection.tsx
var _tmpl$$4 = /* @__PURE__ */ template(`<div class="flex justify-between text-base-content-soft items-center gap-2 animate-fade-in h-5 sm:h-8">`);
var Lazy$2 = { PicturePagination: lazy(async () => ({ default: (await import("./_kiku_lazy.js")).PicturePagination })) };
function PicturePaginationSection() {
	const { $group } = useFieldGroupContext();
	return (() => {
		var _el$ = getNextElement(_tmpl$$4);
		insert(_el$, createComponent(Lazy$2.PicturePagination, {}));
		createRenderEffect(() => _el$.classList.toggle("hidden", !!($group.ids.length <= 1)));
		return _el$;
	})();
}

//#endregion
//#region src/components/PictureSection.tsx
var _tmpl$$3 = /* @__PURE__ */ template(`<div class="sm:max-w-1/2 bg-base-200 flex sm:items-center rounded-lg relative overflow-hidden justify-center picture-field-container"><div class=picture-field-background></div><div class=picture-field>`);
function PictureSection() {
	const [$card, $setCard] = useCardContext();
	const { $group } = useFieldGroupContext();
	const { ankiFields } = useAnkiFieldContext();
	const [clicked, setClicked] = createSignal(false);
	const pictureFieldDataset = () => ({
		"data-transition": $card.ready ? "true" : void 0,
		"data-tags": "{{Tags}}",
		"data-nsfw": $card.isNsfw ? "true" : "false"
	});
	const dataSet1 = () => ({ "data-has-picture": false ? "{{#Picture}}true{{/Picture}}" : ankiFields.Picture ? "true" : "" });
	return (() => {
		var _el$ = getNextElement(_tmpl$$3), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling;
		addEventListener(_el$, "click", () => {
			setClicked((prev) => !prev);
		});
		spread(_el$, mergeProps(dataSet1), false, true);
		insert(_el$2, false ? "{{Picture}}" : void 0);
		addEventListener(_el$3, "click", () => {
			$setCard("pictureModal", $group.pictureField);
		});
		spread(_el$3, mergeProps({ get style() {
			return { opacity: clicked() ? 1 : void 0 };
		} }, pictureFieldDataset, { get innerHTML() {
			return false ? void 0 : $group.pictureField;
		} }), false, true);
		insert(_el$3, false ? "{{Picture}}" : void 0);
		createRenderEffect((_p$) => {
			var _v$ = clicked() ? 1 : void 0, _v$2 = false ? void 0 : $group.pictureField;
			_v$ !== _p$.e && setStyleProperty(_el$2, "opacity", _p$.e = _v$);
			_v$2 !== _p$.t && setProperty(_el$2, "innerHTML", _p$.t = _v$2);
			return _p$;
		}, {
			e: void 0,
			t: void 0
		});
		runHydrationEvents();
		return _el$;
	})();
}

//#endregion
//#region src/components/Back.tsx
var _tmpl$$2 = /* @__PURE__ */ template(`<div class="flex flex-col gap-4 relative z-10"><div class="flex rounded-lg gap-4 flex-col sm:flex-row"><div class="flex-1 bg-base-200 p-4 rounded-lg flex flex-col items-center justify-center min-h-40 sm:min-h-56"><!$><!/><div class="mt-6 flex gap-4 pitch pitch-field"></div><div class="hidden sm:block sm:h-8 sm:mt-2"></div></div><!$><!/></div><!$><!/>`), _tmpl$2$2 = /* @__PURE__ */ template(`<span>&nbsp;`), _tmpl$3$1 = /* @__PURE__ */ template(`<div class="animate-fade-in-sm flex gap-2">`), _tmpl$4$1 = /* @__PURE__ */ template(`<div class="expression font-secondary text-center vertical-rl">`), _tmpl$5 = /* @__PURE__ */ template(`<div class="expression font-secondary text-center vertical-rl"style=display:none>`);
var Lazy$1 = {
	Settings: lazy(async () => ({ default: (await import("./_kiku_lazy.js")).Settings })),
	HeaderMain: lazy(async () => ({ default: (await import("./_kiku_lazy.js")).HeaderMain })),
	BackFooter: lazy(async () => ({ default: (await import("./_kiku_lazy.js")).BackFooter })),
	AudioButtons: lazy(async () => ({ default: (await import("./_kiku_lazy.js")).AudioButtons })),
	PictureModal: lazy(async () => ({ default: (await import("./_kiku_lazy.js")).PictureModal })),
	BackBody: lazy(async () => ({ default: (await import("./_kiku_lazy.js")).BackBody })),
	Pitches: lazy(async () => ({ default: (await import("./_kiku_lazy.js")).Pitches })),
	KanjiPage: lazy(async () => ({ default: (await import("./_kiku_lazy.js")).KanjiPage })),
	UseAnkiDroid: lazy(async () => ({ default: (await import("./_kiku_lazy.js")).UseAnkiDroid })),
	Expression: lazy(async () => ({ default: (await import("./_kiku_lazy.js")).Expression }))
};
function Back(props) {
	const { navigate, navigateBack } = useNavigationTransition();
	const [$card, $setCard] = useCardContext();
	const { ankiFields } = useAnkiFieldContext();
	const [$general, $setGeneral] = useGeneralContext();
	const ctx = useCtxContext();
	const tags = ankiFields.Tags.split(" ");
	useKanji();
	const owner = getOwner();
	onMount(() => {
		setTimeout(() => {
			$setCard("ready", true);
			KIKU_STATE.relax = true;
			getPlugin().then((plugin) => {
				try {
					runWithOwner(owner, () => {
						plugin?.onPluginLoad?.({ ctx });
					});
				} catch {}
				$setGeneral("plugin", plugin);
			});
		}, 0);
		const tags$1 = ankiFields.Tags.split(" ");
		$setCard("isNsfw", tags$1.map((tag) => tag.toLowerCase()).includes("nsfw"));
	});
	const pitchFieldDataset = () => ({ "data-has-pitch": false ? "{{#PitchPosition}}true{{/PitchPosition}}" : ankiFields.PitchPosition ? "true" : "" });
	return [
		memo(() => memo(() => !!($card.ready && !$card.nested))() && createComponent(Lazy$1.UseAnkiDroid, {})),
		createComponent(Switch, { get children() {
			return [
				createComponent(Match, {
					get when() {
						return memo(() => $card.page === "settings")() && $card.ready;
					},
					get children() {
						return createComponent(Lazy$1.Settings, {});
					}
				}),
				createComponent(Match, {
					get when() {
						return memo(() => $card.page === "kanji")() && $card.ready;
					},
					get children() {
						return createComponent(Lazy$1.KanjiPage, {});
					}
				}),
				createComponent(Match, {
					get when() {
						return memo(() => $card.page === "nested")() && $card.ready;
					},
					get children() {
						return createComponent(AnkiFieldContextProvider, {
							get ankiFields() {
								return $card.nestedAnkiFields;
							},
							get noteId() {
								return $card.nestedNoteId;
							},
							get children() {
								return createComponent(CardStoreContextProvider, {
									nested: true,
									side: "back",
									get isMergePreview() {
										return $card.nestedIsMergePreview;
									},
									get children() {
										return createComponent(FieldGroupContextProvider, { get children() {
											return createComponent(CtxContextProvider, { get children() {
												return createComponent(Back, { onExitNested: navigateBack });
											} });
										} });
									}
								});
							}
						});
					}
				}),
				createComponent(Match, {
					get when() {
						return $card.page === "main";
					},
					get children() {
						return [
							memo(() => memo(() => !!$card.ready)() && createComponent(Lazy$1.HeaderMain, { get onExitNested() {
								return props.onExitNested;
							} })),
							(() => {
								var _el$ = getNextElement(_tmpl$$2), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$6 = _el$3.firstChild, [_el$7, _co$] = getNextMarker(_el$6.nextSibling), _el$4 = _el$7.nextSibling, _el$5 = _el$4.nextSibling, _el$8 = _el$3.nextSibling, [_el$9, _co$2] = getNextMarker(_el$8.nextSibling), _el$0 = _el$2.nextSibling, [_el$1, _co$3] = getNextMarker(_el$0.nextSibling);
								insert(_el$3, createComponent(ExpressionSection, {}), _el$7, _co$);
								spread(_el$4, mergeProps(pitchFieldDataset), false, true);
								insert(_el$4, (() => {
									var _c$ = memo(() => !!(ankiFields.PitchPosition && $card.ready));
									return () => _c$() ? createComponent(Suspense, {
										get fallback() {
											return getNextElement(_tmpl$2$2);
										},
										get children() {
											return createComponent(Lazy$1.Pitches, {});
										}
									}) : false ? "{{#PitchPosition}}<span>&nbsp;</span>{{/PitchPosition}}" : ankiFields.PitchPosition && getNextElement(_tmpl$2$2);
								})());
								insert(_el$5, (() => {
									var _c$2 = memo(() => !!$card.ready);
									return () => _c$2() && (() => {
										var _el$12 = getNextElement(_tmpl$3$1);
										insert(_el$12, createComponent(Lazy$1.AudioButtons, { position: 1 }));
										return _el$12;
									})();
								})());
								insert(_el$2, createComponent(PictureSection, {}), _el$9, _co$2);
								insert(_el$, (() => {
									var _c$3 = memo(() => !!$card.ready);
									return () => _c$3() && createComponent(PicturePaginationSection, {});
								})(), _el$1, _co$3);
								createRenderEffect(() => _el$2.classList.toggle("animate-fade-in", !!KIKU_STATE.relax));
								runHydrationEvents();
								return _el$;
							})(),
							memo(() => memo(() => !!$card.ready)() && createComponent(Lazy$1.BackBody, { onDefinitionPictureClick: (picture) => {
								$setCard("pictureModal", picture);
							} })),
							memo(() => memo(() => !!$card.ready)() && [createComponent(Lazy$1.BackFooter, { tags }), createComponent(Lazy$1.AudioButtons, { position: 2 })])
						];
					}
				})
			];
		} }),
		memo(() => memo(() => !!$card.ready)() && createComponent(Lazy$1.PictureModal, {
			get img() {
				return $card.pictureModal;
			},
			"on:click": () => $setCard("pictureModal", void 0)
		}))
	];
}
function ExpressionSection() {
	const [$card, $setCard] = useCardContext();
	const { ankiFields } = useAnkiFieldContext();
	const [ref1, setRef1] = createSignal();
	const [ref2, setRef2] = createSignal();
	const expressionInnerHtml = () => {
		if ($card.nested) {
			if (ankiFields.Expression && ankiFields.ExpressionReading) return `<ruby>${ankiFields.Expression}<rt>${ankiFields.ExpressionReading}</rt></ruby>`;
			if (ankiFields.Expression) return ankiFields.Expression;
			return ankiFields.ExpressionReading;
		}
		return false ? void 0 : ankiFields.ExpressionFurigana ? ankiFields["furigana:ExpressionFurigana"] : ankiFields.Expression;
	};
	onMount(() => {
		const el2 = ref2();
		if (el2) render(Lazy$1.Expression, el2);
	});
	createEffect(() => {
		const el1 = ref1();
		const el2 = ref2();
		if ($card.expressionReady && el1 && el2) {
			el1.style.display = "none";
			el2.style.display = "";
		}
	});
	return [(() => {
		var _el$13 = getNextElement(_tmpl$4$1);
		use((ref) => setRef1(ref), _el$13);
		insert(_el$13, false ? "{{#ExpressionFurigana}}{{furigana:ExpressionFurigana}}{{/ExpressionFurigana}}{{^ExpressionFurigana}}{{Expression}}{{/ExpressionFurigana}}" : void 0);
		createRenderEffect(() => setProperty(_el$13, "innerHTML", expressionInnerHtml()));
		return _el$13;
	})(), (() => {
		var _el$14 = getNextElement(_tmpl$5);
		use((ref) => setRef2(ref), _el$14);
		return _el$14;
	})()];
}

//#endregion
//#region src/components/Front.tsx
var _tmpl$$1 = /* @__PURE__ */ template(`<div class="flex flex-col gap-4"><div class="flex rounded-lg gap-4 flex-col sm:flex-row"><div class="flex-1 bg-base-200 p-4 rounded-lg flex flex-col items-center justify-center min-h-40 sm:min-h-56"><div class="expression font-secondary text-center vertical-rl"></div></div><!$><!/></div><!$><!/>`), _tmpl$2$1 = /* @__PURE__ */ template(`<div class="flex flex-col gap-4 items-center text-center justify-center">`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex gap-2 items-center justify-center text-center border-t-1 hint text-base-content-calm hint-field border-base-content-soft p-2"><div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex gap-2 justify-center animate-fade-in-sm">`);
var Lazy = {
	AudioButtons: lazy(async () => ({ default: (await import("./_kiku_lazy.js")).AudioButtons })),
	HeaderMain: lazy(async () => ({ default: (await import("./_kiku_lazy.js")).HeaderMain })),
	PicturePagination: lazy(async () => ({ default: (await import("./_kiku_lazy.js")).PicturePagination })),
	UseAnkiDroid: lazy(async () => ({ default: (await import("./_kiku_lazy.js")).UseAnkiDroid })),
	Sentence: lazy(async () => ({ default: (await import("./_kiku_lazy.js")).Sentence }))
};
function Front() {
	const [$card, $setCard] = useCardContext();
	const { ankiFields } = useAnkiFieldContext();
	const [clicked, setClicked] = createSignal(false);
	const [hideExpression, setHideExpression] = createSignal(false);
	const { $group } = useFieldGroupContext();
	const [$config] = useConfigContext();
	const [$general, $setGeneral] = useGeneralContext();
	const ctx = useCtxContext();
	const owner = getOwner();
	onMount(() => {
		setTimeout(() => {
			$setCard("ready", true);
			getPlugin().then((plugin) => {
				try {
					runWithOwner(owner, () => {
						plugin?.onPluginLoad?.({ ctx });
					});
				} catch {}
				$setGeneral("plugin", plugin);
			});
		}, 0);
		const tags = ankiFields.Tags.split(" ");
		$setCard("isNsfw", tags.map((tag) => tag.toLowerCase()).includes("nsfw"));
		if ($config.modHidden) setTimeout(() => {
			setHideExpression(true);
		}, $config.modHiddenDuration);
	});
	createEffect(() => {
		if (ankiFields.IsAudioCard && $card.sentenceFieldRef && $group.sentenceField) $card.sentenceFieldRef.innerHTML = $card.sentenceFieldRef.innerHTML.replaceAll(ankiFields.Expression, "<span class='text-base-content-primary'>[...]<span>");
	});
	const hidden = () => {
		if (false) return true;
		if (ankiFields.IsSentenceCard || ankiFields.IsWordAndSentenceCard || ankiFields.IsAudioCard) return false;
		if (ankiFields.IsClickCard && clicked()) return false;
		return true;
	};
	const hintFieldDataset = () => ({ "data-has-hint": false ? "{{#Hint}}true{{/Hint}}" : ankiFields.Hint ? "true" : "" });
	return [
		memo(() => memo(() => !!($card.ready && !$card.nested))() && createComponent(Lazy.UseAnkiDroid, {})),
		memo(() => memo(() => !!$card.ready)() && createComponent(Lazy.HeaderMain, {})),
		(() => {
			var _el$ = getNextElement(_tmpl$$1), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.firstChild, _el$5 = _el$3.nextSibling, [_el$6, _co$] = getNextMarker(_el$5.nextSibling), _el$7 = _el$2.nextSibling, [_el$8, _co$2] = getNextMarker(_el$7.nextSibling);
			addEventListener(_el$2, "touchend", (e) => e.stopPropagation());
			addEventListener(_el$2, "click", () => {
				setClicked((prev) => !prev);
				setHideExpression(false);
			});
			insert(_el$4, false ? `{{#IsSentenceCard}} <span>?</span> {{/IsSentenceCard}} {{#IsAudioCard}} <span>?</span> {{/IsAudioCard}} {{^IsSentenceCard}} {{^IsAudioCard}} {{Expression}} {{/IsAudioCard}} {{/IsSentenceCard}}` : void 0);
			insert(_el$2, createComponent(PictureSection, {}), _el$6, _co$);
			insert(_el$, (() => {
				var _c$ = memo(() => !!($card.ready && !hidden()));
				return () => _c$() && createComponent(PicturePaginationSection, {});
			})(), _el$8, _co$2);
			createRenderEffect((_p$) => {
				var _v$ = {
					"border-b-2 border-dotted border-base-content-soft": !!ankiFields.IsClickCard,
					"transition-opacity duration-[1000ms] opacity-0": hideExpression()
				}, _v$2 = false ? void 0 : !ankiFields.IsSentenceCard && !ankiFields.IsAudioCard ? ankiFields.Expression : "?";
				_p$.e = classList(_el$4, _v$, _p$.e);
				_v$2 !== _p$.t && setProperty(_el$4, "innerHTML", _p$.t = _v$2);
				return _p$;
			}, {
				e: void 0,
				t: void 0
			});
			return _el$;
		})(),
		(() => {
			var _el$9 = getNextElement(_tmpl$2$1);
			insert(_el$9, (() => {
				var _c$2 = memo(() => !!($card.ready && !hidden()));
				return () => _c$2() && createComponent(Lazy.Sentence, {});
			})());
			createRenderEffect((_$p) => classList(_el$9, { "transition-opacity duration-[1000ms] opacity-0": hideExpression() }, _$p));
			return _el$9;
		})(),
		memo(() => memo(() => !!($card.ready && ankiFields.IsAudioCard))() && (() => {
			var _el$10 = getNextElement(_tmpl$4);
			insert(_el$10, createComponent(Lazy.AudioButtons, { position: 1 }));
			return _el$10;
		})()),
		(() => {
			var _el$0 = getNextElement(_tmpl$3), _el$1 = _el$0.firstChild;
			spread(_el$0, mergeProps(hintFieldDataset), false, true);
			insert(_el$1, false ? "{{Hint}}" : void 0);
			createRenderEffect(() => setProperty(_el$1, "innerHTML", false ? void 0 : ankiFields.Hint));
			runHydrationEvents();
			return _el$0;
		})()
	];
}

//#endregion
//#region src/components/Layout.tsx
var _tmpl$ = /* @__PURE__ */ template(`<div class="font-primary transition-colors relative"><div class="flex flex-col gap-6 p-2 sm:p-4 bg-base-100 min-h-full mx-auto pt-10 sm:pt-14 layout-max-width"></div><!$><!/>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="toast toast-top toast-center z-20"><div class=alert><span>`);
function Layout(props) {
	const [$general, $setGeneral] = useGeneralContext();
	return (() => {
		var _el$ = getNextElement(_tmpl$), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, [_el$4, _co$] = getNextMarker(_el$3.nextSibling);
		use((ref) => $setGeneral("layoutRef", ref), _el$);
		use((ref) => $setGeneral("contentRef", ref), _el$2);
		insert(_el$2, () => props.children);
		insert(_el$, createComponent(Portal, {
			get mount() {
				return $general.layoutRef;
			},
			get children() {
				return memo(() => !!$general.toast.message)() && (() => {
					var _el$5 = getNextElement(_tmpl$2), _el$6 = _el$5.firstChild, _el$7 = _el$6.firstChild;
					insert(_el$7, () => $general.toast.message);
					createRenderEffect((_p$) => {
						var _v$ = !!($general.toast.type === "error"), _v$2 = !!($general.toast.type === "success");
						_v$ !== _p$.e && _el$6.classList.toggle("alert-error", _p$.e = _v$);
						_v$2 !== _p$.t && _el$6.classList.toggle("alert-success", _p$.t = _v$2);
						return _p$;
					}, {
						e: void 0,
						t: void 0
					});
					return _el$5;
				})();
			}
		}), _el$4, _co$);
		return _el$;
	})();
}

//#endregion
//#region src/index.tsx
globalThis.KIKU_STATE = {
	isAnkiWeb: window.location.origin.includes("ankiuser.net"),
	assetsPath: window.location.origin,
	logger: new Logger(),
	isAnkiDesktop: typeof pycmd !== "undefined",
	nexClient: globalThis.KIKU_STATE?.nexClient,
	aborter: globalThis.KIKU_STATE?.aborter ?? new AbortController(),
	debug
};
async function init({ side, ssr }) {
	const now = performance.now();
	KIKU_STATE.side = side;
	KIKU_STATE.ssr = ssr;
	KIKU_STATE.aborter.abort();
	KIKU_STATE.aborter = new AbortController();
	KIKU_STATE.dispose?.();
	await setup({ aborter: KIKU_STATE.aborter });
	KIKU_STATE.startupTime = performance.now() - now;
}
async function setup({ aborter }) {
	const { side, ssr } = KIKU_STATE;
	try {
		if (!side) throw new Error("Side not set");
		if (!KIKU_STATE.unload) {
			KIKU_STATE.unload = () => {
				console.log("unload");
				if (KIKU_STATE.isAnkiDesktop) sessionStorage.clear();
			};
			window.addEventListener("unload", KIKU_STATE.unload);
		}
		if (KIKU_STATE.isAnkiWeb) {
			KIKU_STATE.logger.info("AnkiWeb detected");
			document.documentElement.setAttribute("data-theme", "none");
			KIKU_STATE.assetsPath = `${window.location.origin}/study/media`;
			document.getElementById("kiku-css")?.remove();
		}
		let root = document.getElementById("kiku-root");
		if (!root) {
			if (aborter.signal.aborted) return;
			const shadowParent$1 = document.querySelector("#kiku-shadow-parent");
			if (shadowParent$1) {
				const existingRoot = shadowParent$1.shadowRoot?.querySelector("#kiku-root");
				if (existingRoot && existingRoot.innerHTML.trim() === "") root = existingRoot;
				else return;
			} else throw new Error("root not found");
		}
		root.part.add("root-part");
		KIKU_STATE.root = root;
		KIKU_STATE.logger.debug("rootDataset", root.dataset);
		const qa = document.querySelector("#qa");
		const shadowParent = document.createElement("div");
		shadowParent.setAttribute("id", "kiku-shadow-parent");
		qa?.appendChild(shadowParent);
		const shadow = shadowParent.attachShadow({ mode: "open" });
		const style = qa?.querySelector("style");
		if (style) shadow?.appendChild(style.cloneNode(true));
		const tailwind = document.querySelector("style[type=\"text/css\"][data-vite-dev-id$=\"tailwind.css\"]");
		if (tailwind) shadow?.appendChild(tailwind.cloneNode(true));
		else {
			const kikuCss = document.createElement("link");
			kikuCss.rel = "stylesheet";
			kikuCss.href = "./_kiku.css";
			shadow?.prepend(kikuCss);
		}
		const kikuPluginCss = document.createElement("link");
		kikuPluginCss.rel = "stylesheet";
		kikuPluginCss.href = "./_kiku_plugin.css";
		shadow?.prepend(kikuPluginCss);
		shadow?.appendChild(root);
		let config$;
		try {
			const cache = sessionStorage.getItem(env.KIKU_CONFIG_SESSION_STORAGE_KEY);
			if (cache) {
				KIKU_STATE.logger.info("config cache hit:", cache);
				config$ = validateConfig(JSON.parse(cache));
			} else {
				KIKU_STATE.logger.info("config cache miss");
				config$ = validateConfig(await (await fetch(env.KIKU_CONFIG_FILE, { cache: "no-store" })).json());
				if (aborter.signal.aborted) return;
				sessionStorage.setItem(env.KIKU_CONFIG_SESSION_STORAGE_KEY, JSON.stringify(config$));
			}
		} catch {
			KIKU_STATE.logger.warn("Failed to load config, using default config");
			config$ = defaultConfig;
		}
		updateConfigState(root, config$);
		const [config, setConfig] = createStore(config$);
		KIKU_STATE.relax = false;
		let dispose;
		if (side === "front") {
			const App = () => createComponent(BreakpointContextProvider, { get children() {
				return createComponent(GeneralContextProvider, {
					aborter,
					get children() {
						return createComponent(AnkiFieldContextProvider, { get children() {
							return createComponent(CardStoreContextProvider, {
								side: "front",
								get children() {
									return createComponent(ConfigContextProvider, {
										value: [config, setConfig],
										get children() {
											return createComponent(FieldGroupContextProvider, { get children() {
												return createComponent(RootFieldGroupContextProvider, { get children() {
													return createComponent(CtxContextProvider, { get children() {
														return createComponent(Layout, { get children() {
															return createComponent(Front, {});
														} });
													} });
												} });
											} });
										}
									});
								}
							});
						} });
					}
				});
			} });
			if (ssr) dispose = hydrate(App, root);
			else dispose = render(App, root);
		} else if (side === "back") {
			const App = () => createComponent(GeneralContextProvider, {
				aborter,
				get children() {
					return createComponent(AnkiFieldContextProvider, { get children() {
						return createComponent(CardStoreContextProvider, {
							side: "back",
							get children() {
								return createComponent(BreakpointContextProvider, { get children() {
									return createComponent(ConfigContextProvider, {
										value: [config, setConfig],
										get children() {
											return createComponent(FieldGroupContextProvider, { get children() {
												return createComponent(RootFieldGroupContextProvider, { get children() {
													return createComponent(CtxContextProvider, { get children() {
														return createComponent(Layout, { get children() {
															return createComponent(Back, {});
														} });
													} });
												} });
											} });
										}
									});
								} });
							}
						});
					} });
				}
			});
			if (ssr) dispose = hydrate(App, root);
			else dispose = render(App, root);
		}
		KIKU_STATE.dispose = dispose;
	} catch (e) {
		sessionStorage.clear();
		Object.assign(document.body.style, {
			margin: 0,
			padding: 0,
			height: "100vh",
			width: "100vw",
			display: "flex",
			flexDirection: "column",
			justifyContent: "center",
			alignItems: "center",
			backgroundColor: "#000",
			color: "#f00",
			textAlign: "center"
		});
		const isError = e instanceof Error;
		document.body.innerHTML = isError ? `
        <span>Failed to render card.</span>
        <span><b>Error Name:</b> ${e.name}</span>
        <span><b>Error Message:</b> ${e.message}</span>
        <span><b>Error Cause:</b> ${e.cause ?? "N/A"}</span>
        <span><b>Error Stack:</b><br>
          <pre style="white-space: pre-wrap; background: #f3f4f6; padding: 8px;">
            ${e.stack}
          </pre>
        </span>
      ` : `<span>Something went wrong.</span>`;
	}
}

//#endregion
export { init };
import { B as createUniqueId, C as style, D as For, E as ErrorBoundary, F as createEffect, G as onMount, J as useContext, L as createRenderEffect, M as createComponent, O as Match, P as createContext, S as spread, T as use, U as mergeProps, W as onCleanup, b as setProperty, c as Portal, d as getNextElement, f as getNextMarker, g as memo, h as isServer, i as shift, j as Switch, k as Show, l as addEventListener, m as insert, n as computePosition, o as createStore, r as flip, s as unwrap, t as arrow, u as classList, v as runHydrationEvents, w as template, x as setStyleProperty, y as setAttribute, z as createSignal } from "./_kiku_libs.js";
import { C as tailwindSize, D as nextTheme, E as daisyUIThemes, F as extractKanji, H as ankiFieldsSkeleton, I as isHtmlEffectivelyEmpty, L as nodesToString, N as useAnkiFieldContext, O as webFonts, P as env, R as parseHtml, S as tailwindFontSizeVar, V as useCardContext, _ as useGeneralContext, b as rootDatasetConfigWhitelist, c as useRootFieldGroupContext, d as useNavigationTransition, f as useThemeTransition, h as useConfigContext, i as useCtxContext, j as useBreakpointContext, k as defaultConfig, p as useViewTransition, s as useFieldGroupContext, v as AnkiConnect, x as tailwindContainerSize, y as getCssVar, z as unique } from "./_kiku_shared.js";

//#region src/components/_kiku_lazy/Icons.tsx
var _tmpl$$17 = /* @__PURE__ */ template(`<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class="lucide lucide-bolt-icon lucide-bolt"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><circle cx=12 cy=12 r=4>`), _tmpl$2$11 = /* @__PURE__ */ template(`<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class="lucide lucide-circle-chevron-down-icon lucide-circle-chevron-down"><circle cx=12 cy=12 r=10></circle><path d="m16 10-4 4-4-4">`), _tmpl$3$10 = /* @__PURE__ */ template(`<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class="lucide lucide-paintbrush-icon lucide-paintbrush"><path d="m14.622 17.897-10.68-2.913"></path><path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z"></path><path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15">`), _tmpl$4$9 = /* @__PURE__ */ template(`<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class="lucide lucide-info-icon lucide-info"><circle cx=12 cy=12 r=10></circle><path d="M12 16v-4"></path><path d="M12 8h.01">`), _tmpl$5$8 = /* @__PURE__ */ template(`<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class="lucide lucide-arrow-left-icon lucide-arrow-left"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5">`), _tmpl$6$8 = /* @__PURE__ */ template(`<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class="lucide lucide-refresh-cw-icon lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5">`), _tmpl$7$6 = /* @__PURE__ */ template(`<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class="lucide lucide-undo-icon lucide-undo"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13">`), _tmpl$8$6 = /* @__PURE__ */ template(`<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class="lucide lucide-play-icon lucide-play"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z">`), _tmpl$9$6 = /* @__PURE__ */ template(`<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class="lucide lucide-clipboard-copy-icon lucide-clipboard-copy"><rect width=8 height=4 x=8 y=2 rx=1 ry=1></rect><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"></path><path d="M16 4h2a2 2 0 0 1 2 2v4"></path><path d="M21 14H11"></path><path d="m15 10-4 4 4 4">`), _tmpl$0$5 = /* @__PURE__ */ template(`<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class="lucide lucide-triangle-alert-icon lucide-triangle-alert"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01">`), _tmpl$1$3 = /* @__PURE__ */ template(`<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5">`), _tmpl$10$3 = /* @__PURE__ */ template(`<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12">`), _tmpl$11$3 = /* @__PURE__ */ template(`<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class="lucide lucide-git-pull-request-arrow-icon lucide-git-pull-request-arrow"><circle cx=5 cy=6 r=3></circle><path d="M5 9v12"></path><circle cx=19 cy=18 r=3></circle><path d="m15 9-3-3 3-3"></path><path d="M12 6h5a2 2 0 0 1 2 2v7">`);
function BoltIcon(props) {
	return (() => {
		var _el$ = getNextElement(_tmpl$$17);
		spread(_el$, props, true, true);
		runHydrationEvents();
		return _el$;
	})();
}
function CircleChevronDownIcon(props) {
	return (() => {
		var _el$2 = getNextElement(_tmpl$2$11);
		spread(_el$2, props, true, true);
		runHydrationEvents();
		return _el$2;
	})();
}
function PaintbrushIcon(props) {
	return (() => {
		var _el$3 = getNextElement(_tmpl$3$10);
		spread(_el$3, props, true, true);
		runHydrationEvents();
		return _el$3;
	})();
}
function InfoIcon(props) {
	return (() => {
		var _el$4 = getNextElement(_tmpl$4$9);
		spread(_el$4, props, true, true);
		runHydrationEvents();
		return _el$4;
	})();
}
function ArrowLeftIcon(props) {
	return (() => {
		var _el$5 = getNextElement(_tmpl$5$8);
		spread(_el$5, props, true, true);
		runHydrationEvents();
		return _el$5;
	})();
}
function RefreshCwIcon(props) {
	return (() => {
		var _el$6 = getNextElement(_tmpl$6$8);
		spread(_el$6, props, true, true);
		runHydrationEvents();
		return _el$6;
	})();
}
function UndoIcon(props) {
	return (() => {
		var _el$7 = getNextElement(_tmpl$7$6);
		spread(_el$7, props, true, true);
		runHydrationEvents();
		return _el$7;
	})();
}
function PlayIcon(props) {
	return (() => {
		var _el$8 = getNextElement(_tmpl$8$6);
		spread(_el$8, props, true, true);
		runHydrationEvents();
		return _el$8;
	})();
}
function ClipboardCopyIcon(props) {
	return (() => {
		var _el$9 = getNextElement(_tmpl$9$6);
		spread(_el$9, props, true, true);
		runHydrationEvents();
		return _el$9;
	})();
}
function CheckIcon(props) {
	return (() => {
		var _el$1 = getNextElement(_tmpl$1$3);
		spread(_el$1, props, true, true);
		runHydrationEvents();
		return _el$1;
	})();
}
function XIcon(props) {
	return (() => {
		var _el$10 = getNextElement(_tmpl$10$3);
		spread(_el$10, props, true, true);
		runHydrationEvents();
		return _el$10;
	})();
}
function GitPullRequestArrow(props) {
	return (() => {
		var _el$11 = getNextElement(_tmpl$11$3);
		spread(_el$11, props, true, true);
		runHydrationEvents();
		return _el$11;
	})();
}

//#endregion
//#region src/components/_kiku_lazy/AudioButtons.tsx
var _tmpl$$16 = /* @__PURE__ */ template(`<div class="flex flex-wrap gap-2">`), _tmpl$2$10 = /* @__PURE__ */ template(`<audio preload=none>`), _tmpl$3$9 = /* @__PURE__ */ template(`<div>`), _tmpl$4$8 = /* @__PURE__ */ template(`<div class="bottom-4 left-4 flex sm:hidden flex-col gap-2 items-center animate-fade-in-sm">`);
function AudioTag(props) {
	const matches = () => [...props.text.matchAll(/\[sound:([^\]]+)\]/g)];
	const sounds = () => matches().map((m) => m[1]);
	KIKU_STATE.logger.info("Using sounds:", sounds().join(", "));
	return createComponent(Show, {
		get when() {
			return sounds().length > 0;
		},
		get children() {
			var _el$ = getNextElement(_tmpl$$16);
			insert(_el$, createComponent(For, {
				get each() {
					return sounds();
				},
				children: (src) => {
					return (() => {
						var _el$2 = getNextElement(_tmpl$2$10);
						setAttribute(_el$2, "src", src);
						return _el$2;
					})();
				}
			}));
			return _el$;
		}
	});
}
function NotePlayIcon(props) {
	return createComponent(PlayIcon, {
		"class": "bg-primary rounded-full text-primary-content p-1 w-8 h-8 cursor-pointer",
		get classList() {
			return {
				"bg-primary text-primary-content": props.color === "primary",
				"bg-secondary text-secondary-content": props.color === "secondary"
			};
		},
		get ["on:click"]() {
			return props["on:click"];
		},
		"on:touchend": (e) => e.stopPropagation()
	});
}
function AudioButtons(props) {
	const [$general] = useGeneralContext();
	const { ankiFields } = useAnkiFieldContext();
	const [$card, $setCard] = useCardContext();
	const { $group } = useFieldGroupContext();
	const [$config] = useConfigContext();
	const bp = useBreakpointContext();
	const hiddenStyle = {
		width: "0",
		height: "0",
		overflow: "hidden",
		position: "absolute"
	};
	createEffect(() => {
		$group.sentenceAudioField;
		const anchors = $card.sentenceAudioRef?.querySelectorAll("a");
		if (anchors?.length) {
			$setCard("sentenceAudios", Array.from(anchors));
			const anchorsHtml = nodesToString(Array.from(anchors));
			KIKU_STATE.logger.info("Anchors in sentence audios:", anchorsHtml);
		}
		const audios = $card.sentenceAudioRef?.querySelectorAll("audio");
		if (audios?.length) {
			$setCard("sentenceAudios", Array.from(audios));
			const audiosHtml = nodesToString(Array.from(audios));
			KIKU_STATE.logger.info("Audios in sentence audios:", audiosHtml);
		}
		if (!anchors?.length && !audios?.length) $setCard("sentenceAudios", void 0);
	});
	let autoPlay = true;
	createEffect(() => {
		$group.sentenceAudioField;
		const useWebVolume = bp.isAtLeast("sm") || KIKU_STATE.isAnkiWeb;
		$card.expressionAudioRef?.querySelectorAll("audio").forEach((el) => {
			el.volume = useWebVolume ? $config.volume / 100 : 1;
		});
		$card.sentenceAudioRef?.querySelectorAll("audio").forEach((el) => {
			el.volume = useWebVolume ? $config.volume / 100 : 1;
		});
		if ($card.nested && autoPlay) {
			autoPlay = false;
			const audio = $card.expressionAudioRef?.querySelector("audio");
			if (audio) {
				audio.play();
				audio.onpause = () => {
					const audio$1 = $card.sentenceAudioRef?.querySelectorAll("audio")[0];
					if (audio$1) audio$1.play();
				};
			}
		}
	});
	onMount(() => {
		if ($card.isNsfw && $config.muteNsfw) $card.expressionAudioRef?.querySelector("a")?.click();
	});
	const NotePlayIcons = () => {
		return [memo(() => memo(() => !!ankiFields.ExpressionAudio)() && createComponent(NotePlayIcon, {
			color: "primary",
			"on:click": () => {
				$card.expressionAudioRef?.querySelector("a")?.click();
				$card.expressionAudioRef?.querySelector("audio")?.play();
			}
		})), memo(() => $card.sentenceAudios?.map((el) => {
			return createComponent(NotePlayIcon, {
				color: "secondary",
				"on:click": () => {
					el.click();
					if (el instanceof HTMLAudioElement) el.play();
				}
			});
		}))];
	};
	if (props.position === 1) return [
		(() => {
			var _el$3 = getNextElement(_tmpl$3$9);
			use((ref) => $setCard("expressionAudioRef", ref), _el$3);
			insert(_el$3, (() => {
				var _c$ = memo(() => !!$card.nested);
				return () => _c$() && createComponent(AudioTag, { get text() {
					return ankiFields.ExpressionAudio;
				} });
			})());
			createRenderEffect((_p$) => {
				var _v$ = hiddenStyle, _v$2 = $card.nested ? void 0 : ankiFields.ExpressionAudio;
				_p$.e = style(_el$3, _v$, _p$.e);
				_v$2 !== _p$.t && setProperty(_el$3, "innerHTML", _p$.t = _v$2);
				return _p$;
			}, {
				e: void 0,
				t: void 0
			});
			return _el$3;
		})(),
		(() => {
			var _el$4 = getNextElement(_tmpl$3$9);
			use((ref) => $setCard("sentenceAudioRef", ref), _el$4);
			insert(_el$4, (() => {
				var _c$2 = memo(() => !!$card.nested);
				return () => _c$2() && createComponent(AudioTag, { get text() {
					return $group.sentenceAudioField;
				} });
			})());
			createRenderEffect((_p$) => {
				var _v$3 = hiddenStyle, _v$4 = $card.nested ? void 0 : $group.sentenceAudioField;
				_p$.e = style(_el$4, _v$3, _p$.e);
				_v$4 !== _p$.t && setProperty(_el$4, "innerHTML", _p$.t = _v$4);
				return _p$;
			}, {
				e: void 0,
				t: void 0
			});
			return _el$4;
		})(),
		createComponent(NotePlayIcons, {})
	];
	if (props.position === 2) return createComponent(Portal, {
		get mount() {
			return $general.layoutRef;
		},
		get children() {
			var _el$5 = getNextElement(_tmpl$4$8);
			insert(_el$5, createComponent(NotePlayIcons, {}));
			createRenderEffect((_p$) => {
				var _v$5 = !KIKU_STATE.isAnkiWeb, _v$6 = !!KIKU_STATE.isAnkiWeb;
				_v$5 !== _p$.e && _el$5.classList.toggle("fixed", _p$.e = _v$5);
				_v$6 !== _p$.t && _el$5.classList.toggle("absolute", _p$.t = _v$6);
				return _p$;
			}, {
				e: void 0,
				t: void 0
			});
			return _el$5;
		}
	});
}

//#endregion
//#region src/components/_kiku_lazy/Sentence.tsx
var _tmpl$$15 = /* @__PURE__ */ template(`<div class="[&amp;_b]:text-base-content-primary sentence font-secondary">`);
function Sentence() {
	const [$card, $setCard] = useCardContext();
	const { $group } = useFieldGroupContext();
	const [$general] = useGeneralContext();
	const { ankiFields } = useAnkiFieldContext();
	const ctx = useCtxContext();
	createEffect(() => {
		if ($card.sentenceFieldRef && $group.sentenceField) $card.sentenceFieldRef.querySelectorAll("ruby").forEach((el) => {
			el.classList.add(..."[&_rt]:invisible hover:[&_rt]:visible".split(" "));
		});
	});
	const animateFadeIn = () => {
		if ($card.side === "back") {
			if (ankiFields.IsAudioCard || ankiFields.IsSentenceCard || ankiFields.IsClickCard || ankiFields.IsWordAndSentenceCard) return false;
		}
		return true;
	};
	function DefaultSentence() {
		return (() => {
			var _el$ = getNextElement(_tmpl$$15);
			use((ref) => $setCard("sentenceFieldRef", ref), _el$);
			createRenderEffect((_p$) => {
				var _v$ = !!animateFadeIn(), _v$2 = $group.sentenceField;
				_v$ !== _p$.e && _el$.classList.toggle("animate-fade-in", _p$.e = _v$);
				_v$2 !== _p$.t && setProperty(_el$, "innerHTML", _p$.t = _v$2);
				return _p$;
			}, {
				e: void 0,
				t: void 0
			});
			return _el$;
		})();
	}
	return createComponent(ErrorBoundary, {
		get fallback() {
			return createComponent(DefaultSentence, {});
		},
		get children() {
			return createComponent(Show, {
				get when() {
					return $general.plugin?.Sentence;
				},
				get fallback() {
					return createComponent(DefaultSentence, {});
				},
				children: (get) => {
					const Sentence$1 = get();
					return createComponent(Sentence$1, {
						ctx,
						DefaultSentence
					});
				}
			});
		}
	});
}

//#endregion
//#region src/components/_kiku_lazy/BackBody.tsx
var _tmpl$$14 = /* @__PURE__ */ template(`<div class="flex sm:flex-col gap-8"><div class="flex flex-col justify-center gap-2 items-center text-center"></div><!$><!/>`), _tmpl$2$9 = /* @__PURE__ */ template(`<div class=animate-fade-in><!$><!/><div class="relative bg-base-200 p-4 border-s-4 border-primary text-base sm:text-xl rounded-lg definition-field"><div class=overflow-auto><!$><!/><div class=contents></div></div><!$><!/></div><div class="flex justify-end py-2 gap-2">`), _tmpl$3$8 = /* @__PURE__ */ template(`<div class="text-end text-base-content-soft text-sm">`), _tmpl$4$7 = /* @__PURE__ */ template(`<div class="max-w-1/3 float-right [&amp;_img]:rounded-sm ps-2 cursor-pointer">`), _tmpl$5$7 = /* @__PURE__ */ template(`<div class="cursor-pointer w-8 h-full absolute top-0 left-0 hover:bg-base-content/10">`), _tmpl$6$7 = /* @__PURE__ */ template(`<div class="cursor-pointer w-8 h-full absolute top-0 right-0 hover:bg-base-content/10">`), _tmpl$7$5 = /* @__PURE__ */ template(`<a target=_blank><img class="size-5 object-contain rounded-xs"src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAXRQTFRF//////39/6+v/2dn/7Oz//7+/9zc/x8f/wAA/yUl/+Li/9/f/yQk/yoq/+Tk/7u7/3h4/7+/+vr65+fn5eXl+/v77+/v5OTk8vLy9PT01tbWx8fH0NDQ6+vr4eHhZmZmWVlZZ2dn4+PjnZ2dV1dXWFhYqqqqzMzMc3NzUVFRS0tLTk5OZGRkqamp9vb23d3dVFRURUVFVVVV4ODgkpKSRERERkZGWlpaUFBQTU1NSEhIl5eXVlZWR0dHYmJitLS019fXysrKhoaGSkpKxMTEzc3Nfn5+g4ODfX19v7+/7Ozs2NjYUlJSnJyc3Nzc3t7ei4uL/v7+zs7OXFxc5ubm6urqnp6ecnJyjo6O/f39+Pj4wMDApqamU1NTZWVlgoKCdnZ2a2tr6enpioqKQkJCbW1t1dXVxcXFgYGBsrKyy8vLX19flpaW/Pz80dHR+fn5xsbGlZWV29vbSUlJwsLCm5ub8/Pzvr6+2tra9fX139/f7e3tX4KuCgAAAVZJREFUeJxjZCAAGOmngBEEfuNRwAZS8A2PAm7GP6yMn/AoYOViZHxPkSOFGBn/M71mEGNkYHwhCXLPYzQFciDBewzKjAhwCUWBPkjoLIMJI+Mn/v9MjH8ZWBivv0NRwMzC9h2o4C8nM0T/r3eSe7Aq4PksupuBQVL3w2+xc6+xKWAQPwsS9/z1mYNnG1YFXEdBfG/GV+/4z2JVILMZxPd7xPZHdiNWBfKM64H8oJvcsoxrsClg/aa5GsgPe/Bb7fol7N6UPmrDyHhK4qfaEuzhoHwWGFonRb4YMM7DqoBV9+I3K4aLHBqMs9CCmu3dr0dgb14PPWvyQnLLY9TIyjr/1/TVapAC6ykMDLlP1qNEt5Cz5Ke7X8TVJ8IUIAGwAu+HPP9+6whPYADGJoNNP6aColvqe3/4PF3OwFD64rLaKkwFZYxAr7WDWF4GDIytmArwATooAAA9VoEhkeDABAAAAABJRU5ErkJggg=="alt=JPDB>`), _tmpl$8$5 = /* @__PURE__ */ template(`<a target=_blank><img class="size-5 object-contain rounded-xs"src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAFpQTFRFVtkm////+f73vPCpXdovWtort++j+P32u++osu2c9Pvx6vjl9Pvy9Pry2u/S5vTh4vLcSLYgR7Qfa79M6/bmc8JWR7QgU9Alf8pjfspiUs4kVc0pVM0nVtgmNSyDBQAAAH5JREFUeJxjZCAAGEcVwBXAFTEyMv5hYGVk/AUT+I+mgIGB/QcD5w8EF1MB5zcG7m/4FACFeL4SUMD7ZVQBDgV8MD7jJ7AC/n8wgU8QBYJwBYyMbxj42Rh/wwTeo6cHccYXDJKMz5CF0BKM9FMGmScMeBTIPgYhPAowwWBQAADBWTUhzGucIAAAAABJRU5ErkJggg=="alt=Jisho>`), _tmpl$9$5 = /* @__PURE__ */ template(`<a target=_blank><img class="size-5 object-contain rounded-xs"src="data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAAE3ElEQVRYhc2XW2xUVRSGv30uU9rTMhUaCuVixQSMpLYmPIhYwAcTIyKFROI1KQmkxBgj8UEf5MEYiSYmPvhAfCASY02MUaFEHjSRQYtGNDAqIhKxQJVeodPLMJ2Zc/by4cz91tZ4+5Od2Wf2Xuv/z9lrr722EhFmiTagA9gEbCwz5wQQAg4D4Vl5FZGZWqeIhGXuCKdsK/qvNNgsIqG/QFyIUMrXnAR0iEjkbyBPI5LyWcSlpDgGOoG3S67XV71wshd+CMPwEAiAAShoXIy0tsL6dtS6u8qt+E7gUO4fhQI6gI+LzM6ehjf2w9AQJC1QgCi/KRMwQZmIYSLKRBYvwXj2KVTLmlIituEHaZGAZvzIDeZN/+BVOPwhTAX850QgS44CZWWaoBDTRgzbd77lfoxdTxYKGMffUZfA/35pHCoif+8F+Pxdvx/wSr1NPpSR/3z2HERvFM4KkrMMaYtOCvf2p8/A5W5ouAHz4+AkoDoJpguGB6QEpT6GAKJUVsstKzBe2QdOTSmpG1OcmSUIA62Z4eEeCD0BV+pgnoahOhhwwBCwVsL23bCuHZxaf340Cl9/g+5+H0YjcOvKSuRpfA+0KRFpA87kDX2xCgYHIWpDNOALmLLhju2w4/kscSGiUeTIMdTWzTORp3GnhR/5WYwdhUA/NBhQKzDtQZUHddvhkZcru3Mc1GMPz4Y4jQ4LP7dnETkK8wywACVgu2DUwQOvzcXxbLHJojD4pnuz/WoBF1j2KATyN0ga310p41pAkc0xCqEpqFhcr3JnbbSK7OJ9oAyUpcAEAsDSLWVfYXd3OQGFGVaxpx262vP/Ldi4KelCZk+LoWDeirICykKpbEs/l0CRABGd7aeMhNLGcxJTxk/xFxAN4uJpl6R4TIuLG79U0b+gEbxU06TSUqpVRlEMEGhGJy4zJRpLmVzXHtWRIzTUbSjpoOueNInK++35EQbGZ+THwi+jMjtB17bjXesDDKLaT7f9I+9Q37QPy6wvcrCnXeWQ+5ichu5v08IkM7725iLzEwZ+DZeB1G9lVAv9nseg1vziac7EJ/nk1z0zv04KB89EGXVjRO0pkkYCVyVJGgnWFsdyyCDnbAaw6zsYtldwUQtXtTCshUEx+HL0Mw5e2MuUO1mR/MBPf7A//DvjNcNMVI8QC0zhGR4PtZQM5MMlD6OJiRDHz91LRBTjYtAnDtd1DWPikAi0squ5i/sa1hO0nIynnoGLvHn+Ar0DMQKx5VhuNbZbg5MIYno2x3fXsTSYJyJzGEGJMizUt5fjVw8wLjaXJciEOEyKw5DXSJwASapI6lpqzflEkh6SDEJ8CYiJii3HdB0CroMdX0BXy0Je2lAUPzuBQ7kVUYiCtNx9oYuPhnoYkIV4YjGmb2JSGnBReFKFxsbVVSgE8Rz09BJQGuJNWLEmPMOlrXYZJ7fdXkh+gtQZlJsHOvHLpQweX/UWmxp3ABCXQHZAzEzXUG6mr6yJTN+1x3lw+SKObV5dSD6e4vJtZlOUnoqc5rmfX+e32AQxCSIYCCag0NryT01dhXjVSHIBtbKUF29bx9OrVxW6ggpFaRqdlCnLj42c4uhImN6x8/RPXwMUIgYKYb5Zz93BNrY0ruHBRS0E7apSLorK8v/8YvK/vZr9a5fTUjFQDv/I9fxPxUx0d1WRkbMAAAAASUVORK5CYII="alt=Google>`);
function BackBody(props) {
	let definitionEl;
	const { ankiFields } = useAnkiFieldContext();
	const [$config] = useConfigContext();
	const initPageIndex = () => {
		if (ankiFields.SelectionText) return 0;
		if (!isHtmlEffectivelyEmpty(ankiFields.MainDefinition)) return 1;
		return 2;
	};
	const [definitionIndex, setDefinitionIndex] = createSignal(initPageIndex());
	const [definitionPicture, setDefinitionPicture] = createSignal();
	const glossary = () => {
		if (ankiFields.MainDefinition === ankiFields.Glossary) return "";
		return removeMainDefinitionFromGlossary(ankiFields.Glossary, ankiFields.MainDefinition);
	};
	const pages = [
		ankiFields.SelectionText,
		ankiFields.MainDefinition,
		glossary()
	];
	const pagesWithContent = pages.filter((page) => !isHtmlEffectivelyEmpty(page?.trim()));
	const pageName = () => {
		if (definitionIndex() === 0) return "Selection Text";
		if (definitionIndex() === 1) return "Main Definition";
		if (definitionIndex() === 2) return "Glossary";
	};
	function changePage(direction) {
		setDefinitionIndex((prev) => {
			let next = (prev + direction + pages.length) % pages.length;
			for (let i = 0; i < pages.length; i++) {
				if (!isHtmlEffectivelyEmpty(pages[next]?.trim())) break;
				next = (next + direction + pages.length) % pages.length;
			}
			return next;
		});
	}
	onMount(() => {
		const imgDoc = parseHtml(ankiFields.DefinitionPicture);
		setDefinitionPicture(imgDoc.querySelector("img")?.outerHTML ?? "");
	});
	onMount(() => {
		const handler = (e) => {
			if (e.key === "ArrowLeft") changePage(-1);
			if (e.key === "ArrowRight") changePage(1);
		};
		window.addEventListener("keydown", handler);
		onCleanup(() => window.removeEventListener("keydown", handler));
	});
	return (() => {
		var _el$ = getNextElement(_tmpl$$14), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, [_el$4, _co$] = getNextMarker(_el$3.nextSibling);
		insert(_el$2, createComponent(Sentence, {}));
		insert(_el$, (() => {
			var _c$ = memo(() => pagesWithContent.length > 0);
			return () => _c$() && (() => {
				var _el$5 = getNextElement(_tmpl$2$9), _el$12 = _el$5.firstChild, [_el$13, _co$4] = getNextMarker(_el$12.nextSibling), _el$6 = _el$13.nextSibling, _el$7 = _el$6.firstChild, _el$9 = _el$7.firstChild, [_el$0, _co$2] = getNextMarker(_el$9.nextSibling), _el$8 = _el$0.nextSibling, _el$1 = _el$7.nextSibling, [_el$10, _co$3] = getNextMarker(_el$1.nextSibling), _el$11 = _el$6.nextSibling;
				insert(_el$5, (() => {
					var _c$2 = memo(() => pagesWithContent.length > 1);
					return () => _c$2() && (() => {
						var _el$14 = getNextElement(_tmpl$3$8);
						insert(_el$14, pageName);
						return _el$14;
					})();
				})(), _el$13, _co$4);
				var _ref$ = definitionEl;
				typeof _ref$ === "function" ? use(_ref$, _el$7) : definitionEl = _el$7;
				insert(_el$7, (() => {
					var _c$3 = memo(() => !!ankiFields.DefinitionPicture);
					return () => _c$3() && (() => {
						var _el$15 = getNextElement(_tmpl$4$7);
						addEventListener(_el$15, "click", () => {
							const picture = definitionPicture();
							if (picture) props.onDefinitionPictureClick?.(picture);
						});
						createRenderEffect(() => setProperty(_el$15, "innerHTML", definitionPicture()));
						return _el$15;
					})();
				})(), _el$0, _co$2);
				insert(_el$6, (() => {
					var _c$4 = memo(() => pagesWithContent.length > 1);
					return () => _c$4() && [(() => {
						var _el$16 = getNextElement(_tmpl$5$7);
						addEventListener(_el$16, "click", () => changePage(-1));
						return _el$16;
					})(), (() => {
						var _el$17 = getNextElement(_tmpl$6$7);
						addEventListener(_el$17, "click", () => changePage(1));
						return _el$17;
					})()];
				})(), _el$10, _co$3);
				insert(_el$11, createComponent(ExternalLinks, {}));
				createRenderEffect(() => setProperty(_el$8, "innerHTML", pages[definitionIndex()]));
				return _el$5;
			})();
		})(), _el$4, _co$);
		createRenderEffect((_p$) => {
			var _v$ = !!$config.swapSentenceAndDefinitionOnMobile, _v$2 = !$config.swapSentenceAndDefinitionOnMobile;
			_v$ !== _p$.e && _el$.classList.toggle("flex-col-reverse", _p$.e = _v$);
			_v$2 !== _p$.t && _el$.classList.toggle("flex-col", _p$.t = _v$2);
			return _p$;
		}, {
			e: void 0,
			t: void 0
		});
		return _el$;
	})();
}
function removeMainDefinitionFromGlossary(glossary, mainDefinition) {
	const parser = new DOMParser();
	const glossaryDoc = parser.parseFromString(glossary, "text/html");
	const mainDefinitionLi = parser.parseFromString(mainDefinition, "text/html").querySelector("div[class=\"yomitan-glossary\"] > ol > li[data-dictionary]");
	if (!mainDefinitionLi) return glossary;
	const mainDefinitionDictionary = mainDefinitionLi.getAttribute("data-dictionary");
	if (!mainDefinitionDictionary) return glossary;
	const glossaries = glossaryDoc.querySelectorAll(`div[class="yomitan-glossary"] > ol > li[data-dictionary]`);
	for (const glossaryLi of glossaries) if (glossaryLi.getAttribute("data-dictionary") === mainDefinitionDictionary) glossaryLi.remove();
	return glossaryDoc.body.innerHTML;
}
function ExternalLinks() {
	const [$general] = useGeneralContext();
	const ctx = useCtxContext();
	return createComponent(ErrorBoundary, {
		get fallback() {
			return createComponent(DefaultExternalLinks, {});
		},
		get children() {
			return createComponent(Show, {
				get when() {
					return $general.plugin?.ExternalLinks;
				},
				get fallback() {
					return createComponent(DefaultExternalLinks, {});
				},
				children: (get) => {
					const ExternalLinks$1 = get();
					return createComponent(ExternalLinks$1, {
						ctx,
						DefaultExternalLinks
					});
				}
			});
		}
	});
}
function DefaultExternalLinks() {
	const { ankiFields } = useAnkiFieldContext();
	return [
		(() => {
			var _el$18 = getNextElement(_tmpl$7$5);
			createRenderEffect(() => setAttribute(_el$18, "href", (() => {
				const url = new URL("https://jpdb.io/search");
				url.searchParams.set("q", ankiFields.Expression);
				return url.toString();
			})()));
			return _el$18;
		})(),
		(() => {
			var _el$19 = getNextElement(_tmpl$8$5);
			createRenderEffect(() => setAttribute(_el$19, "href", `https://jisho.org/search/${ankiFields.Expression}`));
			return _el$19;
		})(),
		(() => {
			var _el$20 = getNextElement(_tmpl$9$5);
			createRenderEffect(() => setAttribute(_el$20, "href", (() => {
				const url = new URL("https://www.google.co.jp/search");
				url.searchParams.set("q", ankiFields.Expression);
				return url.toString();
			})()));
			return _el$20;
		})()
	];
}

//#endregion
//#region src/components/_kiku_lazy/BackFooter.tsx
var _tmpl$$13 = /* @__PURE__ */ template(`<div class="flex gap-2 items-center justify-center animate-fade-in flex-wrap">`), _tmpl$2$8 = /* @__PURE__ */ template(`<div class="flex gap-2 items-center justify-center bg-base-200 p-2 rounded-lg animate-fade-in misc-info"><div class=min-w-4></div><div class=text-base-content-calm>`), _tmpl$3$7 = /* @__PURE__ */ template(`<div class="badge badge-secondary">`);
function BackFooter(props) {
	const [$general] = useGeneralContext();
	const { $group } = useFieldGroupContext();
	const ctx = useCtxContext();
	const tags = () => props.tags.filter(Boolean);
	function DefaultFooter() {
		return [memo(() => memo(() => !!$group.miscInfoField)() && (() => {
			var _el$2 = getNextElement(_tmpl$2$8), _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling;
			insert(_el$3, createComponent(InfoIcon, { "class": "size-4 text-base-content-calm" }));
			createRenderEffect(() => setProperty(_el$4, "innerHTML", $group.miscInfoField));
			return _el$2;
		})()), createComponent(Show, {
			get when() {
				return tags().length;
			},
			get children() {
				var _el$ = getNextElement(_tmpl$$13);
				insert(_el$, () => tags().map((tag) => {
					return (() => {
						var _el$5 = getNextElement(_tmpl$3$7);
						insert(_el$5, tag);
						return _el$5;
					})();
				}));
				return _el$;
			}
		})];
	}
	return createComponent(ErrorBoundary, {
		get fallback() {
			return createComponent(DefaultFooter, {});
		},
		get children() {
			return createComponent(Show, {
				get when() {
					return $general.plugin?.Footer;
				},
				get fallback() {
					return createComponent(DefaultFooter, {});
				},
				children: (get) => {
					const Footer = get();
					return createComponent(Footer, {
						ctx,
						DefaultFooter
					});
				}
			});
		}
	});
}

//#endregion
//#region src/components/_kiku_lazy/KanjiContext.tsx
var KanjiContext = createContext();
function KanjiContextProvider(props) {
	const [$general, $setGeneral] = useGeneralContext();
	const { ankiFields } = useAnkiFieldContext();
	const [$kanji, $setKanji] = createStore({
		kanji: props.kanji,
		kanjiInfo: void 0,
		loading: {
			visuallySimilar: false,
			composedOf: false,
			usedIn: false,
			related: false
		},
		fetchNotes,
		fetched: /* @__PURE__ */ new Set()
	});
	const lookupKanjiCache = $general.lookupKanjiCache;
	async function fetchNotes(type) {
		const nex = await (await $general.nexClientPromise.promise).nex;
		const kanjiInfo = unwrap($kanji.kanjiInfo);
		if (!kanjiInfo) return;
		if ($kanji.fetched.has(type)) return;
		$kanji.fetched.add(type);
		const list = kanjiInfo[type] ?? [];
		if (list.length === 0) {
			$setKanji(type, []);
			return;
		}
		$setKanji("loading", type, true);
		const result = await nex.queryShared({
			ankiFields: unwrap(ankiFields),
			kanjiList: list
		});
		$setKanji(type, Object.entries(result.kanjiResult));
		$setKanji("loading", type, false);
	}
	onMount(async () => {
		const nex = await (await $general.nexClientPromise.promise).nex;
		if (nex && props.kanji) {
			let kanjiInfo = lookupKanjiCache.get(props.kanji);
			if (!kanjiInfo) {
				kanjiInfo = await nex.lookupKanji(props.kanji);
				lookupKanjiCache.set(props.kanji, kanjiInfo);
			}
			$setKanji("kanjiInfo", kanjiInfo);
		}
	});
	return createComponent(KanjiContext.Provider, {
		value: [$kanji, $setKanji],
		get children() {
			return props.children;
		}
	});
}
function useKanjiContext() {
	const kanjiStore = useContext(KanjiContext);
	if (!kanjiStore) throw new Error("Missing KanjiContext");
	return kanjiStore;
}

//#endregion
//#region src/components/_kiku_lazy/KanjiPageContext.tsx
var KanjiPageContext = createContext();
var cache = /* @__PURE__ */ new Map();
function KanjiPageContextProvider(props) {
	const [$kanjiPage, $setKanjiPage] = cache.get(props.id) ?? createStore({
		noteList: props.noteList,
		contextLabel: props.contextLabel,
		sameReading: props.sameReading,
		sameExpression: props.sameExpression,
		focus: {
			kanji: props.focus?.kanji,
			noteId: props.focus?.noteId
		},
		nested: props.nested ?? false,
		nestedId: createUniqueId(),
		nestedNoteList: [],
		nestedFocus: {
			kanji: void 0,
			noteId: void 0
		},
		nestedContextLabel: void 0
	});
	onMount(() => {
		cache.set(props.id, [$kanjiPage, $setKanjiPage]);
	});
	return createComponent(KanjiPageContext.Provider, {
		value: [$kanjiPage, $setKanjiPage],
		get children() {
			return props.children;
		}
	});
}
function useKanjiPageContext() {
	const kanjiPageStore = useContext(KanjiPageContext);
	if (!kanjiPageStore) throw new Error("Missing KanjiPageContext");
	return kanjiPageStore;
}

//#endregion
//#region src/components/_kiku_lazy/util/general.ts
function capitalize(s) {
	return s.charAt(0).toUpperCase() + s.slice(1);
}
var DEFAULT_EXCEPTIONS = new Set([
	"of",
	"and",
	"to",
	"in",
	"on",
	"for",
	"with",
	"a",
	"an",
	"the"
]);
function capitalizeSmart(word, exceptions = DEFAULT_EXCEPTIONS) {
	const lower = word.toLowerCase();
	if (exceptions.has(lower)) return lower;
	return lower.charAt(0).toUpperCase() + lower.slice(1);
}
function capitalizeSentence(sentence) {
	return sentence?.split(" ").map((k) => capitalizeSmart(k)).join(" ");
}

//#endregion
//#region src/components/_kiku_lazy/KanjiInfo.tsx
var _tmpl$$12 = /* @__PURE__ */ template(`<div class="flex flex-col text-xs sm:text-sm text-base-content-calm items-start z-10 relative"><div><span class="inline-flex flex-wrap gap-x-1 sm:gap-x-2"><span>Keyword: </span><span></span></span></div><div><span class="inline-flex flex-wrap gap-x-1 sm:gap-x-2"><span>Frequency: </span><span></span></span></div><div><span class="inline-flex flex-wrap gap-x-1 sm:gap-x-2 gap-y-0.5"><span>Reading: </span><!$><!/>`), _tmpl$2$7 = /* @__PURE__ */ template(`<span class="border border-base-content-subtle-100 inline-flex"><span class=px-0.5></span><span class="border-s border-base-300 px-0.5 bg-base-300 text-base-content-soft">`), _tmpl$3$6 = /* @__PURE__ */ template(`<div class="collapse collapse-arrow rounded-none"><input type=checkbox class=p-0><div class="collapse-title p-0 mb-1 after:text-base-content-calm text-start"><div class="font-bold text-base-content-calm">Visually Similar</div></div><div class="collapse-content p-0"><div class="flex gap-1 sm:gap-2 flex-wrap text-base-content-calm">`), _tmpl$4$6 = /* @__PURE__ */ template(`<div class="collapse collapse-arrow rounded-none"><input type=checkbox class=p-0><div class="collapse-title p-0 mb-1 after:text-base-content-calm text-start"><div class="font-bold text-base-content-calm">Composed of</div></div><div class="collapse-content p-0"><div class="flex gap-1 sm:gap-2 flex-wrap text-base-content-calm">`), _tmpl$5$6 = /* @__PURE__ */ template(`<div class="collapse collapse-arrow rounded-none"><input type=checkbox class=p-0><div class="collapse-title p-0 mb-1 after:text-base-content-calm text-start"><div class="font-bold text-base-content-calm">Used in</div></div><div class="collapse-content p-0"><div class="flex gap-1 sm:gap-2 flex-wrap text-base-content-calm">`), _tmpl$6$6 = /* @__PURE__ */ template(`<div class="collapse collapse-arrow rounded-none"><input type=checkbox class=p-0><div class="collapse-title p-0 mb-1 after:text-base-content-calm text-start"><div class="font-bold text-base-content-calm">Meanings</div></div><div class="collapse-content p-0"><div class="flex gap-1 sm:gap-2 flex-wrap text-base-content-calm">`), _tmpl$7$4 = /* @__PURE__ */ template(`<div class="collapse collapse-arrow rounded-none"><input type=checkbox class=p-0><div class="collapse-title p-0 mb-1 after:text-base-content-calm text-start"><div class="font-bold text-base-content-calm">Related</div></div><div class="collapse-content p-0"><div class="flex gap-1 sm:gap-2 flex-wrap text-base-content-calm">`), _tmpl$8$4 = /* @__PURE__ */ template(`<div class="border border-base-300 inline-flex px-1 bg-base-300">`), _tmpl$9$4 = /* @__PURE__ */ template(`<div class="bg-base-300 border-s border-base-300 px-1 text-base-content-soft flex items-center">`), _tmpl$0$4 = /* @__PURE__ */ template(`<div class="inline-flex border border-base-content-subtle-100 transition-colors hover:border-base-content-subtle-200"><div class=" px-1 text-lg sm:text-xl"></div><!$><!/>`);
function KanjiInfo() {
	const [$kanji, $setKanji] = useKanjiContext();
	return (() => {
		var _el$ = getNextElement(_tmpl$$12), _el$2 = _el$.firstChild, _el$5 = _el$2.firstChild.firstChild.nextSibling, _el$6 = _el$2.nextSibling, _el$9 = _el$6.firstChild.firstChild.nextSibling, _el$0 = _el$6.nextSibling, _el$1 = _el$0.firstChild, _el$11 = _el$1.firstChild.nextSibling, [_el$12, _co$] = getNextMarker(_el$11.nextSibling);
		insert(_el$5, () => capitalizeSentence($kanji.kanjiInfo?.keyword));
		insert(_el$9, () => $kanji.kanjiInfo?.frequency);
		insert(_el$1, createComponent(For, {
			get each() {
				return $kanji.kanjiInfo?.readings;
			},
			children: (reading) => {
				return createComponent(Show, {
					get when() {
						return reading.percentage;
					},
					get children() {
						var _el$13 = getNextElement(_tmpl$2$7), _el$14 = _el$13.firstChild, _el$15 = _el$14.nextSibling;
						insert(_el$14, () => reading.reading);
						insert(_el$15, () => reading.percentage);
						return _el$13;
					}
				});
			}
		}), _el$12, _co$);
		createRenderEffect((_p$) => {
			var _v$ = !$kanji.kanjiInfo?.keyword, _v$2 = !$kanji.kanjiInfo?.frequency, _v$3 = !$kanji.kanjiInfo?.readings.length;
			_v$ !== _p$.e && _el$2.classList.toggle("hidden", _p$.e = _v$);
			_v$2 !== _p$.t && _el$6.classList.toggle("hidden", _p$.t = _v$2);
			_v$3 !== _p$.a && _el$0.classList.toggle("hidden", _p$.a = _v$3);
			return _p$;
		}, {
			e: void 0,
			t: void 0,
			a: void 0
		});
		return _el$;
	})();
}
function KanjiInfoExtra(props) {
	const [$kanji, $setKanji] = useKanjiContext();
	const KanjiKeywordComponent = props.inKanjiPage ? KanjiKeywordKanjiPage : KanjiKeyword;
	const [$checkbox, $setCheckbox] = createStore({
		visuallySimilar: true,
		composedOf: false,
		usedIn: false,
		meanings: false,
		related: false
	});
	const [$checkboxRef, $setCheckboxRef] = createStore({ composedOf: void 0 });
	createEffect(() => {
		const composedOfRef = $checkboxRef.composedOf;
		const visuallySimilarLength = $kanji.kanjiInfo?.visuallySimilar.length;
		if (composedOfRef) {
			if (!visuallySimilarLength) composedOfRef.checked = true;
			$setCheckbox("composedOf", composedOfRef.checked);
		}
	});
	createEffect(() => {
		if ($checkbox.visuallySimilar) $kanji.fetchNotes("visuallySimilar");
		if ($checkbox.composedOf) $kanji.fetchNotes("composedOf");
		if ($checkbox.usedIn) $kanji.fetchNotes("usedIn");
		if ($checkbox.related) $kanji.fetchNotes("related");
	});
	return [
		createComponent(Show, {
			get when() {
				return $kanji.kanjiInfo?.visuallySimilar.length;
			},
			get children() {
				var _el$16 = getNextElement(_tmpl$3$6), _el$17 = _el$16.firstChild, _el$20 = _el$17.nextSibling.nextSibling.firstChild;
				addEventListener(_el$17, "change", (e) => {
					$setCheckbox("visuallySimilar", e.currentTarget.checked);
				});
				insert(_el$20, createComponent(For, {
					get each() {
						return $kanji.kanjiInfo?.visuallySimilar;
					},
					children: (kanji) => {
						return createComponent(KanjiContextProvider, {
							kanji,
							get children() {
								return createComponent(KanjiKeywordComponent, {
									get parentKanji() {
										return $kanji.kanji;
									},
									get noteList() {
										return $kanji.visuallySimilar;
									},
									nestedFocus: {
										kanji,
										noteId: void 0
									},
									get contextLabel() {
										return {
											text: $kanji.kanji,
											type: "similar"
										};
									}
								});
							}
						});
					}
				}));
				createRenderEffect(() => setProperty(_el$17, "checked", $checkbox.visuallySimilar));
				return _el$16;
			}
		}),
		createComponent(Show, {
			get when() {
				return $kanji.kanjiInfo?.composedOf.length;
			},
			get children() {
				var _el$21 = getNextElement(_tmpl$4$6), _el$22 = _el$21.firstChild, _el$25 = _el$22.nextSibling.nextSibling.firstChild;
				addEventListener(_el$22, "change", (e) => {
					$setCheckbox("composedOf", e.currentTarget.checked);
				});
				use((ref) => $setCheckboxRef("composedOf", ref), _el$22);
				insert(_el$25, createComponent(For, {
					get each() {
						return $kanji.kanjiInfo?.composedOf;
					},
					children: (kanji) => {
						return createComponent(KanjiContextProvider, {
							kanji,
							get children() {
								return createComponent(KanjiKeywordComponent, {
									get parentKanji() {
										return $kanji.kanji;
									},
									get noteList() {
										return $kanji.composedOf;
									},
									nestedFocus: {
										kanji,
										noteId: void 0
									},
									get contextLabel() {
										return {
											text: $kanji.kanji,
											type: "composedOf"
										};
									}
								});
							}
						});
					}
				}));
				createRenderEffect(() => setProperty(_el$22, "checked", $checkbox.composedOf));
				return _el$21;
			}
		}),
		createComponent(Show, {
			get when() {
				return $kanji.kanjiInfo?.usedIn.length;
			},
			get children() {
				var _el$26 = getNextElement(_tmpl$5$6), _el$27 = _el$26.firstChild, _el$30 = _el$27.nextSibling.nextSibling.firstChild;
				addEventListener(_el$27, "change", (e) => {
					$setCheckbox("usedIn", e.currentTarget.checked);
				});
				insert(_el$30, createComponent(For, {
					get each() {
						return $kanji.kanjiInfo?.usedIn;
					},
					children: (kanji) => {
						return createComponent(KanjiContextProvider, {
							kanji,
							get children() {
								return createComponent(KanjiKeywordComponent, {
									get parentKanji() {
										return $kanji.kanji;
									},
									get noteList() {
										return $kanji.usedIn;
									},
									nestedFocus: {
										kanji,
										noteId: void 0
									},
									get contextLabel() {
										return {
											text: $kanji.kanji,
											type: "usedIn"
										};
									}
								});
							}
						});
					}
				}));
				createRenderEffect(() => setProperty(_el$27, "checked", $checkbox.usedIn));
				return _el$26;
			}
		}),
		createComponent(Show, {
			get when() {
				return $kanji.kanjiInfo?.meanings.length;
			},
			get children() {
				var _el$31 = getNextElement(_tmpl$6$6), _el$32 = _el$31.firstChild, _el$35 = _el$32.nextSibling.nextSibling.firstChild;
				addEventListener(_el$32, "change", (e) => {
					$setCheckbox("meanings", e.currentTarget.checked);
				});
				insert(_el$35, createComponent(For, {
					get each() {
						return $kanji.kanjiInfo?.meanings;
					},
					children: (meaning) => {
						return (() => {
							var _el$41 = getNextElement(_tmpl$8$4);
							insert(_el$41, meaning);
							return _el$41;
						})();
					}
				}));
				createRenderEffect(() => setProperty(_el$32, "checked", $checkbox.meanings));
				return _el$31;
			}
		}),
		createComponent(Show, {
			get when() {
				return $kanji.kanjiInfo?.related.length;
			},
			get children() {
				var _el$36 = getNextElement(_tmpl$7$4), _el$37 = _el$36.firstChild, _el$40 = _el$37.nextSibling.nextSibling.firstChild;
				addEventListener(_el$37, "change", (e) => {
					$setCheckbox("related", e.currentTarget.checked);
				});
				insert(_el$40, createComponent(For, {
					get each() {
						return $kanji.kanjiInfo?.related;
					},
					children: (kanji) => {
						return createComponent(KanjiContextProvider, {
							kanji,
							get children() {
								return createComponent(KanjiKeywordComponent, {
									get parentKanji() {
										return $kanji.kanji;
									},
									get noteList() {
										return $kanji.related;
									},
									nestedFocus: {
										kanji,
										noteId: void 0
									},
									get contextLabel() {
										return {
											text: $kanji.kanji,
											type: "related"
										};
									}
								});
							}
						});
					}
				}));
				createRenderEffect(() => setProperty(_el$37, "checked", $checkbox.related));
				return _el$36;
			}
		})
	];
}
function KanjiKeyword(props) {
	const [$kanji, $setKanji] = useKanjiContext();
	const keyword = () => $kanji.kanjiInfo?.wkMeaning ? $kanji.kanjiInfo?.wkMeaning : $kanji.kanjiInfo?.keyword;
	const ready = () => !!props.noteList;
	return (() => {
		var _el$42 = getNextElement(_tmpl$0$4), _el$43 = _el$42.firstChild, _el$45 = _el$43.nextSibling, [_el$46, _co$2] = getNextMarker(_el$45.nextSibling);
		addEventListener(_el$42, "click", props.onClick);
		insert(_el$43, () => $kanji.kanji);
		insert(_el$42, createComponent(Show, {
			get when() {
				return keyword();
			},
			get children() {
				var _el$44 = getNextElement(_tmpl$9$4);
				insert(_el$44, () => capitalizeSentence(keyword()));
				return _el$44;
			}
		}), _el$46, _co$2);
		createRenderEffect((_p$) => {
			var _v$4 = !!ready(), _v$5 = !ready(), _v$6 = !!ready(), _v$7 = !ready();
			_v$4 !== _p$.e && _el$42.classList.toggle("cursor-pointer", _p$.e = _v$4);
			_v$5 !== _p$.t && _el$42.classList.toggle("cursor-not-allowed", _p$.t = _v$5);
			_v$6 !== _p$.a && _el$42.classList.toggle("text-base-content-calm", _p$.a = _v$6);
			_v$7 !== _p$.o && _el$42.classList.toggle("text-base-content-soft", _p$.o = _v$7);
			return _p$;
		}, {
			e: void 0,
			t: void 0,
			a: void 0,
			o: void 0
		});
		return _el$42;
	})();
}
function KanjiKeywordKanjiPage(props) {
	const [$kanjiPage, $setKanjiPage] = useKanjiPageContext();
	const { navigate } = useNavigationTransition();
	const onClick = () => {
		const noteList = props.noteList;
		if (!noteList) return;
		navigate(() => {
			$setKanjiPage("nestedContextLabel", props.contextLabel);
			$setKanjiPage("nestedId", createUniqueId());
			$setKanjiPage("nestedFocus", {
				kanji: props.nestedFocus.kanji,
				noteId: props.nestedFocus.noteId
			});
			$setKanjiPage("focus", {
				kanji: props.parentKanji,
				noteId: void 0
			});
			$setKanjiPage("nestedNoteList", noteList);
			$setKanjiPage("nested", true);
		}, "forward", () => navigate(() => $setKanjiPage("nested", false), "back"));
	};
	return createComponent(KanjiKeyword, mergeProps(props, { onClick }));
}

//#endregion
//#region src/components/_kiku_lazy/util/parseFurigana.ts
var isKanji = (char) => /[\u4E00-\u9FFF\u3005]/.test(char);
var isKana = (char) => /[\u3040-\u30FF]/.test(char);
function tokenize(input) {
	const tokens = [];
	let i = 0;
	while (i < input.length) {
		const char = input[i];
		if (char === "[") {
			let value = "";
			i++;
			while (i < input.length && input[i] !== "]") {
				value += input[i];
				i++;
			}
			if (input[i] === "]") i++;
			tokens.push({
				type: "furigana",
				value
			});
			continue;
		}
		if (isKanji(char)) tokens.push({
			type: "kanji",
			value: char
		});
		else if (isKana(char)) tokens.push({
			type: "kana",
			value: char
		});
		else tokens.push({
			type: "kana",
			value: char
		});
		i++;
	}
	return tokens;
}
function tokensToRenderItems(tokens) {
	const result = [];
	let textBuffer = "";
	let kanjiBuffer = "";
	const flushText = () => {
		if (textBuffer) {
			result.push({
				type: "text",
				text: textBuffer
			});
			textBuffer = "";
		}
	};
	const flushKanjiAsText = () => {
		if (kanjiBuffer) {
			textBuffer += kanjiBuffer;
			kanjiBuffer = "";
		}
	};
	for (const token of tokens) switch (token.type) {
		case "kanji":
			kanjiBuffer += token.value;
			break;
		case "furigana":
			if (kanjiBuffer) {
				flushText();
				result.push({
					type: "ruby",
					text: kanjiBuffer,
					reading: token.value
				});
				kanjiBuffer = "";
			}
			break;
		case "kana":
			flushKanjiAsText();
			textBuffer += token.value;
			break;
	}
	flushKanjiAsText();
	flushText();
	return result;
}
function parseFurigana(input) {
	return tokensToRenderItems(tokenize(input));
}

//#endregion
//#region src/components/_kiku_lazy/Expression.tsx
var _tmpl$$11 = /* @__PURE__ */ template(`<ruby><!$><!/><rt>`), _tmpl$2$6 = /* @__PURE__ */ template(`<span class=relative><!$><!/><!$><!/>`), _tmpl$3$5 = /* @__PURE__ */ template(`<ruby><!$><!/><!$><!/>`), _tmpl$4$5 = /* @__PURE__ */ template(`<rt>`), _tmpl$5$5 = /* @__PURE__ */ template(`<span>`), _tmpl$6$5 = /* @__PURE__ */ template(`<div class="absolute z-10 overflow-hidden hidden rounded-lg horizontal-tb"><div class="absolute bg-base-content-faint size-8 rotate-45 z-20 -translate-y-6"></div><div class="relative text-base bg-base-200/97 z-10 p-2 sm:p-4 border border-base-300 rounded-lg font-primary w-xs sm:w-md lg:w-lg shadow-lg max-h-[75svh] overflow-auto"><!$><!/><div class="text-sm mt-2 sm:mt-4 flex flex-col gap-1 sm:gap-2">`);
function Expression() {
	const [$card, $setCard] = useCardContext();
	const { ankiFields } = useAnkiFieldContext();
	const bp = useBreakpointContext();
	const [$kanjiEl, $setKanjiEl] = createStore({ el: {
		kanji: {},
		tooltip: {},
		arrow: {}
	} });
	function isValidExpressionFurigana() {
		if (ankiFields.ExpressionFurigana.includes("<ruby")) return false;
		if (!ankiFields.ExpressionFurigana.includes("[")) return false;
		return true;
	}
	if (!isValidExpressionFurigana()) return null;
	function showEl(el) {
		el.style.display = "block";
		applyTooltip();
	}
	function hideEl(el) {
		el.style.display = "";
	}
	function applyTooltip() {
		Object.entries($kanjiEl.el.kanji).forEach(([char, kanji]) => {
			const tooltip = $kanjiEl.el.tooltip[char];
			const arrowEl = $kanjiEl.el.arrow[char];
			if (kanji && tooltip && arrowEl) computePosition(kanji, tooltip, {
				placement: bp.isAtLeast("sm") ? "bottom-start" : "bottom",
				middleware: [
					flip(),
					shift({ padding: 5 }),
					arrow({ element: arrowEl })
				]
			}).then(({ x, y, placement, middlewareData }) => {
				Object.assign(tooltip.style, {
					left: `${x}px`,
					top: `${y}px`
				});
				const { x: arrowX, y: arrowY } = middlewareData.arrow ?? {
					x: 0,
					y: 0
				};
				const staticSide = {
					top: "bottom",
					right: "left",
					bottom: "top",
					left: "right"
				}[placement.split("-")[0]] ?? "never";
				Object.assign(arrowEl.style, {
					left: arrowX != null ? `${arrowX}px` : "",
					top: arrowY != null ? `${arrowY}px` : "",
					right: "",
					bottom: "",
					[staticSide]: "-4px"
				});
			});
		});
	}
	onMount(() => {
		applyTooltip();
		[
			["mouseenter", showEl],
			["mouseleave", hideEl],
			["focus", showEl],
			["blur", hideEl]
		].forEach(([event, listener]) => {
			Object.entries($kanjiEl.el.kanji).forEach(([char, kanji]) => {
				const tooltip = $kanjiEl.el.tooltip[char];
				if (kanji && tooltip) kanji.addEventListener(event, () => {
					listener(tooltip);
				});
			});
		});
		setTimeout(() => {
			$setCard("expressionReady", true);
		}, 100);
	});
	const furiganaData = parseFurigana(ankiFields.ExpressionFurigana);
	if (furiganaData.length === 0) return (() => {
		var _el$ = getNextElement(_tmpl$$11), _el$3 = _el$.firstChild, [_el$4, _co$] = getNextMarker(_el$3.nextSibling), _el$2 = _el$4.nextSibling;
		insert(_el$, () => ankiFields.Expression.split("").map((char, i) => (() => {
			var _el$5 = getNextElement(_tmpl$2$6), _el$6 = _el$5.firstChild, [_el$7, _co$2] = getNextMarker(_el$6.nextSibling), _el$8 = _el$7.nextSibling, [_el$9, _co$3] = getNextMarker(_el$8.nextSibling);
			use((el) => {
				$setKanjiEl("el", "kanji", char + i, el);
			}, _el$5);
			insert(_el$5, createComponent(KanjiContextProvider, {
				get kanji() {
					return extractKanji(char)[0] ?? "";
				},
				get children() {
					return createComponent(KanjiTooltip, {
						arrowRef: (el) => $setKanjiEl("el", "arrow", char + i, el),
						ref: (el) => $setKanjiEl("el", "tooltip", char + i, el)
					});
				}
			}), _el$7, _co$2);
			insert(_el$5, char, _el$9, _co$3);
			return _el$5;
		})()), _el$4, _co$);
		insert(_el$2, () => ankiFields.ExpressionReading);
		return _el$;
	})();
	function CharSpan(props) {
		const key = props.char + props.i + "-" + props.j;
		return (() => {
			var _el$0 = getNextElement(_tmpl$2$6), _el$1 = _el$0.firstChild, [_el$10, _co$4] = getNextMarker(_el$1.nextSibling), _el$11 = _el$10.nextSibling, [_el$12, _co$5] = getNextMarker(_el$11.nextSibling);
			use((el) => $setKanjiEl("el", "kanji", key, el), _el$0);
			insert(_el$0, createComponent(KanjiContextProvider, {
				get kanji() {
					return extractKanji(props.char)[0] ?? "";
				},
				get children() {
					return createComponent(KanjiTooltip, {
						arrowRef: (el) => $setKanjiEl("el", "arrow", key, el),
						ref: (el) => $setKanjiEl("el", "tooltip", key, el)
					});
				}
			}), _el$10, _co$4);
			insert(_el$0, () => props.char, _el$12, _co$5);
			return _el$0;
		})();
	}
	return memo(() => furiganaData.map((item, i) => {
		const chars = item.text.trim().split("");
		if (item.type === "ruby") return (() => {
			var _el$13 = getNextElement(_tmpl$3$5), _el$14 = _el$13.firstChild, [_el$15, _co$6] = getNextMarker(_el$14.nextSibling), _el$16 = _el$15.nextSibling, [_el$17, _co$7] = getNextMarker(_el$16.nextSibling);
			insert(_el$13, () => chars.map((char, j) => createComponent(CharSpan, {
				char,
				i,
				j
			})), _el$15, _co$6);
			insert(_el$13, (() => {
				var _c$ = memo(() => item.reading.trim() !== "");
				return () => _c$() && (() => {
					var _el$18 = getNextElement(_tmpl$4$5);
					insert(_el$18, () => item.reading);
					return _el$18;
				})();
			})(), _el$17, _co$7);
			return _el$13;
		})();
		return (() => {
			var _el$19 = getNextElement(_tmpl$5$5);
			insert(_el$19, () => chars.map((char, j) => createComponent(CharSpan, {
				char,
				i,
				j
			})));
			return _el$19;
		})();
	}));
}
function KanjiTooltip(props) {
	const [$kanji, $setKanji] = useKanjiContext();
	if (!$kanji.kanji) return null;
	return (() => {
		var _el$20 = getNextElement(_tmpl$6$5), _el$21 = _el$20.firstChild, _el$22 = _el$21.nextSibling, _el$24 = _el$22.firstChild, [_el$25, _co$8] = getNextMarker(_el$24.nextSibling), _el$23 = _el$25.nextSibling;
		var _ref$ = props.ref;
		typeof _ref$ === "function" ? use(_ref$, _el$20) : props.ref = _el$20;
		var _ref$2 = props.arrowRef;
		typeof _ref$2 === "function" ? use(_ref$2, _el$21) : props.arrowRef = _el$21;
		insert(_el$22, createComponent(KanjiInfo, {}), _el$25, _co$8);
		insert(_el$23, createComponent(KanjiInfoExtra, {}));
		return _el$20;
	})();
}

//#endregion
//#region src/components/_kiku_lazy/HeaderLayout.tsx
var _tmpl$$10 = /* @__PURE__ */ template(`<div class="top-0 left-0 w-full py-2 sm:py-4 bg-base-100/90 backdrop-blur-xs z-10"><div class="w-full mx-auto px-2 sm:px-4 layout-max-width"><div class="flex justify-between flex-row h-6 items-center min-h-6">`);
function HeaderLayout(props) {
	const [$general] = useGeneralContext();
	return createComponent(Portal, {
		get mount() {
			return $general.layoutRef;
		},
		get children() {
			var _el$ = getNextElement(_tmpl$$10), _el$3 = _el$.firstChild.firstChild;
			insert(_el$3, () => props.children);
			createRenderEffect((_p$) => {
				var _v$ = !KIKU_STATE.isAnkiWeb, _v$2 = !!KIKU_STATE.isAnkiWeb;
				_v$ !== _p$.e && _el$.classList.toggle("fixed", _p$.e = _v$);
				_v$2 !== _p$.t && _el$.classList.toggle("absolute", _p$.t = _v$2);
				return _p$;
			}, {
				e: void 0,
				t: void 0
			});
			return _el$;
		}
	});
}

//#endregion
//#region src/components/_kiku_lazy/MergeContextModal.tsx
var _tmpl$$9 = /* @__PURE__ */ template(`<span class="loading loading-spinner loading-xs text-base-content-faint animate-fade-in-sm">`), _tmpl$2$5 = /* @__PURE__ */ template(`<span class=animate-fade-in-sm><span class="status status-error animate-ping">`), _tmpl$3$4 = /* @__PURE__ */ template(`<div class="indicator animate-fade-in-sm"><div class=place-items-center></div><span class="status status-error animate-ping">`), _tmpl$4$4 = /* @__PURE__ */ template(`<div role=alert class="alert alert-warning">Root and Current have different Expression`), _tmpl$5$4 = /* @__PURE__ */ template(`<div role=alert class="alert alert-warning">Some fields have duplicates data-group-id`), _tmpl$6$4 = /* @__PURE__ */ template(`<fieldset class=fieldset><legend class=fieldset-legend>Delete Root Note</legend><label class=label><input type=checkbox class=toggle>`), _tmpl$7$3 = /* @__PURE__ */ template(`<div role=alert class="alert alert-warning"><span>To prevent unwanted result caused by stale notes cache, please enable <b>"Prefer AnkiConnect"</b> in Settings.`), _tmpl$8$3 = /* @__PURE__ */ template(`<dialog class=modal><div class="modal-box max-h-[80svh]"><h3 class="text-lg font-bold mb-4">Merge Context</h3><div class="flex flex-col gap-4"><div class="flex gap-4 items-center justify-center"><div class="flex flex-col items-center"><div>Root</div><div class="text-base-content-calm text-xs"></div><!$><!/></div><!$><!/><div class="flex flex-col items-center"><div>Current</div><div class="text-base-content-calm text-xs"></div><!$><!/></div></div><!$><!/><!$><!/><div class="flex flex-col gap-2"><!$><!/><!$><!/><!$><!/><!$><!/><!$><!/><!$><!/></div><!$><!/><!$><!/></div><div class=modal-action><form method=dialog><button class=btn>Close</button></form><button class="btn btn-secondary">Preview</button><button class=btn>Merge</button></div></div><form method=dialog class=modal-backdrop><button>Close`), _tmpl$9$3 = /* @__PURE__ */ template(`<div class="text-base-content-soft text-xs">`), _tmpl$0$3 = /* @__PURE__ */ template(`<div class="flex flex-col gap-0.5"><div class=text-sm></div><pre class="text-xs bg-base-200 p-2 rounded-sm overflow-auto max-h-[90svh]">`);
function MergeContextModal() {
	let dialogRef;
	const [$general, $setGeneral] = useGeneralContext();
	const [$config, $setConfig] = useConfigContext();
	const { navigate } = useNavigationTransition();
	const [$card, $setCard] = useCardContext();
	const { ankiFields: rootAnkiFields } = useRootFieldGroupContext();
	const { noteId: currentNoteId } = useAnkiFieldContext();
	const [rootNote, setRootNote] = createSignal();
	const [currentNote, setCurrentNote] = createSignal();
	const [mergeDirection, setMergeDirection] = createSignal("toCurrent");
	const [deleteRootNote, setDeleteRootNote] = createSignal(false);
	const [loading, setLoading] = createSignal(true);
	if ($card.isMergePreview) return null;
	$general.useCheckAnkiConnect();
	createEffect(async () => {
		if ($general.isAnkiConnectAvailable) {
			setLoading(true);
			try {
				const rootNoteId = (await AnkiConnect.invoke("findNotes", { query: `cid:${rootAnkiFields.CardID}` })).result[0];
				const notes = await AnkiConnect.invoke("notesInfo", { notes: [rootNoteId, currentNoteId] });
				const rootNote$1 = notes.result[0];
				const currentNote$1 = notes.result[1];
				if (!rootNote$1?.noteId) throw new Error("Failed to load root note");
				if (!currentNote$1?.noteId) throw new Error("Failed to load current note, is your notes cache up to date?");
				setRootNote(rootNote$1);
				setCurrentNote(currentNote$1);
			} catch (e) {
				$general.toast.error(e instanceof Error ? e.message : "Failed to load notes");
				KIKU_STATE.logger.error(e);
			}
		}
		setLoading(false);
	});
	const merged = () => {
		const toContextField = (note) => ({
			noteId: note?.noteId,
			Sentence: note?.fields.Sentence.value ?? "",
			SentenceFurigana: note?.fields.SentenceFurigana.value ?? "",
			SentenceAudio: note?.fields.SentenceAudio.value ?? "",
			MiscInfo: note?.fields.MiscInfo.value ?? "",
			Picture: note?.fields.Picture.value ?? ""
		});
		const root = toContextField(rootNote());
		const current = toContextField(currentNote());
		if (mergeDirection() === "toRoot") return mergeContext(root, current);
		else return mergeContext(current, root);
	};
	const mergedReadable = () => parseMergedIntoReadable(merged());
	const hasDuplicates = () => Object.values(mergedReadable().duplicates).some((item) => Boolean(item.length));
	const mergedAnkiFields = () => {
		const direction = mergeDirection();
		const targetNote = direction === "toRoot" ? rootNote() : currentNote();
		if (!targetNote) return ankiFieldsSkeleton;
		const targetFields = Object.fromEntries(Object.entries(targetNote.fields).map(([key, value]) => [key, value.value]));
		const rootTags = rootNote()?.tags ?? [];
		const currentTags = currentNote()?.tags ?? [];
		let tags = unique([...rootTags, ...currentTags]);
		const targetTags = direction === "toRoot" ? rootTags : currentTags;
		const unwantedTags = [
			"leech",
			"marked",
			"potential_leech"
		];
		tags = tags.filter((tag) => targetTags.includes(tag) || !unwantedTags.includes(tag));
		return {
			...ankiFieldsSkeleton,
			...targetFields,
			...merged(),
			Tags: tags.join(" ")
		};
	};
	const targetId = () => {
		const targetId$1 = mergeDirection() === "toRoot" ? rootNote()?.noteId : currentNote()?.noteId;
		if (!targetId$1) return;
		return targetId$1;
	};
	const updateNoteFieldsPayload = () => {
		const targetId$ = targetId();
		if (!targetId$) return;
		const fields = mergedAnkiFields();
		const tags = fields.Tags.split(" ");
		for (const key in fields) if (key.startsWith("furigana:") || key.startsWith("kana:") || key.startsWith("kanji:") || key === "Tags" || key === "CardID") delete fields[key];
		return { note: {
			id: targetId$,
			fields,
			tags
		} };
	};
	const onPreviewClick = () => {
		$setCard("nestedIsMergePreview", true);
		$setCard({ nestedAnkiFields: mergedAnkiFields() });
		$setCard("nestedNoteId", targetId());
		navigate("nested", "forward", () => {
			navigate("main", "back");
			$setCard("nestedIsMergePreview", false);
		});
	};
	const onMergeClick = async () => {
		const payload = updateNoteFieldsPayload();
		await AnkiConnect.invoke("updateNote", payload).catch((e) => {
			$general.toast.error(`Failed to update note fields: ${e instanceof Error ? e.message : ""}`);
		}).then(() => {
			$general.toast.success(`Note ${payload?.note.id} has been updated!`);
			if (dialogRef) dialogRef.close();
			const rootNoteId = rootNote()?.noteId;
			if (deleteRootNote() && rootNoteId) setTimeout(() => {
				AnkiConnect.invoke("deleteNotes", { notes: [rootNoteId] }).catch((e) => {
					$general.toast.error(`Failed to delete note: ${e instanceof Error ? e.message : ""}`);
				}).then(() => {
					$general.toast.success(`Note ${payload?.note.id} has been updated! Note ${rootNoteId} has been deleted!`);
				});
			}, 500);
		});
	};
	createEffect(() => {
		if (mergeDirection() === "toRoot") setDeleteRootNote(false);
	});
	return [createComponent(Switch, { get children() {
		return [
			createComponent(Match, {
				get when() {
					return loading();
				},
				get children() {
					return getNextElement(_tmpl$$9);
				}
			}),
			createComponent(Match, {
				get when() {
					return memo(() => !!($general.isAnkiConnectAvailable && rootNote()))() && currentNote();
				},
				get children() {
					return createComponent(GitPullRequestArrow, {
						"class": "size-4 cursor-pointer text-base-content-soft animate-fade-in-sm",
						"on:click": () => {
							if (dialogRef) dialogRef.showModal();
						}
					});
				}
			}),
			createComponent(Match, {
				get when() {
					return memo(() => !!$general.isAnkiConnectAvailable)() && (!rootNote() || !currentNote());
				},
				get children() {
					return getNextElement(_tmpl$2$5);
				}
			}),
			createComponent(Match, {
				get when() {
					return !$general.isAnkiConnectAvailable;
				},
				get children() {
					var _el$3 = getNextElement(_tmpl$3$4), _el$4 = _el$3.firstChild;
					insert(_el$4, createComponent(RefreshCwIcon, {
						"class": "size-4 cursor-pointer text-base-content-soft",
						"on:click": async () => {
							try {
								await $general.checkAnkiConnect();
							} catch {
								$general.toast.error("AnkiConnect is not available");
							}
						}
					}));
					return _el$3;
				}
			})
		];
	} }), createComponent(Portal, {
		get mount() {
			return $general.layoutRef;
		},
		get children() {
			var _el$5 = getNextElement(_tmpl$8$3), _el$8 = _el$5.firstChild.firstChild.nextSibling, _el$9 = _el$8.firstChild, _el$0 = _el$9.firstChild, _el$10 = _el$0.firstChild.nextSibling, _el$11 = _el$10.nextSibling, [_el$12, _co$] = getNextMarker(_el$11.nextSibling), _el$18 = _el$0.nextSibling, [_el$19, _co$3] = getNextMarker(_el$18.nextSibling), _el$13 = _el$19.nextSibling, _el$15 = _el$13.firstChild.nextSibling, _el$16 = _el$15.nextSibling, [_el$17, _co$2] = getNextMarker(_el$16.nextSibling), _el$40 = _el$9.nextSibling, [_el$41, _co$0] = getNextMarker(_el$40.nextSibling), _el$42 = _el$41.nextSibling, [_el$43, _co$1] = getNextMarker(_el$42.nextSibling), _el$22 = _el$43.nextSibling, _el$23 = _el$22.firstChild, [_el$24, _co$4] = getNextMarker(_el$23.nextSibling), _el$25 = _el$24.nextSibling, [_el$26, _co$5] = getNextMarker(_el$25.nextSibling), _el$27 = _el$26.nextSibling, [_el$28, _co$6] = getNextMarker(_el$27.nextSibling), _el$29 = _el$28.nextSibling, [_el$30, _co$7] = getNextMarker(_el$29.nextSibling), _el$31 = _el$30.nextSibling, [_el$32, _co$8] = getNextMarker(_el$31.nextSibling), _el$33 = _el$32.nextSibling, [_el$34, _co$9] = getNextMarker(_el$33.nextSibling), _el$44 = _el$22.nextSibling, [_el$45, _co$10] = getNextMarker(_el$44.nextSibling), _el$46 = _el$45.nextSibling, [_el$47, _co$11] = getNextMarker(_el$46.nextSibling), _el$50 = _el$8.nextSibling.firstChild.nextSibling, _el$51 = _el$50.nextSibling;
			var _ref$ = dialogRef;
			typeof _ref$ === "function" ? use(_ref$, _el$5) : dialogRef = _el$5;
			insert(_el$10, () => rootNote()?.noteId);
			insert(_el$0, createComponent(Show, {
				get when() {
					return rootNote()?.noteId;
				},
				children: (id) => (() => {
					var _el$52 = getNextElement(_tmpl$9$3);
					insert(_el$52, () => new Date(id()).toLocaleDateString());
					return _el$52;
				})()
			}), _el$12, _co$);
			insert(_el$9, createComponent(ArrowLeftIcon, {
				"class": "self-center text-base-content-calm size-10 cursor-pointer transition-transform",
				"on:click": () => {},
				get classList() {
					return {
						"rotate-0": mergeDirection() === "toRoot",
						"rotate-180": mergeDirection() === "toCurrent"
					};
				}
			}), _el$19, _co$3);
			insert(_el$15, () => currentNote()?.noteId);
			insert(_el$13, createComponent(Show, {
				get when() {
					return currentNote()?.noteId;
				},
				children: (id) => (() => {
					var _el$53 = getNextElement(_tmpl$9$3);
					insert(_el$53, () => new Date(id()).toLocaleDateString());
					return _el$53;
				})()
			}), _el$17, _co$2);
			insert(_el$8, createComponent(Show, {
				get when() {
					return memo(() => !!(rootNote()?.fields.Expression.value && currentNote()?.fields.Expression.value))() && rootNote()?.fields.Expression.value !== currentNote()?.fields.Expression.value;
				},
				get children() {
					return getNextElement(_tmpl$4$4);
				}
			}), _el$41, _co$0);
			insert(_el$8, createComponent(Show, {
				get when() {
					return hasDuplicates();
				},
				get children() {
					return getNextElement(_tmpl$5$4);
				}
			}), _el$43, _co$1);
			insert(_el$22, createComponent(FieldPreview, {
				title: "Sentence",
				get content() {
					return mergedReadable().Sentence;
				}
			}), _el$24, _co$4);
			insert(_el$22, createComponent(FieldPreview, {
				title: "SentenceFurigana",
				get content() {
					return mergedReadable().SentenceFurigana;
				}
			}), _el$26, _co$5);
			insert(_el$22, createComponent(FieldPreview, {
				title: "SentenceAudio",
				get content() {
					return mergedReadable().SentenceAudio;
				}
			}), _el$28, _co$6);
			insert(_el$22, createComponent(FieldPreview, {
				title: "MiscInfo",
				get content() {
					return mergedReadable().MiscInfo;
				}
			}), _el$30, _co$7);
			insert(_el$22, createComponent(FieldPreview, {
				title: "Picture",
				get content() {
					return mergedReadable().Picture;
				}
			}), _el$32, _co$8);
			insert(_el$22, createComponent(FieldPreview, {
				title: "AnkiConnect Payload Preview",
				get content() {
					return JSON.stringify(updateNoteFieldsPayload(), null, 2);
				}
			}), _el$34, _co$9);
			insert(_el$8, createComponent(Show, {
				get when() {
					return memo(() => Date.now() - (rootNote()?.noteId ?? Date.now()) < 1e3 * 60 * 60 * 24)() && mergeDirection() === "toCurrent";
				},
				get children() {
					var _el$35 = getNextElement(_tmpl$6$4), _el$38 = _el$35.firstChild.nextSibling.firstChild;
					addEventListener(_el$38, "change", (e) => {
						setDeleteRootNote(e.target.checked);
					});
					createRenderEffect(() => setProperty(_el$38, "checked", deleteRootNote()));
					return _el$35;
				}
			}), _el$45, _co$10);
			insert(_el$8, createComponent(Show, {
				get when() {
					return !$config.preferAnkiConnect;
				},
				get children() {
					return getNextElement(_tmpl$7$3);
				}
			}), _el$47, _co$11);
			addEventListener(_el$50, "click", onPreviewClick);
			addEventListener(_el$51, "click", onMergeClick);
			createRenderEffect((_p$) => {
				var _v$ = !$config.preferAnkiConnect, _v$2 = !deleteRootNote(), _v$3 = !!deleteRootNote();
				_v$ !== _p$.e && setProperty(_el$51, "disabled", _p$.e = _v$);
				_v$2 !== _p$.t && _el$51.classList.toggle("btn-primary", _p$.t = _v$2);
				_v$3 !== _p$.a && _el$51.classList.toggle("btn-error", _p$.a = _v$3);
				return _p$;
			}, {
				e: void 0,
				t: void 0,
				a: void 0
			});
			return _el$5;
		}
	})];
}
function FieldPreview(props) {
	return (() => {
		var _el$54 = getNextElement(_tmpl$0$3), _el$55 = _el$54.firstChild, _el$56 = _el$55.nextSibling;
		insert(_el$55, () => props.title);
		insert(_el$56, (() => {
			var _c$ = memo(() => !!props.content);
			return () => _c$() ? props.content : "\n";
		})());
		return _el$54;
	})();
}
function mergeContext(base, extra) {
	const normalizedBase = normalizeFields(base);
	const normalizedExtra = normalizeFields(extra);
	const getSentenceFurigana = () => {
		if (!normalizedBase.SentenceFurigana || !normalizedExtra.SentenceFurigana) return "";
		return normalizedBase.SentenceFurigana + normalizedExtra.SentenceFurigana;
	};
	const merged = {
		Sentence: normalizedBase.Sentence + normalizedExtra.Sentence,
		SentenceFurigana: getSentenceFurigana(),
		SentenceAudio: normalizedBase.SentenceAudio + normalizedExtra.SentenceAudio,
		MiscInfo: normalizedBase.MiscInfo + normalizedExtra.MiscInfo,
		Picture: normalizedBase.Picture + normalizedExtra.Picture
	};
	function sortGroup(nodes) {
		return Array.from(nodes).sort((a, b) => {
			const aId = Number(a.dataset.groupId);
			return Number(b.dataset.groupId) - aId;
		});
	}
	const sentenceWithGroup = parseHtml(merged.Sentence).querySelectorAll("[data-group-id]");
	const Sentence$1 = sortGroup(sentenceWithGroup);
	merged.Sentence = nodesToString(Sentence$1);
	const sentenceFuriganaWithGroup = parseHtml(merged.SentenceFurigana).querySelectorAll("[data-group-id]");
	const SentenceFurigana = sortGroup(sentenceFuriganaWithGroup);
	merged.SentenceFurigana = nodesToString(SentenceFurigana);
	const sentenceAudioWithGroup = parseHtml(merged.SentenceAudio).querySelectorAll("[data-group-id]");
	const SentenceAudio = sortGroup(sentenceAudioWithGroup);
	merged.SentenceAudio = nodesToString(SentenceAudio);
	const miscInfoWithGroup = parseHtml(merged.MiscInfo).querySelectorAll("[data-group-id]");
	const MiscInfo = sortGroup(miscInfoWithGroup);
	merged.MiscInfo = nodesToString(MiscInfo);
	const pictureWithGroup = parseHtml(merged.Picture).querySelectorAll("img[data-group-id]");
	const Picture = sortGroup(pictureWithGroup);
	merged.Picture = nodesToString(Picture);
	return merged;
}
var randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
function normalizeFields(fields) {
	const newId = fields.noteId ?? Date.now() + randomNumber(0, 1e3);
	const sentenceDoc = parseHtml(fields.Sentence);
	const sentenceWithGroup = sentenceDoc.querySelectorAll("[data-group-id]");
	const sentenceWithoutGroup = Array.from(sentenceDoc.body.childNodes).filter((el) => !el.dataset?.groupId);
	const sentenceFuriganaDoc = parseHtml(fields.SentenceFurigana);
	const sentenceFuriganaWithGroup = sentenceFuriganaDoc.querySelectorAll("[data-group-id]");
	const sentenceFuriganaWithoutGroup = Array.from(sentenceFuriganaDoc.body.childNodes).filter((el) => !el.dataset?.groupId);
	const sentenceAudioDoc = parseHtml(fields.SentenceAudio);
	const sentenceAudioWithGroup = sentenceAudioDoc.querySelectorAll("[data-group-id]");
	const sentenceAudioWithoutGroup = Array.from(sentenceAudioDoc.body.childNodes).filter((el) => !el.dataset?.groupId);
	const miscInfoDoc = parseHtml(fields.MiscInfo);
	const miscInfoWithGroup = miscInfoDoc.querySelectorAll("[data-group-id]");
	const miscInfoWithoutGroup = Array.from(miscInfoDoc.body.childNodes).filter((el) => !el.dataset?.groupId);
	const pictureDoc = parseHtml(fields.Picture);
	const pictureWithGroup = pictureDoc.querySelectorAll("img[data-group-id]");
	const pictureWithoutGroup = pictureDoc.querySelector("img:not([data-group-id])");
	if (pictureWithoutGroup) pictureWithoutGroup.setAttribute("data-group-id", newId.toString());
	function wrapInSpan(html) {
		if (!html) return "";
		const span = document.createElement("span");
		span.innerHTML = html;
		span.dataset.groupId = newId.toString();
		return span.outerHTML;
	}
	const Sentence$1 = nodesToString(Array.from(sentenceWithGroup)).trim() + wrapInSpan(nodesToString(sentenceWithoutGroup).trim());
	const SentenceFurigana = nodesToString(Array.from(sentenceFuriganaWithGroup)).trim() + wrapInSpan(nodesToString(sentenceFuriganaWithoutGroup).trim());
	const SentenceAudio = nodesToString(Array.from(sentenceAudioWithGroup)).trim() + wrapInSpan(nodesToString(sentenceAudioWithoutGroup).trim());
	const MiscInfo = nodesToString(Array.from(miscInfoWithGroup)).trim() + wrapInSpan(nodesToString(miscInfoWithoutGroup).trim());
	const Picture = nodesToString(Array.from(pictureWithGroup)).trim() + (pictureWithoutGroup?.outerHTML ?? "");
	return {
		Sentence: Sentence$1,
		SentenceFurigana,
		SentenceAudio,
		MiscInfo,
		Picture
	};
}
function parseMergedIntoReadable(fields) {
	function extractGroupedText(doc, selector, value) {
		const seen = /* @__PURE__ */ new Set();
		const duplicates = /* @__PURE__ */ new Set();
		return {
			text: Array.from(doc.querySelectorAll(selector)).map((node) => {
				const groupId = node.getAttribute("data-group-id");
				if (!groupId) return null;
				if (seen.has(groupId)) duplicates.add(groupId);
				else seen.add(groupId);
				return `${groupId}: ${value(node)}`;
			}).filter(Boolean).join("\n"),
			duplicates: Array.from(duplicates)
		};
	}
	const sentence = extractGroupedText(parseHtml(fields.Sentence), "[data-group-id]", (n) => n.textContent ?? "");
	const sentenceFurigana = extractGroupedText(parseHtml(fields.SentenceFurigana), "[data-group-id]", (n) => n.textContent ?? "");
	const sentenceAudio = extractGroupedText(parseHtml(fields.SentenceAudio), "[data-group-id]", (n) => n.textContent ?? "");
	const miscInfo = extractGroupedText(parseHtml(fields.MiscInfo), "[data-group-id]", (n) => n.textContent ?? "");
	const picture = extractGroupedText(parseHtml(fields.Picture), "img[data-group-id]", (n) => n.getAttribute("src") ?? "");
	return {
		Sentence: sentence.text,
		SentenceFurigana: sentenceFurigana.text,
		SentenceAudio: sentenceAudio.text,
		MiscInfo: miscInfo.text,
		Picture: picture.text,
		duplicates: {
			Sentence: sentence.duplicates,
			SentenceFurigana: sentenceFurigana.duplicates,
			SentenceAudio: sentenceAudio.duplicates,
			MiscInfo: miscInfo.duplicates,
			Picture: picture.duplicates
		}
	};
}

//#endregion
//#region src/components/_kiku_lazy/HeaderMain.tsx
var _tmpl$$8 = /* @__PURE__ */ template(`<div class="status status-warning absolute top-0 right-0 translate-x-0.5 -translate-y-0.5">`), _tmpl$2$4 = /* @__PURE__ */ template(`<div class=relative><div class="tooltip tooltip-bottom flex items-center"></div><!$><!/>`), _tmpl$3$3 = /* @__PURE__ */ template(`<div class="flex gap-1 sm:gap-2 items-center cursor-pointer"><!$><!/><div class="text-base-content-soft text-xs sm:text-sm">`), _tmpl$4$3 = /* @__PURE__ */ template(`<div class="text-base-content-soft bg-warning/10 rounded-sm px-px sm:px-1 text-xs sm:text-sm"><!$><!/><!$><!/>`), _tmpl$5$3 = /* @__PURE__ */ template(`<div class="flex gap-1 sm:gap-2 items-center animate-fade-in-sm">`), _tmpl$6$3 = /* @__PURE__ */ template(`<span class="loading loading-spinner loading-xs text-base-content-faint animate-fade-in-sm">`), _tmpl$7$2 = /* @__PURE__ */ template(`<div class="status status-error animate-ping">`), _tmpl$8$2 = /* @__PURE__ */ template(`<div class="text-base-content-soft cursor-pointer animate-fade-in-sm">`), _tmpl$9$2 = /* @__PURE__ */ template(`<div class="flex gap-1 sm:gap-2 items-center"><!$><!/><!$><!/>`), _tmpl$0$2 = /* @__PURE__ */ template(`<div class="flex gap-px sm:gap-0.5 items-start hover:text-base-content transition-colors"><span></span><span class="bg-base-content/5 leading-none text-xs sm:text-sm rounded-xs">`), _tmpl$1$2 = /* @__PURE__ */ template(`<div class="flex gap-px sm:gap-0.5 items-start hover:text-base-content transition-colors"><span>読</span><span class="bg-base-content/5 leading-none text-xs sm:text-sm rounded-xs">`), _tmpl$10$2 = /* @__PURE__ */ template(`<div class="flex gap-px sm:gap-0.5 items-start hover:text-base-content transition-colors"><span>同</span><span class="bg-base-content/5 leading-none text-xs sm:text-sm rounded-xs">`), _tmpl$11$2 = /* @__PURE__ */ template(`<span>•`), _tmpl$12$2 = /* @__PURE__ */ template(`<div class="flex sm:gap-2 items-center flex-wrap"><!$><!/><!$><!/><!$><!/><!$><!/>`), _tmpl$13$2 = /* @__PURE__ */ template(`<div class="flex gap-1 sm:gap-2 items-center animate-fade-in-sm relative hover:[&amp;_#frequency]:block"><div class="text-base-content-soft text-sm sm:text-base"></div><!$><!/>`), _tmpl$14$2 = /* @__PURE__ */ template(`<div id=frequency class="absolute top-0 translate-y-6 right-2 w-fit [&amp;_li]:text-nowrap [&amp;_li]:whitespace-nowrap bg-base-200/95 text-sm sm:text-base p-2 sm:p-4 rounded-lg border border-base-300 shadow-lg hidden text-base-content-calm">`);
function HeaderMain(props) {
	const [$card, $setCard] = useCardContext();
	const [$config, $setConfig] = useConfigContext();
	const [$general] = useGeneralContext();
	const { navigate, navigateBack } = useNavigationTransition();
	const [startupTime, setStartupTime] = createSignal(null);
	const changeTheme = useThemeTransition();
	onMount(() => {
		if (KIKU_STATE.startupTime) setStartupTime(Math.round(KIKU_STATE.startupTime));
	});
	return createComponent(HeaderLayout, { get children() {
		return [(() => {
			var _el$ = getNextElement(_tmpl$5$3);
			insert(_el$, createComponent(Switch, { get children() {
				return [createComponent(Match, {
					get when() {
						return $card.nested;
					},
					get children() {
						return [createComponent(ArrowLeftIcon, {
							"class": "size-5 cursor-pointer text-base-content-soft",
							get ["on:click"]() {
								return props.onExitNested;
							}
						}), createComponent(MergeContextModal, {})];
					}
				}), createComponent(Match, {
					get when() {
						return !$card.nested;
					},
					get children() {
						return [
							(() => {
								var _el$2 = getNextElement(_tmpl$2$4), _el$3 = _el$2.firstChild, _el$5 = _el$3.nextSibling, [_el$6, _co$] = getNextMarker(_el$5.nextSibling);
								insert(_el$3, createComponent(BoltIcon, {
									"class": "size-5",
									get classList() {
										return {
											"text-base-content-soft cursor-pointer": $card.side === "back",
											"text-base-content-subtle-100": $card.side === "front"
										};
									},
									"on:click": () => {
										navigate("settings", "forward", () => navigate("main", "back"));
									}
								}));
								insert(_el$2, createComponent(Show, {
									get when() {
										return $general.isThemeChanged;
									},
									get children() {
										return getNextElement(_tmpl$$8);
									}
								}), _el$6, _co$);
								createRenderEffect(() => setAttribute(_el$3, "data-tip", $card.side === "front" ? "Settings page is only accessible from the back side of the card" : void 0));
								return _el$2;
							})(),
							createComponent(Show, {
								get when() {
									return $config.showTheme;
								},
								get children() {
									var _el$7 = getNextElement(_tmpl$3$3), _el$9 = _el$7.firstChild, [_el$0, _co$2] = getNextMarker(_el$9.nextSibling), _el$8 = _el$0.nextSibling;
									addEventListener(_el$7, "touchend", (e) => e.stopPropagation());
									addEventListener(_el$7, "click", () => {
										changeTheme(nextTheme());
									});
									insert(_el$7, createComponent(PaintbrushIcon, { "class": "size-5 cursor-pointer text-base-content-soft" }), _el$0, _co$2);
									insert(_el$8, () => capitalize($config.theme));
									return _el$7;
								}
							}),
							createComponent(Show, {
								get when() {
									return $config.showStartupTime;
								},
								get children() {
									var _el$1 = getNextElement(_tmpl$4$3), _el$10 = _el$1.firstChild, [_el$11, _co$3] = getNextMarker(_el$10.nextSibling), _el$12 = _el$11.nextSibling, [_el$13, _co$4] = getNextMarker(_el$12.nextSibling);
									insert(_el$1, startupTime, _el$11, _co$3);
									insert(_el$1, () => startupTime() && "ms", _el$13, _co$4);
									return _el$1;
								}
							})
						];
					}
				})];
			} }));
			return _el$;
		})(), (() => {
			var _el$14 = getNextElement(_tmpl$9$2), _el$18 = _el$14.firstChild, [_el$19, _co$5] = getNextMarker(_el$18.nextSibling), _el$20 = _el$19.nextSibling, [_el$21, _co$6] = getNextMarker(_el$20.nextSibling);
			insert(_el$14, createComponent(Show, {
				get when() {
					return !$card.isMergePreview;
				},
				get children() {
					return createComponent(Switch, { get children() {
						return [
							createComponent(Match, {
								get when() {
									return memo(() => $card.query.status === "loading")() && $card.side === "back";
								},
								get children() {
									return getNextElement(_tmpl$6$3);
								}
							}),
							createComponent(Match, {
								get when() {
									return memo(() => $card.query.status === "error")() && $card.side === "back";
								},
								get children() {
									return getNextElement(_tmpl$7$2);
								}
							}),
							createComponent(Match, {
								get when() {
									return memo(() => $card.query.status === "success")() && $card.side === "back";
								},
								get children() {
									var _el$17 = getNextElement(_tmpl$8$2);
									insert(_el$17, createComponent(KanjiPageIndicator, {}));
									return _el$17;
								}
							})
						];
					} });
				}
			}), _el$19, _co$5);
			insert(_el$14, createComponent(Show, {
				get when() {
					return $card.side === "back";
				},
				get children() {
					return createComponent(Frequency, {});
				}
			}), _el$21, _co$6);
			return _el$14;
		})()];
	} });
}
function KanjiPageIndicator() {
	const [$general] = useGeneralContext();
	const [$card, $setCard] = useCardContext();
	const { navigate } = useNavigationTransition();
	const length = () => $card.query.noteList.length + ($card.query.sameReading?.length ? 1 : 0) + ($card.query.sameExpression?.length ? 1 : 0);
	const onClick = (key) => {
		const isKanjiResult = $card.query.noteList.length > 0;
		const isSameReadingResult = ($card.query.sameReading?.length ?? 0) > 0;
		if (isKanjiResult || isSameReadingResult) {
			$setCard("focus", "kanji", key);
			$setCard("uniqueId", createUniqueId());
			navigate("kanji", "forward", () => navigate("main", "back"));
		}
	};
	function KanjiIndicator() {
		return $card.query.noteList.map(([kanji, data]) => {
			return (() => {
				var _el$22 = getNextElement(_tmpl$0$2), _el$23 = _el$22.firstChild, _el$24 = _el$23.nextSibling;
				addEventListener(_el$22, "click", () => {
					onClick(kanji);
				});
				insert(_el$23, kanji);
				insert(_el$24, () => data.length);
				createRenderEffect((_p$) => {
					var _v$ = !!(length() <= 4), _v$2 = !!(length() > 4);
					_v$ !== _p$.e && _el$24.classList.toggle("p-px", _p$.e = _v$);
					_v$2 !== _p$.t && _el$24.classList.toggle("p-0", _p$.t = _v$2);
					return _p$;
				}, {
					e: void 0,
					t: void 0
				});
				return _el$22;
			})();
		});
	}
	function SameReadingIndicator() {
		return (() => {
			var _el$25 = getNextElement(_tmpl$1$2), _el$27 = _el$25.firstChild.nextSibling;
			addEventListener(_el$25, "click", () => {
				onClick($general.SAME_READING);
			});
			insert(_el$27, () => $card.query.sameReading?.length ?? 0);
			createRenderEffect((_p$) => {
				var _v$3 = !!(length() <= 4), _v$4 = !!(length() > 4);
				_v$3 !== _p$.e && _el$27.classList.toggle("p-px", _p$.e = _v$3);
				_v$4 !== _p$.t && _el$27.classList.toggle("p-0", _p$.t = _v$4);
				return _p$;
			}, {
				e: void 0,
				t: void 0
			});
			return _el$25;
		})();
	}
	function SameExpressionIndicator() {
		return (() => {
			var _el$28 = getNextElement(_tmpl$10$2), _el$30 = _el$28.firstChild.nextSibling;
			addEventListener(_el$28, "click", () => {
				onClick($general.SAME_EXPRESSION);
			});
			insert(_el$30, () => $card.query.sameExpression?.length ?? 0);
			createRenderEffect((_p$) => {
				var _v$5 = !!(length() <= 4), _v$6 = !!(length() > 4);
				_v$5 !== _p$.e && _el$30.classList.toggle("p-px", _p$.e = _v$5);
				_v$6 !== _p$.t && _el$30.classList.toggle("p-0", _p$.t = _v$6);
				return _p$;
			}, {
				e: void 0,
				t: void 0
			});
			return _el$28;
		})();
	}
	return (() => {
		var _el$31 = getNextElement(_tmpl$12$2), _el$33 = _el$31.firstChild, [_el$34, _co$7] = getNextMarker(_el$33.nextSibling), _el$35 = _el$34.nextSibling, [_el$36, _co$8] = getNextMarker(_el$35.nextSibling), _el$37 = _el$36.nextSibling, [_el$38, _co$9] = getNextMarker(_el$37.nextSibling), _el$39 = _el$38.nextSibling, [_el$40, _co$0] = getNextMarker(_el$39.nextSibling);
		insert(_el$31, createComponent(KanjiIndicator, {}), _el$34, _co$7);
		insert(_el$31, createComponent(Show, {
			get when() {
				return $card.query.sameReading?.length || $card.query.sameExpression?.length;
			},
			get children() {
				return getNextElement(_tmpl$11$2);
			}
		}), _el$36, _co$8);
		insert(_el$31, createComponent(Show, {
			get when() {
				return $card.query.sameReading?.length;
			},
			get children() {
				return createComponent(SameReadingIndicator, {});
			}
		}), _el$38, _co$9);
		insert(_el$31, createComponent(Show, {
			get when() {
				return $card.query.sameExpression?.length;
			},
			get children() {
				return createComponent(SameExpressionIndicator, {});
			}
		}), _el$40, _co$0);
		createRenderEffect((_p$) => {
			var _v$7 = !!(length() <= 4), _v$8 = !!(length() > 4);
			_v$7 !== _p$.e && _el$31.classList.toggle("gap-1", _p$.e = _v$7);
			_v$8 !== _p$.t && _el$31.classList.toggle("gap-0", _p$.t = _v$8);
			return _p$;
		}, {
			e: void 0,
			t: void 0
		});
		return _el$31;
	})();
}
function Frequency() {
	const { ankiFields } = useAnkiFieldContext();
	return (() => {
		var _el$41 = getNextElement(_tmpl$13$2), _el$42 = _el$41.firstChild, _el$43 = _el$42.nextSibling, [_el$44, _co$1] = getNextMarker(_el$43.nextSibling);
		insert(_el$41, (() => {
			var _c$ = memo(() => !!ankiFields.Frequency);
			return () => _c$() && [createComponent(CircleChevronDownIcon, { "class": "size-5 text-base-content-soft" }), (() => {
				var _el$45 = getNextElement(_tmpl$14$2);
				createRenderEffect(() => setProperty(_el$45, "innerHTML", ankiFields.Frequency));
				return _el$45;
			})()];
		})(), _el$44, _co$1);
		createRenderEffect((_p$) => {
			var _v$9 = ankiFields.FreqSort, _v$0 = !!(ankiFields.FreqSort === "9999999");
			_v$9 !== _p$.e && setProperty(_el$42, "innerHTML", _p$.e = _v$9);
			_v$0 !== _p$.t && _el$42.classList.toggle("hidden", _p$.t = _v$0);
			return _p$;
		}, {
			e: void 0,
			t: void 0
		});
		return _el$41;
	})();
}

//#endregion
//#region src/components/_kiku_lazy/HeaderKanjiPage.tsx
var _tmpl$$7 = /* @__PURE__ */ template(`<div class="flex flex-row justify-between items-center"><div class=h-5></div><div class="flex flex-row gap-2 items-center">`);
function HeaderKanjiPage() {
	const { navigate, navigateBack } = useNavigationTransition();
	return createComponent(HeaderLayout, { get children() {
		var _el$ = getNextElement(_tmpl$$7), _el$2 = _el$.firstChild;
		insert(_el$2, createComponent(ArrowLeftIcon, {
			"class": "h-full w-full cursor-pointer text-base-content-soft",
			"on:click": navigateBack
		}));
		return _el$;
	} });
}

//#endregion
//#region src/components/_kiku_lazy/KanjiPage.tsx
var _tmpl$$6 = /* @__PURE__ */ template(`<div class="text-lg text-base-content-calm">Visually Similar`), _tmpl$2$3 = /* @__PURE__ */ template(`<div class="text-lg text-base-content-calm">Composed of`), _tmpl$3$2 = /* @__PURE__ */ template(`<div class="text-lg text-base-content-calm">Used in`), _tmpl$4$2 = /* @__PURE__ */ template(`<div class="text-lg text-base-content-calm">Related`), _tmpl$5$2 = /* @__PURE__ */ template(`<div class="flex flex-col items-center gap-2"><div class="flex justify-center text-7xl font-secondary "></div><!$><!/>`), _tmpl$6$2 = /* @__PURE__ */ template(`<div class="flex flex-col gap-2 sm:gap-4 "><!$><!/><!$><!/><!$><!/>`), _tmpl$7$1 = /* @__PURE__ */ template(`<div class="text-base-content-faint text-sm">Updated at <!$><!/>`), _tmpl$8$1 = /* @__PURE__ */ template(`<div class="flex justify-center items-center">`), _tmpl$9$1 = /* @__PURE__ */ template(`<div class="loading loading-sm text-base-content-soft animate-fade-in-sm">`), _tmpl$0$1 = /* @__PURE__ */ template(`<div class="collapse bg-base-200 border border-base-300 animate-fade-in"><input type=checkbox><div class="collapse-title justify-between flex items-center ps-2 sm:ps-4 pe-2 sm:pe-4 py-2 sm:py-4"><!$><!/><div class="flex gap-1 sm:gap-2 absolute top-2 right-2 sm:top-4 sm:right-4"><!$><!/><div class="text-base-content-soft bg-base-300 px-1 rounded-xs animate-fade-in-sm text-sm sm:text-base"></div></div></div><div class="collapse-content text-sm px-2 sm:px-4 pb-2 sm:pb-4 flex flex-col gap-1 sm:gap-2"><!$><!/><ul class="list bg-base-100 rounded-box shadow-md">`), _tmpl$1$1 = /* @__PURE__ */ template(`<ruby><!$><!/><rt>`), _tmpl$10$1 = /* @__PURE__ */ template(`<div class="collapse bg-base-200 border border-base-300 animate-fade-in"><input type=checkbox><div class="collapse-title justify-between flex items-center ps-2 sm:ps-4 pe-2 sm:pe-4 py-2 sm:py-4"><span class="text-lg sm:text-2xl"><span class=text-base-content-calm></span> <span class=font-secondary>(<!$><!/>)</span></span></div><div class="collapse-content text-sm px-2 sm:px-4 pb-2 sm:pb-4"><ul class="list bg-base-100 rounded-box shadow-md">`), _tmpl$11$1 = /* @__PURE__ */ template(`<li class="p-4 pb-0 tracking-wide flex gap-2 items-start justify-between"><div class="flex gap-2 items-end"><div class=" font-secondary sentence"></div><div class=text-base-content-calm></div></div><!$><!/>`), _tmpl$12$1 = /* @__PURE__ */ template(`<li class=list-row><div></div><div class="text-base sm:text-xl text-base-content-calm font-secondary"></div><div class="flex justify-center items-center">`), _tmpl$13$1 = /* @__PURE__ */ template(`<div class="status status-warning">`), _tmpl$14$1 = /* @__PURE__ */ template(`<div class="flex gap-2 sm:gap-4 me-2"><div class="font-secondary expression"></div><!$><!/>`);
function KanjiPage() {
	const [$card, $setCard] = useCardContext();
	return createComponent(KanjiPageContextProvider, {
		get noteList() {
			return $card.query.noteList;
		},
		get sameReading() {
			return $card.query.sameReading;
		},
		get sameExpression() {
			return $card.query.sameExpression;
		},
		get focus() {
			return {
				kanji: $card.focus.kanji,
				noteId: $card.focus.noteId
			};
		},
		get id() {
			return $card.uniqueId;
		},
		get children() {
			return createComponent(Page, {});
		}
	});
}
function Page() {
	const [$general, $setGeneral] = useGeneralContext();
	const [$kanjiPage, $setKanjiPage] = useKanjiPageContext();
	return createComponent(Switch, { get children() {
		return [createComponent(Match, {
			get when() {
				return $kanjiPage.nested;
			},
			get children() {
				return createComponent(KanjiPageContextProvider, {
					get noteList() {
						return $kanjiPage.nestedNoteList;
					},
					sameReading: [],
					sameExpression: [],
					get focus() {
						return {
							kanji: $kanjiPage.nestedFocus.kanji,
							noteId: $kanjiPage.nestedFocus.noteId
						};
					},
					get id() {
						return $kanjiPage.nestedId;
					},
					get contextLabel() {
						return $kanjiPage.nestedContextLabel;
					},
					get children() {
						return createComponent(Page, {});
					}
				});
			}
		}), createComponent(Match, {
			get when() {
				return !$kanjiPage.nested;
			},
			get children() {
				return [
					createComponent(HeaderKanjiPage, {}),
					createComponent(Show, {
						get when() {
							return $kanjiPage.contextLabel;
						},
						get children() {
							var _el$ = getNextElement(_tmpl$5$2), _el$2 = _el$.firstChild, _el$7 = _el$2.nextSibling, [_el$8, _co$] = getNextMarker(_el$7.nextSibling);
							insert(_el$2, () => $kanjiPage.contextLabel?.text);
							insert(_el$, createComponent(Switch, { get children() {
								return [
									createComponent(Match, {
										get when() {
											return $kanjiPage.contextLabel?.type === "similar";
										},
										get children() {
											return getNextElement(_tmpl$$6);
										}
									}),
									createComponent(Match, {
										get when() {
											return $kanjiPage.contextLabel?.type === "composedOf";
										},
										get children() {
											return getNextElement(_tmpl$2$3);
										}
									}),
									createComponent(Match, {
										get when() {
											return $kanjiPage.contextLabel?.type === "usedIn";
										},
										get children() {
											return getNextElement(_tmpl$3$2);
										}
									}),
									createComponent(Match, {
										get when() {
											return $kanjiPage.contextLabel?.type === "related";
										},
										get children() {
											return getNextElement(_tmpl$4$2);
										}
									})
								];
							} }), _el$8, _co$);
							return _el$;
						}
					}),
					(() => {
						var _el$9 = getNextElement(_tmpl$6$2), _el$0 = _el$9.firstChild, [_el$1, _co$2] = getNextMarker(_el$0.nextSibling), _el$10 = _el$1.nextSibling, [_el$11, _co$3] = getNextMarker(_el$10.nextSibling), _el$12 = _el$11.nextSibling, [_el$13, _co$4] = getNextMarker(_el$12.nextSibling);
						insert(_el$9, createComponent(For, {
							get each() {
								return $kanjiPage.noteList;
							},
							children: ([kanji, data]) => {
								return createComponent(KanjiContextProvider, {
									kanji,
									get children() {
										return createComponent(KanjiCollapsible, { data });
									}
								});
							}
						}), _el$1, _co$2);
						insert(_el$9, createComponent(Show, {
							get when() {
								return memo(() => !!$kanjiPage.sameReading)() && $kanjiPage.sameReading.length > 0;
							},
							get children() {
								return createComponent(KanjiContextProvider, {
									kanji: "",
									get children() {
										return createComponent(SameReadingCollapsible, { mode: "reading" });
									}
								});
							}
						}), _el$11, _co$3);
						insert(_el$9, createComponent(Show, {
							get when() {
								return memo(() => !!$kanjiPage.sameExpression)() && $kanjiPage.sameExpression.length > 0;
							},
							get children() {
								return createComponent(KanjiContextProvider, {
									kanji: "",
									get children() {
										return createComponent(SameReadingCollapsible, { mode: "expression" });
									}
								});
							}
						}), _el$13, _co$4);
						return _el$9;
					})(),
					(() => {
						var _el$14 = getNextElement(_tmpl$8$1);
						insert(_el$14, createComponent(Show, {
							get when() {
								return $general.notesManifest;
							},
							get children() {
								var _el$15 = getNextElement(_tmpl$7$1), _el$18 = _el$15.firstChild.nextSibling, [_el$19, _co$5] = getNextMarker(_el$18.nextSibling);
								insert(_el$15, () => new Date($general.notesManifest?.generatedAt ?? 0).toLocaleDateString(), _el$19, _co$5);
								return _el$15;
							}
						}));
						return _el$14;
					})()
				];
			}
		})];
	} });
}
function KanjiCollapsible(props) {
	const [$kanjiPage, $setKanjiPage] = useKanjiPageContext();
	const [$kanji, $setKanji] = useKanjiContext();
	const data = () => props.data;
	const [checked, setChecked] = createSignal($kanjiPage.focus.kanji === $kanji.kanji);
	const loading = () => {
		return Object.values($kanji.loading).some((v) => v);
	};
	return (() => {
		var _el$20 = getNextElement(_tmpl$0$1), _el$21 = _el$20.firstChild, _el$22 = _el$21.nextSibling, _el$28 = _el$22.firstChild, [_el$29, _co$7] = getNextMarker(_el$28.nextSibling), _el$23 = _el$29.nextSibling, _el$26 = _el$23.firstChild, [_el$27, _co$6] = getNextMarker(_el$26.nextSibling), _el$25 = _el$27.nextSibling, _el$30 = _el$22.nextSibling, _el$32 = _el$30.firstChild, [_el$33, _co$8] = getNextMarker(_el$32.nextSibling), _el$31 = _el$33.nextSibling;
		_el$21.addEventListener("change", (e) => {
			setChecked(e.currentTarget.checked);
		});
		addEventListener(_el$22, "click", () => {
			setChecked(!checked());
		});
		insert(_el$22, createComponent(KanjiText, {}), _el$29, _co$7);
		insert(_el$23, createComponent(Show, {
			get when() {
				return loading();
			},
			get children() {
				return getNextElement(_tmpl$9$1);
			}
		}), _el$27, _co$6);
		insert(_el$25, () => data().length);
		insert(_el$30, createComponent(KanjiInfoExtra, { inKanjiPage: true }), _el$33, _co$8);
		insert(_el$31, createComponent(For, {
			get each() {
				return data();
			},
			children: (data$1) => {
				return createComponent(AnkiNoteItem, { data: data$1 });
			}
		}));
		createRenderEffect(() => setProperty(_el$21, "checked", checked()));
		return _el$20;
	})();
}
function SameReadingCollapsible(props) {
	const [$general] = useGeneralContext();
	const [$kanjiPage, $setKanjiPage] = useKanjiPageContext();
	const { ankiFields } = useAnkiFieldContext();
	const symbol = props.mode === "reading" ? $general.SAME_READING : $general.SAME_EXPRESSION;
	const title = props.mode === "reading" ? "Same Reading" : "Same Expression";
	const list = props.mode === "reading" ? $kanjiPage.sameReading : $kanjiPage.sameExpression;
	const ExpressionFurigana = () => {
		if (ankiFields.Expression && ankiFields.ExpressionReading) return (() => {
			var _el$34 = getNextElement(_tmpl$1$1), _el$36 = _el$34.firstChild, [_el$37, _co$9] = getNextMarker(_el$36.nextSibling), _el$35 = _el$37.nextSibling;
			insert(_el$34, () => ankiFields.Expression, _el$37, _co$9);
			insert(_el$35, () => ankiFields.ExpressionReading);
			return _el$34;
		})();
		return ankiFields.ExpressionReading ? ankiFields.ExpressionReading : ankiFields.Expression;
	};
	let ref;
	onMount(() => {
		if (ref) {
			if ($kanjiPage.focus.kanji === symbol) ref.scrollIntoView({ block: "center" });
		}
	});
	return (() => {
		var _el$38 = getNextElement(_tmpl$10$1), _el$39 = _el$38.firstChild, _el$40 = _el$39.nextSibling, _el$42 = _el$40.firstChild.firstChild, _el$44 = _el$42.nextSibling.nextSibling, _el$47 = _el$44.firstChild.nextSibling, [_el$48, _co$0] = getNextMarker(_el$47.nextSibling);
		_el$48.nextSibling;
		var _el$50 = _el$40.nextSibling.firstChild;
		var _ref$ = ref;
		typeof _ref$ === "function" ? use(_ref$, _el$42) : ref = _el$42;
		insert(_el$42, title);
		insert(_el$44, createComponent(ExpressionFurigana, {}), _el$48, _co$0);
		insert(_el$50, createComponent(For, {
			each: list ?? [],
			children: (data) => {
				return createComponent(AnkiNoteItem, {
					data,
					get reading() {
						return ankiFields.ExpressionReading;
					},
					get mode() {
						return props.mode;
					}
				});
			}
		}));
		createRenderEffect(() => setProperty(_el$39, "checked", $kanjiPage.focus.kanji === symbol));
		return _el$38;
	})();
}
function AnkiNoteItem(props) {
	const data = () => props.data;
	const reading = () => props.reading;
	const { navigate } = useNavigationTransition();
	const [$card, $setCard] = useCardContext();
	const [$general, $setGeneral] = useGeneralContext();
	const [$kanji, $setKanji] = useKanjiContext();
	const [$kanjiPage, $setKanjiPage] = useKanjiPageContext();
	const leech = data().tags.includes("leech");
	const expressionInnerHtml = () => {
		if (data().fields.Expression.value && data().fields.ExpressionReading.value) return `<ruby>${data().fields.Expression.value}<rt>${data().fields.ExpressionReading.value}</rt></ruby>`;
		if (data().fields.Expression.value) return data().fields.Expression.value;
		return data().fields.ExpressionReading.value;
	};
	const expressionInnerHtmlColorized = () => {
		const kanji$ = $kanji.kanji;
		const reading$ = reading();
		if (!kanji$ && !reading$) return expressionInnerHtml();
		if (kanji$) return expressionInnerHtml().replaceAll(kanji$, `<span class="text-base-content-primary">${kanji$}</span>`);
		if (reading$) return expressionInnerHtml().replaceAll(reading$, `<span class="text-base-content-primary">${reading$}</span>`);
	};
	const sentenceInnerHtmlColorized = () => {
		const kanji$ = $kanji.kanji;
		if (!kanji$) return data().fields.Sentence.value;
		return data().fields.Sentence.value.replaceAll(kanji$, `<span class="text-base-content-primary">${kanji$}</span>`);
	};
	const onNextClick = () => {
		const ankiFields = {
			...ankiFieldsSkeleton,
			...Object.fromEntries(Object.entries(data().fields).map(([key, value]) => {
				return [key, value.value];
			})),
			CardID: data().cards[0]?.toString() ?? "",
			Tags: data().tags.join(" ")
		};
		if (props.mode) if (props.mode === "reading") $setKanjiPage("focus", { kanji: $general.SAME_READING });
		else $setKanjiPage("focus", { kanji: $general.SAME_EXPRESSION });
		else $setKanjiPage("focus", { kanji: $kanji.kanji });
		$setKanjiPage("focus", { noteId: data().noteId });
		$setCard({ nestedAnkiFields: ankiFields });
		$setCard("nestedNoteId", data().noteId);
		navigate("nested", "forward", () => navigate("kanji", "back"));
	};
	let ref;
	onMount(() => {
		if (ref && $kanjiPage.focus.noteId === props.data.noteId) ref.scrollIntoView({ block: "center" });
	});
	return [(() => {
		var _el$51 = getNextElement(_tmpl$11$1), _el$52 = _el$51.firstChild, _el$53 = _el$52.firstChild, _el$54 = _el$53.nextSibling, _el$55 = _el$52.nextSibling, [_el$56, _co$1] = getNextMarker(_el$55.nextSibling);
		var _ref$2 = ref;
		typeof _ref$2 === "function" ? use(_ref$2, _el$53) : ref = _el$53;
		insert(_el$54, () => new Date(data().noteId).toLocaleDateString());
		insert(_el$51, leech && getNextElement(_tmpl$13$1), _el$56, _co$1);
		createRenderEffect(() => setProperty(_el$53, "innerHTML", expressionInnerHtmlColorized()));
		return _el$51;
	})(), (() => {
		var _el$57 = getNextElement(_tmpl$12$1), _el$59 = _el$57.firstChild.nextSibling, _el$60 = _el$59.nextSibling;
		insert(_el$60, createComponent(ArrowLeftIcon, {
			"class": "size-5 sm:size-8 text-base-content-soft rotate-180 cursor-pointer",
			"on:click": () => {
				onNextClick();
			}
		}));
		createRenderEffect(() => setProperty(_el$59, "innerHTML", sentenceInnerHtmlColorized()));
		return _el$57;
	})()];
}
function KanjiText() {
	const [$card, $setCard] = useCardContext();
	const [$kanji, $setKanji] = useKanjiContext();
	const [$kanjiPage, $setKanjiPage] = useKanjiPageContext();
	let ref;
	onMount(() => {
		if (ref && $kanjiPage.focus.kanji === $kanji.kanji && !$kanjiPage.focus.noteId) ref.scrollIntoView({ block: "center" });
	});
	return (() => {
		var _el$62 = getNextElement(_tmpl$14$1), _el$63 = _el$62.firstChild, _el$64 = _el$63.nextSibling, [_el$65, _co$10] = getNextMarker(_el$64.nextSibling);
		var _ref$3 = ref;
		typeof _ref$3 === "function" ? use(_ref$3, _el$63) : ref = _el$63;
		insert(_el$63, () => $kanji.kanji);
		insert(_el$62, createComponent(KanjiInfo, {}), _el$65, _co$10);
		return _el$62;
	})();
}

//#endregion
//#region src/components/_kiku_lazy/PictureModal.tsx
var _tmpl$$5 = /* @__PURE__ */ template(`<div part=picture-modal class="z-20 top-0 left-0 w-full h-full p-4 sm:p-8 bg-black/75 flex justify-center items-center [&amp;_*:not(img)]:contents transition-opacity [&amp;_img]:max-h-[95vh]">`);
function PictureModal(props) {
	const [$general] = useGeneralContext();
	const [img, setImg] = createSignal(props.img);
	const startViewTransition = useViewTransition();
	createEffect(() => {
		props.img;
		startViewTransition(() => {
			setImg(props.img);
		});
	});
	return createComponent(Portal, {
		get mount() {
			return $general.layoutRef;
		},
		get children() {
			var _el$ = getNextElement(_tmpl$$5);
			addEventListener(_el$, "click", props["on:click"]);
			createRenderEffect((_p$) => {
				var _v$ = !KIKU_STATE.isAnkiWeb, _v$2 = !!KIKU_STATE.isAnkiWeb, _v$3 = !img(), _v$4 = img() ?? "";
				_v$ !== _p$.e && _el$.classList.toggle("fixed", _p$.e = _v$);
				_v$2 !== _p$.t && _el$.classList.toggle("absolute", _p$.t = _v$2);
				_v$3 !== _p$.a && _el$.classList.toggle("hidden", _p$.a = _v$3);
				_v$4 !== _p$.o && setProperty(_el$, "innerHTML", _p$.o = _v$4);
				return _p$;
			}, {
				e: void 0,
				t: void 0,
				a: void 0,
				o: void 0
			});
			return _el$;
		}
	});
}

//#endregion
//#region src/components/_kiku_lazy/PicturePagination.tsx
var _tmpl$$4 = /* @__PURE__ */ template(`<div class="flex flex-col items-center"><div class="text-xs text-base-content-faint"></div><div>`);
function PicturePagination() {
	const { $group, $next, $prev } = useFieldGroupContext();
	const [$card, $setCard] = useCardContext();
	onMount(() => {
		const handler = (e) => {
			if (e.key === "h") onPrevClick();
			if (e.key === "l") onNextClick();
		};
		window.addEventListener("keydown", handler);
		onCleanup(() => window.removeEventListener("keydown", handler));
	});
	const onPrevClick = () => {
		if ($prev()) {
			const el = $card.sentenceAudios?.[0];
			if (el) {
				el.click();
				if (el instanceof HTMLAudioElement) el.play();
			}
		}
	};
	const onNextClick = () => {
		if ($next()) {
			const el = $card.sentenceAudios?.[0];
			if (el) {
				el.click();
				if (el instanceof HTMLAudioElement) el.play();
			}
		}
	};
	const groupId = () => $group.ids[$group.index];
	const date = () => {
		const ms = Number(groupId());
		if (ms < Date.UTC(2e3, 0, 1) || ms >= Date.UTC(2100, 0, 1)) return null;
		return new Date(ms).toLocaleDateString();
	};
	return $group.ids.length > 1 && [
		createComponent(ArrowLeftIcon, {
			"class": "cursor-pointer size-5 sm:size-8 hover:text-base-content-calm transition-colors",
			"on:click": onPrevClick
		}),
		(() => {
			var _el$ = getNextElement(_tmpl$$4), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling;
			insert(_el$2, date);
			insert(_el$3, () => `${$group.index + 1} / ${$group.ids.length}`);
			return _el$;
		})(),
		createComponent(ArrowLeftIcon, {
			"class": "cursor-pointer size-5 sm:size-8 rotate-180 hover:text-base-content-calm transition-colors",
			"on:click": onNextClick
		})
	];
}

//#endregion
//#region src/components/_kiku_lazy/util/hatsuon.ts
const HIRA_DIGRAPHS = [
	"ぁ",
	"ぃ",
	"ぅ",
	"ぇ",
	"ぉ",
	"ゃ",
	"ゅ",
	"ょ",
	"ゎ",
	"ゕ",
	"ゖ"
];
const KATA_DIGRAPHS = [
	"ァ",
	"ィ",
	"ゥ",
	"ェ",
	"ォ",
	"ャ",
	"ュ",
	"ョ",
	"ヮ",
	"ヵ",
	"ヶ"
];
const PATTERN_NAMES = {
	HEIBAN: {
		EN: "heiban",
		JA: "平板"
	},
	ATAMADAKA: {
		EN: "atamadaka",
		JA: "頭高"
	},
	NAKADAKA: {
		EN: "nakadaka",
		JA: "中高"
	},
	ODAKA: {
		EN: "odaka",
		JA: "尾高"
	}
};
/**
* Checks if character is a digraph
*
* @export
* @param {string} [kana=''] character to test
* @returns {boolean} true if digraph
*/
function isDigraph(kana = "") {
	return KATA_DIGRAPHS.includes(kana) || HIRA_DIGRAPHS.includes(kana);
}
/**
* Splits string into morae
*
* @export
* @param {string} [reading=''] Japanese word
* @returns {[string]} morae
*/
function getMorae(reading = "") {
	const combineDigraphs = (arr = [], char = "") => isDigraph(char) ? arr.slice(0, -1).concat(arr.slice(-1) + char) : arr.concat(char);
	return reading.split("").reduce(combineDigraphs, []);
}
/**
* Get name of pitch type
*
* @export
* @param {number} [moraCount=0] mora count
* @param {any} [pitchNum=-1] pitch number
* @param {string} [locale='EN'] localization of pitch type name
* @returns {string} pitch type name
*/
function getPitchPatternName(moraCount = 0, pitchNum = -1, locale = "EN") {
	let names = {
		EN: "unknown",
		JA: "不詳"
	};
	if (pitchNum === 0) names = PATTERN_NAMES.HEIBAN;
	if (pitchNum === 1) names = PATTERN_NAMES.ATAMADAKA;
	if (pitchNum > 1 && pitchNum < moraCount) names = PATTERN_NAMES.NAKADAKA;
	if (pitchNum > 1 && pitchNum === moraCount) names = PATTERN_NAMES.ODAKA;
	return names[locale] || "unknown";
}
/**
* Creates an Heiban pitch pattern
* initial low -> rest high, particle high
* [0, 1, 1, 1, 1, 1]
*
* @export
* @param {number} [moraCount=0] mora count
* @returns {[number]} pitch pattern
*/
function makeHeiban(moraCount = 0) {
	if (moraCount < 1) return [];
	return [
		0,
		...Array(moraCount).fill(1).slice(0, -1),
		1
	];
}
/**
* Creates an Atamadaka pitch pattern
* initial high -> rest low, particle low
* [1, 0, 0, 0, 0, 0]
*
* @export
* @param {number} [moraCount=0] mora count
* @returns {[number]} pitch pattern
*/
function makeAtamadaka(moraCount = 0) {
	if (moraCount < 1) return [];
	return [
		1,
		...Array(moraCount).fill(0).slice(0, -1),
		0
	];
}
/**
* Creates an Odaka pitch pattern
* initial low, rest high, particle low
* [0, 1, 1, 1, 1, 0]
* @export
* @param {number} [moraCount=0] mora count
* @returns {[number]} pitch pattern
*/
function makeOdaka(moraCount = 0) {
	if (moraCount < 2) return [];
	return [
		0,
		...Array(moraCount).fill(1).slice(0, -1),
		0
	];
}
/**
* Creates a Nakadaka pitch pattern
* initial low, one or more high, rest (at least 1) low, particle low
* final mora before particle *must* be low
* [0, 1, 0, 0, 0, 0]
* [0, 1, 1, 0, 0, 0]
* [0, 1, 1, 1, 0, 0]
*
* @export
* @param {number} [moraCount=0] mora count
* @param {number} [pitchNum=0] pitch number
* @returns {[number]} pitch pattern
*/
function makeNakadaka(moraCount = 0, pitchNum = 0) {
	if (moraCount < 3 || pitchNum < 2 || pitchNum >= moraCount) return [];
	return [
		0,
		...Array(pitchNum - 1).fill(1),
		...Array(moraCount - pitchNum).fill(0),
		0
	];
}
/**
* Creates the relevant pitch pattern determined by mora count & pitch number
*
* @export
* @param {number} [moraCount=0] mora count
* @param {number} [pitchNum=-1] pitch number
* @returns {[number]} pitch pattern
*/
function makePitchPattern(moraCount = 0, pitchNum = -1) {
	switch (getPitchPatternName(moraCount, pitchNum)) {
		case PATTERN_NAMES.HEIBAN.EN: return makeHeiban(moraCount);
		case PATTERN_NAMES.ATAMADAKA.EN: return makeAtamadaka(moraCount);
		case PATTERN_NAMES.ODAKA.EN: return makeOdaka(moraCount);
		case PATTERN_NAMES.NAKADAKA.EN: return makeNakadaka(moraCount, pitchNum);
		default: return [];
	}
}
/**
* Returns pitch accent information for the provided word and pitch number
*
* @module
* @param {string} [reading=''] Japanese word represented in kana
* @param {number} [pitchNum=-1] pitch number
* @returns {object} pitch data
*/
function hatsuon({ reading = "", pitchNum = -1, locale = "JA" } = {}) {
	const morae = getMorae(reading);
	return {
		reading,
		morae,
		pitchNum,
		pattern: makePitchPattern(morae.length, pitchNum),
		patternName: getPitchPatternName(morae.length, pitchNum, locale)
	};
}

//#endregion
//#region src/components/_kiku_lazy/Pitches.tsx
var _tmpl$$3 = /* @__PURE__ */ template(`<div class=tooltip><div class="flex items-start gap-1 animate-fade-in-sm"><div></div><div class="text-sm px-0.5 rounded-sm leading-tight">`), _tmpl$2$2 = /* @__PURE__ */ template(`<span>`);
function Pitches() {
	const [$card] = useCardContext();
	const { ankiFields } = useAnkiFieldContext();
	const pitchPositionDoc = parseHtml(ankiFields.PitchPosition);
	const pitchNumber = unique(Array.from(pitchPositionDoc.querySelectorAll("span")).filter((el) => {
		return !Number.isNaN(Number(el.innerText));
	}).map((el) => {
		return Number(el.innerText);
	}));
	KIKU_STATE.logger.info("Detected pitch number:", pitchNumber);
	const kana = () => {
		if ($card.nested) return ankiFields.ExpressionReading;
		return ankiFields.ExpressionFurigana ? ankiFields["kana:ExpressionFurigana"] : ankiFields.ExpressionReading;
	};
	return pitchNumber.map((pitchNum, index) => {
		const pitchInfo = hatsuon({
			reading: kana(),
			pitchNum
		});
		return createComponent(Pitch, {
			pitchInfo,
			index
		});
	});
}
function Pitch(props) {
	const [$general] = useGeneralContext();
	const ctx = useCtxContext();
	return createComponent(ErrorBoundary, {
		get fallback() {
			return createComponent(DefaultPitch, props);
		},
		get children() {
			return createComponent(Show, {
				get when() {
					return $general.plugin?.Pitch;
				},
				get fallback() {
					return createComponent(DefaultPitch, props);
				},
				children: (get) => {
					const Pitch$1 = get();
					return createComponent(Pitch$1, {
						ctx,
						get index() {
							return props.index;
						},
						get pitchInfo() {
							return props.pitchInfo;
						},
						DefaultPitch: (props$1) => createComponent(DefaultPitch, props$1)
					});
				}
			});
		}
	});
}
function DefaultPitch(props) {
	const pitchInfo = props.pitchInfo;
	const isEven = props.index % 2 === 0;
	const pitchDataset = { "data-is-even": isEven ? "true" : "false" };
	return (() => {
		var _el$ = getNextElement(_tmpl$$3), _el$3 = _el$.firstChild.firstChild, _el$4 = _el$3.nextSibling;
		var _ref$ = props.ref;
		typeof _ref$ === "function" ? use(_ref$, _el$) : props.ref = _el$;
		spread(_el$3, pitchDataset, false, true);
		insert(_el$3, () => pitchInfo.morae.map((mora, i) => {
			return (() => {
				var _el$5 = getNextElement(_tmpl$2$2);
				_el$5.classList.toggle("border-primary", !!isEven);
				_el$5.classList.toggle("border-secondary", !!!isEven);
				insert(_el$5, mora);
				createRenderEffect((_p$) => {
					var _v$ = !!(pitchInfo.pattern[i] === 1), _v$2 = !!(pitchInfo.pattern[i] === 1 && pitchInfo.pattern[i + 1] === 0);
					_v$ !== _p$.e && _el$5.classList.toggle("border-t-2", _p$.e = _v$);
					_v$2 !== _p$.t && _el$5.classList.toggle("pitch-segment", _p$.t = _v$2);
					return _p$;
				}, {
					e: void 0,
					t: void 0
				});
				return _el$5;
			})();
		}));
		_el$4.classList.toggle("bg-primary", !!isEven);
		_el$4.classList.toggle("bg-secondary", !!!isEven);
		_el$4.classList.toggle("text-primary-content", !!isEven);
		_el$4.classList.toggle("text-secondary-content", !!!isEven);
		insert(_el$4, () => pitchInfo.pitchNum);
		createRenderEffect(() => setAttribute(_el$, "data-tip", pitchInfo.patternName));
		runHydrationEvents();
		return _el$;
	})();
}

//#endregion
//#region src/components/_kiku_lazy/HeaderSettings.tsx
var _tmpl$$2 = /* @__PURE__ */ template(`<div class=h-5>`), _tmpl$2$1 = /* @__PURE__ */ template(`<div class="flex flex-row gap-2 items-center"><!$><!/><!$><!/>`), _tmpl$3$1 = /* @__PURE__ */ template(`<div class="text-sm text-base-content-calm">AnkiConnect is available`), _tmpl$4$1 = /* @__PURE__ */ template(`<div class="status status-success">`), _tmpl$5$1 = /* @__PURE__ */ template(`<div class="text-sm text-base-content-calm">AnkiConnect is not available`), _tmpl$6$1 = /* @__PURE__ */ template(`<div class="status status-error animate-ping">`);
function HeaderSettings() {
	const [$general, $setGeneral] = useGeneralContext();
	const { navigateBack } = useNavigationTransition();
	$general.useCheckAnkiConnect();
	return createComponent(HeaderLayout, { get children() {
		return [(() => {
			var _el$ = getNextElement(_tmpl$$2);
			insert(_el$, createComponent(ArrowLeftIcon, {
				"class": "h-full w-full cursor-pointer text-base-content-soft",
				"on:click": () => {
					navigateBack();
				}
			}));
			return _el$;
		})(), (() => {
			var _el$2 = getNextElement(_tmpl$2$1), _el$3 = _el$2.firstChild, [_el$4, _co$] = getNextMarker(_el$3.nextSibling), _el$5 = _el$4.nextSibling, [_el$6, _co$2] = getNextMarker(_el$5.nextSibling);
			insert(_el$2, (() => {
				var _c$ = memo(() => !!$general.isAnkiConnectAvailable);
				return () => _c$() && [getNextElement(_tmpl$3$1), getNextElement(_tmpl$4$1)];
			})(), _el$4, _co$);
			insert(_el$2, (() => {
				var _c$2 = memo(() => !!!$general.isAnkiConnectAvailable);
				return () => _c$2() && [
					createComponent(RefreshCwIcon, {
						"class": "size-4 cursor-pointer text-base-content-soft",
						"on:click": async () => {
							try {
								await $general.checkAnkiConnect();
							} catch {
								$general.toast.error("AnkiConnect is not available");
							}
						}
					}),
					getNextElement(_tmpl$5$1),
					getNextElement(_tmpl$6$1)
				];
			})(), _el$6, _co$2);
			return _el$2;
		})()];
	} });
}

//#endregion
//#region src/components/_kiku_lazy/Settings.tsx
var _tmpl$$1 = /* @__PURE__ */ template(`<div class="bottom-0 w-full"><div class="mx-auto w-full relative layout-max-width"><div class="flex flex-row gap-2 justify-end animate-fade-in mb-4 px-2 sm:px-4"><button class=btn>Back</button><button class=btn>Save`), _tmpl$2 = /* @__PURE__ */ template(`<div><!$><!/><div class=divider></div><!$><!/><div class=divider></div><!$><!/><div class=divider></div><!$><!/><div class=divider></div><!$><!/><div class=divider></div><!$><!/><div class=divider></div><!$><!/><div class=divider></div><div class=pb-16></div><!$><!/>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex flex-col gap-4 animate-fade-in relative"><div class="flex flex-col items-center text-base-content-faint justify-center"><div class="text-base-content-subtle-200 text-6xl">菊</div><div class=text-sm>Kiku Note v<!$><!/></div></div><div class="flex gap-2 items-center justify-between"><div class="text-2xl font-bold">General</div></div><div class="grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] rounded-box gap-4"><fieldset class=fieldset><legend class=fieldset-legend>Web Volume<div class=tooltip data-tip="Controls the volume of audio played in the webview (Desktop and AnkiWeb only)."></div></legend><input type=range min=0 max=100 class="range w-full range-sm"step=1></fieldset><fieldset class="fieldset py-0"><legend class=fieldset-legend>Blur NSFW</legend><label class=label><input type=checkbox class=toggle></label></fieldset><fieldset class="fieldset py-0"><legend class=fieldset-legend>Picture on Front</legend><label class=label><input type=checkbox class=toggle></label></fieldset><fieldset class="fieldset py-0"><legend class=fieldset-legend>Mute NSFW</legend><label class=label><input type=checkbox class=toggle></label></fieldset><fieldset class="fieldset py-0"><legend class=fieldset-legend>Show Theme</legend><label class=label><input type=checkbox class=toggle></label></fieldset><fieldset class="fieldset py-0"><legend class=fieldset-legend>Mobile Layout Alt<div class=tooltip data-tip="Swap Sentence and Definition position on mobile"></div></legend><label class=label><input type=checkbox class=toggle></label></fieldset><fieldset class="fieldset py-0"><legend class=fieldset-legend>Prefer AnkiConnect<div class=tooltip data-tip="Query notes via AnkiConnect instead of the notes cache (Desktop only). May be slower and cause Anki to lag under heavy queries"></div></legend><label class=label><input type=checkbox class=toggle></label></fieldset><fieldset class=fieldset><legend class=fieldset-legend>Layout Max Width</legend><input type=range min=0 class="range w-full range-sm"step=1><div class="flex justify-between px-2.5 text-xs"></div><div class="flex justify-between px-2.5 text-xs">`), _tmpl$4 = /* @__PURE__ */ template(`<span>|`), _tmpl$5 = /* @__PURE__ */ template(`<span>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="flex flex-col gap-4 animate-fade-in relative"><div class="flex gap-2 items-center justify-between"><div class="text-2xl font-bold">Mod</div></div><div><div class="text-lg font-bold flex gap-2 items-center">Hidden<div class=tooltip data-tip="Expression fade out after timeout"></div></div><div class="grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] rounded-box gap-4"><fieldset class="fieldset py-0"><legend class=fieldset-legend>Enable</legend><label class=label><input type=checkbox class=toggle></label></fieldset><fieldset class=fieldset><legend class=fieldset-legend>Timeout</legend><input type=range min=1000 max=5000 class="range w-full range-sm"step=1000><div class="flex justify-between px-2.5 text-xs"><span>|</span><span>|</span><span>|</span><span>|</span><span>|</span></div><div class="flex justify-between px-2.5 text-xs"><span>1s</span><span>2s</span><span>3s</span><span>4s</span><span>5s</span></div></fieldset></div></div><div><div class="text-lg font-bold flex gap-2 items-center">Vertical<div class=tooltip data-tip="Expression appears in the vertical direction"></div></div><div class="grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] rounded-box gap-4"><fieldset class="fieldset py-0"><legend class=fieldset-legend>Enable</legend><label class=label><input type=checkbox class=toggle>`), _tmpl$7 = /* @__PURE__ */ template(`<div role=alert class="alert alert-warning"><span>A quick flash of the wrong theme may occur until you click Save and restart Anki.`), _tmpl$8 = /* @__PURE__ */ template(`<div class="flex flex-col gap-4 animate-fade-in"><div class="text-2xl font-bold">Theme</div><!$><!/><div class="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] rounded-box gap-4">`), _tmpl$9 = /* @__PURE__ */ template(`<div class="border-base-content/20 hover:border-base-content/40 overflow-hidden rounded-lg border outline-2 outline-offset-2"><div class="bg-base-100 text-base-content w-full cursor-pointer"><div class="grid grid-cols-5 grid-rows-3"><div class="bg-base-200 col-start-1 row-span-2 row-start-1"></div><div class="bg-base-300 col-start-1 row-start-3"></div><div class="bg-base-100 col-span-4 col-start-2 row-span-3 row-start-1 flex flex-col gap-1 p-2"><div class=font-bold></div><div class="flex flex-wrap gap-1"><div class="bg-primary flex aspect-square w-5 items-center justify-center rounded"><div class="text-primary-content text-sm font-bold">A</div></div><div class="bg-secondary flex aspect-square w-5 items-center justify-center rounded"><div class="text-secondary-content text-sm font-bold">A</div></div><div class="bg-accent flex aspect-square w-5 items-center justify-center rounded"><div class="text-accent-content text-sm font-bold">A</div></div><div class="bg-neutral flex aspect-square w-5 items-center justify-center rounded"><div class="text-neutral-content text-sm font-bold">A`), _tmpl$0 = /* @__PURE__ */ template(`<div class="flex flex-col gap-4 animate-fade-in"><div class="text-2xl font-bold">Font</div><div><div class="text-lg font-bold">Primary</div><div class="grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] rounded-box gap-4"><fieldset class=fieldset><legend class=fieldset-legend>Web Font</legend><select class="select w-full"></select></fieldset><fieldset class=fieldset><legend class=fieldset-legend>System Font<!$><!/></legend><input type=text class="input w-full"placeholder="'Inter', 'SF Pro Display', 'Liberation Sans', 'Segoe UI', 'Hiragino Kaku Gothic ProN', 'Noto Sans CJK JP', 'Noto Sans JP', 'Meiryo', HanaMinA, HanaMinB, sans-serif"></fieldset><fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-64 py-4"><legend class=fieldset-legend>Use System Font</legend><label class="label text-base-content-soft"><input type=checkbox class=toggle><!$><!/></label></fieldset></div></div><div><div class="text-lg font-bold">Secondary</div><div class="grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] rounded-box gap-4"><fieldset class=fieldset><legend class=fieldset-legend>Web Font</legend><select class="select w-full"></select></fieldset><fieldset class=fieldset><legend class=fieldset-legend>System Font<!$><!/></legend><input type=text class="input w-full"placeholder="'Hiragino Mincho ProN', 'Noto Serif CJK JP', 'Noto Serif JP', 'Yu Mincho', HanaMinA, HanaMinB, serif"></fieldset><fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-64 py-4"><legend class=fieldset-legend>Use System Font</legend><label class="label text-base-content-soft"><input type=checkbox class=toggle><!$><!/>`), _tmpl$1 = /* @__PURE__ */ template(`<option><span class=font-primary>`), _tmpl$10 = /* @__PURE__ */ template(`<option><span class=font-secondary>`), _tmpl$11 = /* @__PURE__ */ template(`<div class="flex flex-col gap-4 animate-fade-in"><div class="collapse gap-4 collapse-arrow"><input type=checkbox><div class="collapse-title p-0"><div class="text-2xl font-bold">Font Size</div></div><div class="collapse-content p-0 flex flex-col gap-4"><div><div class="text-lg font-bold">Mobile</div><div class="grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] rounded-box gap-x-4 gap-y-4 sm:gap-y-2"><!$><!/><!$><!/><!$><!/><!$><!/><!$><!/></div></div><div><div class="text-lg font-bold">Desktop</div><div class="grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] rounded-box gap-x-4 gap-y-4 sm:gap-y-2"><!$><!/><!$><!/><!$><!/><!$><!/><!$><!/>`), _tmpl$12 = /* @__PURE__ */ template(`<div class=w-full><fieldset class=fieldset><legend class=fieldset-legend><!$><!/> <!$><!/></legend><div class=tooltip><div class=tooltip-content><div class=font-secondary>あ</div></div><input type=range min=0 class="range range-xs w-full "step=1></div><div class="flex justify-between px-2 mt-1 text-xs"></div><div class="flex justify-between px-2 mt-1 text-xs">`), _tmpl$13 = /* @__PURE__ */ template(`<div class="flex flex-col gap-2 animate-fade-in"><div class="text-2xl font-bold">AnkiDroid</div><div><div class="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] rounded-box gap-x-4 gap-y-2"><fieldset class="fieldset bg-base-100 border-base-300 rounded-box"><legend class=fieldset-legend>Enable Integration</legend><label class=label><input type=checkbox class=toggle></label></fieldset><fieldset class="fieldset bg-base-100 border-base-300 rounded-box"><legend class=fieldset-legend>Reverse Swipe Direction</legend><label class=label><input type=checkbox class=toggle>`), _tmpl$14 = /* @__PURE__ */ template(`<div role=alert class="alert alert-warning"><span>Some files are missing, things may not work as expected.<br><span class="text-xs ">`), _tmpl$15 = /* @__PURE__ */ template(`<div class="flex flex-col gap-2"><div class="flex gap-2 items-center"><div class=text-lg>Kiku Files</div><!$><!/></div><!$><!/><pre class="text-xs bg-base-200 p-4 rounded-lg overflow-auto">`), _tmpl$16 = /* @__PURE__ */ template(`<div class="collapse collapse-arrow"><input type=checkbox><div class="collapse-title text-2xl font-bold p-0">Debug</div><div class="collapse-content p-0"><div class="flex flex-col gap-4 animate-fade-in "><div class="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] rounded-box gap-x-4 gap-y-2"><fieldset class=fieldset><legend class=fieldset-legend>AnkiConnect Address<!$><!/></legend><input type=text class="input w-full"></fieldset><fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-64 py-4"><legend class=fieldset-legend>Show Startup Time</legend><label class=label><input type=checkbox class=toggle></label></fieldset></div><div class="flex flex-col gap-2"><div class="flex gap-2 items-center"><div class=text-lg>Expected Root Dataset</div><!$><!/></div><pre class="text-xs bg-base-200 p-4 rounded-lg overflow-auto"><span class="opacity-25 select-none">&lt;div\n</span><!$><!/><span class="opacity-25 select-none">\n></span></pre></div><div class="flex flex-col gap-2"><div class="flex gap-2 items-center"><div class=text-lg>Expected CSS Variable</div><!$><!/></div><pre class="text-xs bg-base-200 p-4 rounded-lg overflow-auto"><span class="opacity-25 select-none">:root, :host \{\n</span><!$><!/><span class="opacity-25 select-none">\n}</span></pre></div><div class="flex flex-col gap-2"><div class="flex gap-2 items-center"><div class=text-lg>Config</div><!$><!/></div><pre class="text-xs bg-base-200 p-4 rounded-lg overflow-auto"></pre></div><div class="flex flex-col gap-2"><div class="flex gap-2 items-center"><div class=text-lg>Anki Fields</div><!$><!/></div><pre class="text-xs bg-base-200 p-4 rounded-lg overflow-auto"></pre></div><!$><!/><div class="flex flex-col gap-2"><div class="flex gap-2 items-center"><div class=text-lg>Logs</div><!$><!/><!$><!/></div><pre class="text-xs bg-base-200 p-4 rounded-lg overflow-auto max-h-[90svh]">`);
function toDashed(str) {
	return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}
function toDatasetKey(str) {
	return `data-${str}`;
}
function toDatasetString(obj) {
	return Object.entries(obj).map(([key, value]) => {
		const dashed = toDashed(key);
		return `${toDatasetKey(dashed)}="${value}"`;
	}).join("\n");
}
function toCssVarString(obj) {
	return Object.entries(obj).map(([key, value]) => {
		if (value === "") value = "undefined";
		return `${key}: ${value.replaceAll("\n", "").replaceAll("'", "\"")};`;
	}).join("\n");
}
function Settings() {
	const [$config] = useConfigContext();
	const [$card, _$setCard] = useCardContext();
	const [$general, $setGeneral] = useGeneralContext();
	const { navigateBack } = useNavigationTransition();
	const saveConfig = async () => {
		try {
			KIKU_STATE.logger.debug("Saving config:", $config);
			await AnkiConnect.saveConfig($config);
			$general.toast.success("Saved! Restart Anki to apply changes.");
		} catch (e) {
			$general.toast.error(`Failed to save config: ${e instanceof Error ? e.message : ""}`);
		}
	};
	const ctx = useCtxContext();
	onMount(() => {
		try {
			$general.plugin?.onSettingsMount?.({ ctx });
		} catch {}
	});
	return [createComponent(HeaderSettings, {}), (() => {
		var _el$ = getNextElement(_tmpl$2), _el$13 = _el$.firstChild, [_el$14, _co$] = getNextMarker(_el$13.nextSibling), _el$15 = _el$14.nextSibling.nextSibling, [_el$16, _co$2] = getNextMarker(_el$15.nextSibling), _el$17 = _el$16.nextSibling.nextSibling, [_el$18, _co$3] = getNextMarker(_el$17.nextSibling), _el$19 = _el$18.nextSibling.nextSibling, [_el$20, _co$4] = getNextMarker(_el$19.nextSibling), _el$21 = _el$20.nextSibling.nextSibling, [_el$22, _co$5] = getNextMarker(_el$21.nextSibling), _el$23 = _el$22.nextSibling.nextSibling, [_el$24, _co$6] = getNextMarker(_el$23.nextSibling), _el$25 = _el$24.nextSibling.nextSibling, [_el$26, _co$7] = getNextMarker(_el$25.nextSibling), _el$27 = _el$26.nextSibling.nextSibling.nextSibling, [_el$28, _co$8] = getNextMarker(_el$27.nextSibling);
		insert(_el$, createComponent(GeneralSettings, {}), _el$14, _co$);
		insert(_el$, createComponent(ModSettings, {}), _el$16, _co$2);
		insert(_el$, createComponent(ThemeSettings, {}), _el$18, _co$3);
		insert(_el$, createComponent(FontSettings, {}), _el$20, _co$4);
		insert(_el$, createComponent(FontSizeSettings, {}), _el$22, _co$5);
		insert(_el$, createComponent(AnkiDroidSettings, {}), _el$24, _co$6);
		insert(_el$, createComponent(DebugSettings, {}), _el$26, _co$7);
		insert(_el$, createComponent(Portal, {
			get mount() {
				return $general.layoutRef;
			},
			get children() {
				var _el$0 = getNextElement(_tmpl$$1), _el$11 = _el$0.firstChild.firstChild.firstChild, _el$12 = _el$11.nextSibling;
				addEventListener(_el$11, "click", () => navigateBack());
				addEventListener(_el$12, "click", saveConfig);
				createRenderEffect((_p$) => {
					var _v$ = !KIKU_STATE.isAnkiWeb, _v$2 = !!KIKU_STATE.isAnkiWeb, _v$3 = {
						"btn-primary": $general.isAnkiConnectAvailable,
						"btn-disabled bg-base-300 text-base-content-faint": !$general.isAnkiConnectAvailable
					}, _v$4 = !$general.isAnkiConnectAvailable;
					_v$ !== _p$.e && _el$0.classList.toggle("fixed", _p$.e = _v$);
					_v$2 !== _p$.t && _el$0.classList.toggle("absolute", _p$.t = _v$2);
					_p$.a = classList(_el$12, _v$3, _p$.a);
					_v$4 !== _p$.o && setProperty(_el$12, "disabled", _p$.o = _v$4);
					return _p$;
				}, {
					e: void 0,
					t: void 0,
					a: void 0,
					o: void 0
				});
				return _el$0;
			}
		}), _el$28, _co$8);
		return _el$;
	})()];
}
function GeneralSettings() {
	const [$config, $setConfig] = useConfigContext();
	return (() => {
		var _el$29 = getNextElement(_tmpl$3), _el$30 = _el$29.firstChild, _el$32 = _el$30.firstChild.nextSibling, _el$34 = _el$32.firstChild.nextSibling, [_el$35, _co$9] = getNextMarker(_el$34.nextSibling), _el$38 = _el$30.nextSibling.nextSibling.firstChild, _el$39 = _el$38.firstChild, _el$41 = _el$39.firstChild.nextSibling, _el$42 = _el$39.nextSibling, _el$43 = _el$38.nextSibling, _el$46 = _el$43.firstChild.nextSibling.firstChild, _el$47 = _el$43.nextSibling, _el$50 = _el$47.firstChild.nextSibling.firstChild, _el$51 = _el$47.nextSibling, _el$54 = _el$51.firstChild.nextSibling.firstChild, _el$55 = _el$51.nextSibling, _el$58 = _el$55.firstChild.nextSibling.firstChild, _el$59 = _el$55.nextSibling, _el$60 = _el$59.firstChild, _el$62 = _el$60.firstChild.nextSibling, _el$64 = _el$60.nextSibling.firstChild, _el$65 = _el$59.nextSibling, _el$66 = _el$65.firstChild, _el$68 = _el$66.firstChild.nextSibling, _el$70 = _el$66.nextSibling.firstChild, _el$73 = _el$65.nextSibling.firstChild.nextSibling, _el$74 = _el$73.nextSibling, _el$75 = _el$74.nextSibling;
		insert(_el$32, () => env.KIKU_VERSION, _el$35, _co$9);
		insert(_el$41, createComponent(InfoIcon, { "class": "size-4 text-base-content-calm" }));
		addEventListener(_el$42, "change", (e) => {
			const value = e.target.value;
			$setConfig("volume", Number(value));
		});
		addEventListener(_el$46, "change", (e) => {
			$setConfig("blurNsfw", e.target.checked);
		});
		addEventListener(_el$50, "change", (e) => {
			$setConfig("pictureOnFront", e.target.checked);
		});
		addEventListener(_el$54, "change", (e) => {
			$setConfig("muteNsfw", e.target.checked);
		});
		addEventListener(_el$58, "change", (e) => {
			$setConfig("showTheme", e.target.checked);
		});
		insert(_el$62, createComponent(InfoIcon, { "class": "size-4 text-base-content-calm" }));
		addEventListener(_el$64, "change", (e) => {
			$setConfig("swapSentenceAndDefinitionOnMobile", e.target.checked);
		});
		insert(_el$68, createComponent(InfoIcon, { "class": "size-4 text-base-content-calm" }));
		addEventListener(_el$70, "change", (e) => {
			$setConfig("preferAnkiConnect", e.target.checked);
		});
		addEventListener(_el$73, "change", (e) => {
			const target = e.target;
			const value = tailwindContainerSize[Number(target.value)];
			$setConfig("layoutMaxWidth", value);
		});
		insert(_el$74, createComponent(For, {
			each: tailwindContainerSize,
			children: (_) => getNextElement(_tmpl$4)
		}));
		insert(_el$75, createComponent(For, {
			each: tailwindContainerSize,
			children: (label) => (() => {
				var _el$77 = getNextElement(_tmpl$5);
				insert(_el$77, label);
				return _el$77;
			})()
		}));
		createRenderEffect(() => setAttribute(_el$73, "max", (tailwindContainerSize.length - 1).toString()));
		createRenderEffect(() => setProperty(_el$42, "value", $config.volume.toString()));
		createRenderEffect(() => setProperty(_el$46, "checked", $config.blurNsfw));
		createRenderEffect(() => setProperty(_el$50, "checked", $config.pictureOnFront));
		createRenderEffect(() => setProperty(_el$54, "checked", $config.muteNsfw));
		createRenderEffect(() => setProperty(_el$58, "checked", $config.showTheme));
		createRenderEffect(() => setProperty(_el$64, "checked", $config.swapSentenceAndDefinitionOnMobile));
		createRenderEffect(() => setProperty(_el$70, "checked", $config.preferAnkiConnect));
		createRenderEffect(() => setProperty(_el$73, "value", tailwindContainerSize.indexOf($config.layoutMaxWidth).toString()));
		return _el$29;
	})();
}
function ModSettings() {
	const [$config, $setConfig] = useConfigContext();
	return (() => {
		var _el$78 = getNextElement(_tmpl$6), _el$80 = _el$78.firstChild.nextSibling, _el$81 = _el$80.firstChild, _el$83 = _el$81.firstChild.nextSibling, _el$85 = _el$81.nextSibling.firstChild, _el$88 = _el$85.firstChild.nextSibling.firstChild, _el$91 = _el$85.nextSibling.firstChild.nextSibling, _el$93 = _el$80.nextSibling.firstChild, _el$95 = _el$93.firstChild.nextSibling, _el$100 = _el$93.nextSibling.firstChild.firstChild.nextSibling.firstChild;
		insert(_el$83, createComponent(InfoIcon, { "class": "size-4 text-base-content-calm" }));
		addEventListener(_el$88, "change", (e) => {
			$setConfig("modHidden", e.target.checked);
		});
		addEventListener(_el$91, "change", (e) => {
			const value = e.target.value;
			$setConfig("modHiddenDuration", Number(value));
		});
		insert(_el$95, createComponent(InfoIcon, { "class": "size-4 text-base-content-calm" }));
		addEventListener(_el$100, "change", (e) => {
			$setConfig("modVertical", e.target.checked);
		});
		createRenderEffect(() => setProperty(_el$88, "checked", $config.modHidden));
		createRenderEffect(() => setProperty(_el$91, "value", $config.modHiddenDuration.toString()));
		createRenderEffect(() => setProperty(_el$100, "checked", $config.modVertical));
		return _el$78;
	})();
}
function ThemeSettings() {
	const [$general] = useGeneralContext();
	const [$config, _$setConfig] = useConfigContext();
	const changeTheme = useThemeTransition();
	return (() => {
		var _el$101 = getNextElement(_tmpl$8), _el$105 = _el$101.firstChild.nextSibling, [_el$106, _co$0] = getNextMarker(_el$105.nextSibling), _el$104 = _el$106.nextSibling;
		insert(_el$101, createComponent(Show, {
			get when() {
				return $general.isThemeChanged;
			},
			get children() {
				return getNextElement(_tmpl$7);
			}
		}), _el$106, _co$0);
		insert(_el$104, () => daisyUIThemes.map((theme) => {
			return (() => {
				var _el$107 = getNextElement(_tmpl$9), _el$109 = _el$107.firstChild.firstChild, _el$113 = _el$109.firstChild.nextSibling.nextSibling.firstChild;
				addEventListener(_el$107, "click", () => {
					changeTheme(theme);
				});
				setAttribute(_el$109, "data-theme", theme);
				insert(_el$113, () => capitalize(theme));
				createRenderEffect(() => _el$107.classList.toggle("outline-2", !!(theme === $config.theme)));
				return _el$107;
			})();
		}));
		return _el$101;
	})();
}
function FontSettings() {
	const [$config, $setConfig] = useConfigContext();
	return (() => {
		var _el$114 = getNextElement(_tmpl$0), _el$116 = _el$114.firstChild.nextSibling, _el$119 = _el$116.firstChild.nextSibling.firstChild, _el$121 = _el$119.firstChild.nextSibling, _el$122 = _el$119.nextSibling, _el$123 = _el$122.firstChild, _el$125 = _el$123.firstChild.nextSibling, [_el$126, _co$1] = getNextMarker(_el$125.nextSibling), _el$127 = _el$123.nextSibling, _el$130 = _el$122.nextSibling.firstChild.nextSibling, _el$131 = _el$130.firstChild, _el$132 = _el$131.nextSibling, [_el$133, _co$10] = getNextMarker(_el$132.nextSibling), _el$137 = _el$116.nextSibling.firstChild.nextSibling.firstChild, _el$139 = _el$137.firstChild.nextSibling, _el$140 = _el$137.nextSibling, _el$141 = _el$140.firstChild, _el$143 = _el$141.firstChild.nextSibling, [_el$144, _co$11] = getNextMarker(_el$143.nextSibling), _el$145 = _el$141.nextSibling, _el$148 = _el$140.nextSibling.firstChild.nextSibling, _el$149 = _el$148.firstChild, _el$150 = _el$149.nextSibling, [_el$151, _co$12] = getNextMarker(_el$150.nextSibling);
		addEventListener(_el$119, "change", (e) => {
			const target = e.target;
			$setConfig("webFontPrimary", target.value);
		});
		insert(_el$121, () => webFonts.map((font) => {
			return (() => {
				var _el$152 = getNextElement(_tmpl$1), _el$153 = _el$152.firstChild;
				setProperty(_el$152, "value", font);
				setStyleProperty(_el$153, "font-family", font);
				insert(_el$153, font);
				createRenderEffect(() => setProperty(_el$152, "selected", $config.webFontPrimary === font));
				return _el$152;
			})();
		}));
		insert(_el$123, createComponent(UndoIcon, {
			"class": "h-4 w-4 cursor-pointer",
			get classList() {
				return { hidden: $config.systemFontPrimary === defaultConfig.systemFontPrimary };
			},
			"on:click": () => {
				$setConfig("systemFontPrimary", defaultConfig.systemFontPrimary);
			}
		}), _el$126, _co$1);
		addEventListener(_el$127, "input", (e) => {
			$setConfig("systemFontPrimary", e.target.value);
		});
		addEventListener(_el$131, "change", (e) => {
			$setConfig("useSystemFontPrimary", e.target.checked);
		});
		insert(_el$130, () => $config.useSystemFontPrimary ? "Using System Font" : "Using Web Font", _el$133, _co$10);
		addEventListener(_el$137, "change", (e) => {
			const target = e.target;
			$setConfig("webFontSecondary", target.value);
		});
		insert(_el$139, () => webFonts.map((font) => {
			return (() => {
				var _el$154 = getNextElement(_tmpl$10), _el$155 = _el$154.firstChild;
				setProperty(_el$154, "value", font);
				setStyleProperty(_el$155, "font-family", font);
				insert(_el$155, font);
				createRenderEffect(() => setProperty(_el$154, "selected", $config.webFontSecondary === font));
				return _el$154;
			})();
		}));
		insert(_el$141, createComponent(UndoIcon, {
			"class": "h-4 w-4 cursor-pointer",
			get classList() {
				return { hidden: $config.systemFontSecondary === defaultConfig.systemFontSecondary };
			},
			"on:click": () => {
				$setConfig("systemFontSecondary", defaultConfig.systemFontSecondary);
			}
		}), _el$144, _co$11);
		addEventListener(_el$145, "input", (e) => {
			$setConfig("systemFontSecondary", e.target.value);
		});
		addEventListener(_el$149, "change", (e) => {
			$setConfig("useSystemFontSecondary", e.target.checked);
		});
		insert(_el$148, () => $config.useSystemFontSecondary ? "Using System Font" : "Using Web Font", _el$151, _co$12);
		createRenderEffect((_p$) => {
			var _v$5 = !!$config.useSystemFontPrimary, _v$6 = !$config.useSystemFontPrimary, _v$7 = !!$config.useSystemFontSecondary, _v$8 = !$config.useSystemFontSecondary;
			_v$5 !== _p$.e && _el$119.classList.toggle("hidden", _p$.e = _v$5);
			_v$6 !== _p$.t && _el$122.classList.toggle("hidden", _p$.t = _v$6);
			_v$7 !== _p$.a && _el$137.classList.toggle("hidden", _p$.a = _v$7);
			_v$8 !== _p$.o && _el$140.classList.toggle("hidden", _p$.o = _v$8);
			return _p$;
		}, {
			e: void 0,
			t: void 0,
			a: void 0,
			o: void 0
		});
		createRenderEffect(() => setProperty(_el$127, "value", $config.systemFontPrimary));
		createRenderEffect(() => setProperty(_el$131, "checked", $config.useSystemFontPrimary));
		createRenderEffect(() => setProperty(_el$145, "value", $config.systemFontSecondary));
		createRenderEffect(() => setProperty(_el$149, "checked", $config.useSystemFontSecondary));
		return _el$114;
	})();
}
function FontSizeSettings() {
	return (() => {
		var _el$156 = getNextElement(_tmpl$11), _el$161 = _el$156.firstChild.firstChild.nextSibling.nextSibling.firstChild, _el$163 = _el$161.firstChild.nextSibling, _el$164 = _el$163.firstChild, [_el$165, _co$13] = getNextMarker(_el$164.nextSibling), _el$166 = _el$165.nextSibling, [_el$167, _co$14] = getNextMarker(_el$166.nextSibling), _el$168 = _el$167.nextSibling, [_el$169, _co$15] = getNextMarker(_el$168.nextSibling), _el$170 = _el$169.nextSibling, [_el$171, _co$16] = getNextMarker(_el$170.nextSibling), _el$172 = _el$171.nextSibling, [_el$173, _co$17] = getNextMarker(_el$172.nextSibling), _el$176 = _el$161.nextSibling.firstChild.nextSibling, _el$177 = _el$176.firstChild, [_el$178, _co$18] = getNextMarker(_el$177.nextSibling), _el$179 = _el$178.nextSibling, [_el$180, _co$19] = getNextMarker(_el$179.nextSibling), _el$181 = _el$180.nextSibling, [_el$182, _co$20] = getNextMarker(_el$181.nextSibling), _el$183 = _el$182.nextSibling, [_el$184, _co$21] = getNextMarker(_el$183.nextSibling), _el$185 = _el$184.nextSibling, [_el$186, _co$22] = getNextMarker(_el$185.nextSibling);
		insert(_el$163, createComponent(FontSizeSettingsFieldset, {
			configKey: "fontSizeBaseExpression",
			label: "Expression"
		}), _el$165, _co$13);
		insert(_el$163, createComponent(FontSizeSettingsFieldset, {
			configKey: "fontSizeBasePitch",
			label: "Pitch"
		}), _el$167, _co$14);
		insert(_el$163, createComponent(FontSizeSettingsFieldset, {
			configKey: "fontSizeBaseSentence",
			label: "Sentence"
		}), _el$169, _co$15);
		insert(_el$163, createComponent(FontSizeSettingsFieldset, {
			configKey: "fontSizeBaseMiscInfo",
			label: "Misc Info"
		}), _el$171, _co$16);
		insert(_el$163, createComponent(FontSizeSettingsFieldset, {
			configKey: "fontSizeBaseHint",
			label: "Hint"
		}), _el$173, _co$17);
		insert(_el$176, createComponent(FontSizeSettingsFieldset, {
			configKey: "fontSizeSmExpression",
			label: "Expression"
		}), _el$178, _co$18);
		insert(_el$176, createComponent(FontSizeSettingsFieldset, {
			configKey: "fontSizeSmPitch",
			label: "Pitch"
		}), _el$180, _co$19);
		insert(_el$176, createComponent(FontSizeSettingsFieldset, {
			configKey: "fontSizeSmSentence",
			label: "Sentence"
		}), _el$182, _co$20);
		insert(_el$176, createComponent(FontSizeSettingsFieldset, {
			configKey: "fontSizeSmMiscInfo",
			label: "Misc Info"
		}), _el$184, _co$21);
		insert(_el$176, createComponent(FontSizeSettingsFieldset, {
			configKey: "fontSizeSmHint",
			label: "Hint"
		}), _el$186, _co$22);
		return _el$156;
	})();
}
function FontSizeSettingsFieldset(props) {
	const [$config, $setConfig] = useConfigContext();
	const configValue = () => $config[props.configKey];
	return (() => {
		var _el$187 = getNextElement(_tmpl$12), _el$189 = _el$187.firstChild.firstChild, _el$191 = _el$189.firstChild, [_el$192, _co$23] = getNextMarker(_el$191.nextSibling), _el$193 = _el$192.nextSibling.nextSibling, [_el$194, _co$24] = getNextMarker(_el$193.nextSibling), _el$195 = _el$189.nextSibling, _el$196 = _el$195.firstChild, _el$197 = _el$196.firstChild, _el$198 = _el$196.nextSibling, _el$199 = _el$195.nextSibling, _el$200 = _el$199.nextSibling;
		insert(_el$189, () => props.label, _el$192, _co$23);
		insert(_el$189, createComponent(UndoIcon, {
			"class": "h-4 w-4 cursor-pointer",
			get classList() {
				return { hidden: $config[props.configKey] === defaultConfig[props.configKey] };
			},
			"on:click": () => {
				$setConfig(props.configKey, defaultConfig[props.configKey]);
			}
		}), _el$194, _co$24);
		addEventListener(_el$198, "change", (e) => {
			const target = e.target;
			const value = tailwindSize[Number(target.value)];
			$setConfig(props.configKey, value);
		});
		insert(_el$199, createComponent(For, {
			each: tailwindSize,
			children: (_) => getNextElement(_tmpl$4)
		}));
		insert(_el$200, createComponent(For, {
			each: tailwindSize,
			children: (label) => (() => {
				var _el$202 = getNextElement(_tmpl$5);
				insert(_el$202, label);
				return _el$202;
			})()
		}));
		createRenderEffect((_p$) => {
			var _v$9 = tailwindFontSizeVar[configValue()].fontSize, _v$0 = tailwindFontSizeVar[configValue()].lineHeight, _v$1 = (tailwindSize.length - 1).toString();
			_v$9 !== _p$.e && setStyleProperty(_el$197, "font-size", _p$.e = _v$9);
			_v$0 !== _p$.t && setStyleProperty(_el$197, "line-height", _p$.t = _v$0);
			_v$1 !== _p$.a && setAttribute(_el$198, "max", _p$.a = _v$1);
			return _p$;
		}, {
			e: void 0,
			t: void 0,
			a: void 0
		});
		createRenderEffect(() => setProperty(_el$198, "value", tailwindSize.indexOf(configValue()).toString()));
		return _el$187;
	})();
}
function AnkiDroidSettings() {
	const [$config, $setConfig] = useConfigContext();
	return (() => {
		var _el$203 = getNextElement(_tmpl$13), _el$207 = _el$203.firstChild.nextSibling.firstChild.firstChild, _el$210 = _el$207.firstChild.nextSibling.firstChild, _el$214 = _el$207.nextSibling.firstChild.nextSibling.firstChild;
		addEventListener(_el$210, "change", (e) => {
			$setConfig("ankiDroidEnableIntegration", e.target.checked);
		});
		addEventListener(_el$214, "change", (e) => {
			$setConfig("ankiDroidReverseSwipeDirection", e.target.checked);
		});
		createRenderEffect(() => setProperty(_el$210, "checked", $config.ankiDroidEnableIntegration));
		createRenderEffect(() => setProperty(_el$214, "checked", $config.ankiDroidReverseSwipeDirection));
		return _el$203;
	})();
}
function DebugSettings() {
	const [$config, $setConfig] = useConfigContext();
	const [$card] = useCardContext();
	const { ankiFields } = useAnkiFieldContext();
	const [kikuFiles, setKikuFiles] = createSignal();
	const [missingFiles, setMissingFiles] = createSignal();
	const [$general, _$setGeneral] = useGeneralContext();
	createEffect(async () => {
		if ($general.isAnkiConnectAvailable) {
			const files = await AnkiConnect.getKikuFiles();
			setKikuFiles(JSON.stringify(files, null, 2));
			const missing = env.KIKU_IMPORTANT_FILES.filter((file) => {
				return !files.includes(file);
			});
			setMissingFiles(missing.join(", "));
		}
	});
	const [logs, setLogs] = createSignal();
	onMount(() => {
		const id = setInterval(() => {
			setLogs(KIKU_STATE.logger.get());
		}, 8e3);
		onCleanup(() => {
			clearInterval(id);
		});
		setLogs(KIKU_STATE.logger.get());
	});
	function copyToClipboard(text) {
		navigator.clipboard.writeText(text).then(() => {
			$general.toast.success("Copied to clipboard!");
		}).catch(() => {
			$general.toast.error("Copy to clipboard is not supported, you can select and CTRL+C manually.");
		});
	}
	const rootDataset = () => {
		return Object.fromEntries(Object.entries($config).filter(([key]) => {
			return rootDatasetConfigWhitelist.has(key);
		}));
	};
	const cssVar = () => getCssVar($config);
	return (() => {
		var _el$215 = getNextElement(_tmpl$16), _el$219 = _el$215.firstChild.nextSibling.nextSibling.firstChild, _el$220 = _el$219.firstChild, _el$221 = _el$220.firstChild, _el$222 = _el$221.firstChild, _el$224 = _el$222.firstChild.nextSibling, [_el$225, _co$25] = getNextMarker(_el$224.nextSibling), _el$226 = _el$222.nextSibling, _el$230 = _el$221.nextSibling.firstChild.nextSibling.firstChild, _el$231 = _el$220.nextSibling, _el$232 = _el$231.firstChild, _el$234 = _el$232.firstChild.nextSibling, [_el$235, _co$26] = getNextMarker(_el$234.nextSibling), _el$236 = _el$232.nextSibling, _el$239 = _el$236.firstChild.nextSibling, [_el$240, _co$27] = getNextMarker(_el$239.nextSibling);
		_el$240.nextSibling;
		var _el$241 = _el$231.nextSibling, _el$242 = _el$241.firstChild, _el$244 = _el$242.firstChild.nextSibling, [_el$245, _co$28] = getNextMarker(_el$244.nextSibling), _el$246 = _el$242.nextSibling, _el$249 = _el$246.firstChild.nextSibling, [_el$250, _co$29] = getNextMarker(_el$249.nextSibling);
		_el$250.nextSibling;
		var _el$251 = _el$241.nextSibling, _el$252 = _el$251.firstChild, _el$254 = _el$252.firstChild.nextSibling, [_el$255, _co$30] = getNextMarker(_el$254.nextSibling), _el$256 = _el$252.nextSibling, _el$257 = _el$251.nextSibling, _el$258 = _el$257.firstChild, _el$260 = _el$258.firstChild.nextSibling, [_el$261, _co$31] = getNextMarker(_el$260.nextSibling), _el$262 = _el$258.nextSibling, _el$284 = _el$257.nextSibling, [_el$285, _co$36] = getNextMarker(_el$284.nextSibling), _el$277 = _el$285.nextSibling.firstChild, _el$279 = _el$277.firstChild.nextSibling, [_el$280, _co$34] = getNextMarker(_el$279.nextSibling), _el$281 = _el$280.nextSibling, [_el$282, _co$35] = getNextMarker(_el$281.nextSibling), _el$283 = _el$277.nextSibling;
		insert(_el$222, createComponent(UndoIcon, {
			"class": "h-4 w-4 cursor-pointer",
			get classList() {
				return { hidden: $config.ankiConnectAddress === defaultConfig.ankiConnectAddress };
			},
			"on:click": () => {
				$setConfig("ankiConnectAddress", defaultConfig.ankiConnectAddress);
			}
		}), _el$225, _co$25);
		addEventListener(_el$226, "input", (e) => {
			const value = e.target.value;
			$setConfig("ankiConnectAddress", value);
		});
		addEventListener(_el$230, "change", (e) => {
			$setConfig("showStartupTime", e.target.checked);
		});
		insert(_el$232, createComponent(ClipboardCopyIcon, {
			"class": "size-4 text-base-content-calm cursor-pointer",
			classList: { hidden: typeof pycmd !== "undefined" },
			"on:click": () => {
				copyToClipboard(toDatasetString(rootDataset()));
			}
		}), _el$235, _co$26);
		insert(_el$236, () => toDatasetString(rootDataset()), _el$240, _co$27);
		insert(_el$242, createComponent(ClipboardCopyIcon, {
			"class": "size-4 text-base-content-calm cursor-pointer",
			classList: { hidden: typeof pycmd !== "undefined" },
			"on:click": () => {
				copyToClipboard(toCssVarString(cssVar()));
			}
		}), _el$245, _co$28);
		insert(_el$246, () => toCssVarString(cssVar()), _el$250, _co$29);
		insert(_el$252, createComponent(ClipboardCopyIcon, {
			"class": "size-4 text-base-content-calm cursor-pointer",
			classList: { hidden: typeof pycmd !== "undefined" },
			"on:click": () => {
				copyToClipboard(JSON.stringify({ ...$config }, null, 2));
			}
		}), _el$255, _co$30);
		insert(_el$256, () => JSON.stringify({ ...$config }, null, 2));
		insert(_el$258, createComponent(ClipboardCopyIcon, {
			"class": "size-4 text-base-content-calm cursor-pointer",
			classList: { hidden: typeof pycmd !== "undefined" },
			"on:click": () => {
				copyToClipboard(JSON.stringify({ ...ankiFields }, null, 2));
			}
		}), _el$261, _co$31);
		insert(_el$262, () => JSON.stringify({ ...ankiFields }, null, 2));
		insert(_el$219, createComponent(Show, {
			get when() {
				return kikuFiles();
			},
			get children() {
				var _el$263 = getNextElement(_tmpl$15), _el$264 = _el$263.firstChild, _el$266 = _el$264.firstChild.nextSibling, [_el$267, _co$32] = getNextMarker(_el$266.nextSibling), _el$274 = _el$264.nextSibling, [_el$275, _co$33] = getNextMarker(_el$274.nextSibling), _el$273 = _el$275.nextSibling;
				insert(_el$264, createComponent(ClipboardCopyIcon, {
					"class": "size-4 text-base-content-calm cursor-pointer",
					classList: { hidden: typeof pycmd !== "undefined" },
					"on:click": () => {
						copyToClipboard(kikuFiles() ?? "");
					}
				}), _el$267, _co$32);
				insert(_el$263, createComponent(Show, {
					get when() {
						return missingFiles();
					},
					get children() {
						var _el$268 = getNextElement(_tmpl$14), _el$272 = _el$268.firstChild.firstChild.nextSibling.nextSibling;
						insert(_el$272, missingFiles);
						return _el$268;
					}
				}), _el$275, _co$33);
				insert(_el$273, kikuFiles);
				return _el$263;
			}
		}), _el$285, _co$36);
		insert(_el$277, createComponent(ClipboardCopyIcon, {
			"class": "size-4 text-base-content-calm cursor-pointer",
			classList: { hidden: typeof pycmd !== "undefined" },
			"on:click": () => {
				copyToClipboard(logs() ?? "");
			}
		}), _el$280, _co$34);
		insert(_el$277, createComponent(RefreshCwIcon, {
			"class": "size-4 text-base-content-calm cursor-pointer",
			"on:click": () => {
				setLogs(KIKU_STATE.logger.get());
			}
		}), _el$282, _co$35);
		insert(_el$283, logs);
		createRenderEffect(() => setAttribute(_el$226, "placeholder", defaultConfig.ankiConnectAddress));
		createRenderEffect(() => setProperty(_el$226, "value", $config.ankiConnectAddress));
		createRenderEffect(() => setProperty(_el$230, "checked", $config.showStartupTime));
		return _el$215;
	})();
}

//#endregion
//#region src/components/_kiku_lazy/UseAnkiDroid.tsx
var _tmpl$ = /* @__PURE__ */ template(`<div class="fixed top-1/2 -translate-y-1/2 flex justify-center items-center rounded-full transition-transform z-10">`);
function reverseEase(ease) {
	return ease === "ease1" ? "ease3" : "ease1";
}
function easeOutQuad(x) {
	return 1 - (1 - x) * (1 - x);
}
function snapTo4(n) {
	return n >> 2 << 2;
}
function UseAnkiDroid() {
	if (false) return;
	if (window.innerWidth > 768) return;
	if (typeof AnkiDroidJS === "undefined" && true) return;
	const [$config] = useConfigContext();
	if (!$config.ankiDroidEnableIntegration) return;
	KIKU_STATE.logger.info("Using AnkiDroid");
	const ankiDroidAPI = typeof AnkiDroidJS === "undefined" ? void 0 : new AnkiDroidJS({
		version: "0.0.3",
		developer: "youyoumu"
	});
	KIKU_STATE.ankiDroidAPI = ankiDroidAPI;
	let rightIconRef;
	let leftIconRef;
	const [$card] = useCardContext();
	const [$general] = useGeneralContext();
	const el$ = () => document.documentElement;
	const reverse = $config.ankiDroidReverseSwipeDirection;
	const THRESHOLD = 60;
	const DEADZONE = 10;
	const SCROLL_TOLERANCE = 15;
	let startX = 0;
	let startY = 0;
	let deltaX = 0;
	let isScrolling = false;
	let isSwiping = false;
	let isTouching = false;
	const [rightIconOffset, setRightIconOffset] = createSignal(0);
	const [leftIconOffset, setLeftIconOffset] = createSignal(0);
	const [progress, setProgress] = createSignal(0);
	function handleTouchStart(e) {
		if (el$() === void 0) return;
		const t = e.touches[0];
		startX = t.clientX;
		startY = t.clientY;
		deltaX = 0;
		isScrolling = false;
		isSwiping = false;
		isTouching = true;
	}
	function handleTouchMove(e) {
		if (!el$() || isScrolling) return;
		const t = e.touches[0];
		const diffX = t.clientX - startX;
		const diffY = t.clientY - startY;
		if (Math.abs(diffY) > DEADZONE || Math.abs(diffX) > DEADZONE) isSwiping = true;
		if ($card.side === "front") return;
		if (Math.abs(diffY) > SCROLL_TOLERANCE && Math.abs(diffY) > Math.abs(diffX)) {
			isScrolling = true;
			setRightIconOffset(0);
			setLeftIconOffset(0);
			return;
		}
		const abs = Math.abs(diffX);
		if (abs > DEADZONE) {
			deltaX = diffX;
			const direction = diffX > 0 ? 1 : -1;
			const progress$1 = Math.min(abs / THRESHOLD, 1);
			setProgress(progress$1);
			const offset = easeOutQuad(Math.min(abs / THRESHOLD / 2, 1)) * Math.min(abs, THRESHOLD);
			if (direction > 0) requestAnimationFrame(() => {
				if (isScrolling || !isTouching) return;
				setLeftIconOffset(snapTo4(Math.abs(offset)));
				setRightIconOffset(0);
			});
			else requestAnimationFrame(() => {
				if (isScrolling || !isTouching) return;
				setRightIconOffset(snapTo4(Math.abs(offset)));
				setLeftIconOffset(0);
			});
		}
	}
	function handleTouchEnd() {
		isTouching = false;
		if ($card.side === "front") {
			if (isSwiping) return;
			ankiDroidAPI?.ankiShowAnswer();
		} else if ($card.side === "back") {
			setRightIconOffset(0);
			setLeftIconOffset(0);
			if (isScrolling) return;
			if (Math.abs(deltaX) >= THRESHOLD) {
				let ease = deltaX > 0 ? "ease3" : "ease1";
				if (reverse) ease = reverseEase(ease);
				console.log(ease);
				if (ease === "ease1") ankiDroidAPI?.ankiAnswerEase1();
				else if (ease === "ease3") ankiDroidAPI?.ankiAnswerEase3();
			}
		}
	}
	createEffect(() => {
		const el = el$();
		if (el === void 0) return;
		if ($card.page !== "main" || $card.nested) return;
		el.addEventListener("touchstart", handleTouchStart, { passive: true });
		el.addEventListener("touchmove", handleTouchMove, { passive: false });
		el.addEventListener("touchend", handleTouchEnd, { passive: true });
		onCleanup(() => {
			const el$1 = el$();
			if (el$1 === void 0) return;
			el$1.removeEventListener("touchstart", handleTouchStart);
			el$1.removeEventListener("touchmove", handleTouchMove);
			el$1.removeEventListener("touchend", handleTouchEnd);
		});
	});
	if ($card.side === "front") return null;
	return createComponent(Portal, {
		get mount() {
			return $general.layoutRef;
		},
		get children() {
			return [createComponent(Icon, {
				ref(r$) {
					var _ref$ = leftIconRef;
					typeof _ref$ === "function" ? _ref$(r$) : leftIconRef = r$;
				},
				side: "left",
				color: reverse ? "error" : "success",
				get offset() {
					return leftIconOffset();
				},
				get progress() {
					return progress();
				}
			}), createComponent(Icon, {
				ref(r$) {
					var _ref$2 = rightIconRef;
					typeof _ref$2 === "function" ? _ref$2(r$) : rightIconRef = r$;
				},
				side: "right",
				color: reverse ? "success" : "error",
				get offset() {
					return rightIconOffset();
				},
				get progress() {
					return progress();
				}
			})];
		}
	});
}
function Icon(props) {
	const direction = () => props.side === "right" ? 1 : -1;
	const offset = () => props.offset;
	return (() => {
		var _el$ = getNextElement(_tmpl$);
		insert(_el$, createComponent(Switch, { get children() {
			return [createComponent(Match, {
				get when() {
					return props.color === "error";
				},
				get children() {
					return createComponent(XIcon, {
						ref(r$) {
							var _ref$3 = props.ref;
							typeof _ref$3 === "function" ? _ref$3(r$) : props.ref = r$;
						},
						"class": "size-12 rounded-full p-2 shadow-lg transition-colors",
						get classList() {
							return {
								"bg-base-100 text-base-content-primary": props.progress !== 1,
								"bg-error text-error-content": props.progress === 1
							};
						}
					});
				}
			}), createComponent(Match, {
				get when() {
					return props.color === "success";
				},
				get children() {
					return createComponent(CheckIcon, {
						ref(r$) {
							var _ref$4 = props.ref;
							typeof _ref$4 === "function" ? _ref$4(r$) : props.ref = r$;
						},
						"class": "size-12 rounded-full p-2 shadow-lg transition-colors",
						get classList() {
							return {
								"bg-base-100 text-base-content-primary": props.progress !== 1,
								"bg-success text-success-content": props.progress === 1
							};
						}
					});
				}
			})];
		} }));
		createRenderEffect((_p$) => {
			var _v$ = !!(props.color === "error"), _v$2 = !!(props.color === "success"), _v$3 = props.side === "left" ? "0" : void 0, _v$4 = props.side === "right" ? "0" : void 0, _v$5 = offset() > 0 ? `${48 + 24 * props.progress}px` : void 0, _v$6 = offset() > 0 ? `${48 + 24 * props.progress}px` : void 0, _v$7 = `translateX(${(60 - offset()) * direction()}px)`, _v$8 = `${props.progress - .2}`;
			_v$ !== _p$.e && _el$.classList.toggle("bg-error/30", _p$.e = _v$);
			_v$2 !== _p$.t && _el$.classList.toggle("bg-success/30", _p$.t = _v$2);
			_v$3 !== _p$.a && setStyleProperty(_el$, "left", _p$.a = _v$3);
			_v$4 !== _p$.o && setStyleProperty(_el$, "right", _p$.o = _v$4);
			_v$5 !== _p$.i && setStyleProperty(_el$, "height", _p$.i = _v$5);
			_v$6 !== _p$.n && setStyleProperty(_el$, "width", _p$.n = _v$6);
			_v$7 !== _p$.s && setStyleProperty(_el$, "transform", _p$.s = _v$7);
			_v$8 !== _p$.h && setStyleProperty(_el$, "opacity", _p$.h = _v$8);
			return _p$;
		}, {
			e: void 0,
			t: void 0,
			a: void 0,
			o: void 0,
			i: void 0,
			n: void 0,
			s: void 0,
			h: void 0
		});
		return _el$;
	})();
}

//#endregion
export { AudioButtons, BackBody, BackFooter, Expression, HeaderMain, KanjiPage, PictureModal, PicturePagination, Pitches, Sentence, Settings, UseAnkiDroid };
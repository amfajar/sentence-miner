//#region ../../node_modules/.pnpm/solid-js@1.9.10/node_modules/solid-js/dist/solid.js
var sharedConfig = {
	context: void 0,
	registry: void 0,
	effects: void 0,
	done: false,
	getContextId() {
		return getContextId(this.context.count);
	},
	getNextContextId() {
		return getContextId(this.context.count++);
	}
};
function getContextId(count) {
	const num = String(count), len = num.length - 1;
	return sharedConfig.context.id + (len ? String.fromCharCode(96 + len) : "") + num;
}
function setHydrateContext(context) {
	sharedConfig.context = context;
}
function nextHydrateContext() {
	return {
		...sharedConfig.context,
		id: sharedConfig.getNextContextId(),
		count: 0
	};
}
var equalFn = (a, b) => a === b;
var $PROXY = Symbol("solid-proxy");
var SUPPORTS_PROXY = typeof Proxy === "function";
var $TRACK = Symbol("solid-track");
var $DEVCOMP = Symbol("solid-dev-component");
var signalOptions = { equals: equalFn };
var ERROR = null;
var runEffects = runQueue;
var STALE = 1;
var PENDING = 2;
var UNOWNED = {
	owned: null,
	cleanups: null,
	context: null,
	owner: null
};
var NO_INIT = {};
var Owner = null;
var Transition = null;
var Scheduler = null;
var ExternalSourceConfig = null;
var Listener = null;
var Updates = null;
var Effects = null;
var ExecCount = 0;
function createRoot(fn, detachedOwner) {
	const listener = Listener, owner = Owner, unowned = fn.length === 0, current = detachedOwner === void 0 ? owner : detachedOwner, root = unowned ? UNOWNED : {
		owned: null,
		cleanups: null,
		context: current ? current.context : null,
		owner: current
	}, updateFn = unowned ? fn : () => fn(() => untrack(() => cleanNode(root)));
	Owner = root;
	Listener = null;
	try {
		return runUpdates(updateFn, true);
	} finally {
		Listener = listener;
		Owner = owner;
	}
}
function createSignal(value, options) {
	options = options ? Object.assign({}, signalOptions, options) : signalOptions;
	const s = {
		value,
		observers: null,
		observerSlots: null,
		comparator: options.equals || void 0
	};
	const setter = (value$1) => {
		if (typeof value$1 === "function") if (Transition && Transition.running && Transition.sources.has(s)) value$1 = value$1(s.tValue);
		else value$1 = value$1(s.value);
		return writeSignal(s, value$1);
	};
	return [readSignal.bind(s), setter];
}
function createComputed(fn, value, options) {
	const c = createComputation(fn, value, true, STALE);
	if (Scheduler && Transition && Transition.running) Updates.push(c);
	else updateComputation(c);
}
function createRenderEffect(fn, value, options) {
	const c = createComputation(fn, value, false, STALE);
	if (Scheduler && Transition && Transition.running) Updates.push(c);
	else updateComputation(c);
}
function createEffect(fn, value, options) {
	runEffects = runUserEffects;
	const c = createComputation(fn, value, false, STALE), s = SuspenseContext && useContext(SuspenseContext);
	if (s) c.suspense = s;
	if (!options || !options.render) c.user = true;
	Effects ? Effects.push(c) : updateComputation(c);
}
function createMemo(fn, value, options) {
	options = options ? Object.assign({}, signalOptions, options) : signalOptions;
	const c = createComputation(fn, value, true, 0);
	c.observers = null;
	c.observerSlots = null;
	c.comparator = options.equals || void 0;
	if (Scheduler && Transition && Transition.running) {
		c.tState = STALE;
		Updates.push(c);
	} else updateComputation(c);
	return readSignal.bind(c);
}
function isPromise(v) {
	return v && typeof v === "object" && "then" in v;
}
function createResource(pSource, pFetcher, pOptions) {
	let source;
	let fetcher;
	let options;
	if (typeof pFetcher === "function") {
		source = pSource;
		fetcher = pFetcher;
		options = pOptions || {};
	} else {
		source = true;
		fetcher = pSource;
		options = pFetcher || {};
	}
	let pr = null, initP = NO_INIT, id = null, loadedUnderTransition = false, scheduled = false, resolved = "initialValue" in options, dynamic = typeof source === "function" && createMemo(source);
	const contexts = /* @__PURE__ */ new Set(), [value, setValue] = (options.storage || createSignal)(options.initialValue), [error, setError] = createSignal(void 0), [track, trigger] = createSignal(void 0, { equals: false }), [state, setState] = createSignal(resolved ? "ready" : "unresolved");
	if (sharedConfig.context) {
		id = sharedConfig.getNextContextId();
		if (options.ssrLoadFrom === "initial") initP = options.initialValue;
		else if (sharedConfig.load && sharedConfig.has(id)) initP = sharedConfig.load(id);
	}
	function loadEnd(p, v, error$1, key) {
		if (pr === p) {
			pr = null;
			key !== void 0 && (resolved = true);
			if ((p === initP || v === initP) && options.onHydrated) queueMicrotask(() => options.onHydrated(key, { value: v }));
			initP = NO_INIT;
			if (Transition && p && loadedUnderTransition) {
				Transition.promises.delete(p);
				loadedUnderTransition = false;
				runUpdates(() => {
					Transition.running = true;
					completeLoad(v, error$1);
				}, false);
			} else completeLoad(v, error$1);
		}
		return v;
	}
	function completeLoad(v, err) {
		runUpdates(() => {
			if (err === void 0) setValue(() => v);
			setState(err !== void 0 ? "errored" : resolved ? "ready" : "unresolved");
			setError(err);
			for (const c of contexts.keys()) c.decrement();
			contexts.clear();
		}, false);
	}
	function read() {
		const c = SuspenseContext && useContext(SuspenseContext), v = value(), err = error();
		if (err !== void 0 && !pr) throw err;
		if (Listener && !Listener.user && c) createComputed(() => {
			track();
			if (pr) {
				if (c.resolved && Transition && loadedUnderTransition) Transition.promises.add(pr);
				else if (!contexts.has(c)) {
					c.increment();
					contexts.add(c);
				}
			}
		});
		return v;
	}
	function load(refetching = true) {
		if (refetching !== false && scheduled) return;
		scheduled = false;
		const lookup = dynamic ? dynamic() : source;
		loadedUnderTransition = Transition && Transition.running;
		if (lookup == null || lookup === false) {
			loadEnd(pr, untrack(value));
			return;
		}
		if (Transition && pr) Transition.promises.delete(pr);
		let error$1;
		const p = initP !== NO_INIT ? initP : untrack(() => {
			try {
				return fetcher(lookup, {
					value: value(),
					refetching
				});
			} catch (fetcherError) {
				error$1 = fetcherError;
			}
		});
		if (error$1 !== void 0) {
			loadEnd(pr, void 0, castError(error$1), lookup);
			return;
		} else if (!isPromise(p)) {
			loadEnd(pr, p, void 0, lookup);
			return p;
		}
		pr = p;
		if ("v" in p) {
			if (p.s === 1) loadEnd(pr, p.v, void 0, lookup);
			else loadEnd(pr, void 0, castError(p.v), lookup);
			return p;
		}
		scheduled = true;
		queueMicrotask(() => scheduled = false);
		runUpdates(() => {
			setState(resolved ? "refreshing" : "pending");
			trigger();
		}, false);
		return p.then((v) => loadEnd(p, v, void 0, lookup), (e) => loadEnd(p, void 0, castError(e), lookup));
	}
	Object.defineProperties(read, {
		state: { get: () => state() },
		error: { get: () => error() },
		loading: { get() {
			const s = state();
			return s === "pending" || s === "refreshing";
		} },
		latest: { get() {
			if (!resolved) return read();
			const err = error();
			if (err && !pr) throw err;
			return value();
		} }
	});
	let owner = Owner;
	if (dynamic) createComputed(() => (owner = Owner, load(false)));
	else load(false);
	return [read, {
		refetch: (info) => runWithOwner(owner, () => load(info)),
		mutate: setValue
	}];
}
function batch(fn) {
	return runUpdates(fn, false);
}
function untrack(fn) {
	if (!ExternalSourceConfig && Listener === null) return fn();
	const listener = Listener;
	Listener = null;
	try {
		if (ExternalSourceConfig) return ExternalSourceConfig.untrack(fn);
		return fn();
	} finally {
		Listener = listener;
	}
}
function onMount(fn) {
	createEffect(() => untrack(fn));
}
function onCleanup(fn) {
	if (Owner === null);
	else if (Owner.cleanups === null) Owner.cleanups = [fn];
	else Owner.cleanups.push(fn);
	return fn;
}
function catchError(fn, handler) {
	ERROR || (ERROR = Symbol("error"));
	Owner = createComputation(void 0, void 0, true);
	Owner.context = {
		...Owner.context,
		[ERROR]: [handler]
	};
	if (Transition && Transition.running) Transition.sources.add(Owner);
	try {
		return fn();
	} catch (err) {
		handleError(err);
	} finally {
		Owner = Owner.owner;
	}
}
function getListener() {
	return Listener;
}
function getOwner() {
	return Owner;
}
function runWithOwner(o, fn) {
	const prev = Owner;
	const prevListener = Listener;
	Owner = o;
	Listener = null;
	try {
		return runUpdates(fn, true);
	} catch (err) {
		handleError(err);
	} finally {
		Owner = prev;
		Listener = prevListener;
	}
}
function startTransition(fn) {
	if (Transition && Transition.running) {
		fn();
		return Transition.done;
	}
	const l = Listener;
	const o = Owner;
	return Promise.resolve().then(() => {
		Listener = l;
		Owner = o;
		let t;
		if (Scheduler || SuspenseContext) {
			t = Transition || (Transition = {
				sources: /* @__PURE__ */ new Set(),
				effects: [],
				promises: /* @__PURE__ */ new Set(),
				disposed: /* @__PURE__ */ new Set(),
				queue: /* @__PURE__ */ new Set(),
				running: true
			});
			t.done || (t.done = new Promise((res) => t.resolve = res));
			t.running = true;
		}
		runUpdates(fn, false);
		Listener = Owner = null;
		return t ? t.done : void 0;
	});
}
var [transPending, setTransPending] = /* @__PURE__ */ createSignal(false);
function resumeEffects(e) {
	Effects.push.apply(Effects, e);
	e.length = 0;
}
function createContext(defaultValue, options) {
	const id = Symbol("context");
	return {
		id,
		Provider: createProvider(id),
		defaultValue
	};
}
function useContext(context) {
	let value;
	return Owner && Owner.context && (value = Owner.context[context.id]) !== void 0 ? value : context.defaultValue;
}
function children(fn) {
	const children$1 = createMemo(fn);
	const memo$1 = createMemo(() => resolveChildren(children$1()));
	memo$1.toArray = () => {
		const c = memo$1();
		return Array.isArray(c) ? c : c != null ? [c] : [];
	};
	return memo$1;
}
var SuspenseContext;
function getSuspenseContext() {
	return SuspenseContext || (SuspenseContext = createContext());
}
function readSignal() {
	const runningTransition = Transition && Transition.running;
	if (this.sources && (runningTransition ? this.tState : this.state)) if ((runningTransition ? this.tState : this.state) === STALE) updateComputation(this);
	else {
		const updates = Updates;
		Updates = null;
		runUpdates(() => lookUpstream(this), false);
		Updates = updates;
	}
	if (Listener) {
		const sSlot = this.observers ? this.observers.length : 0;
		if (!Listener.sources) {
			Listener.sources = [this];
			Listener.sourceSlots = [sSlot];
		} else {
			Listener.sources.push(this);
			Listener.sourceSlots.push(sSlot);
		}
		if (!this.observers) {
			this.observers = [Listener];
			this.observerSlots = [Listener.sources.length - 1];
		} else {
			this.observers.push(Listener);
			this.observerSlots.push(Listener.sources.length - 1);
		}
	}
	if (runningTransition && Transition.sources.has(this)) return this.tValue;
	return this.value;
}
function writeSignal(node, value, isComp) {
	let current = Transition && Transition.running && Transition.sources.has(node) ? node.tValue : node.value;
	if (!node.comparator || !node.comparator(current, value)) {
		if (Transition) {
			const TransitionRunning = Transition.running;
			if (TransitionRunning || !isComp && Transition.sources.has(node)) {
				Transition.sources.add(node);
				node.tValue = value;
			}
			if (!TransitionRunning) node.value = value;
		} else node.value = value;
		if (node.observers && node.observers.length) runUpdates(() => {
			for (let i = 0; i < node.observers.length; i += 1) {
				const o = node.observers[i];
				const TransitionRunning = Transition && Transition.running;
				if (TransitionRunning && Transition.disposed.has(o)) continue;
				if (TransitionRunning ? !o.tState : !o.state) {
					if (o.pure) Updates.push(o);
					else Effects.push(o);
					if (o.observers) markDownstream(o);
				}
				if (!TransitionRunning) o.state = STALE;
				else o.tState = STALE;
			}
			if (Updates.length > 1e6) {
				Updates = [];
				throw new Error();
			}
		}, false);
	}
	return value;
}
function updateComputation(node) {
	if (!node.fn) return;
	cleanNode(node);
	const time = ExecCount;
	runComputation(node, Transition && Transition.running && Transition.sources.has(node) ? node.tValue : node.value, time);
	if (Transition && !Transition.running && Transition.sources.has(node)) queueMicrotask(() => {
		runUpdates(() => {
			Transition && (Transition.running = true);
			Listener = Owner = node;
			runComputation(node, node.tValue, time);
			Listener = Owner = null;
		}, false);
	});
}
function runComputation(node, value, time) {
	let nextValue;
	const owner = Owner, listener = Listener;
	Listener = Owner = node;
	try {
		nextValue = node.fn(value);
	} catch (err) {
		if (node.pure) if (Transition && Transition.running) {
			node.tState = STALE;
			node.tOwned && node.tOwned.forEach(cleanNode);
			node.tOwned = void 0;
		} else {
			node.state = STALE;
			node.owned && node.owned.forEach(cleanNode);
			node.owned = null;
		}
		node.updatedAt = time + 1;
		return handleError(err);
	} finally {
		Listener = listener;
		Owner = owner;
	}
	if (!node.updatedAt || node.updatedAt <= time) {
		if (node.updatedAt != null && "observers" in node) writeSignal(node, nextValue, true);
		else if (Transition && Transition.running && node.pure) {
			Transition.sources.add(node);
			node.tValue = nextValue;
		} else node.value = nextValue;
		node.updatedAt = time;
	}
}
function createComputation(fn, init, pure, state = STALE, options) {
	const c = {
		fn,
		state,
		updatedAt: null,
		owned: null,
		sources: null,
		sourceSlots: null,
		cleanups: null,
		value: init,
		owner: Owner,
		context: Owner ? Owner.context : null,
		pure
	};
	if (Transition && Transition.running) {
		c.state = 0;
		c.tState = state;
	}
	if (Owner === null);
	else if (Owner !== UNOWNED) if (Transition && Transition.running && Owner.pure) if (!Owner.tOwned) Owner.tOwned = [c];
	else Owner.tOwned.push(c);
	else if (!Owner.owned) Owner.owned = [c];
	else Owner.owned.push(c);
	if (ExternalSourceConfig && c.fn) {
		const [track, trigger] = createSignal(void 0, { equals: false });
		const ordinary = ExternalSourceConfig.factory(c.fn, trigger);
		onCleanup(() => ordinary.dispose());
		const triggerInTransition = () => startTransition(trigger).then(() => inTransition.dispose());
		const inTransition = ExternalSourceConfig.factory(c.fn, triggerInTransition);
		c.fn = (x) => {
			track();
			return Transition && Transition.running ? inTransition.track(x) : ordinary.track(x);
		};
	}
	return c;
}
function runTop(node) {
	const runningTransition = Transition && Transition.running;
	if ((runningTransition ? node.tState : node.state) === 0) return;
	if ((runningTransition ? node.tState : node.state) === PENDING) return lookUpstream(node);
	if (node.suspense && untrack(node.suspense.inFallback)) return node.suspense.effects.push(node);
	const ancestors = [node];
	while ((node = node.owner) && (!node.updatedAt || node.updatedAt < ExecCount)) {
		if (runningTransition && Transition.disposed.has(node)) return;
		if (runningTransition ? node.tState : node.state) ancestors.push(node);
	}
	for (let i = ancestors.length - 1; i >= 0; i--) {
		node = ancestors[i];
		if (runningTransition) {
			let top = node, prev = ancestors[i + 1];
			while ((top = top.owner) && top !== prev) if (Transition.disposed.has(top)) return;
		}
		if ((runningTransition ? node.tState : node.state) === STALE) updateComputation(node);
		else if ((runningTransition ? node.tState : node.state) === PENDING) {
			const updates = Updates;
			Updates = null;
			runUpdates(() => lookUpstream(node, ancestors[0]), false);
			Updates = updates;
		}
	}
}
function runUpdates(fn, init) {
	if (Updates) return fn();
	let wait = false;
	if (!init) Updates = [];
	if (Effects) wait = true;
	else Effects = [];
	ExecCount++;
	try {
		const res = fn();
		completeUpdates(wait);
		return res;
	} catch (err) {
		if (!wait) Effects = null;
		Updates = null;
		handleError(err);
	}
}
function completeUpdates(wait) {
	if (Updates) {
		if (Scheduler && Transition && Transition.running) scheduleQueue(Updates);
		else runQueue(Updates);
		Updates = null;
	}
	if (wait) return;
	let res;
	if (Transition) {
		if (!Transition.promises.size && !Transition.queue.size) {
			const sources = Transition.sources;
			const disposed = Transition.disposed;
			Effects.push.apply(Effects, Transition.effects);
			res = Transition.resolve;
			for (const e$1 of Effects) {
				"tState" in e$1 && (e$1.state = e$1.tState);
				delete e$1.tState;
			}
			Transition = null;
			runUpdates(() => {
				for (const d of disposed) cleanNode(d);
				for (const v of sources) {
					v.value = v.tValue;
					if (v.owned) for (let i = 0, len = v.owned.length; i < len; i++) cleanNode(v.owned[i]);
					if (v.tOwned) v.owned = v.tOwned;
					delete v.tValue;
					delete v.tOwned;
					v.tState = 0;
				}
				setTransPending(false);
			}, false);
		} else if (Transition.running) {
			Transition.running = false;
			Transition.effects.push.apply(Transition.effects, Effects);
			Effects = null;
			setTransPending(true);
			return;
		}
	}
	const e = Effects;
	Effects = null;
	if (e.length) runUpdates(() => runEffects(e), false);
	if (res) res();
}
function runQueue(queue) {
	for (let i = 0; i < queue.length; i++) runTop(queue[i]);
}
function scheduleQueue(queue) {
	for (let i = 0; i < queue.length; i++) {
		const item = queue[i];
		const tasks = Transition.queue;
		if (!tasks.has(item)) {
			tasks.add(item);
			Scheduler(() => {
				tasks.delete(item);
				runUpdates(() => {
					Transition.running = true;
					runTop(item);
				}, false);
				Transition && (Transition.running = false);
			});
		}
	}
}
function runUserEffects(queue) {
	let i, userLength = 0;
	for (i = 0; i < queue.length; i++) {
		const e = queue[i];
		if (!e.user) runTop(e);
		else queue[userLength++] = e;
	}
	if (sharedConfig.context) {
		if (sharedConfig.count) {
			sharedConfig.effects || (sharedConfig.effects = []);
			sharedConfig.effects.push(...queue.slice(0, userLength));
			return;
		}
		setHydrateContext();
	}
	if (sharedConfig.effects && (sharedConfig.done || !sharedConfig.count)) {
		queue = [...sharedConfig.effects, ...queue];
		userLength += sharedConfig.effects.length;
		delete sharedConfig.effects;
	}
	for (i = 0; i < userLength; i++) runTop(queue[i]);
}
function lookUpstream(node, ignore) {
	const runningTransition = Transition && Transition.running;
	if (runningTransition) node.tState = 0;
	else node.state = 0;
	for (let i = 0; i < node.sources.length; i += 1) {
		const source = node.sources[i];
		if (source.sources) {
			const state = runningTransition ? source.tState : source.state;
			if (state === STALE) {
				if (source !== ignore && (!source.updatedAt || source.updatedAt < ExecCount)) runTop(source);
			} else if (state === PENDING) lookUpstream(source, ignore);
		}
	}
}
function markDownstream(node) {
	const runningTransition = Transition && Transition.running;
	for (let i = 0; i < node.observers.length; i += 1) {
		const o = node.observers[i];
		if (runningTransition ? !o.tState : !o.state) {
			if (runningTransition) o.tState = PENDING;
			else o.state = PENDING;
			if (o.pure) Updates.push(o);
			else Effects.push(o);
			o.observers && markDownstream(o);
		}
	}
}
function cleanNode(node) {
	let i;
	if (node.sources) while (node.sources.length) {
		const source = node.sources.pop(), index = node.sourceSlots.pop(), obs = source.observers;
		if (obs && obs.length) {
			const n = obs.pop(), s = source.observerSlots.pop();
			if (index < obs.length) {
				n.sourceSlots[s] = index;
				obs[index] = n;
				source.observerSlots[index] = s;
			}
		}
	}
	if (node.tOwned) {
		for (i = node.tOwned.length - 1; i >= 0; i--) cleanNode(node.tOwned[i]);
		delete node.tOwned;
	}
	if (Transition && Transition.running && node.pure) reset(node, true);
	else if (node.owned) {
		for (i = node.owned.length - 1; i >= 0; i--) cleanNode(node.owned[i]);
		node.owned = null;
	}
	if (node.cleanups) {
		for (i = node.cleanups.length - 1; i >= 0; i--) node.cleanups[i]();
		node.cleanups = null;
	}
	if (Transition && Transition.running) node.tState = 0;
	else node.state = 0;
}
function reset(node, top) {
	if (!top) {
		node.tState = 0;
		Transition.disposed.add(node);
	}
	if (node.owned) for (let i = 0; i < node.owned.length; i++) reset(node.owned[i]);
}
function castError(err) {
	if (err instanceof Error) return err;
	return new Error(typeof err === "string" ? err : "Unknown error", { cause: err });
}
function runErrors(err, fns, owner) {
	try {
		for (const f of fns) f(err);
	} catch (e) {
		handleError(e, owner && owner.owner || null);
	}
}
function handleError(err, owner = Owner) {
	const fns = ERROR && owner && owner.context && owner.context[ERROR];
	const error = castError(err);
	if (!fns) throw error;
	if (Effects) Effects.push({
		fn() {
			runErrors(error, fns, owner);
		},
		state: STALE
	});
	else runErrors(error, fns, owner);
}
function resolveChildren(children$1) {
	if (typeof children$1 === "function" && !children$1.length) return resolveChildren(children$1());
	if (Array.isArray(children$1)) {
		const results = [];
		for (let i = 0; i < children$1.length; i++) {
			const result = resolveChildren(children$1[i]);
			Array.isArray(result) ? results.push.apply(results, result) : results.push(result);
		}
		return results;
	}
	return children$1;
}
function createProvider(id, options) {
	return function provider(props) {
		let res;
		createRenderEffect(() => res = untrack(() => {
			Owner.context = {
				...Owner.context,
				[id]: props.value
			};
			return children(() => props.children);
		}), void 0);
		return res;
	};
}
var FALLBACK = Symbol("fallback");
function dispose(d) {
	for (let i = 0; i < d.length; i++) d[i]();
}
function mapArray(list, mapFn, options = {}) {
	let items = [], mapped = [], disposers = [], len = 0, indexes = mapFn.length > 1 ? [] : null;
	onCleanup(() => dispose(disposers));
	return () => {
		let newItems = list() || [], newLen = newItems.length, i, j;
		newItems[$TRACK];
		return untrack(() => {
			let newIndices, newIndicesNext, temp, tempdisposers, tempIndexes, start, end, newEnd, item;
			if (newLen === 0) {
				if (len !== 0) {
					dispose(disposers);
					disposers = [];
					items = [];
					mapped = [];
					len = 0;
					indexes && (indexes = []);
				}
				if (options.fallback) {
					items = [FALLBACK];
					mapped[0] = createRoot((disposer) => {
						disposers[0] = disposer;
						return options.fallback();
					});
					len = 1;
				}
			} else if (len === 0) {
				mapped = new Array(newLen);
				for (j = 0; j < newLen; j++) {
					items[j] = newItems[j];
					mapped[j] = createRoot(mapper);
				}
				len = newLen;
			} else {
				temp = new Array(newLen);
				tempdisposers = new Array(newLen);
				indexes && (tempIndexes = new Array(newLen));
				for (start = 0, end = Math.min(len, newLen); start < end && items[start] === newItems[start]; start++);
				for (end = len - 1, newEnd = newLen - 1; end >= start && newEnd >= start && items[end] === newItems[newEnd]; end--, newEnd--) {
					temp[newEnd] = mapped[end];
					tempdisposers[newEnd] = disposers[end];
					indexes && (tempIndexes[newEnd] = indexes[end]);
				}
				newIndices = /* @__PURE__ */ new Map();
				newIndicesNext = new Array(newEnd + 1);
				for (j = newEnd; j >= start; j--) {
					item = newItems[j];
					i = newIndices.get(item);
					newIndicesNext[j] = i === void 0 ? -1 : i;
					newIndices.set(item, j);
				}
				for (i = start; i <= end; i++) {
					item = items[i];
					j = newIndices.get(item);
					if (j !== void 0 && j !== -1) {
						temp[j] = mapped[i];
						tempdisposers[j] = disposers[i];
						indexes && (tempIndexes[j] = indexes[i]);
						j = newIndicesNext[j];
						newIndices.set(item, j);
					} else disposers[i]();
				}
				for (j = start; j < newLen; j++) if (j in temp) {
					mapped[j] = temp[j];
					disposers[j] = tempdisposers[j];
					if (indexes) {
						indexes[j] = tempIndexes[j];
						indexes[j](j);
					}
				} else mapped[j] = createRoot(mapper);
				mapped = mapped.slice(0, len = newLen);
				items = newItems.slice(0);
			}
			return mapped;
		});
		function mapper(disposer) {
			disposers[j] = disposer;
			if (indexes) {
				const [s, set] = createSignal(j);
				indexes[j] = set;
				return mapFn(newItems[j], s);
			}
			return mapFn(newItems[j]);
		}
	};
}
var hydrationEnabled = false;
function enableHydration() {
	hydrationEnabled = true;
}
function createComponent(Comp, props) {
	if (hydrationEnabled) {
		if (sharedConfig.context) {
			const c = sharedConfig.context;
			setHydrateContext(nextHydrateContext());
			const r = untrack(() => Comp(props || {}));
			setHydrateContext(c);
			return r;
		}
	}
	return untrack(() => Comp(props || {}));
}
function trueFn() {
	return true;
}
var propTraps = {
	get(_, property, receiver) {
		if (property === $PROXY) return receiver;
		return _.get(property);
	},
	has(_, property) {
		if (property === $PROXY) return true;
		return _.has(property);
	},
	set: trueFn,
	deleteProperty: trueFn,
	getOwnPropertyDescriptor(_, property) {
		return {
			configurable: true,
			enumerable: true,
			get() {
				return _.get(property);
			},
			set: trueFn,
			deleteProperty: trueFn
		};
	},
	ownKeys(_) {
		return _.keys();
	}
};
function resolveSource(s) {
	return !(s = typeof s === "function" ? s() : s) ? {} : s;
}
function resolveSources() {
	for (let i = 0, length = this.length; i < length; ++i) {
		const v = this[i]();
		if (v !== void 0) return v;
	}
}
function mergeProps(...sources) {
	let proxy = false;
	for (let i = 0; i < sources.length; i++) {
		const s = sources[i];
		proxy = proxy || !!s && $PROXY in s;
		sources[i] = typeof s === "function" ? (proxy = true, createMemo(s)) : s;
	}
	if (SUPPORTS_PROXY && proxy) return new Proxy({
		get(property) {
			for (let i = sources.length - 1; i >= 0; i--) {
				const v = resolveSource(sources[i])[property];
				if (v !== void 0) return v;
			}
		},
		has(property) {
			for (let i = sources.length - 1; i >= 0; i--) if (property in resolveSource(sources[i])) return true;
			return false;
		},
		keys() {
			const keys = [];
			for (let i = 0; i < sources.length; i++) keys.push(...Object.keys(resolveSource(sources[i])));
			return [...new Set(keys)];
		}
	}, propTraps);
	const sourcesMap = {};
	const defined = Object.create(null);
	for (let i = sources.length - 1; i >= 0; i--) {
		const source = sources[i];
		if (!source) continue;
		const sourceKeys = Object.getOwnPropertyNames(source);
		for (let i$1 = sourceKeys.length - 1; i$1 >= 0; i$1--) {
			const key = sourceKeys[i$1];
			if (key === "__proto__" || key === "constructor") continue;
			const desc = Object.getOwnPropertyDescriptor(source, key);
			if (!defined[key]) defined[key] = desc.get ? {
				enumerable: true,
				configurable: true,
				get: resolveSources.bind(sourcesMap[key] = [desc.get.bind(source)])
			} : desc.value !== void 0 ? desc : void 0;
			else {
				const sources$1 = sourcesMap[key];
				if (sources$1) {
					if (desc.get) sources$1.push(desc.get.bind(source));
					else if (desc.value !== void 0) sources$1.push(() => desc.value);
				}
			}
		}
	}
	const target = {};
	const definedKeys = Object.keys(defined);
	for (let i = definedKeys.length - 1; i >= 0; i--) {
		const key = definedKeys[i], desc = defined[key];
		if (desc && desc.get) Object.defineProperty(target, key, desc);
		else target[key] = desc ? desc.value : void 0;
	}
	return target;
}
function lazy(fn) {
	let comp;
	let p;
	const wrap = (props) => {
		const ctx = sharedConfig.context;
		if (ctx) {
			const [s, set] = createSignal();
			sharedConfig.count || (sharedConfig.count = 0);
			sharedConfig.count++;
			(p || (p = fn())).then((mod) => {
				!sharedConfig.done && setHydrateContext(ctx);
				sharedConfig.count--;
				set(() => mod.default);
				setHydrateContext();
			});
			comp = s;
		} else if (!comp) {
			const [s] = createResource(() => (p || (p = fn())).then((mod) => mod.default));
			comp = s;
		}
		let Comp;
		return createMemo(() => (Comp = comp()) ? untrack(() => {
			if (!ctx || sharedConfig.done) return Comp(props);
			const c = sharedConfig.context;
			setHydrateContext(ctx);
			const r = Comp(props);
			setHydrateContext(c);
			return r;
		}) : "");
	};
	wrap.preload = () => p || ((p = fn()).then((mod) => comp = () => mod.default), p);
	return wrap;
}
var counter = 0;
function createUniqueId() {
	return sharedConfig.context ? sharedConfig.getNextContextId() : `cl-${counter++}`;
}
var narrowedError = (name) => `Stale read from <${name}>.`;
function For(props) {
	const fallback = "fallback" in props && { fallback: () => props.fallback };
	return createMemo(mapArray(() => props.each, props.children, fallback || void 0));
}
function Show(props) {
	const keyed = props.keyed;
	const conditionValue = createMemo(() => props.when, void 0, void 0);
	const condition = keyed ? conditionValue : createMemo(conditionValue, void 0, { equals: (a, b) => !a === !b });
	return createMemo(() => {
		const c = condition();
		if (c) {
			const child = props.children;
			return typeof child === "function" && child.length > 0 ? untrack(() => child(keyed ? c : () => {
				if (!untrack(condition)) throw narrowedError("Show");
				return conditionValue();
			})) : child;
		}
		return props.fallback;
	}, void 0, void 0);
}
function Switch(props) {
	const chs = children(() => props.children);
	const switchFunc = createMemo(() => {
		const ch = chs();
		const mps = Array.isArray(ch) ? ch : [ch];
		let func = () => void 0;
		for (let i = 0; i < mps.length; i++) {
			const index = i;
			const mp = mps[i];
			const prevFunc = func;
			const conditionValue = createMemo(() => prevFunc() ? void 0 : mp.when, void 0, void 0);
			const condition = mp.keyed ? conditionValue : createMemo(conditionValue, void 0, { equals: (a, b) => !a === !b });
			func = () => prevFunc() || (condition() ? [
				index,
				conditionValue,
				mp
			] : void 0);
		}
		return func;
	});
	return createMemo(() => {
		const sel = switchFunc()();
		if (!sel) return props.fallback;
		const [index, conditionValue, mp] = sel;
		const child = mp.children;
		return typeof child === "function" && child.length > 0 ? untrack(() => child(mp.keyed ? conditionValue() : () => {
			if (untrack(switchFunc)()?.[0] !== index) throw narrowedError("Match");
			return conditionValue();
		})) : child;
	}, void 0, void 0);
}
function Match(props) {
	return props;
}
var Errors;
function ErrorBoundary(props) {
	let err;
	if (sharedConfig.context && sharedConfig.load) err = sharedConfig.load(sharedConfig.getContextId());
	const [errored, setErrored] = createSignal(err, void 0);
	Errors || (Errors = /* @__PURE__ */ new Set());
	Errors.add(setErrored);
	onCleanup(() => Errors.delete(setErrored));
	return createMemo(() => {
		let e;
		if (e = errored()) {
			const f = props.fallback;
			return typeof f === "function" && f.length ? untrack(() => f(e, () => setErrored())) : f;
		}
		return catchError(() => props.children, setErrored);
	}, void 0, void 0);
}
var SuspenseListContext = /* @__PURE__ */ createContext();
function Suspense(props) {
	let counter$1 = 0, show, ctx, p, flicker, error;
	const [inFallback, setFallback] = createSignal(false), SuspenseContext$1 = getSuspenseContext(), store = {
		increment: () => {
			if (++counter$1 === 1) setFallback(true);
		},
		decrement: () => {
			if (--counter$1 === 0) setFallback(false);
		},
		inFallback,
		effects: [],
		resolved: false
	}, owner = getOwner();
	if (sharedConfig.context && sharedConfig.load) {
		const key = sharedConfig.getContextId();
		let ref = sharedConfig.load(key);
		if (ref) if (typeof ref !== "object" || ref.s !== 1) p = ref;
		else sharedConfig.gather(key);
		if (p && p !== "$$f") {
			const [s, set] = createSignal(void 0, { equals: false });
			flicker = s;
			p.then(() => {
				if (sharedConfig.done) return set();
				sharedConfig.gather(key);
				setHydrateContext(ctx);
				set();
				setHydrateContext();
			}, (err) => {
				error = err;
				set();
			});
		}
	}
	const listContext = useContext(SuspenseListContext);
	if (listContext) show = listContext.register(store.inFallback);
	let dispose$1;
	onCleanup(() => dispose$1 && dispose$1());
	return createComponent(SuspenseContext$1.Provider, {
		value: store,
		get children() {
			return createMemo(() => {
				if (error) throw error;
				ctx = sharedConfig.context;
				if (flicker) {
					flicker();
					flicker = void 0;
					return;
				}
				if (ctx && p === "$$f") setHydrateContext();
				const rendered = createMemo(() => props.children);
				return createMemo((prev) => {
					const inFallback$1 = store.inFallback(), { showContent = true, showFallback = true } = show ? show() : {};
					if ((!inFallback$1 || p && p !== "$$f") && showContent) {
						store.resolved = true;
						dispose$1 && dispose$1();
						dispose$1 = ctx = p = void 0;
						resumeEffects(store.effects);
						return rendered();
					}
					if (!showFallback) return;
					if (dispose$1) return prev;
					return createRoot((disposer) => {
						dispose$1 = disposer;
						if (ctx) {
							setHydrateContext({
								id: ctx.id + "F",
								count: 0
							});
							ctx = void 0;
						}
						return props.fallback;
					}, owner);
				});
			});
		}
	});
}

//#endregion
//#region ../../node_modules/.pnpm/solid-js@1.9.10/node_modules/solid-js/web/dist/web.js
var Properties = /* @__PURE__ */ new Set([
	"className",
	"value",
	"readOnly",
	"noValidate",
	"formNoValidate",
	"isMap",
	"noModule",
	"playsInline",
	"adAuctionHeaders",
	"allowFullscreen",
	"browsingTopics",
	"defaultChecked",
	"defaultMuted",
	"defaultSelected",
	"disablePictureInPicture",
	"disableRemotePlayback",
	"preservesPitch",
	"shadowRootClonable",
	"shadowRootCustomElementRegistry",
	"shadowRootDelegatesFocus",
	"shadowRootSerializable",
	"sharedStorageWritable",
	...[
		"allowfullscreen",
		"async",
		"alpha",
		"autofocus",
		"autoplay",
		"checked",
		"controls",
		"default",
		"disabled",
		"formnovalidate",
		"hidden",
		"indeterminate",
		"inert",
		"ismap",
		"loop",
		"multiple",
		"muted",
		"nomodule",
		"novalidate",
		"open",
		"playsinline",
		"readonly",
		"required",
		"reversed",
		"seamless",
		"selected",
		"adauctionheaders",
		"browsingtopics",
		"credentialless",
		"defaultchecked",
		"defaultmuted",
		"defaultselected",
		"defer",
		"disablepictureinpicture",
		"disableremoteplayback",
		"preservespitch",
		"shadowrootclonable",
		"shadowrootcustomelementregistry",
		"shadowrootdelegatesfocus",
		"shadowrootserializable",
		"sharedstoragewritable"
	]
]);
var ChildProperties = /* @__PURE__ */ new Set([
	"innerHTML",
	"textContent",
	"innerText",
	"children"
]);
var Aliases = /* @__PURE__ */ Object.assign(Object.create(null), {
	className: "class",
	htmlFor: "for"
});
var PropAliases = /* @__PURE__ */ Object.assign(Object.create(null), {
	class: "className",
	novalidate: {
		$: "noValidate",
		FORM: 1
	},
	formnovalidate: {
		$: "formNoValidate",
		BUTTON: 1,
		INPUT: 1
	},
	ismap: {
		$: "isMap",
		IMG: 1
	},
	nomodule: {
		$: "noModule",
		SCRIPT: 1
	},
	playsinline: {
		$: "playsInline",
		VIDEO: 1
	},
	readonly: {
		$: "readOnly",
		INPUT: 1,
		TEXTAREA: 1
	},
	adauctionheaders: {
		$: "adAuctionHeaders",
		IFRAME: 1
	},
	allowfullscreen: {
		$: "allowFullscreen",
		IFRAME: 1
	},
	browsingtopics: {
		$: "browsingTopics",
		IMG: 1
	},
	defaultchecked: {
		$: "defaultChecked",
		INPUT: 1
	},
	defaultmuted: {
		$: "defaultMuted",
		AUDIO: 1,
		VIDEO: 1
	},
	defaultselected: {
		$: "defaultSelected",
		OPTION: 1
	},
	disablepictureinpicture: {
		$: "disablePictureInPicture",
		VIDEO: 1
	},
	disableremoteplayback: {
		$: "disableRemotePlayback",
		AUDIO: 1,
		VIDEO: 1
	},
	preservespitch: {
		$: "preservesPitch",
		AUDIO: 1,
		VIDEO: 1
	},
	shadowrootclonable: {
		$: "shadowRootClonable",
		TEMPLATE: 1
	},
	shadowrootdelegatesfocus: {
		$: "shadowRootDelegatesFocus",
		TEMPLATE: 1
	},
	shadowrootserializable: {
		$: "shadowRootSerializable",
		TEMPLATE: 1
	},
	sharedstoragewritable: {
		$: "sharedStorageWritable",
		IFRAME: 1,
		IMG: 1
	}
});
function getPropAlias(prop, tagName) {
	const a = PropAliases[prop];
	return typeof a === "object" ? a[tagName] ? a["$"] : void 0 : a;
}
var DelegatedEvents = /* @__PURE__ */ new Set([
	"beforeinput",
	"click",
	"dblclick",
	"contextmenu",
	"focusin",
	"focusout",
	"input",
	"keydown",
	"keyup",
	"mousedown",
	"mousemove",
	"mouseout",
	"mouseover",
	"mouseup",
	"pointerdown",
	"pointermove",
	"pointerout",
	"pointerover",
	"pointerup",
	"touchend",
	"touchmove",
	"touchstart"
]);
var SVGElements = /* @__PURE__ */ new Set([
	"altGlyph",
	"altGlyphDef",
	"altGlyphItem",
	"animate",
	"animateColor",
	"animateMotion",
	"animateTransform",
	"circle",
	"clipPath",
	"color-profile",
	"cursor",
	"defs",
	"desc",
	"ellipse",
	"feBlend",
	"feColorMatrix",
	"feComponentTransfer",
	"feComposite",
	"feConvolveMatrix",
	"feDiffuseLighting",
	"feDisplacementMap",
	"feDistantLight",
	"feDropShadow",
	"feFlood",
	"feFuncA",
	"feFuncB",
	"feFuncG",
	"feFuncR",
	"feGaussianBlur",
	"feImage",
	"feMerge",
	"feMergeNode",
	"feMorphology",
	"feOffset",
	"fePointLight",
	"feSpecularLighting",
	"feSpotLight",
	"feTile",
	"feTurbulence",
	"filter",
	"font",
	"font-face",
	"font-face-format",
	"font-face-name",
	"font-face-src",
	"font-face-uri",
	"foreignObject",
	"g",
	"glyph",
	"glyphRef",
	"hkern",
	"image",
	"line",
	"linearGradient",
	"marker",
	"mask",
	"metadata",
	"missing-glyph",
	"mpath",
	"path",
	"pattern",
	"polygon",
	"polyline",
	"radialGradient",
	"rect",
	"set",
	"stop",
	"svg",
	"switch",
	"symbol",
	"text",
	"textPath",
	"tref",
	"tspan",
	"use",
	"view",
	"vkern"
]);
var SVGNamespace = {
	xlink: "http://www.w3.org/1999/xlink",
	xml: "http://www.w3.org/XML/1998/namespace"
};
var memo = (fn) => createMemo(() => fn());
function reconcileArrays(parentNode, a, b) {
	let bLength = b.length, aEnd = a.length, bEnd = bLength, aStart = 0, bStart = 0, after = a[aEnd - 1].nextSibling, map = null;
	while (aStart < aEnd || bStart < bEnd) {
		if (a[aStart] === b[bStart]) {
			aStart++;
			bStart++;
			continue;
		}
		while (a[aEnd - 1] === b[bEnd - 1]) {
			aEnd--;
			bEnd--;
		}
		if (aEnd === aStart) {
			const node = bEnd < bLength ? bStart ? b[bStart - 1].nextSibling : b[bEnd - bStart] : after;
			while (bStart < bEnd) parentNode.insertBefore(b[bStart++], node);
		} else if (bEnd === bStart) while (aStart < aEnd) {
			if (!map || !map.has(a[aStart])) a[aStart].remove();
			aStart++;
		}
		else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
			const node = a[--aEnd].nextSibling;
			parentNode.insertBefore(b[bStart++], a[aStart++].nextSibling);
			parentNode.insertBefore(b[--bEnd], node);
			a[aEnd] = b[bEnd];
		} else {
			if (!map) {
				map = /* @__PURE__ */ new Map();
				let i = bStart;
				while (i < bEnd) map.set(b[i], i++);
			}
			const index = map.get(a[aStart]);
			if (index != null) if (bStart < index && index < bEnd) {
				let i = aStart, sequence = 1, t;
				while (++i < aEnd && i < bEnd) {
					if ((t = map.get(a[i])) == null || t !== index + sequence) break;
					sequence++;
				}
				if (sequence > index - bStart) {
					const node = a[aStart];
					while (bStart < index) parentNode.insertBefore(b[bStart++], node);
				} else parentNode.replaceChild(b[bStart++], a[aStart++]);
			} else aStart++;
			else a[aStart++].remove();
		}
	}
}
var $$EVENTS = "_$DX_DELEGATE";
function render(code, element, init, options = {}) {
	let disposer;
	createRoot((dispose$1) => {
		disposer = dispose$1;
		element === document ? code() : insert(element, code(), element.firstChild ? null : void 0, init);
	}, options.owner);
	return () => {
		disposer();
		element.textContent = "";
	};
}
function template(html, isImportNode, isSVG, isMathML) {
	let node;
	const create = () => {
		const t = isMathML ? document.createElementNS("http://www.w3.org/1998/Math/MathML", "template") : document.createElement("template");
		t.innerHTML = html;
		return isSVG ? t.content.firstChild.firstChild : isMathML ? t.firstChild : t.content.firstChild;
	};
	const fn = isImportNode ? () => untrack(() => document.importNode(node || (node = create()), true)) : () => (node || (node = create())).cloneNode(true);
	fn.cloneNode = fn;
	return fn;
}
function delegateEvents(eventNames, document$1 = window.document) {
	const e = document$1[$$EVENTS] || (document$1[$$EVENTS] = /* @__PURE__ */ new Set());
	for (let i = 0, l = eventNames.length; i < l; i++) {
		const name = eventNames[i];
		if (!e.has(name)) {
			e.add(name);
			document$1.addEventListener(name, eventHandler);
		}
	}
}
function setProperty$1(node, name, value) {
	if (isHydrating(node)) return;
	node[name] = value;
}
function setAttribute(node, name, value) {
	if (isHydrating(node)) return;
	if (value == null) node.removeAttribute(name);
	else node.setAttribute(name, value);
}
function setAttributeNS(node, namespace, name, value) {
	if (isHydrating(node)) return;
	if (value == null) node.removeAttributeNS(namespace, name);
	else node.setAttributeNS(namespace, name, value);
}
function setBoolAttribute(node, name, value) {
	if (isHydrating(node)) return;
	value ? node.setAttribute(name, "") : node.removeAttribute(name);
}
function className(node, value) {
	if (isHydrating(node)) return;
	if (value == null) node.removeAttribute("class");
	else node.className = value;
}
function addEventListener(node, name, handler, delegate) {
	if (delegate) if (Array.isArray(handler)) {
		node[`$$${name}`] = handler[0];
		node[`$$${name}Data`] = handler[1];
	} else node[`$$${name}`] = handler;
	else if (Array.isArray(handler)) {
		const handlerFn = handler[0];
		node.addEventListener(name, handler[0] = (e) => handlerFn.call(node, handler[1], e));
	} else node.addEventListener(name, handler, typeof handler !== "function" && handler);
}
function classList(node, value, prev = {}) {
	const classKeys = Object.keys(value || {}), prevKeys = Object.keys(prev);
	let i, len;
	for (i = 0, len = prevKeys.length; i < len; i++) {
		const key = prevKeys[i];
		if (!key || key === "undefined" || value[key]) continue;
		toggleClassKey(node, key, false);
		delete prev[key];
	}
	for (i = 0, len = classKeys.length; i < len; i++) {
		const key = classKeys[i], classValue = !!value[key];
		if (!key || key === "undefined" || prev[key] === classValue || !classValue) continue;
		toggleClassKey(node, key, true);
		prev[key] = classValue;
	}
	return prev;
}
function style(node, value, prev) {
	if (!value) return prev ? setAttribute(node, "style") : value;
	const nodeStyle = node.style;
	if (typeof value === "string") return nodeStyle.cssText = value;
	typeof prev === "string" && (nodeStyle.cssText = prev = void 0);
	prev || (prev = {});
	value || (value = {});
	let v, s;
	for (s in prev) {
		value[s] ?? nodeStyle.removeProperty(s);
		delete prev[s];
	}
	for (s in value) {
		v = value[s];
		if (v !== prev[s]) {
			nodeStyle.setProperty(s, v);
			prev[s] = v;
		}
	}
	return prev;
}
function setStyleProperty(node, name, value) {
	value != null ? node.style.setProperty(name, value) : node.style.removeProperty(name);
}
function spread(node, props = {}, isSVG, skipChildren) {
	const prevProps = {};
	if (!skipChildren) createRenderEffect(() => prevProps.children = insertExpression(node, props.children, prevProps.children));
	createRenderEffect(() => typeof props.ref === "function" && use(props.ref, node));
	createRenderEffect(() => assign(node, props, isSVG, true, prevProps, true));
	return prevProps;
}
function dynamicProperty(props, key) {
	const src = props[key];
	Object.defineProperty(props, key, {
		get() {
			return src();
		},
		enumerable: true
	});
	return props;
}
function use(fn, element, arg) {
	return untrack(() => fn(element, arg));
}
function insert(parent, accessor, marker, initial) {
	if (marker !== void 0 && !initial) initial = [];
	if (typeof accessor !== "function") return insertExpression(parent, accessor, initial, marker);
	createRenderEffect((current) => insertExpression(parent, accessor(), current, marker), initial);
}
function assign(node, props, isSVG, skipChildren, prevProps = {}, skipRef = false) {
	props || (props = {});
	for (const prop in prevProps) if (!(prop in props)) {
		if (prop === "children") continue;
		prevProps[prop] = assignProp(node, prop, null, prevProps[prop], isSVG, skipRef, props);
	}
	for (const prop in props) {
		if (prop === "children") {
			if (!skipChildren) insertExpression(node, props.children);
			continue;
		}
		const value = props[prop];
		prevProps[prop] = assignProp(node, prop, value, prevProps[prop], isSVG, skipRef, props);
	}
}
function hydrate$1(code, element, options = {}) {
	if (globalThis._$HY.done) return render(code, element, [...element.childNodes], options);
	sharedConfig.completed = globalThis._$HY.completed;
	sharedConfig.events = globalThis._$HY.events;
	sharedConfig.load = (id) => globalThis._$HY.r[id];
	sharedConfig.has = (id) => id in globalThis._$HY.r;
	sharedConfig.gather = (root) => gatherHydratable(element, root);
	sharedConfig.registry = /* @__PURE__ */ new Map();
	sharedConfig.context = {
		id: options.renderId || "",
		count: 0
	};
	try {
		gatherHydratable(element, options.renderId);
		return render(code, element, [...element.childNodes], options);
	} finally {
		sharedConfig.context = null;
	}
}
function getNextElement(template$1) {
	let node, key;
	if (!isHydrating() || !(node = sharedConfig.registry.get(key = getHydrationKey()))) return template$1();
	if (sharedConfig.completed) sharedConfig.completed.add(node);
	sharedConfig.registry.delete(key);
	return node;
}
function getNextMarker(start) {
	let end = start, count = 0, current = [];
	if (isHydrating(start)) while (end) {
		if (end.nodeType === 8) {
			const v = end.nodeValue;
			if (v === "$") count++;
			else if (v === "/") {
				if (count === 0) return [end, current];
				count--;
			}
		}
		current.push(end);
		end = end.nextSibling;
	}
	return [end, current];
}
function runHydrationEvents() {
	if (sharedConfig.events && !sharedConfig.events.queued) {
		queueMicrotask(() => {
			const { completed, events } = sharedConfig;
			if (!events) return;
			events.queued = false;
			while (events.length) {
				const [el, e] = events[0];
				if (!completed.has(el)) return;
				events.shift();
				eventHandler(e);
			}
			if (sharedConfig.done) {
				sharedConfig.events = _$HY.events = null;
				sharedConfig.completed = _$HY.completed = null;
			}
		});
		sharedConfig.events.queued = true;
	}
}
function isHydrating(node) {
	return !!sharedConfig.context && !sharedConfig.done && (!node || node.isConnected);
}
function toPropertyName(name) {
	return name.toLowerCase().replace(/-([a-z])/g, (_, w) => w.toUpperCase());
}
function toggleClassKey(node, key, value) {
	const classNames = key.trim().split(/\s+/);
	for (let i = 0, nameLen = classNames.length; i < nameLen; i++) node.classList.toggle(classNames[i], value);
}
function assignProp(node, prop, value, prev, isSVG, skipRef, props) {
	let isCE, isProp, isChildProp, propAlias, forceProp;
	if (prop === "style") return style(node, value, prev);
	if (prop === "classList") return classList(node, value, prev);
	if (value === prev) return prev;
	if (prop === "ref") {
		if (!skipRef) value(node);
	} else if (prop.slice(0, 3) === "on:") {
		const e = prop.slice(3);
		prev && node.removeEventListener(e, prev, typeof prev !== "function" && prev);
		value && node.addEventListener(e, value, typeof value !== "function" && value);
	} else if (prop.slice(0, 10) === "oncapture:") {
		const e = prop.slice(10);
		prev && node.removeEventListener(e, prev, true);
		value && node.addEventListener(e, value, true);
	} else if (prop.slice(0, 2) === "on") {
		const name = prop.slice(2).toLowerCase();
		const delegate = DelegatedEvents.has(name);
		if (!delegate && prev) {
			const h$1 = Array.isArray(prev) ? prev[0] : prev;
			node.removeEventListener(name, h$1);
		}
		if (delegate || value) {
			addEventListener(node, name, value, delegate);
			delegate && delegateEvents([name]);
		}
	} else if (prop.slice(0, 5) === "attr:") setAttribute(node, prop.slice(5), value);
	else if (prop.slice(0, 5) === "bool:") setBoolAttribute(node, prop.slice(5), value);
	else if ((forceProp = prop.slice(0, 5) === "prop:") || (isChildProp = ChildProperties.has(prop)) || !isSVG && ((propAlias = getPropAlias(prop, node.tagName)) || (isProp = Properties.has(prop))) || (isCE = node.nodeName.includes("-") || "is" in props)) {
		if (forceProp) {
			prop = prop.slice(5);
			isProp = true;
		} else if (isHydrating(node)) return value;
		if (prop === "class" || prop === "className") className(node, value);
		else if (isCE && !isProp && !isChildProp) node[toPropertyName(prop)] = value;
		else node[propAlias || prop] = value;
	} else {
		const ns = isSVG && prop.indexOf(":") > -1 && SVGNamespace[prop.split(":")[0]];
		if (ns) setAttributeNS(node, ns, prop, value);
		else setAttribute(node, Aliases[prop] || prop, value);
	}
	return value;
}
function eventHandler(e) {
	if (sharedConfig.registry && sharedConfig.events) {
		if (sharedConfig.events.find(([el, ev]) => ev === e)) return;
	}
	let node = e.target;
	const key = `$$${e.type}`;
	const oriTarget = e.target;
	const oriCurrentTarget = e.currentTarget;
	const retarget = (value) => Object.defineProperty(e, "target", {
		configurable: true,
		value
	});
	const handleNode = () => {
		const handler = node[key];
		if (handler && !node.disabled) {
			const data = node[`${key}Data`];
			data !== void 0 ? handler.call(node, data, e) : handler.call(node, e);
			if (e.cancelBubble) return;
		}
		node.host && typeof node.host !== "string" && !node.host._$host && node.contains(e.target) && retarget(node.host);
		return true;
	};
	const walkUpTree = () => {
		while (handleNode() && (node = node._$host || node.parentNode || node.host));
	};
	Object.defineProperty(e, "currentTarget", {
		configurable: true,
		get() {
			return node || document;
		}
	});
	if (sharedConfig.registry && !sharedConfig.done) sharedConfig.done = _$HY.done = true;
	if (e.composedPath) {
		const path = e.composedPath();
		retarget(path[0]);
		for (let i = 0; i < path.length - 2; i++) {
			node = path[i];
			if (!handleNode()) break;
			if (node._$host) {
				node = node._$host;
				walkUpTree();
				break;
			}
			if (node.parentNode === oriCurrentTarget) break;
		}
	} else walkUpTree();
	retarget(oriTarget);
}
function insertExpression(parent, value, current, marker, unwrapArray) {
	const hydrating = isHydrating(parent);
	if (hydrating) {
		!current && (current = [...parent.childNodes]);
		let cleaned = [];
		for (let i = 0; i < current.length; i++) {
			const node = current[i];
			if (node.nodeType === 8 && node.data.slice(0, 2) === "!$") node.remove();
			else cleaned.push(node);
		}
		current = cleaned;
	}
	while (typeof current === "function") current = current();
	if (value === current) return current;
	const t = typeof value, multi = marker !== void 0;
	parent = multi && current[0] && current[0].parentNode || parent;
	if (t === "string" || t === "number") {
		if (hydrating) return current;
		if (t === "number") {
			value = value.toString();
			if (value === current) return current;
		}
		if (multi) {
			let node = current[0];
			if (node && node.nodeType === 3) node.data !== value && (node.data = value);
			else node = document.createTextNode(value);
			current = cleanChildren(parent, current, marker, node);
		} else if (current !== "" && typeof current === "string") current = parent.firstChild.data = value;
		else current = parent.textContent = value;
	} else if (value == null || t === "boolean") {
		if (hydrating) return current;
		current = cleanChildren(parent, current, marker);
	} else if (t === "function") {
		createRenderEffect(() => {
			let v = value();
			while (typeof v === "function") v = v();
			current = insertExpression(parent, v, current, marker);
		});
		return () => current;
	} else if (Array.isArray(value)) {
		const array = [];
		const currentArray = current && Array.isArray(current);
		if (normalizeIncomingArray(array, value, current, unwrapArray)) {
			createRenderEffect(() => current = insertExpression(parent, array, current, marker, true));
			return () => current;
		}
		if (hydrating) {
			if (!array.length) return current;
			if (marker === void 0) return current = [...parent.childNodes];
			let node = array[0];
			if (node.parentNode !== parent) return current;
			const nodes = [node];
			while ((node = node.nextSibling) !== marker) nodes.push(node);
			return current = nodes;
		}
		if (array.length === 0) {
			current = cleanChildren(parent, current, marker);
			if (multi) return current;
		} else if (currentArray) if (current.length === 0) appendNodes(parent, array, marker);
		else reconcileArrays(parent, current, array);
		else {
			current && cleanChildren(parent);
			appendNodes(parent, array);
		}
		current = array;
	} else if (value.nodeType) {
		if (hydrating && value.parentNode) return current = multi ? [value] : value;
		if (Array.isArray(current)) {
			if (multi) return current = cleanChildren(parent, current, marker, value);
			cleanChildren(parent, current, null, value);
		} else if (current == null || current === "" || !parent.firstChild) parent.appendChild(value);
		else parent.replaceChild(value, parent.firstChild);
		current = value;
	}
	return current;
}
function normalizeIncomingArray(normalized, array, current, unwrap$1) {
	let dynamic = false;
	for (let i = 0, len = array.length; i < len; i++) {
		let item = array[i], prev = current && current[normalized.length], t;
		if (item == null || item === true || item === false);
		else if ((t = typeof item) === "object" && item.nodeType) normalized.push(item);
		else if (Array.isArray(item)) dynamic = normalizeIncomingArray(normalized, item, prev) || dynamic;
		else if (t === "function") if (unwrap$1) {
			while (typeof item === "function") item = item();
			dynamic = normalizeIncomingArray(normalized, Array.isArray(item) ? item : [item], Array.isArray(prev) ? prev : [prev]) || dynamic;
		} else {
			normalized.push(item);
			dynamic = true;
		}
		else {
			const value = String(item);
			if (prev && prev.nodeType === 3 && prev.data === value) normalized.push(prev);
			else normalized.push(document.createTextNode(value));
		}
	}
	return dynamic;
}
function appendNodes(parent, array, marker = null) {
	for (let i = 0, len = array.length; i < len; i++) parent.insertBefore(array[i], marker);
}
function cleanChildren(parent, current, marker, replacement) {
	if (marker === void 0) return parent.textContent = "";
	const node = replacement || document.createTextNode("");
	if (current.length) {
		let inserted = false;
		for (let i = current.length - 1; i >= 0; i--) {
			const el = current[i];
			if (node !== el) {
				const isParent = el.parentNode === parent;
				if (!inserted && !i) isParent ? parent.replaceChild(node, el) : parent.insertBefore(node, marker);
				else isParent && el.remove();
			} else inserted = true;
		}
	} else parent.insertBefore(node, marker);
	return [node];
}
function gatherHydratable(element, root) {
	const templates = element.querySelectorAll(`*[data-hk]`);
	for (let i = 0; i < templates.length; i++) {
		const node = templates[i];
		const key = node.getAttribute("data-hk");
		if ((!root || key.startsWith(root)) && !sharedConfig.registry.has(key)) sharedConfig.registry.set(key, node);
	}
}
function getHydrationKey() {
	return sharedConfig.getNextContextId();
}
var RequestContext = Symbol();
var isServer = false;
var SVG_NAMESPACE = "http://www.w3.org/2000/svg";
function createElement(tagName, isSVG = false, is = void 0) {
	return isSVG ? document.createElementNS(SVG_NAMESPACE, tagName) : document.createElement(tagName, { is });
}
var hydrate = (...args) => {
	enableHydration();
	return hydrate$1(...args);
};
function Portal(props) {
	const { useShadow } = props, marker = document.createTextNode(""), mount = () => props.mount || document.body, owner = getOwner();
	let content;
	let hydrating = !!sharedConfig.context;
	createEffect(() => {
		if (hydrating) getOwner().user = hydrating = false;
		content || (content = runWithOwner(owner, () => createMemo(() => props.children)));
		const el = mount();
		if (el instanceof HTMLHeadElement) {
			const [clean, setClean] = createSignal(false);
			const cleanup = () => setClean(true);
			createRoot((dispose$1) => insert(el, () => !clean() ? content() : dispose$1(), null));
			onCleanup(cleanup);
		} else {
			const container = createElement(props.isSVG ? "g" : "div", props.isSVG), renderRoot = useShadow && container.attachShadow ? container.attachShadow({ mode: "open" }) : container;
			Object.defineProperty(container, "_$host", {
				get() {
					return marker.parentNode;
				},
				configurable: true
			});
			insert(renderRoot, content);
			el.appendChild(container);
			props.ref && props.ref(container);
			onCleanup(() => el.removeChild(container));
		}
	}, void 0, { render: !hydrating });
	return marker;
}

//#endregion
//#region ../../node_modules/.pnpm/solid-js@1.9.10/node_modules/solid-js/store/dist/store.js
var $RAW = Symbol("store-raw"), $NODE = Symbol("store-node"), $HAS = Symbol("store-has"), $SELF = Symbol("store-self");
function wrap$1(value) {
	let p = value[$PROXY];
	if (!p) {
		Object.defineProperty(value, $PROXY, { value: p = new Proxy(value, proxyTraps$1) });
		if (!Array.isArray(value)) {
			const keys = Object.keys(value), desc = Object.getOwnPropertyDescriptors(value);
			for (let i = 0, l = keys.length; i < l; i++) {
				const prop = keys[i];
				if (desc[prop].get) Object.defineProperty(value, prop, {
					enumerable: desc[prop].enumerable,
					get: desc[prop].get.bind(p)
				});
			}
		}
	}
	return p;
}
function isWrappable(obj) {
	let proto;
	return obj != null && typeof obj === "object" && (obj[$PROXY] || !(proto = Object.getPrototypeOf(obj)) || proto === Object.prototype || Array.isArray(obj));
}
function unwrap(item, set = /* @__PURE__ */ new Set()) {
	let result, unwrapped, v, prop;
	if (result = item != null && item[$RAW]) return result;
	if (!isWrappable(item) || set.has(item)) return item;
	if (Array.isArray(item)) {
		if (Object.isFrozen(item)) item = item.slice(0);
		else set.add(item);
		for (let i = 0, l = item.length; i < l; i++) {
			v = item[i];
			if ((unwrapped = unwrap(v, set)) !== v) item[i] = unwrapped;
		}
	} else {
		if (Object.isFrozen(item)) item = Object.assign({}, item);
		else set.add(item);
		const keys = Object.keys(item), desc = Object.getOwnPropertyDescriptors(item);
		for (let i = 0, l = keys.length; i < l; i++) {
			prop = keys[i];
			if (desc[prop].get) continue;
			v = item[prop];
			if ((unwrapped = unwrap(v, set)) !== v) item[prop] = unwrapped;
		}
	}
	return item;
}
function getNodes(target, symbol) {
	let nodes = target[symbol];
	if (!nodes) Object.defineProperty(target, symbol, { value: nodes = Object.create(null) });
	return nodes;
}
function getNode(nodes, property, value) {
	if (nodes[property]) return nodes[property];
	const [s, set] = createSignal(value, {
		equals: false,
		internal: true
	});
	s.$ = set;
	return nodes[property] = s;
}
function proxyDescriptor$1(target, property) {
	const desc = Reflect.getOwnPropertyDescriptor(target, property);
	if (!desc || desc.get || !desc.configurable || property === $PROXY || property === $NODE) return desc;
	delete desc.value;
	delete desc.writable;
	desc.get = () => target[$PROXY][property];
	return desc;
}
function trackSelf(target) {
	getListener() && getNode(getNodes(target, $NODE), $SELF)();
}
function ownKeys(target) {
	trackSelf(target);
	return Reflect.ownKeys(target);
}
var proxyTraps$1 = {
	get(target, property, receiver) {
		if (property === $RAW) return target;
		if (property === $PROXY) return receiver;
		if (property === $TRACK) {
			trackSelf(target);
			return receiver;
		}
		const nodes = getNodes(target, $NODE);
		const tracked = nodes[property];
		let value = tracked ? tracked() : target[property];
		if (property === $NODE || property === $HAS || property === "__proto__") return value;
		if (!tracked) {
			const desc = Object.getOwnPropertyDescriptor(target, property);
			if (getListener() && (typeof value !== "function" || target.hasOwnProperty(property)) && !(desc && desc.get)) value = getNode(nodes, property, value)();
		}
		return isWrappable(value) ? wrap$1(value) : value;
	},
	has(target, property) {
		if (property === $RAW || property === $PROXY || property === $TRACK || property === $NODE || property === $HAS || property === "__proto__") return true;
		getListener() && getNode(getNodes(target, $HAS), property)();
		return property in target;
	},
	set() {
		return true;
	},
	deleteProperty() {
		return true;
	},
	ownKeys,
	getOwnPropertyDescriptor: proxyDescriptor$1
};
function setProperty(state, property, value, deleting = false) {
	if (!deleting && state[property] === value) return;
	const prev = state[property], len = state.length;
	if (value === void 0) {
		delete state[property];
		if (state[$HAS] && state[$HAS][property] && prev !== void 0) state[$HAS][property].$();
	} else {
		state[property] = value;
		if (state[$HAS] && state[$HAS][property] && prev === void 0) state[$HAS][property].$();
	}
	let nodes = getNodes(state, $NODE), node;
	if (node = getNode(nodes, property, prev)) node.$(() => value);
	if (Array.isArray(state) && state.length !== len) {
		for (let i = state.length; i < len; i++) (node = nodes[i]) && node.$();
		(node = getNode(nodes, "length", len)) && node.$(state.length);
	}
	(node = nodes[$SELF]) && node.$();
}
function mergeStoreNode(state, value) {
	const keys = Object.keys(value);
	for (let i = 0; i < keys.length; i += 1) {
		const key = keys[i];
		setProperty(state, key, value[key]);
	}
}
function updateArray(current, next) {
	if (typeof next === "function") next = next(current);
	next = unwrap(next);
	if (Array.isArray(next)) {
		if (current === next) return;
		let i = 0, len = next.length;
		for (; i < len; i++) {
			const value = next[i];
			if (current[i] !== value) setProperty(current, i, value);
		}
		setProperty(current, "length", len);
	} else mergeStoreNode(current, next);
}
function updatePath(current, path, traversed = []) {
	let part, prev = current;
	if (path.length > 1) {
		part = path.shift();
		const partType = typeof part, isArray = Array.isArray(current);
		if (Array.isArray(part)) {
			for (let i = 0; i < part.length; i++) updatePath(current, [part[i]].concat(path), traversed);
			return;
		} else if (isArray && partType === "function") {
			for (let i = 0; i < current.length; i++) if (part(current[i], i)) updatePath(current, [i].concat(path), traversed);
			return;
		} else if (isArray && partType === "object") {
			const { from = 0, to = current.length - 1, by = 1 } = part;
			for (let i = from; i <= to; i += by) updatePath(current, [i].concat(path), traversed);
			return;
		} else if (path.length > 1) {
			updatePath(current[part], path, [part].concat(traversed));
			return;
		}
		prev = current[part];
		traversed = [part].concat(traversed);
	}
	let value = path[0];
	if (typeof value === "function") {
		value = value(prev, traversed);
		if (value === prev) return;
	}
	if (part === void 0 && value == void 0) return;
	value = unwrap(value);
	if (part === void 0 || isWrappable(prev) && isWrappable(value) && !Array.isArray(value)) mergeStoreNode(prev, value);
	else setProperty(current, part, value);
}
function createStore(...[store, options]) {
	const unwrappedStore = unwrap(store || {});
	const isArray = Array.isArray(unwrappedStore);
	const wrappedStore = wrap$1(unwrappedStore);
	function setStore(...args) {
		batch(() => {
			isArray && args.length === 1 ? updateArray(unwrappedStore, args[0]) : updatePath(unwrappedStore, args);
		});
	}
	return [wrappedStore, setStore];
}
var $ROOT = Symbol("store-root");

//#endregion
//#region ../../node_modules/.pnpm/solid-js@1.9.10/node_modules/solid-js/h/dist/h.js
var $ELEMENT = Symbol("hyper-element");
function createHyperScript(r) {
	function h$1() {
		let args = [].slice.call(arguments), e, classes = [], multiExpression = false;
		while (Array.isArray(args[0])) args = args[0];
		if (args[0][$ELEMENT]) args.unshift(h$1.Fragment);
		typeof args[0] === "string" && detectMultiExpression(args);
		const ret = () => {
			while (args.length) item(args.shift());
			if (e instanceof Element && classes.length) e.classList.add(...classes);
			return e;
		};
		ret[$ELEMENT] = true;
		return ret;
		function item(l) {
			const type = typeof l;
			if (l == null);
			else if ("string" === type) if (!e) parseClass(l);
			else e.appendChild(document.createTextNode(l));
			else if ("number" === type || "boolean" === type || "bigint" === type || "symbol" === type || l instanceof Date || l instanceof RegExp) e.appendChild(document.createTextNode(l.toString()));
			else if (Array.isArray(l)) for (let i = 0; i < l.length; i++) item(l[i]);
			else if (l instanceof Element) r.insert(e, l, multiExpression ? null : void 0);
			else if ("object" === type) {
				let dynamic = false;
				const d = Object.getOwnPropertyDescriptors(l);
				for (const k in d) {
					if (k === "class" && classes.length !== 0) {
						const fixedClasses = classes.join(" "), value = typeof d["class"].value === "function" ? () => fixedClasses + " " + d["class"].value() : fixedClasses + " " + l["class"];
						Object.defineProperty(l, "class", {
							...d[k],
							value
						});
						classes = [];
					}
					if (k !== "ref" && k.slice(0, 2) !== "on" && typeof d[k].value === "function") {
						r.dynamicProperty(l, k);
						dynamic = true;
					} else if (d[k].get) dynamic = true;
				}
				dynamic ? r.spread(e, l, e instanceof SVGElement, !!args.length) : r.assign(e, l, e instanceof SVGElement, !!args.length);
			} else if ("function" === type) if (!e) {
				let props, next = args[0];
				if (next == null || typeof next === "object" && !Array.isArray(next) && !(next instanceof Element)) props = args.shift();
				props || (props = {});
				if (args.length) props.children = args.length > 1 ? args : args[0];
				const d = Object.getOwnPropertyDescriptors(props);
				for (const k in d) if (Array.isArray(d[k].value)) {
					const list = d[k].value;
					props[k] = () => {
						for (let i = 0; i < list.length; i++) while (list[i][$ELEMENT]) list[i] = list[i]();
						return list;
					};
					r.dynamicProperty(props, k);
				} else if (typeof d[k].value === "function" && !d[k].value.length) r.dynamicProperty(props, k);
				e = r.createComponent(l, props);
				args = [];
			} else {
				while (l[$ELEMENT]) l = l();
				r.insert(e, l, multiExpression ? null : void 0);
			}
		}
		function parseClass(string) {
			const m = string.split(/([\.#]?[^\s#.]+)/);
			if (/^\.|#/.test(m[1])) e = document.createElement("div");
			for (let i = 0; i < m.length; i++) {
				const v = m[i], s = v.substring(1, v.length);
				if (!v) continue;
				if (!e) e = r.SVGElements.has(v) ? document.createElementNS("http://www.w3.org/2000/svg", v) : document.createElement(v);
				else if (v[0] === ".") classes.push(s);
				else if (v[0] === "#") e.setAttribute("id", s);
			}
		}
		function detectMultiExpression(list) {
			for (let i = 1; i < list.length; i++) if (typeof list[i] === "function") {
				multiExpression = true;
				return;
			} else if (Array.isArray(list[i])) detectMultiExpression(list[i]);
		}
	}
	h$1.Fragment = (props) => props.children;
	return h$1;
}
var h = createHyperScript({
	spread,
	assign,
	insert,
	createComponent,
	dynamicProperty,
	SVGElements
});

//#endregion
//#region ../../node_modules/.pnpm/@floating-ui+utils@0.2.10/node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var min = Math.min;
var max = Math.max;
var round = Math.round;
var createCoords = (v) => ({
	x: v,
	y: v
});
var oppositeSideMap = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
var oppositeAlignmentMap = {
	start: "end",
	end: "start"
};
function clamp(start, value, end) {
	return max(start, min(value, end));
}
function evaluate(value, param) {
	return typeof value === "function" ? value(param) : value;
}
function getSide(placement) {
	return placement.split("-")[0];
}
function getAlignment(placement) {
	return placement.split("-")[1];
}
function getOppositeAxis(axis) {
	return axis === "x" ? "y" : "x";
}
function getAxisLength(axis) {
	return axis === "y" ? "height" : "width";
}
var yAxisSides = /* @__PURE__ */ new Set(["top", "bottom"]);
function getSideAxis(placement) {
	return yAxisSides.has(getSide(placement)) ? "y" : "x";
}
function getAlignmentAxis(placement) {
	return getOppositeAxis(getSideAxis(placement));
}
function getAlignmentSides(placement, rects, rtl) {
	if (rtl === void 0) rtl = false;
	const alignment = getAlignment(placement);
	const alignmentAxis = getAlignmentAxis(placement);
	const length = getAxisLength(alignmentAxis);
	let mainAlignmentSide = alignmentAxis === "x" ? alignment === (rtl ? "end" : "start") ? "right" : "left" : alignment === "start" ? "bottom" : "top";
	if (rects.reference[length] > rects.floating[length]) mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
	return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
}
function getExpandedPlacements(placement) {
	const oppositePlacement = getOppositePlacement(placement);
	return [
		getOppositeAlignmentPlacement(placement),
		oppositePlacement,
		getOppositeAlignmentPlacement(oppositePlacement)
	];
}
function getOppositeAlignmentPlacement(placement) {
	return placement.replace(/start|end/g, (alignment) => oppositeAlignmentMap[alignment]);
}
var lrPlacement = ["left", "right"];
var rlPlacement = ["right", "left"];
var tbPlacement = ["top", "bottom"];
var btPlacement = ["bottom", "top"];
function getSideList(side, isStart, rtl) {
	switch (side) {
		case "top":
		case "bottom":
			if (rtl) return isStart ? rlPlacement : lrPlacement;
			return isStart ? lrPlacement : rlPlacement;
		case "left":
		case "right": return isStart ? tbPlacement : btPlacement;
		default: return [];
	}
}
function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
	const alignment = getAlignment(placement);
	let list = getSideList(getSide(placement), direction === "start", rtl);
	if (alignment) {
		list = list.map((side) => side + "-" + alignment);
		if (flipAlignment) list = list.concat(list.map(getOppositeAlignmentPlacement));
	}
	return list;
}
function getOppositePlacement(placement) {
	return placement.replace(/left|right|bottom|top/g, (side) => oppositeSideMap[side]);
}
function expandPaddingObject(padding) {
	return {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...padding
	};
}
function getPaddingObject(padding) {
	return typeof padding !== "number" ? expandPaddingObject(padding) : {
		top: padding,
		right: padding,
		bottom: padding,
		left: padding
	};
}
function rectToClientRect(rect) {
	const { x, y, width, height } = rect;
	return {
		width,
		height,
		top: y,
		left: x,
		right: x + width,
		bottom: y + height,
		x,
		y
	};
}

//#endregion
//#region ../../node_modules/.pnpm/@floating-ui+core@1.7.3/node_modules/@floating-ui/core/dist/floating-ui.core.mjs
function computeCoordsFromPlacement(_ref, placement, rtl) {
	let { reference, floating } = _ref;
	const sideAxis = getSideAxis(placement);
	const alignmentAxis = getAlignmentAxis(placement);
	const alignLength = getAxisLength(alignmentAxis);
	const side = getSide(placement);
	const isVertical = sideAxis === "y";
	const commonX = reference.x + reference.width / 2 - floating.width / 2;
	const commonY = reference.y + reference.height / 2 - floating.height / 2;
	const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
	let coords;
	switch (side) {
		case "top":
			coords = {
				x: commonX,
				y: reference.y - floating.height
			};
			break;
		case "bottom":
			coords = {
				x: commonX,
				y: reference.y + reference.height
			};
			break;
		case "right":
			coords = {
				x: reference.x + reference.width,
				y: commonY
			};
			break;
		case "left":
			coords = {
				x: reference.x - floating.width,
				y: commonY
			};
			break;
		default: coords = {
			x: reference.x,
			y: reference.y
		};
	}
	switch (getAlignment(placement)) {
		case "start":
			coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
			break;
		case "end":
			coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
			break;
	}
	return coords;
}
/**
* Computes the `x` and `y` coordinates that will place the floating element
* next to a given reference element.
*
* This export does not have any `platform` interface logic. You will need to
* write one for the platform you are using Floating UI with.
*/
var computePosition = async (reference, floating, config) => {
	const { placement = "bottom", strategy = "absolute", middleware = [], platform: platform$1 } = config;
	const validMiddleware = middleware.filter(Boolean);
	const rtl = await (platform$1.isRTL == null ? void 0 : platform$1.isRTL(floating));
	let rects = await platform$1.getElementRects({
		reference,
		floating,
		strategy
	});
	let { x, y } = computeCoordsFromPlacement(rects, placement, rtl);
	let statefulPlacement = placement;
	let middlewareData = {};
	let resetCount = 0;
	for (let i = 0; i < validMiddleware.length; i++) {
		const { name, fn } = validMiddleware[i];
		const { x: nextX, y: nextY, data, reset: reset$1 } = await fn({
			x,
			y,
			initialPlacement: placement,
			placement: statefulPlacement,
			strategy,
			middlewareData,
			rects,
			platform: platform$1,
			elements: {
				reference,
				floating
			}
		});
		x = nextX != null ? nextX : x;
		y = nextY != null ? nextY : y;
		middlewareData = {
			...middlewareData,
			[name]: {
				...middlewareData[name],
				...data
			}
		};
		if (reset$1 && resetCount <= 50) {
			resetCount++;
			if (typeof reset$1 === "object") {
				if (reset$1.placement) statefulPlacement = reset$1.placement;
				if (reset$1.rects) rects = reset$1.rects === true ? await platform$1.getElementRects({
					reference,
					floating,
					strategy
				}) : reset$1.rects;
				({x, y} = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
			}
			i = -1;
		}
	}
	return {
		x,
		y,
		placement: statefulPlacement,
		strategy,
		middlewareData
	};
};
/**
* Resolves with an object of overflow side offsets that determine how much the
* element is overflowing a given clipping boundary on each side.
* - positive = overflowing the boundary by that number of pixels
* - negative = how many pixels left before it will overflow
* - 0 = lies flush with the boundary
* @see https://floating-ui.com/docs/detectOverflow
*/
async function detectOverflow(state, options) {
	var _await$platform$isEle;
	if (options === void 0) options = {};
	const { x, y, platform: platform$1, rects, elements, strategy } = state;
	const { boundary = "clippingAncestors", rootBoundary = "viewport", elementContext = "floating", altBoundary = false, padding = 0 } = evaluate(options, state);
	const paddingObject = getPaddingObject(padding);
	const element = elements[altBoundary ? elementContext === "floating" ? "reference" : "floating" : elementContext];
	const clippingClientRect = rectToClientRect(await platform$1.getClippingRect({
		element: ((_await$platform$isEle = await (platform$1.isElement == null ? void 0 : platform$1.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || await (platform$1.getDocumentElement == null ? void 0 : platform$1.getDocumentElement(elements.floating)),
		boundary,
		rootBoundary,
		strategy
	}));
	const rect = elementContext === "floating" ? {
		x,
		y,
		width: rects.floating.width,
		height: rects.floating.height
	} : rects.reference;
	const offsetParent = await (platform$1.getOffsetParent == null ? void 0 : platform$1.getOffsetParent(elements.floating));
	const offsetScale = await (platform$1.isElement == null ? void 0 : platform$1.isElement(offsetParent)) ? await (platform$1.getScale == null ? void 0 : platform$1.getScale(offsetParent)) || {
		x: 1,
		y: 1
	} : {
		x: 1,
		y: 1
	};
	const elementClientRect = rectToClientRect(platform$1.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform$1.convertOffsetParentRelativeRectToViewportRelativeRect({
		elements,
		rect,
		offsetParent,
		strategy
	}) : rect);
	return {
		top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
		bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
		left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
		right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
	};
}
/**
* Provides data to position an inner element of the floating element so that it
* appears centered to the reference element.
* @see https://floating-ui.com/docs/arrow
*/
var arrow = (options) => ({
	name: "arrow",
	options,
	async fn(state) {
		const { x, y, placement, rects, platform: platform$1, elements, middlewareData } = state;
		const { element, padding = 0 } = evaluate(options, state) || {};
		if (element == null) return {};
		const paddingObject = getPaddingObject(padding);
		const coords = {
			x,
			y
		};
		const axis = getAlignmentAxis(placement);
		const length = getAxisLength(axis);
		const arrowDimensions = await platform$1.getDimensions(element);
		const isYAxis = axis === "y";
		const minProp = isYAxis ? "top" : "left";
		const maxProp = isYAxis ? "bottom" : "right";
		const clientProp = isYAxis ? "clientHeight" : "clientWidth";
		const endDiff = rects.reference[length] + rects.reference[axis] - coords[axis] - rects.floating[length];
		const startDiff = coords[axis] - rects.reference[axis];
		const arrowOffsetParent = await (platform$1.getOffsetParent == null ? void 0 : platform$1.getOffsetParent(element));
		let clientSize = arrowOffsetParent ? arrowOffsetParent[clientProp] : 0;
		if (!clientSize || !await (platform$1.isElement == null ? void 0 : platform$1.isElement(arrowOffsetParent))) clientSize = elements.floating[clientProp] || rects.floating[length];
		const centerToReference = endDiff / 2 - startDiff / 2;
		const largestPossiblePadding = clientSize / 2 - arrowDimensions[length] / 2 - 1;
		const minPadding = min(paddingObject[minProp], largestPossiblePadding);
		const maxPadding = min(paddingObject[maxProp], largestPossiblePadding);
		const min$1 = minPadding;
		const max$1 = clientSize - arrowDimensions[length] - maxPadding;
		const center = clientSize / 2 - arrowDimensions[length] / 2 + centerToReference;
		const offset$1 = clamp(min$1, center, max$1);
		const shouldAddOffset = !middlewareData.arrow && getAlignment(placement) != null && center !== offset$1 && rects.reference[length] / 2 - (center < min$1 ? minPadding : maxPadding) - arrowDimensions[length] / 2 < 0;
		const alignmentOffset = shouldAddOffset ? center < min$1 ? center - min$1 : center - max$1 : 0;
		return {
			[axis]: coords[axis] + alignmentOffset,
			data: {
				[axis]: offset$1,
				centerOffset: center - offset$1 - alignmentOffset,
				...shouldAddOffset && { alignmentOffset }
			},
			reset: shouldAddOffset
		};
	}
});
/**
* Optimizes the visibility of the floating element by flipping the `placement`
* in order to keep it in view when the preferred placement(s) will overflow the
* clipping boundary. Alternative to `autoPlacement`.
* @see https://floating-ui.com/docs/flip
*/
var flip = function(options) {
	if (options === void 0) options = {};
	return {
		name: "flip",
		options,
		async fn(state) {
			var _middlewareData$arrow, _middlewareData$flip;
			const { placement, middlewareData, rects, initialPlacement, platform: platform$1, elements } = state;
			const { mainAxis: checkMainAxis = true, crossAxis: checkCrossAxis = true, fallbackPlacements: specifiedFallbackPlacements, fallbackStrategy = "bestFit", fallbackAxisSideDirection = "none", flipAlignment = true,...detectOverflowOptions } = evaluate(options, state);
			if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) return {};
			const side = getSide(placement);
			const initialSideAxis = getSideAxis(initialPlacement);
			const isBasePlacement = getSide(initialPlacement) === initialPlacement;
			const rtl = await (platform$1.isRTL == null ? void 0 : platform$1.isRTL(elements.floating));
			const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
			const hasFallbackAxisSideDirection = fallbackAxisSideDirection !== "none";
			if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
			const placements$1 = [initialPlacement, ...fallbackPlacements];
			const overflow = await detectOverflow(state, detectOverflowOptions);
			const overflows = [];
			let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
			if (checkMainAxis) overflows.push(overflow[side]);
			if (checkCrossAxis) {
				const sides$1 = getAlignmentSides(placement, rects, rtl);
				overflows.push(overflow[sides$1[0]], overflow[sides$1[1]]);
			}
			overflowsData = [...overflowsData, {
				placement,
				overflows
			}];
			if (!overflows.every((side$1) => side$1 <= 0)) {
				var _middlewareData$flip2, _overflowsData$filter;
				const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
				const nextPlacement = placements$1[nextIndex];
				if (nextPlacement) {
					if (!(checkCrossAxis === "alignment" ? initialSideAxis !== getSideAxis(nextPlacement) : false) || overflowsData.every((d) => getSideAxis(d.placement) === initialSideAxis ? d.overflows[0] > 0 : true)) return {
						data: {
							index: nextIndex,
							overflows: overflowsData
						},
						reset: { placement: nextPlacement }
					};
				}
				let resetPlacement = (_overflowsData$filter = overflowsData.filter((d) => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;
				if (!resetPlacement) switch (fallbackStrategy) {
					case "bestFit": {
						var _overflowsData$filter2;
						const placement$1 = (_overflowsData$filter2 = overflowsData.filter((d) => {
							if (hasFallbackAxisSideDirection) {
								const currentSideAxis = getSideAxis(d.placement);
								return currentSideAxis === initialSideAxis || currentSideAxis === "y";
							}
							return true;
						}).map((d) => [d.placement, d.overflows.filter((overflow$1) => overflow$1 > 0).reduce((acc, overflow$1) => acc + overflow$1, 0)]).sort((a, b) => a[1] - b[1])[0]) == null ? void 0 : _overflowsData$filter2[0];
						if (placement$1) resetPlacement = placement$1;
						break;
					}
					case "initialPlacement":
						resetPlacement = initialPlacement;
						break;
				}
				if (placement !== resetPlacement) return { reset: { placement: resetPlacement } };
			}
			return {};
		}
	};
};
/**
* Optimizes the visibility of the floating element by shifting it in order to
* keep it in view when it will overflow the clipping boundary.
* @see https://floating-ui.com/docs/shift
*/
var shift = function(options) {
	if (options === void 0) options = {};
	return {
		name: "shift",
		options,
		async fn(state) {
			const { x, y, placement } = state;
			const { mainAxis: checkMainAxis = true, crossAxis: checkCrossAxis = false, limiter = { fn: (_ref) => {
				let { x: x$1, y: y$1 } = _ref;
				return {
					x: x$1,
					y: y$1
				};
			} },...detectOverflowOptions } = evaluate(options, state);
			const coords = {
				x,
				y
			};
			const overflow = await detectOverflow(state, detectOverflowOptions);
			const crossAxis = getSideAxis(getSide(placement));
			const mainAxis = getOppositeAxis(crossAxis);
			let mainAxisCoord = coords[mainAxis];
			let crossAxisCoord = coords[crossAxis];
			if (checkMainAxis) {
				const minSide = mainAxis === "y" ? "top" : "left";
				const maxSide = mainAxis === "y" ? "bottom" : "right";
				const min$1 = mainAxisCoord + overflow[minSide];
				const max$1 = mainAxisCoord - overflow[maxSide];
				mainAxisCoord = clamp(min$1, mainAxisCoord, max$1);
			}
			if (checkCrossAxis) {
				const minSide = crossAxis === "y" ? "top" : "left";
				const maxSide = crossAxis === "y" ? "bottom" : "right";
				const min$1 = crossAxisCoord + overflow[minSide];
				const max$1 = crossAxisCoord - overflow[maxSide];
				crossAxisCoord = clamp(min$1, crossAxisCoord, max$1);
			}
			const limitedCoords = limiter.fn({
				...state,
				[mainAxis]: mainAxisCoord,
				[crossAxis]: crossAxisCoord
			});
			return {
				...limitedCoords,
				data: {
					x: limitedCoords.x - x,
					y: limitedCoords.y - y,
					enabled: {
						[mainAxis]: checkMainAxis,
						[crossAxis]: checkCrossAxis
					}
				}
			};
		}
	};
};

//#endregion
//#region ../../node_modules/.pnpm/@floating-ui+utils@0.2.10/node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
function hasWindow() {
	return typeof window !== "undefined";
}
function getNodeName(node) {
	if (isNode(node)) return (node.nodeName || "").toLowerCase();
	return "#document";
}
function getWindow(node) {
	var _node$ownerDocument;
	return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function getDocumentElement(node) {
	var _ref;
	return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
}
function isNode(value) {
	if (!hasWindow()) return false;
	return value instanceof Node || value instanceof getWindow(value).Node;
}
function isElement(value) {
	if (!hasWindow()) return false;
	return value instanceof Element || value instanceof getWindow(value).Element;
}
function isHTMLElement(value) {
	if (!hasWindow()) return false;
	return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
}
function isShadowRoot(value) {
	if (!hasWindow() || typeof ShadowRoot === "undefined") return false;
	return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
}
var invalidOverflowDisplayValues = /* @__PURE__ */ new Set(["inline", "contents"]);
function isOverflowElement(element) {
	const { overflow, overflowX, overflowY, display } = getComputedStyle$1(element);
	return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !invalidOverflowDisplayValues.has(display);
}
var tableElements = /* @__PURE__ */ new Set([
	"table",
	"td",
	"th"
]);
function isTableElement(element) {
	return tableElements.has(getNodeName(element));
}
var topLayerSelectors = [":popover-open", ":modal"];
function isTopLayer(element) {
	return topLayerSelectors.some((selector) => {
		try {
			return element.matches(selector);
		} catch (_e) {
			return false;
		}
	});
}
var transformProperties = [
	"transform",
	"translate",
	"scale",
	"rotate",
	"perspective"
];
var willChangeValues = [
	"transform",
	"translate",
	"scale",
	"rotate",
	"perspective",
	"filter"
];
var containValues = [
	"paint",
	"layout",
	"strict",
	"content"
];
function isContainingBlock(elementOrCss) {
	const webkit = isWebKit();
	const css = isElement(elementOrCss) ? getComputedStyle$1(elementOrCss) : elementOrCss;
	return transformProperties.some((value) => css[value] ? css[value] !== "none" : false) || (css.containerType ? css.containerType !== "normal" : false) || !webkit && (css.backdropFilter ? css.backdropFilter !== "none" : false) || !webkit && (css.filter ? css.filter !== "none" : false) || willChangeValues.some((value) => (css.willChange || "").includes(value)) || containValues.some((value) => (css.contain || "").includes(value));
}
function getContainingBlock(element) {
	let currentNode = getParentNode(element);
	while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
		if (isContainingBlock(currentNode)) return currentNode;
		else if (isTopLayer(currentNode)) return null;
		currentNode = getParentNode(currentNode);
	}
	return null;
}
function isWebKit() {
	if (typeof CSS === "undefined" || !CSS.supports) return false;
	return CSS.supports("-webkit-backdrop-filter", "none");
}
var lastTraversableNodeNames = /* @__PURE__ */ new Set([
	"html",
	"body",
	"#document"
]);
function isLastTraversableNode(node) {
	return lastTraversableNodeNames.has(getNodeName(node));
}
function getComputedStyle$1(element) {
	return getWindow(element).getComputedStyle(element);
}
function getNodeScroll(element) {
	if (isElement(element)) return {
		scrollLeft: element.scrollLeft,
		scrollTop: element.scrollTop
	};
	return {
		scrollLeft: element.scrollX,
		scrollTop: element.scrollY
	};
}
function getParentNode(node) {
	if (getNodeName(node) === "html") return node;
	const result = node.assignedSlot || node.parentNode || isShadowRoot(node) && node.host || getDocumentElement(node);
	return isShadowRoot(result) ? result.host : result;
}
function getNearestOverflowAncestor(node) {
	const parentNode = getParentNode(node);
	if (isLastTraversableNode(parentNode)) return node.ownerDocument ? node.ownerDocument.body : node.body;
	if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) return parentNode;
	return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(node, list, traverseIframes) {
	var _node$ownerDocument2;
	if (list === void 0) list = [];
	if (traverseIframes === void 0) traverseIframes = true;
	const scrollableAncestor = getNearestOverflowAncestor(node);
	const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
	const win = getWindow(scrollableAncestor);
	if (isBody) {
		const frameElement = getFrameElement(win);
		return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
	}
	return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
}
function getFrameElement(win) {
	return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
}

//#endregion
//#region ../../node_modules/.pnpm/@floating-ui+dom@1.7.4/node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function getCssDimensions(element) {
	const css = getComputedStyle$1(element);
	let width = parseFloat(css.width) || 0;
	let height = parseFloat(css.height) || 0;
	const hasOffset = isHTMLElement(element);
	const offsetWidth = hasOffset ? element.offsetWidth : width;
	const offsetHeight = hasOffset ? element.offsetHeight : height;
	const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
	if (shouldFallback) {
		width = offsetWidth;
		height = offsetHeight;
	}
	return {
		width,
		height,
		$: shouldFallback
	};
}
function unwrapElement(element) {
	return !isElement(element) ? element.contextElement : element;
}
function getScale(element) {
	const domElement = unwrapElement(element);
	if (!isHTMLElement(domElement)) return createCoords(1);
	const rect = domElement.getBoundingClientRect();
	const { width, height, $ } = getCssDimensions(domElement);
	let x = ($ ? round(rect.width) : rect.width) / width;
	let y = ($ ? round(rect.height) : rect.height) / height;
	if (!x || !Number.isFinite(x)) x = 1;
	if (!y || !Number.isFinite(y)) y = 1;
	return {
		x,
		y
	};
}
var noOffsets = /* @__PURE__ */ createCoords(0);
function getVisualOffsets(element) {
	const win = getWindow(element);
	if (!isWebKit() || !win.visualViewport) return noOffsets;
	return {
		x: win.visualViewport.offsetLeft,
		y: win.visualViewport.offsetTop
	};
}
function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
	if (isFixed === void 0) isFixed = false;
	if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element)) return false;
	return isFixed;
}
function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
	if (includeScale === void 0) includeScale = false;
	if (isFixedStrategy === void 0) isFixedStrategy = false;
	const clientRect = element.getBoundingClientRect();
	const domElement = unwrapElement(element);
	let scale = createCoords(1);
	if (includeScale) if (offsetParent) {
		if (isElement(offsetParent)) scale = getScale(offsetParent);
	} else scale = getScale(element);
	const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
	let x = (clientRect.left + visualOffsets.x) / scale.x;
	let y = (clientRect.top + visualOffsets.y) / scale.y;
	let width = clientRect.width / scale.x;
	let height = clientRect.height / scale.y;
	if (domElement) {
		const win = getWindow(domElement);
		const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
		let currentWin = win;
		let currentIFrame = getFrameElement(currentWin);
		while (currentIFrame && offsetParent && offsetWin !== currentWin) {
			const iframeScale = getScale(currentIFrame);
			const iframeRect = currentIFrame.getBoundingClientRect();
			const css = getComputedStyle$1(currentIFrame);
			const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
			const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
			x *= iframeScale.x;
			y *= iframeScale.y;
			width *= iframeScale.x;
			height *= iframeScale.y;
			x += left;
			y += top;
			currentWin = getWindow(currentIFrame);
			currentIFrame = getFrameElement(currentWin);
		}
	}
	return rectToClientRect({
		width,
		height,
		x,
		y
	});
}
function getWindowScrollBarX(element, rect) {
	const leftScroll = getNodeScroll(element).scrollLeft;
	if (!rect) return getBoundingClientRect(getDocumentElement(element)).left + leftScroll;
	return rect.left + leftScroll;
}
function getHTMLOffset(documentElement, scroll) {
	const htmlRect = documentElement.getBoundingClientRect();
	const x = htmlRect.left + scroll.scrollLeft - getWindowScrollBarX(documentElement, htmlRect);
	const y = htmlRect.top + scroll.scrollTop;
	return {
		x,
		y
	};
}
function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
	let { elements, rect, offsetParent, strategy } = _ref;
	const isFixed = strategy === "fixed";
	const documentElement = getDocumentElement(offsetParent);
	const topLayer = elements ? isTopLayer(elements.floating) : false;
	if (offsetParent === documentElement || topLayer && isFixed) return rect;
	let scroll = {
		scrollLeft: 0,
		scrollTop: 0
	};
	let scale = createCoords(1);
	const offsets = createCoords(0);
	const isOffsetParentAnElement = isHTMLElement(offsetParent);
	if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
		if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) scroll = getNodeScroll(offsetParent);
		if (isHTMLElement(offsetParent)) {
			const offsetRect = getBoundingClientRect(offsetParent);
			scale = getScale(offsetParent);
			offsets.x = offsetRect.x + offsetParent.clientLeft;
			offsets.y = offsetRect.y + offsetParent.clientTop;
		}
	}
	const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
	return {
		width: rect.width * scale.x,
		height: rect.height * scale.y,
		x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x + htmlOffset.x,
		y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y + htmlOffset.y
	};
}
function getClientRects(element) {
	return Array.from(element.getClientRects());
}
function getDocumentRect(element) {
	const html = getDocumentElement(element);
	const scroll = getNodeScroll(element);
	const body = element.ownerDocument.body;
	const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
	const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
	let x = -scroll.scrollLeft + getWindowScrollBarX(element);
	const y = -scroll.scrollTop;
	if (getComputedStyle$1(body).direction === "rtl") x += max(html.clientWidth, body.clientWidth) - width;
	return {
		width,
		height,
		x,
		y
	};
}
var SCROLLBAR_MAX = 25;
function getViewportRect(element, strategy) {
	const win = getWindow(element);
	const html = getDocumentElement(element);
	const visualViewport = win.visualViewport;
	let width = html.clientWidth;
	let height = html.clientHeight;
	let x = 0;
	let y = 0;
	if (visualViewport) {
		width = visualViewport.width;
		height = visualViewport.height;
		const visualViewportBased = isWebKit();
		if (!visualViewportBased || visualViewportBased && strategy === "fixed") {
			x = visualViewport.offsetLeft;
			y = visualViewport.offsetTop;
		}
	}
	const windowScrollbarX = getWindowScrollBarX(html);
	if (windowScrollbarX <= 0) {
		const doc = html.ownerDocument;
		const body = doc.body;
		const bodyStyles = getComputedStyle(body);
		const bodyMarginInline = doc.compatMode === "CSS1Compat" ? parseFloat(bodyStyles.marginLeft) + parseFloat(bodyStyles.marginRight) || 0 : 0;
		const clippingStableScrollbarWidth = Math.abs(html.clientWidth - body.clientWidth - bodyMarginInline);
		if (clippingStableScrollbarWidth <= SCROLLBAR_MAX) width -= clippingStableScrollbarWidth;
	} else if (windowScrollbarX <= SCROLLBAR_MAX) width += windowScrollbarX;
	return {
		width,
		height,
		x,
		y
	};
}
var absoluteOrFixed = /* @__PURE__ */ new Set(["absolute", "fixed"]);
function getInnerBoundingClientRect(element, strategy) {
	const clientRect = getBoundingClientRect(element, true, strategy === "fixed");
	const top = clientRect.top + element.clientTop;
	const left = clientRect.left + element.clientLeft;
	const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
	const width = element.clientWidth * scale.x;
	const height = element.clientHeight * scale.y;
	const x = left * scale.x;
	const y = top * scale.y;
	return {
		width,
		height,
		x,
		y
	};
}
function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
	let rect;
	if (clippingAncestor === "viewport") rect = getViewportRect(element, strategy);
	else if (clippingAncestor === "document") rect = getDocumentRect(getDocumentElement(element));
	else if (isElement(clippingAncestor)) rect = getInnerBoundingClientRect(clippingAncestor, strategy);
	else {
		const visualOffsets = getVisualOffsets(element);
		rect = {
			x: clippingAncestor.x - visualOffsets.x,
			y: clippingAncestor.y - visualOffsets.y,
			width: clippingAncestor.width,
			height: clippingAncestor.height
		};
	}
	return rectToClientRect(rect);
}
function hasFixedPositionAncestor(element, stopNode) {
	const parentNode = getParentNode(element);
	if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) return false;
	return getComputedStyle$1(parentNode).position === "fixed" || hasFixedPositionAncestor(parentNode, stopNode);
}
function getClippingElementAncestors(element, cache) {
	const cachedResult = cache.get(element);
	if (cachedResult) return cachedResult;
	let result = getOverflowAncestors(element, [], false).filter((el) => isElement(el) && getNodeName(el) !== "body");
	let currentContainingBlockComputedStyle = null;
	const elementIsFixed = getComputedStyle$1(element).position === "fixed";
	let currentNode = elementIsFixed ? getParentNode(element) : element;
	while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
		const computedStyle = getComputedStyle$1(currentNode);
		const currentNodeIsContaining = isContainingBlock(currentNode);
		if (!currentNodeIsContaining && computedStyle.position === "fixed") currentContainingBlockComputedStyle = null;
		if (elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === "static" && !!currentContainingBlockComputedStyle && absoluteOrFixed.has(currentContainingBlockComputedStyle.position) || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode)) result = result.filter((ancestor) => ancestor !== currentNode);
		else currentContainingBlockComputedStyle = computedStyle;
		currentNode = getParentNode(currentNode);
	}
	cache.set(element, result);
	return result;
}
function getClippingRect(_ref) {
	let { element, boundary, rootBoundary, strategy } = _ref;
	const clippingAncestors = [...boundary === "clippingAncestors" ? isTopLayer(element) ? [] : getClippingElementAncestors(element, this._c) : [].concat(boundary), rootBoundary];
	const firstClippingAncestor = clippingAncestors[0];
	const clippingRect = clippingAncestors.reduce((accRect, clippingAncestor) => {
		const rect = getClientRectFromClippingAncestor(element, clippingAncestor, strategy);
		accRect.top = max(rect.top, accRect.top);
		accRect.right = min(rect.right, accRect.right);
		accRect.bottom = min(rect.bottom, accRect.bottom);
		accRect.left = max(rect.left, accRect.left);
		return accRect;
	}, getClientRectFromClippingAncestor(element, firstClippingAncestor, strategy));
	return {
		width: clippingRect.right - clippingRect.left,
		height: clippingRect.bottom - clippingRect.top,
		x: clippingRect.left,
		y: clippingRect.top
	};
}
function getDimensions(element) {
	const { width, height } = getCssDimensions(element);
	return {
		width,
		height
	};
}
function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
	const isOffsetParentAnElement = isHTMLElement(offsetParent);
	const documentElement = getDocumentElement(offsetParent);
	const isFixed = strategy === "fixed";
	const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
	let scroll = {
		scrollLeft: 0,
		scrollTop: 0
	};
	const offsets = createCoords(0);
	function setLeftRTLScrollbarOffset() {
		offsets.x = getWindowScrollBarX(documentElement);
	}
	if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
		if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) scroll = getNodeScroll(offsetParent);
		if (isOffsetParentAnElement) {
			const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
			offsets.x = offsetRect.x + offsetParent.clientLeft;
			offsets.y = offsetRect.y + offsetParent.clientTop;
		} else if (documentElement) setLeftRTLScrollbarOffset();
	}
	if (isFixed && !isOffsetParentAnElement && documentElement) setLeftRTLScrollbarOffset();
	const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
	const x = rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x;
	const y = rect.top + scroll.scrollTop - offsets.y - htmlOffset.y;
	return {
		x,
		y,
		width: rect.width,
		height: rect.height
	};
}
function isStaticPositioned(element) {
	return getComputedStyle$1(element).position === "static";
}
function getTrueOffsetParent(element, polyfill) {
	if (!isHTMLElement(element) || getComputedStyle$1(element).position === "fixed") return null;
	if (polyfill) return polyfill(element);
	let rawOffsetParent = element.offsetParent;
	if (getDocumentElement(element) === rawOffsetParent) rawOffsetParent = rawOffsetParent.ownerDocument.body;
	return rawOffsetParent;
}
function getOffsetParent(element, polyfill) {
	const win = getWindow(element);
	if (isTopLayer(element)) return win;
	if (!isHTMLElement(element)) {
		let svgOffsetParent = getParentNode(element);
		while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
			if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) return svgOffsetParent;
			svgOffsetParent = getParentNode(svgOffsetParent);
		}
		return win;
	}
	let offsetParent = getTrueOffsetParent(element, polyfill);
	while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) offsetParent = getTrueOffsetParent(offsetParent, polyfill);
	if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) return win;
	return offsetParent || getContainingBlock(element) || win;
}
var getElementRects = async function(data) {
	const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
	const getDimensionsFn = this.getDimensions;
	const floatingDimensions = await getDimensionsFn(data.floating);
	return {
		reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
		floating: {
			x: 0,
			y: 0,
			width: floatingDimensions.width,
			height: floatingDimensions.height
		}
	};
};
function isRTL(element) {
	return getComputedStyle$1(element).direction === "rtl";
}
var platform = {
	convertOffsetParentRelativeRectToViewportRelativeRect,
	getDocumentElement,
	getClippingRect,
	getOffsetParent,
	getElementRects,
	getClientRects,
	getDimensions,
	getScale,
	isElement,
	isRTL
};
/**
* Optimizes the visibility of the floating element by shifting it in order to
* keep it in view when it will overflow the clipping boundary.
* @see https://floating-ui.com/docs/shift
*/
var shift$1 = shift;
/**
* Optimizes the visibility of the floating element by flipping the `placement`
* in order to keep it in view when the preferred placement(s) will overflow the
* clipping boundary. Alternative to `autoPlacement`.
* @see https://floating-ui.com/docs/flip
*/
var flip$1 = flip;
/**
* Provides data to position an inner element of the floating element so that it
* appears centered to the reference element.
* @see https://floating-ui.com/docs/arrow
*/
var arrow$1 = arrow;
/**
* Computes the `x` and `y` coordinates that will place the floating element
* next to a given reference element.
*/
var computePosition$1 = (reference, floating, options) => {
	const cache = /* @__PURE__ */ new Map();
	const mergedOptions = {
		platform,
		...options
	};
	const platformWithCache = {
		...mergedOptions.platform,
		_c: cache
	};
	return computePosition(reference, floating, {
		...mergedOptions,
		platform: platformWithCache
	});
};

//#endregion
export { Suspense as A, createUniqueId as B, style as C, For as D, ErrorBoundary as E, createEffect as F, onMount as G, lazy as H, createMemo as I, useContext as J, runWithOwner as K, createRenderEffect as L, createComponent as M, createComputed as N, Match as O, createContext as P, createResource as R, spread as S, use as T, mergeProps as U, getOwner as V, onCleanup as W, render as _, h as a, setProperty$1 as b, Portal as c, getNextElement as d, getNextMarker as f, memo as g, isServer as h, shift$1 as i, Switch as j, Show as k, addEventListener as l, insert as m, computePosition$1 as n, createStore as o, hydrate as p, untrack as q, flip$1 as r, unwrap as s, arrow$1 as t, classList as u, runHydrationEvents as v, template as w, setStyleProperty as x, setAttribute as y, createSignal as z };
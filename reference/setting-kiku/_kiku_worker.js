let ankiConnectAddress = "";
const logger = {
	trace: (...args) => postMessage({ log: {
		level: "trace",
		args
	} }),
	debug: (...args) => postMessage({ log: {
		level: "debug",
		args
	} }),
	info: (...args) => postMessage({ log: {
		level: "info",
		args
	} }),
	warn: (...args) => postMessage({ log: {
		level: "warn",
		args
	} }),
	error: (...args) => postMessage({ log: {
		level: "error",
		args
	} })
};
const AnkiConnect = {
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
	batchFindNotes: async (queries) => {
		return (await AnkiConnect.invoke("multi", { actions: queries.map((query) => ({
			action: "findNotes",
			params: { query }
		})) })).result;
	},
	batchNotesInfo: async (noteIdsList) => {
		return (await AnkiConnect.invoke("multi", { actions: noteIdsList.map((ids) => ({
			action: "notesInfo",
			params: { notes: ids }
		})) })).result;
	},
	queryFieldContains: async ({ kanjiList, readingList, expressionList }) => {
		const noteFilter = `("note:Kiku" OR "note:Lapis")`;
		const kanjiQuery = kanjiList.length === 0 ? null : `${noteFilter} AND (${kanjiList.map((k) => `"Expression:*${k}*"`).join(" OR ")})`;
		const readingQuery = readingList.length === 0 ? null : `${noteFilter} AND (${readingList.map((r) => `"ExpressionReading:${r}"`).join(" OR ")})`;
		const expressionQuery = expressionList.length === 0 ? null : `${noteFilter} AND (${expressionList.map((e) => `"Expression:${e}"`).join(" OR ")})`;
		const queries = [
			kanjiQuery,
			readingQuery,
			expressionQuery
		].filter(Boolean);
		const idsLists = await AnkiConnect.batchFindNotes(queries);
		const allIds = [...new Set(idsLists.flat())];
		const [allNotes] = await AnkiConnect.batchNotesInfo([allIds]);
		const kanjiListResult = {};
		const readingListResult = {};
		const expressionListResult = {};
		for (const k of kanjiList) kanjiListResult[k] = allNotes.filter((n) => n.fields.Expression?.value.includes(k));
		for (const r of readingList) readingListResult[r] = allNotes.filter((n) => n.fields.ExpressionReading?.value === r);
		for (const e of expressionList) expressionListResult[e] = allNotes.filter((n) => n.fields.Expression?.value === e);
		return {
			kanjiListResult,
			readingListResult,
			expressionListResult
		};
	}
};
var Nex = class Nex {
	constructor(payload) {
		this.cache = /* @__PURE__ */ new Map();
		this.chunkCache = /* @__PURE__ */ new Map();
		this.debounceTimer = null;
		this.debounceMs = 200;
		this.pendingQueryShared = [];
		this.init(payload);
	}
	init(payload) {
		logger.debug("init Worker", payload);
		this.assetsPath = payload.assetsPath;
		this.env = payload.env;
		this.config = payload.config;
		this.preferAnkiConnect = payload.preferAnkiConnect;
		ankiConnectAddress = this.config.ankiConnectAddress;
	}
	async query({ kanjiList, readingList, expressionList }) {
		const queryWithNotesCache = async () => {
			const kanjiListResult = {};
			const readingListResult = {};
			const expressionListResult = {};
			const manifest = await this.notesManifest();
			const kanjiSet = new Set(kanjiList);
			const readingSet = new Set(readingList);
			const expressionSet = new Set(expressionList);
			for (const chunk of manifest.chunks) {
				let notes = this.chunkCache.get(chunk.file);
				if (!notes) {
					const res = await fetch(`${this.assetsPath}/${chunk.file}`);
					const text = await Nex.gunzip(res).text();
					notes = JSON.parse(text);
					this.chunkCache.set(chunk.file, notes);
				}
				for (const note of notes) {
					if (note.modelName !== "Kiku" && note.modelName !== "Lapis") continue;
					const expr = note.fields.Expression.value;
					const reading = note.fields.ExpressionReading?.value ?? "";
					for (const kanji of kanjiSet) if (expr.includes(kanji)) {
						kanjiListResult[kanji] ??= [];
						kanjiListResult[kanji].push(note);
					}
					if (readingSet.has(reading)) {
						readingListResult[reading] ??= [];
						readingListResult[reading].push(note);
					}
					if (expressionSet.has(expr)) {
						expressionListResult[expr] ??= [];
						expressionListResult[expr].push(note);
					}
				}
			}
			return {
				kanjiListResult,
				readingListResult,
				expressionListResult
			};
		};
		if (this.preferAnkiConnect) try {
			logger.info("Querying with AnkiConnect");
			return await AnkiConnect.queryFieldContains({
				kanjiList,
				readingList,
				expressionList
			});
		} catch {
			logger.warn("Failed to query with AnkiConnect, falling back to notes cache");
			return await queryWithNotesCache();
		}
		try {
			logger.info("Querying with notes cache");
			return await queryWithNotesCache();
		} catch {
			logger.warn("Failed to query with notes cache, falling back to AnkiConnect");
			return await AnkiConnect.queryFieldContains({
				kanjiList,
				readingList,
				expressionList
			});
		}
	}
	async queryShared({ kanjiList, readingList, expressionList, ankiFields }) {
		return new Promise((resolve) => {
			this.pendingQueryShared.push({
				kanjiList,
				readingList: readingList ?? [],
				expressionList: expressionList ?? [],
				ankiFields,
				resolve
			});
			if (this.debounceTimer) clearTimeout(this.debounceTimer);
			this.debounceTimer = setTimeout(() => {
				this.actualQueryShared();
			}, this.debounceMs);
		});
	}
	async actualQueryShared() {
		const requests = this.pendingQueryShared;
		this.pendingQueryShared = [];
		const batchedKanjiList = [...new Set(requests.flatMap((r) => r.kanjiList))];
		const batchedReadingList = [...new Set(requests.flatMap((r) => r.readingList))];
		const batchedExpressionList = [...new Set(requests.flatMap((r) => r.expressionList))];
		const { kanjiListResult, readingListResult, expressionListResult } = await this.query({
			kanjiList: batchedKanjiList,
			readingList: batchedReadingList,
			expressionList: batchedExpressionList
		});
		for (const req of requests) {
			const { kanjiList, readingList, expressionList, ankiFields } = req;
			const filterSameNote = (note) => {
				if (note.cards.includes(Number(ankiFields.CardID))) return false;
				return true;
			};
			const filterSameExpression = (note) => {
				return note.fields.Expression.value !== ankiFields.Expression;
			};
			const kanjiResult = {};
			for (const kanji of kanjiList) kanjiResult[kanji] = kanjiListResult[kanji]?.filter(filterSameNote).filter(filterSameExpression) ?? [];
			const readingResult = {};
			for (const reading of readingList) readingResult[reading] = readingListResult[reading]?.filter(filterSameNote).filter(filterSameExpression) ?? [];
			const expressionResult = {};
			for (const expression of expressionList) expressionResult[expression] = expressionListResult[expression]?.filter(filterSameNote) ?? [];
			req.resolve({
				kanjiResult,
				readingResult,
				expressionResult
			});
		}
	}
	async lookupKanji(kanji) {
		const key = this.lookupKanji.name;
		const cached = this.cache.get(key);
		let result;
		if (cached) result = cached[kanji];
		else if (this.lookupKanjiPromise) result = (await this.lookupKanjiPromise.promise)[kanji];
		else {
			this.lookupKanjiPromise = Promise.withResolvers();
			const file = (await this.dbMainManifest()).files[this.env.KIKU_DB_KANJI_COMPACT];
			let res = await fetch(`${this.assetsPath}/${this.env.KIKU_DB_MAIN_TAR}`, { headers: { Range: `bytes=${file.start}-${file.end}` } });
			if (res.status === 200) res = Nex.sliceBytes(await res.arrayBuffer(), file.start, file.end);
			else {
				let buf = await res.arrayBuffer();
				if (buf.byteLength > file.size) buf = buf.slice(0, file.size);
				res = new Response(buf);
			}
			const text = await Nex.gunzip(res).text();
			const dbKanjiCompact = JSON.parse(text);
			const dbKanji = {};
			for (const kanji$1 of Object.keys(dbKanjiCompact)) {
				const data = Nex.fromCompact(dbKanjiCompact[kanji$1]);
				if (data) dbKanji[kanji$1] = data;
			}
			this.cache.set(key, dbKanji);
			this.lookupKanjiPromise.resolve(dbKanji);
			result = dbKanji[kanji];
		}
		return result;
	}
	async dbMainManifest() {
		const key = this.dbMainManifest.name;
		if (this.cache.has(key)) return this.cache.get(key);
		const res = await fetch(`${this.assetsPath}/${this.env.KIKU_DB_MAIN_MANIFEST_JSON}`);
		if (!res.ok) {
			logger.error("Failed to load db main manifest");
			throw new Error(`Failed to load db main manifest`);
		}
		const manifest = await res.json();
		this.cache.set(key, manifest);
		return manifest;
	}
	async notesManifest() {
		const key = this.notesManifest.name;
		if (this.cache.has(key)) return this.cache.get(key);
		const res = await fetch(`${this.assetsPath}/${this.env.KIKU_NOTES_MANIFEST}`);
		if (!res.ok) {
			logger.error("Failed to load manifest");
			throw new Error(`Failed to load manifest`);
		}
		const manifest = await res.json();
		this.cache.set(key, manifest);
		return manifest;
	}
	static fromCompact(c) {
		if (!c) return void 0;
		return {
			composedOf: c[0],
			usedIn: c[1],
			wkMeaning: c[2],
			meanings: c[3],
			keyword: c[4],
			readings: c[5],
			frequency: c[6],
			kind: c[7],
			visuallySimilar: c[8],
			related: c[9]
		};
	}
	static gunzip(res) {
		if (!res.body) {
			logger.error("No body for", res.url);
			throw new Error(`No body for ${res.url}`);
		}
		const ds = new DecompressionStream("gzip");
		const decompressed = res.body.pipeThrough(ds);
		return new Response(decompressed);
	}
	static sliceBytes(buf, start, end) {
		const slice = buf.slice(start, end + 1);
		return new Response(slice);
	}
};
function expose(api) {
	self.onmessage = async (e) => {
		const { id, fn, args } = e.data;
		let result;
		try {
			const maybeFn = api[fn];
			if (typeof maybeFn === "function") result = await maybeFn(...args);
			else result = maybeFn;
			postMessage({
				id,
				result
			});
		} catch (error) {
			postMessage({
				id,
				error
			});
		}
	};
}
let nex;
expose({
	async init(payload) {
		if (nex) nex.init(payload);
		else nex = new Nex(payload);
	},
	notesManifest: () => nex.notesManifest(),
	query: (...args) => nex.query(...args),
	queryShared: (...args) => nex.queryShared(...args),
	lookupKanji: (...args) => nex.lookupKanji(...args)
});

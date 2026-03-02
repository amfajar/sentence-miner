/**
 * SentenceMiner — frontend application logic
 * Communicates with the Python backend via window.pywebview.api
 */

'use strict';

// ── State ─────────────────────────────────────────────────────────────────────
let settings = {};
let isRunning = false;
let logCount = 0;
const MAX_LOG_ENTRIES = 500;
let scanItems = [];  // cached scan result items

const state = {
    mediaPath: null,   // video or audio file
    srtPath: null,
    epubPath: null,
    inputType: 'media',
};

// Debounce timer for settings save
let saveTimer = null;

// ── Init ──────────────────────────────────────────────────────────────────────
window.addEventListener('pywebviewready', async () => {
    // 1. Setup UI components
    setupTabs();
    setupSourceTabs();
    setupDropZones();
    setupSlider();
    setupSettingsListeners();

    // 2. Load saved settings from disk (quick local copy)
    settings = await window.pywebview.api.get_settings();
    applySettingsToUI(settings);

    // 3. Initialize backend (slow part: dicts, anki connection)
    const initResult = await window.pywebview.api.initialize();

    // 4. Update settings with full state from backend
    if (initResult && initResult.settings) {
        Object.assign(settings, initResult.settings);
        applySettingsToUI(settings);
    }

    // 5. Update UI (anki status, dropdowns)
    updateAnkiStatus(initResult);
});

// ── Tab navigation ─────────────────────────────────────────────────────────────
function setupTabs() {
    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${tab}`).classList.add('active');
        });
    });
}

// ── Source type tabs ───────────────────────────────────────────────────────────
function setupSourceTabs() {
    document.querySelectorAll('.source-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const src = btn.dataset.source;
            state.inputType = src;
            document.querySelectorAll('.source-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('media-section').classList.toggle('hidden', src !== 'media');
            document.getElementById('youtube-section').classList.toggle('hidden', src !== 'youtube');
            document.getElementById('epub-section').classList.toggle('hidden', src !== 'epub');
        });
    });
}

// ── Drop zones ─────────────────────────────────────────────────────────────────
function setupDropZones() {
    setupDropZone('media-drop', [
        'Video Files (*.mp4;*.mkv;*.avi;*.mov;*.webm)',
        'Audio Files (*.mp3;*.wav;*.m4a;*.ogg;*.flac;*.aac;*.opus;*.wma)',
        'All Files (*.*)',
    ], (path) => {
        state.mediaPath = path;
        showFileInZone('media-drop', path);
        // Show hint if audio-only
        const isAudio = /\.(mp3|wav|m4a|ogg|flac|aac|opus|wma)$/i.test(path);
        const hint = document.getElementById('media-type-hint');
        if (hint) {
            hint.textContent = isAudio
                ? '🎵 Audio file — no screenshot/picture will be extracted.'
                : '';
        }
    });

    setupDropZone('srt-drop', ['Subtitle Files (*.srt;*.ass)'], (path) => {
        state.srtPath = path;
        const name = path.split(/[\\\/]/).pop();
        const titleEl = document.querySelector('#srt-drop .drop-title-sm');
        const hintEl = document.querySelector('#srt-drop .drop-hint-sm');
        if (titleEl) titleEl.textContent = name;
        if (hintEl) hintEl.textContent = '';
        document.getElementById('srt-drop').classList.add('has-file');
    });

    setupDropZone('epub-drop', ['EPUB Files (*.epub)', 'Text Files (*.txt)', 'All Files (*.*)'], (path) => {
        state.epubPath = path;
        showFileInZone('epub-drop', path);
    });
}

function setupDropZone(id, fileTypes, onSelect) {
    const zone = document.getElementById(id);
    if (!zone) return;

    zone.addEventListener('click', async () => {
        const path = await window.pywebview.api.pick_file(fileTypes);
        if (path) onSelect(path);
    });

    zone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') zone.click();
    });

    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.path) onSelect(file.path);
    });
}

function showFileInZone(id, path) {
    const zone = document.getElementById(id);
    if (!zone) return;
    const name = path.split(/[\\\/]/).pop();
    const titleEl = zone.querySelector('.drop-title');
    const hintEl = zone.querySelector('.drop-hint');
    if (titleEl) titleEl.textContent = name;
    if (hintEl) hintEl.textContent = '';
    zone.classList.add('has-file');
}

// ── Frequency slider ───────────────────────────────────────────────────────────
function setupSlider() {
    const slider = document.getElementById('freq-slider');
    const display = document.getElementById('freq-display');
    const hint = document.getElementById('freq-hint');

    slider.addEventListener('input', () => {
        const val = parseInt(slider.value);
        display.textContent = val.toLocaleString();
        hint.textContent = `Mining words ranked 1–${val.toLocaleString()} (higher = more words)`;
        settings.freq_threshold = val;
        scheduleSave();
    });

    slider.addEventListener('change', () => {
        settings.freq_threshold = parseInt(slider.value);
        scheduleSave();
    });
}

// ── Settings UI ────────────────────────────────────────────────────────────────
function setupSettingsListeners() {
    const bindings = [
        ['s-ankiconnect-url', 'ankiconnect_url'],
        ['s-note-type', 'note_type'],
        ['s-deck-name', 'deck_name'],
        ['s-padding', 'clip_padding_ms', parseInt],
        ['s-temp-dir', 'temp_dir'],
    ];

    bindings.forEach(([id, key, transform]) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', () => {
            settings[key] = transform ? transform(el.value) : el.value;
            scheduleSave();
        });
    });

    document.getElementById('tags-input').addEventListener('input', (e) => {
        settings.tags = e.target.value.trim().split(/\s+/).filter(Boolean);
        scheduleSave();
    });

    document.getElementById('deck-select').addEventListener('change', (e) => {
        settings.deck_name = e.target.value;
        scheduleSave();
    });

    document.getElementById('model-select').addEventListener('change', (e) => {
        settings.note_type = e.target.value;
        scheduleSave();
    });

    // Toggle: Word Audio
    document.getElementById('toggle-word-audio').addEventListener('change', (e) => {
        settings.use_word_audio = e.target.checked;
        scheduleSave();
    });

    // Toggle: Allow Duplicates
    document.getElementById('toggle-allow-dupes').addEventListener('change', (e) => {
        settings.allow_duplicates = e.target.checked;
        scheduleSave();
    });
}

function applySettingsToUI(s) {
    setValue('s-ankiconnect-url', s.ankiconnect_url || 'http://localhost:8765');
    setValue('s-note-type', s.note_type || 'Lapis');
    setValue('s-deck-name', s.deck_name || 'Mining');
    setValue('s-padding', s.clip_padding_ms ?? 500);
    setValue('s-temp-dir', s.temp_dir || './media_temp');
    setValue('tags-input', (s.tags || ['sentence-miner']).join(' '));

    const threshold = s.freq_threshold || 10000;
    const slider = document.getElementById('freq-slider');
    if (slider) slider.value = threshold;
    const display = document.getElementById('freq-display');
    if (display) display.textContent = threshold.toLocaleString();
    const hint = document.getElementById('freq-hint');
    if (hint) hint.textContent = `Mining words ranked 1–${threshold.toLocaleString()} (higher = more words)`;

    // Update dictionary displays
    if (s.jitendex_path) {
        const name = s.jitendex_path.split(/[\\\/]/).pop();
        setFileDisplay('jitendex-display', name);
    }
    if (s.freq_dict_path) {
        const name = s.freq_dict_path.split(/[\\\/]/).pop();
        setFileDisplay('freq-display-path', name);
    }

    // Toggles
    const wordAudioEl = document.getElementById('toggle-word-audio');
    if (wordAudioEl) wordAudioEl.checked = s.use_word_audio !== false; // default true

    const allowDupesEl = document.getElementById('toggle-allow-dupes');
    if (allowDupesEl) allowDupesEl.checked = s.allow_duplicates === true; // default false
}

function setValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}

function setFileDisplay(id, text) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = text;
        el.classList.add('has-file');
    }
}

function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
        await window.pywebview.api.save_settings(settings);
    }, 500);
}

// ── Anki status ────────────────────────────────────────────────────────────────
function updateAnkiStatus(result) {
    const dot = document.querySelector('#anki-status .status-dot');
    const text = document.querySelector('#anki-status .status-text');

    if (result && result.ok) {
        dot.className = 'status-dot connected';
        text.textContent = `Connected · ${(result.known_count || 0).toLocaleString()} known`;

        // Populate dropdowns — preferred values are from the LOADED settings
        if (result.decks) populateSelect('deck-select', result.decks, settings.deck_name);
        if (result.models) populateSelect('model-select', result.models, settings.note_type);
    } else {
        dot.className = 'status-dot error';
        text.textContent = result?.error || 'Anki not detected';
    }
}

function populateSelect(id, items, currentValue) {
    const select = document.getElementById(id);
    if (!select) return;
    const prev = select.value || currentValue;
    select.innerHTML = '';
    items.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item;
        opt.textContent = item;
        if (item === prev) opt.selected = true;
        select.appendChild(opt);
    });
    if (prev && !select.value) {
        const fallback = document.createElement('option');
        fallback.value = prev;
        fallback.textContent = prev;
        fallback.selected = true;
        select.insertBefore(fallback, select.firstChild);
    }
}

// ── Test AnkiConnect ───────────────────────────────────────────────────────────
async function testAnki() {
    const btn = document.getElementById('test-anki-btn');
    const resultEl = document.getElementById('test-result');
    btn.textContent = 'Testing…';
    btn.className = 'test-btn';
    resultEl.classList.add('hidden');

    const url = document.getElementById('s-ankiconnect-url').value.trim();
    settings.ankiconnect_url = url;

    const result = await window.pywebview.api.test_anki_connection();
    if (result.ok) {
        btn.textContent = `✓ Connected · ${result.known_count.toLocaleString()} cards`;
        btn.className = 'test-btn success';
        resultEl.classList.add('hidden');
        if (result.decks) populateSelect('deck-select', result.decks, settings.deck_name);
        if (result.models) populateSelect('model-select', result.models, settings.note_type);
        updateAnkiStatus(result);
    } else {
        btn.textContent = '✗ Not connected';
        btn.className = 'test-btn error';
        resultEl.textContent = result.error || 'Check that Anki is open with AnkiConnect installed.';
        resultEl.classList.remove('hidden');
    }
}

// ── Dictionary import ──────────────────────────────────────────────────────────
async function importDictionary(type) {
    const path = await window.pywebview.api.pick_file(['Zip Files (*.zip)']);
    if (!path) return;

    const btnId = type === 'jitendex' ? 'jitendex-btn' : 'freq-dict-btn';
    const displayId = type === 'jitendex' ? 'jitendex-display' : 'freq-display-path';
    const btn = document.getElementById(btnId);
    btn.textContent = 'Importing…';

    const result = await window.pywebview.api.import_dictionary(path, type);
    if (result.ok) {
        const name = result.path.split(/[\\\/]/).pop();
        setFileDisplay(displayId, name);
        settings[type === 'jitendex' ? 'jitendex_path' : 'freq_dict_path'] = result.path;
        btn.textContent = 'Re-import';
        addLogEntry('info', null, null, `Imported ${type === 'jitendex' ? 'Jitendex' : 'JPDB freq'}: ${name}`);
    } else {
        showError(`Import failed: ${result.error}`);
        btn.textContent = 'Import';
    }
}

// ── Clear Anki cache ───────────────────────────────────────────────────────────
async function clearAnkiCache() {
    const btn = document.getElementById('clear-cache-btn');
    const resultEl = document.getElementById('clear-cache-result');
    btn.textContent = 'Clearing…';
    btn.disabled = true;
    resultEl.classList.add('hidden');

    const result = await window.pywebview.api.clear_anki_cache();

    btn.textContent = '🗑 Clear Cache';
    btn.disabled = false;
    resultEl.textContent = result.ok ? result.msg : `Error: ${result.error}`;
    resultEl.className = `test-result ${result.ok ? 'success' : 'error'}`;
    resultEl.classList.remove('hidden');
}

// ── Create New Deck ────────────────────────────────────────────────────────────
async function createDeck() {
    const input = document.getElementById('new-deck-input');
    const btn = document.getElementById('new-deck-btn');
    const resultEl = document.getElementById('new-deck-result');
    const name = input.value.trim();

    if (!name) {
        resultEl.textContent = 'Enter a deck name first.';
        resultEl.className = 'test-result error';
        resultEl.classList.remove('hidden');
        return;
    }

    btn.textContent = 'Creating…';
    btn.disabled = true;
    resultEl.classList.add('hidden');

    const result = await window.pywebview.api.create_deck(name);

    btn.textContent = 'Create';
    btn.disabled = false;

    if (result.ok) {
        resultEl.textContent = `Deck "${name}" created and selected.`;
        resultEl.className = 'test-result success';
        resultEl.classList.remove('hidden');
        input.value = '';
        // Refresh dropdown and select new deck
        if (result.decks) {
            populateSelect('deck-select', result.decks, name);
        }
        settings.deck_name = name;
        scheduleSave();
        // Also update the deck name in settings tab
        setValue('s-deck-name', name);
        addLogEntry('info', null, null, `Deck created: ${name}`);
    } else {
        resultEl.textContent = `Error: ${result.error}`;
        resultEl.className = 'test-result error';
        resultEl.classList.remove('hidden');
    }
}

// ── Progress handler (called from Python via evaluate_js) ──────────────────────
function onProgress(data) {
    switch (data.type) {
        case 'status':
            addLogEntry('info', null, null, data.msg);
            if (data.known_count !== undefined) updateAnkiStatus(data);
            break;
        case 'progress':
            updateStats(data.added, data.skipped_known, data.skipped_freq);
            updateProgressBar(data.processed, data.total, data.current_word, data.current_reading);
            break;
        case 'log':
            addLogEntry(data.badge, data.word, data.reading, data.detail, data.rank);
            break;
        case 'done':
            onProcessingDone(data);
            break;
        case 'error':
            onProcessingError(data.msg);
            break;
        case 'stopped':
            onProcessingStopped();
            break;
    }
}

function updateStats(added, known, freq) {
    setText('stat-added', added ?? 0);
    setText('stat-known', known ?? 0);
    setText('stat-freq', freq ?? 0);
}

function updateProgressBar(processed, total, word, reading) {
    showElement('active-progress');
    hideElement('idle-state');
    hideElement('done-banner');

    const pct = total > 0 ? (processed / total * 100).toFixed(1) : 0;
    const fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = `${pct}%`;

    const track = document.getElementById('progress-bar-track');
    if (track) track.setAttribute('aria-valuenow', pct);

    setText('progress-word', word || '—');
    setText('progress-reading', reading || '');
    setText('progress-count', `${processed.toLocaleString()} / ${total.toLocaleString()}`);
}

function onProcessingDone(data) {
    isRunning = false;
    resetStartButton();
    hideElement('active-progress');

    const doneEl = document.getElementById('done-banner');
    const doneText = document.getElementById('done-text');
    if (doneEl && doneText) {
        doneText.textContent = data.msg ||
            `Done — ${data.added} cards added · ${data.skipped_known} already known · ${data.skipped_freq || 0} too rare`;
        doneEl.classList.remove('hidden');
    }
    updateStats(data.added, data.skipped_known, data.skipped_freq);
    addLogEntry('info', null, null,
        `✓ Finished: ${data.added} added, ${data.skipped_known} known, ${data.skipped_freq || 0} freq-skip`);
}

function onProcessingError(msg) {
    isRunning = false;
    resetStartButton();
    hideElement('active-progress');
    showError(msg, true);
    addLogEntry('error', null, null, msg);
}

function onProcessingStopped() {
    isRunning = false;
    resetStartButton();
    hideElement('active-progress');
    showElement('idle-state');
    addLogEntry('info', null, null, 'Processing stopped by user.');
}

// ── Log feed ───────────────────────────────────────────────────────────────────
function addLogEntry(badge, word, reading, detail, rank) {
    const feed = document.getElementById('log-feed');
    if (!feed) return;

    if (logCount >= MAX_LOG_ENTRIES) {
        feed.removeChild(feed.firstChild);
    }

    const now = new Date();
    const time = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const entry = document.createElement('div');
    entry.className = 'log-entry';

    let html = `<span class="log-time">${time}</span>`;
    html += `<span class="log-badge ${badge || 'info'}">${(badge || 'info').toUpperCase()}</span>`;
    if (word) html += `<span class="log-word jp-text">${escapeHtml(word)}</span>`;
    if (reading) html += `<span class="log-reading jp-text">${escapeHtml(reading)}</span>`;
    if (detail) html += `<span class="log-detail">${escapeHtml(String(detail))}</span>`;
    if (rank != null) html += `<span class="log-rank">rank ${Number(rank).toLocaleString()}</span>`;

    entry.innerHTML = html;
    feed.appendChild(entry);
    feed.scrollTop = feed.scrollHeight;
    logCount++;
}

function clearLog() {
    const feed = document.getElementById('log-feed');
    if (feed) feed.innerHTML = '';
    logCount = 0;
}

// ── Start / Stop ───────────────────────────────────────────────────────────────
async function handleStartStop() {
    if (isRunning) {
        await window.pywebview.api.stop_processing();
        return;
    }

    const payload = buildPayload();
    if (!payload) return;

    // Read current deck/model from dropdowns
    const deckEl = document.getElementById('deck-select');
    const modelEl = document.getElementById('model-select');
    if (deckEl && deckEl.value) settings.deck_name = deckEl.value;
    if (modelEl && modelEl.value) settings.note_type = modelEl.value;
    await window.pywebview.api.save_settings(settings);

    isRunning = true;
    const btn = document.getElementById('start-btn');
    if (btn) {
        btn.querySelector('.btn-icon').textContent = '⏹';
        btn.querySelector('.btn-text').textContent = 'Stop';
        btn.classList.add('running');
    }

    resetProgressUI();
    addLogEntry('info', null, null, `Starting ${state.inputType} processing…`);

    window.pywebview.api.start_processing(payload);
}

function buildPayload() {
    const type = state.inputType;
    const payload = { input_type: type };

    if (type === 'media') {
        if (!state.mediaPath) { showError('Please select a media file (video or audio).'); return null; }
        if (!state.srtPath) { showError('Please select a subtitle file (.srt or .ass).'); return null; }
        payload.media_path = state.mediaPath;
        payload.srt_path = state.srtPath;
        const offsetSec = parseFloat(document.getElementById('sub-offset')?.value || '0') || 0;
        payload.sub_offset_ms = Math.round(offsetSec * 1000);
    } else if (type === 'youtube') {
        const url = document.getElementById('yt-url-input').value.trim();
        if (!url.startsWith('http')) { showError('Please enter a valid YouTube URL.'); return null; }
        payload.youtube_url = url;
    } else if (type === 'epub') {
        if (!state.epubPath) { showError('Please select an EPUB or TXT file.'); return null; }
        payload.epub_path = state.epubPath;
        const charStart = parseInt(document.getElementById('epub-char-start').value) || 0;
        const charEndVal = document.getElementById('epub-char-end').value.trim();
        payload.char_start = charStart;
        payload.char_end = charEndVal ? parseInt(charEndVal) : null;
    }

    return payload;
}

function resetStartButton() {
    const btn = document.getElementById('start-btn');
    if (btn) {
        btn.querySelector('.btn-icon').textContent = '⚡';
        btn.querySelector('.btn-text').textContent = 'Start Mining';
        btn.classList.remove('running');
    }
}

function resetProgressUI() {
    updateStats(0, 0, 0);
    hideElement('idle-state');
    hideElement('done-banner');
    showElement('active-progress');
    const fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = '0%';
    setText('progress-word', '—');
    setText('progress-reading', '');
    setText('progress-count', '');
}

// ── Error display ──────────────────────────────────────────────────────────────
let errorTimer = null;
function showError(msg, sticky = false) {
    const banner = document.getElementById('error-banner');
    const msgEl = document.getElementById('error-msg');
    if (!banner || !msgEl) return;
    msgEl.textContent = msg;
    banner.classList.remove('hidden');
    clearTimeout(errorTimer);
    if (!sticky) {
        errorTimer = setTimeout(dismissError, 10000);
    }
}

function dismissError() {
    const banner = document.getElementById('error-banner');
    if (banner) banner.classList.add('hidden');
}

// ── DOM helpers ────────────────────────────────────────────────────────────────
function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}
function showElement(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
}
function hideElement(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
}

// ── Furigana HTML builder ──────────────────────────────────────────────────────
function buildSentenceHtml(sentence, tokens, targetLemma) {
    if (!tokens || tokens.length === 0) return escapeHtml(sentence);

    const sorted = [...tokens].sort((a, b) => a.start - b.start);

    const HAS_KANJI = /[\u4E00-\u9FFF\u3400-\u4DBF]/;
    const IS_KANA = /[\u3040-\u30FF]/;

    function alignFurigana(surface, reading) {
        const segs = [];
        let lPos = 0, rPos = 0;
        while (lPos < surface.length) {
            const ch = surface[lPos];
            if (IS_KANA.test(ch)) {
                if (rPos < reading.length && reading[rPos] === ch) rPos++;
                segs.push({ s: ch, r: '' });
                lPos++;
            } else {
                const kStart = lPos;
                while (lPos < surface.length && !IS_KANA.test(surface[lPos])) lPos++;
                const kanjiRun = surface.slice(kStart, lPos);
                let kanjiReading;
                if (lPos < surface.length) {
                    const nextKana = surface[lPos];
                    const found = reading.indexOf(nextKana, rPos + 1);
                    if (found === -1) {
                        kanjiReading = reading.slice(rPos);
                        rPos = reading.length;
                    } else {
                        kanjiReading = reading.slice(rPos, found);
                        rPos = found;
                    }
                } else {
                    kanjiReading = reading.slice(rPos);
                    rPos = reading.length;
                }
                segs.push({ s: kanjiRun, r: kanjiReading });
            }
        }
        return segs;
    }

    function rubyHtml(surface, reading) {
        if (!HAS_KANJI.test(surface)) return escapeHtml(surface);
        const segs = alignFurigana(surface, reading);
        return segs.map(({ s, r }) =>
            r ? `<ruby>${escapeHtml(s)}<rt>${escapeHtml(r)}</rt></ruby>`
                : escapeHtml(s)
        ).join('');
    }

    let parts = [];
    let pos = 0;

    for (const tok of sorted) {
        if (tok.start < pos) continue;
        if (tok.start > pos) parts.push(escapeHtml(sentence.slice(pos, tok.start)));

        const ruby = rubyHtml(tok.surface, tok.reading);
        if (tok.lemma === targetLemma) {
            parts.push(`<b>${ruby}</b>`);
        } else {
            parts.push(ruby);
        }
        pos = tok.end;
    }

    if (pos < sentence.length) parts.push(escapeHtml(sentence.slice(pos)));
    return parts.join('');
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ── Wire up start button ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('start-btn');
    if (btn) btn.addEventListener('click', handleStartStop);
});

// ── Scan & Preview ─────────────────────────────────────────────────────────────
async function handleScan() {
    if (isRunning) return;
    const payload = buildPayload();
    if (!payload) return;

    const btn = document.getElementById('scan-btn');
    btn.querySelector('.btn-text').textContent = 'Scanning…';
    btn.disabled = true;
    hideElement('preview-panel');

    addLogEntry('info', null, null, 'Scanning for candidate vocabulary…');

    try {
        const result = await window.pywebview.api.scan_candidates(payload);
        btn.querySelector('.btn-text').textContent = 'Scan';
        btn.disabled = false;

        if (!result.ok) {
            showError(`Scan failed: ${result.error}`);
            addLogEntry('error', null, null, `Scan error: ${result.error}`);
            return;
        }

        scanItems = result.items;
        addLogEntry('info', null, null, `Scan complete — ${result.total} candidate words found.`);
        renderPreview(result.items);
    } catch (e) {
        btn.querySelector('.btn-text').textContent = 'Scan';
        btn.disabled = false;
        showError(`Scan error: ${e}`);
    }
}

function renderPreview(items) {
    const list = document.getElementById('candidate-list');
    const countEl = document.getElementById('preview-count');
    if (!list) return;

    countEl.textContent = `${items.length} words`;
    list.innerHTML = '';

    items.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'candidate-row';
        row.id = `cand-${idx}`;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = item.definition;

        const glossItems = Array.from(tempDiv.querySelectorAll('li.gloss-sc-li'));
        const cleanGlosses = glossItems
            .map(li => {
                const clone = li.cloneNode(true);
                clone.querySelectorAll('.sense-note, .badge, sup, .info').forEach(el => el.remove());
                return clone.textContent.trim();
            })
            .filter(t => t.length > 0 && t.length < 50 && !/[ぁ-ん]|[ァ-ン]|[一-龯]/.test(t));

        let shortDef;
        if (cleanGlosses.length > 0) {
            shortDef = cleanGlosses.slice(0, 3).join(' · ');
        } else {
            const plain = tempDiv.textContent || '';
            shortDef = plain.replace(/\s+/g, ' ').trim().slice(0, 80);
        }

        const rankBadge = item.rank ? `<span class="cand-rank">#${item.rank.toLocaleString()}</span>` : '';
        const sentenceHtml = buildSentenceHtml(item.sentence, item.sentence_tokens, item.lemma);

        row.innerHTML = `
            <div class="cand-main">
                <span class="cand-word jp-text">${escapeHtml(item.lemma)}</span>
                <span class="cand-reading jp-text">${escapeHtml(item.reading)}</span>
                ${rankBadge}
            </div>
            <div class="cand-def">${escapeHtml(shortDef)}</div>
            <div class="cand-sentence jp-text">${sentenceHtml}</div>
        `;

        const addBtn = document.createElement('button');
        addBtn.className = 'add-single-btn';
        addBtn.textContent = '+ Add';
        addBtn.dataset.lemma = item.lemma;
        addBtn.addEventListener('click', () => addSingleCard(item.lemma, addBtn));
        row.appendChild(addBtn);

        list.appendChild(row);
    });

    showElement('preview-panel');
}

async function addSingleCard(lemma, btn) {
    btn.textContent = '…';
    btn.disabled = true;
    try {
        const result = await window.pywebview.api.add_single_card(lemma);
        if (result.ok) {
            btn.textContent = '✓ Added';
            btn.classList.add('added');
            addLogEntry('added', lemma, null, 'Added via preview');
        } else {
            btn.textContent = result.error.includes('Duplicate') ? '↩ Dupe' : '✗ Fail';
            btn.classList.add('failed');
            btn.disabled = false;
            addLogEntry('skip', lemma, null, result.error);
        }
    } catch (e) {
        btn.textContent = '✗ Fail';
        btn.disabled = false;
    }
}

async function mineAll() {
    const mineBtn = document.getElementById('mine-all-btn');
    mineBtn.textContent = 'Mining…';
    mineBtn.disabled = true;

    const payload = buildPayload();
    if (!payload) {
        mineBtn.textContent = '⚡ Mine All';
        mineBtn.disabled = false;
        return;
    }

    hideElement('preview-panel');
    await handleStartStop();

    mineBtn.textContent = '⚡ Mine All';
    mineBtn.disabled = false;
}

function hidePreview() {
    hideElement('preview-panel');
}

async function detectEpubLength() {
    if (!state.epubPath) {
        showError('Please select an EPUB or TXT file first.');
        return;
    }
    const btn = document.getElementById('epub-detect-btn');
    btn.textContent = '…';
    btn.disabled = true;

    const result = await window.pywebview.api.get_epub_char_count(state.epubPath);
    btn.textContent = 'Detect';
    btn.disabled = false;

    if (result.ok) {
        const hint = document.getElementById('epub-char-hint');
        if (hint) hint.textContent = `Total length: ${result.count.toLocaleString()} characters.`;
    } else {
        showError(`Could not detect length: ${result.error}`);
    }
}

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
    batchPath: null,
    batchPairs: [],
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
    setupBatchFolder();
    setupSlider();
    setupSettingsListeners();

    // 2. Load saved settings from disk (quick local copy)
    settings = await window.pywebview.api.get_settings();
    applySettingsToUI(settings);

    // 3. Check if SudachiDict is installed — if not, show first-run setup overlay
    const sudachiStatus = await window.pywebview.api.check_sudachi();
    if (!sudachiStatus.installed) {
        // Show overlay and wait — initialize() will be called by sudachi flow on completion
        document.getElementById('sudachi-overlay').classList.remove('hidden');
        return; // Don't call initialize() yet — sudachi setup will do it
    }

    // 4. Initialize backend (slow part: dicts, anki connection)
    await doInitialize();
});

async function doInitialize() {
    const initResult = await window.pywebview.api.initialize();

    // Update settings with full state from backend
    if (initResult && initResult.settings) {
        Object.assign(settings, initResult.settings);
        applySettingsToUI(settings);
    }

    // Update UI (anki status, dropdowns)
    updateAnkiStatus(initResult);
}

// ── Tab navigation ─────────────────────────────────────────────────────────────
function setupTabs() {
    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${tab}`).classList.add('active');
            // Backfill: re-check Yomitan every time user switches to this tab
            if (tab === 'backfill') {
                initBackfillTab();
            } else {
                // Hide Yomitan banner when not on Backfill tab
                const banner = document.getElementById('bf-yomitan-banner');
                if (banner) banner.classList.add('hidden');
            }
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
            document.getElementById('batch-section').classList.toggle('hidden', src !== 'batch');
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

function setupBatchFolder() {
    const btn = document.getElementById('batch-pick-btn');
    console.log("[Batch] setupBatchFolder called. btn found:", !!btn);
    if (!btn) return;

    btn.addEventListener('click', async () => {
        console.log("[Batch] pick folder button clicked!");
        try {
            const folder = await window.pywebview.api.pick_folder();
            console.log("[Batch] pick_folder returned:", folder);
            if (folder) {
                btn.textContent = 'Scanning…';
                btn.disabled = true;
                try {
                    const res = await window.pywebview.api.scan_folder_for_pairs(folder);
                    console.log("[Batch] scan result:", res);
                    if (!res.ok) {
                        showError(res.error);
                        return;
                    }

                    state.batchPath = res.folder;
                    state.batchPairs = res.pairs;

                    document.getElementById('batch-empty').classList.add('hidden');
                    document.getElementById('batch-pairs-container').classList.remove('hidden');

                    const list = document.getElementById('batch-pairs-list');
                    list.innerHTML = '';

                    res.pairs.forEach(p => {
                        const li = document.createElement('li');
                        li.style.cssText = 'padding: 6px 12px; border-bottom: 1px solid var(--border); font-size: 13px; display: flex; align-items: center; gap: 8px;';
                        li.innerHTML = `<span style="color:var(--accent);">✓</span> <span>${p.label} <span style="opacity:0.6;font-size:11px">(.mp4 + .srt)</span></span>`;
                        list.appendChild(li);
                    });

                    res.unpaired_vids.forEach(p => {
                        const li = document.createElement('li');
                        li.style.cssText = 'padding: 6px 12px; border-bottom: 1px solid var(--border); font-size: 13px; display: flex; align-items: center; gap: 8px; opacity: 0.7;';
                        li.innerHTML = `<span style="color:var(--text-sec);">⚠</span> <span>${p.label} <span style="opacity:0.6;font-size:11px">(no subtitle)</span></span>`;
                        list.appendChild(li);
                    });

                    addLogEntry('info', null, null, `Batch folder loaded: ${res.pairs.length} pairs ready.`);
                } finally {
                    btn.textContent = 'Select Folder…';
                    btn.disabled = false;
                }
            }
        } catch (e) {
            console.error("[Batch] Error in folder picker:", e);
            showError("Folder picker error: " + e);
        }
    });

    // Make the empty drop zone clickable too
    const emptyZone = document.getElementById('batch-empty');
    if (emptyZone) {
        emptyZone.addEventListener('click', () => btn.click());
    }
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
        ['s-yomitan-url', 'yomitan_api_url'],
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
    setValue('s-yomitan-url', s.yomitan_api_url || 'http://127.0.0.1:19633');
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

// ── Test Yomitan API ───────────────────────────────────────────────────────────
async function testYomitan() {
    const btn = document.getElementById('test-yomitan-btn');
    const resultEl = document.getElementById('test-yomitan-result');
    btn.textContent = 'Testing…';
    btn.className = 'test-btn';
    resultEl.classList.add('hidden');

    // Save the URL first so backend uses the current value
    const url = document.getElementById('s-yomitan-url').value.trim();
    settings.yomitan_api_url = url;
    await window.pywebview.api.save_settings(settings);

    const result = await window.pywebview.api.check_yomitan();
    if (result.ok) {
        btn.textContent = '✓ Yomitan detected';
        btn.className = 'test-btn success';
        resultEl.classList.add('hidden');
        // Also update the backfill banner if visible
        await checkYomitan();
    } else {
        btn.textContent = '✗ Not detected';
        btn.className = 'test-btn error';
        resultEl.textContent = `Connection refused at ${url} — make sure Yomitan is open in your browser and "Enable Yomitan API" is ON in Yomitan Settings → General.`;
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

    btn.textContent = 'Indexing... please wait';
    btn.disabled = true;

    try {
        const result = await window.pywebview.api.import_dictionary(path, type);

        btn.textContent = 'Re-import';
        btn.disabled = false;

        if (result.ok) {
            const name = result.path.split(/[\\\/]/).pop();
            setFileDisplay(displayId, name);
            settings[type === 'jitendex' ? 'jitendex_path' : 'freq_dict_path'] = result.path;

            const msg = result.msg || `Imported ${type === 'jitendex' ? 'Jitendex' : 'JPDB freq'}: ${name}`;
            addLogEntry('info', null, null, msg);
            // Show alert or let log handle it? A user visible log is good.
        } else {
            showError(`Import failed: ${result.error}`);
            btn.textContent = 'Import';
        }
    } catch (e) {
        btn.disabled = false;
        btn.textContent = 'Import';
        showError(`Import error: ${e}`);
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
            updateProgressBar(
                data.processed,
                data.total,
                data.current_word,
                data.current_reading,
                data.source_idx,
                data.source_total
            );
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

        // ── SudachiDict download progress ──────────────────────────────
        case 'sudachi_progress':
            _onSudachiProgress(data.downloaded, data.total, data.pct);
            break;
        case 'sudachi_done':
            _onSudachiDone();
            break;
        case 'sudachi_error':
            _onSudachiError(data.msg);
            break;
    }
}

// ── SudachiDict overlay controls ───────────────────────────────────────────────
async function startSudachiDownload() {
    const size = document.querySelector('input[name="sudachi-size"]:checked')?.value || 'small';

    // Switch to progress view
    document.getElementById('sudachi-step1').classList.add('hidden');
    document.getElementById('sudachi-step2').classList.remove('hidden');

    // Label
    const label = document.getElementById('sudachi-progress-label');
    if (label) label.textContent = `Downloading ${size === 'small' ? '~70 MB' : '~800 MB'}…`;

    await window.pywebview.api.download_sudachi(size);
}

function cancelSudachiDownload() {
    window.pywebview.api.cancel_sudachi_download();
    // Reset to step 1
    document.getElementById('sudachi-step2').classList.add('hidden');
    document.getElementById('sudachi-step1').classList.remove('hidden');
    document.getElementById('sudachi-progress-fill').style.width = '0%';
    document.getElementById('sudachi-progress-pct').textContent = '0%';
}

function _onSudachiProgress(downloaded, total, pct) {
    const fill = document.getElementById('sudachi-progress-fill');
    const pctEl = document.getElementById('sudachi-progress-pct');
    const label = document.getElementById('sudachi-progress-label');
    if (fill) fill.style.width = `${pct}%`;
    if (pctEl) pctEl.textContent = `${pct}%`;
    if (label && total > 0) {
        const mbDone = (downloaded / 1048576).toFixed(1);
        const mbTotal = (total / 1048576).toFixed(1);
        label.textContent = `Downloading… ${mbDone} MB / ${mbTotal} MB`;
    }
}

async function _onSudachiDone() {
    // Show success step
    document.getElementById('sudachi-step2').classList.add('hidden');
    document.getElementById('sudachi-step3').classList.remove('hidden');

    const icon = document.getElementById('sudachi-done-icon');
    const text = document.getElementById('sudachi-done-text');
    if (icon) { icon.textContent = '✓'; icon.className = 'sudachi-done-icon'; }
    if (text) text.textContent = 'Dictionary installed! Loading app…';

    // Small delay so the user can see the success state
    await new Promise(r => setTimeout(r, 1200));

    // Hide overlay and proceed with normal init
    document.getElementById('sudachi-overlay').classList.add('hidden');
    await doInitialize();
}

function _onSudachiError(msg) {
    document.getElementById('sudachi-step2').classList.add('hidden');
    document.getElementById('sudachi-step3').classList.remove('hidden');

    const icon = document.getElementById('sudachi-done-icon');
    const text = document.getElementById('sudachi-done-text');
    if (icon) { icon.textContent = '✕'; icon.className = 'sudachi-done-icon error'; }
    if (text) text.textContent = `Download failed: ${msg}\n\nCheck your internet connection and try again.`;

    // Add a retry button
    const section = document.getElementById('sudachi-step3');
    if (section && !section.querySelector('.sudachi-retry-btn')) {
        const btn = document.createElement('button');
        btn.className = 'sudachi-btn';
        btn.textContent = '↺ Try Again';
        btn.style.marginTop = '16px';
        btn.onclick = () => {
            section.classList.add('hidden');
            section.querySelector('.sudachi-retry-btn')?.remove();
            document.getElementById('sudachi-step1').classList.remove('hidden');
        };
        btn.classList.add('sudachi-retry-btn');
        section.appendChild(btn);
    }
}

function updateStats(added, known, freq) {
    setText('stat-added', added ?? 0);
    setText('stat-known', known ?? 0);
    setText('stat-freq', freq ?? 0);
}

function updateProgressBar(processed, total, word, reading, sourceIdx, sourceTotal) {
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

    if (sourceIdx && sourceTotal && sourceTotal > 1) {
        setText('progress-count', `Ep ${sourceIdx}/${sourceTotal}  ·  ${(processed).toLocaleString()} / ${total.toLocaleString()}`);
    } else {
        setText('progress-count', `${(processed).toLocaleString()} / ${total.toLocaleString()}`);
    }
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
    } else if (type === 'batch') {
        if (!state.batchPairs || state.batchPairs.length === 0) {
            showError('Please select a folder containing valid video and subtitle pairs.');
            return null;
        }
        payload.pairs = state.batchPairs;
        const offsetSec = parseFloat(document.getElementById('batch-sub-offset')?.value || '0') || 0;
        payload.sub_offset_ms = Math.round(offsetSec * 1000);
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

// ── BACKFILL TAB ───────────────────────────────────────────────────────────────

// Track backfill state in the frontend
const bfState = {
    yomitanOk: false,
    decks: [],               // [{name, note_type, count}]
    selectedDecks: new Set(),
    detectedNoteType: null,  // note type shared by all selected decks
    savedMappings: {},       // {NoteTypeName: {field: handlebar}}
    savedConfig: {},         // {NoteTypeName: {expression_field, reading_field}}
    noteFields: [],          // field names for current note type
    expressionField: '',     // currently selected expression field
    readingField: '',        // currently selected reading field (optional)
    isPaused: false,
};

let HANDLEBAR_OPTIONS = [
    'none',
    '{expression}',
    '{furigana}',
    '{furigana-plain}',
    '{reading}',
    '{audio}',
    '{glossary}',
    '{glossary-brief}',
    '{glossary-first}',
    '{glossary-no-dictionary}',
    '{pitch-accent-positions}',
    '{pitch-accent-categories}',
    '{pitch-accent-graphs}',
    '{pitch-accent-graphs-jj}',
    '{frequencies}',
    '{frequency-harmonic-rank}',
    '{frequency-average-rank}',
    '{popup-selection-text}',
    '{sentence}',
    '{sentence-furigana}',
    '{sentence-furigana-plain}',
    '{tags}',
    '{part-of-speech}',
];

function rebuildHandlebarOptions(dynamicMarkers = []) {
    const list = [
        'none',
        '{expression}',
        '{furigana}',
        '{furigana-plain}',
        '{reading}',
        '{audio}',
        '{glossary}',
    ];

    const dynamicBraced = dynamicMarkers.map(m => `{${m}}`);
    
    // Merge any saved mappings that are not already present (offline / saved compatibility fallback)
    const saved = [];
    if (bfState.savedMappings) {
        for (const noteType in bfState.savedMappings) {
            const mapping = bfState.savedMappings[noteType];
            for (const field in mapping) {
                const val = mapping[field];
                if (val && (val.startsWith('{single-glossary-') || val.startsWith('{single-frequency-number-'))) {
                    if (!dynamicBraced.includes(val) && !saved.includes(val)) {
                        saved.push(val);
                    }
                }
            }
        }
    }
    
    const allDynamic = [...dynamicBraced, ...saved].sort();
    list.push(...allDynamic);

    const remaining = [
        '{glossary-brief}',
        '{glossary-first}',
        '{glossary-no-dictionary}',
        '{pitch-accent-positions}',
        '{pitch-accent-categories}',
        '{pitch-accent-graphs}',
        '{pitch-accent-graphs-jj}',
        '{frequencies}',
        '{frequency-harmonic-rank}',
        '{frequency-average-rank}',
        '{popup-selection-text}',
        '{sentence}',
        '{sentence-furigana}',
        '{sentence-furigana-plain}',
        '{tags}',
        '{part-of-speech}'
    ];
    list.push(...remaining);

    HANDLEBAR_OPTIONS = list;
}

// Called every time user navigates to the Backfill tab
async function initBackfillTab() {
    // Load saved mappings first (fast, local)
    const res = await window.pywebview.api.get_backfill_settings();
    if (res.ok) {
        bfState.savedMappings = res.mappings || {};
        bfState.savedConfig = res.config || {};
    }

    // Pre-populate handlebars using saved mappings (in case Yomitan is offline)
    rebuildHandlebarOptions([]);

    // Refresh mapping preview
    refreshMappingPreview();

    // Run Yomitan check AND deck loading in parallel — deck loading must never
    // wait on Yomitan. The Yomitan result only affects the banner + Start button.
    await Promise.all([
        checkYomitan(),
        loadDecksForBackfill(),
    ]);

    // If no saved mappings at all, auto-open configure mode
    if (Object.keys(bfState.savedMappings).length === 0) {
        showBackfillConfigureMode();
    } else {
        showBackfillRunMode();
    }
}

let _checkYomitanInFlight = false;
async function checkYomitan() {
    if (_checkYomitanInFlight) return;
    _checkYomitanInFlight = true;

    const banner = document.getElementById('bf-yomitan-banner');
    const msgEl = document.getElementById('bf-yomitan-banner-msg');
    const retryBtn = banner && banner.querySelector('.bf-yomitan-retry-btn');
    const statusEl = document.getElementById('bf-yomitan-status');

    if (retryBtn) { retryBtn.textContent = '⏳ Checking…'; retryBtn.disabled = true; }
    if (msgEl) msgEl.innerHTML = 'Checking Yomitan API…';

    if (statusEl) {
        statusEl.className = 'bf-yomitan-status connecting';
        statusEl.innerHTML = '<div class="status-dot"></div> Yomitan API: Checking...';
    }

    try {
        const res = await window.pywebview.api.check_yomitan();
        bfState.yomitanOk = res.ok;
        if (!res.ok && msgEl) {
            const url = res.url || 'http://127.0.0.1:19633';
            msgEl.innerHTML = `Cannot connect to <code>${url}</code>. In Yomitan Settings → General, enable <b>Yomitan API</b>, then click Retry.`;
        }
    } catch (e) {
        bfState.yomitanOk = false;
        if (msgEl) msgEl.innerHTML = 'Yomitan API not detected. In Yomitan Settings → General, enable <b>Yomitan API</b>, then click Retry.';
    }

    if (statusEl) {
        if (bfState.yomitanOk) {
            statusEl.className = 'bf-yomitan-status connected';
            statusEl.innerHTML = '<div class="status-dot"></div> Yomitan API: Connected';
        } else {
            statusEl.className = 'bf-yomitan-status error';
            statusEl.innerHTML = '<div class="status-dot"></div> Yomitan API: Disconnected';
        }
    }

    // Dynamically fetch and build markers if Yomitan is online
    if (bfState.yomitanOk) {
        try {
            const markerRes = await window.pywebview.api.get_yomitan_markers();
            if (markerRes.ok && markerRes.markers && markerRes.markers.length > 0) {
                rebuildHandlebarOptions(markerRes.markers);
            } else {
                rebuildHandlebarOptions([]);
            }
        } catch (err) {
            console.error('Failed to get Yomitan markers:', err);
            rebuildHandlebarOptions([]);
        }
    } else {
        rebuildHandlebarOptions([]);
    }

    // Re-render the mapping table if configure mode is visible
    const configureModeVisible = !document.getElementById('bf-configure-mode').classList.contains('hidden');
    if (configureModeVisible) {
        const noteType = bfState.detectedNoteType || (Object.keys(bfState.savedMappings).length > 0 ? Object.keys(bfState.savedMappings)[0] : '');
        if (noteType) {
            renderMappingTable(noteType);
        }
    }

    if (banner) banner.classList.toggle('hidden', bfState.yomitanOk);
    if (retryBtn) { retryBtn.textContent = '↻ Retry'; retryBtn.disabled = false; }
    updateBackfillStartBtn();
    _checkYomitanInFlight = false;
}

function updateBackfillStartBtn() {
    const startBtn = document.getElementById('bf-start-btn');
    if (!startBtn) return;
    const yomitanOk = bfState.yomitanOk;
    const hasDecks = bfState.selectedDecks.size > 0;
    const hasMappings = bfState.detectedNoteType &&
        bfState.savedMappings[bfState.detectedNoteType] &&
        Object.keys(bfState.savedMappings[bfState.detectedNoteType]).length > 0;
    const validSelection = bfState.detectedNoteType !== null && hasDecks;
    startBtn.disabled = !yomitanOk || !validSelection || !hasMappings;
}

async function loadDecksForBackfill(forceRefresh = false) {
    const listEl = document.getElementById('bf-deck-list');
    const placeholder = document.getElementById('bf-deck-placeholder');
    if (!listEl) return;

    if (placeholder) placeholder.textContent = 'Loading decks\u2026';

    try {
        const res = await window.pywebview.api.get_anki_decks_with_notetypes(forceRefresh);
        if (!res.ok) {
            if (placeholder) placeholder.textContent = `\u26a0 Could not load decks: ${res.error}`;
            return;
        }
        bfState.decks = res.decks || [];
        renderDeckList();
    } catch (e) {
        if (placeholder) placeholder.textContent = `\u26a0 AnkiConnect error: ${e}`;
    }
}

async function refreshBackfillDecks() {
    const btn = document.getElementById('bf-refresh-decks-btn');
    if (btn) btn.disabled = true;

    // Clear selection so user has to re-select after refresh
    bfState.selectedDecks.clear();
    onDeckSelectionChange();

    await loadDecksForBackfill(true); // force refresh

    if (btn) btn.disabled = false;
}

function renderDeckList() {
    const listEl = document.getElementById('bf-deck-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    if (bfState.decks.length === 0) {
        listEl.innerHTML = '<div class="bf-deck-placeholder">No decks found in Anki.</div>';
        return;
    }

    bfState.decks.forEach(deck => {
        const row = document.createElement('label');
        row.className = 'bf-deck-row';

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'bf-deck-cb';
        cb.value = deck.name;
        cb.checked = bfState.selectedDecks.has(deck.name);
        cb.addEventListener('change', () => {
            if (cb.checked) bfState.selectedDecks.add(deck.name);
            else bfState.selectedDecks.delete(deck.name);
            onDeckSelectionChange();
        });

        const nameSpan = document.createElement('span');
        nameSpan.className = 'bf-deck-name';
        nameSpan.textContent = deck.name;

        const metaSpan = document.createElement('span');
        metaSpan.className = 'bf-deck-meta';
        metaSpan.textContent = deck.note_type
            ? `${deck.count.toLocaleString()} cards \u00b7 ${deck.note_type}`
            : `${deck.count.toLocaleString()} cards`;

        row.appendChild(cb);
        row.appendChild(nameSpan);
        row.appendChild(metaSpan);
        listEl.appendChild(row);
    });
}

function onDeckSelectionChange() {
    const validationRow = document.getElementById('bf-validation-row');
    const validationIcon = document.getElementById('bf-validation-icon');
    const validationMsg = document.getElementById('bf-validation-msg');

    if (bfState.selectedDecks.size === 0) {
        validationRow.classList.add('hidden');
        bfState.detectedNoteType = null;
        updateBackfillStartBtn();
        return;
    }

    // Find note types for selected decks
    const selectedDeckData = bfState.decks.filter(d => bfState.selectedDecks.has(d.name));
    const noteTypes = [...new Set(selectedDeckData.map(d => d.note_type).filter(Boolean))];

    validationRow.classList.remove('hidden');

    if (noteTypes.length > 1) {
        // Mismatch
        bfState.detectedNoteType = null;
        validationIcon.textContent = '\u26a0';
        validationIcon.className = 'bf-validation-icon error';
        validationMsg.textContent =
            `Selected decks use different note types (${noteTypes.join(', ')}). Only decks with the same note type can be backfilled together.`;
        validationMsg.className = 'bf-validation-msg error';
        updateBackfillStartBtn();
    } else if (noteTypes.length === 1) {
        bfState.detectedNoteType = noteTypes[0];
        const totalCards = selectedDeckData.reduce((sum, d) => sum + (d.count || 0), 0);
        validationIcon.textContent = '\u2713';
        validationIcon.className = 'bf-validation-icon ok';
        validationMsg.textContent =
            `Ready: ${totalCards.toLocaleString()} cards across ${bfState.selectedDecks.size} deck(s) \u2014 Note type: ${noteTypes[0]}`;
        validationMsg.className = 'bf-validation-msg ok';
        // Also refresh the mapping preview for this note type
        refreshMappingPreview();
        updateBackfillStartBtn();
    } else {
        // No note types known (empty decks)
        bfState.detectedNoteType = null;
        validationIcon.textContent = '\u26a0';
        validationIcon.className = 'bf-validation-icon error';
        validationMsg.textContent = 'Selected decks appear to be empty or have unknown note types.';
        validationMsg.className = 'bf-validation-msg error';
        updateBackfillStartBtn();
    }
}

function refreshMappingPreview() {
    const previewList = document.getElementById('bf-preview-list');
    const previewEmpty = document.getElementById('bf-preview-empty');
    if (!previewList || !previewEmpty) return;

    const noteType = bfState.detectedNoteType;
    const mapping = noteType ? (bfState.savedMappings[noteType] || {}) : {};
    const entries = Object.entries(mapping).filter(([, v]) => v && v !== 'none');

    if (entries.length === 0) {
        previewEmpty.classList.remove('hidden');
        previewList.classList.add('hidden');
    } else {
        previewEmpty.classList.add('hidden');
        previewList.classList.remove('hidden');
        previewList.innerHTML = entries
            .map(([field, hb]) =>
                `<div class="bf-preview-row"><span class="bf-preview-field">${escapeHtml(field)}</span><span class="bf-preview-arrow">\u2192</span><span class="bf-preview-hb">${escapeHtml(hb)}</span></div>`
            ).join('');
    }
}

function showBackfillRunMode() {
    document.getElementById('bf-run-mode').classList.remove('hidden');
    document.getElementById('bf-configure-mode').classList.add('hidden');
}

async function showBackfillConfigureMode() {
    document.getElementById('bf-run-mode').classList.add('hidden');
    document.getElementById('bf-configure-mode').classList.remove('hidden');

    // Determine the note type to configure (from selected decks, or from existing mappings)
    let noteType = bfState.detectedNoteType;
    if (!noteType && Object.keys(bfState.savedMappings).length > 0) {
        noteType = Object.keys(bfState.savedMappings)[0];
    }
    if (!noteType) noteType = '';

    const noteTypeEl = document.getElementById('bf-configure-note-type');
    if (noteTypeEl) noteTypeEl.textContent = noteType || '(none detected \u2014 select decks first)';

    // Fetch note fields from Anki
    if (noteType) {
        const res = await window.pywebview.api.get_anki_model_fields(noteType);
        bfState.noteFields = res.ok ? (res.fields || []) : [];
    } else {
        bfState.noteFields = [];
    }

    // Load saved config for this note type (expression/reading fields)
    const savedCfg = (noteType && bfState.savedConfig[noteType]) || {};
    bfState.expressionField = savedCfg.expression_field || _detectDefaultExpressionField(bfState.noteFields);
    bfState.readingField = savedCfg.reading_field || _detectDefaultReadingField(bfState.noteFields);

    // Populate Expression Field and Reading Field dropdowns
    _populateSourceFieldSelect('bf-expression-field-sel', bfState.noteFields, bfState.expressionField, false);
    _populateSourceFieldSelect('bf-reading-field-sel', bfState.noteFields, bfState.readingField, true);

    renderMappingTable(noteType);
}

// Auto-detect a sensible default expression field
function _detectDefaultExpressionField(fields) {
    const candidates = ['Expression', 'Word', 'VocabKanji', 'Vocab', 'Front'];
    for (const c of candidates) {
        if (fields.includes(c)) return c;
    }
    return fields[0] || '';
}

// Auto-detect a sensible default reading field
function _detectDefaultReadingField(fields) {
    const candidates = ['Reading', 'VocabFurigana', 'Furigana', 'Kana'];
    for (const c of candidates) {
        if (fields.includes(c)) return c;
    }
    return '';
}

// Populate a select dropdown with Anki fields, adding 'none' option for reading
function _populateSourceFieldSelect(selectId, fields, currentValue, allowNone) {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    sel.innerHTML = '';
    if (allowNone) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = '(none)';
        if (!currentValue) opt.selected = true;
        sel.appendChild(opt);
    }
    fields.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f;
        opt.textContent = f;
        if (f === currentValue) opt.selected = true;
        sel.appendChild(opt);
    });
}

function renderMappingTable(noteType) {
    const tbody = document.getElementById('bf-mapping-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const savedMapping = (noteType && bfState.savedMappings[noteType]) || {};

    if (bfState.noteFields.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="padding:20px;text-align:center;color:var(--text-dim)">No fields found. Select decks with a known note type first.</td></tr>';
        return;
    }

    bfState.noteFields.forEach(field => {
        const tr = document.createElement('tr');
        tr.className = 'bf-tr';

        const tdField = document.createElement('td');
        tdField.className = 'bf-td bf-td-field';
        tdField.textContent = field;

        const tdHb = document.createElement('td');
        tdHb.className = 'bf-td';

        const sel = document.createElement('select');
        sel.className = 'bf-hb-select';
        sel.dataset.field = field;

        HANDLEBAR_OPTIONS.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            if ((savedMapping[field] || 'none') === opt) option.selected = true;
            sel.appendChild(option);
        });

        tdHb.appendChild(sel);
        tr.appendChild(tdField);
        tr.appendChild(tdHb);
        tbody.appendChild(tr);
    });
}

async function saveBackfillMapping() {
    const noteType = bfState.detectedNoteType || document.getElementById('bf-configure-note-type').textContent;
    if (!noteType || noteType.includes('(none detected')) {
        alert('Please select decks with a known note type before saving the mapping.');
        return;
    }

    const selects = document.querySelectorAll('#bf-mapping-tbody .bf-hb-select');
    const mapping = {};
    selects.forEach(sel => {
        mapping[sel.dataset.field] = sel.value;
    });

    // Read Expression Field and Reading Field selections
    const expressionFieldSel = document.getElementById('bf-expression-field-sel');
    const readingFieldSel = document.getElementById('bf-reading-field-sel');
    const expressionField = expressionFieldSel ? expressionFieldSel.value : '';
    const readingField = readingFieldSel ? readingFieldSel.value : '';

    if (!expressionField) {
        alert('Please select an Expression Field before saving.');
        return;
    }

    const res = await window.pywebview.api.save_backfill_settings(
        noteType, mapping, expressionField, readingField
    );
    if (res.ok) {
        // Update local cache
        const clean = Object.fromEntries(Object.entries(mapping).filter(([, v]) => v && v !== 'none'));
        bfState.savedMappings[noteType] = clean;
        if (!bfState.savedConfig) bfState.savedConfig = {};
        bfState.savedConfig[noteType] = { expression_field: expressionField, reading_field: readingField };
        bfState.expressionField = expressionField;
        bfState.readingField = readingField;
        refreshMappingPreview();
        showBackfillRunMode();
        updateBackfillStartBtn();
    } else {
        alert(`Failed to save mapping: ${res.error}`);
    }
}

function cancelBackfillConfigure() {
    showBackfillRunMode();
}

async function startBackfill() {
    if (!bfState.yomitanOk) return;
    if (bfState.selectedDecks.size === 0) return;

    const noteType = bfState.detectedNoteType;
    const fieldMapping = noteType ? (bfState.savedMappings[noteType] || {}) : {};
    const cfg = (noteType && bfState.savedConfig && bfState.savedConfig[noteType]) || {};
    const expressionField = cfg.expression_field || bfState.expressionField || 'Expression';
    const readingField = cfg.reading_field || bfState.readingField || '';

    if (Object.keys(fieldMapping).length === 0) {
        alert('No field mapping configured for this note type. Please configure fields first.');
        showBackfillConfigureMode();
        return;
    }

    if (!expressionField) {
        alert('No Expression Field configured. Please configure fields first.');
        showBackfillConfigureMode();
        return;
    }

    // Show progress area
    document.getElementById('bf-start-btn').disabled = true;
    document.getElementById('bf-progress-area').classList.remove('hidden');
    document.getElementById('bf-summary-card').classList.add('hidden');
    document.getElementById('bf-progress-fill').style.width = '0%';
    document.getElementById('bf-progress-status').textContent = 'Starting\u2026';
    document.getElementById('bf-progress-count').textContent = '0 / 0';
    document.getElementById('bf-progress-pct').textContent = '0%';
    bfState.isPaused = false;
    updatePauseButton();

    const res = await window.pywebview.api.start_backfill(
        Array.from(bfState.selectedDecks),
        fieldMapping,
        expressionField,
        readingField
    );
    if (!res.ok) {
        document.getElementById('bf-progress-area').classList.add('hidden');
        document.getElementById('bf-start-btn').disabled = false;
        alert(`Failed to start backfill: ${res.error}`);
    }
}

async function toggleBackfillPause() {
    if (bfState.isPaused) {
        await window.pywebview.api.resume_backfill();
        bfState.isPaused = false;
    } else {
        await window.pywebview.api.pause_backfill();
        bfState.isPaused = true;
    }
    updatePauseButton();
}

function updatePauseButton() {
    const icon = document.getElementById('bf-pause-icon');
    const text = document.getElementById('bf-pause-text');
    if (bfState.isPaused) {
        if (icon) icon.textContent = '\u25b6';
        if (text) text.textContent = 'Resume';
    } else {
        if (icon) icon.textContent = '\u23f8';
        if (text) text.textContent = 'Pause';
    }
}

async function cancelBackfill() {
    await window.pywebview.api.cancel_backfill();
    bfState.isPaused = false;
    updatePauseButton();
}

// Called from Python via evaluate_js('onBackfillProgress(...)')
function onBackfillProgress(data) {
    const status = document.getElementById('bf-progress-status');
    const fill = document.getElementById('bf-progress-fill');
    const countEl = document.getElementById('bf-progress-count');
    const pctEl = document.getElementById('bf-progress-pct');

    if (status && data.msg) status.textContent = data.msg;

    const total = data.total || 0;
    const current = data.current || 0;
    const pct = total > 0 ? Math.round(current / total * 100) : 0;
    if (fill) fill.style.width = `${pct}%`;
    if (countEl) countEl.textContent = `${current.toLocaleString()} / ${total.toLocaleString()}`;
    if (pctEl) pctEl.textContent = `${pct}%`;

    // Handle terminal states
    const state = data.state;
    if (state === 'done' || state === 'cancelled' || state === 'error') {
        document.getElementById('bf-progress-area').classList.add('hidden');
        showBackfillSummary(data);
        document.getElementById('bf-start-btn').disabled = false;
        updateBackfillStartBtn();
    } else if (state === 'paused') {
        bfState.isPaused = true;
        updatePauseButton();
    } else if (state === 'running') {
        bfState.isPaused = false;
        updatePauseButton();
    }
}

function showBackfillSummary(data) {
    const card = document.getElementById('bf-summary-card');
    const iconEl = document.getElementById('bf-summary-icon');
    const titleEl = document.getElementById('bf-summary-title');
    const bodyEl = document.getElementById('bf-summary-body');
    if (!card) return;

    const isError = data.state === 'error';
    const isCancelled = data.state === 'cancelled';

    if (isError) {
        iconEl.textContent = '\u2715';
        iconEl.style.color = 'var(--red)';
        titleEl.textContent = 'Backfill failed';
    } else if (isCancelled) {
        iconEl.textContent = '\u23f9';
        iconEl.style.color = 'var(--yellow)';
        titleEl.textContent = 'Backfill cancelled';
    } else {
        iconEl.textContent = '\u2713';
        iconEl.style.color = 'var(--green)';
        titleEl.textContent = 'Backfill complete';
    }

    const errorNote = (data.errors || 0) > 0
        ? `<span style="color:var(--red)">${data.errors} error${data.errors !== 1 ? 's' : ''} \u2014 see SentenceMiner.log for details</span>`
        : `0 errors`;

    bodyEl.innerHTML = `
        <div class="bf-summary-row"><span class="bf-summary-num green">${(data.updated || 0).toLocaleString()}</span><span>updated</span></div>
        <div class="bf-summary-row"><span class="bf-summary-num yellow">${(data.skipped || 0).toLocaleString()}</span><span>skipped (word not found in Yomitan)</span></div>
        <div class="bf-summary-row">${errorNote}</div>
        ${bfState.detectedNoteType ? `<div class="bf-summary-row muted">${Array.from(bfState.selectedDecks).join(', ')} \u00b7 note type: ${bfState.detectedNoteType}</div>` : ''}
    `;

    card.classList.remove('hidden');
}

function resetBackfillUI() {
    document.getElementById('bf-summary-card').classList.add('hidden');
    document.getElementById('bf-progress-area').classList.add('hidden');
    document.getElementById('bf-progress-fill').style.width = '0%';
    bfState.isPaused = false;
    updatePauseButton();
    updateBackfillStartBtn();
}


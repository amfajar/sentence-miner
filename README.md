# Sentence Miner

A desktop app for **Japanese sentence mining** from anime, YouTube videos, and EPUB books. Automatically finds vocabulary from your content, pairs each word with its best example sentence, pulls definitions and audio, and creates Anki flashcards in one click.

![Python](https://img.shields.io/badge/Python-3.10%2B-blue) ![pywebview](https://img.shields.io/badge/UI-pywebview-purple) ![Anki](https://img.shields.io/badge/Anki-AnkiConnect-green)

---

## Features

| Feature | Detail |
|---|---|
| 🎬 **Local Video** | Drop `.mkv` / `.mp4` + `.srt` / `.ass` subtitle file |
| 🍿 **Batch Mining** | Select a whole folder of Anime episodes + subs. Automatically pairs, scans, and mines them all sequentially! |
| ▶ **YouTube** | Paste URL — downloads video + manual JP subtitles automatically |
| 📚 **EPUB** | Drop any Japanese EPUB book, mine a character range |
| 🔊 **Audio clips** | Auto-cuts the exact subtitle line from the video (with padding) |
| 🖼 **Screenshot** | Grabs a frame from the subtitle timestamp |
| 📖 **Dictionary** | Jitendex (Yomitan format) — full structured definitions with tags |
| 📊 **Frequency filter** | JPDB frequency ranking — only mine words worth knowing |
| ✅ **Duplicate filter** | Skips words already in your Anki deck |
| 🈳 **Furigana** | Ruby HTML furigana on all sentences, target word bolded |
| ⏱ **Subtitle offset** | Fine-tune subtitle sync for local video (positive/negative seconds) |
| 🃏 **Anki integration** | One-click card creation via AnkiConnect, or mine entire source at once |

---

## Installation

1. Download `SentenceMiner.exe` from the [Releases](https://github.com/amfajar/sentence-miner/releases) page
2. Run the exe — on first launch it will automatically download the Japanese dictionary (~70MB or ~800MB depending on your choice)
3. Open Anki and make sure AnkiConnect is installed and running
4. In the Settings tab, import your dictionaries (Jitendex + frequency DB)

---

## Running

Double-click `SentenceMiner.exe`

> **Developers:** clone the repo and run `python main.py` (requires Python 3.10+, see requirements.txt)

---

## Usage

### Video (Local Anime)

1. Select **🎬 Video** tab
2. Drop your video file (`.mkv`, `.mp4`)
3. Drop your subtitle file (`.srt` or `.ass`)
4. If subtitles are out of sync, set **Subtitle offset** (e.g. `+1.5` if subs appear 1.5s late)
5. Set the **Frequency filter** (default: top 10,000 words)
6. Click **Scan** to preview candidates, then **Add** individual cards — or **⚡ Mine All**

### Batch Processing (Whole Season)

1. Select **🍿 Batch** tab
2. Click **Select Folder** and pick the directory containing your video files and subtitle files
3. The app will automatically pair videos and subtitles based on their filenames (ignoring extensions).
4. Set the **Subtitle offset** (this will apply to all episodes in the batch)
5. Click **Scan All** to identify candidates globally, then click **Mine All** to create flashcards for the entire anime season in one go!

### YouTube

1. Select **▶ YouTube** tab
2. Paste the video URL
3. The app downloads the video and Japanese manual subtitles automatically
4. Proceed as above

> ⚠ Only videos with **manual** Japanese subtitles from the creator are supported. Auto-generated captions are not accurate enough.  
> 🍪 For age-restricted or members-only videos, place a `cookies.txt` (Netscape format) in the app root folder.

### EPUB (Books)

1. Select **📖 EPUB** tab
2. Drop your `.epub` file
3. Optionally set a **character range** to mine only a chapter (use **Detect** to find total length)
4. Cards won't have audio or screenshots (text-only source)

---

## Project Structure

```
sentence-miner/
├── main.py              # Entry point — launches pywebview window
├── api.py               # Python↔JS bridge (all pywebview API methods)
├── settings.py          # Settings dataclass, load/save/import
├── requirements.txt
│
├── pipeline/            # Core processing
│   ├── nlp.py           # Japanese tokenization (SudachiPy)
│   ├── furigana.py      # Furigana HTML generation
│   ├── dictionary.py    # Jitendex loader & SQLite indexer
│   ├── frequency.py     # JPDB frequency DB
│   ├── anki.py          # AnkiConnect API wrapper
│   ├── audio_sources.py # Audio lookup (JapanesePod101, etc.)
│   ├── media.py         # ffmpeg audio clip + screenshot
│   ├── epub.py          # EPUB text extraction
│   └── youtube.py       # yt-dlp wrapper
│
├── frontend/
│   ├── index.html       # App UI
│   ├── app.js           # Frontend logic
│   └── style.css        # Dark theme styling
│
└── data/                # Created on first run (gitignored)
    ├── dictionary.db    # Indexed Jitendex SQLite DB
    ├── *.zip            # Imported dictionary zips
    └── *.db             # Frequency DB
```

---

## Anki Note Type Fields

The app expects a note type with these fields (note that the note type and deck can be configured in Settings):

| Field | Content |
|---|---|
| `Word` | Target vocabulary (kanji/kana) |
| `WordFurigana` | Reading in furigana format |
| `SelectionText` | *(left empty)* |
| `MainDefinition` | Full Jitendex HTML definition |
| `DefinitionPicture` | *(empty — reserved)* |
| `Sentence` | Plain sentence text |
| `SentenceFurigana` | Sentence HTML with ruby furigana + bold target word |
| `SentenceAudio` | Audio clip `[sound:xxx.mp3]` |
| `Picture` | Screenshot `<img src="xxx.jpg">` |

---

## Settings

| Setting | Default | Description |
|---|---|---|
| AnkiConnect URL | `http://localhost:8765` | Change if you use a non-default port |
| Note type | `Lapis/Kiku` | Your Anki note type name |
| Deck name | `Mining` | Target deck |
| Frequency threshold | `10,000` | Words ranked above this are skipped |
| Clip padding | `500 ms` | Extra audio added before/after the subtitle line |

---

## Troubleshooting

**Anki not connecting**
→ Make sure Anki is open and AnkiConnect is installed. Test at `http://localhost:8765`.

**SudachiDict download failed**
→ Check internet connection and restart the app. The download will resume from the setup screen.

**YouTube download fails**
→ yt-dlp needs to be up to date: `pip install -U yt-dlp`

**Subtitles out of sync**
→ Use the **Subtitle offset** field in the Video tab (positive = subs are late).

**Dictionary not loading**
→ Re-import the Jitendex zip from Settings. The DB will rebuild automatically.

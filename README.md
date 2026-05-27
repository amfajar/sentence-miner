# 🎬 Sentence Miner

A high-performance, modern desktop application designed for **Japanese sentence mining** from Anime, YouTube videos, and EPUB books. It automatically tokenizes Japanese text, aligns words with their corresponding example sentences, downloads definitions and native audios, and exports them directly into Anki flashcards with a single click.

> [!NOTE]
> ### 🌌 Vibe Coding Disclaimer
> This project is a product of **Vibe Coding** — built in flow state with the assistance of advanced agentic AI systems. It is fully featured, highly optimized, and runs with great performance, but maintains a relaxed, flow-driven architecture. Use it with good vibes!

---

## 🚀 Key Features

| Domain | Feature Description |
| :--- | :--- |
| 🎬 **Local Video Mining** | Drop any local `.mkv` or `.mp4` video alongside a `.srt` or `.ass` subtitle file. |
| 🍿 **Automated Batch Processing** | Select an entire folder of anime episodes and subtitles. The app automatically pairs matching titles and processes them sequentially. |
| ▶ **YouTube Integration** | Paste any YouTube URL to automatically download the video and jp subtitles (manual jp subtitles required). |
| 📚 **EPUB Reader Mining** | Drop any DRM-free Japanese `.epub` book and extract vocab candidates from specific chapters. |
| 🔊 **Native Subtitle Clips** | Automatically extracts precise audio clips matching the active subtitle timestamp (with configurable padding). |
| 🖼 **Auto Screenshot** | Grabs a high-resolution screenshot at the exact timestamp of the subtitle line. |
| 📖 **Dictionary Lookup** | Integrated Jitendex (Yomitan format) indexer providing rich HTML layouts with tags and definitions. |
| 📊 **Smart Frequency Filters** | Filters vocabulary using the JPDB frequency database to ensure you prioritize words worth learning. |
| ✅ **Duplicate Prevention** | Connects to Anki to automatically skip words you have already learned. |
| 🈳 **Ruby Furigana** | Automatically generates clean HTML ruby tags for kanji readings and bolds the target word. |

---

## 🛠 Installation & Setup

1. **Download**: Grab the latest `SentenceMiner.exe` from the [Releases](https://github.com/amfajar/sentence-miner/releases) page.
2. **First Run**: Double-click to launch. On the first launch, the app downloads the Sudachi system dictionary (~117MB) automatically.
3. **Configure Anki**: Ensure Anki is open with the [AnkiConnect](https://ankiweb.net/shared/info/2055492159) add-on installed and running.
4. **Import Dictionaries**: Head to the **Settings** tab to import your Yomitan-formatted Jidict/Jitendex `.zip` and frequency `.db` files.

---

## 📖 How to Use

### 🎬 Local Video (Anime Episodes)
1. Select the **🎬 Video** tab.
2. Drag and drop your video file (`.mkv`, `.mp4`).
3. Drag and drop your subtitle file (`.srt`, `.ass`).
4. If subtitles are desynced, set a **Subtitle offset** (e.g., `+1.5` to delay, `-1.2` to advance).
5. Set your **Frequency filter** threshold.
6. Click **Scan** to preview vocab candidates, then click **Add Card** or bulk-create using **⚡ Mine All**.

### 🍿 Batch Season Processing
1. Select the **🍿 Batch** tab.
2. Click **Select Folder** and pick the directory containing your anime season files and subtitles.
3. The app automatically aligns video and subtitle files matching their names.
4. Click **Scan All** to globally search for mineable candidates across the season, then click **Mine All**.

### ▶ YouTube
1. Select the **▶ YouTube** tab.
2. Paste the video URL.
3. The app will fetch the video and jp manual captions automatically.
4. Proceed with scanning and mining as usual.
> [!WARNING]
> Only videos with creator-uploaded manual captions are supported. Auto-generated captions are not precise enough for parsing. To mine age-restricted/members-only videos, place a Netscape-formatted `cookies.txt` file in the root folder.

### 📖 EPUB Books
1. Select the **📖 EPUB** tab.
2. Drag and drop your `.epub` file.
3. Click **Detect** to find the character range, and set your target chapter boundaries.
4. Cards created from EPUB books are text-only (no screenshot/audio clips).

---

## 🗂 Project Directory Structure

```text
sentence-miner/
├── main.py              # Entry point — configures and launches the Webview window
├── api.py               # Python ↔ JS bridge for UI interactions
├── settings.py          # Configuration manager (load, save, import)
├── version.py           # Application version info
├── requirements.txt     # Python requirements
│
├── pipeline/            # Processing Pipeline
│   ├── nlp.py           # Japanese morphological parsing (SudachiPy)
│   ├── furigana.py      # Ruby HTML furigana formatter
│   ├── dictionary.py    # Jitendex loader & SQLite database indexer
│   ├── frequency.py     # JPDB frequency database manager
│   ├── anki.py          # AnkiConnect REST client
│   ├── audio_sources.py # Audio downloader (JapanesePod101, etc.)
│   ├── media.py         # Subtitle clipper (ffmpeg cuts & frame screenshots)
│   ├── epub.py          # EPUB text extraction pipeline
│   └── youtube.py       # yt-dlp downloader helper
│
├── frontend/            # pywebview Frontend Assets
│   ├── index.html       # Single-page UI layout
│   ├── app.js           # Interactive state and websocket handlers
│   └── style.css        # Premium glassmorphism dark theme CSS
│
└── data/                # Local database folder (generated on first run)
    ├── dictionary.db    # SQLite indexed dictionary database
    ├── *.zip            # Imported Yomitan dictionary zips
    └── *.db             # JPDB frequency databases
```

---

## 🎴 Recommended Anki Card Layout

You can customize your field mapping in the **Settings** tab. The default recommended card note fields are:

| Anki Field Name | Content Type |
| :--- | :--- |
| `Word` | Target vocabulary (Kanji/Kana) |
| `WordFurigana` | Ruby furigana format reading |
| `MainDefinition` | Full merged Jitendex CSS/HTML definition |
| `Sentence` | Raw sentence text |
| `SentenceFurigana` | Sentence HTML with Ruby furigana + bold target vocabulary |
| `SentenceAudio` | Native audio cut `[sound:xxx.mp3]` |
| `Picture` | screenshot image element `<img src="xxx.jpg">` |

---

## ⚙ Configurable Settings

| Setting | Default Value | Description |
| :--- | :--- | :--- |
| **AnkiConnect URL** | `http://localhost:8765` | Connection string to your local Anki instance. |
| **Note Type** | `Kiku` | Your target Anki note type structure. |
| **Deck Name** | `1. JLPT` | Target deck where mined cards will land. |
| **Frequency Threshold** | `10,000` | Vocabs with frequency rankings above this limit are ignored. |
| **Clip Padding** | `500 ms` | Milliseconds added before/after the subtitle line for audio cuts. |

---

## 🔧 Troubleshooting

* **Anki Connection Fails**: Make sure Anki is open and `AnkiConnect` is installed. Test if `http://localhost:8765` is accessible in your browser.
* **Sudachi System Dictionary Download Fails**: Check your internet connection and restart the app; it will automatically resume.
* **YouTube Downloads Fail**: Ensure `yt-dlp` is fully updated by running `pip install -U yt-dlp` in your environment.
* **Subtitles Desynced**: Adjust the **Subtitle offset** in the Video tab (positive delays subtitles, negative advances them).
* **Precise Lookup Not Pairing**: Ensure that the **Reading Field** mapping is correctly selected in Settings. The app automatically fetches multiple dictionary entries and pairs the correct one by kana matching.

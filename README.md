# 🎵 Automated-YT-Music-Channel

A fully autonomous YouTube channel creation tool for the music niche. This application helps you create slowed & reverb versions of music videos, generating ready-to-upload content with minimal effort.

## ✨ Features

- Automatic YouTube video downloading
- Audio extraction and processing (slowed & reverb effects)
- Video merging with visual assets
- Extended duration video creation (up to 1 hour)
- Thumbnail generation
- Fully configurable through command line arguments

## 🔧 Dependencies

- **ffmpeg:** 7.1 essential build (gyan.dev)
- **yt-dlp:** 2024.12.13
- **fluent-ffmpeg:** 2.1.3

## 📋 Prerequisites

- Make sure ffmpeg is installed and available in your system PATH
- Node.js environment for running the application

## 🚀 Installation & Setup

1. Download the latest release from the [releases section](https://github.com/username/Automated-yt-music-channel/releases)
2. Create a `.env` file in the root directory
3. Configure the following environment variables in your `.env` file:

```
YT_DLP_PATH=(path of your yt-dlp installation)
ASSET_VIDEO_PATH=(path of your asset video)
FINAL_VIDEO_DURATION=(export final output duration in seconds, e.g. 3600)
YOUTUBE_API_KEY=(optional, required only for fetching trending videos)
```

## 📝 Usage

Run the application with command line arguments to specify a YouTube link:

for specific video
```
pikachu <your youtube url>
```

for trending videos
```
pikachu <region code>
```

## 📦 Version History

### Version 2
- ✅ Thumbnail generation functionality
- 🐛 Multiple bug fixes and stability improvements

### Version 1
- ✅ Loop generation from trending videos
- ✅ Manual URL input functionality
- ✅ Core processing pipeline established

## ⚙️ Process Flow

The application automatically performs the following steps:

1. ✅ Setup configuration from command line args or config file
2. ✅ Download YouTube video using yt-dlp
3. ✅ Download thumbnail in `./files/%(id)s` directory
4. ✅ Convert downloaded video to MP4 format
5. ✅ Extract audio from the video
6. 🔄 Apply slowed & reverb effects to the audio
7. ✅ Merge the processed audio with your asset video
8. ✅ Loop the result to create a longer duration video (e.g., 1 hour)
9. ✅ Save the final output to the `output` directory
10. ✅ Generate thumbnails for your YouTube upload

## 📁 Project Structure

```
Automated-yt-music-channel/
├── index.js
├── .env
├── assets/
│   └── (your visual assets)
├── files/
│   └── (temporary downloaded files)
└── output/
    └── (final videos and thumbnails)
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/aditya-gupta-dev/Automated-yt-music-channel/issues).

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

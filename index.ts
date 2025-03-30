import { checkForValidUrl } from "./core/utils";
import { convertTheVideoToMP4, downloadSourceVideo, downloadThumbnail, extractHighQualityAudioFromVideo, generateConcatDemuxerFile, getYouTubeId, loopingFinalVideo, mergeAssetFileAndAudioFile } from "./core/video";
import { mkdir, exists } from "fs/promises";

if (Bun.argv.length < 3) {
    console.log("Please provide a URL to fetch data from.")
    process.exit(1)
}

const url = Bun.argv[2]

if (!checkForValidUrl(url)) {
    console.log("Please provide a valid URL.")
    process.exit(1)
}

const video_id = getYouTubeId(url)

if (!video_id) {
    console.log("Please provide a valid YouTube URL.")
    process.exit(1)
}

if(!await exists('output')) {
    await mkdir('output')
}

const YT_DLP_PATH = Bun.env.YT_DLP_PATH || undefined
const ASSET_VIDEO_PATH = Bun.env.ASSET_VIDEO_PATH || undefined
const FINAL_VIDEO_DURATION = Bun.env.FINAL_VIDEO_DURATION || undefined


if (!YT_DLP_PATH || !ASSET_VIDEO_PATH || !FINAL_VIDEO_DURATION) {
    console.log("Please provide a valid path to yt-dlp & asset video path & final video duration ")
    process.exit(1)
}

await downloadThumbnail(url, YT_DLP_PATH)

await downloadSourceVideo(url, YT_DLP_PATH)

await convertTheVideoToMP4(`./files/${video_id}`)

await extractHighQualityAudioFromVideo(`./files/${video_id}`)

// fix await convertExtractedAudioToSlowedAndReverb(`./files/${video_id}`)

await mergeAssetFileAndAudioFile(`./files/${video_id}`)

await generateConcatDemuxerFile(`./files/${video_id}`)

await loopingFinalVideo(`./files/${video_id}`)

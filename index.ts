import { fetchTrendingVideosByCountryCode } from "./api/youtube";
import { checkForValidUrl } from "./core/utils";
import { convertTheVideoToMP4, createThumbnailForVideo, downloadSourceVideo, downloadThumbnail, extractHighQualityAudioFromVideo, generateConcatDemuxerFile, getYouTubeId, loopingFinalVideo, mergeAssetFileAndAudioFile } from "./core/video";
import { mkdir, exists } from "fs/promises";

if (Bun.argv.length < 3) {
    console.log("Please provide a URL to fetch data from.")
    process.exit(1)
}


if (Bun.argv[2].toString() === 'v') {
    console.log('version 2 build date 31-03-2025');
}

else if (Bun.argv[2].toString().length === 2) {
    const trendingVideos = await fetchTrendingVideosByCountryCode(Bun.argv[2].toString())

    if (trendingVideos.length === 0) {
        console.log("No trending videos found.")
        process.exit(1)
    }

    for(let i = 0; i < trendingVideos.length; i++) {
        const url = `https://www.youtube.com/watch?v=${trendingVideos[i].id}`

        if (!checkForValidUrl(url)) {
            console.log("Please provide a valid URL.")
            process.exit(1)
        }
        const video_id = getYouTubeId(url)
    
        if (!video_id) {
            console.log("Failed to extract video ID.")
            process.exit(1)
        }
    
        if (!await exists('output')) {
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

        await createThumbnailForVideo(`./files/${video_id}`)
    }

}

else {
    const url = Bun.argv[2]

    if (!checkForValidUrl(url)) {
        console.log("Please provide a valid URL.")
        process.exit(1)
    }
    const video_id = getYouTubeId(url)

    if (!video_id) {
        console.log("Failed to extract video ID.")
        process.exit(1)
    }

    if (!await exists('output')) {
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

    await createThumbnailForVideo(`./files/${video_id}`)
}


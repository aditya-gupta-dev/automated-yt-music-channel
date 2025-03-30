import { $ } from "bun"
import ffmpeg from "fluent-ffmpeg"

export function getYouTubeId(url: string) {
    const regex = /(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/|v\/|shorts\/))([\w-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

export async function downloadThumbnail(url: string, YT_DLP_PATH: string) {

    console.log(`Downloading thumbnail for ::: ${url}`);

    const res = await $`${YT_DLP_PATH} ${url} --skip-download --write-thumbnail --output "./files/%(id)s/thumbnail"`.quiet()

    console.log(`Completed Downloading thumbnail for ::: ${url}`);

}

export async function downloadSourceVideo(url: string, YT_DLP_PATH: string) {

    console.log(`Downloading source video ::: ${url}`);

    const res = await $`${YT_DLP_PATH} ${url} --output "./files/%(id)s/input"`.quiet()

    console.log(`Completed Downloading source video ::: ${url}`);
}

export async function convertTheVideoToMP4(stored_directory: string) {
    const input_file = `${stored_directory}/input.webm`;
    if (!input_file.endsWith(".mp4")) {
        console.log(`Converting video to mp4 format ::: ${stored_directory}/input.webm`);

        const res = await $`ffmpeg -i ${stored_directory}/input.webm -c copy ${stored_directory}/output.mp4`.quiet()

        console.log(`Completed Converting video to mp4 format ::: ${stored_directory}/input.webm`);
    }
}

export async function extractHighQualityAudioFromVideo(stored_directory: string) {
    
    console.log(`Extracting audio from video ::: ${stored_directory}/output.mp4`);

    const res = await $`ffmpeg -i ${stored_directory}/output.mp4 -q:a 0 -map a ${stored_directory}/audio.mp3`.quiet()

    console.log(`Completed Extracting audio from video ::: ${stored_directory}/output.mp4`);

}

export async function convertExtractedAudioToSlowedAndReverb(stored_directory: string) {
   
    console.log(`Extracting audio from video ::: ${stored_directory}/output.mp4`);
    // ffmpeg -i input.mp3 -filter_complex "[0:a]asetrate=44100*0.8,aresample=44100,atempo=1.0[slowed];[slowed]asplit=2[dry][wet];[wet]aecho=0.8:0.5:40|60|90|120:0.6|0.4|0.3|0.2[echo];[dry][echo]amix=inputs=2:weights=0.7 0.3[out]" -map "[out]" output_slowed_reverb.mp3
    const res = await $`ffmpeg -i ${stored_directory}/input.mp3 -filter_complex "[0:a]asetrate=44100*0.8,aresample=44100,atempo=1.0[slowed];[slowed]afir=dry=10:wet=5:length=5000[out]" -map "[out]" output_slowed_reverb.mp3`.quiet()
    
    console.log(`Completed Extracting audio from video ::: ${stored_directory}/output.mp4`);
}

export async function mergeAssetFileAndAudioFile(stored_directory: string) {

    const asset_video_path = Bun.env.ASSET_VIDEO_PATH!

    console.log(`Merging asset file and audio file ::: ${stored_directory}/output.mp4`);

    const res = await $`ffmpeg -i "${asset_video_path}" -i ${stored_directory}/audio.mp3 -c:v copy -c:a aac ${stored_directory}/final_output.mp4`.quiet()

    console.log(`Completed Merging asset file and audio file ::: ${stored_directory}/output.mp4`);
    
}

export function getVideoDuration(videoPath: string) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                resolve(metadata.format.duration); // Duration in seconds
            }
        });
    });
}

export async function generateConcatDemuxerFile(stored_directory: string) {
    console.log(`Generating concat demuxer file ::: ${stored_directory}/final_output.mp4`);
    
    const final_video_duration: any = Bun.env.FINAL_VIDEO_DURATION!
    
    const final_output_duration: any = await getVideoDuration(`${stored_directory}/final_output.mp4`)
    
    const loops = Math.ceil(final_video_duration / final_output_duration)
    
    let file_text = ""
    
    for(let i = 0; i < loops; i++) {
        file_text = `${file_text}file './final_output.mp4'\n`
    }
    
    await Bun.write(`${stored_directory}/files.txt`, file_text)
    console.log(`Completed Generating concat demuxer file ::: ${stored_directory}/final_output.mp4`);
}

export async function loopingFinalVideo(stored_directory: string) {
    const videoId = stored_directory.split('/')[stored_directory.split('/').length - 1]
    
    console.log(`Looping final video ::: ${stored_directory}/${videoId}.mp4`)
    
    const res = await $`ffmpeg -f concat -safe 0 -i "${stored_directory}/files.txt" -c copy ./output/${videoId}.mp4`.quiet()
    
    console.log(`Completed Looping final video ::: output/${videoId}.mp4`)
    
}

export async function createThumbnailForVideo(stored_directory: string) {
    const videoId = stored_directory.split('/')[stored_directory.split('/').length - 1]
    
    console.log(`Creating thumbnail for video ::: ${stored_directory}/${videoId}.mp4`)
    
    const res = await $`ffmpeg -i "${stored_directory}/thumbnail.webp" -i "assets/overlay.png" -filter_complex "[1:v]scale=iw*0.5:-1[overlay];[0:v][overlay]overlay=(W-w)/2:(H-h)/2" output/${videoId}.jpg`.quiet()
    
    console.log(`Completed Creating thumbnail for video ::: output/${videoId}.jpg`)
    console.log('\n');
}

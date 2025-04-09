import type { YoutubeVideo } from "../models"

export function checkForValidUrl(url:string) {
    try {
        new URL(url)
        return true
    } catch (e) {
        return false
    }
}

export function generateOutputFilename(yt: YoutubeVideo) {
    const sanitizedTitle = yt.title.replace(/[^a-zA-Z0-9_]/g, " ")
    const suffix = " 1 Hour looped"
    const youtubeTitleLimit = 100
    const requiredTitleLength = youtubeTitleLimit - suffix.length
    return sanitizedTitle.length > requiredTitleLength ? `${sanitizedTitle.slice(0, requiredTitleLength)} ${suffix}` : `${sanitizedTitle} ${suffix}`
}
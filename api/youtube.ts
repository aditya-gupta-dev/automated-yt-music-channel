import type { YoutubeVideo } from "../models"

function checkForYoutubeApiKey() {
    if (Bun.env.YOUTUBE_API_KEY) {
        return Bun.env.YOUTUBE_API_KEY
    } else {
        return undefined
    }
}

export async function fetchTrendingVideosByCountryCode(countryCode: string, maxResults: number = 30): Promise<YoutubeVideo[]>{
    const apiKey = checkForYoutubeApiKey()

    if (!apiKey) {
        console.log("Please provide a valid Youtube API Key")
        process.exit(1)
    }

    if (countryCode.length !== 2) {
        console.log("Please provide a valid country code")
        process.exit(1)
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=${countryCode}&maxResults=${maxResults}&videoCategoryId=${10}&key=${apiKey}`;


    const response = await fetch(apiUrl);

    if(!response.ok) {
        console.log('API responded with code :', response.status)
        return []
    }

    const data = await response.json();

    const items = data.items
    const res: YoutubeVideo[] = []

    for (let i = 0; i < items.length; i++) {
        res.push({
            id: items[i].id,
            title: items[i].snippet.title,
            tags: items[i].snippet.tags || [],
        })
    }

    return res
}

export async function fetchVideoDetails(videoId: string): Promise<YoutubeVideo | null> {   

    try {
        const apiKey = checkForYoutubeApiKey()

        if (!apiKey) {
            console.log("Please provide a valid Youtube API Key")
            process.exit(1)
        }

        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${apiKey}`

        const response = await fetch(apiUrl)

        if (!response.ok) {
            console.log('API responded with code :', response.status)
            return null
        }

        const data = await response.json()
        
        
        return {
            id: data.items[0].id,
            title: data.items[0].snippet.title,
            tags: data.items[0].snippet.tags || []
        }
    }
    catch (error) {
        console.error('Error fetching video details', videoId)
    }
    return null  
}
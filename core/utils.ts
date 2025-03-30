export function checkForValidUrl(url:string) {
    try {
        new URL(url)
        return true
    } catch (e) {
        console.log("Please provide a valid URL.")
        return false
    }
}

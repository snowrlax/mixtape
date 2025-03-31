# Mixtape Application

A nostalgic mixtape player that allows you to create a personalized playlist of up to 5 songs from YouTube videos and play them in a retro cassette tape interface.

## Features

- Add up to 5 YouTube songs to your mixtape
- Play, pause, skip forward/backward between songs
- Realistic cassette tape animation that synchronizes with playback
- Volume control and mute functionality
- Retro design with animated tape reels
- Share your mixtape with anyone via a URL

## How to Use

1. Clone and install the project:
   ```
   git clone <repository-url>
   cd mixtape
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

4. Copy YouTube video URLs and paste them into the input field.
   - The application accepts regular YouTube URLs, like:
   - `https://www.youtube.com/watch?v=VIDEO_ID`
   - `https://youtu.be/VIDEO_ID`

5. Click "Add Song" or press Enter to add the song to your mixtape (up to 5 songs).

6. Once you've added songs, click "Create Mixtape" to generate your mixtape.

7. You'll be taken to the playback page where you can:
   - Press Play/Pause to control playback
   - Use the Previous/Next buttons to change songs
   - Adjust volume with the volume slider
   - Toggle mute with the mute button

8. Share your mixtape with others by copying the URL - it contains all the video IDs needed to recreate your playlist!
   - Example: `/mixtape/playback?v=VIDEO_ID1,VIDEO_ID2,VIDEO_ID3`

## Implementation Details

This application uses the YouTube IFrame API to stream audio from YouTube videos. The player embeds a hidden YouTube player that handles the video playback and extracts the audio.

### URL-based Mixtape Sharing

The application uses URL query parameters to store the YouTube video IDs. This allows users to:
- Share their mixtape by just sharing the URL
- Bookmark their favorite mixtapes
- Create mixtapes programmatically by crafting URLs with specific video IDs

For developers:
- Built with Next.js and TypeScript
- Uses Tailwind CSS for styling
- Integrates the YouTube IFrame API for audio playback

## License

MIT

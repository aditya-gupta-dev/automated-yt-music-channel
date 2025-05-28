from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
import os
import pickle
import datetime
from pathlib import Path
import time

class YouTubeUploader:
    def __init__(self):
        self.SCOPES = ['https://www.googleapis.com/auth/youtube.upload']
        self.API_NAME = 'youtube'
        self.API_VERSION = 'v3'
        self.CLIENT_SECRETS_FILE = 'client_secrets.json'
        self.TOKEN_PICKLE_FILE = 'token.pickle'
        self.VALID_VIDEO_EXTENSIONS = ('.mp4', '.avi', '.mov', '.webm', '.mkv')
        self.credentials = None
        self.youtube = None

    def authenticate(self):
        """Handle OAuth2 authentication and token management."""
        if os.path.exists(self.TOKEN_PICKLE_FILE):
            with open(self.TOKEN_PICKLE_FILE, 'rb') as token:
                self.credentials = pickle.load(token)

        if not self.credentials or not self.credentials.valid:
            if self.credentials and self.credentials.expired and self.credentials.refresh_token:
                print("Refreshing access token...")
                self.credentials.refresh(Request())
            else:
                print("Initiating OAuth2 flow...")
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.CLIENT_SECRETS_FILE, self.SCOPES)
                self.credentials = flow.run_local_server(port=0)

            with open(self.TOKEN_PICKLE_FILE, 'wb') as token:
                pickle.dump(self.credentials, token)

        self.youtube = build(
            self.API_NAME, 
            self.API_VERSION, 
            credentials=self.credentials
        )

    def upload_video(self, video_path, title, description, privacy_status='private', publish_time=None):
        """Upload a video to YouTube with optional scheduled publishing."""
        # Verify file exists and is accessible
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found: {video_path}")

        body = {
            'snippet': {
                'title': title,
                'description': description,
                'tags': []
            },
            'status': {
                'privacyStatus': privacy_status
            }
        }

        # Add publishAt only if a specific time is provided
        if publish_time:
            body['status']['publishAt'] = publish_time

        try:
            media = MediaFileUpload(
                video_path,
                chunksize=1024*1024,
                resumable=True
            )

            request = self.youtube.videos().insert(
                part=','.join(body.keys()),
                body=body,
                media_body=media
            )

            print(f"Uploading {os.path.basename(video_path)}...")
            response = None
            while response is None:
                status, response = request.next_chunk()
                if status:
                    print(f"Uploaded {int(status.progress() * 100)}%")

            print(f"Upload Complete! Video ID: {response['id']}")
            return response['id']
        except Exception as e:
            print(f"Error during upload: {str(e)}")
            raise

    def batch_upload(self, video_folder, time_gap_minutes=30):
        """Upload multiple videos from a folder with scheduled publishing times."""
        try:
            # Convert to Path object if string is provided
            video_folder = Path(video_folder)
            
            # Get all video files with supported extensions
            video_files = []
            for ext in self.VALID_VIDEO_EXTENSIONS:
                video_files.extend(video_folder.glob(f'*{ext}'))
            
            video_files = sorted(video_files)

            if not video_files:
                print(f"No videos found in {video_folder}. Supported formats: {', '.join(self.VALID_VIDEO_EXTENSIONS)}")
                return

            # Start with current time plus 5 minutes for initial processing
            publish_time = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)

            for video_file in video_files:
                try:
                    # Format the publish time in ISO 8601 format
                    publish_time_str = publish_time.strftime('%Y-%m-%dT%H:%M:%SZ')
                    
                    # Use the filename without extension as the title
                    title = video_file.stem
                    description = f"Uploaded via Python script on {datetime.datetime.now().strftime('%Y-%m-%d')}"
                    
                    self.upload_video(
                        str(video_file),
                        title,
                        description,
                        privacy_status='private',
                        publish_time=publish_time_str
                    )
                    print(f"Video scheduled to go public at: {publish_time_str}")
                    
                    # Increment publish time for next video
                    publish_time += datetime.timedelta(minutes=time_gap_minutes)
                
                except Exception as e:
                    print(f"Error uploading {video_file.stem}: {str(e)}")
                    continue

        except Exception as e:
            print(f"Batch upload error: {str(e)}")

def main():
    uploader = YouTubeUploader()
    uploader.authenticate()
    
    # Use the current directory if no path is specified
    videos_folder = '.'  # or specify your path: 'path/to/your/videos'
    uploader.batch_upload(videos_folder)

if __name__ == '__main__':
    main()
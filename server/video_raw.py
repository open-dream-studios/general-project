import os
import random
import subprocess
import re
import sys
import yt_dlp

    
link = "https://youtu.be/1beH7w29t34"
# Run source venv/bin/activate
# python video_raw.py


def clean_temp_directory(temp_path="temp"):
    if os.path.exists(temp_path) and os.path.isdir(temp_path):
        for file_name in os.listdir(temp_path):
            file_path = os.path.join(temp_path, file_name)
            if os.path.isfile(file_path): 
                os.remove(file_path)

progress_data = {"status": "idle", "progress": 0.0} 
def progress_hook(d):
    global progress_data
    if d['status'] == 'downloading':
        progress_data["status"] = "downloading"
        percent_str = d.get('_percent_str', '0%').strip()
        match = re.search(r'(\d+\.\d+)%', percent_str)
        if match:
            progress_data["progress"] = float(match.group(1)) 
        else:
            progress_data["progress"] = 0.0
        print(progress_data["progress"])

        
    elif d['status'] == 'finished':
        progress_data["status"] = "finished"
        progress_data["progress"] = "100%"
        print(progress_data["progress"])
        
def download_yt_video(video_url, name):
    download_dir = "./temp"
    os.makedirs(download_dir, exist_ok=True)
    ydl_opts = {
        'format': 'bestvideo+bestaudio/best',
        'outtmpl': f"{download_dir}/{name}.mp4",
        'merge_output_format': 'mp4',
        'noplaylist': True,
        'progress_hooks': [progress_hook],
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([video_url])

def is_valid_timestamp(ts):
    return ts.count(':') == 1 and all(part.isdigit() for part in ts.split(':'))

def main():
    clean_temp_directory()
    
    # Download and clip the video
    download_yt_video(link, "video")
  
    def trim_video(video_path, output_path):
        command = [
            'ffmpeg',
            '-i', video_path,
            '-vcodec', 'copy',
            '-acodec', 'copy',
            '-avoid_negative_ts', 'make_zero',
            output_path
        ]
        try:
            subprocess.run(command, check=True)
        except subprocess.CalledProcessError as e:
            print(f'Error trimming video: {e}')
    
    format_option = 2
    video_path = "./temp/video.mp4"
    
    output_path = "./temp/clip.mp4"
    trim_video(video_path, output_path)

    print("done bitch")
    # clean_temp_directory()
    
if __name__ == "__main__":
    main()
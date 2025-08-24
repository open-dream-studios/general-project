import os
import random
import subprocess
import re
import sys
import yt_dlp
import json
import shutil

if len(sys.argv) < 3:
  print("Not enough arguments")
  sys.exit(1)
    
link = sys.argv[1]
start_time = sys.argv[2]
end_time = sys.argv[3]


def get_video_length(video_path):
    """Returns video duration in seconds as float."""
    command = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "json",
        video_path
    ]
    result = subprocess.run(command, capture_output=True, text=True, check=True)
    duration = json.loads(result.stdout)["format"]["duration"]
    return float(duration)

def time_to_seconds(timestr):
    """Converts #:##, ##:##, #:##:##, or ##:##:## into seconds (float)."""
    if timestr in (None, "", "undefined"):
        return None
    parts = [int(p) for p in timestr.split(":")]
    if len(parts) == 2:  # MM:SS
        m, s = parts
        return m * 60 + s
    elif len(parts) == 3:  # HH:MM:SS
        h, m, s = parts
        return h * 3600 + m * 60 + s
    elif len(parts) == 1:  # SS only (just in case)
        return parts[0]
    return None

def ensure_mp4(input_path, output_path):
    """Convert any format (webm, mkv, etc.) to mp4 with re-encoding if needed."""
    if input_path.lower().endswith(".mp4"):
        # Already mp4 → just rename/copy
        shutil.move(input_path, output_path)
        return output_path
    
    command = [
        "ffmpeg", "-y",
        "-i", input_path,
        "-c:v", "libx264", "-preset", "fast", "-c:a", "aac", "-b:a", "192k",
        output_path
    ]
    subprocess.run(command, check=True)
    return output_path

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
        percent_str = d.get('_percent_str', '0%').strip()
        match = re.search(r'(\d+(?:\.\d+)?)%', percent_str)
        if match:
            percent = match.group(1)
            
            # 👇 Determine type based on filename
            filename = d.get("filename", "").lower()
            if filename.endswith(".mp4"):
                stream_type = "video"
            elif filename.endswith(".webm") or filename.endswith(".m4a"):
                stream_type = "audio"
            else:
                stream_type = "unknown"

            print(f"{stream_type}:{percent}", flush=True)

    elif d['status'] == 'finished':
        # finished event → send 100%
        filename = d.get("filename", "").lower()
        if filename.endswith(".mp4"):
            stream_type = "video"
        elif filename.endswith(".webm") or filename.endswith(".m4a"):
            stream_type = "audio"
        else:
            stream_type = "unknown"

        print(f"{stream_type}:100", flush=True)
        
def download_yt_video(video_url, name):
    try:
        download_dir = "./temp"
        os.makedirs(download_dir, exist_ok=True)
        ydl_opts = {
            'format': 'bestvideo+bestaudio/best',
            'outtmpl': f"{download_dir}/{name}.mp4",
            'merge_output_format': 'mp4',
            'noplaylist': True,
            'progress_hooks': [progress_hook],
            # "noprogress": True,
            # "quiet": True,  
            "cookiefile": "cookies.txt",
            # "proxy": "http://username:password@geo.iproyal.com:12321",
            # "retries": 10,                 # default is 10 but you can increase
            # "http_chunk_size": 10485760,   # 10MB chunks (helps flaky connections)
            # "socket_timeout": 60, 
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])
    except yt_dlp.utils.DownloadError as e:
        print(f"download_error:{str(e)}", flush=True)
        # Exit gracefully with code 0 so Node still responds
        sys.exit(0)

# def download_yt_video(video_url, name):
#     download_dir = "./temp"
#     os.makedirs(download_dir, exist_ok=True)
#     ydl_opts = {
#         # Only progressive mp4 (no fragments, no empty files)
#         "format": "best[ext=mp4]/best",
#         "outtmpl": f"{download_dir}/{name}.%(ext)s",
#         "noplaylist": True,
#         "progress_hooks": [progress_hook],
#         "merge_output_format": "mp4",
#         "noprogress": True,
#         "quiet": True, 
#     }
#     with yt_dlp.YoutubeDL(ydl_opts) as ydl:
#         info = ydl.extract_info(video_url, download=True)
#         return ydl.prepare_filename(info)

def is_valid_timestamp(ts):
    return ts.count(':') == 1 and all(part.isdigit() for part in ts.split(':'))

def main():
    clean_temp_directory()
    
    # Download and clip the video
    download_yt_video(link, "video")
    # print(downloaded_path)
    # video_path = ensure_mp4(downloaded_path, "./temp/video.mp4")
    
    def trim_video(video_path, output_path, start_time, end_time):
        video_length = get_video_length(video_path)
        
        print("START", start_time)
        start_sec = time_to_seconds(start_time)
        end_sec = time_to_seconds(end_time)

        # Case 1: both defined
        if start_sec is not None and end_sec is not None:
            if start_sec >= video_length:  
                # start is beyond video → just rename
                shutil.move(video_path, output_path)
                return
            if end_sec > video_length:
                end_sec = video_length
            if start_sec >= end_sec:
                # invalid range → rename instead of trimming
                shutil.move(video_path, output_path)
                return

            command = [
                "ffmpeg", "-y",
                "-ss", str(start_sec),
                "-to", str(end_sec),
                "-i", video_path,
                "-vcodec", "copy", "-acodec", "copy",
                "-avoid_negative_ts", "make_zero",
                output_path
            ]

        # Case 2: start defined, end = ""
        elif start_sec is not None and end_sec is None:
            if start_sec >= video_length:
                shutil.move(video_path, output_path)
                return

            command = [
                "ffmpeg", "-y",
                "-ss", str(start_sec),
                "-i", video_path,
                "-vcodec", "copy", "-acodec", "copy",
                "-avoid_negative_ts", "make_zero",
                output_path
            ]

        # Case 3: start = "", end defined
        elif start_sec is None and end_sec is not None:
            if end_sec > video_length:
                shutil.move(video_path, output_path)
                return

            command = [
                "ffmpeg", "-y",
                "-to", str(end_sec),
                "-i", video_path,
                "-vcodec", "copy", "-acodec", "copy",
                "-avoid_negative_ts", "make_zero",
                output_path
            ]

        else:
            # You said you already handle both empty upstream → no action here
            shutil.move(video_path, output_path)
            return

        try:
            subprocess.run(command, check=True)
        except subprocess.CalledProcessError as e:
            print(f"Error trimming video: {e}")
            

    format_option = 2
    video_path = "./temp/video.mp4"
    
    # Cut -> Exact timing -> Shows black screen till first keyframe
    if format_option == 1:
      os.system(f"ffmpeg -i {video_path} -ss {start_time} -to {end_time} -c copy ./temp/clip.mp4")
    
    # Backtrack (Recommended) -> Inexact timing | Quick
    elif format_option == 2:
      output_path = "./temp/clip.mp4"
      trim_video(video_path, output_path, start_time, end_time)
    
    # Re-encode -> Exact timing -> Slow
    elif format_option == 3:
      os.system(f'ffmpeg -i {video_path} -ss {start_time} -to {end_time} -c:v libx264 -preset ultrafast -c:a copy ./temp/clip.mp4')
    
    print("done bitch")
    # clean_temp_directory()
    
if __name__ == "__main__":
    main()
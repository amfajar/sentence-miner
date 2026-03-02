
import subprocess
cmd = [
    \'ffmpeg\', \'-y\', \'-hide_banner\', \'-loglevel\', \'-error\', \'-nostdin\',
    \'-ss\', \'1.000\',
    \'-i\', \'test.mp4\',
    \'-map\', \'0:a?\',
    \'-t\', \'2.000\',
    \'-acodec\', \'libmp3lame\',
    \'-q:a\', \'5\',
    \'out_audio.mp3\',
    \'-map\', \'0:v?\',
    \'-ss\', \'0.000\',
    \'-vframes\', \'1\',
    \'-q:v\', \'5\',
    \'-vf\', \'scale=min(960\\,iw):-2\',
    \'out_frame.jpg\'
]
print(cmd)
# subprocess.run(cmd)

#!/bin/sh

palette="/tmp/palette.png"

filters="fps=5,scale=320:-1:flags=lanczos"

ffmpeg -v warning -f concat -i $1 -framerate 5 -vf "$filters,palettegen" -y $palette
ffmpeg -v warning -f concat -i $1 -framerate 5 -i $palette -lavfi "$filters [x]; [x][1:v] paletteuse" -y $2

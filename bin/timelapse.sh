#!/bin/bash
ffmpeg -f concat -i timelapse.txt -framerate 5 /opt/db/timelapse/timelapse.m4v

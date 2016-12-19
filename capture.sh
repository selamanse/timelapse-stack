#!/bin/bash

TL_DEVICE="CAMERA"
TL_STORAGE_ROOT="./capture"
TL_FOLDER_PATTERN="%Y/%m/%d/%H"
TL_FILE_PATTERN="%Y%m%d%H%M%S"
TL_FILE_SUFFIX=".jpg"
TL_SERVICE_HOST=localhost
TL_SERVICE_PORT=3031

if [ -z "${TL_CAPTURE_URL+x}" ] 
 then     
    echo "TL_CAPTURE_URL variable is not set"
    exit 1
fi

FORMATTED_FILENAME=$(echo "$TL_FILE_PATTERN$TL_FILE_SUFFIX" | awk '{ print strftime($0); }')
STORAGE_PATH=$(echo "$TL_STORAGE_ROOT/$TL_FOLDER_PATTERN" | awk '{ print strftime($0); }')

REQUEST_PAYLOAD="dev=$TL_DEVICE&fs_path=$TL_STORAGE_ROOT/$TL_FOLDER_PATTERN&\
idx_path=$TL_STORAGE_ROOT/$TL_FOLDER_PATTERN/$TL_FILE_PATTERN$TL_FILE_SUFFIX&\
idx_path_medium=$TL_STORAGE_ROOT/$TL_FOLDER_PATTERN/${TL_FILE_PATTERN}_medium$TL_FILE_SUFFIX&\
idx_path_small=$TL_STORAGE_ROOT/$TL_FOLDER_PATTERN/${TL_FILE_PATTERN}_small$TL_FILE_SUFFIX&\
year=%Y&month=%m&day=%d&hour=%H&minute=%M&second=%S&date=%F&unixtime=%s&time=%H:%M:%S&tz=%Z&week=%V"

FORMATTED_REQUEST_PAYLOAD=$(echo "$REQUEST_PAYLOAD" | awk '{ print strftime($0); }')

mkdir -p $STORAGE_PATH && \
curl -so $STORAGE_PATH/$FORMATTED_FILENAME $TL_CAPTURE_URL && \
curl -sG "http://$TL_SERVICE_HOST:$TL_SERVICE_PORT/add" -d "$FORMATTED_REQUEST_PAYLOAD"

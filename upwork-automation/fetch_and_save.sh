#!/bin/bash
LOG_FILE="/var/log/fetch_and_save.log"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
RESPONSE=$(curl -s -X POST -d 'page=1&limit=50' http://44.196.92.103:8001/fetch-and-save/)
if [ $? -eq 0 ]; then
  echo "$TIMESTAMP - Success: $RESPONSE" >> "$LOG_FILE"
else
  echo "$TIMESTAMP - Error: Fetch failed with status $?" >> "$LOG_FILE"
  echo "Response: $RESPONSE" >> "$LOG_FILE"
fi
#!/usr/bin/env bash
set -euo pipefail

BUCKET="luckybgm-assets"
AMBIENT_DIR="BGM/ambient"

if [ ! -d "$AMBIENT_DIR" ]; then
  echo "Error: '$AMBIENT_DIR' directory not found."
  echo "Please download ambient sound files (MP3) and place them in $AMBIENT_DIR/"
  echo ""
  echo "Expected files:"
  echo "  rain.mp3, thunder.mp3, wind.mp3, fire.mp3, birds.mp3"
  echo "  waves.mp3, river.mp3, crickets.mp3, cafe.mp3, train.mp3"
  echo ""
  echo "Source: https://pixabay.com/sound-effects/ (CC0 license, requires login)"
  exit 1
fi

count=0
for file in "$AMBIENT_DIR"/*.mp3; do
  [ -f "$file" ] || { echo "No MP3 files found in $AMBIENT_DIR/"; exit 1; }
  filename=$(basename "$file")
  key="ambient/${filename}"
  echo "Uploading: $filename → r2://${BUCKET}/${key}"
  wrangler r2 object put "${BUCKET}/${key}" \
    --file="$file" \
    --content-type="audio/mpeg" \
    --remote
  count=$((count + 1))
done

echo ""
echo "Done! Uploaded ${count} file(s) to R2."
echo "Files are accessible at: \${NEXT_PUBLIC_BGM_BASE_URL}/ambient/<filename>"

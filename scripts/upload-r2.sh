#!/bin/bash
# Upload BGM files to Cloudflare R2
# Usage: ./scripts/upload-r2.sh
#
# Prerequisites:
#   npm install -g wrangler
#   wrangler login

BUCKET="luckybgm-assets"
BGM_DIR="BGM"

if [ ! -d "$BGM_DIR" ]; then
  echo "Error: BGM directory not found"
  exit 1
fi

echo "Uploading BGM files to R2 bucket: $BUCKET"
echo "========================================="

count=0
for style_dir in "$BGM_DIR"/*/; do
  style=$(basename "$style_dir")

  for file in "$style_dir"*.mp3; do
    [ -f "$file" ] || continue
    filename=$(basename "$file")
    key="${style}/${filename}"

    echo "Uploading: $key"
    npx wrangler r2 object put "${BUCKET}/${key}" \
      --file="$file" \
      --content-type="audio/mpeg" \
      --remote

    if [ $? -eq 0 ]; then
      echo "  Done"
      count=$((count + 1))
    else
      echo "  FAILED"
    fi
  done
done

echo "========================================="
echo "Uploaded $count files to R2"
echo ""
echo "Public URL base: https://pub-9efd488938a74c849abd6727cf500e68.r2.dev"
echo ""
echo "Next steps:"
echo "  1. Set Vercel env var: NEXT_PUBLIC_BGM_BASE_URL=https://pub-9efd488938a74c849abd6727cf500e68.r2.dev"
echo "  2. Redeploy on Vercel"

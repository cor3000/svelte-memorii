#!/bin/bash
set -e

#increment service worker cache version
export sw_js=public/sw.js
export oldver=`grep -Eo 'CACHE_VERSION = [^;}]+' $sw_js | grep -Eo '[0-9]+'`
export newver=`expr $oldver + 1`
sed -i "s/CACHE_VERSION = $oldver;\$/CACHE_VERSION = $newver;/g" public/sw.js

rm -rf public/build/
npm run build
npm run surge

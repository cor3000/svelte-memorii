#!/bin/bash
set -e
rm -rf public/build/
npm run build
npm run surge

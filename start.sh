#!/usr/bin/env bash
echo "==================================================="
echo "  NOVA — Jujutsu Kaisen Domain Expansion Engine"
echo "==================================================="
echo "Starting local web server..."

if which xdg-open > /dev/null; then
  xdg-open "http://localhost:8000" &
elif which open > /dev/null; then
  open "http://localhost:8000" &
fi

python3 -m http.server 8000 || python -m http.server 8000

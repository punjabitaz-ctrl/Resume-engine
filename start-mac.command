#!/bin/bash
# Double-click to start Resume Engine. Keep the Terminal window open while you use the app.
cd "$(dirname "$0")"
if command -v python3 >/dev/null 2>&1 && python3 -c 'import sys' >/dev/null 2>&1; then
  exec python3 serve.py
fi
echo "Python 3 is not installed, so Resume Engine cannot start."
echo "Install it from python.org (see START-HERE), then double-click this file again."
read -r -p "Press Enter to close this window."

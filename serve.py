"""Start Resume Engine on this computer.

Serves this folder at http://localhost:8000 and opens it in your browser.
Only this computer can reach it. Close this window (or press Ctrl+C) to stop.

The app keeps your data under that exact address, so always start it this way.
Opening index.html directly, or using another port, shows an empty app.
"""
import http.server, os, socketserver, sys, threading, time, urllib.request, webbrowser

HOST, PORT = "127.0.0.1", 8000
URL = "http://localhost:%d/" % PORT
CHECK = "http://%s:%d/" % (HOST, PORT)
ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    # Set the types here: some Windows setups report .js as plain text, and the browser then refuses to load the PDF reader.
    extensions_map = {
        "": "application/octet-stream", ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
        ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json",
        ".md": "text/plain; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml",
        ".png": "image/png", ".ico": "image/x-icon", ".woff2": "font/woff2",
    }

    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def log_message(self, *a):
        pass


def already_running():
    try:
        with urllib.request.urlopen(CHECK, timeout=2) as r:
            return b"Resume Engine" in r.read(4000)
    except Exception:
        return False


def main():
    socketserver.TCPServer.allow_reuse_address = False
    try:
        httpd = http.server.ThreadingHTTPServer((HOST, PORT), Handler)
    except OSError:
        if already_running():
            print("Resume Engine is already running. Opening it in your browser.")
            webbrowser.open(URL)
            time.sleep(2)
            return 0
        print("Port %d is used by another program, so Resume Engine cannot start." % PORT)
        print("Close that program, or restart the computer, then try again.")
        input("Press Enter to close this window.")
        return 1
    threading.Timer(1.0, lambda: webbrowser.open(URL)).start()
    print("Resume Engine is running at " + URL)
    print("Keep this window open while you use the app. Close it when you are done.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    return 0


if __name__ == "__main__":
    sys.exit(main())

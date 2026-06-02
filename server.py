#!/usr/bin/env python3
import http.server, json, os, sys, urllib.parse

PORT = int(os.environ.get("PORT", 3000))
BASE = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.environ.get("DATA_DIR", BASE)
STATE_FILE = os.path.join(DATA_DIR, "tracker-improvements.state.json")

MIME = {
    ".html": "text/html", ".css": "text/css",
    ".js": "text/javascript", ".json": "application/json",
    ".png": "image/png", ".jpg": "image/jpeg",
    ".svg": "image/svg+xml", ".ico": "image/x-icon",
}

class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass  # quiet

    def send(self, code, ctype, body):
        b = body if isinstance(body, bytes) else body.encode()
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", len(b))
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(b)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        if path == "/api/state":
            if os.path.exists(STATE_FILE):
                data = open(STATE_FILE).read()
            else:
                data = "[]"
            self.send(200, "application/json", data)
            return
        # route / and /internal -> internal.html, /client -> client.html
        if path in ("/", "/internal", "/internal.html"):
            path = "/internal.html"
        elif path in ("/client", "/client.html"):
            path = "/client.html"
        file_path = os.path.join(BASE, path.lstrip("/"))
        ext = os.path.splitext(file_path)[1]
        mime = MIME.get(ext, "text/plain")
        try:
            with open(file_path, "rb") as f:
                self.send(200, mime, f.read())
        except FileNotFoundError:
            self.send(404, "text/plain", "Not found")

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path
        if path == "/api/state":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            try:
                json.loads(body)  # validate
                with open(STATE_FILE, "wb") as f:
                    f.write(body)
                self.send(200, "application/json", '{"ok":true}')
            except Exception as e:
                self.send(400, "text/plain", "Invalid JSON")
        else:
            self.send(404, "text/plain", "Not found")

print(f"\nTustin Report Improvements Tracker")
print(f"───────────────────────────────────")
print(f"Internal view: http://localhost:{PORT}/")
print(f"Client view:   http://localhost:{PORT}/client")
print(f"\nBoth views update live. Share either URL.\n")

server = http.server.HTTPServer(("", PORT), Handler)
server.serve_forever()

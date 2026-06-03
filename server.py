#!/usr/bin/env python3
import http.server, json, os, urllib.parse

PORT = int(os.environ.get("PORT", 3000))
BASE = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = os.environ.get("DATABASE_URL")
DATA_DIR = os.environ.get("DATA_DIR", BASE)
STATE_FILE = os.path.join(DATA_DIR, "tracker-improvements.state.json")

MIME = {
    ".html": "text/html", ".css": "text/css",
    ".js": "text/javascript", ".json": "application/json",
    ".png": "image/png", ".jpg": "image/jpeg",
    ".svg": "image/svg+xml", ".ico": "image/x-icon",
}

# ---------- storage backend ----------

def get_db_conn():
    import psycopg2
    return psycopg2.connect(DATABASE_URL)

def db_init():
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS state (
            id INTEGER PRIMARY KEY DEFAULT 1,
            data JSONB NOT NULL DEFAULT '[]'::jsonb,
            CHECK (id = 1)
        )
    """)
    cur.execute("INSERT INTO state (id, data) VALUES (1, '[]'::jsonb) ON CONFLICT DO NOTHING")
    conn.commit()
    cur.close()
    conn.close()

def db_read():
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("SELECT data FROM state WHERE id = 1")
    row = cur.fetchone()
    cur.close()
    conn.close()
    return json.dumps(row[0] if row else [])

def db_write(data_str):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("UPDATE state SET data = %s::jsonb WHERE id = 1", (data_str,))
    conn.commit()
    cur.close()
    conn.close()

def read_state():
    if DATABASE_URL:
        return db_read()
    if os.path.exists(STATE_FILE):
        return open(STATE_FILE).read()
    return "[]"

def write_state(data_str):
    if DATABASE_URL:
        db_write(data_str)
    else:
        with open(STATE_FILE, "w") as f:
            f.write(data_str)

# Init DB table on startup
if DATABASE_URL:
    try:
        db_init()
        print("Connected to PostgreSQL")
    except Exception as e:
        print(f"DB init error: {e}")

# ---------- HTTP handler ----------

class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

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
            self.send(200, "application/json", read_state())
            return
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
            body = self.rfile.read(length).decode()
            try:
                json.loads(body)
                write_state(body)
                self.send(200, "application/json", '{"ok":true}')
            except Exception as e:
                self.send(400, "text/plain", f"Error: {e}")
        else:
            self.send(404, "text/plain", "Not found")

print(f"\nTustin Report Improvements Tracker")
print(f"───────────────────────────────────")
print(f"Internal view: http://localhost:{PORT}/")
print(f"Client view:   http://localhost:{PORT}/client")
print(f"Storage: {'PostgreSQL' if DATABASE_URL else 'local file'}\n")

server = http.server.HTTPServer(("", PORT), Handler)
server.serve_forever()

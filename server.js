const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const STATE_FILE = path.join(__dirname, "tracker-improvements.state.json");

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".jsx": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function serveStatic(res, filePath) {
  const ext = path.extname(filePath);
  const mime = MIME[ext] || "text/plain";
  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { "Content-Type": mime, "Cache-Control": "no-cache" });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // API: read state
  if (req.method === "GET" && pathname === "/api/state") {
    try {
      const data = fs.existsSync(STATE_FILE) ? fs.readFileSync(STATE_FILE, "utf8") : "[]";
      res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-cache" });
      res.end(data);
    } catch {
      res.writeHead(500);
      res.end("Error reading state");
    }
    return;
  }

  // API: write state
  if (req.method === "POST" && pathname === "/api/state") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        JSON.parse(body); // validate JSON
        fs.writeFileSync(STATE_FILE, body, "utf8");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end('{"ok":true}');
      } catch {
        res.writeHead(400);
        res.end("Invalid JSON");
      }
    });
    return;
  }

  // Static files
  let filePath;
  if (pathname === "/" || pathname === "/internal" || pathname === "/internal.html") {
    filePath = path.join(__dirname, "internal.html");
  } else if (pathname === "/client" || pathname === "/client.html") {
    filePath = path.join(__dirname, "client.html");
  } else {
    filePath = path.join(__dirname, pathname.slice(1));
  }

  serveStatic(res, filePath);
});

server.listen(PORT, () => {
  console.log(`\nTustin Report Improvements Tracker`);
  console.log(`───────────────────────────────────`);
  console.log(`Internal view: http://localhost:${PORT}/`);
  console.log(`Client view:   http://localhost:${PORT}/client`);
  console.log(`\nBoth views update live. Share either URL with your team.\n`);
});

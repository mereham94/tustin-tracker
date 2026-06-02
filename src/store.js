// Live sync store: polls /api/state every 4 seconds and writes via POST.
const POLL_MS = 4000;

function useStore() {
  const SEED = window.IMPROVEMENTS;
  const [list, setList] = React.useState(SEED);
  const [synced, setSynced] = React.useState(false);
  const lastJson = React.useRef(JSON.stringify(SEED));

  async function pull() {
    try {
      const r = await fetch("/api/state?t=" + Date.now(), { cache: "no-store" });
      if (!r.ok) return;
      const j = await r.json();
      if (Array.isArray(j) && j.length) {
        const s = JSON.stringify(j);
        if (s !== lastJson.current) {
          lastJson.current = s;
          setList(j);
        }
        setSynced(true);
      }
    } catch { /* offline — keep seed */ }
  }

  React.useEffect(() => {
    pull();
    const id = setInterval(pull, POLL_MS);
    function onVis() { if (!document.hidden) pull(); }
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  function save(next) {
    lastJson.current = JSON.stringify(next);
    fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    }).catch(() => {});
  }

  function add(it) {
    setList((prev) => {
      const next = [it, ...prev];
      save(next);
      return next;
    });
  }

  function update(it) {
    setList((prev) => {
      const next = prev.map((x) => x.id === it.id ? it : x);
      save(next);
      return next;
    });
  }

  return [list, add, update, synced];
}

Object.assign(window, { useStore });

const { useState: useS, useMemo } = React;

function App() {
  const MODE = window.TRACKER_MODE || "internal";
  const clientLocked = MODE === "client";
  const [audience, setAudience] = useS(clientLocked ? "client" : "internal");
  const [list, addToStore, synced] = useStore();
  const [query, setQuery] = useS("");
  const [report, setReport] = useS("all");
  const [status, setStatus] = useS("all");
  const [selected, setSelected] = useS(null);
  const [addOpen, setAddOpen] = useS(false);
  const [layout, setLayout] = useS("timeline");
  const [showRail, setShowRail] = useS(true);
  const [accent, setAccent] = useS("#2F6BD8");
  const [density, setDensity] = useS("regular");
  const [tweaksOpen, setTweaksOpen] = useS(false);

  const client = clientLocked || audience === "client";

  const sorted = useMemo(
    () => [...list].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [list]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((i) => {
      const reps = Array.isArray(i.report) ? i.report : [i.report];
      if (report !== "all" && !reps.includes(report)) return false;
      if (status !== "all" && i.status !== status) return false;
      if (q) {
        const hay = (i.title + i.what + i.why + i.requester.name + reps.join(" ") + i.impact.join(" ")).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [sorted, query, report, status]);

  const reportCounts = useMemo(() => {
    const m = { all: list.length };
    window.REPORTS.forEach((r) => (m[r] = 0));
    list.forEach((i) => {
      const reps = Array.isArray(i.report) ? i.report : [i.report];
      reps.forEach((r) => (m[r] = (m[r] || 0) + 1));
    });
    return m;
  }, [list]);

  const statusCounts = useMemo(() => {
    const m = { all: list.length, shipped: 0, "in-progress": 0, planned: 0 };
    list.forEach((i) => (m[i.status]++));
    return m;
  }, [list]);

  function addItem(it) {
    addToStore(it);
    setTimeout(() => setSelected(it), 120);
  }

  const groups = useMemo(() => {
    const out = [];
    let cur = null;
    filtered.forEach((i) => {
      const k = window.monthKey(i.date);
      if (!cur || cur.key !== k) { cur = { key: k, items: [] }; out.push(cur); }
      cur.items.push(i);
    });
    return out;
  }, [filtered]);

  const styleVars = { "--accent": accent, "--accent-soft": accent + "1A" };

  return (
    <div className="app" data-density={density} style={styleVars}>
      {showRail && (
        <nav className="rail">
          <div className="rail-head">
            <span className="rail-eyebrow">Filter by report</span>
          </div>
          <ul className="rail-list">
            <RailItem label="All reports" count={reportCounts.all} active={report === "all"} onClick={() => setReport("all")} all />
            {window.REPORTS.map((r) => (
              <RailItem key={r} label={r} count={reportCounts[r]} active={report === r} onClick={() => setReport(r)} />
            ))}
          </ul>
          <div className="rail-foot">
            <div className="rail-legend-title">Status</div>
            {window.STATUSES.map((s) => (
              <div key={s.key} className="legend-row">
                <StatusPill status={s.key} dot />
                <span>{s.label}</span>
                <span className="legend-count">{statusCounts[s.key]}</span>
              </div>
            ))}
          </div>
        </nav>
      )}

      <main className="main">
        <header className="head">
          <div className="head-crumb">
            <span>Session Analytics</span>
            <Icon name="chevron" size={13} />
            <span className="crumb-cur">Report Changes & Improvements</span>
          </div>
          <div className="head-row">
            <div>
              <h1 className="head-title">Report Changes & Improvements</h1>
              <p className="head-sub">
                {client
                  ? "Improvements we’ve made to your reports — shaped by your feedback."
                  : "What’s changing across the analytics reports — and why we changed it."}
              </p>
            </div>
            <div className="head-actions">
              {synced && (
                <span className="live-tag" title="Changes sync automatically">
                  <span className="live-dot"></span> Live
                </span>
              )}
              {!clientLocked && (
                <div className="aud-toggle" role="group" aria-label="Audience view">
                  <button className={"aud-btn" + (!client ? " on" : "")} onClick={() => setAudience("internal")}>Internal</button>
                  <button className={"aud-btn" + (client ? " on" : "")} onClick={() => setAudience("client")}>Client view</button>
                </div>
              )}
              {!client && (
                <button className="btn primary add-btn" onClick={() => setAddOpen(true)}>
                  <Icon name="plus" size={16} /> Log improvement
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="toolbar">
          <div className="search">
            <Icon name="search" size={16} style={{ color: "var(--muted)" }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search improvements, people, reports…" />
            {query && <button className="clear" onClick={() => setQuery("")}><Icon name="close" size={13} /></button>}
          </div>
          <div className="status-filter">
            <FilterChip label="All" count={statusCounts.all} active={status === "all"} onClick={() => setStatus("all")} />
            {window.STATUSES.map((s) => (
              <FilterChip key={s.key} label={s.label} count={statusCounts[s.key]}
                status={s.key} active={status === s.key} onClick={() => setStatus(s.key)} />
            ))}
          </div>
        </div>

        <div className="result-line">
          <span className="result-count">{filtered.length} improvement{filtered.length === 1 ? "" : "s"}</span>
          {(report !== "all" || status !== "all" || query) && (
            <button className="reset-link" onClick={() => { setReport("all"); setStatus("all"); setQuery(""); }}>
              Clear filters
            </button>
          )}
          {!clientLocked && (
            <button className="reset-link" style={{ marginLeft: "auto" }} onClick={() => setTweaksOpen(v => !v)}>
              ⚙ Display
            </button>
          )}
        </div>

        <div className="scroll-area">
          {filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon"><Icon name="search" size={22} /></div>
              <p>No improvements match those filters.</p>
            </div>
          ) : layout === "table" ? (
            <TableView items={filtered} onOpen={setSelected} selected={selected} />
          ) : (
            <div className="timeline">
              {groups.map((g) => (
                <div key={g.key} className="tl-group">
                  <div className="tl-month"><span>{g.key}</span></div>
                  {g.items.map((i) => (
                    <TimelineItem key={i.id} item={i} onOpen={setSelected}
                      active={selected && selected.id === i.id} />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <DetailDrawer item={selected} onClose={() => setSelected(null)} client={client} />
      <AddModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={addItem} />

      {tweaksOpen && !clientLocked && (
        <DisplayPanel
          layout={layout} setLayout={setLayout}
          showRail={showRail} setShowRail={setShowRail}
          accent={accent} setAccent={setAccent}
          density={density} setDensity={setDensity}
          onClose={() => setTweaksOpen(false)}
        />
      )}
    </div>
  );
}

function RailItem({ label, count, active, onClick, all }) {
  return (
    <li>
      <button className={"rail-item" + (active ? " active" : "") + (all ? " all" : "")} onClick={onClick}>
        <span className="rail-label">{label}</span>
        <span className="rail-count">{count}</span>
      </button>
    </li>
  );
}

function FilterChip({ label, count, active, onClick, status }) {
  return (
    <button className={"fchip" + (active ? " active" : "")} onClick={onClick}>
      {status && <StatusPill status={status} dot />}
      {label}
      <span className="fchip-count">{count}</span>
    </button>
  );
}

function TableView({ items, onOpen, selected }) {
  return (
    <table className="tbl">
      <thead>
        <tr>
          <th>Improvement</th>
          <th className="th-rep">Report</th>
          <th className="th-st">Status</th>
          <th className="th-req">Requested by</th>
          <th className="th-dt">Date</th>
        </tr>
      </thead>
      <tbody>
        {items.map((i) => (
          <tr key={i.id} className={selected && selected.id === i.id ? "sel" : ""} onClick={() => onOpen(i)}>
            <td>
              <div className="td-title">{i.title}</div>
              <div className="td-what">{i.what}</div>
            </td>
            <td><ReportTags report={i.report} small /></td>
            <td><StatusPill status={i.status} /></td>
            <td>
              <span className="td-req">
                <Avatar name={i.requester.name} initials={i.requester.initials} size={24} />
                {i.requester.name}
              </span>
            </td>
            <td className="td-dt">{window.fmtDate(i.date)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const ACCENT_OPTIONS = ["#2F6BD8", "#1F8A5B", "#7A5AE0", "#C2410C", "#0F766E"];

function DisplayPanel({ layout, setLayout, showRail, setShowRail, accent, setAccent, density, setDensity, onClose }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 60,
      background: "var(--card)", border: "1px solid var(--line)",
      borderRadius: 14, padding: "18px 20px", minWidth: 240,
      boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column", gap: 14,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Display</span>
        <button className="icon-btn" onClick={onClose}><Icon name="close" size={16} /></button>
      </div>
      <PanelRow label="Layout">
        <SegControl options={["timeline", "table"]} value={layout} onChange={setLayout} />
      </PanelRow>
      <PanelRow label="Density">
        <SegControl options={["compact", "regular", "comfy"]} value={density} onChange={setDensity} />
      </PanelRow>
      <PanelRow label="Sidebar">
        <button className={"seg-btn" + (showRail ? " on" : "")} style={{ flex: "none", padding: "6px 12px" }}
          onClick={() => setShowRail(v => !v)}>
          {showRail ? "Visible" : "Hidden"}
        </button>
      </PanelRow>
      <PanelRow label="Accent">
        <div style={{ display: "flex", gap: 6 }}>
          {ACCENT_OPTIONS.map((c) => (
            <button key={c} onClick={() => setAccent(c)} style={{
              width: 22, height: 22, borderRadius: "50%", background: c, border: "none",
              outline: accent === c ? "2px solid " + c : "none",
              outlineOffset: 2, cursor: "pointer",
            }} />
          ))}
        </div>
      </PanelRow>
    </div>
  );
}

function PanelRow({ label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <span style={{ fontSize: 13, color: "var(--muted)", whiteSpace: "nowrap" }}>{label}</span>
      {children}
    </div>
  );
}

function SegControl({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {options.map((o) => (
        <button key={o} className={"seg-btn" + (value === o ? " on" : "")}
          style={{ padding: "5px 10px", fontSize: 12 }}
          onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

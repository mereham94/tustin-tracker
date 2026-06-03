const { useState, useEffect, useRef } = React;

/* ---------- helpers ---------- */
function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function monthKey(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
function relTime(iso) {
  const d = new Date(iso + "T00:00:00");
  const now = new Date();
  const days = Math.round((now - d) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return days + " days ago";
  if (days < 30) return Math.round(days / 7) + " wk ago";
  if (days < 365) return Math.round(days / 30) + " mo ago";
  return Math.round(days / 365) + " yr ago";
}

const AVATAR_HUES = [212, 168, 28, 280, 340, 130];
function avatarHue(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 997;
  return AVATAR_HUES[h % AVATAR_HUES.length];
}

/* ---------- icons ---------- */
function Icon({ name, size = 16, style }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", style };
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    close: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    chevron: <polyline points="9 6 15 12 9 18" />,
    chevronDown: <polyline points="6 9 12 15 18 9" />,
    check: <polyline points="20 6 9 17 4 12" />,
    clock: <><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></>,
    flag: <><path d="M4 21V4h13l-2 4 2 4H4" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
    arrow: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" /></>,
    sparkle: <><path d="M12 3v6M12 15v6M3 12h6M15 12h6" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

/* ---------- status ---------- */
const STATUS_META = {
  shipped: { label: "Published", color: "var(--ship)", bg: "var(--ship-bg)", icon: "check" },
  "in-progress": { label: "In progress", color: "var(--prog)", bg: "var(--prog-bg)", icon: "clock" },
  planned: { label: "Planned", color: "var(--plan)", bg: "var(--plan-bg)", icon: "flag" },
};

function StatusPill({ status, dot }) {
  const m = STATUS_META[status];
  if (dot) return <span className="dot" style={{ background: m.color }} title={m.label} />;
  return (
    <span className="status-pill" style={{ color: m.color, background: m.bg }}>
      <span className="pill-emoji">{window.STATUS_EMOJI[status]}</span>
      {m.label}
    </span>
  );
}

function ReportTag({ report, small }) {
  const code = window.REPORT_CODES[report] || "RPT";
  return (
    <span className={"report-tag" + (small ? " small" : "")} title={report}>
      <span className="report-code">{code}</span>
      {!small && <span className="report-name">{window.REPORT_EMOJI[report]} {report}</span>}
    </span>
  );
}

function ReportTags({ report, small }) {
  const arr = Array.isArray(report) ? report : [report];
  return (
    <span className="report-tags">
      {arr.map((r) => <ReportTag key={r} report={r} small={small || arr.length > 1} />)}
    </span>
  );
}

function Avatar({ name, initials, size = 30 }) {
  const hue = avatarHue(name);
  return (
    <span className="avatar" style={{
      width: size, height: size, fontSize: size * 0.4,
      background: `oklch(0.92 0.05 ${hue})`,
      color: `oklch(0.42 0.11 ${hue})`,
    }}>
      {initials}
    </span>
  );
}

function ImpactChips({ items }) {
  return (
    <div className="impact-row">
      {items.map((t) => (
        <span key={t} className="impact-chip">
          <span className="chip-emoji">{window.IMPACT_EMOJI[t] || "👥"}</span>{t}
        </span>
      ))}
    </div>
  );
}

/* ---------- timeline item ---------- */
function ReactionBar({ item, onReact, compact }) {
  const reactions = item.reactions || {};
  return (
    <div className={"reaction-bar" + (compact ? " compact" : "")}>
      {window.REACTIONS.map(({ emoji, label }) => {
        const count = reactions[emoji] || 0;
        return (
          <button key={emoji} className={"reaction-btn" + (count > 0 ? " has-count" : "")}
            title={label}
            onClick={(e) => { e.stopPropagation(); onReact(item, emoji); }}>
            <span className="reaction-emoji">{emoji}</span>
            {count > 0 && <span className="reaction-count">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

function TimelineItem({ item, onOpen, active, onReact }) {
  return (
    <div className="tl-row">
      <div className="tl-rail">
        <span className="tl-dot" style={{ background: STATUS_META[item.status].color }} />
      </div>
      <div className={"tl-card" + (active ? " active" : "")}>
        <button className="tl-card-body" onClick={() => onOpen(item)}>
          <div className="tl-top">
            <ReportTags report={item.report} />
            <StatusPill status={item.status} />
          </div>
          <h3 className="tl-title">{item.title}</h3>
          <p className="tl-what">{item.what}</p>
          <div className="tl-meta">
            <span className="tl-req">
              <Avatar name={item.requester.name} initials={item.requester.initials} size={24} />
              <span className="tl-req-name">{item.requester.name}</span>
            </span>
            <span className="tl-date" title={fmtDate(item.date)}>
              {fmtDate(item.date)} · {relTime(item.date)}
            </span>
            <span className="tl-open">Details <Icon name="chevron" size={14} /></span>
          </div>
        </button>
        <div className="tl-reactions">
          <ReactionBar item={item} onReact={onReact} compact />
          {(item.comments || []).length > 0 && (
            <button className="comment-count-btn" onClick={() => onOpen(item)}>
              💬 {item.comments.length}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- detail drawer ---------- */
function CommentForm({ item, onComment }) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [touched, setTouched] = useState(false);
  const valid = name.trim() && text.trim();

  function submit() {
    setTouched(true);
    if (!valid) return;
    onComment(item, {
      name: name.trim(),
      text: text.trim(),
      date: new Date().toISOString().slice(0, 10),
    });
    setName(""); setText(""); setTouched(false);
  }

  return (
    <div className="comment-form">
      <div className="comment-form-title">Leave a comment</div>
      <input className={"inp comment-inp" + (touched && !name.trim() ? " invalid-inp" : "")}
        placeholder="Your name *" value={name} onChange={(e) => setName(e.target.value)} />
      <textarea className="inp ta comment-inp" rows={2}
        placeholder="Your comment…" value={text} onChange={(e) => setText(e.target.value)} />
      {touched && !valid && <span className="form-err" style={{ fontSize: 12 }}>Name and comment are required.</span>}
      <button className={"btn primary" + (valid ? "" : " dim")} style={{ alignSelf: "flex-end", padding: "8px 14px", fontSize: 13 }}
        onClick={submit}>Post</button>
    </div>
  );
}

function DetailDrawer({ item, onClose, client, onEdit, onReact, onComment }) {
  useEffect(() => {
    function esc(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <div className={"drawer-scrim" + (item ? " open" : "")} onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        {item && (
          <>
            <div className="drawer-head">
              <ReportTags report={item.report} />
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {onEdit && (
                  <button className="btn ghost" style={{ padding: "6px 12px", fontSize: 13 }}
                    onClick={() => onEdit(item)}>
                    Edit
                  </button>
                )}
                <button className="icon-btn" onClick={onClose} aria-label="Close">
                  <Icon name="close" size={18} />
                </button>
              </div>
            </div>
            <div className="drawer-body">
              <div className="drawer-status">
                <StatusPill status={item.status} />
                {!client && <span className="drawer-cat">{window.CATEGORY_EMOJI[item.category]} {item.category}</span>}
              </div>
              <h2 className="drawer-title">{item.title}</h2>
              <div className="drawer-people">
                <div className="dp-block">
                  <span className="dp-label">Requested by</span>
                  <div className="dp-req">
                    <Avatar name={item.requester.name} initials={item.requester.initials} size={36} />
                    <div>
                      <div className="dp-name">{item.requester.name}</div>
                      {item.requester.role && <div className="dp-role">{item.requester.role}</div>}
                    </div>
                  </div>
                </div>
                <div className="dp-block">
                  <span className="dp-label">{item.status === "shipped" ? "Published" : "Updated"}</span>
                  <div className="dp-date">{fmtDate(item.date)}</div>
                  <div className="dp-rel">{relTime(item.date)}</div>
                </div>
              </div>
              <Section label="What changed">{item.what}</Section>
              <Section label={client ? "Why this matters" : "Why it was requested"} accent>{item.why}</Section>
              {!client && item.detail && <Section label="Notes">{item.detail}</Section>}
              <div className="drawer-field">
                <span className="dp-label">Who benefits</span>
                <ImpactChips items={item.impact} />
              </div>

              <div className="drawer-reactions">
                <span className="dp-label">Reactions</span>
                <ReactionBar item={item} onReact={onReact} />
              </div>

              <div className="drawer-comments">
                <span className="dp-label">Comments {(item.comments || []).length > 0 && `(${item.comments.length})`}</span>
                {(item.comments || []).length === 0 && (
                  <p className="no-comments">No comments yet — be the first!</p>
                )}
                {(item.comments || []).map((c, i) => (
                  <div key={i} className="comment">
                    <div className="comment-head">
                      <Avatar name={c.name} initials={c.name.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase()} size={28} />
                      <span className="comment-name">{c.name}</span>
                      <span className="comment-date">{fmtDate(c.date)}</span>
                    </div>
                    <p className="comment-text">{c.text}</p>
                  </div>
                ))}
                <CommentForm item={item} onComment={onComment} />
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function Section({ label, children, accent }) {
  return (
    <div className={"drawer-section" + (accent ? " accent" : "")}>
      <span className="ds-label">{label}</span>
      <p className="ds-body">{children}</p>
    </div>
  );
}

Object.assign(window, {
  fmtDate, monthKey, relTime, Icon, StatusPill, ReportTag, Avatar,
  ImpactChips, TimelineItem, DetailDrawer, Section, STATUS_META, ReportTags,
  ReactionBar, CommentForm, useState, useEffect, useRef,
});

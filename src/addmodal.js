function AddModal({ open, onClose, onAdd, editItem }) {
  const blank = {
    title: "", report: [window.REPORTS[0]], status: "shipped",
    reqName: "", reqRole: "", category: "New feature",
    impact: [], what: "", why: "", detail: "",
  };
  const [f, setF] = React.useState(blank);
  const [touched, setTouched] = React.useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const isEdit = !!editItem;

  React.useEffect(() => {
    if (open) {
      if (editItem) {
        setF({
          title: editItem.title || "",
          report: Array.isArray(editItem.report) ? editItem.report : [editItem.report],
          status: editItem.status || "shipped",
          reqName: editItem.requester?.name || "",
          reqRole: editItem.requester?.role || "",
          category: editItem.category || "New feature",
          impact: editItem.impact || [],
          what: editItem.what || "",
          why: editItem.why || "",
          detail: editItem.detail || "",
        });
      } else {
        setF(blank);
      }
      setTouched(false);
    }
  }, [open]);

  React.useEffect(() => {
    function esc(e) { if (e.key === "Escape") onClose(); }
    if (open) window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onClose]);

  const IMPACT_OPTS = ["Teachers", "Site leaders", "District leaders"];
  const CATEGORIES = ["New feature", "UX", "Bug fix", "Performance"];
  const valid = f.title.trim() && f.what.trim() && f.why.trim() && f.reqName.trim() && f.report.length;

  function submit() {
    setTouched(true);
    if (!valid) return;
    const initials = f.reqName.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    onAdd({
      id: isEdit ? editItem.id : "imp-" + Date.now(),
      title: f.title.trim(),
      report: f.report.length ? f.report : [window.REPORTS[0]],
      status: f.status,
      date: new Date().toISOString().slice(0, 10),
      requester: { name: f.reqName.trim(), role: f.reqRole.trim() || "Team member", initials },
      category: f.category,
      impact: f.impact.length ? f.impact : ["Teachers"],
      what: f.what.trim(),
      why: f.why.trim(),
      detail: f.detail.trim(),
    });
    onClose();
  }

  if (!open) return null;

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2 className="modal-title">{isEdit ? "Edit improvement" : "Log an improvement"}</h2>
            <p className="modal-sub">{isEdit ? "Update the details below." : "Tell the team what changed and why it mattered."}</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="modal-body">
          <Field label="What's the improvement?" required invalid={touched && !f.title.trim()}>
            <input className="inp" value={f.title} placeholder="e.g. Added a 10-percentile bucket breakdown"
              onChange={(e) => set("title", e.target.value)} />
          </Field>
          <div className="grid-2">
            <Field label="Which report(s)?" required invalid={touched && !f.report.length}>
              <div className="chip-pick">
                {window.REPORTS.map((r) => {
                  const on = f.report.includes(r);
                  return (
                    <button key={r} type="button" className={"pick" + (on ? " on" : "")}
                      onClick={() => set("report", on ? f.report.filter((x) => x !== r) : [...f.report, r])}>
                      {on && <Icon name="check" size={12} />}{r}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="Category">
              <select className="inp" value={f.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{(window.CATEGORY_EMOJI[c] || "") + " " + c}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Status">
            <div className="seg">
              {window.STATUSES.map((s) => (
                <button key={s.key} className={"seg-btn" + (f.status === s.key ? " on" : "")}
                  onClick={() => set("status", s.key)}>
                  <StatusPill status={s.key} dot />{s.label}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid-2">
            <Field label="Requested by" required invalid={touched && !f.reqName.trim()}>
              <input className="inp" value={f.reqName} placeholder="Full name"
                onChange={(e) => set("reqName", e.target.value)} />
            </Field>
            <Field label="Their role">
              <input className="inp" value={f.reqRole} placeholder="e.g. Director of Curriculum"
                onChange={(e) => set("reqRole", e.target.value)} />
            </Field>
          </div>
          <Field label="Who benefits?">
            <div className="chip-pick">
              {IMPACT_OPTS.map((o) => {
                const on = f.impact.includes(o);
                return (
                  <button key={o} className={"pick" + (on ? " on" : "")}
                    onClick={() => set("impact", on ? f.impact.filter((x) => x !== o) : [...f.impact, o])}>
                    {on && <Icon name="check" size={12} />}
                    <span className="chip-emoji">{window.IMPACT_EMOJI[o]}</span>{o}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Describe the change." required invalid={touched && !f.what.trim()}>
            <textarea className="inp ta" rows={2} value={f.what} placeholder="A plain-language description of the change."
              onChange={(e) => set("what", e.target.value)} />
          </Field>
          <Field label="Why was it requested?" required invalid={touched && !f.why.trim()}>
            <textarea className="inp ta" rows={3} value={f.why} placeholder="The problem or goal behind the request."
              onChange={(e) => set("why", e.target.value)} />
          </Field>
          <Field label="Extra notes (optional)">
            <textarea className="inp ta" rows={2} value={f.detail} placeholder="Implementation notes, rollout status, dependencies…"
              onChange={(e) => set("detail", e.target.value)} />
          </Field>
        </div>
        <div className="modal-foot">
          {touched && !valid && <span className="form-err">Fill in the required fields to continue.</span>}
          <div className="foot-actions">
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <button className={"btn primary" + (valid ? "" : " dim")} onClick={submit}>{isEdit ? "Save changes" : "Add to tracker"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, required, invalid }) {
  return (
    <label className={"field" + (invalid ? " invalid" : "")}>
      <span className="field-label">{label}{required && <span className="req">*</span>}</span>
      {children}
    </label>
  );
}

Object.assign(window, { AddModal, Field });

// search.jsx — landing dashboard: smart search & analysis setup.

function SegGroup({ options, value, onChange, getLabel = (o) => o }) {
  const keyOf = (o) => (o && typeof o === "object" ? o.id : o);
  const vk = keyOf(value);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => {
        const active = keyOf(o) === vk;
        return (
          <button key={keyOf(o)} onClick={() => onChange(o)} className="seg" data-active={active}>
            {getLabel(o)}
          </button>
        );
      })}
    </div>
  );
}

function Field({ icon, label, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "var(--accent)" }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: ".01em" }}>{label}</span>
        {hint && <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-faint)", marginLeft: "auto" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function SearchCard({ config, setConfig, onAnalyze, compact = false }) {
  const { I } = window;
  const [isOpen, setIsOpen] = React.useState(true);
  const set = (k, v) => setConfig((c) => ({ ...c, [k]: v }));
  const budgets = [
    { id: "low", label: "฿ · ต่ำกว่า 600", v: 600 },
    { id: "mid", label: "฿฿ · 600–1,000", v: 1000 },
    { id: "high", label: "฿฿฿ · 1,000 ขึ้นไป", v: 2000 },
  ];

  const handleAnalyze = () => {
    onAnalyze();
    setIsOpen(false);
  };

  return (
    <Panel glow pad={isOpen ? 26 : 16} style={{ width: "100%", transition: "all 0.3s" }}>
      {/* Accordion Toggle Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          cursor: "pointer",
          userSelect: "none"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "var(--accent)" }}><I.sliders s={18} /></span>
          <span style={{ fontWeight: 600, fontSize: 15 }}>เงื่อนไขตัวกรองการค้นหา</span>
          {!isOpen && (
            <span style={{ 
              fontSize: 12.5, 
              color: "var(--text-dim)", 
              fontFamily: "var(--mono)",
              background: "oklch(0.7 0.02 250 / 0.08)",
              padding: "3px 10px",
              borderRadius: 20,
              marginLeft: 8,
              border: "1px solid var(--border)"
            }}>
              {config.area} · {config.cuisine} · {config.groupSize} คน · {config.budget.label.split("·")[0].trim()}
            </span>
          )}
        </div>
        <button type="button" style={{ color: "var(--text-dim)", display: "grid", placeItems: "center" }}>
          <I.chevronDown s={18} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </button>
      </div>

      {isOpen && (
        <div style={{ marginTop: 20, borderTop: "1px solid var(--border)", paddingTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
            <span style={{ color: "var(--text-faint)" }}><I.search s={18} /></span>
            <input className="smart-input" defaultValue="ดินเนอร์ทีมเลี้ยงฉลอง บรรยากาศคึกคัก เดินทางสะดวก"
              placeholder="อธิบายโอกาสหรือความต้องการเพิ่มเติม..." />
            <Pill tone="dim" style={{ flexShrink: 0 }}>ไม่บังคับ</Pill>
          </div>

          <div className="setup-grid">
            <Field icon={<I.pin s={16} />} label="ทำเล" hint="กรุงเทพฯ">
              <SegGroup options={AREAS} value={config.area} onChange={(v) => set("area", v)} />
            </Field>

            <Field icon={<I.users s={16} />} label="จำนวนคน" hint={`${config.groupSize} คน`}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <input type="range" min="2" max="20" value={config.groupSize}
                  onChange={(e) => set("groupSize", +e.target.value)} className="range" style={{ flex: 1 }} />
                <div className="stepper">
                  <button onClick={() => set("groupSize", Math.max(2, config.groupSize - 1))}>–</button>
                  <span style={{ fontFamily: "var(--mono)", fontWeight: 700, minWidth: 22, textAlign: "center" }}>{config.groupSize}</span>
                  <button onClick={() => set("groupSize", Math.min(20, config.groupSize + 1))}>+</button>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-faint)" }}>
                <span>2</span><span>จำนวนที่เหมาะสมที่สุดคือ 8–12 คน</span><span>20</span>
              </div>
            </Field>

            <Field icon={<I.utensils s={16} />} label="ประเภทอาหาร" hint="เลือกหนึ่งอย่าง">
              <SegGroup options={FOOD_CATEGORIES} value={config.cuisine} onChange={(v) => set("cuisine", v)} />
            </Field>

            <Field icon={<I.wallet s={16} />} label="งบประมาณ / หัว" hint="ต่อคน">
              <SegGroup options={budgets} value={config.budget} onChange={(v) => set("budget", v)} getLabel={(o) => o.label} />
            </Field>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 26, flexWrap: "wrap" }}>
            <button className="cta" onClick={handleAnalyze}>
              <I.sparkles s={18} />
              วิเคราะห์ร้านอาหาร
              <I.arrowRight s={18} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 18, color: "var(--text-faint)", fontSize: 12.5, fontFamily: "var(--mono)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><I.shield s={14} />2 แหล่งข้อมูล</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><I.clock s={14} />~6 วินาทีวิเคราะห์</span>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}

function SearchPanel({ config, setConfig, onAnalyze }) {
  const { I } = window;

  return (
    <div className="landing-wrap">
      {/* hero copy */}
      <div style={{ textAlign: "center", marginBottom: 34, maxWidth: 680 }}>
        <Pill tone="accent" icon={<I.sparkles s={13} />} style={{ marginBottom: 18 }}>ปัญญาประดิษฐ์คัดสรรร้านอาหาร</Pill>
        <h1 style={{
          margin: 0, fontFamily: "var(--display)", fontSize: "clamp(30px, 5vw, 46px)",
          fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.05,
        }}>
          เลือกโต๊ะที่ใช่สำหรับ <span className="grad-text">8–12 คน</span><br />โดยไม่ต้องวุ่นวายกับการคุยในแชทกลุ่ม
        </h1>
        <p style={{ margin: "16px auto 0", color: "var(--text-dim)", fontSize: 15.5, maxWidth: 520, lineHeight: 1.5 }}>
          เพียงระบุทำเล จำนวนคน และงบประมาณ ระบบจะค้นหา ให้คะแนน และจัดอันดับร้านอาหารในกรุงเทพฯ จากข้อมูลบทวิจารณ์จริง พร้อมอธิบายเหตุผลของทุกตัวเลือกอย่างชัดเจน
        </p>
      </div>

      <div style={{ width: "min(860px, 100%)" }}>
        <SearchCard config={config} setConfig={setConfig} onAnalyze={onAnalyze} />
      </div>

      <div style={{ display: "flex", gap: 26, marginTop: 26, flexWrap: "wrap", justifyContent: "center", color: "var(--text-faint)", fontSize: 12.5 }}>
        {["Google Maps", "Wongnai"].map((s) => (
          <span key={s} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }} />{s}
          </span>
        ))}
      </div>
    </div>
  );
}

window.SearchPanel = SearchPanel;
window.SearchCard = SearchCard;

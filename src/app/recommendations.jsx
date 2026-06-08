// recommendations.jsx — Top 3 AI picks + evidence/sources panel.

function ScoreTooltip({ r, size = 52, stroke = 4, label = "AI", animate = true }) {
  const { ScoreRing, CompareBars, I } = window;
  const [hovered, setHovered] = React.useState(false);

  const items = [
    { label: "Rating & Review Quality", value: r.breakdown.reviews },
    { label: "Group Suitability", value: r.breakdown.capacity, color: "var(--accent2)" },
    { label: "Price Suitability", value: r.breakdown.price, color: "var(--warn)" },
    { label: "Travel Convenience", value: r.breakdown.distance, color: "var(--pos)" },
    { label: "Data Completeness", value: r.breakdown.dataCompleteness, color: "var(--accent)" },
    { label: "Uniqueness/Experience", value: r.breakdown.uniqueness, color: "var(--accent2)" },
  ];

  return (
    <div 
      style={{ position: "relative", cursor: "pointer" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ScoreRing value={r.aiScore} size={size} stroke={stroke} label={label} animate={animate} />
      {hovered && (
        <div style={{
          position: "absolute",
          top: "100%",
          right: 0,
          marginTop: 8,
          width: 320,
          padding: "16px 16px 12px 16px",
          borderRadius: 12,
          background: "color-mix(in oklch, var(--bg2) 95%, transparent)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid var(--border)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          zIndex: 999,
          pointerEvents: "none",
          textAlign: "left",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 12.5, fontWeight: 600, color: "var(--accent)" }}>
            <I.sliders s={13} />
            <span>ปัจจัยค่าน้ำหนักคะแนน</span>
          </div>
          <CompareBars items={items} animate={false} />
        </div>
      )}
    </div>
  );
}

function RecCard({ r, rank }) {
  const { I, Photo, Pill } = window;
  const place = ["ดีที่สุดโดยรวม", "คุ้มค่าที่สุด", "ยืดหยุ่นและรองรับดีที่สุด"][rank];
  return (
    <div className="rec-card" data-rank={rank}>
      <div className="rec-rankbar">
        <span className="rec-medal">#{rank + 1}</span>
        <span className="rec-place">{place}</span>
        <ScoreTooltip r={r} size={52} stroke={4} label="AI" />
      </div>
      <Photo hue={r.hue} h={132} label={r.cuisine.toLowerCase() + " · photo"}
        badge={<Pill tone="pos" icon={<I.star s={11} />}>{r.rating}</Pill>} />
      <div style={{ padding: "16px 4px 0" }}>
        <h3 style={{ margin: 0, fontFamily: "var(--display)", fontSize: 18, fontWeight: 600, lineHeight: 1.2 }}>{r.name}</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 14px", marginTop: 9, color: "var(--text-dim)", fontSize: 12.5, fontFamily: "var(--mono)" }}>
          <span style={{ display: "flex", gap: 5, alignItems: "center" }}><I.pin s={13} />{r.area}</span>
          <span style={{ display: "flex", gap: 5, alignItems: "center" }}><I.users s={13} />≤{r.capacity}</span>
          <span style={{ display: "flex", gap: 5, alignItems: "center" }}><I.wallet s={13} />฿{r.priceTHB}</span>
          {r.hours && r.hours !== "null" && (
            <span style={{ display: "flex", gap: 5, alignItems: "center" }}><I.clock s={13} />{r.hours}</span>
          )}
        </div>
        {/* Match badges */}
        {(r.areaMatch || r.cuisineMatch || r.budgetMatch || r.capacityMatch) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
            {r.areaMatch    && <Pill tone="pos"  icon={<I.check s={10} />} style={{ fontSize: 10.5 }}>ตรงพื้นที่</Pill>}
            {r.cuisineMatch && <Pill tone="pos"  icon={<I.check s={10} />} style={{ fontSize: 10.5 }}>ตรงประเภท</Pill>}
            {r.budgetMatch  && <Pill tone="pos"  icon={<I.check s={10} />} style={{ fontSize: 10.5 }}>ในงบ</Pill>}
            {r.capacityMatch && <Pill tone="pos" icon={<I.check s={10} />} style={{ fontSize: 10.5 }}>รองรับกลุ่ม</Pill>}
            {!r.areaMatch   && <Pill tone="dim"  style={{ fontSize: 10.5 }}>ต่างพื้นที่</Pill>}
            {!r.budgetMatch && <Pill tone="warn" style={{ fontSize: 10.5 }}>เกินงบ</Pill>}
          </div>
        )}
        <div className="rec-reasons">
          <div className="rec-reasons-head"><I.sparkles s={13} />เหตุผลที่ AI คัดเลือกให้คุณ</div>
          {r.reasons.map((rs, i) => (
            <div key={i} className="rec-reason"><span className="rc-check"><I.check s={12} /></span>{rs}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Recommendations({ top10 }) {
  const { I, SectionHead, RankRow } = window;
  const top3 = top10.slice(0, 3);
  const rest  = top10.slice(3);
  const [open, setOpen] = React.useState(null);
  return (
    <section id="recs">
      <SectionHead icon={<I.sparkles s={20} />} kicker="กลไกการแนะนำ"
        title="10 ร้านแนะนำที่ดีที่สุดโดย AI"
        desc="สร้างขึ้นจากโมเดลค่าน้ำหนักพร้อมสรุปเหตุผลเข้าใจง่าย เพื่อช่วยให้กลุ่มของคุณตัดสินใจได้ทันที"
        right={<button className="ghost-btn"><I.download s={15} />ส่งออกรายงาน</button>} />

      {/* Top 3 — cards */}
      {top3.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-dim)", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px dashed var(--border)" }}>
          <I.sparkles s={24} style={{ marginBottom: 8, color: "var(--text-faint)" }} />
          <div>ไม่พบข้อมูลร้านอาหารแนะนำที่ตรงตามเงื่อนไขการกรอง</div>
        </div>
      ) : (
        <div className="rec-grid">
          {top3.map((r, i) => <RecCard key={r.id} r={r} rank={i} />)}
        </div>
      )}

      {/* อันดับ 4–10 — rank rows */}
      {rest.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
            fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--text-faint)", letterSpacing: ".08em" }}>
            <I.list s={14} />อันดับที่ 4–10
          </div>
          <div className="rank-list">
            {rest.map((r, i) => (
              <RankRow key={r.id} r={r} rank={i + 3}
                expanded={open === r.id}
                onToggle={() => setOpen(open === r.id ? null : r.id)} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ---------- Evidence & sources ----------
function SourcesPanel({ sources }) {
  const { I, Panel, SectionHead } = window;
  const glyphs = { pin: I.pin, star: I.star, chat: I.chat, globe: I.globe };
  return (
    <section id="sources">
      <SectionHead icon={<I.shield s={20} />} kicker="หลักฐานและแหล่งข้อมูล"
        title="ข้อมูลเหล่านี้มาจากไหน"
        desc="ทุกคะแนนสามารถตรวจสอบย้อนกลับไปยังแหล่งข้อมูลสาธารณะที่น่าเชื่อถือได้ ไม่มีการปรุงแต่งข้อมูลใดๆ" />
      <div className="src-grid">
        {sources.map((s) => {
          const G = glyphs[s.glyph];
          return (
            <Panel key={s.id} pad={18} className="src-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div className="src-ico"><G s={18} /></div>
                <span className="src-verified"><I.check s={12} />ยืนยันแล้ว</span>
              </div>
              <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 600, marginTop: 14 }}>{s.name}</div>
              <div style={{ color: "var(--text-dim)", fontSize: 12.5, marginTop: 4, lineHeight: 1.45 }}>{s.detail}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--accent)", marginTop: 12 }}>{s.records}</div>
            </Panel>
          );
        })}
      </div>
      <div className="src-trust">
        <I.shield s={16} />
        <span>รวบรวมข้อมูลย้อนหลัง 6 เดือน · อัปเดตล่าสุด ณ เวลาที่วิเคราะห์ · กรองข้อมูลที่ซ้ำกันออกแล้วจากทั้งสี่แหล่งข้อมูล</span>
      </div>
    </section>
  );
}

Object.assign(window, { Recommendations, SourcesPanel });

// ranking.jsx — Top 10 ranking dashboard with search / filter / sort / expand.

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

function RankRow({ r, rank, expanded, onToggle }) {
  const { I, Photo, Pill, Radar, CompareBars } = window; // Pill used for match badges
  return (
    <div className="rank-row" data-expanded={expanded}>
      <div className="rank-main" onClick={onToggle}>
        <div className="rank-badge" data-top={rank < 3}>{rank + 1}</div>
        <div className="rank-thumb">
          <Photo hue={r.hue} h={56} label="" />
        </div>
        <div className="rank-name">
          <div style={{ fontWeight: 600, fontSize: 15 }}>{r.name}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 5, alignItems: "center" }}>
            <span style={{ color: "var(--text-faint)", fontSize: 12, fontFamily: "var(--mono)" }}>{r.cuisine} · {r.area}</span>
            {r.areaMatch    && <Pill tone="pos"  style={{ fontSize: 10, padding: "2px 7px" }}>ตรงพื้นที่</Pill>}
            {r.cuisineMatch && <Pill tone="pos"  style={{ fontSize: 10, padding: "2px 7px" }}>ตรงประเภท</Pill>}
            {r.budgetMatch  && <Pill tone="pos"  style={{ fontSize: 10, padding: "2px 7px" }}>ในงบ</Pill>}
            {r.capacityMatch && <Pill tone="pos" style={{ fontSize: 10, padding: "2px 7px" }}>รองรับกลุ่ม</Pill>}
          </div>
        </div>
        <div className="rank-stats">
          <div className="rstat"><span className="rstat-l"><I.star s={12} />คะแนน</span><span className="rstat-v">{r.rating}</span></div>
          <div className="rstat"><span className="rstat-l"><I.messages s={12} />รีวิว</span><span className="rstat-v">{(r.reviews / 1000).toFixed(1)}k</span></div>
          <div className="rstat"><span className="rstat-l"><I.wallet s={12} />เฉลี่ย</span><span className="rstat-v">฿{r.priceTHB}</span></div>
          <div className="rstat"><span className="rstat-l"><I.ruler s={12} />ระยะ</span><span className="rstat-v">{r.distanceKm} กม.</span></div>
          <div className="rstat"><span className="rstat-l"><I.users s={12} />ความจุ</span><span className="rstat-v">≤{r.capacity} คน</span></div>
        </div>
        <ScoreTooltip r={r} size={56} stroke={4} label="AI" animate={false} />
        <button className="rank-expand" data-on={expanded}><I.chevronDown s={18} /></button>
      </div>
      {expanded && (
        <div className="rank-detail">
          <div className="rd-col">
            <div className="rd-head"><I.radar s={14} />โปรไฟล์ประสิทธิภาพ</div>
            <Radar size={210}
              axes={Object.keys(r.radar)}
              series={[{ values: r.radar, fill: "color-mix(in oklch, var(--accent) 22%, transparent)", stroke: "var(--accent)" }]} />
          </div>
          <div className="rd-col">
            <div className="rd-head"><I.sliders s={14} />ปัจจัยค่าน้ำหนักคะแนน</div>
            <CompareBars animate={false} items={[
              { label: "Rating & Review Quality", value: r.breakdown.reviews },
              { label: "Group Suitability", value: r.breakdown.capacity, color: "var(--accent2)" },
              { label: "Price Suitability", value: r.breakdown.price, color: "var(--warn)" },
              { label: "Travel Convenience", value: r.breakdown.distance, color: "var(--pos)" },
              { label: "Data Completeness", value: r.breakdown.dataCompleteness, color: "var(--accent)" },
              { label: "Uniqueness/Experience", value: r.breakdown.uniqueness, color: "var(--accent2)" },
            ]} />
            {r.hours && r.hours !== "null" && (
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 14,
                padding: "8px 12px", borderRadius: 9,
                background: "color-mix(in oklch, var(--accent) 8%, transparent)",
                border: "1px solid color-mix(in oklch, var(--accent) 20%, transparent)",
                fontFamily: "var(--mono)", fontSize: 12.5 }}>
                <I.clock s={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                <span style={{ color: "var(--text-faint)" }}>เวลาเปิด-ปิด</span>
                <span style={{ color: "var(--text)", fontWeight: 600, marginLeft: 4 }}>{r.hours}</span>
              </div>
            )}
            <div className="rd-sources">
              <span style={{ color: "var(--text-faint)", fontSize: 11.5, fontFamily: "var(--mono)" }}>แหล่งข้อมูล</span>
              {r.sources.map((s) => <Pill key={s} tone="dim" style={{ fontSize: 11 }}>{s}</Pill>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RankingBoard({ restaurants, defaultArea }) {
  const { I, SectionHead } = window;
  const [q, setQ] = React.useState("");
  const [area, setArea] = React.useState(defaultArea || "ทั้งหมด");
  const [sort, setSort] = React.useState("aiScore");
  const [open, setOpen] = React.useState(restaurants[0]?.id);

  const sortOpts = [
    { id: "aiScore", label: "คะแนน AI" },
    { id: "rating", label: "คะแนนรีวิว" },
    { id: "priceTHB", label: "ราคา" },
    { id: "distanceKm", label: "ระยะทาง" },
    { id: "capacity", label: "ความจุ" },
  ];
  const areas = ["ทั้งหมด", ...AREAS];

  const list = React.useMemo(() => {
    let l = restaurants.filter((r) =>
      (area === "ทั้งหมด" || r.area === area) &&
      (r.name.toLowerCase().includes(q.toLowerCase()) || r.cuisine.toLowerCase().includes(q.toLowerCase())));
    const asc = sort === "priceTHB" || sort === "distanceKm";
    l = [...l].sort((a, b) => asc ? a[sort] - b[sort] : b[sort] - a[sort]);
    return l;
  }, [q, area, sort, restaurants]);

  return (
    <section id="ranking">
      <SectionHead icon={<I.list s={20} />} kicker="แดชบอร์ดการจัดอันดับ"
        title={`${restaurants.length} อันดับร้านอาหารที่ดีที่สุด`}
        desc="คลิกแถวใดก็ได้เพื่อแสดงผลโปรไฟล์ประสิทธิภาพ ปัจจัยค่าน้ำหนักคะแนน และแหล่งข้อมูลอ้างอิง" />

      <div className="rank-controls">
        <div className="rank-search">
          <I.search s={16} />
          <input placeholder="ค้นหาชื่อร้านหรือประเภทอาหาร…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="rank-filter">
          <span className="rcf-label"><I.filter s={13} />ทำเล</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {areas.map((a) => (
              <button key={a} className="chip" data-active={area === a} onClick={() => setArea(a)}>{a}</button>
            ))}
          </div>
        </div>
        <div className="rank-sort">
          <span className="rcf-label"><I.sliders s={13} />เรียงลำดับ</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {sortOpts.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="rank-list">
        {list.map((r, i) => (
          <RankRow key={r.id} r={r} rank={i} expanded={open === r.id}
            onToggle={() => setOpen(open === r.id ? null : r.id)} />
        ))}
        {list.length === 0 && <div className="rank-empty">ไม่พบร้านอาหารที่ตรงตามเงื่อนไขค้นหา</div>}
      </div>
    </section>
  );
}

window.RankingBoard = RankingBoard;
window.RankRow = RankRow;

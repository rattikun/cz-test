// app.jsx — orchestrates the flow: search → processing → results.

const PALETTES = {
  "ไซแอน · ไวโอเล็ต": ["oklch(0.82 0.13 195)", "oklch(0.72 0.16 292)"],
  "อควา · ไลม์": ["oklch(0.84 0.14 178)", "oklch(0.87 0.17 132)"],
  "มาเจนตา · น้ำเงิน": ["oklch(0.74 0.18 348)", "oklch(0.72 0.15 262)"],
  "แอมเบอร์ · โรส": ["oklch(0.84 0.14 78)", "oklch(0.74 0.16 24)"],
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["oklch(0.82 0.13 195)", "oklch(0.72 0.16 292)"],
  "glow": 0.5,
  "bgHue": 250,
  "reduceMotion": false
}/*EDITMODE-END*/;

const NAV = [
  { id: "recs", label: "คำแนะนำสถานที่", icon: "sparkles" },
];

function App() {
  const { I, useTweaks, TweaksPanel, TweakSection, TweakColor, TweakSlider, TweakToggle } = window;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [view, setView] = React.useState("results"); // processing | results | sysinfo
  const [config, setConfig] = React.useState({
    area: "ทองหล่อ", cuisine: "อาหารไทย", groupSize: 10,
    budget: { id: "mid", label: "฿฿ · 600–1,000", v: 1000 },
  });
  const [activeNav, setActiveNav] = React.useState("recs");
  const scrollRef = React.useRef(null);

  // apply theme vars globally
  React.useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--accent", t.palette[0]);
    root.setProperty("--accent2", t.palette[1]);
    root.setProperty("--bg-hue", String(t.bgHue));
    root.setProperty("--glow-a", String(0.12 + t.glow * 0.4));
    root.setProperty("--glow", `color-mix(in oklch, var(--accent) ${Math.round((0.25 + t.glow * 0.55) * 100)}%, transparent)`);
    document.documentElement.dataset.motion = t.reduceMotion ? "reduce" : "full";
  }, [t]);

  // Tag & rank restaurants by relevance to the current search config
  const ranked = React.useMemo(() => {
    const budgetMax = config.budget.v;
    const size = config.groupSize;
    return [...RESTAURANTS]
      .filter(r =>
        r.area === config.area &&
        r.cuisine === config.cuisine &&
        r.priceTHB <= budgetMax &&
        r.capacity >= size
      )
      .map(r => ({
        ...r,
        areaMatch:     true,
        cuisineMatch:  true,
        budgetMatch:   true,
        capacityMatch: true,
        relevance: 54,
      }))
      .sort((a, b) => b.aiScore - a.aiScore);
  }, [config]);
  const top3 = ranked.slice(0, 3);
  const top10 = ranked.slice(0, 10);

  const goAnalyze = () => { setView("processing"); };
  const onComplete = () => { setView("results"); setActiveNav("search-section"); if (scrollRef.current) scrollRef.current.scrollTop = 0; };
  const reset = () => { setView("results"); setActiveNav("search-section"); if (scrollRef.current) scrollRef.current.scrollTop = 0; };
  const goSysInfo = () => { setView("sysinfo"); if (scrollRef.current) scrollRef.current.scrollTop = 0; };
  const backToResults = () => { setView("results"); if (scrollRef.current) scrollRef.current.scrollTop = 0; };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el && scrollRef.current) {
      const top = el.offsetTop - 18;
      scrollRef.current.scrollTo({ top, behavior: document.documentElement.dataset.motion === "reduce" ? "auto" : "smooth" });
    }
  };

  // scroll spy
  React.useEffect(() => {
    if (view !== "results") return;
    const sc = scrollRef.current;
    if (!sc) return;
    const onScroll = () => {
      let cur = NAV[0].id;
      for (const n of NAV) {
        const el = document.getElementById(n.id);
        if (el && el.offsetTop - 120 <= sc.scrollTop) cur = n.id;
      }
      setActiveNav(cur);
    };
    sc.addEventListener("scroll", onScroll);
    onScroll();
    return () => sc.removeEventListener("scroll", onScroll);
  }, [view]);

  // Count exact matches (area + cuisine + budget + capacity all pass)
  const exactMatches = ranked.filter(r => r.areaMatch && r.cuisineMatch && r.budgetMatch && r.capacityMatch).length;

  return (
    <div className="app">
      {/* ambient background */}
      <div className="bg-fx"><div className="orb orb-a" /><div className="orb orb-b" /><div className="grid-fade" /></div>

      {/* header */}
      <header className="topbar">
        <div className="brand" onClick={reset} style={{ cursor: "pointer" }}>
          <div className="brand-mark"><I.utensils s={18} /></div>
          <div>
            <div className="brand-name">Tabletop<span className="grad-text">AI</span></div>
            <div className="brand-sub">ระบบวิเคราะห์และคัดสรรร้านอาหารสำหรับกลุ่ม</div>
          </div>
        </div>
        <div className="topbar-config">
          <span><I.pin s={13} />{config.area}</span>
          <span><I.users s={13} />{config.groupSize}</span>
          <span><I.utensils s={13} />{config.cuisine}</span>
          <span><I.wallet s={13} />{config.budget.label.split("·")[0].trim()}</span>
        </div>
        <div className="topbar-right">
          <button className="ghost-btn" onClick={reset}><I.search s={15} />ปรับเงื่อนไข</button>
        </div>
      </header>

      {/* body */}
      <div className="body" ref={scrollRef}>
        {view === "sysinfo" && (
          <div className="results-layout">
            <aside className="sidebar">
              <div className="side-kicker">ระบบ</div>
              <button className="side-link" data-active={true}>
                <I.brain s={16} /><span>การทำงานของระบบ AI</span>
              </button>
              <div style={{ marginTop: "auto", paddingTop: 16 }}>
                <button className="ghost-btn" onClick={backToResults} style={{ width: "100%", justifyContent: "center", fontSize: 12 }}>
                  <I.arrowUp s={13} />กลับหน้าผลลัพธ์
                </button>
              </div>
            </aside>
            <main className="results-main">
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "14px 18px", borderRadius: 14, marginBottom: 4,
                border: "1px solid color-mix(in oklch, var(--accent) 30%, transparent)",
                background: "color-mix(in oklch, var(--accent) 7%, transparent)",
              }}>
                <Pill tone="accent" icon={<I.brain s={12} />}>ข้อมูลการทำงานของระบบ</Pill>
                <span style={{ fontFamily: "var(--mono)", fontSize: 12.5, color: "var(--text-dim)" }}>
                  รายละเอียดกระบวนการประมวลผล AI
                </span>
                <button className="ghost-btn" onClick={backToResults} style={{ marginLeft: "auto", padding: "5px 12px", fontSize: 12 }}>
                  <I.arrowUp s={13} />กลับผลลัพธ์
                </button>
              </div>
              <section id="workflow">
                <window.SectionHead icon={<I.brain s={20} />} kicker="AI Workflow"
                  title="การประมวลผลและคัดเลือกตัวเลือกเหล่านี้"
                  desc="กระบวนการ 9 ขั้นตอนที่แปลงบทวิจารณ์ดิบกว่า 38,400 รายการให้กลายเป็นรายการแนะนำที่พร้อมอธิบายเหตุผลอย่างโปร่งใส"
                  right={<Pill tone="pos" icon={<I.check s={12} />}>เสร็จสิ้นใน 6.0 วินาที</Pill>} />
                <window.WorkflowDiagram stages={WORKFLOW_STAGES} />
              </section>
              <div style={{ marginTop: 24 }} />
              <window.VizSection restaurants={ranked} top3={top3} />
              <div style={{ marginTop: 24 }} />
              <window.SourcesPanel sources={DATA_SOURCES} />
              <footer className="foot">
                <span>TabletopAI · ต้นแบบแนวคิด · ข้อมูลจำลองเพื่อการสาธิต</span>
                <button className="ghost-btn" onClick={backToResults}><I.arrowUp s={14} />กลับหน้าผลลัพธ์</button>
              </footer>
            </main>
          </div>
        )}

        {view === "results" && (
          <div className="results-layout">
            <aside className="sidebar">
              <div className="side-kicker">การวิเคราะห์</div>
              {NAV.map((n) => {
                const C = I[n.icon];
                return (
                  <button key={n.id} className="side-link" data-active={activeNav === n.id} onClick={() => scrollTo(n.id)}>
                    <C s={16} /><span>{n.label}</span>
                  </button>
                );
              })}
              <button className="side-link" onClick={goSysInfo}>
                <I.brain s={16} /><span>การทำงานของระบบ AI</span>
              </button>
              {top3.length > 0 && (
                <div className="side-card">
                  <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-faint)", letterSpacing: ".1em" }}>ผลลัพธ์ที่ดีที่สุด</div>
                  <div style={{ fontFamily: "var(--display)", fontSize: 15, fontWeight: 600, margin: "6px 0 2px" }}>{top3[0].name}</div>
                  <div style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--mono)" }}>AI {top3[0].aiScore} · ดีที่สุดโดยรวม</div>
                </div>
              )}
            </aside>

            <main className="results-main">
              <section id="search-section" style={{ scrollMarginTop: 18 }}>
                <window.SectionHead icon={<I.search s={20} />} kicker="ค้นหา"
                  title="ปรับเงื่อนไขค้นหาร้านอาหาร"
                  desc={`พบร้านตรงเงื่อนไขทั้งหมด ${exactMatches} ร้าน · เลือกทำเล ประเภทอาหาร จำนวนคน และงบประมาณ แล้วกดวิเคราะห์เพื่ออัปเดตผลลัพธ์`}
                  right={<Pill tone="accent" icon={<I.sparkles s={12} />}>{exactMatches} ร้านตรงเงื่อนไข</Pill>} />
                <window.SearchCard config={config} setConfig={setConfig} onAnalyze={goAnalyze} />
              </section>

              <window.Recommendations top10={top10} />
              <footer className="foot">
                <span>TabletopAI · ต้นแบบแนวคิด · ข้อมูลจำลองเพื่อการสาธิต</span>
                <button className="ghost-btn" onClick={() => scrollTo("search-section")}><I.arrowUp s={14} />กลับสู่ด้านบน</button>
              </footer>
            </main>
          </div>
        )}
      </div>

      {view === "processing" && <window.ProcessingOverlay stages={WORKFLOW_STAGES} config={config} onComplete={onComplete} />}

      <TweaksPanel>
        <TweakSection label="สีเน้น" />
        <TweakColor label="จานสี" value={t.palette}
          options={Object.values(PALETTES)} onChange={(v) => setTweak("palette", v)} />
        <TweakSlider label="ความเข้มของแสงเรือง" value={t.glow} min={0} max={1} step={0.05} onChange={(v) => setTweak("glow", v)} />
        <TweakSection label="พื้นผิว" />
        <TweakSlider label="โทนสีพื้นหลัง" value={t.bgHue} min={220} max={300} step={1} onChange={(v) => setTweak("bgHue", v)} />
        <TweakToggle label="ลดแอนิเมชัน" value={t.reduceMotion} onChange={(v) => setTweak("reduceMotion", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);


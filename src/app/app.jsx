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
    area: window.AREAS && window.AREAS.includes("ทองหล่อ") ? "ทองหล่อ" : (window.AREAS && window.AREAS[0]) || "ทองหล่อ",
    cuisine: window.FOOD_CATEGORIES && window.FOOD_CATEGORIES.includes("🍽️ ทั้งหมด") ? "🍽️ ทั้งหมด" : (window.FOOD_CATEGORIES && window.FOOD_CATEGORIES[0]) || "🍽️ ทั้งหมด",
    groupSize: 10,
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
        (config.cuisine === "🍽️ ทั้งหมด" || r.cuisine === config.cuisine) &&
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
        <div className="topbar-right" style={{ display: "flex", gap: "8px" }}>
          <a href="index.html" className="ghost-btn" style={{ borderColor: "color-mix(in oklch, var(--accent) 30%, transparent)", textDecoration: "none" }}>
            <I.home s={14} style={{ color: "var(--accent)" }} />
            <span>กลับหน้าแรก</span>
          </a>
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

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSrRG4s5lt5Fibo3h8Lzy-6x7tgtHsvhf2HEkN7q4dR8APio_T2xj1f9OcKXJCmJnAfWjWJIzaaliKN/pub?gid=1867495153&single=true&output=csv";

function parseCSV(text) {
  const lines = [];
  let row = [""];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push('');
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      lines.push(row);
      row = [""];
    } else {
      row[row.length - 1] += char;
    }
  }
  if (row.length > 1 || row[0] !== '') {
    lines.push(row);
  }
  return lines;
}

async function start() {
  const rootEl = document.getElementById("root");
  if (rootEl) {
    rootEl.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; color: #fff; background: #15161e;">
        <div style="width: 50px; height: 50px; border-radius: 14px; display: grid; place-items: center; background: linear-gradient(135deg, oklch(0.82 0.13 195), oklch(0.72 0.16 292)); box-shadow: 0 0 20px rgba(79, 214, 224, 0.4); margin-bottom: 20px; animation: pulse 2s infinite;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-utensils"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
        </div>
        <div style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">Tabletop<span style="background: linear-gradient(92deg, oklch(0.82 0.13 195), oklch(0.72 0.16 292)); -webkit-background-clip: text; background-clip: text; color: transparent;">AI</span></div>
        <div style="font-size: 13px; color: #7d8590; font-family: monospace;">กำลังเรียกใช้ข้อมูลจริงจาก Google Sheets...</div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
        </style>
      </div>
    `;
  }

  try {
    const res = await fetch(CSV_URL);
    const text = await res.text();
    const parsed = parseCSV(text);
    if (parsed.length > 1) {
      const headers = parsed[0].map(h => h.trim());
      const colIndex = {
        name: headers.indexOf("ชื่อร้าน"),
        cuisine: headers.indexOf("ประเภทอาหาร"),
        rating: headers.indexOf("คะแนนรีวิว"),
        reviews: headers.indexOf("จำนวนรีวิว"),
        priceLabel: headers.indexOf("ช่วงราคา"),
        location: headers.indexOf("ที่ตั้ง"),
        area: headers.indexOf("พื้นที่"),
        transit: headers.indexOf("การเดินทาง"),
        hours: headers.indexOf("เวลาเปิด-ปิด"),
        groupFriendly: headers.indexOf("เหมาะกับกลุ่ม"),
        wongnaiLink: headers.indexOf("ลิงก์แหล่งข้อมูล"),
        gmapsLink: headers.indexOf("ลิงก์ Google Map"),
        note: headers.indexOf("หมายเหตุ"),
        add: headers.indexOf("เพิ่มเติม"),
      };

      const dataRows = parsed.slice(1);
      const list = dataRows.map((row, index) => {
        const nameVal = colIndex.name !== -1 ? row[colIndex.name] : "";
        if (!nameVal || !nameVal.trim()) return null;
        
        const id = "r_csv_" + index;
        const name = nameVal.trim();
        
        // Group cuisine categories using regex rules
        const rawCuisine = colIndex.cuisine !== -1 ? (row[colIndex.cuisine] || "") : "";
        let cuisine = '🍽️ อื่นๆ';
        if (/ญี่ปุ่น|ซูชิ|ราเมง|ยากินิกุ|เทปัน|โอมากาเสะ|ชาบูชาบู|อิซากายะ|ทงคัตสึ/.test(rawCuisine)) {
          cuisine = '🇯🇵 อาหารญี่ปุ่น';
        } else if (/เกาหลี|ซัมกยอ|ฮันชิก|บิบิมบับ/.test(rawCuisine)) {
          cuisine = '🇰🇷 อาหารเกาหลี';
        } else if (/ไทย|ต้มยำ|ผัดไทย|อีสาน|เหนือ|ใต้|กระเพรา/.test(rawCuisine)) {
          cuisine = '🇹🇭 อาหารไทย';
        } else if (/อิตาเลียน|พิซซ่า|พาสต้า|ฝรั่งเศส|สเต็ก|เบเกอรี|เค้ก|ยุโรป|อเมริกัน|เบอร์เกอร์/.test(rawCuisine)) {
          cuisine = '🌍 อาหารตะวันตก';
        } else if (/จีน|ติ่มซำ|ฮ่องกง|ก๋วยเตี๋ยว|เกี๊ยว/.test(rawCuisine)) {
          cuisine = '🇨🇳 อาหารจีน';
        } else if (/คาเฟ่|กาแฟ|ชา|เครื่องดื่ม|น้ำผลไม้/.test(rawCuisine)) {
          cuisine = '☕ คาเฟ่ & เครื่องดื่ม';
        } else if (/บุฟเฟต์|นานาชาติ|ฟิวชั่น|มิกซ์|หลากหลาย/.test(rawCuisine)) {
          cuisine = '🌐 นานาชาติ & บุฟเฟต์';
        }
        
        const ratingVal = colIndex.rating !== -1 ? parseFloat(row[colIndex.rating]) : 4.0;
        const rating = isNaN(ratingVal) ? 4.0 : ratingVal;
        
        const reviewsVal = colIndex.reviews !== -1 ? (row[colIndex.reviews] || "") : "";
        const reviewsStr = reviewsVal.replace(/,/g, '').trim();
        const reviews = parseInt(reviewsStr) || 0;
        
        const priceLabel = colIndex.priceLabel !== -1 ? (row[colIndex.priceLabel] || "").trim() : "฿฿ (100-250 บาท)";
        let priceTHB = 300;
        const numbers = priceLabel.replace(/,/g, '').match(/\d+/g);
        if (numbers && numbers.length >= 2) {
          priceTHB = Math.round((parseInt(numbers[0]) + parseInt(numbers[1])) / 2);
        } else if (numbers && numbers.length === 1) {
          priceTHB = parseInt(numbers[0]);
        }
        
        const location = colIndex.location !== -1 ? (row[colIndex.location] || "").trim() : "";
        const area = colIndex.area !== -1 ? (row[colIndex.area] || "").trim() : "สยาม";
        const transit = colIndex.transit !== -1 ? (row[colIndex.transit] || "").trim() : "BTS";
        const hours = colIndex.hours !== -1 ? (row[colIndex.hours] || "").trim() : "";
        const groupFriendly = colIndex.groupFriendly !== -1 ? (row[colIndex.groupFriendly] || "").trim() === "ใช่" : true;
        const wongnaiLink = colIndex.wongnaiLink !== -1 ? (row[colIndex.wongnaiLink] || "").trim() : "";
        const gmapsLink = colIndex.gmapsLink !== -1 ? (row[colIndex.gmapsLink] || "").trim() : "";
        
        const capacity = groupFriendly ? Math.floor(Math.random() * 26) + 15 : Math.floor(Math.random() * 9) + 4;
        
        const ratingScore = rating * 20;
        const reviewFactor = Math.min(reviews / 1000, 1) * 10;
        const aiScore = Math.min(Math.round(ratingScore + reviewFactor), 99);
        
        const distanceKm = parseFloat((Math.random() * 2 + 0.2).toFixed(1));
        const hue = Math.floor(Math.random() * 360);
        
        const breakdown = {
          reviews: Math.round(70 + Math.random() * 25),
          price: Math.round(70 + Math.random() * 25),
          distance: Math.round(70 + Math.random() * 25),
          capacity: Math.round(70 + Math.random() * 25),
          dataCompleteness: Math.round(75 + Math.random() * 20),
          uniqueness: Math.round(70 + Math.random() * 25),
        };
        
        const radar = {
          "รสชาติ": Math.round(75 + Math.random() * 22),
          "ความคุ้มค่า": Math.round(70 + Math.random() * 25),
          "การบริการ": Math.round(70 + Math.random() * 25),
          "บรรยากาศ": Math.round(75 + Math.random() * 22),
          "ความเข้ากันของกลุ่ม": groupFriendly ? Math.round(85 + Math.random() * 14) : Math.round(60 + Math.random() * 20),
        };
        
        const sources = wongnaiLink.includes("wongnai") ? ["Wongnai", "Google Maps"] : ["Google Maps"];
        
        const reasons = [];
        if (rating >= 4.5) {
          reasons.push(`คะแนนสูงถึง ${rating}★ — ลูกค้าชื่นชมคุณภาพและบริการเป็นอย่างมาก`);
        } else {
          reasons.push(`คะแนน ${rating}★ — คุณภาพอาหารและบรรยากาศอยู่ในเกณฑ์มาตรฐาน`);
        }
        
        const noteVal = colIndex.note !== -1 ? (row[colIndex.note] || "").trim() : "";
        const addVal = colIndex.add !== -1 ? (row[colIndex.add] || "").trim() : "";
        if (noteVal) {
          reasons.push(noteVal);
        } else {
          reasons.push(groupFriendly ? "เหมาะสำหรับการสังสรรค์หรือรับประทานอาหารเป็นกลุ่ม" : "พื้นที่กะทัดรัด เหมาะสำหรับกลุ่มขนาดเล็ก");
        }
        if (addVal) {
          reasons.push(addVal);
        } else {
          reasons.push(`ตั้งอยู่ย่าน${area} เดินทางสะดวกด้วยระบบขนส่งสาธารณะ (${transit})`);
        }
        
        return {
          id, name, cuisine, area, hue, rating, reviews, priceTHB, priceLabel, distanceKm, capacity, aiScore,
          location, transit, hours, groupFriendly, gmapsLink, wongnaiLink, breakdown, radar, sources, reasons
        };
      }).filter(Boolean);
      
      if (list.length > 0) {
        window.RESTAURANTS = list;
        
        // Build unique lists
        const uniqueAreas = Array.from(new Set(list.map(r => r.area))).filter(Boolean);
        const uniqueCuisines = Array.from(new Set(list.map(r => r.cuisine))).filter(Boolean);
        
        if (uniqueAreas.length > 0) window.AREAS = uniqueAreas;
        if (uniqueCuisines.length > 0) window.FOOD_CATEGORIES = ["🍽️ ทั้งหมด", ...uniqueCuisines];
      }
    }
  } catch (e) {
    console.error("Failed to load live Google Sheets data, falling back to mock data.", e);
  } finally {
    ReactDOM.createRoot(document.getElementById("root")).render(<App />);
  }
}

start();


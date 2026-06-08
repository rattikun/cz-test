// viz.jsx — data visualization section.

function VizSection({ restaurants, top3 }) {
  const { I, Panel, SectionHead, CompareBars, Scatter, Radar, WeightedBar } = window;
  if (restaurants.length === 0) {
    return (
      <section id="viz">
        <SectionHead icon={<I.chart s={20} />} kicker="ภาพข้อมูลและสถิติ"
          title="ตัวเลขเบื้องหลังการจัดอันดับ"
          desc="คะแนน AI รวมถูกแจกแจงอย่างละเอียด เพื่อช่วยให้กลุ่มของคุณตรวจสอบโมเดลได้อย่างรวดเร็วในพริบตา" />
        <Panel pad={40} style={{ textAlign: "center", color: "var(--text-dim)", background: "rgba(255,255,255,0.02)", border: "1px dashed var(--border)", borderRadius: 16 }}>
          <I.chart s={24} style={{ marginBottom: 8, color: "var(--text-faint)", display: "block", margin: "0 auto 8px" }} />
          <div>ไม่พบข้อมูลสถิติเนื่องจากไม่มีร้านอาหารที่ตรงตามเงื่อนไขการกรอง</div>
        </Panel>
      </section>
    );
  }
  const top6 = restaurants.slice(0, 6);
  const radarAxes = Object.keys(top3[0].radar);
  const radarColors = [
    { fill: "color-mix(in oklch, var(--accent) 20%, transparent)", stroke: "var(--accent)" },
    { fill: "color-mix(in oklch, var(--accent2) 18%, transparent)", stroke: "var(--accent2)" },
    { fill: "color-mix(in oklch, var(--pos) 16%, transparent)", stroke: "var(--pos)" },
  ];

  return (
    <section id="viz">
      <SectionHead icon={<I.chart s={20} />} kicker="ภาพข้อมูลและสถิติ"
        title="ตัวเลขเบื้องหลังการจัดอันดับ"
        desc="คะแนน AI รวมถูกแจกแจงอย่างละเอียด เพื่อช่วยให้กลุ่มของคุณตรวจสอบโมเดลได้อย่างรวดเร็วในพริบตา" />

      <div className="viz-grid">
        {/* AI score comparison */}
        <Panel pad={22} className="viz-wide">
          <div className="viz-head"><span><I.chart s={15} />เปรียบเทียบคะแนน AI</span><span className="viz-sub">คะแนนรวม · 0–100</span></div>
          <CompareBars items={top6.map((r) => ({ label: r.name, value: r.aiScore }))} />
        </Panel>

        {/* weighted model */}
        <Panel pad={22}>
          <div className="viz-head"><span><I.sliders s={15} />ค่าน้ำหนักคะแนน</span></div>
          <p style={{ color: "var(--text-dim)", fontSize: 12.5, margin: "0 0 16px" }}>สัดส่วนและผลกระทบของแต่ละปัจจัยต่อคะแนนรวมสุดท้าย</p>
          <WeightedBar weights={SCORE_WEIGHTS} />
        </Panel>

        {/* price vs reviews scatter */}
        <Panel pad={22}>
          <div className="viz-head"><span><I.bolt s={15} />ราคา vs. จำนวนรีวิว</span></div>
          <Scatter data={restaurants} xKey="priceTHB" yKey="reviews"
            xLabel="ราคาเฉลี่ยต่อคน (฿)" yLabel="จำนวนรีวิว"
            highlight={top3.map((r) => r.id)} />
        </Panel>

        {/* rating comparison */}
        <Panel pad={22}>
          <div className="viz-head"><span><I.star s={15} />เปรียบเทียบคะแนนรีวิว</span><span className="viz-sub">★ จาก 5 ดาว</span></div>
          <CompareBars max={5} unit="★" items={top6.map((r) => ({
            label: r.name, value: r.rating, color: "linear-gradient(90deg, var(--warn), var(--accent))",
          }))} />
        </Panel>

        {/* radar overlay of top 3 */}
        <Panel pad={22} className="viz-radar">
          <div className="viz-head"><span><I.radar s={15} />แผนภูมิเปรียบเทียบโปรไฟล์ของ 3 อันดับแรก</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
            <Radar size={250} axes={radarAxes}
              series={top3.map((r, i) => ({ values: r.radar, ...radarColors[i] }))} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {top3.map((r, i) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13 }}>
                  <span style={{ width: 11, height: 11, borderRadius: 3, background: radarColors[i].stroke, boxShadow: `0 0 7px ${radarColors[i].stroke}` }} />
                  <span style={{ color: "var(--text-dim)" }}>{r.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>
    </section>
  );
}

window.VizSection = VizSection;

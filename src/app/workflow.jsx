// workflow.jsx — AI pipeline: processing overlay + interactive diagram.

// icon resolver for a stage
function stageIcon(id, s = 20) {
  const { I } = window;
  const map = {
    input: I.cursor, search: I.search, reviews: I.messages, clean: I.filter,
    analyze: I.brain, score: I.sliders, rank: I.list, recommend: I.sparkles, report: I.file,
  };
  const C = map[id] || I.bolt;
  return <C s={s} />;
}

// ---------- Processing overlay ----------
function ProcessingOverlay({ stages, config, onComplete }) {
  const [active, setActive] = React.useState(0);
  const [logs, setLogs] = React.useState([]);
  const logRef = React.useRef(null);

  React.useEffect(() => {
    const perStage = 720;
    const lines = [
      `> พื้นที่ = "${config.area}"  ·  จำนวนคน = ${config.groupSize}  ·  อาหาร = "${config.cuisine}"`,
      "> กำลังเชื่อมต่อกับแหล่งข้อมูลทั้ง 2 แหล่ง…",
      "> ดึงข้อมูลรีวิว 38,400 รายการ · กำลังกรองบอทและรีวิวซ้ำ",
      "> ลดสัญญาณรบกวนลง 61% · ปรับมาตรฐานข้อมูลร้านอาหาร 142 แห่ง",
      "> กำลังเรียกใช้โมเดลวิเคราะห์ความพึงพอใจและความเหมาะสมกับกลุ่ม v4…",
      "> กำลังคำนวณค่าน้ำหนัก: รีวิว 30 · ความเข้ากันของกลุ่ม 25 · การเดินทาง 20 · ความคุ้มค่า 15 · บรรยากาศ 10",
      "> คำนวณคะแนนรวมเสร็จสิ้น · กำลังจัดเรียงลำดับตัวเลือก",
      "> กำลังคัดเลือก 3 อันดับแรกพร้อมสรุปเหตุผลความเหมาะสม…",
      "> รวบรวมรายงานสำเร็จ ✓ กำลังแสดงผลแดชบอร์ด",
    ];
    const timers = [];
    stages.forEach((s, i) => {
      timers.push(setTimeout(() => {
        setActive(i);
        setLogs((L) => [...L, lines[i]]);
      }, i * perStage));
    });
    timers.push(setTimeout(onComplete, stages.length * perStage + 520));
    return () => timers.forEach(clearTimeout);
  }, []);

  React.useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);

  const pct = Math.round(((active + 1) / stages.length) * 100);
  const cur = stages[active];

  return (
    <div className="proc-overlay">
      <div className="proc-core">
        {/* rotating rings + active icon */}
        <div className="proc-orb">
          <svg width="220" height="220" viewBox="0 0 220 220" className="orb-spin-slow">
            <circle cx="110" cy="110" r="100" fill="none" stroke="oklch(0.7 0.02 250 / 0.12)" strokeWidth="1" strokeDasharray="4 8" />
          </svg>
          <svg width="180" height="180" viewBox="0 0 180 180" className="orb-spin" style={{ position: "absolute" }}>
            <circle cx="90" cy="90" r="82" fill="none" stroke="var(--accent)" strokeWidth="2"
              strokeDasharray="120 400" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px var(--accent))" }} />
            <circle cx="90" cy="90" r="82" fill="none" stroke="var(--accent2)" strokeWidth="2"
              strokeDasharray="60 460" strokeDashoffset="-260" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px var(--accent2))" }} />
          </svg>
          <div className="proc-icon">{stageIcon(cur.id, 38)}</div>
        </div>

        <div style={{ textAlign: "center", marginTop: 8 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: ".16em", color: "var(--accent)", textTransform: "uppercase" }}>
            ขั้นตอน {active + 1} / {stages.length} · {pct}%
          </div>
          <h2 style={{ margin: "8px 0 4px", fontFamily: "var(--display)", fontSize: 26, fontWeight: 600 }}>{cur.title}</h2>
          <p style={{ margin: 0, color: "var(--text-dim)", fontSize: 14 }}>{cur.desc}</p>
        </div>

        {/* stage strip */}
        <div className="proc-strip">
          {stages.map((s, i) => (
            <div key={s.id} className="strip-node" data-state={i < active ? "done" : i === active ? "active" : "todo"}>
              <div className="strip-dot">{i < active ? <window.I.check s={13} /> : stageIcon(s.id, 14)}</div>
              {i < stages.length - 1 && <div className="strip-line" data-on={i < active} />}
            </div>
          ))}
        </div>

        {/* live log */}
        <div className="proc-log" ref={logRef}>
          {logs.map((l, i) => <div key={i} className="log-line">{l}</div>)}
          <div className="log-cursor">▍</div>
        </div>
      </div>
    </div>
  );
}

// ---------- Interactive completed diagram ----------
function WorkflowDiagram({ stages }) {
  const [hover, setHover] = React.useState(null);
  const rows = [stages.slice(0, 3), stages.slice(3, 6), stages.slice(6, 9)];
  let idx = -1;
  return (
    <div className="wf-rows">
      {rows.map((row, ri) => (
        <React.Fragment key={ri}>
          <div className="wf-row">
            {row.map((s, ci) => {
              idx++;
              const i = idx;
              return (
                <React.Fragment key={s.id}>
                  <div className="wf-node" data-active={hover === i}
                    onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                    <div className="wf-node-top">
                      <div className="wf-ico">{stageIcon(s.id, 18)}</div>
                      <span className="wf-num">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="wf-title">{s.title}</div>
                    <div className="wf-desc">{s.desc}</div>
                    <div className="wf-metric"><window.I.check s={11} />{s.metric}</div>
                  </div>
                  {ci < row.length - 1 && <div className="wf-conn"><span className="wf-flow" /></div>}
                </React.Fragment>
              );
            })}
          </div>
          {ri < rows.length - 1 && (
            <div className="wf-vconn"><span className="wf-vflow" /><window.I.chevronDown s={14} /></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

Object.assign(window, { ProcessingOverlay, WorkflowDiagram, stageIcon });

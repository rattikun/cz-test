// components.jsx — shared UI primitives + data-viz charts.

// ---- Photo placeholder (designed empty-state, tinted per cuisine) ----
function Photo({ hue = 200, label = "venue photo", h = 150, badge }) {
  const sid = "ph" + Math.round(hue) + "_" + Math.round(h);
  return (
    <div style={{
      position: "relative", height: h, borderRadius: 12, overflow: "hidden",
      background: `linear-gradient(135deg, oklch(0.30 0.06 ${hue}), oklch(0.20 0.04 ${hue + 30}))`,
      border: "1px solid var(--border)",
    }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.5 }}>
        <defs>
          <pattern id={sid} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="14" stroke={`oklch(0.7 0.06 ${hue})`} strokeWidth="1" opacity="0.25" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${sid})`} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "flex-end",
        padding: 10, justifyContent: "space-between",
      }}>
        <span style={{
          fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".05em",
          color: `oklch(0.85 0.04 ${hue})`, background: "oklch(0.15 0.02 250 / 0.55)",
          padding: "3px 7px", borderRadius: 6, textTransform: "uppercase",
        }}>{label}</span>
        {badge}
      </div>
    </div>
  );
}

// ---- Glass panel ----
function Panel({ children, style, glow, pad = 20, className = "" }) {
  return (
    <div className={"glass " + className} style={{
      borderRadius: 16, padding: pad,
      boxShadow: glow ? "0 0 0 1px var(--border), 0 18px 50px -22px var(--glow)" : undefined,
      ...style,
    }}>{children}</div>
  );
}

// ---- Pill / chip ----
function Pill({ children, tone = "dim", icon, style }) {
  const tones = {
    dim: { c: "var(--text-dim)", bg: "oklch(0.7 0.02 250 / 0.08)", b: "var(--border)" },
    accent: { c: "var(--accent)", bg: "color-mix(in oklch, var(--accent) 14%, transparent)", b: "color-mix(in oklch, var(--accent) 35%, transparent)" },
    pos: { c: "var(--pos)", bg: "color-mix(in oklch, var(--pos) 13%, transparent)", b: "color-mix(in oklch, var(--pos) 32%, transparent)" },
    warn: { c: "var(--warn)", bg: "color-mix(in oklch, var(--warn) 14%, transparent)", b: "color-mix(in oklch, var(--warn) 32%, transparent)" },
  }[tone];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12,
      fontWeight: 600, color: tones.c, background: tones.bg, border: `1px solid ${tones.b}`,
      padding: icon ? "4px 9px 4px 7px" : "4px 10px", borderRadius: 999, whiteSpace: "nowrap",
      fontFamily: "var(--mono)", letterSpacing: ".01em", ...style,
    }}>{icon}{children}</span>
  );
}

// ---- Animated score ring ----
function ScoreRing({ value, size = 64, stroke = 5, label, animate = true }) {
  const [v, setV] = React.useState(animate ? 0 : value);
  React.useEffect(() => {
    if (!animate) { setV(value); return; }
    let raf, start;
    const dur = 900;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setV(value * e);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, animate]);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const col = v >= 90 ? "var(--pos)" : v >= 82 ? "var(--accent)" : "var(--accent2)";
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="oklch(0.7 0.02 250 / 0.12)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)}
          style={{ filter: `drop-shadow(0 0 5px ${col})` }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", lineHeight: 1,
      }}>
        <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: size * 0.28, color: col }}>{Math.round(v)}</span>
        {label && <span style={{ fontSize: 8, color: "var(--text-faint)", marginTop: 2, letterSpacing: ".08em" }}>{label}</span>}
      </div>
    </div>
  );
}

// ---- Horizontal comparison bars ----
function CompareBars({ items, max = 100, unit = "", animate = true }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 1fr 52px", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12.5, color: "var(--text-dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.label}</span>
          <div style={{ height: 9, borderRadius: 999, background: "oklch(0.7 0.02 250 / 0.1)", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${(it.value / max) * 100}%`, borderRadius: 999,
              background: it.color || "linear-gradient(90deg, var(--accent), var(--accent2))",
              transition: animate ? "width 1s cubic-bezier(.2,.8,.2,1)" : "none",
              boxShadow: "0 0 10px -2px var(--glow)",
            }} />
          </div>
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text)", textAlign: "right" }}>{it.value}{unit}</span>
        </div>
      ))}
    </div>
  );
}

// ---- Radar chart (multi-series) ----
function Radar({ axes, series, size = 240 }) {
  const cx = size / 2, cy = size / 2, R = size / 2 - 34;
  const n = axes.length;
  const pt = (i, frac) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(a) * R * frac, cy + Math.sin(a) * R * frac];
  };
  const rings = [0.25, 0.5, 0.75, 1];
  return (
    <svg width={size} height={size} style={{ overflow: "visible" }}>
      {rings.map((f, ri) => (
        <polygon key={ri} points={axes.map((_, i) => pt(i, f).join(",")).join(" ")}
          fill="none" stroke="oklch(0.7 0.02 250 / 0.12)" strokeWidth="1" />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="oklch(0.7 0.02 250 / 0.1)" strokeWidth="1" />;
      })}
      {series.map((s, si) => {
        const pts = axes.map((ax, i) => pt(i, (s.values[ax] || 0) / 100));
        return (
          <g key={si}>
            <polygon points={pts.map((p) => p.join(",")).join(" ")}
              fill={s.fill} stroke={s.stroke} strokeWidth="2"
              style={{ filter: `drop-shadow(0 0 6px ${s.stroke})` }} />
            {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={s.stroke} />)}
          </g>
        );
      })}
      {axes.map((ax, i) => {
        const [x, y] = pt(i, 1.2);
        return (
          <text key={ax} x={x} y={y} fill="var(--text-dim)" fontSize="10.5"
            fontFamily="var(--mono)" textAnchor={Math.abs(x - cx) < 4 ? "middle" : x > cx ? "start" : "end"}
            dominantBaseline="middle">{ax}</text>
        );
      })}
    </svg>
  );
}

// ---- Scatter: price vs reviews ----
function Scatter({ data, w = 460, h = 240, xKey, yKey, xLabel, yLabel, highlight = [] }) {
  const pad = { l: 44, r: 16, t: 16, b: 36 };
  const xs = data.map((d) => d[xKey]), ys = data.map((d) => d[yKey]);
  const xMin = Math.min(...xs) * 0.92, xMax = Math.max(...xs) * 1.05;
  const yMin = Math.min(...ys) * 0.96, yMax = Math.max(...ys) * 1.02;
  const px = (v) => pad.l + ((v - xMin) / (xMax - xMin)) * (w - pad.l - pad.r);
  const py = (v) => h - pad.b - ((v - yMin) / (yMax - yMin)) * (h - pad.t - pad.b);
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
        const y = pad.t + f * (h - pad.t - pad.b);
        return <line key={i} x1={pad.l} y1={y} x2={w - pad.r} y2={y} stroke="oklch(0.7 0.02 250 / 0.1)" strokeWidth="1" />;
      })}
      {data.map((d, i) => {
        const hi = highlight.includes(d.id);
        return (
          <g key={d.id}>
            <circle cx={px(d[xKey])} cy={py(d[yKey])} r={hi ? 7 : 5}
              fill={hi ? "var(--accent)" : "oklch(0.7 0.03 285 / 0.55)"}
              stroke={hi ? "var(--accent)" : "transparent"} strokeWidth="2"
              style={{ filter: hi ? "drop-shadow(0 0 7px var(--accent))" : "none" }} />
            {hi && <text x={px(d[xKey])} y={py(d[yKey]) - 11} fill="var(--text)" fontSize="9.5"
              fontFamily="var(--mono)" textAnchor="middle">{d.name.split(" ")[0]}</text>}
          </g>
        );
      })}
      <text x={(w) / 2} y={h - 6} fill="var(--text-faint)" fontSize="10" fontFamily="var(--mono)" textAnchor="middle">{xLabel}</text>
      <text x={12} y={h / 2} fill="var(--text-faint)" fontSize="10" fontFamily="var(--mono)" textAnchor="middle" transform={`rotate(-90 12 ${h / 2})`}>{yLabel}</text>
    </svg>
  );
}

// ---- Stacked weighted-score breakdown bar ----
function WeightedBar({ weights }) {
  const hueMap = { accent: "var(--accent)", accent2: "var(--accent2)", pos: "var(--pos)", warn: "var(--warn)" };
  return (
    <div>
      <div style={{ display: "flex", height: 14, borderRadius: 999, overflow: "hidden", border: "1px solid var(--border)" }}>
        {weights.map((w) => (
          <div key={w.key} title={`${w.label} ${w.weight}%`} style={{
            width: `${w.weight}%`, background: hueMap[w.hue], opacity: 0.85,
            borderRight: "1px solid oklch(0.15 0.02 250 / 0.4)",
          }} />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "9px 16px", marginTop: 12 }}>
        {weights.map((w) => (
          <div key={w.key} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, whiteSpace: "nowrap" }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: hueMap[w.hue], flexShrink: 0 }} />
            <span style={{ color: "var(--text-dim)" }}>{w.label}</span>
            <span style={{ fontFamily: "var(--mono)", color: "var(--text)", fontWeight: 600 }}>{w.weight}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Section heading ----
function SectionHead({ icon, kicker, title, desc, right }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: 13 }}>
        <div className="ico-tile">{icon}</div>
        <div>
          {kicker && <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".14em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 5 }}>{kicker}</div>}
          <h2 style={{ margin: 0, fontFamily: "var(--display)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</h2>
          {desc && <p style={{ margin: "5px 0 0", color: "var(--text-dim)", fontSize: 13.5, maxWidth: 560 }}>{desc}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

Object.assign(window, { Photo, Panel, Pill, ScoreRing, CompareBars, Radar, Scatter, WeightedBar, SectionHead });

// icons.jsx — curated minimal stroke icons (24x24, currentColor)
// Simple line geometry only; sized via the `s` prop.

function Icon({ paths, s = 18, fill = false, strokeWidth = 1.6, style }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
      strokeLinejoin="round" style={{ display: "block", flexShrink: 0, ...style }}>
      {paths}
    </svg>
  );
}

const I = {
  search: (p) => <Icon {...p} paths={<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>} />,
  pin: (p) => <Icon {...p} paths={<><path d="M20 10c0 5-8 12-8 12s-8-7-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="2.6" /></>} />,
  users: (p) => <Icon {...p} paths={<><path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19" /><circle cx="10" cy="8" r="3.2" /><path d="M20 19v-1.4a3.5 3.5 0 0 0-2.6-3.3M15 5.2a3.2 3.2 0 0 1 0 6" /></>} />,
  wallet: (p) => <Icon {...p} paths={<><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 9h18" /><circle cx="16.5" cy="13" r="1.3" fill="currentColor" stroke="none" /></>} />,
  utensils: (p) => <Icon {...p} paths={<><path d="M5 3v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3M7 12v9M16 3c-1.5 0-2.5 2-2.5 4.5S14.5 12 16 12v9" /></>} />,
  sparkles: (p) => <Icon {...p} paths={<><path d="M12 3l1.7 4.6L18 9.3l-4.3 1.7L12 15.6l-1.7-4.6L6 9.3l4.3-1.7L12 3Z" /><path d="M18.5 14.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" /></>} />,
  star: (p) => <Icon {...p} paths={<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.9L12 3.5Z" />} />,
  cursor: (p) => <Icon {...p} paths={<><path d="M4 4l7 16 2-6 6-2L4 4Z" /></>} />,
  messages: (p) => <Icon {...p} paths={<><path d="M4 5h13a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3v-3H4a0 0 0 0 1 0 0V5Z" transform="translate(0 -1)" /><path d="M8 8h7M8 11h4" /></>} />,
  filter: (p) => <Icon {...p} paths={<path d="M4 5h16l-6 7v6l-4-2v-4L4 5Z" />} />,
  brain: (p) => <Icon {...p} paths={<><path d="M9.5 4.5A2.5 2.5 0 0 0 7 7a2.5 2.5 0 0 0-1 4.8A2.6 2.6 0 0 0 7.5 16 2.5 2.5 0 0 0 12 17V5a2.2 2.2 0 0 0-2.5-.5Z" /><path d="M14.5 4.5A2.5 2.5 0 0 1 17 7a2.5 2.5 0 0 1 1 4.8A2.6 2.6 0 0 1 16.5 16 2.5 2.5 0 0 1 12 17" /></>} />,
  sliders: (p) => <Icon {...p} paths={<><path d="M5 5v6M5 15v4M12 5v3M12 12v7M19 5v8M19 17v2" /><circle cx="5" cy="13" r="1.8" /><circle cx="12" cy="10" r="1.8" /><circle cx="19" cy="15" r="1.8" /></>} />,
  list: (p) => <Icon {...p} paths={<><path d="M8 6h12M8 12h12M8 18h12" /><circle cx="4" cy="6" r="1.1" fill="currentColor" stroke="none" /><circle cx="4" cy="12" r="1.1" fill="currentColor" stroke="none" /><circle cx="4" cy="18" r="1.1" fill="currentColor" stroke="none" /></>} />,
  file: (p) => <Icon {...p} paths={<><path d="M6 3h7l5 5v13a0 0 0 0 1 0 0H6a0 0 0 0 1 0 0V3Z" /><path d="M13 3v5h5M9 13h6M9 16h6" /></>} />,
  chat: (p) => <Icon {...p} paths={<path d="M4 5h16v10H9l-4 3v-3H4V5Z" />} />,
  globe: (p) => <Icon {...p} paths={<><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.4 2.5 14.6 0 17M12 3.5c-2.5 2.4-2.5 14.6 0 17" /></>} />,
  ruler: (p) => <Icon {...p} paths={<><rect x="3" y="8" width="18" height="8" rx="1.5" /><path d="M7 8v3M11 8v4M15 8v3M19 8v4" /></>} />,
  check: (p) => <Icon {...p} paths={<path d="M4 12.5l5 5 11-11" strokeWidth="2" />} />,
  chevron: (p) => <Icon {...p} paths={<path d="M9 6l6 6-6 6" />} />,
  chevronDown: (p) => <Icon {...p} paths={<path d="M6 9l6 6 6-6" />} />,
  arrowRight: (p) => <Icon {...p} paths={<path d="M5 12h14M13 6l6 6-6 6" />} />,
  arrowUp: (p) => <Icon {...p} paths={<path d="M12 19V5M6 11l6-6 6 6" />} />,
  arrowDown: (p) => <Icon {...p} paths={<path d="M12 5v14M6 13l6 6 6-6" />} />,
  bolt: (p) => <Icon {...p} paths={<path d="M13 3L5 13h6l-1 8 8-10h-6l1-8Z" />} />,
  download: (p) => <Icon {...p} paths={<><path d="M12 4v11M7 11l5 5 5-5" /><path d="M5 20h14" /></>} />,
  grid: (p) => <Icon {...p} paths={<><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>} />,
  trophy: (p) => <Icon {...p} paths={<><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 16h6M10 20h4M12 16v4" /></>} />,
  chart: (p) => <Icon {...p} paths={<><path d="M4 4v16h16" /><path d="M8 14v3M12 9v8M16 12v5M20 6v11" strokeWidth="2.2" /></>} />,
  radar: (p) => <Icon {...p} paths={<><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><path d="M12 3.5v17M3.5 12h17" /></>} />,
  shield: (p) => <Icon {...p} paths={<><path d="M12 3l7 2.5v5C19 16 12 21 12 21s-7-5-7-10.5v-5L12 3Z" /><path d="M9 11.5l2 2 4-4" /></>} />,
  x: (p) => <Icon {...p} paths={<path d="M6 6l12 12M18 6L6 18" />} />,
  clock: (p) => <Icon {...p} paths={<><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></>} />,
};

window.I = I;
window.Icon = Icon;

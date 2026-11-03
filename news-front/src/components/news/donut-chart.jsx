import { sourceColor, sourceLabel, sourceTypes } from "@/lib/news";

// 인용 출처 비중을 도넛(원) 그래프로 보여 주는 부품
// share: { gov: 0.6, opp: 0.2, ... }
export function DonutChart({ share, label, size = 96, showLegend = true }) {
  const stroke = size * 0.16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = Object.values(share).reduce((a, b) => a + b, 0);

  // 각 조각의 시작 위치를 차례로 쌓아 계산
  let offset = 0;
  const slices = sourceTypes
    .filter((t) => share[t.id] > 0)
    .map((t) => {
      const length = share[t.id] * circumference;
      const slice = { id: t.id, length, offset };
      offset += length;
      return slice;
    });

  // 가운데에는 가장 많이 인용된 출처를 보여 줌
  const top = sourceTypes.reduce((best, t) => (share[t.id] > (share[best?.id] ?? 0) ? t : best), null);

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      <div className="flex items-center gap-4">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90" role="img" aria-label={label ?? "인용 출처 비중"}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
          {slices.map((s) => (
            <circle
              key={s.id}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={sourceColor(s.id)}
              strokeWidth={stroke}
              strokeDasharray={`${s.length} ${circumference - s.length}`}
              strokeDashoffset={-s.offset}
            >
              <title>{`${sourceLabel(s.id)} ${Math.round(share[s.id] * 100)}%`}</title>
            </circle>
          ))}
          {total > 0 && top && (
            <g className="rotate-90" style={{ transformOrigin: "center" }}>
              <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.12} fill="var(--muted-foreground)">
                {sourceLabel(top.id)}
              </text>
              <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.17} fontWeight="700" fill="var(--foreground)">
                {Math.round(share[top.id] * 100)}%
              </text>
            </g>
          )}
        </svg>
        {showLegend && (
          <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
            {sourceTypes.map((t) => (
              <li key={t.id} className="flex items-center gap-1.5">
                <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: sourceColor(t.id) }} />
                <span>{t.label}</span>
                <span className="tabular-nums">{Math.round((share[t.id] ?? 0) * 100)}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {total === 0 && <span className="text-xs text-muted-foreground">인용된 출처가 없어요</span>}
    </div>
  );
}

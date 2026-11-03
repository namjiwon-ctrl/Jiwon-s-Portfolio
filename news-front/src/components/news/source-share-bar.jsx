import { sourceColor, sourceLabel, sourceTypes } from "@/lib/news";

// 인용 출처 비중을 가로 막대 하나로 보여 주는 부품
// share: { gov: 0.6, opp: 0.2, ... } 형태 (합이 1 또는 0)
export function SourceShareBar({ share, label, showLegend = false, height = "h-3" }) {
  const total = Object.values(share).reduce((a, b) => a + b, 0);
  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      <div className={`flex w-full overflow-hidden rounded-full bg-muted ${height}`}>
        {total > 0 &&
          sourceTypes.map((t) =>
            share[t.id] > 0 ? (
              <div
                key={t.id}
                style={{ width: `${share[t.id] * 100}%`, backgroundColor: sourceColor(t.id) }}
                title={`${sourceLabel(t.id)} ${Math.round(share[t.id] * 100)}%`}
              />
            ) : null
          )}
      </div>
      {total === 0 && <span className="text-xs text-muted-foreground">인용된 출처가 없습니다</span>}
      {showLegend && <SourceLegend share={share} />}
    </div>
  );
}

export function SourceLegend({ share }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {sourceTypes.map((t) => (
        <li key={t.id} className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: sourceColor(t.id) }} />
          {t.label}
          {share && <span className="tabular-nums">{Math.round((share[t.id] ?? 0) * 100)}%</span>}
        </li>
      ))}
    </ul>
  );
}

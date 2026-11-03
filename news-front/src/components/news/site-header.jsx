import Link from "next/link";
import { ChartStyleToggle } from "@/components/news/chart-style-toggle";

// 모든 화면 위에 보이는 머리글
export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="font-bold tracking-tight">
          뉴스 편향도 분석
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground sm:inline">예시 데이터로 보는 화면이에요</span>
          <ChartStyleToggle />
        </div>
      </div>
    </header>
  );
}

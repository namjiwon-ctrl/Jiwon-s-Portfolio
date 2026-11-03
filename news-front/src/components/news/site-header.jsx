import Link from "next/link";

// 모든 화면 위에 보이는 머리글
export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-bold tracking-tight">
          뉴스 편향도 분석
        </Link>
        <span className="text-xs text-muted-foreground">예시 데이터로 보는 화면이에요</span>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceLegend } from "@/components/news/source-share-bar";
import { BarOnlyLegend, CompareCharts, ShareChart } from "@/components/news/share-chart";
import { clearHistory, interestedIssueCounts, loadSampleHistory, readArticleIds, useReadingEvents } from "@/lib/reading-history";
import { getArticle, getIssue, getOutlet, readingBias, sourceShare } from "@/lib/news";

// "내 읽기 편향" 화면 내용 (브라우저 기록을 읽어야 해서 클라이언트에서 그림)
export function MyBiasDashboard() {
  const events = useReadingEvents();
  const ids = readArticleIds(events); // 원문 보기를 누른 기사
  const interests = interestedIssueCounts(events, (id) => getArticle(id)?.issueId);
  const { read, mine, all, lessHeard, recommendations, outletCounts } = readingBias(ids);

  const controls = (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={loadSampleHistory}>
        예시 기록 불러오기
      </Button>
      {events.length > 0 && (
        <Button variant="ghost" size="sm" onClick={clearHistory}>
          기록 지우기
        </Button>
      )}
    </div>
  );

  const interestCard = interests.length > 0 && (
    <Card>
      <CardHeader>
        <CardTitle>관심 있는 주제</CardTitle>
        <CardDescription>분석 화면을 열어 본 기사의 이슈입니다.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {interests.map(({ issueId, count }) => (
          <Link key={issueId} href={`/issues/${issueId}`} className="flex items-center justify-between gap-3 text-sm hover:underline">
            <span>{getIssue(issueId)?.title}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">기사 {count}건</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );

  if (read.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>아직 읽은 기사가 없습니다</CardTitle>
            <CardDescription>
              <Link href="/" className="underline underline-offset-2">
                이슈 목록
              </Link>
              에서 기사를 고른 뒤 &lsquo;원문 보기&rsquo;를 누르면 읽은 기사로 기록됩니다. 시연할 때는 예시 기록을 불러올 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>{controls}</CardContent>
        </Card>
        {interestCard}
      </div>
    );
  }

  const maxOutlet = Math.max(...outletCounts.map((o) => o.count));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">원문을 열어 읽은 기사 {read.length}건</span>
        {controls}
      </div>

      {/* 1. 내가 접한 인용 출처 비중 */}
      <Card>
        <CardHeader>
          <CardTitle>내가 접한 인용 출처</CardTitle>
          <CardDescription>읽은 기사에서 누구의 말을 많이 접했는지 사이트 전체 기사 평균과 비교합니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <CompareCharts mine={mine} avg={all} mineLabel="내가 읽은 기사" avgLabel="사이트 전체 기사 평균" />
          <BarOnlyLegend>
            <SourceLegend />
          </BarOnlyLegend>
        </CardContent>
      </Card>

      {/* 2. 덜 접한 목소리 + 추천 기사 */}
      <Card>
        <CardHeader>
          <CardTitle>덜 접한 목소리</CardTitle>
          <CardDescription>사이트 전체 기사 평균보다 10%p 이상 적게 접한 출처입니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {lessHeard.length === 0 ? (
            <p className="text-sm">여러 목소리를 고르게 접하고 있습니다.</p>
          ) : (
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {lessHeard.map((t) => (
                <li key={t.id}>
                  <b>{t.label}</b>의 목소리를 전체 평균보다 {Math.round(-t.diff * 100)}%p 적게 접했습니다
                </li>
              ))}
            </ul>
          )}
          {recommendations.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium">이 목소리가 담긴 기사</span>
              {recommendations.map((a) => (
                <Link key={a.id} href={`/articles/${a.id}`} className="group flex flex-col gap-1.5 rounded-lg border p-3">
                  <span className="text-xs text-muted-foreground">{getOutlet(a.outletId)?.name}</span>
                  <span className="font-medium group-hover:underline">{a.title}</span>
                  <ShareChart share={sourceShare(a)} size={72} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {interestCard}

      {/* 3. 자주 본 언론사 */}
      <Card>
        <CardHeader>
          <CardTitle>자주 본 언론사</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {outletCounts.map((o) => (
            <div key={o.id} className="flex items-center gap-3 text-sm">
              <span className="w-20 shrink-0">{o.name}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-foreground/70" style={{ width: `${(o.count / maxOutlet) * 100}%` }} />
              </div>
              <span className="w-10 shrink-0 text-right tabular-nums text-muted-foreground">{o.count}건</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceLegend } from "@/components/news/source-share-bar";
import { BarOnlyLegend, ShareChart } from "@/components/news/share-chart";
import { Intro } from "@/components/news/intro";
import { averageShare, formatDate, getArticlesOfIssue, getIssues } from "@/lib/news";

// 화면 1: 이슈 목록
export default function Home() {
  const issues = getIssues();
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
      <Intro />
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold tracking-tight">오늘의 이슈</h2>
        <BarOnlyLegend>
          <SourceLegend />
        </BarOnlyLegend>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {issues.map((issue) => {
          const articles = getArticlesOfIssue(issue.id);
          return (
            <Link key={issue.id} href={`/issues/${issue.id}`} className="group">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{issue.category}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(issue.date)}</span>
                  </div>
                  <CardTitle className="text-lg leading-snug group-hover:underline">{issue.title}</CardTitle>
                  <CardDescription>{issue.summary}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <ShareChart share={averageShare(articles)} label="이 이슈 기사들의 평균 인용 출처" size={88} />
                  <span className="text-xs text-muted-foreground">기사 {articles.length}건</span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

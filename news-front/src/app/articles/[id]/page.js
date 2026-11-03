import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceLegend } from "@/components/news/source-share-bar";
import { BarOnlyLegend, CompareCharts, ShareChart } from "@/components/news/share-chart";
import {
  compareWithIssue,
  differentViewArticles,
  formatDate,
  getArticle,
  getIssue,
  getOutlet,
  opinionRatio,
  sourceColor,
  sourceLabel,
} from "@/lib/news";
import data from "@/data/mock-news.json";
import { RecordRead } from "@/components/news/record-read";
import { OriginalLink } from "@/components/news/original-link";

export function generateStaticParams() {
  return data.articles.map((a) => ({ id: a.id }));
}

// 문장에 프레이밍 어휘(화면 표기: 평가가 담긴 표현)가 있으면 노란색으로 강조
function highlightTerms(text, terms) {
  if (terms.length === 0) return text;
  const pattern = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  return text.split(pattern).map((part, i) =>
    terms.includes(part) ? (
      <mark key={i} className="rounded bg-amber-100 px-0.5 text-inherit">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

// 화면 3: 기사 상세 (지표와 근거 문장)
export default async function ArticlePage({ params }) {
  const { id } = await params;
  const article = getArticle(id);
  if (!article) notFound();
  const issue = getIssue(article.issueId);
  const outlet = getOutlet(article.outletId);
  const { mine, avg, notes } = compareWithIssue(article);
  const recommendations = differentViewArticles(article);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <RecordRead articleId={article.id} />
      <Link href={`/issues/${issue.id}`} className="text-sm text-muted-foreground hover:underline">
        ← {issue.title}
      </Link>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          {outlet?.name} · {formatDate(article.publishedAt)}
        </span>
        <h1 className="text-2xl font-bold leading-snug tracking-tight">{article.title}</h1>
        <p className="text-muted-foreground">{article.summary}</p>
        <OriginalLink articleId={article.id} url={article.url} outletName={outlet?.name} className="text-sm underline underline-offset-4" />
      </div>

      {/* 같은 이슈의 다른 기사와 비교 */}
      <Card>
        <CardHeader>
          <CardTitle>같은 이슈의 다른 기사와 비교하면</CardTitle>
          <CardDescription>기사를 판정하지 않습니다. 같은 이슈를 다룬 다른 기사와 무엇이 다른지 보여 줍니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <CompareCharts mine={mine} avg={avg} />
          <BarOnlyLegend>
            <SourceLegend />
          </BarOnlyLegend>
          {notes.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          )}
          <span className="text-sm text-muted-foreground">의견 문장 비율 {Math.round(opinionRatio(article) * 100)}%</span>
        </CardContent>
      </Card>

      {/* 이 기사에 없는 인용 (빠진 관점) */}
      {article.missingViewpoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>이 기사에 없는 인용</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {article.missingViewpoints.map((m) => (
              <div key={m.sourceType} className="flex flex-col gap-1">
                <span className="text-sm">{m.description}</span>
                <span className="text-xs text-muted-foreground">
                  이 목소리가 담긴 기사:{" "}
                  {m.foundInArticleIds.map((aid, i) => (
                    <span key={aid}>
                      {i > 0 && ", "}
                      <Link href={`/articles/${aid}`} className="underline underline-offset-2">
                        {getOutlet(getArticle(aid)?.outletId)?.name}
                      </Link>
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 문장별 근거 */}
      <Card>
        <CardHeader>
          <CardTitle>문장별로 보기</CardTitle>
          <CardDescription>
            왼쪽 색 막대는 인용 출처, <mark className="rounded bg-amber-100 px-0.5">노란색</mark>은 평가가 담긴 표현입니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {article.sentences.map((s) => {
            const terms = article.framingTerms.filter((f) => f.sentenceId === s.id).map((f) => f.term);
            return (
              <div
                key={s.id}
                className="flex flex-col gap-1.5 border-l-4 pl-3"
                style={{ borderColor: s.sourceType ? sourceColor(s.sourceType) : "var(--border)" }}
              >
                <p className="leading-relaxed">{highlightTerms(s.text, terms)}</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant={s.type === "opinion" ? "default" : "secondary"}>
                    {s.type === "opinion" ? "의견" : "사실"}
                  </Badge>
                  {s.sourceType && (
                    <Badge variant="outline">
                      {sourceLabel(s.sourceType)} · {s.sourceName}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 반대 시각 기사 추천 */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>다른 시각의 기사</CardTitle>
            <CardDescription>인용한 출처가 이 기사와 가장 다른 기사입니다.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recommendations.map((r) => (
              <Link key={r.id} href={`/articles/${r.id}`} className="group flex flex-col gap-1.5 rounded-lg border p-3">
                <span className="text-xs text-muted-foreground">{getOutlet(r.outletId)?.name}</span>
                <span className="font-medium group-hover:underline">{r.title}</span>
                <ShareChart share={compareWithIssue(r).mine} size={72} />
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </main>
  );
}

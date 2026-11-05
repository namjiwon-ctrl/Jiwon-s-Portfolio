// 뉴스 데이터를 읽고 화면에 필요한 숫자를 계산하는 함수 모음
// 지금은 가짜 데이터(mock-news.json)를 읽고, 나중에 백엔드 API로 바꾸면 이 파일만 고치면 됩니다.
import data from "@/data/mock-news.json";

export const sourceTypes = data.sourceTypes;

// 출처 유형별 색. 정치적 색 연상(빨강·파랑)을 피하려고 중립적인 색만 씁니다.
const PALETTE = ["#0f766e", "#b45309", "#6d28d9", "#475569", "#4d7c0f", "#92400e"];
export const OTHER_COLOR = "#cbd5e1"; // 기타
export function sourceColor(sourceTypeId) {
  const index = sourceTypes.findIndex((t) => t.id === sourceTypeId);
  return PALETTE[index % PALETTE.length] ?? "#94a3b8";
}
export function sourceLabel(sourceTypeId) {
  return sourceTypes.find((t) => t.id === sourceTypeId)?.label ?? "기타";
}

// 그래프에 그릴 조각: 비중이 큰 상위 4개만 그 유형으로, 나머지는 '기타'로 묶음
// 반환: [{ id, label, color, value }] — 순서는 출처 유형 순서 그대로, 기타는 맨 뒤
export const TOP_N = 4;
export function chartEntries(share, n = TOP_N) {
  const ranked = sourceTypes
    .map((t, order) => ({ id: t.id, label: t.label, color: sourceColor(t.id), value: share[t.id] ?? 0, order }))
    .filter((e) => e.value > 0)
    .sort((a, b) => b.value - a.value || a.order - b.order);
  const top = ranked.slice(0, n).sort((a, b) => a.order - b.order);
  const rest = ranked.slice(n).reduce((sum, e) => sum + e.value, 0);
  if (rest > 0) top.push({ id: "other", label: "기타", color: OTHER_COLOR, value: rest, order: Infinity });
  return top;
}

export function getOutlet(outletId) {
  return data.outlets.find((o) => o.id === outletId);
}

export function getIssues() {
  return data.issues;
}

export function getIssue(issueId) {
  return data.issues.find((i) => i.id === issueId);
}

export function getArticle(articleId) {
  return data.articles.find((a) => a.id === articleId);
}

export function getArticlesOfIssue(issueId) {
  const issue = getIssue(issueId);
  if (!issue) return [];
  return issue.articleIds.map(getArticle).filter(Boolean);
}

// 기사 한 건의 인용 출처 비중: 출처가 있는 문장 중 각 유형이 차지하는 비율 (0~1)
export function sourceShare(article) {
  const quoted = article.sentences.filter((s) => s.sourceType);
  const share = Object.fromEntries(sourceTypes.map((t) => [t.id, 0]));
  if (quoted.length === 0) return share;
  for (const s of quoted) share[s.sourceType] = (share[s.sourceType] ?? 0) + 1;
  for (const id of Object.keys(share)) share[id] = share[id] / quoted.length;
  return share;
}

// 여러 기사의 인용 출처 비중 평균 (이슈 평균, 내 읽기 편향에 사용)
export function averageShare(articles) {
  const avg = Object.fromEntries(sourceTypes.map((t) => [t.id, 0]));
  if (articles.length === 0) return avg;
  for (const a of articles) {
    const share = sourceShare(a);
    for (const id of Object.keys(avg)) avg[id] += share[id] / articles.length;
  }
  return avg;
}

// 기사에서 의견 문장이 차지하는 비율 (0~1)
export function opinionRatio(article) {
  if (article.sentences.length === 0) return 0;
  return article.sentences.filter((s) => s.type === "opinion").length / article.sentences.length;
}

// 이슈 평균과 비교했을 때 차이가 큰 출처 유형 설명 (판정하지 않고 비교만)
export function compareWithIssue(article) {
  const others = getArticlesOfIssue(article.issueId).filter((a) => a.id !== article.id);
  const mine = sourceShare(article);
  const avg = averageShare(others);
  const notes = [];
  for (const t of sourceTypes) {
    const diff = mine[t.id] - avg[t.id];
    if (diff >= 0.2) notes.push(`${t.label} 인용 비중이 같은 이슈의 다른 기사보다 높습니다`);
    if (mine[t.id] === 0 && avg[t.id] > 0) notes.push(`${t.label} 인용 없음 (같은 이슈의 다른 기사에는 있습니다)`);
  }
  return { mine, avg, notes };
}

// 반대 시각 추천: 같은 이슈에서 인용 출처 비중이 이 기사와 가장 다른 기사 순
export function differentViewArticles(article, limit = 2) {
  const mine = sourceShare(article);
  return getArticlesOfIssue(article.issueId)
    .filter((a) => a.id !== article.id)
    .map((a) => {
      const other = sourceShare(a);
      const distance = sourceTypes.reduce((sum, t) => sum + Math.abs(mine[t.id] - other[t.id]), 0);
      return { article: a, distance };
    })
    .sort((x, y) => y.distance - x.distance)
    .slice(0, limit)
    .map((x) => x.article);
}

export function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function getAllArticles() {
  return data.articles;
}

// 내 읽기 편향: 내가 읽은 기사들의 인용 출처 비중을 전체 기사 평균과 비교
export function readingBias(readArticleIds) {
  const read = readArticleIds.map(getArticle).filter(Boolean);
  const mine = averageShare(read);
  const all = averageShare(data.articles);
  // 전체 평균보다 10%p 이상 적게 접한 출처 = 덜 접한 목소리
  const lessHeard = sourceTypes
    .map((t) => ({ ...t, diff: mine[t.id] - all[t.id] }))
    .filter((t) => t.diff <= -0.1)
    .sort((a, b) => a.diff - b.diff);
  // 덜 접한 목소리가 많이 담긴, 아직 안 읽은 기사 추천
  const unread = data.articles.filter((a) => !readArticleIds.includes(a.id));
  const recommendations = lessHeard.length
    ? unread
        .map((a) => ({ article: a, score: lessHeard.reduce((sum, t) => sum + sourceShare(a)[t.id], 0) }))
        .filter((x) => x.score > 0)
        .sort((x, y) => y.score - x.score)
        .slice(0, 3)
        .map((x) => x.article)
    : [];
  // 자주 본 언론사
  const outletCounts = data.outlets
    .map((o) => ({ ...o, count: read.filter((a) => a.outletId === o.id).length }))
    .filter((o) => o.count > 0)
    .sort((a, b) => b.count - a.count);
  return { read, mine, all, lessHeard, recommendations, outletCounts };
}

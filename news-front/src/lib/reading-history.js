"use client";

// "내 읽기 편향"용 열람 기록.
// ▶ 저장 위치를 바꿀 때는 이 파일만 고치면 됩니다.
//   지금: 로그인 없이 이 브라우저(localStorage)에 저장
//   나중: 백엔드 API(예: POST /reading-history, GET /reading-history)로 교체
//
// 기록 한 건: { articleId, kind, readAt }
//   kind = "view"     → 우리 사이트에서 기사 분석 화면을 열었을 때
//   kind = "original" → "원문 보기"를 눌러 언론사 기사로 이동했을 때
//   (어느 쪽을 '읽음'으로 칠지는 아직 결정 전이라 둘 다 남깁니다)
import { useSyncExternalStore } from "react";

const KEY = "reading-history-v2";
const OLD_KEY = "reading-history";
const EVENT = "reading-history-change";
const EMPTY = [];

let cachedRaw = null;
let cachedValue = EMPTY;

function readRaw() {
  try {
    // 예전 형식 기록이 있으면 새 형식으로 옮김
    if (!localStorage.getItem(KEY) && localStorage.getItem(OLD_KEY)) {
      const old = JSON.parse(localStorage.getItem(OLD_KEY)) ?? [];
      localStorage.setItem(KEY, JSON.stringify(old.map((r) => ({ ...r, kind: "view" }))));
      localStorage.removeItem(OLD_KEY);
    }
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function getEvents() {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    cachedValue = Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    cachedValue = EMPTY;
  }
  return cachedValue;
}

function save(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

// 모든 기록(최신순)
export function useReadingEvents() {
  return useSyncExternalStore(subscribe, getEvents, () => EMPTY);
}

// 편향 계산에 쓰는 '읽은 기사' 목록: 같은 기사는 한 번만, 가장 최근 기록 기준
// kinds로 어떤 기록을 '읽음'으로 칠지 고를 수 있음 (기본: 둘 다)
export function readArticleIds(events, kinds = ["view", "original"]) {
  const seen = new Set();
  const ids = [];
  for (const e of events) {
    if (!kinds.includes(e.kind) || seen.has(e.articleId)) continue;
    seen.add(e.articleId);
    ids.push(e.articleId);
  }
  return ids;
}

// 예전 코드와 호환: 읽은 기사 목록을 [{ articleId }] 형태로
export function useReadingHistory() {
  const events = useReadingEvents();
  return readArticleIds(events).map((articleId) => ({ articleId }));
}

function addEvent(articleId, kind) {
  const list = getEvents();
  // 같은 기사·같은 종류는 최신 한 건만 남김
  const rest = list.filter((r) => !(r.articleId === articleId && r.kind === kind));
  save([{ articleId, kind, readAt: new Date().toISOString() }, ...rest]);
}

export function recordRead(articleId) {
  addEvent(articleId, "view");
}

export function recordOriginalClick(articleId) {
  addEvent(articleId, "original");
}

export function clearHistory() {
  save([]);
}

// 시연용 예시 기록: 정부·여당 인용이 많은 기사 위주로 읽은 사용자
export const SAMPLE_ARTICLE_IDS = ["art-001", "art-006", "art-004"];
export function loadSampleHistory() {
  const now = Date.now();
  save(SAMPLE_ARTICLE_IDS.map((id, i) => ({ articleId: id, kind: "view", readAt: new Date(now - i * 3600_000).toISOString() })));
}

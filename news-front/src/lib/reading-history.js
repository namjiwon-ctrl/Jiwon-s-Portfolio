"use client";

// "내 읽기 편향"용 열람 기록. 로그인 없이 이 브라우저에만 저장합니다.
// 나중에 로그인 방식으로 바뀌면 이 파일의 저장·불러오기 부분만 바꾸면 됩니다.
import { useSyncExternalStore } from "react";

const KEY = "reading-history";
const EVENT = "reading-history-change";
const EMPTY = [];

let cachedRaw = null;
let cachedValue = EMPTY;

function readRaw() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

// 같은 내용이면 같은 배열을 돌려줘야 화면이 불필요하게 다시 그려지지 않음
function getSnapshot() {
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

function write(list) {
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

// 기록 목록: [{ articleId, readAt }] (같은 기사는 한 번만, 가장 최근 시각)
export function useReadingHistory() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export function recordRead(articleId) {
  const list = getSnapshot().filter((r) => r.articleId !== articleId);
  write([{ articleId, readAt: new Date().toISOString() }, ...list]);
}

export function clearHistory() {
  write([]);
}

// 시연용 예시 기록: 정부·여당 인용이 많은 기사 위주로 읽은 사용자
export const SAMPLE_ARTICLE_IDS = ["art-001", "art-006", "art-004"];
export function loadSampleHistory() {
  const now = Date.now();
  write(SAMPLE_ARTICLE_IDS.map((id, i) => ({ articleId: id, readAt: new Date(now - i * 3600_000).toISOString() })));
}

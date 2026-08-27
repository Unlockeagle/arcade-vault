"use client";

// lib/auth.ts — mock de sesión en localStorage (sin backend)
import { useCallback, useSyncExternalStore } from "react";

export type MockUser = { name: string };

export type ScoreEntry = { game: string; score: number; name: string; at: number };

const USER_KEY = "av_user";
const SCORES_KEY = "av_scores";
const USER_CHANGED_EVENT = "av_user_changed";

export function getStoredUser(): MockUser | null {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function setStoredUser(user: MockUser | null): void {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    // localStorage no disponible (modo privado/SSR): la sesión simplemente no persiste.
  }
  window.dispatchEvent(new Event(USER_CHANGED_EVENT));
}

export function saveScore(entry: Omit<ScoreEntry, "at">): void {
  try {
    const all: ScoreEntry[] = JSON.parse(localStorage.getItem(SCORES_KEY) || "[]");
    all.push({ ...entry, at: Date.now() });
    localStorage.setItem(SCORES_KEY, JSON.stringify(all));
  } catch {
    // localStorage no disponible: el score simplemente no persiste.
  }
}

// Snapshot cacheado de av_user: useSyncExternalStore exige que getSnapshot
// devuelva la misma referencia mientras el valor subyacente no cambie.
let cachedUserRaw: string | null = null;
let cachedUser: MockUser | null = null;

function readSnapshot(): MockUser | null {
  let raw: string | null;
  try {
    raw = localStorage.getItem(USER_KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedUserRaw) {
    cachedUserRaw = raw;
    try {
      cachedUser = raw ? JSON.parse(raw) : null;
    } catch {
      cachedUser = null;
    }
  }
  return cachedUser;
}

function getServerSnapshot(): MockUser | null {
  return null;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(USER_CHANGED_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(USER_CHANGED_EVENT, callback);
  };
}

// Hook de sesión mock (client-side), sincronizado con av_user en localStorage
// (incluso entre pestañas) vía useSyncExternalStore.
export function useMockUser() {
  const user = useSyncExternalStore(subscribe, readSnapshot, getServerSnapshot);

  const login = useCallback((u: MockUser | null) => {
    setStoredUser(u);
  }, []);

  const signOut = useCallback(() => {
    setStoredUser(null);
  }, []);

  return { user, login, signOut };
}

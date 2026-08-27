"use client";

// lib/auth.ts — mock de sesión en localStorage (sin backend)
import { useCallback, useEffect, useState } from "react";

export type MockUser = { name: string };

export type ScoreEntry = { game: string; score: number; name: string; at: number };

const USER_KEY = "av_user";
const SCORES_KEY = "av_scores";

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

// Hook de sesión mock (client-side). Lee av_user en el primer render de cliente
// para evitar desajustes de hidratación con el render de servidor.
export function useMockUser() {
  const [user, setUser] = useState<MockUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const login = useCallback((u: MockUser | null) => {
    setUser(u);
    setStoredUser(u);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setStoredUser(null);
  }, []);

  return { user, login, signOut };
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { nextCycleBaselines, nextPointer } from "./program";
import {
  baselinesFor,
  buildSession,
  completeSetup,
  createStore,
  exportStore,
  findSession,
  importStore,
  loadStore,
  saveStore,
  setCycleBaselines,
  upsertSession,
} from "./storage";
import { pullCloudStore, pushCloudStore, stampStore } from "./sync";
import type { Accessory, Baselines, Pointer, Session, Store } from "./types";
import { UNLOCK_STORAGE_KEY } from "./unlock";

type SyncStatus = "local" | "cloud" | "saving" | "offline" | "error";

type StoreApi = {
  store: Store;
  ready: boolean;
  unlocked: boolean;
  syncStatus: SyncStatus;
  syncError: string | null;
  save: (next: Store) => void;
  setup: (input: { accessory: Accessory; baselines: Baselines }) => void;
  setPointer: (pointer: Pointer) => void;
  startSession: (pointer?: Pointer) => Session;
  updateSession: (session: Session) => void;
  finishSession: (session: Session) => void;
  resetCurrentSession: () => void;
  exportJson: () => string;
  importJson: (raw: string) => void;
  resetAll: () => void;
  unlock: (pin: string) => Promise<void>;
  lock: () => Promise<void>;
};

const StoreContext = createContext<StoreApi | null>(null);

async function hydrateCloud(local: Store): Promise<{ store: Store; status: SyncStatus; error: string | null }> {
  try {
    const cloud = await Promise.race([
      pullCloudStore(local),
      new Promise<null>((resolve) => {
        window.setTimeout(() => resolve(null), 4000);
      }),
    ]);
    if (!cloud) return { store: local, status: "offline", error: null };
    return { store: cloud, status: "cloud", error: null };
  } catch (error) {
    return {
      store: local,
      status: "error",
      error: error instanceof Error ? error.message : "Could not sync.",
    };
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(() => createStore());
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const unlockedRef = useRef(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("local");
  const [syncError, setSyncError] = useState<string | null>(null);
  const pushTimer = useRef<number | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- client-only hydration */
    const local = loadStore();
    setStore(local);
    const cached = window.localStorage.getItem(UNLOCK_STORAGE_KEY) === "1";
    /* eslint-enable react-hooks/set-state-in-effect */

    void (async () => {
      let isUnlocked = cached;
      if (!isUnlocked) {
        try {
          const response = await fetch("/api/unlock", { cache: "no-store" });
          const body = (await response.json()) as { unlocked?: boolean };
          isUnlocked = Boolean(body.unlocked);
        } catch {
          isUnlocked = cached;
        }
      }
      unlockedRef.current = isUnlocked;
      setUnlocked(isUnlocked);
      if (isUnlocked) {
        window.localStorage.setItem(UNLOCK_STORAGE_KEY, "1");
        const result = await hydrateCloud(local);
        setStore(result.store);
        saveStore(result.store);
        setSyncStatus(result.status);
        setSyncError(result.error);
      }
      setReady(true);
    })();

    return () => {
      if (pushTimer.current) window.clearTimeout(pushTimer.current);
    };
  }, []);

  const save = useCallback((next: Store) => {
    const stamped = stampStore(next);
    setStore(stamped);
    saveStore(stamped);
    if (!unlockedRef.current) {
      setSyncStatus("local");
      return;
    }
    setSyncStatus("saving");
    if (pushTimer.current) window.clearTimeout(pushTimer.current);
    pushTimer.current = window.setTimeout(() => {
      void pushCloudStore(stamped)
        .then(() => {
          setSyncStatus("cloud");
          setSyncError(null);
        })
        .catch((error: unknown) => {
          setSyncStatus("error");
          setSyncError(error instanceof Error ? error.message : "Could not sync.");
        });
    }, 500);
  }, []);

  const api = useMemo<StoreApi>(
    () => ({
      store,
      ready,
      unlocked,
      syncStatus,
      syncError,
      save,
      setup(input) {
        save(completeSetup(store, input));
      },
      setPointer(pointer) {
        let next: Store = { ...store, pointer };
        if (!next.cycles[String(pointer.cycle)]) {
          const previousCycle = Math.max(1, pointer.cycle - 1);
          const testDay =
            next.sessions.find(
              (item) =>
                item.cycle === previousCycle &&
                item.week === 5 &&
                item.intensity === "heavy" &&
                item.completedAt,
            ) ?? null;
          const { next: baselines } = nextCycleBaselines(
            baselinesFor(next, previousCycle),
            testDay,
          );
          next = setCycleBaselines(next, pointer.cycle, baselines);
        }
        save(next);
      },
      startSession(pointer = store.pointer) {
        const existing = findSession(store, pointer);
        if (existing && !existing.completedAt) {
          if (pointer !== store.pointer) save({ ...store, pointer });
          return existing;
        }
        if (existing?.completedAt) return existing;
        const session = buildSession(store, pointer);
        save(upsertSession({ ...store, pointer }, session));
        return session;
      },
      updateSession(session) {
        save(upsertSession(store, session));
      },
      finishSession(session) {
        const completed: Session = {
          ...session,
          completedAt: session.completedAt ?? new Date().toISOString(),
        };
        let next = upsertSession(store, completed);
        const advanced = nextPointer(store.pointer);
        if (!next.cycles[String(advanced.cycle)]) {
          const testDay =
            completed.week === 5 && completed.intensity === "heavy"
              ? completed
              : (next.sessions.find(
                  (item) =>
                    item.cycle === completed.cycle &&
                    item.week === 5 &&
                    item.intensity === "heavy" &&
                    item.completedAt,
                ) ?? null);
          const { next: baselines } = nextCycleBaselines(
            baselinesFor(next, completed.cycle),
            testDay,
          );
          next = setCycleBaselines(next, advanced.cycle, baselines);
        }
        save({ ...next, pointer: advanced });
      },
      resetCurrentSession() {
        save({
          ...store,
          sessions: store.sessions.filter(
            (session) =>
              !(
                session.cycle === store.pointer.cycle &&
                session.week === store.pointer.week &&
                session.intensity === store.pointer.intensity
              ),
          ),
        });
      },
      exportJson() {
        return exportStore(store);
      },
      importJson(raw) {
        save(importStore(raw));
      },
      resetAll() {
        const blank: Store = {
          version: 1,
          setupComplete: false,
          accessory: "curl",
          pointer: { cycle: 1, week: 1, intensity: "heavy" },
          cycles: { "1": baselinesFor(store, 1) },
          sessions: [],
        };
        save(blank);
      },
      async unlock(pin: string) {
        const response = await fetch("/api/unlock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin }),
        });
        if (!response.ok) throw new Error("Wrong code.");
        window.localStorage.setItem(UNLOCK_STORAGE_KEY, "1");
        unlockedRef.current = true;
        setUnlocked(true);
        const result = await hydrateCloud(loadStore());
        setStore(result.store);
        saveStore(result.store);
        setSyncStatus(result.status);
        setSyncError(result.error);
      },
      async lock() {
        window.localStorage.removeItem(UNLOCK_STORAGE_KEY);
        unlockedRef.current = false;
        setUnlocked(false);
        setSyncStatus("local");
        await fetch("/api/unlock", { method: "DELETE" });
      },
    }),
    [ready, save, store, syncError, syncStatus, unlocked],
  );

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useWorkoutStore(): StoreApi {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useWorkoutStore must be used inside StoreProvider");
  return value;
}

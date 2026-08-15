"use client";

import type { User } from "@supabase/supabase-js";
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
import { createClient } from "./supabase/client";
import { pullCloudStore, pushCloudStore, stampStore } from "./sync";
import type { Accessory, Baselines, Pointer, Session, Store } from "./types";

export const OFFLINE_ONLY_KEY = "all-pro-offline-only";

type SyncStatus = "local" | "cloud" | "saving" | "offline" | "error";

type StoreApi = {
  store: Store;
  ready: boolean;
  user: User | null;
  authReady: boolean;
  offlineOnly: boolean;
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
  useThisPhoneOnly: () => void;
  signOut: () => Promise<void>;
};

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(() => createStore());
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [offlineOnly, setOfflineOnly] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("local");
  const [syncError, setSyncError] = useState<string | null>(null);
  const userRef = useRef<User | null>(null);
  const pushTimer = useRef<number | null>(null);

  useEffect(() => {
    // Load localStorage after mount so SSR and the first client render match.
    /* eslint-disable react-hooks/set-state-in-effect -- client-only hydration */
    setStore(loadStore());
    setOfflineOnly(window.localStorage.getItem(OFFLINE_ONLY_KEY) === "1");
    /* eslint-enable react-hooks/set-state-in-effect */

    const supabase = createClient();
    const failsafe = window.setTimeout(() => {
      setAuthReady(true);
      setReady(true);
    }, 5000);
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = session?.user ?? null;
      userRef.current = nextUser;
      setUser(nextUser);
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
        if (event === "SIGNED_IN") setReady(false);
        void (async () => {
          if (nextUser) {
            window.localStorage.removeItem(OFFLINE_ONLY_KEY);
            setOfflineOnly(false);
            try {
              const cloud = await Promise.race([
                pullCloudStore(nextUser.id, loadStore()),
                new Promise<null>((resolve) => {
                  window.setTimeout(() => resolve(null), 4000);
                }),
              ]);
              if (cloud) {
                setStore(cloud);
                saveStore(cloud);
                setSyncStatus("cloud");
                setSyncError(null);
              } else {
                setSyncStatus("offline");
              }
            } catch (error) {
              setSyncStatus("error");
              setSyncError(error instanceof Error ? error.message : "Could not sync.");
            }
          } else {
            setSyncStatus("local");
          }
          setAuthReady(true);
          setReady(true);
          window.clearTimeout(failsafe);
        })();
        return;
      }
      if (event === "SIGNED_OUT") {
        setSyncStatus("local");
        setAuthReady(true);
        setReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
      window.clearTimeout(failsafe);
      if (pushTimer.current) window.clearTimeout(pushTimer.current);
    };
  }, []);

  const save = useCallback((next: Store) => {
    const stamped = stampStore(next);
    setStore(stamped);
    saveStore(stamped);
    const currentUser = userRef.current;
    if (!currentUser) {
      setSyncStatus("local");
      return;
    }
    setSyncStatus("saving");
    if (pushTimer.current) window.clearTimeout(pushTimer.current);
    pushTimer.current = window.setTimeout(() => {
      void pushCloudStore(currentUser.id, stamped)
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
      user,
      authReady,
      offlineOnly,
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
      useThisPhoneOnly() {
        window.localStorage.setItem(OFFLINE_ONLY_KEY, "1");
        setOfflineOnly(true);
      },
      async signOut() {
        const supabase = createClient();
        await supabase.auth.signOut();
        userRef.current = null;
        setUser(null);
        setSyncStatus("local");
      },
    }),
    [authReady, offlineOnly, ready, save, store, syncError, syncStatus, user],
  );

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useWorkoutStore(): StoreApi {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useWorkoutStore must be used inside StoreProvider");
  return value;
}

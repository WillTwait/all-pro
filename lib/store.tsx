"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
import type { Accessory, Baselines, Pointer, Session, Store } from "./types";

type StoreApi = {
  store: Store;
  ready: boolean;
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
};

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(() => createStore());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Load localStorage after mount so SSR and the first client render match.
    /* eslint-disable react-hooks/set-state-in-effect -- client-only hydration */
    setStore(loadStore());
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const save = useCallback((next: Store) => {
    setStore(next);
    saveStore(next);
  }, []);

  const api = useMemo<StoreApi>(
    () => ({
      store,
      ready,
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
    }),
    [ready, save, store],
  );

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useWorkoutStore(): StoreApi {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useWorkoutStore must be used inside StoreProvider");
  return value;
}

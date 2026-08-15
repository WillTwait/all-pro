"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkoutStore } from "@/lib/store";
import { AuthForm } from "./auth-form";
import { SetupForm } from "./setup-form";

const NAV = [
  { href: "/", label: "Today" },
  { href: "/cycle", label: "Cycle" },
  { href: "/log", label: "Log" },
  { href: "/guide", label: "Guide" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { store, ready, user, offlineOnly } = useWorkoutStore();

  if (!ready) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md items-center justify-center px-4">
        <p>Loading…</p>
      </div>
    );
  }

  if (!user && !offlineOnly && !store.setupComplete) {
    return (
      <div className="mx-auto min-h-dvh w-full max-w-md px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))]">
        <AuthForm />
      </div>
    );
  }

  if (!store.setupComplete) {
    return (
      <div className="mx-auto min-h-dvh w-full max-w-md px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))]">
        <SetupForm />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <main className="flex-1 px-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 border-t border-neutral-300 bg-white pb-[env(safe-area-inset-bottom)]">
        <ul className="mx-auto grid max-w-md grid-cols-4">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex h-12 items-center justify-center text-sm ${
                    active ? "font-semibold text-black" : "text-neutral-600"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

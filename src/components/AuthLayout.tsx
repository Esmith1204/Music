import type { ReactNode } from "react";
import { RecordRings } from "./RecordRings";

interface AuthLayoutProps {
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
}

/** Two-column layout shared by sign in, sign up, and profile setup (mirrors the rate page). */
export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-rule">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center px-4 sm:h-[88px] sm:px-10">
          <span className="font-serif text-2xl tracking-tight sm:text-[1.75rem]">Music Rater</span>
        </div>
      </header>
      <main className="grid flex-1 lg:grid-cols-2">
        <section className="relative overflow-hidden px-6 pb-10 pt-12 sm:px-12 lg:px-24 lg:pb-0 lg:pt-28">
          <h1 className="font-serif text-[clamp(3rem,5.6vw,5.4rem)] leading-[0.9] tracking-[-0.04em]">{title}</h1>
          <p className="mt-8 max-w-[24rem] font-serif text-xl leading-relaxed text-muted lg:mt-12">{subtitle}</p>
          <RecordRings className="-mb-40 mt-2 hidden w-[min(36rem,100%)] lg:block" />
        </section>
        <section className="border-t border-rule px-6 py-12 sm:px-12 lg:border-l lg:border-t-0 lg:px-16 lg:py-28">
          <div className="max-w-[28rem]">{children}</div>
        </section>
      </main>
    </div>
  );
}

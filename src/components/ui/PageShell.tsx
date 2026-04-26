import type { ReactNode } from "react";
import { TopNav } from "../TopNav";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 w-full max-w-page mx-auto px-6 pb-12">
        {children}
      </main>
    </div>
  );
}

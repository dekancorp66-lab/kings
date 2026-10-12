import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { I18nProvider } from "@/lib/i18n";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, retry: 0, refetchOnWindowFocus: false } },
      }),
  );
  return (
    <I18nProvider>
      <QueryClientProvider client={client}>
        {children}
        <Toaster position="top-right" toastOptions={{ className: "font-sans text-sm" }} />
      </QueryClientProvider>
    </I18nProvider>
  );
}

import { Footer } from "./footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { Header } from "./header";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-canvas text-ink">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

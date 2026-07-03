import LiveChat from "@/components/LiveChat";
import SiteFooter from "@/components/SiteFooter";
import { CartProvider } from "@/lib/cart";
import { SiteChromeHeader } from "./SiteChrome";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <SiteChromeHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
      <LiveChat />
    </CartProvider>
  );
}

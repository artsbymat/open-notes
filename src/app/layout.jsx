import localFont from "next/font/local";

import { JetBrains_Mono, Poppins } from "next/font/google";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

import "@/styles/globals.css";
import "@/styles/md-content.css";
import { Separator } from "@/components/ui/separator";
import { getAllMarkdownFiles } from "@/lib/content";
import { buildFileTree } from "@/lib/utils";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { METADATA } from "@/constants";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"]
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  display: "swap",
  subsets: ["latin"],
  weight: ["400"]
});

const arabic = localFont({
  src: "../assets/fonts/LPMQ Isep Misbah.woff2",
  variable: "--font-arabic"
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"),
  title: METADATA.title,
  description: METADATA.description,
  keywords: METADATA.keywords
};

export default function RootLayout({ children }) {
  const allMarkdownFiles = getAllMarkdownFiles();
  const fileTree = buildFileTree(allMarkdownFiles);

  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="Open Notes" />
        <meta
          name="google-site-verification"
          content="ykJc6eMzlp8dlNUn5Kt1qOqw7JWu9HL_InssXyHJdMc"
        />
      </head>
      <body className={`${poppins.variable} ${jetbrains.variable} ${arabic.variable} antialiased`}>
        <SidebarProvider>
          <AppSidebar fileTree={fileTree} />
          <SidebarInset className="min-w-0">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
              <AppBreadcrumb allMarkdownFiles={allMarkdownFiles} />
            </header>
            <div className="flex flex-1 flex-col p-1 xl:p-2">
              <div className="min-h-[100vh] flex-1 rounded-xl border p-4 md:min-h-min">
                {children}
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}

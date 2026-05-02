import type { Metadata } from "next";
import "./globals.css";
import { GameProvider } from "@/context/GameContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "哄哄模拟器 - 情侣互动游戏",
  description: "一款AI驱动的情侣互动游戏，你需要在10轮内哄好生气的TA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>
          <GameProvider>
            <main className="min-h-screen flex flex-col">
              {children}
            </main>
          </GameProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

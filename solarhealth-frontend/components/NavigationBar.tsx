"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";

export function NavigationBar() {
  const pathname = usePathname();
  const { isConnected, accounts, chainId, connect, disconnect } = useWallet();

  // Navigation items for authenticated users
  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/data-entry", label: "Data Entry" },
    { href: "/analysis", label: "Health Analysis" },
    { href: "/goals", label: "Goals" },
    { href: "/reports", label: "Reports" },
  ];

  return (
    <nav className="bg-surface border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-primary">
              SolarHealth
            </Link>
            {isConnected && (
              <div className="flex space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === item.href
                        ? "bg-primary text-white"
                        : "text-text hover:bg-background"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <>
                <span className="text-sm text-textSecondary">
                  {accounts?.[0]?.slice(0, 6)}...{accounts?.[0]?.slice(-4)}
                </span>
                <span className="text-xs text-textSecondary">
                  {chainId === 31337 ? "Localhost" : chainId === 11155111 ? "Sepolia" : `Chain ${chainId}`}
                </span>
                <button
                  onClick={disconnect}
                  className="px-4 py-2 bg-error text-white rounded-md text-sm hover:opacity-90"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={connect}
                className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:opacity-90"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}



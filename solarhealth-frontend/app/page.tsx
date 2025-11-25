"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";

export default function Home() {
  const router = useRouter();
  const { isConnected, connect, isLoading } = useWallet();

  useEffect(() => {
    // Only redirect after loading is complete to avoid redirect loops
    if (!isLoading && isConnected) {
      router.push("/dashboard");
    }
  }, [isConnected, isLoading, router]);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-primary">
          SolarHealth
        </h1>
        <p className="text-xl md:text-2xl text-textSecondary mb-8">
          Privacy-First Health Data Management
        </p>
        <p className="text-lg mb-12 text-textSecondary max-w-2xl mx-auto">
          Your health data, encrypted and analyzed with zero-knowledge
        </p>
        <button
          onClick={connect}
          className="bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Get Started
        </button>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-surface p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-primary">
              Fully Encrypted
            </h3>
            <p className="text-textSecondary">
              All health data stored in encrypted form on-chain
            </p>
          </div>
          <div className="bg-surface p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-primary">
              Analysis Without Exposure
            </h3>
            <p className="text-textSecondary">
              Trend analysis and scoring computed in encrypted state
            </p>
          </div>
          <div className="bg-surface p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-primary">
              You Own Your Data
            </h3>
            <p className="text-textSecondary">
              Complete privacy with full data ownership
            </p>
          </div>
        </div>
      </section>

      {/* Tech Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4 text-primary">
          Powered by FHEVM
        </h2>
        <p className="text-textSecondary">
          Fully Homomorphic Encryption on Ethereum
        </p>
      </section>
    </main>
  );
}


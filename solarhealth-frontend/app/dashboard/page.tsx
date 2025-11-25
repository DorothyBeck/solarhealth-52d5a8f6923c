"use client";

import { NavigationBar } from "@/components/NavigationBar";
import { useWallet } from "@/hooks/useWallet";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFhevm } from "@/fhevm/useFhevm";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useSolarHealth } from "@/hooks/useSolarHealth";

export default function DashboardPage() {
  const { isConnected, provider, chainId, isLoading } = useWallet();
  const router = useRouter();
  const [userDates, setUserDates] = useState<number[]>([]);
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [recentRecordsCount, setRecentRecordsCount] = useState<number>(0);
  const [activeGoalsCount, setActiveGoalsCount] = useState<number>(0);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const { ethersSigner, ethersReadonlyProvider } = useEthersSigner();
  
  const { instance: fhevmInstance } = useFhevm({
    provider,
    chainId,
    initialMockChains: { 31337: "http://localhost:8545" },
    enabled: true,
  });

  const solarHealth = useSolarHealth({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
  });

  useEffect(() => {
    // Only redirect after loading is complete to avoid redirect loops
    if (!isLoading && !isConnected) {
      router.push("/");
    }
  }, [isConnected, isLoading, router]);

  // Load dashboard data
  useEffect(() => {
    if (isLoading || !isConnected || !solarHealth.contract || !solarHealth.isDeployed) {
      setIsLoadingData(false);
      return;
    }

    const loadDashboardData = async () => {
      try {
        setIsLoadingData(true);

        // Get user dates
        const dates = await solarHealth.getUserDates();
        setUserDates(dates || []);
        setRecentRecordsCount(dates?.length || 0);

        // Get health score if we have dates
        if (dates && dates.length > 0) {
          try {
            // Get last 7 days of dates
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            const sevenDaysAgo = Math.floor((today.getTime() - (7 * 24 * 60 * 60 * 1000)) / 1000);
            const recentDates = dates.filter((d: number) => d >= sevenDaysAgo).slice(0, 7);
            
            if (recentDates.length > 0) {
              const score = await solarHealth.calculateHealthScore(recentDates);
              if (score !== null && score !== undefined) {
                const numScore = typeof score === "bigint" ? Number(score) : Number(score);
                setHealthScore(Math.min(numScore, 100));
              }
            }
          } catch (error) {
            console.error("Failed to load health score:", error);
            // Health score calculation failed, but continue loading other data
          }
        }

        // Get active goals
        try {
          const goals = await solarHealth.getActiveGoals();
          setActiveGoalsCount(goals?.length || 0);
        } catch (error) {
          console.error("Failed to load active goals:", error);
          // Goals loading failed, but continue
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadDashboardData();
  }, [isLoading, isConnected, solarHealth.contract, solarHealth.isDeployed, solarHealth.getUserDates, solarHealth.calculateHealthScore, solarHealth.getActiveGoals]);

  // Show loading state or nothing while checking wallet connection
  if (isLoading || !isConnected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-primary">Dashboard</h1>
        
        {isLoadingData ? (
          <div className="text-center py-8">
            <p className="text-textSecondary">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Health Score Card */}
              <div className="bg-surface p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2 text-text">Health Score</h3>
                {healthScore !== null ? (
                  <>
                    <p className="text-3xl font-bold text-primary">{healthScore.toFixed(0)}</p>
                    <p className="text-sm text-textSecondary mt-2">Based on recent activity</p>
                  </>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-primary">--</p>
                    <p className="text-sm text-textSecondary mt-2">Score not calculated yet</p>
                  </>
                )}
              </div>

              {/* Recent Records Card */}
              <div className="bg-surface p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2 text-text">Recent Records</h3>
                {recentRecordsCount > 0 ? (
                  <>
                    <p className="text-3xl font-bold text-primary">{recentRecordsCount}</p>
                    <p className="text-sm text-textSecondary mt-2">Total records</p>
                  </>
                ) : (
                  <p className="text-textSecondary">No records yet</p>
                )}
              </div>

              {/* Goals Card */}
              <div className="bg-surface p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2 text-text">Active Goals</h3>
                {activeGoalsCount > 0 ? (
                  <>
                    <p className="text-3xl font-bold text-primary">{activeGoalsCount}</p>
                    <p className="text-sm text-textSecondary mt-2">Active goals</p>
                  </>
                ) : (
                  <p className="text-textSecondary">No goals set</p>
                )}
              </div>

              {/* Trends Card */}
              <div className="bg-surface p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2 text-text">Trends</h3>
                {userDates.length >= 2 ? (
                  <p className="text-sm text-textSecondary">View trends in Analysis page</p>
                ) : (
                  <p className="text-textSecondary">Need at least 2 records</p>
                )}
              </div>
            </div>

            <div className="mt-8 flex space-x-4">
              <a
                href="/data-entry"
                className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90"
              >
                Add Record
              </a>
              <a
                href="/analysis"
                className="px-6 py-3 bg-secondary text-white rounded-lg hover:opacity-90"
              >
                View Analysis
              </a>
              <a
                href="/goals"
                className="px-6 py-3 bg-accent text-white rounded-lg hover:opacity-90"
              >
                Set Goal
              </a>
            </div>

            {userDates.length > 0 && (
              <div className="mt-8 bg-surface p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-text">Recent Activity</h2>
                <div className="space-y-2">
                  {userDates.slice(0, 5).map((date, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                      <span className="text-text">
                        {new Date(date * 1000).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="text-textSecondary text-sm">Recorded</span>
                    </div>
                  ))}
                  {userDates.length > 5 && (
                    <p className="text-sm text-textSecondary mt-2">
                      ... and {userDates.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}


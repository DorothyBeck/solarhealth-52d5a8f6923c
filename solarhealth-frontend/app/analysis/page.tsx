"use client";

import { NavigationBar } from "@/components/NavigationBar";
import { useWallet } from "@/hooks/useWallet";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFhevm } from "@/fhevm/useFhevm";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useSolarHealth } from "@/hooks/useSolarHealth";

export default function AnalysisPage() {
  const { isConnected, provider, chainId, isLoading } = useWallet();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("7");
  const [selectedCategory, setSelectedCategory] = useState("0");
  const [averageResult, setAverageResult] = useState<number | null>(null);
  const [trendResult, setTrendResult] = useState<string | null>(null);
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [riskLevel, setRiskLevel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    if (!isLoading && !isConnected) {
      router.push("/");
    }
  }, [isConnected, isLoading, router]);

  if (isLoading || !isConnected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-primary">Health Analysis</h1>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-text">
            Time Range
          </label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-border rounded-md bg-background text-text"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Average Calculation */}
          <div className="bg-surface p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-text">
              Calculate Average
            </h3>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-md bg-background text-text mb-4"
            >
              <option value="0">Weight</option>
              <option value="1">Blood Pressure</option>
              <option value="4">Steps</option>
            </select>
            <button 
              onClick={async () => {
                if (!solarHealth.contract || !solarHealth.isDeployed) {
                  setError("Contract not deployed");
                  return;
                }
                setError(null);
                setAverageResult(null);
                try {
                  const days = parseInt(timeRange);
                  const dates: number[] = [];
                  // Get dates at midnight UTC for consistency
                  const today = new Date();
                  today.setUTCHours(0, 0, 0, 0);
                  
                  for (let i = 0; i < days; i++) {
                    const dateObj = new Date(today);
                    dateObj.setUTCDate(dateObj.getUTCDate() - i);
                    dates.push(Math.floor(dateObj.getTime() / 1000));
                  }
                  
                  console.log("Calculating average for dates:", dates.map(d => {
                    const dObj = new Date(d * 1000);
                    return `${dObj.toISOString().split('T')[0]} (timestamp: ${d})`;
                  }));
                  
                  const result = await solarHealth.calculateAverage(dates, parseInt(selectedCategory));
                  console.log("Calculate average result:", result, "type:", typeof result);
                  
                  // Handle both null/undefined and BigInt(0)
                  if (result === null || result === undefined) {
                    setError("Failed to calculate average. Please check console for details.");
                    return;
                  }
                  
                  const numResult = typeof result === "bigint" ? Number(result) : Number(result);
                  console.log("Decrypted average value (converted):", numResult);
                  
                  // Check if result is 0
                  if (numResult === 0) {
                    // Check message to see if calculation succeeded
                    if (solarHealth.message && solarHealth.message.includes("successfully")) {
                      // Calculation succeeded but result is 0
                      const displayValue = parseInt(selectedCategory) === 0 ? numResult / 10 : numResult;
                      setAverageResult(displayValue);
                      setError("Average is 0. This may mean no records exist for these dates.");
                    } else if (solarHealth.message && solarHealth.message.includes("Error")) {
                      setError(solarHealth.message);
                    } else {
                      setError("No data available for selected period. Please record data for these dates first.");
                    }
                  } else {
                    // For weight, divide by 10 to show actual kg
                    const displayValue = parseInt(selectedCategory) === 0 ? numResult / 10 : numResult;
                    setAverageResult(displayValue);
                    setError(null);
                  }
                } catch (err: any) {
                  console.error("Calculate average error:", err);
                  let errorMsg = err?.reason || err?.message || err?.toString() || "Failed to calculate average";
                  
                  // Check for specific error codes
                  if (err?.data?.data) {
                    const errorData = err.data.data;
                    if (typeof errorData === "string" && errorData.startsWith("0x")) {
                      errorMsg = "No health record found. Please record data first.";
                    }
                  }
                  
                  setError(errorMsg);
                }
              }}
              disabled={solarHealth.isCalculating}
              className="w-full px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 disabled:opacity-50"
            >
              {solarHealth.isCalculating ? "Calculating..." : "Calculate"}
            </button>
            <p className="mt-4 text-textSecondary">
              Average: {averageResult !== null ? averageResult.toFixed(2) : "--"}
            </p>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>

          {/* Trend Analysis */}
          <div className="bg-surface p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-text">
              Trend Analysis
            </h3>
            <button 
              onClick={async () => {
                if (!solarHealth.contract || !solarHealth.isDeployed) {
                  setError("Contract not deployed");
                  return;
                }
                setError(null);
                setTrendResult(null);
                try {
                  // First, get all dates that have records
                  const userDates = await solarHealth.getUserDates();
                  
                  if (!userDates || userDates.length < 2) {
                    setError("Not enough data. Please record data for at least 2 different dates first.");
                    return;
                  }
                  
                  // Sort dates in descending order (newest first)
                  const sortedDates = [...userDates].sort((a, b) => b - a);
                  
                  // Select the two most recent dates
                  // For longer time ranges, we might want to select dates further apart,
                  // but for now, let's use the two most recent dates
                  const days = parseInt(timeRange);
                  let newDate: number;
                  let oldDate: number;
                  
                  if (sortedDates.length === 2) {
                    // Only 2 dates, use them
                    newDate = sortedDates[0];
                    oldDate = sortedDates[1];
                  } else {
                    // More than 2 dates, select based on time range
                    newDate = sortedDates[0]; // Most recent
                    
                    // Find an older date within the time range
                    const daysAgo = Math.floor(days / 2);
                    const targetTimestamp = newDate - (daysAgo * 24 * 60 * 60);
                    
                    // Find the date closest to targetTimestamp
                    let closestDate = sortedDates[1];
                    let minDiff = Math.abs(sortedDates[1] - targetTimestamp);
                    
                    for (let i = 1; i < sortedDates.length; i++) {
                      const diff = Math.abs(sortedDates[i] - targetTimestamp);
                      if (diff < minDiff) {
                        minDiff = diff;
                        closestDate = sortedDates[i];
                      }
                    }
                    
                    oldDate = closestDate;
                  }
                  
                  console.log("Calculating trend for dates:", {
                    allDates: sortedDates.map(d => new Date(d * 1000).toISOString().split('T')[0]),
                    oldDate: new Date(oldDate * 1000).toISOString(),
                    newDate: new Date(newDate * 1000).toISOString(),
                    category: parseInt(selectedCategory)
                  });
                  
                  // For steps, use calculateStepsTrend
                  if (parseInt(selectedCategory) === 4) {
                    const result = await solarHealth.calculateStepsTrend(oldDate, newDate);
                    setTrendResult(result || "--");
                  } else {
                    const result = await solarHealth.calculateTrend(oldDate, newDate, parseInt(selectedCategory));
                    setTrendResult(result || "--");
                  }
                } catch (err: any) {
                  console.error("Calculate trend error:", err);
                  console.error("Error details:", {
                    reason: err?.reason,
                    message: err?.message,
                    revert: err?.revert,
                    data: err?.data,
                  });
                  
                  // Extract error message from various possible formats
                  // Priority: revert.args[0] > reason > message > toString
                  let errorMsg = 
                    err?.revert?.args?.[0] ||  // Solidity Error(string) format - highest priority
                    err?.reason ||            // Ethers error reason
                    err?.message ||           // Standard error message
                    err?.toString() ||        // Fallback to string
                    "Failed to calculate trend";
                  
                  console.log("Extracted error message:", errorMsg);
                  
                  // Check for specific error messages from contract
                  const errorStr = errorMsg.toLowerCase();
                  if (
                    errorStr.includes("healthrecord not found") ||
                    errorStr.includes("healthrecord not found for olddate") ||
                    errorStr.includes("healthrecord not found for newdate") ||
                    errorStr.includes("0xd0d25976") ||
                    (errorStr.includes("revert") && errorStr.includes("health"))
                  ) {
                    errorMsg = "No health record found for one or both of the selected dates. Please record data for both dates first.";
                  }
                  
                  // Check for specific error codes in data
                  if (err?.data?.data) {
                    const errorData = err.data.data;
                    if (typeof errorData === "string" && errorData.startsWith("0x")) {
                      // Custom error signature
                      if (errorData.startsWith("0xd0d25976")) {
                        errorMsg = "No health record found for one or both of the selected dates. Please record data for both dates first.";
                      }
                    }
                  }
                  
                  console.log("Final error message to display:", errorMsg);
                  setError(errorMsg);
                }
              }}
              disabled={solarHealth.isCalculating}
              className="w-full px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 disabled:opacity-50"
            >
              {solarHealth.isCalculating ? "Analyzing..." : "Analyze Trend"}
            </button>
            <p className="mt-4 text-textSecondary">
              Trend: {trendResult || "--"}
            </p>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>

          {/* Health Score */}
          <div className="bg-surface p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-text">
              Health Score
            </h3>
            <button 
              onClick={async () => {
                if (!solarHealth.contract || !solarHealth.isDeployed) {
                  setError("Contract not deployed");
                  return;
                }
                setError(null);
                setHealthScore(null);
                try {
                  const days = parseInt(timeRange);
                  const dates: number[] = [];
                  // Get dates at midnight UTC for consistency
                  const today = new Date();
                  today.setUTCHours(0, 0, 0, 0);
                  
                  for (let i = 0; i < days; i++) {
                    const dateObj = new Date(today);
                    dateObj.setUTCDate(dateObj.getUTCDate() - i);
                    dates.push(Math.floor(dateObj.getTime() / 1000));
                  }
                  
                  console.log("Calculating health score for dates:", dates.map(d => new Date(d * 1000).toISOString().split('T')[0]));
                  const result = await solarHealth.calculateHealthScore(dates);
                  console.log("Calculate health score result:", result, "type:", typeof result);
                  
                  if (result === null || result === undefined) {
                    setError("Failed to calculate health score. Please check console for details.");
                    return;
                  }
                  
                  const numResult = typeof result === "bigint" ? Number(result) : Number(result);
                  console.log("Decrypted health score value (converted):", numResult);
                  
                  // Cap at 100
                  if (numResult === 0) {
                    if (solarHealth.message && solarHealth.message.includes("successfully")) {
                      // Health score calculation succeeded but result is 0
                      // This is expected if no steps data exists (health score is based on steps)
                      setHealthScore(0);
                      setError("Health score is 0. The score is calculated based on steps data. Please record steps data first.");
                    } else if (solarHealth.message && solarHealth.message.includes("Error")) {
                      setError(solarHealth.message);
                    } else {
                      setError("No data available for selected period. Please record steps data first (health score is based on steps).");
                    }
                  } else {
                    setHealthScore(Math.min(numResult, 100));
                    setError(null);
                  }
                } catch (err: any) {
                  console.error("Calculate health score error:", err);
                  setError(err?.message || "Failed to calculate health score");
                }
              }}
              disabled={solarHealth.isCalculating || solarHealth.isRecording}
              className="w-full px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 disabled:opacity-50"
            >
              {(solarHealth.isCalculating || solarHealth.isRecording) ? "Calculating..." : "Calculate Score"}
            </button>
            <p className="mt-4 text-textSecondary">
              Score: {healthScore !== null ? `${healthScore.toFixed(0)}/100` : "--"}
            </p>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>

          {/* Risk Assessment */}
          <div className="bg-surface p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-text">
              Risk Assessment
            </h3>
            <button 
              onClick={async () => {
                if (!solarHealth.contract || !solarHealth.isDeployed) {
                  setError("Contract not deployed");
                  return;
                }
                setError(null);
                setRiskLevel(null);
                try {
                  // First, get all dates that have records
                  const userDates = await solarHealth.getUserDates();
                  
                  if (!userDates || userDates.length < 2) {
                    setError("Not enough data. Please record data (especially blood pressure) for at least 2 different dates first.");
                    return;
                  }
                  
                  // Sort dates in descending order (newest first)
                  const sortedDates = [...userDates].sort((a, b) => b - a);
                  
                  // Select dates within the time range
                  const days = parseInt(timeRange);
                  const today = new Date();
                  today.setUTCHours(0, 0, 0, 0);
                  const cutoffTimestamp = Math.floor((today.getTime() - (days * 24 * 60 * 60 * 1000)) / 1000);
                  
                  // Filter dates within the time range
                  const datesInRange = sortedDates.filter(d => d >= cutoffTimestamp);
                  
                  if (datesInRange.length < 2) {
                    setError("Not enough data in selected time range. Please record blood pressure data for at least 2 different dates.");
                    return;
                  }
                  
                  console.log("Assessing risk for dates:", datesInRange.map(d => new Date(d * 1000).toISOString().split('T')[0]));
                  const result = await solarHealth.riskAssessment(datesInRange);
                  console.log("Risk assessment result:", result, "type:", typeof result);
                  
                  if (result === null || result === undefined) {
                    setError("Failed to assess risk. Please check console for details.");
                    return;
                  }
                  
                  const numResult = typeof result === "bigint" ? Number(result) : Number(result);
                  console.log("Decrypted risk assessment value (converted):", numResult);
                  
                  if (numResult === 0) {
                    if (solarHealth.message && solarHealth.message.includes("successfully")) {
                      setRiskLevel("Low");
                      setError(null);
                    } else if (solarHealth.message && solarHealth.message.includes("Error")) {
                      setError(solarHealth.message);
                    } else {
                      setError("No data available for selected period. Please record data first.");
                    }
                  } else {
                    if (numResult < 30) {
                      setRiskLevel("Low");
                    } else if (numResult < 70) {
                      setRiskLevel("Medium");
                    } else {
                      setRiskLevel("High");
                    }
                    setError(null);
                  }
                } catch (err: any) {
                  console.error("Risk assessment error:", err);
                  
                  // Extract error message from various possible formats
                  let errorMsg = 
                    err?.revert?.args?.[0] ||  // Solidity Error(string) format
                    err?.reason ||             // Ethers error reason
                    err?.message ||            // Standard error message
                    err?.toString() ||         // Fallback to string
                    "Failed to assess risk";
                  
                  // Check if it's a FHE operation error (likely due to missing blood pressure data)
                  const errorStr = errorMsg.toLowerCase();
                  if (
                    errorStr.includes("0x9de3392c") ||
                    errorStr.includes("execution reverted") ||
                    errorStr.includes("internal json-rpc error")
                  ) {
                    errorMsg = "Risk assessment requires blood pressure data. Please record blood pressure (systolic) for at least 2 different dates first.";
                  }
                  
                  setError(errorMsg);
                }
              }}
              disabled={solarHealth.isCalculating || solarHealth.isRecording}
              className="w-full px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 disabled:opacity-50"
            >
              {(solarHealth.isCalculating || solarHealth.isRecording) ? "Assessing..." : "Assess Risk"}
            </button>
            <p className="mt-4 text-textSecondary">
              Risk Level: {riskLevel || "--"}
            </p>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>
        </div>
      </main>
    </div>
  );
}


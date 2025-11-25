"use client";

import { NavigationBar } from "@/components/NavigationBar";
import { useWallet } from "@/hooks/useWallet";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFhevm } from "@/fhevm/useFhevm";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useSolarHealth } from "@/hooks/useSolarHealth";

export default function GoalsPage() {
  const { isConnected, provider, chainId, isLoading } = useWallet();
  const router = useRouter();
  const [category, setCategory] = useState("0");
  const [targetValue, setTargetValue] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!targetValue || !deadline) {
      alert("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    
    try {
      const categoryNum = parseInt(category);
      const targetValueNum = parseFloat(targetValue);
      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);

      // For weight, multiply by 10 (70.5kg -> 705)
      const storedValue = categoryNum === 0 ? Math.floor(targetValueNum * 10) : Math.floor(targetValueNum);
      
      await solarHealth.setGoal(categoryNum, storedValue, deadlineTimestamp);

      alert("Goal set successfully!");
      setTargetValue("");
      setDeadline("");
    } catch (error: any) {
      alert(`Error: ${error.message || "Failed to set goal"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-primary">Goals</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Set Goal Form */}
          <div className="bg-surface p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-text">Set New Goal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-text">
                  Goal Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-md bg-background text-text"
                >
                  <option value="0">Weight (kg)</option>
                  <option value="1">Blood Pressure (mmHg)</option>
                  <option value="2">Steps</option>
                  <option value="3">Heart Rate (BPM)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-text">
                  Target Value
                </label>
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-md bg-background text-text"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-text">
                  Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-md bg-background text-text"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting || solarHealth.isRecording}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting || solarHealth.isRecording ? "Setting..." : "Set Goal"}
              </button>
              {solarHealth.message && (
                <p className={`text-sm ${solarHealth.message.includes("Error") ? "text-error" : "text-success"}`}>
                  {solarHealth.message}
                </p>
              )}
            </form>
          </div>

          {/* Active Goals */}
          <div className="bg-surface p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-text">Active Goals</h2>
            <p className="text-textSecondary">No active goals</p>
          </div>
        </div>

        {/* Progress Tracking */}
        <div className="mt-8 bg-surface p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-text">Progress Tracking</h2>
          <p className="text-textSecondary">Select a goal to view progress</p>
        </div>
      </main>
    </div>
  );
}


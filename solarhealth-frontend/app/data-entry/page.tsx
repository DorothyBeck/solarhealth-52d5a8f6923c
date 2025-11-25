"use client";

import { NavigationBar } from "@/components/NavigationBar";
import { useWallet } from "@/hooks/useWallet";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFhevm } from "@/fhevm/useFhevm";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useSolarHealth } from "@/hooks/useSolarHealth";

export default function DataEntryPage() {
  const { isConnected, provider, chainId, isLoading } = useWallet();
  const router = useRouter();
  const [category, setCategory] = useState("0");
  const [value, setValue] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
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
    
    if (!value || !date) {
      alert("Please fill in all fields");
      return;
    }

    // Check if contract is available
    if (!solarHealth.contract || !solarHealth.isDeployed) {
      alert("Contract not deployed. Please deploy the SolarHealth contract first.");
      return;
    }

    setSubmitting(true);
    
    try {
      // Convert date string to timestamp at midnight UTC
      const dateObj = new Date(date + "T00:00:00.000Z");
      const dateTimestamp = Math.floor(dateObj.getTime() / 1000);
      console.log("Recording data for date:", date, "timestamp:", dateTimestamp, "UTC date:", dateObj.toISOString());
      const categoryNum = parseInt(category);
      const valueNum = parseFloat(value);

      if (isNaN(valueNum) || valueNum <= 0) {
        alert("Please enter a valid positive number");
        return;
      }

      if (categoryNum === 4) {
        // Steps use euint32
        await solarHealth.recordSteps(dateTimestamp, Math.floor(valueNum));
      } else {
        // Other categories use euint16
        // For weight, multiply by 10 (70.5kg -> 705)
        const storedValue = categoryNum === 0 ? Math.floor(valueNum * 10) : Math.floor(valueNum);
        await solarHealth.recordHealthData(dateTimestamp, categoryNum, storedValue);
      }

      alert("Health data recorded successfully!");
      setValue("");
      setDate(new Date().toISOString().split("T")[0]); // Reset to today
    } catch (error: any) {
      console.error("Record data error:", error);
      const errorMessage = error?.reason || error?.message || error?.toString() || "Failed to record data";
      alert(`Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-primary">Data Entry</h1>

        <div className="bg-surface p-6 rounded-lg shadow-md max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-text">
                Data Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-md bg-background text-text"
              >
                <option value="0">Weight (kg)</option>
                <option value="1">Blood Pressure - Systolic (mmHg)</option>
                <option value="2">Blood Pressure - Diastolic (mmHg)</option>
                <option value="3">Blood Sugar (mg/dL)</option>
                <option value="4">Steps</option>
                <option value="5">Heart Rate (BPM)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-text">
                Value
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-md bg-background text-text"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-text">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-md bg-background text-text"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting || solarHealth.isRecording}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting || solarHealth.isRecording ? "Recording..." : "Record Data"}
            </button>
            {solarHealth.message && (
              <p className={`text-sm ${solarHealth.message.includes("Error") ? "text-error" : "text-success"}`}>
                {solarHealth.message}
              </p>
            )}
          </form>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-text">Batch Import</h2>
          <button className="px-6 py-3 bg-secondary text-white rounded-lg hover:opacity-90">
            Import CSV
          </button>
        </div>
      </main>
    </div>
  );
}


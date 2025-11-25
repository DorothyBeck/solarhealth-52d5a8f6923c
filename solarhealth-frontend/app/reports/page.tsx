"use client";

import { NavigationBar } from "@/components/NavigationBar";
import { useWallet } from "@/hooks/useWallet";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReportsPage() {
  const { isConnected } = useWallet();
  const router = useRouter();
  const [reportType, setReportType] = useState("weekly");

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-primary">Reports</h1>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-text">
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-4 py-2 border border-border rounded-md bg-background text-text"
          >
            <option value="weekly">Weekly Report</option>
            <option value="monthly">Monthly Report</option>
            <option value="custom">Custom Report</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Statistics */}
          <div className="bg-surface p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-text">
              Health Data Statistics
            </h3>
            <div className="space-y-2 text-textSecondary">
              <p>Total Records: --</p>
              <p>Data Categories: --</p>
              <p>Time Range: --</p>
            </div>
          </div>

          {/* Trends */}
          <div className="bg-surface p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-text">
              Time Trend Analysis
            </h3>
            <p className="text-textSecondary">
              Trend direction: -- (without exposing daily values)
            </p>
          </div>

          {/* Comparison */}
          <div className="bg-surface p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-text">
              Health Indicators Comparison
            </h3>
            <button className="w-full px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 mb-4">
              Compare Metrics
            </button>
            <p className="text-textSecondary">Comparison results: --</p>
          </div>

          {/* Report Generation */}
          <div className="bg-surface p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-text">
              Generate Report
            </h3>
            <button className="w-full px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 mb-4">
              Generate {reportType === "weekly" ? "Weekly" : reportType === "monthly" ? "Monthly" : "Custom"} Report
            </button>
            <div className="space-y-2 text-sm text-textSecondary">
              <p>• Health Score</p>
              <p>• Trend Summary</p>
              <p>• Risk Assessment</p>
              <p>• Recommendations</p>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-surface p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-text">Export Options</h3>
          <div className="flex space-x-4">
            <button className="px-6 py-3 bg-secondary text-white rounded-lg hover:opacity-90">
              Export as PDF
            </button>
            <button className="px-6 py-3 bg-secondary text-white rounded-lg hover:opacity-90">
              Export Encrypted Data
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}



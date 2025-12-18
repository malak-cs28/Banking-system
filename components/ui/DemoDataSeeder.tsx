"use client";

import { useState } from "react";
import { Button } from "./button";
import { seedDemoTransactions, clearDemoTransactions } from "@/lib/actions/demo.actions";
import { Loader2, Database, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type DemoDataSeederProps = {
  userId: string;
  bankId: string;
};

const DemoDataSeeder = ({ userId, bankId }: DemoDataSeederProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSeedData = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await seedDemoTransactions({ userId, bankId });
      if (result.success) {
        setMessage(`✅ Successfully added ${result.count} demo transactions!`);
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        setMessage("❌ Failed to seed demo data");
      }
    } catch (error) {
      setMessage("❌ Error seeding demo data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm("Are you sure you want to clear all transactions? This cannot be undone.")) {
      return;
    }
    setIsClearing(true);
    setMessage(null);
    try {
      const result = await clearDemoTransactions({ bankId });
      if (result.success) {
        setMessage(`✅ Successfully cleared ${result.deleted} transactions!`);
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        setMessage("❌ Failed to clear transactions");
      }
    } catch (error) {
      setMessage("❌ Error clearing transactions");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center gap-2">
        <Database className="w-5 h-5 text-blue-600" />
        <h3 className="text-16 font-semibold text-gray-900">Demo Data Tools</h3>
      </div>
      <p className="text-14 text-gray-600">
        For presentations: Add sample transactions or clear existing data
      </p>
      
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={handleSeedData}
          disabled={isLoading || isClearing}
          className="flex items-center gap-2"
          variant="default"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Database className="w-4 h-4" />
              Add Demo Transactions
            </>
          )}
        </Button>

        <Button
          onClick={handleClearData}
          disabled={isLoading || isClearing}
          className="flex items-center gap-2"
          variant="outline"
        >
          {isClearing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Clearing...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              Clear Transactions
            </>
          )}
        </Button>
      </div>

      {message && (
        <p className={`text-14 ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default DemoDataSeeder;


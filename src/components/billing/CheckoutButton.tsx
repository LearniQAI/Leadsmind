"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/app/actions/finance";

interface CheckoutButtonProps {
  tierId: string;
  interval: "month" | "year";
  disabled: boolean;
  isCurrentPlan: boolean;
  price: number;
}

export function CheckoutButton({
  tierId,
  interval,
  disabled,
  isCurrentPlan,
  price,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await createCheckoutSession(tierId, interval);
      if (res?.url) {
        window.location.href = res.url;
      } else if (res?.error) {
        alert(`Checkout Error: ${res.error}`);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      alert(`Unexpected error: ${err.message}`);
      setLoading(false);
    }
  };

  const isMonthly = interval === "month";
  const label = isCurrentPlan
    ? "Active (Monthly)"
    : price === 0
    ? "Current Plan"
    : isMonthly
    ? "Upgrade Monthly"
    : "Upgrade Annually (Save 20%)";

  return (
    <Button
      type="button"
      onClick={handleCheckout}
      variant={isCurrentPlan ? "outline" : isMonthly ? "default" : "secondary"}
      className={`w-full py-6 text-sm font-bold transition-all ${
        isCurrentPlan
          ? "border-white/10 text-white/40"
          : isMonthly
          ? "bg-[#6c47ff] hover:bg-[#5b3ce0] text-white"
          : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
      }`}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Processing...
        </span>
      ) : (
        label
      )}
    </Button>
  );
}

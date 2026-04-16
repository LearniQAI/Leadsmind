"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { createCheckoutSession } from "@/app/actions/finance";

interface CheckoutButtonProps {
  tierId: string;
  interval: "month" | "year";
  disabled: boolean;
  isCurrentPlan: boolean;
  displayPrice: number;
  isFeatured?: boolean;
  mode?: "dashboard" | "marketing";
}

export function CheckoutButton({
  tierId,
  interval,
  disabled,
  isCurrentPlan,
  displayPrice,
  isFeatured = false,
  mode = "dashboard",
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

  if (mode === "marketing") {
    return (
      <Link
        href="/signup"
        className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${
          isFeatured
            ? "bg-[#6c47ff] hover:bg-[#5b3ce0] text-white shadow-lg shadow-[#6c47ff]/30 border border-white/10"
            : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
        }`}
      >
        {displayPrice === 0 ? "Get Started for Free" : "Start 14-Day Free Trial"}
      </Link>
    );
  }

  if (isCurrentPlan) {
    return (
      <button
        disabled
        className="w-full py-3.5 rounded-2xl text-sm font-bold bg-white/5 border border-white/10 text-white/30 cursor-default"
      >
        Current Plan
      </button>
    );
  }

  if (displayPrice === 0) {
    return (
      <button
        disabled
        className="w-full py-3.5 rounded-2xl text-sm font-bold bg-white/5 border border-white/10 text-white/30 cursor-default"
      >
        Free Forever
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={disabled || loading}
      className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${
        isFeatured
          ? "bg-[#6c47ff] hover:bg-[#5b3ce0] text-white shadow-lg shadow-[#6c47ff]/30 border border-white/10"
          : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        `Get Started — $${displayPrice}/mo`
      )}
    </button>
  );
}

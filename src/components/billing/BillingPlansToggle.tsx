"use client";

import { useState } from "react";
import { CheckCircle2, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutButton } from "@/components/billing/CheckoutButton";
import { cn } from "@/lib/utils";

interface Tier {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
}

interface BillingPlansToggleProps {
  tiers: Tier[];
  currentPlanTier?: string;
  mode?: "dashboard" | "marketing";
}

export function BillingPlansToggle({ 
  tiers, 
  currentPlanTier,
  mode = "dashboard" 
}: BillingPlansToggleProps) {
  const [isAnnual, setIsAnnual] = useState(false);

  const featuredTier = "pro";

  return (
    <div className="space-y-6">
      {/* Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={cn("text-sm font-bold transition-colors", !isAnnual ? "text-white" : "text-white/40")}>
          Monthly
        </span>
        <button
          onClick={() => setIsAnnual(!isAnnual)}
          className={cn(
            "relative h-7 w-14 rounded-full border transition-all duration-300",
            isAnnual
              ? "bg-[#6c47ff] border-[#6c47ff]"
              : "bg-white/10 border-white/10"
          )}
          aria-label="Toggle billing interval"
        >
          <div
            className={cn(
              "absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300",
              isAnnual ? "left-8" : "left-1"
            )}
          />
        </button>
        <span className={cn("text-sm font-bold transition-colors flex items-center gap-2", isAnnual ? "text-white" : "text-white/40")}>
          Annual
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
            Save ~20%
          </span>
        </span>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const isFeatured = tier.id === featuredTier;
          const isCurrentPlan =
            currentPlanTier === tier.id ||
            (currentPlanTier === "free" && tier.id === "starter");

          const displayPrice = isAnnual ? tier.annualPrice : tier.monthlyPrice;
          const originalPrice = !isAnnual ? null : tier.monthlyPrice;

          return (
            <Card
              key={tier.id}
              className={cn(
                "relative overflow-hidden flex flex-col transition-all duration-300",
                isFeatured
                  ? "bg-[#6c47ff]/10 border-[#6c47ff]/40 ring-2 ring-[#6c47ff]/50 shadow-[0_0_60px_rgba(108,71,255,0.12)]"
                  : "bg-white/[0.03] border-white/5",
                isCurrentPlan && !isFeatured && "ring-2 ring-[#6c47ff] border-transparent"
              )}
            >
              {/* Featured badge */}
              {isFeatured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#6c47ff] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#6c47ff]/40">
                    <Zap className="h-3 w-3" /> Most Popular
                  </span>
                </div>
              )}

              {isCurrentPlan && !isFeatured && (
                <div className="absolute top-0 right-0 bg-[#6c47ff] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                  Current Plan
                </div>
              )}

              <CardHeader className={cn("pt-8", isFeatured && "pt-10")}>
                <CardTitle className="text-white text-lg font-black">{tier.name}</CardTitle>

                <div className="mt-4 flex items-baseline gap-2">
                  {originalPrice !== null && originalPrice > 0 && (
                    <span className="text-white/30 line-through text-lg font-bold">${originalPrice}</span>
                  )}
                  <span className="text-4xl font-black text-white">
                    {displayPrice === 0 ? "Free" : `$${displayPrice}`}
                  </span>
                  {displayPrice > 0 && (
                    <span className="text-white/40 text-sm">/mo</span>
                  )}
                </div>

                {isAnnual && displayPrice > 0 && (
                  <p className="text-[11px] text-emerald-400 font-bold mt-1">
                    Billed ${displayPrice * 12}/year — save ${(tier.monthlyPrice - displayPrice) * 12}/yr
                  </p>
                )}
              </CardHeader>

              <CardContent className="flex-1 pb-2">
                <ul className="space-y-3">
                  {tier.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-white/60">
                      <CheckCircle2 className={cn("h-4 w-4 mt-0.5 shrink-0", isFeatured ? "text-[#6c47ff]" : "text-white/30")} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardContent className="pt-4 pb-6 mt-auto">
                <CheckoutButton
                  tierId={tier.id}
                  interval={isAnnual ? "year" : "month"}
                  disabled={isCurrentPlan}
                  isCurrentPlan={isCurrentPlan}
                  displayPrice={displayPrice}
                  isFeatured={isFeatured}
                  mode={mode}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

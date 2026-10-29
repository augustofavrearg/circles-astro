import { useState } from "react";
import type { MembershipPlan } from "@/domain/content";

/** Figma "Pricing" toggle (Yearly / Lifetime) and the selected price. With one plan it renders statically. */
export function PricingPlans({ plans }: { plans: MembershipPlan[] }) {
  const [selected, setSelected] = useState(0);
  const plan = plans[selected];
  if (!plan) return null;

  return (
    <div>
      {plans.length > 1 && (
        <div role="radiogroup" aria-label="Billing" className="inline-flex rounded-md bg-black/10 p-0.5">
          {plans.map((item, index) => (
            <button
              key={item.label}
              type="button"
              role="radio"
              aria-checked={index === selected}
              onClick={() => setSelected(index)}
              className={`h-6.5 min-w-19 rounded-sm px-4 text-detail transition-colors ${index === selected ? "bg-black text-white" : "text-black/55 hover:text-black"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      <p aria-live="polite" className={`text-[0.9375rem] ${plans.length > 1 ? "mt-8" : ""}`}>
        <span className="block">{plan.price}</span>
        {plan.note && <span className="block text-black/55">{plan.note}</span>}
      </p>
    </div>
  );
}

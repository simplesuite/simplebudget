import { useEffect, useState } from "react";
import { supabase, SUPABASE_URL } from "./supabase";

// --- Self-hosted detection ---

const PRODUCTION_URL = "https://psdmjjcvaxejxktqwdcm.supabase.co";

/** Returns true when the app is connected to a non-production backend. */
export function isSelfHosted(): boolean {
    return SUPABASE_URL !== PRODUCTION_URL;
}

// --- Subscription state helpers ---

export type SubscriptionState = "free" | "active" | "trialing" | "canceling";

export interface Entitlement {
    plan: string | null;
    status: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean | null;
}

export function getSubscriptionState(entitlement: Entitlement | null): SubscriptionState {
    if (!entitlement) return "free";
    if (
        entitlement.plan === "pro" &&
        ["active", "trialing"].includes(entitlement.status ?? "")
    ) {
        if (entitlement.cancel_at_period_end) return "canceling";
        return entitlement.status as "active" | "trialing";
    }
    return "free";
}

/**
 * Hook that fetches the user's subscription entitlement from Supabase.
 * Self-hosted users are always treated as pro.
 */
export function useEntitlement() {
    const selfHosted = isSelfHosted();
    const [entitlement, setEntitlement] = useState<Entitlement | null>(
        selfHosted ? { plan: "pro", status: "active", current_period_end: null, cancel_at_period_end: false } : null
    );
    const [loading, setLoading] = useState(!selfHosted);

    useEffect(() => {
        if (selfHosted) return;
        let cancelled = false;
        async function fetch() {
            const { data, error } = await supabase
                .from("user_entitlements")
                .select("plan, status, current_period_end, cancel_at_period_end")
                .eq("app_key", "simplebudget")
                .maybeSingle();

            if (!cancelled) {
                if (!error && data) setEntitlement(data);
                setLoading(false);
            }
        }
        fetch();
        return () => { cancelled = true; };
    }, [selfHosted]);

    return { entitlement, subscriptionState: getSubscriptionState(entitlement), loading };
}

// --- Checkout / Billing Portal ---

/**
 * Initiates a Stripe checkout session via the Supabase Edge Function
 * and redirects the user to the Stripe-hosted checkout page.
 */
export async function redirectToCheckout(): Promise<void> {
    const { data, error } = await supabase.functions.invoke(
        "create-checkout-session",
        {
            body: {
                appKey: "simplebudget_test",
                plan: "pro",
            },
        }
    );

    if (error) {
        throw new Error(error.message || "Failed to create checkout session");
    }

    if (!data?.url) {
        throw new Error("No checkout URL returned from server");
    }

    // Redirect to Stripe checkout
    window.location.href = data.url;
}

/**
 * Opens the Stripe Billing Portal via the Supabase Edge Function
 * so the user can manage their subscription, payment methods, and invoices.
 */
export async function redirectToBillingPortal(): Promise<void> {
    const { data, error } = await supabase.functions.invoke(
        "create-billing-portal-session",
        {
            body: {
                appKey: "simplebudget_test",
            },
        }
    );

    if (error) {
        throw new Error(error.message || "Failed to create billing portal session");
    }

    if (!data?.url) {
        throw new Error("No billing portal URL returned from server");
    }

    // Redirect to Stripe billing portal
    window.location.href = data.url;
}

import { supabase } from "./supabase";

/**
 * Initiates a Stripe checkout session via the Supabase Edge Function
 * and redirects the user to the Stripe-hosted checkout page.
 */
export async function redirectToCheckout(plan: string = "pro"): Promise<void> {
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

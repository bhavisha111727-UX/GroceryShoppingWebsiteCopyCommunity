import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "./info";

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
  { auth: { persistSession: true, autoRefreshToken: true } }
);

const API_BASE = `https://${projectId}.supabase.co/functions/v1/server/make-server-94b9dfd4`;

async function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export async function fetchCart(token: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/cart`, { headers: await authHeaders(token) });
    if (!res.ok) return [];
    const { cart } = await res.json();
    return cart ?? [];
  } catch {
    return [];
  }
}

export async function saveCart(token: string, cart: any[]): Promise<void> {
  try {
    await fetch(`${API_BASE}/cart`, {
      method: "POST",
      headers: await authHeaders(token),
      body: JSON.stringify({ cart }),
    });
  } catch {
    // best-effort
  }
}

export async function fetchWishlist(token: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/wishlist`, { headers: await authHeaders(token) });
    if (!res.ok) return [];
    const { wishlist } = await res.json();
    return wishlist ?? [];
  } catch {
    return [];
  }
}

export async function saveWishlist(token: string, wishlist: any[]): Promise<void> {
  try {
    await fetch(`${API_BASE}/wishlist`, {
      method: "POST",
      headers: await authHeaders(token),
      body: JSON.stringify({ wishlist }),
    });
  } catch {
    // best-effort
  }
}

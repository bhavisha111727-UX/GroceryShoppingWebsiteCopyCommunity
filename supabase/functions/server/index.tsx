import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("*", logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

async function getUserFromRequest(authHeader: string | undefined) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

app.get("/make-server-94b9dfd4/health", (c) => c.json({ status: "ok" }));

// Cart
app.get("/make-server-94b9dfd4/cart", async (c) => {
  const user = await getUserFromRequest(c.req.header("Authorization"));
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const cart = (await kv.get(`cart:${user.id}`)) ?? [];
  return c.json({ cart });
});

app.post("/make-server-94b9dfd4/cart", async (c) => {
  const user = await getUserFromRequest(c.req.header("Authorization"));
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const { cart } = await c.req.json();
  await kv.set(`cart:${user.id}`, cart);
  return c.json({ success: true });
});

// Wishlist
app.get("/make-server-94b9dfd4/wishlist", async (c) => {
  const user = await getUserFromRequest(c.req.header("Authorization"));
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const wishlist = (await kv.get(`wishlist:${user.id}`)) ?? [];
  return c.json({ wishlist });
});

app.post("/make-server-94b9dfd4/wishlist", async (c) => {
  const user = await getUserFromRequest(c.req.header("Authorization"));
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const { wishlist } = await c.req.json();
  await kv.set(`wishlist:${user.id}`, wishlist);
  return c.json({ success: true });
});

Deno.serve(app.fetch);

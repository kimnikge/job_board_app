import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  const { record } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { id, email } = record;

  const { error } = await supabase.from("users").insert({
    id,
    email
  });

  if (error) {
    console.error("Insert error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response("OK", { status: 200 });
});
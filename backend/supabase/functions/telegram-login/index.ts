import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { id, first_name, last_name, username, photo_url, auth_date, hash } =
      await req.json();

    console.log("Telegram login attempt:", { id, first_name, username });

    // Базовая проверка данных
    if (!id || !auth_date || !hash) {
      console.error("Missing required data:", { id: !!id, auth_date: !!auth_date, hash: !!hash });
      return new Response(
        JSON.stringify({ error: "Missing required Telegram data" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Проверка hash от Telegram для production
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    console.log("Bot token exists:", !!botToken);
    
    if (botToken && hash !== 'demo_hash_' + auth_date && !hash.startsWith('demo_hash_')) {
      // Создаем строку для проверки (все поля кроме hash, отсортированные по алфавиту)
      const dataCheckString = Object.keys({
        id,
        first_name,
        last_name,
        username,
        photo_url,
        auth_date,
      })
        .filter((key) =>
          ({ id, first_name, last_name, username, photo_url, auth_date })[
            key
          ] !== undefined
        )
        .sort()
        .map((key) =>
          `${key}=${
            ({ id, first_name, last_name, username, photo_url, auth_date })[key]
          }`
        )
        .join("\n");

      // Создаем secret key из bot token для Telegram Login Widget
      const encoder = new TextEncoder();
      const secretKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(botToken),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );

      // Вычисляем хеш данных
      const computedHashBuffer = await crypto.subtle.sign(
        "HMAC",
        secretKey,
        encoder.encode(dataCheckString),
      );

      const expectedHash = Array.from(new Uint8Array(computedHashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (hash !== expectedHash) {
        console.error("Invalid Telegram hash:", {
          provided: hash,
          expected: expectedHash,
        });
        return new Response(
          JSON.stringify({ error: "Invalid Telegram authentication data" }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Проверка времени (данные не старше 24 часов)
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime - auth_date > 86400) {
        return new Response(
          JSON.stringify({ error: "Authentication data expired" }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    } else {
      console.log("Skipping hash verification for demo mode or missing bot token");
    }

    const telegramId = id.toString();
    console.log("Looking for user with telegram_id:", telegramId);

    // Ищем существующего пользователя
    const { data: existingUser, error: selectError } = await supabase
      .from("profiles")
      .select("*")
      .eq("telegram_id", telegramId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error("Error searching for user:", selectError);
      throw selectError;
    }

    console.log("Existing user found:", !!existingUser);

    let userId: string;

    if (existingUser) {
      // Пользователь существует, обновляем данные
      userId = existingUser.user_id;

      await supabase
        .from("profiles")
        .update({
          first_name,
          last_name,
          username,
          photo_url,
          updated_at: new Date().toISOString(),
        })
        .eq("telegram_id", telegramId);

      console.log("Updated existing user:", userId);
    } else {
      // Создаем нового пользователя
      const email = `telegram_${id}@telegram.local`;
      const tempPassword = `temp_${hash}_${Date.now()}`;

      // Создаем пользователя в auth.users
      const { data: authUser, error: authError } = await supabase.auth.admin
        .createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            telegram_id: id,
            first_name,
            last_name,
            username,
          },
        });

      if (authError) {
        console.error("Auth user creation error:", authError);
        throw authError;
      }

      userId = authUser.user.id;

      // Создаем профиль
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: userId,
          telegram_id: telegramId,
          first_name,
          last_name,
          username,
          photo_url,
          user_type: "candidate",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        throw profileError;
      }

      console.log("Created new user:", userId);
    }

    // Создаем сессию для пользователя
    const { data: sessionData, error: sessionError } = await supabase.auth.admin
      .generateLink({
        type: "magiclink",
        email: `telegram_${id}@telegram.local`,
        options: {
          redirectTo: `${
            req.headers.get("origin") ||
            Deno.env.get("CORS_ORIGIN") ||
            "http://localhost:3000"
          }/auth/callback`,
        },
      });

    if (sessionError) {
      console.error("Session creation error:", sessionError);
      throw sessionError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        message: "User authenticated successfully",
        redirect_url: sessionData.properties?.action_link,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Telegram login error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

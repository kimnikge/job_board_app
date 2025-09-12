import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

Deno.serve(async (req) => {
    // Handle CORS preflight requests
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

        const requestData = await req.json();
        const { autologin_token, ...additionalData } = requestData;

        console.log("Telegram URL auth attempt:", {
            token_length: autologin_token?.length,
            additional_data: additionalData,
        });

        // Базовая проверка токена
        if (!autologin_token || typeof autologin_token !== "string") {
            return new Response(
                JSON.stringify({ error: "Invalid or missing autologin_token" }),
                {
                    status: 400,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        // Валидация токена
        if (!validateAutologinToken(autologin_token)) {
            return new Response(
                JSON.stringify({ error: "Invalid autologin_token format" }),
                {
                    status: 401,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        // В реальной реализации здесь должна быть проверка подписи токена
        // с помощью секретного ключа Telegram
        // Для демонстрации принимаем все токены с правильным форматом

        // Создаем пользователя на основе токена
        const userId = `telegram-url-auth-${Date.now()}-${
            Math.random().toString(36).substr(2, 9)
        }`;

        // Создаем профиль пользователя
        const { error: profileError } = await supabase
            .from("user_profiles")
            .insert({
                id: userId,
                user_id: userId,
                telegram_id: `url_auth_${autologin_token.slice(-8)}`,
                first_name: "URL",
                last_name: "Authorized User",
                telegram_username: null,
                telegram_photo_url: null,
                user_type: "candidate",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .select();

        if (profileError) {
            console.error("Profile creation error:", profileError);
            return new Response(
                JSON.stringify({ error: "Failed to create user profile" }),
                {
                    status: 500,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        // Создаем сессию для пользователя
        const { data: sessionData, error: sessionError } = await supabase.auth
            .admin
            .generateLink({
                type: "magiclink",
                email: `url_auth_${userId}@telegram.local`,
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
            return new Response(
                JSON.stringify({ error: "Failed to create session" }),
                {
                    status: 500,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        console.log("URL auth successful:", { user_id: userId });

        return new Response(
            JSON.stringify({
                success: true,
                user_id: userId,
                message: "URL authentication successful",
                redirect_url: sessionData.properties?.action_link,
                user: {
                    id: userId,
                    user_metadata: {
                        user_type: "candidate",
                        full_name: "URL Authorized User",
                        telegram_id: `url_auth_${autologin_token.slice(-8)}`,
                        auth_method: "telegram_url_auth",
                        ...additionalData,
                    },
                },
            }),
            {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    } catch (error) {
        console.error("URL auth error:", error);
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

/**
 * Валидация autologin_token
 * В реальной реализации должна проверять подпись токена
 */
function validateAutologinToken(token: string): boolean {
    // Проверяем формат токена
    if (token.length < 10) {
        return false;
    }

    // Проверяем что токен не содержит подозрительных символов
    const validTokenRegex = /^[a-zA-Z0-9_-]+$/;
    if (!validTokenRegex.test(token)) {
        return false;
    }

    // Проверяем префикс для mock токенов
    if (token.startsWith("mock_autologin_")) {
        return true;
    }

    // В реальной реализации здесь должна быть проверка подписи
    // с помощью HMAC и секретного ключа от Telegram

    // Для демо принимаем любые токены правильного формата
    return true;
}

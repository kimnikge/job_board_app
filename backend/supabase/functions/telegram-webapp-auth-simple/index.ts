import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

Deno.serve(async (req) => {
    console.log("🚀 Telegram Web App auth request received");

    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        console.log("📋 CORS preflight request");
        return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        console.log("❌ Invalid method:", req.method);
        return new Response("Method not allowed", {
            status: 405,
            headers: corsHeaders,
        });
    }

    try {
        // Инициализация Supabase
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error("Supabase configuration missing");
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        console.log("✅ Supabase client created");

        // Парсим тело запроса
        const requestData = await req.json();
        console.log("📝 Request data keys:", Object.keys(requestData));

        const {
            id,
            first_name,
            last_name,
            username,
            photo_url,
            language_code,
            initData,
            platform,
        } = requestData;

        // Базовая проверка обязательных данных
        if (!id) {
            console.error("❌ Missing user ID");
            return new Response(
                JSON.stringify({ error: "Missing user ID" }),
                {
                    status: 400,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        console.log("👤 Processing user:", {
            id,
            first_name,
            username,
            hasInitData: !!initData,
            platform: platform || "unknown",
        });

        // УПРОЩЕННАЯ ВАЛИДАЦИЯ - только в production
        const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
        const isProduction = Deno.env.get("ENVIRONMENT") === "production";

        if (isProduction && botToken && initData) {
            console.log("🔒 Production mode - validating initData");

            try {
                const isValid = simpleValidation(initData, botToken);
                if (!isValid) {
                    console.error("❌ Validation failed");
                    return new Response(
                        JSON.stringify({ error: "Invalid Telegram data" }),
                        {
                            status: 401,
                            headers: {
                                ...corsHeaders,
                                "Content-Type": "application/json",
                            },
                        },
                    );
                }
                console.log("✅ Validation passed");
            } catch (validationError) {
                console.error("❌ Validation error:", validationError);
                return new Response(
                    JSON.stringify({
                        error: "Validation error: " +
                            (validationError instanceof Error
                                ? validationError.message
                                : "Unknown validation error"),
                    }),
                    {
                        status: 401,
                        headers: {
                            ...corsHeaders,
                            "Content-Type": "application/json",
                        },
                    },
                );
            }
        } else {
            console.log(
                "⚠️ Skipping validation (development mode or missing token)",
            );
        }

        const telegramId = id.toString();
        console.log("🔍 Looking for user with telegram_id:", telegramId);

        // Ищем существующего пользователя
        const { data: existingUser, error: selectError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("telegram_id", telegramId)
            .single();

        if (selectError && selectError.code !== "PGRST116") {
            console.error("❌ Database error:", selectError);
            throw new Error("Database query failed: " + selectError.message);
        }

        let userId: string;

        if (existingUser) {
            // Обновляем существующего пользователя
            userId = existingUser.user_id || existingUser.id;
            console.log("🔄 Updating existing user:", userId);

            const { error: updateError } = await supabase
                .from("user_profiles")
                .update({
                    full_name: first_name + (last_name ? " " + last_name : ""),
                    telegram_username: username,
                    telegram_photo_url: photo_url,
                    language_code: language_code,
                    updated_at: new Date().toISOString(),
                })
                .eq("telegram_id", telegramId);

            if (updateError) {
                console.error("❌ Profile update error:", updateError);
                throw new Error(
                    "Profile update failed: " + updateError.message,
                );
            }

            console.log("✅ Profile updated");
        } else {
            // Создаем нового пользователя
            console.log("🆕 Creating new user");

            const email = `telegram_${id}@webapp.local`;
            const tempPassword = `webapp_${Date.now()}_${
                Math.random().toString(36)
            }`;

            const { data: authUser, error: authError } = await supabase.auth
                .admin
                .createUser({
                    email,
                    password: tempPassword,
                    email_confirm: true,
                    user_metadata: {
                        telegram_id: id,
                        first_name,
                        last_name,
                        username,
                        auth_method: "telegram_web_app",
                    },
                });

            if (authError) {
                console.error("❌ Auth user creation error:", authError);
                throw new Error("User creation failed: " + authError.message);
            }

            userId = authUser.user.id;
            console.log("✅ Auth user created:", userId);

            // Создаем профиль
            const { error: profileError } = await supabase
                .from("user_profiles")
                .insert({
                    user_id: userId,
                    telegram_id: telegramId,
                    full_name: first_name + (last_name ? " " + last_name : ""),
                    telegram_username: username,
                    telegram_photo_url: photo_url,
                    language_code: language_code,
                    user_type: "candidate",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                });

            if (profileError) {
                console.error("❌ Profile creation error:", profileError);
                throw new Error(
                    "Profile creation failed: " + profileError.message,
                );
            }

            console.log("✅ Profile created");
        }

        // Создаем магическую ссылку для авторизации
        console.log("🔗 Creating magic link");
        const { data: sessionData, error: sessionError } = await supabase.auth
            .admin
            .generateLink({
                type: "magiclink",
                email: `telegram_${id}@webapp.local`,
            });

        if (sessionError) {
            console.error("❌ Session creation error:", sessionError);
            throw new Error("Session creation failed: " + sessionError.message);
        }

        console.log("✅ Magic link created");

        const response = {
            success: true,
            user_id: userId,
            method: "telegram_web_app",
            message: "Authentication successful",
            redirect_url: sessionData.properties?.action_link,
        };

        console.log("🎉 Success! Returning response");
        return new Response(
            JSON.stringify(response),
            {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    } catch (error) {
        console.error("💥 Fatal error:", error);

        const errorResponse = {
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
            type: error instanceof Error ? error.name : "UnknownError",
        };

        return new Response(
            JSON.stringify(errorResponse),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    }
});

/**
 * Упрощенная валидация - проверяем только наличие hash и базовые параметры
 */
function simpleValidation(initData: string, _botToken: string): boolean {
    try {
        console.log("🔍 Simple validation started");

        const urlParams = new URLSearchParams(initData);
        const hash = urlParams.get("hash");
        const user = urlParams.get("user");
        const authDate = urlParams.get("auth_date");

        if (!hash) {
            console.error("❌ No hash in initData");
            return false;
        }

        if (!user) {
            console.error("❌ No user in initData");
            return false;
        }

        if (!authDate) {
            console.error("❌ No auth_date in initData");
            return false;
        }

        // Проверка времени (не старше 24 часов)
        const now = Math.floor(Date.now() / 1000);
        const authTimestamp = parseInt(authDate);
        const maxAge = 86400; // 24 часа

        if (now - authTimestamp > maxAge) {
            console.error("❌ Data too old:", {
                now,
                authTimestamp,
                diff: now - authTimestamp,
            });
            return false;
        }

        // Проверка пользователя
        try {
            const userData = JSON.parse(decodeURIComponent(user));
            if (!userData.id || !userData.first_name) {
                console.error("❌ Invalid user data:", userData);
                return false;
            }
        } catch (parseError) {
            console.error("❌ Cannot parse user data:", parseError);
            return false;
        }

        console.log("✅ Simple validation passed");
        return true;
    } catch (error) {
        console.error("❌ Simple validation error:", error);
        return false;
    }
}

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
        console.log("Telegram Web App auth attempt:", {
            hasInitData: !!requestData.initData,
            userId: requestData.id,
            firstName: requestData.first_name,
            platform: requestData.platform,
        });

        // Извлекаем данные из запроса
        const {
            id,
            first_name,
            last_name,
            username,
            photo_url,
            language_code,
            initData,
            platform,
            version,
            _is_web_app,
        } = requestData;

        // Базовая проверка обязательных данных
        if (!id || !initData) {
            console.error("Missing required data:", {
                id: !!id,
                initData: !!initData,
            });
            return new Response(
                JSON.stringify({
                    error:
                        "Missing required Telegram Web App data (id, initData)",
                }),
                {
                    status: 400,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        // Валидация initData от Telegram Web App
        const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");

        if (botToken) {
            console.log("Validating Telegram Web App initData...");

            try {
                const isValid = await validateTelegramWebAppData(
                    initData,
                    botToken,
                );

                if (!isValid) {
                    console.error("Invalid Telegram Web App initData");
                    return new Response(
                        JSON.stringify({
                            error:
                                "Invalid Telegram Web App authentication data",
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

                console.log("✅ Telegram Web App data validated successfully");
            } catch (validationError) {
                console.error("Validation error:", validationError);
                // В случае ошибки валидации, продолжаем без проверки (для отладки)
                console.warn("⚠️ Continuing without validation due to error");
            }
        } else {
            console.warn(
                "⚠️ Bot token not found - skipping validation (development mode)",
            );
        }

        const telegramId = id.toString();
        console.log("Processing user with telegram_id:", telegramId);

        // Ищем существующего пользователя
        console.log("Searching for existing user...");
        const { data: existingUser, error: selectError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("telegram_id", telegramId)
            .single();

        if (selectError && selectError.code !== "PGRST116") {
            console.error("Error searching for user:", selectError);
            throw selectError;
        }

        let userId: string;

        if (existingUser) {
            // Пользователь существует - обновляем данные
            userId = existingUser.user_id || existingUser.id;

            console.log("Updating existing user:", userId);

            // Обновляем профиль пользователя
            const { error: updateError } = await supabase
                .from("user_profiles")
                .update({
                    full_name: first_name + (last_name ? " " + last_name : ""),
                    telegram_username: username,
                    telegram_photo_url: photo_url,
                    language_code: language_code,
                    platform: platform,
                    updated_at: new Date().toISOString(),
                })
                .eq("telegram_id", telegramId);

            if (updateError) {
                console.error("Profile update error:", updateError);
                throw updateError;
            }
        } else {
            // Создаем нового пользователя
            console.log("Creating new user...");

            // Создаем пользователя в auth.users
            const email = `telegram_${id}@telegram-webapp.local`;
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
                        platform,
                        version,
                    },
                });

            if (authError) {
                console.error("Auth user creation error:", authError);
                throw authError;
            }

            userId = authUser.user.id;

            // Создаем профиль в user_profiles
            const { error: profileError } = await supabase
                .from("user_profiles")
                .insert({
                    user_id: userId,
                    telegram_id: telegramId,
                    full_name: first_name + (last_name ? " " + last_name : ""),
                    telegram_username: username,
                    telegram_photo_url: photo_url,
                    language_code: language_code,
                    user_type: "candidate", // По умолчанию - кандидат
                    platform: platform,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                });

            if (profileError) {
                console.error("Profile creation error:", profileError);
                throw profileError;
            }

            console.log("✅ New user created:", userId);
        }

        // Создаем сессию для пользователя
        console.log("Creating session...");

        const { data: sessionData, error: sessionError } = await supabase.auth
            .admin
            .generateLink({
                type: "magiclink",
                email: `telegram_${id}@telegram-webapp.local`,
                options: {
                    redirectTo: `${
                        req.headers.get("origin") ||
                        Deno.env.get("CORS_ORIGIN") ||
                        "https://horecapp.netlify.app"
                    }/auth/callback`,
                },
            });

        if (sessionError) {
            console.error("Session creation error:", sessionError);
            throw sessionError;
        }

        console.log("✅ User authenticated successfully via Telegram Web App");

        return new Response(
            JSON.stringify({
                success: true,
                user_id: userId,
                method: "telegram_web_app",
                message: "User authenticated successfully via Telegram Web App",
                redirect_url: sessionData.properties?.action_link,
            }),
            {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    } catch (error) {
        console.error("Telegram Web App auth error:", error);

        return new Response(
            JSON.stringify({
                error: error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
                debug_info: {
                    timestamp: new Date().toISOString(),
                    error_type: error instanceof Error
                        ? error.name
                        : "UnknownError",
                },
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    }
});

/**
 * Валидация данных Telegram Web App согласно официальной документации
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 */
async function validateTelegramWebAppData(
    initData: string,
    botToken: string,
): Promise<boolean> {
    try {
        // Парсим initData
        const urlParams = new URLSearchParams(initData);
        const hash = urlParams.get("hash");

        if (!hash) {
            console.error("No hash found in initData");
            return false;
        }

        // Удаляем hash из параметров
        urlParams.delete("hash");

        // Сортируем параметры по ключу
        const sortedParams = Array.from(urlParams.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join("\n");

        console.log(
            "Data check string:",
            sortedParams.substring(0, 100) + "...",
        );

        // Создаем секретный ключ из bot token
        const encoder = new TextEncoder();

        // Шаг 1: Создаем HMAC ключ из строки "WebAppData"
        const webAppDataKey = await crypto.subtle.importKey(
            "raw",
            encoder.encode("WebAppData"),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"],
        );

        // Шаг 2: Создаем secret key из bot token
        const secretKeyBuffer = await crypto.subtle.sign(
            "HMAC",
            webAppDataKey,
            encoder.encode(botToken),
        );

        // Шаг 3: Импортируем secret key для финальной проверки
        const secretKey = await crypto.subtle.importKey(
            "raw",
            secretKeyBuffer,
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"],
        );

        // Шаг 4: Вычисляем HMAC от данных
        const computedHashBuffer = await crypto.subtle.sign(
            "HMAC",
            secretKey,
            encoder.encode(sortedParams),
        );

        // Конвертируем в hex строку
        const computedHash = Array.from(new Uint8Array(computedHashBuffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

        console.log("Computed hash:", computedHash.substring(0, 20) + "...");
        console.log("Provided hash:", hash.substring(0, 20) + "...");

        return hash === computedHash;
    } catch (error) {
        console.error("Error validating Telegram Web App data:", error);
        return false;
    }
}

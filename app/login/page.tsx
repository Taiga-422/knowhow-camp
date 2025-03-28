"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setError("");

        const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
        });

        if (signInError || !data.session) {
        setError("ログインに失敗しました。メールとパスワードを確認してください。");
        return;
        }

        // ユーザーID取得
        const userId = data.user.id;

        // usersテーブルからロール取得
        const { data: user, error: userFetchError } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

        if (userFetchError || !user) {
        setError("ユーザーのロール情報が取得できませんでした");
        return;
        }

        if (user.role === "company") {
        router.push("/company/home");
        } else {
        router.push("/individual/home");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">ノウハウキャンプへようこそ</h1>

        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-center">ログイン</h2>

            <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 mb-3 w-full rounded"
            />
            <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 mb-4 w-full rounded"
            />

            <button
            onClick={handleLogin}
            className="bg-blue-600 text-white py-2 px-4 rounded w-full hover:bg-blue-700 transition"
            >
            ログイン
            </button>

            {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}

            <button
            onClick={() => router.push("/")}
            className="mt-6 text-sm text-blue-600 hover:underline mx-auto block"
            >
            トップに戻る
            </button>
        </div>
        </div>
    );
}


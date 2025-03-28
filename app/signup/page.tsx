"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SignUpPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleSignUp = async () => {
        if (password !== confirmPassword) {
            setError("パスワードが一致しません");
            return;
        }

        setLoading(true);
        setError("");

        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
            emailRedirectTo: "https://knowhow-camp.vercel.app/setup-profile",
            },
        });

        if (signUpError || !data?.user) {
            setError(signUpError?.message || "サインアップに失敗しました");
            setLoading(false);
            return;
        }

        alert("確認メールを送信しました！メールをご確認のうえ、ログインしてください。");

        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setLoading(false);
    };


    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
            <h1 className="text-2xl font-bold mb-6 text-center">新規登録</h1>

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
            className="border p-2 mb-3 w-full rounded"
            />
            <input
            type="password"
            placeholder="パスワード確認用"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border p-2 mb-3 w-full rounded"
            />

            <button
            onClick={handleSignUp}
            className="bg-blue-600 text-white py-2 px-4 rounded w-full hover:bg-blue-700 transition"
            disabled={loading}
            >
            {loading ? "登録中..." : "サインアップ"}
            </button>

            <button
            onClick={() => router.push("/")}
            className="mt-6 text-sm text-blue-600 hover:underline mx-auto block"
            >
            トップに戻る
            </button>

            {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
        </div>
        </div>
    );
}



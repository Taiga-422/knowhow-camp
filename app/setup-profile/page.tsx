"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SetupProfilePage() {
    const router = useRouter();

    const [authChecked, setAuthChecked] = useState(false);
    const [role, setRole] = useState<"company" | "individual">("company");

    const [name, setName] = useState("");
    const [companyName, setCompanyName] = useState("");

    const [occupation, setOccupation] = useState("");
    const [industry, setIndustry] = useState("");
    const [position, setPosition] = useState("");
    const [interests, setInterests] = useState<string[]>([]);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
        const { data } = await supabase.auth.getSession();
        console.log("session:", data.session);

        const user = data.session?.user;
        if (!user) {
            console.log("セッションなし");
            router.push("/login");
            return;
        }

        if (!user.email_confirmed_at) {
            console.log("メール未認証");
            await supabase.auth.signOut();
            router.push("/login");
            return;
        }

            console.log("認証確認完了");
            setAuthChecked(true);
        };

        checkAuth();
    }, [router]);


    const handleSubmit = async () => {
        setError("");
        setLoading(true);

        const {
        data: { session },
        } = await supabase.auth.getSession();

        const user = session?.user;

        if (!user || !user.email_confirmed_at) {
        setError("ログインセッションが無効です。メール認証を完了してください。");
        setLoading(false);
        return;
        }

        const userId = user.id;

        // users テーブルへ登録
        const { error: userInsertError } = await supabase.from("users").insert({
        id: userId,
        name,
        email: user.email,
        role,
        });

        if (userInsertError) {
        setError("ユーザー登録に失敗しました: " + userInsertError.message);
        setLoading(false);
        return;
        }

        if (role === "company") {
        const { error: companyError } = await supabase.from("companies").insert({
            user_id: userId,
            company_name: companyName,
        });

        if (companyError) {
            setError("企業情報の登録に失敗しました: " + companyError.message);
            setLoading(false);
            return;
        }

        router.push("/company/home");
        } else {
        const { error: individualError } = await supabase.from("individuals").insert({
            user_id: userId,
            occupation,
            industry,
            position,
            interests,
        });

        if (individualError) {
            setError("個人情報の登録に失敗しました: " + individualError.message);
            setLoading(false);
            return;
        }

        router.push("/individual/home");
        }

        setLoading(false);
    };

    if (!authChecked) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-600 text-lg">認証確認中...</p>
        </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <h1 className="text-3xl font-bold mb-6">ノウハウキャンプへようこそ</h1>

        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-xl">
            <h2 className="text-2xl font-bold mb-4 text-center">プロフィール登録</h2>

            {/* タブ切り替え */}
            <div className="flex space-x-4 justify-center mb-4">
            <button
                onClick={() => setRole("company")}
                className={`px-4 py-2 rounded ${
                role === "company" ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
            >
                企業アカウント
            </button>
            <button
                onClick={() => setRole("individual")}
                className={`px-4 py-2 rounded ${
                role === "individual" ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
            >
                個人アカウント
            </button>
            </div>

            {/* 共通：ユーザー名 */}
            <input
            type="text"
            placeholder="ユーザー名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 mb-3 w-full rounded"
            />

            {/* 企業アカウント入力 */}
            {role === "company" && (
            <input
                type="text"
                placeholder="企業名"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="border p-2 mb-3 w-full rounded"
            />
            )}

            {/* 個人アカウント入力 */}
            {role === "individual" && (
            <>
                <select value={occupation} onChange={(e) => setOccupation(e.target.value)} className="border p-2 mb-2 w-full rounded">
                <option value="">職種を選択</option>
                <option value="自営業">自営業</option>
                <option value="フリーランス">フリーランス</option>
                <option value="会社員">会社員</option>
                <option value="学生">学生</option>
                </select>

                <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="border p-2 mb-2 w-full rounded">
                <option value="">業界を選択</option>
                <option value="IT">IT・インターネット・ゲーム</option>
                <option value="メーカー">メーカー</option>
                <option value="流通・小売">流通・小売</option>
                <option value="金融">金融</option>
                <option value="医療">医療</option>
                <option value="広告">広告・出版・マスコミ</option>
                <option value="その他">その他</option>
                </select>

                <select value={position} onChange={(e) => setPosition(e.target.value)} className="border p-2 mb-2 w-full rounded">
                <option value="">役職を選択</option>
                <option value="経営層・役員">経営層・役員</option>
                <option value="部長職">部長職</option>
                <option value="課長職">課長職</option>
                <option value="一般">一般</option>
                <option value="学生">学生</option>
                </select>

                <label className="block font-bold mb-1 mt-2">興味のあるカテゴリ</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-scroll border p-2 rounded mb-2">
                {[
                    "DX", "生成AI・AI活用", "WEB3.0", "セキュリティ", "マーケティング・MA",
                    "組織・人事・採用", "経理・会計・財務", "法務・労務・総務", "営業・SFA",
                    "生産・販売管理", "PM・PMO", "M&A・PMI", "経営企画", "スタートアップ", "ビジネスコアスキル"
                ].map((interest) => (
                    <label key={interest} className="flex items-center">
                    <input
                        type="checkbox"
                        value={interest}
                        checked={interests.includes(interest)}
                        onChange={(e) => {
                        const value = e.target.value;
                        if (e.target.checked) {
                            setInterests([...interests, value]);
                        } else {
                            setInterests(interests.filter((i) => i !== value));
                        }
                        }}
                        className="mr-2"
                    />
                    {interest}
                    </label>
                ))}
                </div>
            </>
            )}

            <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white py-2 px-4 rounded w-full hover:bg-blue-700 transition"
            disabled={loading}
            >
            {loading ? "登録中..." : "登録する"}
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

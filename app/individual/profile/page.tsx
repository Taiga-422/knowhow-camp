"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';
import Header from "@/app/components/Header";

export default function IndividualProfileEdit() {
    const [occupation, setOccupation] = useState("");
    const [industry, setIndustry] = useState("");
    const [position, setPosition] = useState("");
    const [interests, setInterests] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData.user?.id;
        if (!userId) return;

        const { data: profile } = await supabase
            .from("individuals")
            .select("occupation, industry, position, interests")
            .eq("user_id", userId)
            .single();

        if (profile) {
            setOccupation(profile.occupation || "");
            setIndustry(profile.industry || "");
            setPosition(profile.position || "");
            setInterests(profile.interests || []);
        }
        };

        fetchProfile();
    }, []);

    const handleUpdate = async () => {
        setLoading(true);
        setMessage("");

        const { data: authData } = await supabase.auth.getUser();
        const userId = authData.user?.id;
        if (!userId) return;

        const { error } = await supabase
            .from("individuals")
            .upsert(
                {
                user_id: userId,
                occupation,
                industry,
                position,
                interests,
                },
            { onConflict: "user_id" }
            );

        if (error) {
            console.error("Supabaseエラー:", error.message ?? error);
            setMessage("更新に失敗しました");
        } else {
            setMessage("プロフィールを更新しました！");
        }

        setLoading(false);
        };

        const router = useRouter();

    return (
        <>
        <Header />
        <div className="max-w-xl mx-auto p-4">
        <h1 className="text-xl font-bold mb-4">プロフィール編集（個人）</h1>

        <label>職種</label>
        <select value={occupation} onChange={(e) => setOccupation(e.target.value)} className="border p-2 my-2 w-full">
            <option value="">職種を選択</option>
            <option value="自営業">自営業</option>
            <option value="フリーランス">フリーランス</option>
            <option value="会社員">会社員</option>
            <option value="学生">学生</option>
        </select>

        <label>業界</label>
        <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="border p-2 my-2 w-full">
            <option value="">業界を選択</option>
            <option value="IT">IT・インターネット・ゲーム</option>
            <option value="メーカー">メーカー</option>
            <option value="流通・小売">流通・小売</option>
            <option value="コンサルティング・シンクタンク">コンサルティング・シンクタンク</option>
            <option value="商社">商社</option>
            <option value="建設・住宅・不動産">建設・住宅・不動産</option>
            <option value="医療">医療</option>
            <option value="金融">金融</option>
            <option value="広告・出版・マスコミ">広告・出版・マスコミ</option>
            <option value="インフラ・教育・官公庁">インフラ・教育・官公庁</option>
            <option value="その他">その他</option>
        </select>

        <label>役職</label>
        <select value={position} onChange={(e) => setPosition(e.target.value)} className="border p-2 my-2 w-full">
            <option value="">役職を選択</option>
            <option value="経営層・役員">経営層・役員</option>
            <option value="部長職">部長職</option>
            <option value="課長職">課長職</option>
            <option value="一般">一般</option>
            <option value="学生">大学・専門学校在学中</option>
        </select>

        <label>興味のあるカテゴリ（複数選択可）</label>
        <div className="my-4">
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-scroll border p-2">
                        {[
                        "DX",
                        "生成AI・AI活用",
                        "WEB3.0",
                        "セキュリティ",
                        "マーケティング・MA",
                        "組織・人事・採用",
                        "経理・会計・財務",
                        "法務・労務・総務",
                        "営業・SFA",
                        "生産・販売管理",
                        "PM・PMO",
                        "M&A・PMI",
                        "経営企画",
                        "スタートアップ",
                        "ビジネスコアスキル",
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
                </div>

        <button
            onClick={handleUpdate}
            className="bg-blue-500 text-white p-2 rounded mt-4"
            disabled={loading}
        >
            {loading ? "更新中..." : "更新する"}
        </button>

        <button
            onClick={() => router.push("/individual/home")}
            className="bg-gray-500 text-white p-2 rounded mt-4"
        >
            ホームへ
        </button>

        {message && <p className="text-green-600 mt-2">{message}</p>}
        </div>
        </>

    );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CheckProfilePage() {
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
        //セッションを取得する
        const {
            data: { session },
        } = await supabase.auth.getSession();

        const user = session?.user;

        if (!user) {
            router.push("/login");
            return;
        }

        //メール確認済みかチェックする
        if (!user.email_confirmed_at) {
            alert("メール確認が完了していません。メールを確認してください。");
            await supabase.auth.signOut();
            router.push("/login");
            return;
        }

        const userId = user.id;

        //usersテーブルに登録されているか確認する
        const { data: userData, error } = await supabase
            .from("users")
            .select("role")
            .eq("id", userId)
            .single();

        if (error || !userData) {
            //未登録の場合は、初回ログインと判断しプロフィール入力へ移動する
            router.push("/setup-profile");
            return;
        }

        //登録されている場合は、ロールに応じてリダイレクト
        if (userData.role === "company") {
            router.push("/company/home");
        } else {
            router.push("/individual/home");
        }
        };
        
        checkUser().finally(() => {
            // 最後に checking を false に
            setChecking(false);
        });
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            {checking ? (
                <p className="text-gray-600 text-lg">プロフィール確認中...</p>
            ) : (
                <p className="text-gray-400 text-sm">リダイレクトに失敗しました。再読み込みしてください。</p>
            )}
        </div>
    );
}


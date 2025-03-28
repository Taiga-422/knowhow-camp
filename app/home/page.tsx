"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
const [user, setUser] = useState<any>(null);
const router = useRouter();

useEffect(() => {
        const fetchUser = async () => {
        const { data, error } = await supabase.auth.getUser();
        if (data?.user) {
            setUser(data.user);
        } else {
            router.push("/login");
        }
    };

    fetchUser();
}, []);

return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold">ホーム画面</h1>
        {user ? <p>ログイン中: {user.email}</p> : <p>ログインしてください</p>}
        <button
        onClick={async () => {
            await supabase.auth.signOut();
            router.push("/login");
        }}
        className="bg-red-500 text-white p-2 rounded hover:bg-black-500"
    >
        ログアウト
    </button>
    </div>
    );
}

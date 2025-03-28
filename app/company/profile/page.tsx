"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/app/components/Header";

export default function CompanyProfileEdit() {
    const [companyName, setCompanyName] = useState('');
    const [website, setWebsite] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData.user?.id;
        if (!userId) return;

        const { data: companyData } = await supabase
        .from("companies")
        .select("company_name, website, description") 
        .eq("user_id", userId)
        .single();

        if (companyData) {
        setCompanyName(companyData.company_name || '');
        setWebsite(companyData.website || '');
        setDescription(companyData.description || '');
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

        const { data: existingCompany } = await supabase
        .from("companies")
        .select("id")
        .eq("user_id", userId)
        .single();
    
        let error = null;
    
        if (existingCompany) {
        // レコードがある → update
        const { error: updateError } = await supabase
            .from("companies")
            .update({
                company_name: companyName,
                website,
                description,
            })
            .eq("user_id", userId);
        
            error = updateError;
        } else {
            // レコードがない → insert
            const { error: insertError } = await supabase
            .from("companies")
            .insert({
                user_id: userId,
                company_name: companyName,
                website,
                description,
            });
        
            error = insertError;
        }

        if (error) {
        setMessage("更新に失敗しました");
        } else {
        setMessage("更新しました！");
        }

        setLoading(false);
    };

    return (
        <>
        <Header />
        <div className="max-w-xl mx-auto p-4">
        <h1 className="text-xl font-bold mb-4">企業プロフィール編集</h1>

        <input
            type="text"
            placeholder="企業名"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="border p-2 w-full mb-2"
        />
        
        <input
            type="text"
            placeholder="WebサイトURL"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="border p-2 w-full mb-2"
        />
        <textarea
            placeholder="企業概要"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 w-full h-32 mb-2"
        />

        <button
            onClick={handleUpdate}
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={loading}
        >
            {loading ? "更新中..." : "更新する"}
        </button>

        {message && <p className="mt-2 text-green-600">{message}</p>}
        </div>
        
        </>
    );
}

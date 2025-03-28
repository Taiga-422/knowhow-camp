"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/app/components/Header";
import VideoCardGrid from '@/app/components/VideoCardGrid';
import SearchIcon from '@mui/icons-material/Search';

export default function CompanyHome() {
    const [userName, setUserName] = useState("");
    const [role, setRole] = useState("");
    const [interestVideos, setInterestVideos] = useState<Webinar[]>([]);
    const [likedVideos, setLikedVideos] = useState<Webinar[]>([]);
    const [viewedVideos, setViewedVideos] = useState<Webinar[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Webinar[]>([]);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);

    type Webinar = {
        id: string;
        title: string;
        thumbnail_url: string | null;
        interests: string[];
        company_name?: string;
        views?: { id: string }[];
        likes?: { id: string }[];
    };

    type Props = {
        videos: Webinar[];
    };


    useEffect(() => {
        const fetchAll = async () => {
            const { data: auth } = await supabase.auth.getUser();
            const userId = auth.user?.id;
            if (!userId) return;
        
            // ユーザー情報
            const { data: user } = await supabase
                .from("users")
                .select("name, role")
                .eq("id", userId)
                .single();
            if (user) {
                setUserName(user.name);
                setRole(user.role);
            }
            // 検索履歴を読み込む
            const history = localStorage.getItem("searchHistory");
            if (history) {
                setSearchHistory(JSON.parse(history));
            }
        
            // interests取得
            const { data: profile } = await supabase
                .from("individuals")
                .select("interests")
                .eq("user_id", userId)
                .single();
            const userInterests = profile?.interests || [];
        
            // 1. 興味のあるカテゴリに一致する動画
            const { data: interestVids } = await supabase
                .from("webinars")
                .select(`
                    *,
                    views(id),
                    likes(id)
                    `)
                .overlaps("interests", userInterests);
            setInterestVideos(interestVids || []);
        
            // 2. いいねした動画
            const { data: likes } = await supabase
                .from("likes")
                .select("webinar_id")
                .eq("user_id", userId);
            const likedIds = likes?.map((l) => l.webinar_id) || [];
        
            const { data: likedVids } = await supabase
                .from("webinars")
                .select(`
                    *,
                    views(id),
                    likes(id)
                    `)
                .in("id", likedIds);
            setLikedVideos(likedVids || []);
        
            // 3. 視聴済みの動画
            const { data: views } = await supabase
                .from("views")
                .select("webinar_id")
                .eq("user_id", userId);
            const viewedIds = views?.map((v) => v.webinar_id) || [];
        
            const { data: viewedVids } = await supabase
                .from("webinars")
                .select(`
                    *,
                    views(id),
                    likes(id)
                    `)
                .in("id", viewedIds);
            setViewedVideos(viewedVids || []);
            };
        
            fetchAll();
        }, []);

        const handleSearch = async () => {
            if (!searchQuery.trim()) return; // 空検索を無視させる

            const { data, error } = await supabase
                .from('webinars')
                .select('*')
                .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);

            if (!error) {
                setSearchResults(data || []);
            }

            // 重複を除外して、最大5件まで表示させる
            const updatedHistory = [
                searchQuery,
                ...searchHistory.filter((q) => q !== searchQuery),
            ].slice(0, 5);

            setSearchHistory(updatedHistory);
            localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
        };

        const removeHistoryItem = (keywordToRemove: string) => {
            const updated = searchHistory.filter((kw) => kw !== keywordToRemove);
            setSearchHistory(updated);
            localStorage.setItem("searchHistory", JSON.stringify(updated));
        };

        const clearSearchHistory = () => {
            setSearchHistory([]);
            localStorage.removeItem("searchHistory");
        };

    return (
        <>
            <Header />
            <div className="flex items-center justify-center mt-4">
                <div className="flex items-center w-full max-w-xl border border-gray-300 rounded-full px-4 py-2 shadow-sm">
                        <input
                        type="text"
                        placeholder="検索"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="flex-grow outline-none text-gray-800 placeholder-gray-400"
                        />
                        <button
                        onClick={handleSearch}
                        disabled={!searchQuery.trim()}
                        className="text-gray-600 hover:text-gray-800 disabled:opacity-30"
                        >
                        <SearchIcon />
                        </button>
                </div>
            </div>

            {searchHistory.length > 0 && (
            <div className="mt-4 px-4 text-sm text-gray-600">
                <div className="flex justify-between items-center mb-2">
                <p className="font-medium">最近の検索:</p>
                <button
                    onClick={clearSearchHistory}
                    className="text-xs text-red-500 hover:underline"
                >
                    履歴をクリア
                </button>
                </div>
                <div className="flex flex-wrap gap-2">
                {searchHistory.map((keyword, index) => (
                    <div
                    key={index}
                    className="flex items-center bg-gray-200 rounded-full px-3 py-1"
                    >
                    <button
                        onClick={() => {
                        setSearchQuery(keyword);
                        handleSearch();
                        }}
                        className="mr-2"
                    >
                        {keyword}
                    </button>
                    <button
                        onClick={() => removeHistoryItem(keyword)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ×
                    </button>
                    </div>
                ))}
                </div>
            </div>
            )}

            {searchQuery && searchResults.length > 0 ? (
            <>
                <h2 className="text-2xl font-semibold mt-10 mb-4 px-4">
                    「{searchQuery}」の検索結果
                </h2>
                <VideoCardGrid videos={searchResults} />
            </>
                ) : searchQuery && searchResults.length === 0 ? (
                    <p className="text-center text-gray-500 mt-10">該当する動画が見つかりませんでした。</p>
                ) : (
            <>
                <h2 className="text-2xl font-semibold mt-10 mb-4 px-4">興味があるカテゴリの動画</h2>
                <VideoCardGrid videos={interestVideos} />

                <h2 className="text-2xl font-semibold mt-10 mb-4 px-4">いいねした動画</h2>
                <VideoCardGrid videos={likedVideos} />

                <h2 className="text-2xl font-semibold mt-10 mb-4 px-4">視聴中コンテンツ</h2>
                <VideoCardGrid videos={viewedVideos} />
            </>
        )}
        </>

    );
}

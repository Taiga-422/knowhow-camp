'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/app/components/Header';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';

type Webinar = {
    id: string;
    title: string;
    thumbnail_url: string | null;
    interests: string[];
    user_id: string;
    company_name?: string;
    users?: {
        companies?: {
        company_name?: string;
        };
    };
    views?: { id: string }[];
    likes?: { id: string }[];
};

    export default function CompanyHome() {
    const [webinars, setWebinars] = useState<Webinar[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchWebinars = async () => {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();
    
            if (userError || !user) {
                console.error('ユーザー取得エラー:', userError);
                return;
            }
    
            const { data, error } = await supabase
                .from('webinars')
                .select(`
                    id,
                    title,
                    thumbnail_url,
                    interests,
                    user_id,
                    users:user_id (
                        companies (
                            company_name
                        )
                    ),
                    views(id),
                    likes(id)
                `)
                .eq('user_id', user.id); // ログインしているユーザーの投稿のみが表示される
    
            if (error) {
                console.error('取得エラー:', error);
                return;
            }
    
            const formatted = data.map((w: any) => ({
                ...w,
                company_name: w.users?.companies[0]?.company_name || '無名企業',
            }));
            setWebinars(formatted);
        };
    
        fetchWebinars();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">投稿済みウェビナー</h1>
            <button
                onClick={() => router.push('/company/webinars')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
                ＋ ウェビナー投稿
            </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {webinars.map((webinar) => {
                console.log('thumbnail_url:', webinar.thumbnail_url);
                return (
                    <div
                        key={webinar.id}
                        className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
                        onClick={() => router.push(`/company/webinars/${webinar.id}`)}
                    >
                        <img
                        src={
                            webinar.thumbnail_url
                            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${webinar.thumbnail_url}`
                            : '/default-thumbnail.jpg'
                        }
                        alt={webinar.title}
                        className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                            <h2 className="text-lg font-bold mb-1">{webinar.title}</h2>
                            <p className="text-sm text-gray-600 mb-2">
                                {webinar.company_name}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {webinar.interests?.map((tag) => (
                                <span
                                    key={tag}
                                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                                >
                                    {tag}
                                </span>
                                ))}
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-2 gap-4">
                                <div className="flex items-center">
                                    <VisibilityIcon className="mr-1" fontSize="small" />
                                    {webinar.views?.length ?? 0} 回閲覧
                                </div>
                                <div className="flex items-center">
                                    <ThumbUpOutlinedIcon className="mr-1" fontSize="small" />
                                    {webinar.likes?.length ?? 0}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
            </div>
        </main>
        </div>
    );
}

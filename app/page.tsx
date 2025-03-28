'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LandingPage() {
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  useEffect(() => {
    const fetchThumbnails = async () => {
      const { data, error } = await supabase
        .from('webinars')
        .select('thumbnail_url')
        .not('thumbnail_url', 'is', null);

      if (error) {
        console.error('サムネイル取得エラー:', error);
        return;
      }

      const urls = data.map((w: any) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${w.thumbnail_url}`);
      setThumbnails([...urls, ...urls]); // 無限ループっぽく繰り返す
    };

    fetchThumbnails();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">ノウハウキャンプ</h1>
        <div className="space-x-4">
          <Link href="/signup">
            <button className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100">新規登録</button>
          </Link>
          <Link href="/login">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">ログイン</button>
          </Link>
        </div>
      </header>

      {/* スライダー */}
      <section className="overflow-hidden py-12 bg-gray-50">
        <div className="flex w-max animate-scroll">
          {thumbnails.map((src, idx) => (
            <Image
              key={idx}
              src={src}
              alt={`動画${idx}`}
              width={400}
              height={300}
              className="inline-block mx-2 rounded shadow"
            />
          ))}
        </div>
      </section>

      <style jsx>{`
        .animate-scroll {
          animation: scroll-left 40s linear infinite;
        }

        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
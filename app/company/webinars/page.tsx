'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/app/components/Header';

export default function WebinarUploadPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const interestsList = [
        'DX', '生成AI・AI活用', 'WEB3.0', 'セキュリティ', 'マーケティング・MA',
        '組織・人事・採用', '経理・会計・財務', '法務・労務・総務', '営業・SFA',
        '生産・販売管理', 'PM・PMO', 'M&A・PMI', '経営企画', 'スタートアップ', 'ビジネスコアスキル',
    ];

    const router = useRouter();

    const handleUpload = async () => {
        if (!title || !description || !videoFile) {
        setMessage('必須項目を入力してください');
        return;
        }

        if (!videoFile) {
            setMessage("動画ファイルが選択されていません");
            return;
        }

        setLoading(true);
        setMessage('');

        const { data: authData } = await supabase.auth.getUser();
        const user = authData.user;
        if (!user) {
        setMessage('ログインが必要です');
        setLoading(false);
        return;
        }

        // Storageへファイルアップロード（動画）
        // 拡張子を取得し、ファイル名に付与する
        const videoExt = videoFile.name.split('.').pop(); // 例: mp4
        const videoName = `video-${Date.now()}.${videoExt}`;

        const { data: videoData, error: videoError } = await supabase.storage
        .from('videos')
        .upload(videoName, videoFile, {
            contentType: videoFile.type,
            upsert: false,
        });

        if (videoError) {
        setMessage('動画のアップロードに失敗しました');
        setLoading(false);
        return;
        }

        // サムネと資料は任意
        let thumbnailPath = null;
        if (thumbnailFile) {
            const thumbExt = thumbnailFile.name.split('.').pop(); // 拡張子取得
            const thumbName = `thumb-${Date.now()}.${thumbExt}`;

            const { data, error } = await supabase.storage
                .from('thumbnails')
                .upload(thumbName, thumbnailFile, {
                contentType: thumbnailFile.type,
            });

            if (!error) {
              thumbnailPath = `thumbnails/${data?.path}`; // パスにフォルダ名を明示
            }
        }

        let documentPath = null;
        if (documentFile) {
        const { data, error } = await supabase.storage
            .from('documents')
            .upload(`doc-${Date.now()}`, documentFile);
        if (!error) documentPath = data?.path;
        }

        const { error: insertError } = await supabase.from('webinars').insert([
        {
            user_id: user.id,
            title,
            description,
            video_url: videoData.path,
            thumbnail_url: thumbnailPath,
            document_url: documentPath,
            interests: selectedInterests,
        },
        ]);

        if (insertError) {
        setMessage('投稿に失敗しました');
        } else {
        setMessage('動画を投稿しました！');
        setTitle('');
        setDescription('');
        setVideoFile(null);
        setThumbnailFile(null);
        setDocumentFile(null);
        setSelectedInterests([]);
        }

        setLoading(false);
    };

    return (
        <>
        <Header/>
        <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">ウェビナー動画投稿</h1>

        <label>動画タイトル*</label>
        <input
            className="border p-2 w-full my-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
        />

        <label>動画紹介文*</label>
        <textarea
            className="border p-2 w-full my-2"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
        />

        <label>動画ファイル（必須）</label>
        <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />

        <label className="mt-4 block">サムネイル画像（任意）</label>
        <input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} />

        <label className="mt-4 block">資料（PDF, PPT）（任意）</label>
        <input type="file" accept=".pdf,.ppt,.pptx" onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} />

        <label className="mt-4 block font-semibold">関連するカテゴリ（複数選択）</label>
        <div className="grid grid-cols-2 gap-2 my-2">
            {interestsList.map((interest) => (
            <label key={interest} className="flex items-center">
                <input
                type="checkbox"
                value={interest}
                checked={selectedInterests.includes(interest)}
                onChange={(e) => {
                    const value = e.target.value;
                    if (e.target.checked) {
                    setSelectedInterests([...selectedInterests, value]);
                    } else {
                    setSelectedInterests(selectedInterests.filter((i) => i !== value));
                    }
                }}
                className="mr-2"
                />
                {interest}
            </label>
            ))}
        </div>

            <button
                onClick={handleUpload}
                className="mt-4 bg-blue-500 text-white p-2 rounded"
                disabled={loading}
            >
                {loading ? 'アップロード中...' : '投稿する'}
            </button>

        {message && <p className="mt-2 text-green-500">{message}</p>}
        </div>
        </>

    );
}

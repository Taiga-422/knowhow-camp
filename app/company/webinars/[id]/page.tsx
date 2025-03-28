'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/app/components/Header';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import { useRouter } from "next/navigation";

export default function WebinarDetail() {

    const router = useRouter();

    const params = useParams();
    const id = params.id as string;
    const [webinar, setWebinar] = useState<any>(null);
    const [viewCount, setViewCount] = useState<number>(0);
    const [liked, setLiked] = useState<boolean>(false);
    const [likeCount, setLikeCount] = useState<number>(0);
    const [commentInput, setCommentInput] = useState("");
    const [comments, setComments] = useState<Comment[]>([]);
    const [editing, setEditing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");

    type Webinar = {
        id: string;
        title: string;
        description?: string;
        video_url?: string;
        document_url?: string;
        thumbnail_url?: string;
        interests: string[];
        user_id: string;
        company_name?: string;
        created_at?: string;
    };

    // 型定義（必要に応じて上部で定義）
    type Comment = {
    id: string;
    webinar_id: string;
    user_id: string;
    user_name: string;
    comment: string;
    created_at: string;
    updated_at?: string;
    };

    useEffect(() => {
        const fetchData = async () => {
        const { data, error } = await supabase
            .from("webinars")
            .select("*")
            .eq("id", id)
            .single();

            if (!error && data) {
                setWebinar(data);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: authData } = await supabase.auth.getUser();
            setCurrentUserId(authData.user?.id || null);
        };
        fetchUser();
    }, []);    

      //webinarがセットされたタイミングでfetchComments実行
    useEffect(() => {
        if (webinar?.id) {
            fetchComments();
            addViewCount(webinar.id);
            fetchViewCount(webinar.id);
            fetchLikes(webinar.id);
        }
    }, [webinar]);

    const handleUpdate = async () => {
        const { error } = await supabase
            .from("webinars")
            .update({
                title: editTitle,
                description: editDescription,
            })
            .eq("id", webinar.id);
    
        if (!error) {
            setWebinar({
                ...webinar,
                title: editTitle,
                description: editDescription,
            });
            setEditing(false);
            alert("保存が完了しました！");
        } else {
            alert("更新に失敗しました");
        }
    };

    // 閲覧数をviewsテーブルへ追加する
    const addViewCount = async (webinarId: string) => {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData.user?.id;
        if (!userId) return;

        const { data: existing } = await supabase
        .from('views')
        .select('id')
        .eq('webinar_id', webinarId)
        .eq('user_id', userId);

        if (!existing || existing.length === 0) {
        await supabase.from('views').insert([
            {
            webinar_id: webinarId,
            user_id: userId,
            viewed_at: new Date().toISOString(),
            },
        ]);
        }
    };

    const handleDelete = async () => {
        const confirm = window.confirm("本当にこのウェビナーを削除しますか？");
        if (!confirm) return;
    
        const { error } = await supabase
            .from("webinars")
            .delete()
            .eq("id", webinar.id)
            .eq("user_id", currentUserId); // 自分の投稿のみ削除可能に
    
        if (error) {
            alert("削除に失敗しました: " + error.message);
        } else {
            alert("削除しました！");
            router.push("/company/home"); // ホームなど別の画面に遷移
        }
    };
    

    // 閲覧数をviewsテーブルから取得する
    const fetchViewCount = async (webinarId: string) => {
        const { count } = await supabase
        .from('views')
        .select('*', { count: 'exact', head: true })
        .eq('webinar_id', webinarId);

        if (typeof count === 'number') setViewCount(count);
    };

    // いいね情報をlikesテーブルから取得する
    const fetchLikes = async (webinarId: string) => {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData.user?.id;

        const { data: likes } = await supabase
        .from('likes')
        .select('*')
        .eq('webinar_id', webinarId);

        setLikeCount(likes?.length || 0);
        setLiked(Array.isArray(likes) && likes.some((like) => like.user_id === userId));
    };

    // いいねトグル
    const toggleLike = async () => {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData.user?.id;
        if (!userId) return;

        if (liked) {
        await supabase
            .from('likes')
            .delete()
            .eq('user_id', userId)
            .eq('webinar_id', id);
        setLikeCount((prev) => prev - 1);
        setLiked(false);
        } else {
        await supabase.from('likes').insert([
            {
            user_id: userId,
            webinar_id: id,
            liked_at: new Date().toISOString(),
            },
        ]);
        setLikeCount((prev) => prev + 1);
        setLiked(true);
        }
    };

    if (!webinar) return <p>読み込み中...</p>;

    const handleCommentSubmit = async () => {
        if (!commentInput.trim()) return;

        const { data: auth } = await supabase.auth.getUser();
        const userId = auth.user?.id;
        if (!userId) return;

        const { data: userProfile } = await supabase
            .from("users")
            .select("name")
            .eq("id", userId)
            .single();

        const userName = userProfile?.name || "匿名";

        const { error } = await supabase.from("comments").insert({
            webinar_id: webinar.id,       // ※今表示中の動画のID
            user_id: userId,
            user_name: userName,
            comment: commentInput.trim(),
        });

        if (!error) {
            setCommentInput("");
            fetchComments(); // 最新一覧を再取得
        }
    };

    const fetchComments = async () => {
        const { data } = await supabase
            .from("comments")
            .select("*")
            .eq("webinar_id", webinar.id)
            .order("created_at", { ascending: false });
        
            if (data) setComments(data);
        };

    return (
        <>
        <Header />
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-4">
                {webinar.title}
                {webinar.user_id === currentUserId && (
                    <div className="flex gap-2">
                        <button
                        onClick={() => {
                            setEditing(true);
                            setEditTitle(webinar.title);
                            setEditDescription(webinar.description || "");
                        }}
                        className="text-sm bg-gray-200 text-gray-800 px-2 py-1 rounded hover:bg-gray-300"
                        >
                        編集
                        </button>

                        <button
                        onClick={handleDelete}
                        className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                        >
                        削除
                        </button>
                    </div>
                )}
            </h1>

            {editing && (
            <div className="mb-4 border p-4 rounded bg-gray-50">
                {/* タイトル編集 */}
                    <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="タイトル"
                    className="border w-full mb-2 p-2 rounded"
                />

                {/* 説明文編集 */}
                <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="説明"
                    className="border w-full mb-2 p-2 rounded"
                />

                {/* 保存 / キャンセルボタン */}
                <div className="flex gap-2">
                    <button
                        onClick={handleUpdate}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        保存
                    </button>
                    <button
                        onClick={() => setEditing(false)}
                        className="text-gray-500 underline"
                    >
                        キャンセル
                    </button>
                </div>
            </div>
            )}

            <div className="flex items-center text-sm text-gray-600 mb-4 gap-4">
                <span className="flex items-center">
                    <VisibilityIcon className="mr-1" fontSize="small" />
                    {viewCount} 回閲覧
                </span>
                <button onClick={toggleLike} className="flex items-center gap-1">
                    {liked ? <ThumbUpIcon color="primary" /> : <ThumbUpOutlinedIcon />}
                    <span>{likeCount}</span>
                </button>
            </div>

            <video controls className="w-full rounded mb-4">
                <source
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/videos/${webinar.video_url}`}
                    type="video/mp4"
                />
                お使いのブラウザは、サポートしていません。
            </video>

            <p className="mb-4">{webinar.description}</p>

            <div className="flex flex-wrap gap-2">
                {webinar.interests?.map((tag: string) => (
                    <span
                    key={tag}
                    className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded-full"
                    >
                    {tag}
                    </span>
                ))}
            </div>
            <div className="max-w-3xl mx-auto my-8 px-4">
            <h3 className="text-lg font-semibold mb-4">コメント</h3>

            {/* 入力エリア */}
            <div className="flex gap-2 mb-4">
                <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="コメントを入力..."
                className="flex-grow border border-gray-300 rounded px-3 py-2"
                />
                <button
                onClick={handleCommentSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                投稿
                </button>
            </div>

            {/* コメント一覧 */}
            {comments.length === 0 ? (
                <p className="text-sm text-gray-500">コメントはまだありません。</p>
            ) : (
                <div className="space-y-4">
                {comments.map((c) => (
                    <div key={c.id} className="border-b pb-2">
                    <p className="text-sm text-gray-800">
                        <span className="font-bold mr-2">{c.user_name}</span>
                        {c.comment}
                    </p>
                    <p className="text-xs text-gray-500">
                        {new Date(c.created_at).toLocaleString()}
                    </p>
                    </div>
                ))}
                </div>
            )}
            </div>
        </div>
        </>
    );
}

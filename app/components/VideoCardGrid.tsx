'use client';

import { useRouter } from "next/navigation";
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';

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

const VideoCardGrid: React.FC<Props> = ({ videos }) => {
    const router = useRouter();

    return (
        <div className= "px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                    <div
                    key={video.id}
                    onClick={() => router.push(`/company/webinars/${video.id}`)}
                    className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer"
                    >
                        <div className= "w-full h-[200px]">
                            <img
                                src={
                                video.thumbnail_url
                                    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${video.thumbnail_url}`
                                    : '/default-thumbnail.jpg'
                                }
                                alt={video.title}
                                className="w-full h-48 object-cover"
                            />
                        </div>
                        <div className="p-4">
                            <h2 className="text-lg font-bold mb-1">{video.title}</h2>
                            <p className="text-sm text-gray-600 mb-2">{video.company_name || '無名企業'}</p>
                            <div className="flex flex-wrap gap-2">
                            {video.interests?.map((tag) => (
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
                                    {video.views?.length ?? 0} 回閲覧
                                </div>
                                <div className="flex items-center">
                                    <ThumbUpOutlinedIcon className="mr-1" fontSize="small" />
                                    {video.likes?.length ?? 0}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default VideoCardGrid;

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js'; 

const Header = () => {
    const [user, setUser] = useState<User | null>(null); 
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setUser(user);

            const { data: userInfo } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            if (!userInfo) return;

            setUserRole(userInfo.role); 

            if (userInfo.role === 'company') {
                const { data: company } = await supabase
                    .from('companies')
                    .select('company_name')
                    .eq('user_id', user.id)
                    .single();
                if (company) setUserName(company.company_name);
            } else if (userInfo.role === 'individual') {
                const { data: individual } = await supabase
                    .from('individuals')
                    .select('full_name')
                    .eq('user_id', user.id)
                    .single();
                if (individual) setUserName(individual.full_name);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const toggleMenu = () => {
        setMenuOpen((prev) => !prev);
    };

    useEffect(() => {
        const menuRef = useRef<HTMLDivElement | null>(null);
        const handleClickOutside = (event: MouseEvent) => {
            const menuElement = menuRef.current;
    
            if (
                menuElement &&
                menuElement instanceof HTMLElement &&
                !menuElement.contains(event.target as Node)
            ) {
                setMenuOpen(false);
            }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    
    

    const handleEditProfile = () => {
        if (userRole === 'company') {
            router.push('/company/profile');
        } else if (userRole === 'individual') {
            router.push('/individual/profile');
        } else {
            console.warn('ユーザーのroleが不明です');
        }
    };

    return (
        <header className="p-4 bg-gray-800 text-white flex justify-between items-center relative">
        <h1
        className="text-xl font-bold cursor-pointer"
        onClick={() => {
            if (userRole === 'company') {
            router.push('/company/home');
            } else if (userRole === 'individual') {
            router.push('/individual/home');
            } else {
            console.warn('ユーザーロールが未定義です');
            }
        }}
        >
        ノウハウキャンプ
        </h1>

            {user && (
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={toggleMenu}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                    >
                        {userName || user.email}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"
                            viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-10">
                            <button
                                onClick={handleEditProfile}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                                プロフィール修正
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                                ログアウト
                            </button>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;

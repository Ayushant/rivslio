'use client';

import { useState } from 'react';
import { likesApi, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

interface Props {
  blogId: string;
  initialCount: number;
  initialLiked?: boolean;
}

export default function LikeButton({ blogId, initialCount, initialLiked = false }: Props) {
  const { user, token } = useAuth();
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Optimistic update
    const wasLiked = liked;
    const prevCount = count;
    setLiked(!wasLiked);
    setCount(wasLiked ? count - 1 : count + 1);
    setPending(true);

    try {
      const fn = wasLiked ? likesApi.unlike : likesApi.like;
      const result = await fn(blogId, token!);
      setCount(result.likeCount);
    } catch (err) {
      // Rollback on error
      setLiked(wasLiked);
      setCount(prevCount);
      if (err instanceof ApiError && err.status === 409) {
        setLiked(true);
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        liked
          ? 'bg-red-50 text-red-600 border border-red-200'
          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
      } disabled:opacity-50`}
    >
      <span>{liked ? '♥' : '♡'}</span>
      <span>{count}</span>
    </button>
  );
}

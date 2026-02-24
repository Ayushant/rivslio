'use client';

import { useEffect, useState, useCallback } from 'react';
import { publicApi, ApiError, type FeedResponse } from '@/lib/api';
import BlogCard from '@/components/BlogCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import Pagination from '@/components/Pagination';

export default function FeedPage() {
  const [feedData, setFeedData] = useState<FeedResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFeed = useCallback(async (p: number) => {
    setLoading(true);
    setError('');
    try {
      const data = await publicApi.getFeed(p, 10);
      setFeedData(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed(page);
  }, [page, fetchFeed]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Public Feed</h1>

      {loading ? (
        <LoadingSpinner>Loading posts…</LoadingSpinner>
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : !feedData || feedData.data.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-1">Nothing here yet</p>
          <p className="text-sm">Be the first to publish a post.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {feedData.data.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>

          <Pagination
            page={feedData.page}
            totalPages={feedData.totalPages}
            onChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}

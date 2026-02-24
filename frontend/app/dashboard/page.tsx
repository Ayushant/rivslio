'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { blogsApi, ApiError, type Blog } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import BlogCard from '@/components/BlogCard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBlogs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await blogsApi.getAll(token);
      setBlogs(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog?')) return;
    try {
      await blogsApi.remove(id, token!);
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert('Failed to delete');
    }
  };

  const handleTogglePublish = async (blog: Blog) => {
    try {
      const updated = await blogsApi.update(
        blog.id,
        { isPublished: !blog.isPublished },
        token!,
      );
      setBlogs((prev) => prev.map((b) => (b.id === blog.id ? updated : b)));
    } catch {
      alert('Failed to update');
    }
  };

  if (loading) return <LoadingSpinner>Loading your blogs…</LoadingSpinner>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Your Blogs</h1>
          <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
        </div>
        <Link
          href="/dashboard/new"
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700"
        >
          + New Blog
        </Link>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {blogs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-2">No blogs yet</p>
          <p className="text-sm">
            <Link href="/dashboard/new" className="underline">
              Write your first post
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {blogs.map((blog) => (
            <BlogCard
              key={blog.id}
              blog={blog}
              showControls
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
            />
          ))}
        </div>
      )}
    </div>
  );
}

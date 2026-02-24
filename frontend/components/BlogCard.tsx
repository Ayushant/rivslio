import Link from 'next/link';
import type { Blog } from '@/lib/api';

interface Props {
  blog: Blog;
  showControls?: boolean;
  onDelete?: (id: string) => void;
  onTogglePublish?: (blog: Blog) => void;
}

export default function BlogCard({
  blog,
  showControls = false,
  onDelete,
  onTogglePublish,
}: Props) {
  return (
    <article className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link href={`/b/${blog.slug}`} className="group">
            <h2 className="font-semibold text-lg group-hover:underline truncate">
              {blog.title}
            </h2>
          </Link>

          {blog.summary && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {blog.summary}
            </p>
          )}

          <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
            {blog.user && <span>{blog.user.email}</span>}
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
            {blog._count !== undefined && (
              <>
                <span>♥ {blog._count.likes}</span>
                <span>💬 {blog._count.comments}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              blog.isPublished
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {blog.isPublished ? 'Published' : 'Draft'}
          </span>

          {showControls && (
            <div className="flex gap-2 mt-1">
              <Link
                href={`/dashboard/${blog.id}/edit`}
                className="text-xs text-blue-600 hover:underline"
              >
                Edit
              </Link>
              {onTogglePublish && (
                <button
                  onClick={() => onTogglePublish(blog)}
                  className="text-xs text-gray-500 hover:underline"
                >
                  {blog.isPublished ? 'Unpublish' : 'Publish'}
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(blog.id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

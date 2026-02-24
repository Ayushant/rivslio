import { publicApi } from '@/lib/api';
import { notFound } from 'next/navigation';
import LikeButton from '@/components/LikeButton';
import CommentSection from '@/components/CommentSection';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;

  let blog;
  try {
    blog = await publicApi.getBlog(slug);
  } catch {
    notFound();
  }

  return (
    <article className="max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold leading-tight mb-3">{blog.title}</h1>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{blog.user?.email}</span>
          <span>·</span>
          <time dateTime={blog.createdAt}>
            {new Date(blog.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>

        {blog.summary && (
          <p className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 italic">
            {blog.summary}
          </p>
        )}
      </header>

      <div className="prose prose-gray max-w-none mb-8 whitespace-pre-wrap leading-relaxed">
        {blog.content}
      </div>

      <div className="flex items-center gap-4 py-4 border-t border-gray-100">
        <LikeButton
          blogId={blog.id}
          initialCount={blog._count?.likes ?? 0}
        />
        <span className="text-sm text-gray-400">
          {blog._count?.comments ?? 0} comment
          {(blog._count?.comments ?? 0) !== 1 ? 's' : ''}
        </span>
      </div>

      <CommentSection blogId={blog.id} />
    </article>
  );
}

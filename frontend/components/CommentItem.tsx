import type { Comment } from '@/lib/api';

interface Props {
  comment: Comment;
}

export default function CommentItem({ comment }: Props) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-medium text-gray-800">
          {comment.user.email}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(comment.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type CommentType = {
  id: number;
  userId: number;
  chapterIndex: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    cohort: number;
  };
};

type Props = {
  chapterIndex: number;
  loggedIn: boolean;
  currentUserId?: number | null;
  onMyCommentUpdate?: (content: string | null) => void;
};

export function CommentsSection({
  chapterIndex,
  loggedIn,
  currentUserId,
  onMyCommentUpdate,
}: Props) {
  const router = useRouter();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const myComment = comments.find((c) => c.userId === currentUserId);

  useEffect(() => {
    fetchComments();
  }, [chapterIndex]);

  useEffect(() => {
    if (myComment && !editing) {
      setContent(myComment.content);
    }
  }, [myComment, editing]);

  async function fetchComments() {
    setLoading(true);
    try {
      const res = await fetch(`/api/comments?chapterIndex=${chapterIndex}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
        const mine = data.find((c: CommentType) => c.userId === currentUserId);
        if (onMyCommentUpdate) {
          onMyCommentUpdate(mine ? mine.content : null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterIndex, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "저장에 실패했어요.");
      }
      
      setEditing(false);
      await fetchComments();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("묵상을 삭제할까요?")) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterIndex }),
      });
      if (res.ok) {
        setContent("");
        setEditing(false);
        await fetchComments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="space-y-4 rounded-2xl border border-line bg-bg-elevated/70 p-5 text-center text-sm text-muted">
        묵상을 불러오는 중...
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-2xl border border-line bg-bg-elevated/70 p-5">
      <h3 className="font-semibold text-ink text-lg">묵상 노트</h3>

      {/* 묵상 작성 폼 */}
      {loggedIn ? (
        <div className="space-y-3">
          {!myComment || editing ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="오늘 읽은 말씀 중 기억에 남는 구절이나 묵상을 남겨보세요. (최대 500자)"
                className="w-full rounded-xl border border-line bg-bg p-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none min-h-[100px]"
                maxLength={500}
                disabled={submitting}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted">{content.length}/500</span>
                <div className="flex gap-2">
                  {editing && myComment && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setContent(myComment.content);
                        setError(null);
                      }}
                      className="px-4 py-2 text-sm text-muted rounded-lg border border-line hover:bg-line/50 transition"
                      disabled={submitting}
                    >
                      취소
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={submitting || !content.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition disabled:opacity-50"
                  >
                    {submitting ? "저장 중..." : "저장"}
                  </button>
                </div>
              </div>
              {error && <p className="text-xs text-warn">{error}</p>}
            </form>
          ) : (
            <div className="rounded-xl border border-accent/20 bg-accent-soft p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-accent">나의 묵상</span>
                <div className="flex gap-2 text-xs text-muted">
                  <button type="button" onClick={() => setEditing(true)} className="hover:text-ink transition">
                    수정
                  </button>
                  <button type="button" onClick={handleDelete} className="hover:text-warn transition">
                    삭제
                  </button>
                </div>
              </div>
              <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{myComment.content}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-line bg-bg p-4 text-center">
          <p className="text-sm text-muted mb-3">로그인하고 묵상을 남겨보세요.</p>
          <button
            onClick={() => router.push("/login")}
            className="text-sm font-medium text-accent hover:underline"
          >
            로그인 / 가입
          </button>
        </div>
      )}

      {/* 다른 사람들의 묵상 리스트 */}
      {comments.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-line">
          <h4 className="text-sm font-medium text-muted">다른 사람들의 묵상 ({comments.length})</h4>
          <ul className="space-y-3">
            {comments.map((comment) => (
              <li key={comment.id} className="rounded-xl bg-bg p-4 space-y-2 shadow-sm border border-line/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-ink">{comment.user.name}</span>
                  <span className="text-[11px] text-muted">{comment.user.cohort}기</span>
                </div>
                <p className="text-sm text-ink/90 whitespace-pre-wrap leading-relaxed">
                  {comment.content}
                </p>
                <div className="text-[10px] text-muted">
                  {new Date(comment.createdAt).toLocaleString("ko-KR", {
                    month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
                  })}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

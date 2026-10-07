import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  Bookmark,
  Share2,
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  Trash2,
  Copy,
  Check,
  Send,
  User,
  Heart
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { ArticleSkeleton } from '../components/Skeletons';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import {
  getPostBySlug,
  getPublishedPosts,
  savePost,
  removeSavedPost,
  isPostSaved
} from '../services/posts';
import { getCommentsForPost, addComment, deleteComment } from '../services/comments';
import { Post, Comment } from '../types';

export const ArticleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, profile, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [post, setPost] = useState<Post | null>(null);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadArticle = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const found = await getPostBySlug(slug);
        setPost(found);

        const list = await getPublishedPosts();
        setAllPosts(list);

        if (found) {
          const coms = await getCommentsForPost(found.id);
          setComments(coms);

          if (user) {
            const hasSaved = await isPostSaved(user.uid, found.id);
            setSaved(hasSaved);
          }
        }
      } catch (err) {
        console.error('Failed to load article:', err);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug, user]);

  const handleToggleSave = async () => {
    if (!user || !post) {
      showToast('Please sign in to save reflections to your sanctuary.', 'info');
      return;
    }

    try {
      if (saved) {
        await removeSavedPost(user.uid, post.id);
        setSaved(false);
        showToast('Article removed from your sanctuary.', 'info');
      } else {
        await savePost(user.uid, post);
        setSaved(true);
        showToast('Saved to your quiet sanctuary.', 'success');
      }
    } catch (err) {
      showToast('Failed to update bookmark.', 'error');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    showToast('Link copied to clipboard.', 'success');
    setTimeout(() => setShareCopied(false), 3000);
  };

  const handleNativeShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href
        });
      } catch (err) {
        // Ignored if user dismissed share dialog
      }
    } else {
      setShowShareModal(true);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !post) {
      showToast('Please sign in to share your reflection.', 'info');
      return;
    }

    if (newComment.trim().length < 3) {
      showToast('Please write at least a few words.', 'error');
      return;
    }

    setCommentSubmitting(true);
    try {
      const commentId = await addComment(post.id, newComment, profile);
      const newCommentObj: Comment = {
        id: commentId,
        postId: post.id,
        authorId: profile.uid,
        authorName: profile.displayName,
        authorPhoto: profile.photoURL,
        content: newComment.trim(),
        createdAt: new Date().toISOString()
      };
      setComments([newCommentObj, ...comments]);
      setNewComment('');
      showToast('Your reflection has been welcomed.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Unable to post comment.', 'error');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
      showToast('Comment removed.', 'info');
    } catch (err) {
      showToast('Unable to remove comment.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] py-16">
        <ArticleSkeleton />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h2 className="font-serif text-3xl text-[#122B22]">Reflection not found</h2>
          <p className="text-sm text-[#122B22]/70 leading-relaxed">
            This article may have drifted into the quiet archives or does not exist.
          </p>
          <Link
            to="/journal"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#122B22] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Journal
          </Link>
        </div>
      </div>
    );
  }

  // Prev & Next navigation
  const currentIndex = allPosts.findIndex(p => p.id === post.id);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const relatedPosts = allPosts.filter(p => p.id !== post.id && p.category === post.category).slice(0, 2);

  return (
    <article className="min-h-screen bg-[#FAF7F2] text-[#122B22] py-12 md:py-20">
      <SEO
        title={post.title}
        description={post.excerpt}
        image={post.coverImage}
        type="article"
      />

      <div className="max-w-4xl mx-auto px-6">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            to="/journal"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6F8A77] hover:text-[#122B22] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Journal</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="space-y-6 text-center max-w-3xl mx-auto mb-12">
          <div className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#B8E0D2]/40 text-[#122B22]">
            {post.category}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-[#122B22] leading-[1.15]">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-[#122B22]/75 leading-relaxed font-sans max-w-2xl mx-auto">
            {post.excerpt}
          </p>

          {/* Author and Metadata Bar */}
          <div className="pt-6 border-t border-[#EBE6DC] flex flex-wrap items-center justify-between gap-4 text-xs text-[#6F8A77]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E5ECE7] overflow-hidden flex items-center justify-center font-bold text-[#122B22]">
                {post.authorPhoto ? (
                  <img src={post.authorPhoto} alt={post.authorName} className="w-full h-full object-cover" />
                ) : (
                  post.authorName.charAt(0)
                )}
              </div>
              <div className="text-left">
                <div className="font-semibold text-[#122B22]">{post.authorName}</div>
                <div>Editorial Contemplator</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime} min read
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleSave}
                  aria-label="Save reflection"
                  className={`p-2 rounded-full border transition-all ${
                    saved
                      ? 'bg-[#122B22] text-[#FAF7F2] border-[#122B22]'
                      : 'bg-white border-[#EBE6DC] text-[#122B22] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={handleNativeShare}
                  aria-label="Share article"
                  className="p-2 rounded-full bg-white border border-[#EBE6DC] text-[#122B22] hover:bg-[#FAF7F2] transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Artwork */}
        <div className="rounded-3xl overflow-hidden mb-16 shadow-md border border-[#EBE6DC] bg-[#FAF7F2] max-h-[520px]">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Long-Form Reading Content */}
        <div className="max-w-2xl mx-auto prose prose-neutral prose-lg">
          <div className="text-[#122B22]/85 text-base sm:text-lg leading-[1.8] font-sans space-y-6">
            {post.content.split('\n\n').map((paragraph, idx) => {
              // Subheading
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={idx} className="font-serif text-2xl sm:text-3xl font-normal text-[#122B22] pt-6 pb-2">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              // List items
              if (paragraph.startsWith('* ') || paragraph.startsWith('1. ')) {
                const lines = paragraph.split('\n');
                return (
                  <ul key={idx} className="space-y-3 pl-4 border-l-2 border-[#8EA595]/40 my-6">
                    {lines.map((line, lIdx) => (
                      <li key={lIdx} className="text-[#122B22]/80 text-base leading-relaxed">
                        {line.replace(/^(\* |\d+\. )/, '')}
                      </li>
                    ))}
                  </ul>
                );
              }

              // First paragraph gets a drop-cap aesthetic
              if (idx === 0) {
                return (
                  <p key={idx} className="text-lg leading-relaxed first-letter:float-left first-letter:text-5xl first-letter:pr-3 first-letter:font-serif first-letter:text-[#122B22] first-letter:leading-none">
                    {paragraph}
                  </p>
                );
              }

              return <p key={idx}>{paragraph}</p>;
            })}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="pt-10 mt-12 border-t border-[#EBE6DC] flex flex-wrap gap-2">
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-white border border-[#EBE6DC] text-[#6F8A77]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Share Modal Dropdown */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#EBE6DC] shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#F2ECE4]">
                <h4 className="font-serif text-lg text-[#122B22]">Share Reflection</h4>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-xs text-[#6F8A77] hover:text-[#122B22]"
                >
                  Close
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE4] text-xs font-semibold text-[#122B22] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Copy className="w-4 h-4" /> Copy Direct Link
                  </span>
                  {shareCopied && <Check className="w-4 h-4 text-emerald-600" />}
                </button>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2 p-3 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE4] text-xs font-semibold text-[#122B22] transition-colors"
                >
                  <span>Share on X / Twitter</span>
                </a>

                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2 p-3 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE4] text-xs font-semibold text-[#122B22] transition-colors"
                >
                  <span>Share on LinkedIn</span>
                </a>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2 p-3 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE4] text-xs font-semibold text-[#122B22] transition-colors"
                >
                  <span>Share on Facebook</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Previous and Next Navigation */}
        <div className="max-w-2xl mx-auto py-12 my-12 border-y border-[#EBE6DC] grid grid-cols-1 sm:grid-cols-2 gap-6">
          {prevPost ? (
            <Link
              to={`/journal/${prevPost.slug}`}
              className="p-5 rounded-2xl bg-white border border-[#EBE6DC] hover:border-[#8EA595] transition-all group"
            >
              <div className="flex items-center gap-1.5 text-xs text-[#6F8A77] font-medium mb-1">
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                <span>Previous Reflection</span>
              </div>
              <div className="font-serif text-base text-[#122B22] font-normal line-clamp-2">
                {prevPost.title}
              </div>
            </Link>
          ) : <div />}

          {nextPost && (
            <Link
              to={`/journal/${nextPost.slug}`}
              className="p-5 rounded-2xl bg-white border border-[#EBE6DC] hover:border-[#8EA595] transition-all text-right group"
            >
              <div className="flex items-center justify-end gap-1.5 text-xs text-[#6F8A77] font-medium mb-1">
                <span>Next Reflection</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="font-serif text-base text-[#122B22] font-normal line-clamp-2">
                {nextPost.title}
              </div>
            </Link>
          )}
        </div>

        {/* Comments & Community Reflections Section */}
        <section className="max-w-2xl mx-auto pt-6 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl text-[#122B22] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#6F8A77]" />
              <span>Reader Reflections ({comments.length})</span>
            </h3>
          </div>

          {/* Add Comment Box */}
          {user ? (
            <form onSubmit={handleAddComment} className="bg-white rounded-3xl p-6 border border-[#EBE6DC] shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#E5ECE7] text-[#122B22] flex items-center justify-center font-semibold text-xs">
                  {profile?.displayName?.charAt(0) || 'U'}
                </div>
                <span className="text-xs font-semibold text-[#122B22]">
                  {profile?.displayName || user.email}
                </span>
              </div>

              <textarea
                rows={3}
                required
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share a thoughtful observation from your own practice..."
                className="w-full bg-[#FAF7F2] border border-[#EBE6DC] rounded-2xl p-4 text-sm text-[#122B22] placeholder-[#122B22]/40 focus:outline-none focus:border-[#8EA595] transition-all resize-none"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={commentSubmitting || !newComment.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#122B22] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider hover:bg-[#1A3B2F] transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{commentSubmitting ? 'Submitting...' : 'Post Reflection'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white/80 rounded-3xl p-6 border border-[#EBE6DC] text-center space-y-3">
              <p className="text-sm text-[#122B22]/70 font-medium">
                Sign in to join the conversation and contribute your thoughts.
              </p>
              <Link
                to="/login"
                className="inline-block px-6 py-2 rounded-full bg-[#122B22] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider hover:bg-[#1A3B2F] transition-colors"
              >
                Sign In to Reflect
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-xs text-[#6F8A77] text-center py-6">
                No reflections yet. Be the first to leave a gentle thought.
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white/90 rounded-2xl p-5 border border-[#EBE6DC] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#FAF7F2] border border-[#EBE6DC] flex items-center justify-center text-xs font-semibold text-[#122B22]">
                        {comment.authorName?.charAt(0) || 'R'}
                      </div>
                      <span className="text-xs font-semibold text-[#122B22]">
                        {comment.authorName}
                      </span>
                    </div>

                    {(user?.uid === comment.authorId || isAdmin) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-[#6F8A77] hover:text-red-700 p-1 transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-[#122B22]/85 leading-relaxed pl-9">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </article>
  );
};

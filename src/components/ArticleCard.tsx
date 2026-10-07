import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Clock, ArrowUpRight } from 'lucide-react';
import { Post } from '../types';
import { useAuth } from '../context/AuthContext';
import { savePost, removeSavedPost, isPostSaved } from '../services/posts';
import { useToast } from './Toast';

interface ArticleCardProps {
  post: Post;
  isInitiallySaved?: boolean;
  onSavedChange?: (postId: string, saved: boolean) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  post,
  isInitiallySaved = false,
  onSavedChange
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isSaved, setIsSaved] = useState(isInitiallySaved);
  const [savingLoading, setSavingLoading] = useState(false);

  // 3D Tilt calculation
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>('');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6; // Max 6deg
    const rotateY = ((x - centerX) / centerX) * 6;

    setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`);
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)');
  };

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast('Please sign in to save reflections to your sanctuary.', 'info');
      return;
    }

    setSavingLoading(true);
    try {
      if (isSaved) {
        await removeSavedPost(user.uid, post.id);
        setIsSaved(false);
        showToast('Article removed from your sanctuary.', 'info');
        onSavedChange?.(post.id, false);
      } else {
        await savePost(user.uid, post);
        setIsSaved(true);
        showToast('Saved to your quiet sanctuary.', 'success');
        onSavedChange?.(post.id, true);
      }
    } catch (err) {
      console.error(err);
      showToast('Unable to update saved articles.', 'error');
    } finally {
      setSavingLoading(false);
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: 'transform 0.25s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.25s ease'
      }}
      className="group relative flex flex-col justify-between bg-white/90 rounded-3xl p-6 border border-[#EBE6DC] shadow-sm hover:shadow-xl transition-all duration-300 will-change-transform h-full"
    >
      <div>
        {/* Cover Artwork Container */}
        <div className="relative w-full h-56 rounded-2xl overflow-hidden mb-5 bg-[#FAF7F2]">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 opacity-60 group-hover:opacity-40 transition-opacity" />

          {/* Category Badge */}
          <div className="absolute top-3.5 left-3.5 z-10">
            <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-[#FAF7F2]/90 backdrop-blur-md text-[#122B22] shadow-sm">
              {post.category}
            </span>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleToggleSave}
            disabled={savingLoading}
            aria-label={isSaved ? 'Remove from saved' : 'Save article'}
            className={`absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 ${
              isSaved
                ? 'bg-[#122B22] text-[#FAF7F2] shadow-md'
                : 'bg-[#FAF7F2]/80 hover:bg-[#FAF7F2] text-[#122B22]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Article Meta */}
        <div className="flex items-center gap-3 text-xs text-[#6F8A77] font-medium mb-2.5">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {post.readingTime} min read
          </span>
          <span>•</span>
          <span>{post.authorName}</span>
        </div>

        {/* Title */}
        <Link to={`/journal/${post.slug}`} className="block group-hover:text-[#6F8A77] transition-colors">
          <h3 className="font-serif text-2xl font-normal leading-snug text-[#122B22] mb-3 group-hover:underline decoration-[#8EA595] decoration-1 underline-offset-4">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-[#122B22]/70 text-sm leading-relaxed line-clamp-3 mb-6">
          {post.excerpt}
        </p>
      </div>

      {/* Footer / Read More */}
      <div className="pt-4 border-t border-[#F2ECE4] flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          {post.tags && post.tags.slice(0, 2).map((tag, idx) => (
            <span key={idx} className="text-[11px] font-medium text-[#6F8A77] bg-[#FAF7F2] px-2.5 py-1 rounded-md">
              #{tag}
            </span>
          ))}
        </div>

        <Link
          to={`/journal/${post.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#122B22] group-hover:text-[#6F8A77] transition-colors group-hover:translate-x-0.5"
        >
          <span>Read</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

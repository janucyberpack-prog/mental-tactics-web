import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Filter } from 'lucide-react';
import { ArticleCard } from '../components/ArticleCard';
import { CardSkeleton } from '../components/Skeletons';
import { SEO } from '../components/SEO';
import { getPublishedPosts } from '../services/posts';
import { Post } from '../types';

const CATEGORIES = [
  'All',
  'Mindfulness',
  'Rest & Renewal',
  'Emotional Agility',
  'Neuroscience',
  'Daily Rituals'
];

export const Journal: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'All';

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const data = await getPublishedPosts();
        setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    posts.forEach(p => {
      p.tags?.forEach(t => tagsSet.add(t));
    });
    return Array.from(tagsSet);
  }, [posts]);

  // Filtered posts based on search, category, tag
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesCategory = selectedCategory === 'All' || post.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesTag = !selectedTag || (post.tags && post.tags.includes(selectedTag));
      
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || (
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query) ||
        (post.tags && post.tags.some(t => t.toLowerCase().includes(query)))
      );

      return matchesCategory && matchesTag && matchesSearch;
    });
  }, [posts, selectedCategory, selectedTag, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-16 md:py-24 text-[#122B22]">
      <SEO
        title="Journal Reflections"
        description="Browse essays and meditations on focus, somatic emotional agility, restorative rest, and intentional living."
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Editorial Heading */}
        <div className="max-w-3xl mb-12 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#6F8A77]">
            Archive & Essays
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-[#122B22] font-normal leading-tight">
            The Journal of Mental Tactic
          </h1>
          <p className="text-base text-[#122B22]/70 leading-relaxed font-sans">
            A living codex of psychological resilience, restorative neuroscience, and intentional stillness.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-[#EBE6DC] shadow-sm mb-12 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F8A77]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, insight, or theme..."
                className="w-full bg-[#FAF7F2] border border-[#EBE6DC] rounded-full pl-11 pr-10 py-3 text-sm text-[#122B22] placeholder-[#122B22]/40 focus:outline-none focus:border-[#8EA595] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#6F8A77] hover:text-[#122B22]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Tags quick filter dropdown/pills */}
            {selectedTag && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#6F8A77]">Filtered by tag:</span>
                <span className="bg-[#B8E0D2]/40 text-[#122B22] px-3 py-1 rounded-full flex items-center gap-1.5 font-medium">
                  #{selectedTag}
                  <button onClick={() => setSelectedTag(null)}>
                    <X className="w-3 h-3 hover:text-red-700" />
                  </button>
                </span>
              </div>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap transition-all ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-[#122B22] text-[#FAF7F2] shadow-sm'
                    : 'bg-[#FAF7F2] text-[#122B22]/80 hover:bg-[#EAE5DB] hover:text-[#122B22]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-24 bg-white/50 rounded-3xl border border-[#EBE6DC] max-w-2xl mx-auto p-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] flex items-center justify-center mx-auto text-[#6F8A77]">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl text-[#122B22]">
              Something went quiet.
            </h3>
            <p className="text-xs text-[#122B22]/70 leading-relaxed max-w-md mx-auto">
              We couldn't find any reflections matching your search criteria. Take a deep breath and try exploring another topic or clearing your keywords.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedTag(null);
                searchParams.delete('category');
                setSearchParams(searchParams);
              }}
              className="mt-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#122B22] text-[#FAF7F2] hover:bg-[#1A3B2F] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

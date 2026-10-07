import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Compass, Shield, Feather } from 'lucide-react';
import { HeroOrb } from '../components/HeroOrb';
import { ArticleCard } from '../components/ArticleCard';
import { ManifestoSection } from '../components/ManifestoSection';
import { MindfulExercise } from '../components/MindfulExercise';
import { CardSkeleton } from '../components/Skeletons';
import { SEO } from '../components/SEO';
import { getPublishedPosts, seedInitialPostsIfEmpty } from '../services/posts';
import { Post } from '../types';

export const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        await seedInitialPostsIfEmpty();
        const data = await getPublishedPosts();
        setPosts(data);
      } catch (err) {
        console.error('Failed to load posts:', err);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#122B22]">
      <SEO
        title="Sanctuary for Stillness & Clarity"
        description="A deliberate mental wellness platform for focus, restorative rest, and psychological clarity in an age of noise."
      />

      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 pb-20 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero Narrative */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left z-10">
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.08] text-[#122B22] tracking-tight">
                Quiet your thoughts. <br />
                <span className="italic font-light text-[#6F8A77]">Reclaim</span> your depth.
              </h1>

              <p className="text-base sm:text-lg text-[#122B22]/75 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
                Essays, somatic protocols, and contemplative philosophy for navigating modern velocity with grace.
              </p>

              {/* Hero Call to Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/journal"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#122B22] text-[#FAF7F2] hover:bg-[#1A3B2F] transition-all shadow-md flex items-center justify-center gap-2 group"
                >
                  <span>Read Journal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#journal-grid"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/80 border border-[#EBE6DC] hover:border-[#8EA595] text-[#122B22] transition-all flex items-center justify-center"
                >
                  Latest
                </a>
              </div>
            </div>

            {/* Right Hero Interactive Orb */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <HeroOrb />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Three-Column Journal Grid */}
      <section id="journal-grid" className="py-20 md:py-28 bg-[#FAF7F2] border-t border-[#EBE6DC]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <h2 className="font-serif text-3xl md:text-5xl text-[#122B22] font-normal">
                Dispatches
              </h2>
            </div>

            <Link
              to="/journal"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#122B22] hover:text-[#6F8A77] transition-colors pb-1 border-b border-[#122B22] hover:border-[#6F8A77] self-start md:self-auto"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Three Column Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.slice(0, 3).map((post) => (
                <ArticleCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Interactive Somatic Mindful Exercise */}
      <MindfulExercise />

      {/* Manifesto Section */}
      <ManifestoSection />
    </div>
  );
};

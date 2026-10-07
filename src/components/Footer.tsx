import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { subscribeNewsletter } from '../services/interactions';
import { useToast } from './Toast';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await subscribeNewsletter(email);
      setSubscribed(true);
      showToast(res.message, 'success');
      setEmail('');
    } catch (err: any) {
      showToast(err.message || 'Unable to subscribe right now.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#122B22] text-[#FAF7F2] pt-20 pb-12 border-t border-[#163328]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-[#214336]">
          {/* Brand Philosophy */}
          <div className="md:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#B8E0D2] flex items-center justify-center text-[#122B22] font-serif font-bold text-sm">
                M
              </div>
              <span className="font-serif text-2xl tracking-wider uppercase font-semibold text-[#FAF7F2]">
                Mental Tactic
              </span>
            </div>
            <p className="text-sm text-[#FAF7F2]/70 leading-relaxed max-w-sm">
              A digital sanctuary engineered for single-task focus, nervous system restoration, and philosophical clarity. We publish timeless dispatches on living intentionally amidst ambient modern noise.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#8EA595]">
              Sanctuary
            </h4>
            <ul className="space-y-2.5 text-sm text-[#FAF7F2]/80">
              <li>
                <Link to="/" className="hover:text-[#B8E0D2] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/journal" className="hover:text-[#B8E0D2] transition-colors">
                  Journal Reflections
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#B8E0D2] transition-colors">
                  The Manifesto
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#B8E0D2] transition-colors">
                  Inquiries & Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Editorial Pillars */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#8EA595]">
              Pillars
            </h4>
            <ul className="space-y-2.5 text-sm text-[#FAF7F2]/80">
              <li>
                <Link to="/journal?category=Mindfulness" className="hover:text-[#B8E0D2] transition-colors">
                  Mindfulness
                </Link>
              </li>
              <li>
                <Link to="/journal?category=Rest %26 Renewal" className="hover:text-[#B8E0D2] transition-colors">
                  Rest & Renewal
                </Link>
              </li>
              <li>
                <Link to="/journal?category=Emotional Agility" className="hover:text-[#B8E0D2] transition-colors">
                  Emotional Agility
                </Link>
              </li>
              <li>
                <Link to="/journal?category=Neuroscience" className="hover:text-[#B8E0D2] transition-colors">
                  Neuroscience
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Dispatch */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#8EA595]">
              The Quiet Dispatch
            </h4>
            <p className="text-xs text-[#FAF7F2]/70 leading-relaxed">
              One reflective essay every Sunday morning. No spam, no urgency.
            </p>

            {subscribed ? (
              <div className="p-3.5 rounded-2xl bg-[#1A3B2F] border border-[#6F8A77]/40 flex items-center gap-2.5 text-xs text-[#B8E0D2]">
                <Check className="w-4 h-4 text-[#B8E0D2]" />
                <span>You are welcomed to our quiet dispatch.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-[#18392C] border border-[#2D5543] rounded-full px-4 py-2.5 text-xs text-[#FAF7F2] placeholder-[#FAF7F2]/40 focus:outline-none focus:border-[#B8E0D2] transition-colors pr-10"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-1.5 top-1.5 w-7 h-7 rounded-full bg-[#B8E0D2] text-[#122B22] flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8EA595] gap-4">
          <p>© {new Date().getFullYear()} Mental Tactic. All thoughts and reflections preserved.</p>
        </div>
      </div>
    </footer>
  );
};

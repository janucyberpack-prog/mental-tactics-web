import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bookmark, User as UserIcon, Menu, X, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

export const Navbar: React.FC = () => {
  const { user, profile, isAdmin, isEditor, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      showToast('You have signed out quietly. Peace be with you.', 'info');
      setProfileDropdownOpen(false);
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F2]/80 backdrop-blur-md border-b border-[#EBE6DC]/80 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Identity */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full bg-[#122B22] flex items-center justify-center text-[#FAF7F2] font-serif text-sm font-semibold transition-transform duration-300 group-hover:scale-105">
            M
          </div>
          <span className="font-serif text-xl tracking-wider text-[#122B22] font-semibold uppercase">
            Mental Tactic
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#122B22]/80">
          <Link
            to="/journal"
            className={`transition-colors hover:text-[#122B22] ${
              isActive('/journal') ? 'text-[#122B22] font-semibold' : ''
            }`}
          >
            Journal
          </Link>
          <Link
            to="/about"
            className={`transition-colors hover:text-[#122B22] ${
              isActive('/about') ? 'text-[#122B22] font-semibold' : ''
            }`}
          >
            Manifesto
          </Link>
          <Link
            to="/contact"
            className={`transition-colors hover:text-[#122B22] ${
              isActive('/contact') ? 'text-[#122B22] font-semibold' : ''
            }`}
          >
            Contact
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#122B22] text-[#FAF7F2] hover:bg-[#1A3B2F] transition-all shadow-sm"
            >
              <Shield className="w-3.5 h-3.5 text-[#B8E0D2]" />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* Right CTA / Auth Status */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/saved"
                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                  isActive('/saved')
                    ? 'bg-[#122B22] text-[#FAF7F2] border-[#122B22]'
                    : 'bg-white/80 border-[#EBE6DC] text-[#122B22] hover:bg-white'
                }`}
                title="Saved"
              >
                <Bookmark className="w-4 h-4" />
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full bg-white/80 border border-[#EBE6DC] hover:border-[#8EA595] transition-all"
                >
                  <span className="text-xs font-medium text-[#122B22] max-w-[100px] truncate">
                    {profile?.displayName || 'Account'}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[#E5ECE7] text-[#122B22] flex items-center justify-center text-xs font-semibold overflow-hidden">
                    {profile?.photoURL ? (
                      <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      profile?.displayName?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#EBE6DC] py-2 z-50 text-sm font-medium animate-in fade-in"
                  >
                    <div className="px-4 py-2 border-b border-[#F2ECE4]">
                      <p className="text-xs font-semibold text-[#122B22] truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/account"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-[#122B22] hover:bg-[#FAF7F2] transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-[#6F8A77]" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      to="/saved"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-[#122B22] hover:bg-[#FAF7F2] transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-[#6F8A77]" />
                      <span>Saved</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[#122B22] hover:bg-[#FAF7F2] transition-colors"
                      >
                        <Shield className="w-4 h-4 text-[#E27D60]" />
                        <span>Admin</span>
                      </Link>
                    )}

                    <div className="border-t border-[#F2ECE4] my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-[#A33] hover:bg-[#FFF5F5] transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-xs font-semibold uppercase tracking-wider text-[#122B22] hover:text-[#6F8A77] px-3 py-2 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#122B22] text-[#FAF7F2] hover:bg-[#1A3B2F] transition-all shadow-sm"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#122B22] hover:bg-black/5 rounded-xl transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF7F2] border-b border-[#EBE6DC] px-6 py-6 space-y-4 animate-in slide-in-from-top">
          <nav className="flex flex-col gap-4 text-base font-medium text-[#122B22]">
            <Link
              to="/journal"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#6F8A77]"
            >
              Journal
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#6F8A77]"
            >
              Manifesto
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#6F8A77]"
            >
              Contact
            </Link>
            {user && (
              <>
                <Link
                  to="/saved"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 hover:text-[#6F8A77]"
                >
                  Saved Sanctuary
                </Link>
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 hover:text-[#6F8A77]"
                >
                  My Profile
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-[#E27D60] font-semibold flex items-center gap-2"
              >
                <Shield className="w-4 h-4" /> Admin Studio
              </Link>
            )}
          </nav>

          <div className="pt-4 border-t border-[#EBE6DC] flex flex-col gap-3">
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full py-2.5 rounded-full text-center text-xs font-semibold uppercase tracking-wider bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-full text-center text-xs font-semibold uppercase tracking-wider border border-[#122B22] text-[#122B22]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-full text-center text-xs font-semibold uppercase tracking-wider bg-[#122B22] text-[#FAF7F2]"
                >
                  Join Sanctuary
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

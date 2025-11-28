import React, { useState, useEffect, useMemo } from 'react';
import { Mail, Lock, User, ArrowLeft, ArrowRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useTheme } from '@/app/context/ThemeContext';

interface Props {
  onLogin: () => void;
  onBack: () => void;
}

const AuthScreen: React.FC<Props> = ({ onLogin, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const { settings, getButtonStyles } = useTheme();

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Auth state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Initialize Supabase client
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!url || !anonKey) {
      console.error('Supabase credentials missing');
      return null;
    }
    return createClient(url, anonKey);
  }, []);

  // Check auth state on mount
  useEffect(() => {
    if (!supabase) return;
    
    let mounted = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      const session = data?.session ?? null;
      if (error) setError(`Auth check failed: ${error.message}`);
      setUserEmail(session?.user?.email ?? null);
      
      // If already authenticated, proceed to workspace
      if (session?.user) {
        onLogin();
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
      if (session?.user) {
        onLogin();
      }
    });

    return () => {
      mounted = false;
      sub?.subscription.unsubscribe();
    };
  }, [supabase, onLogin]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Authentication service not available');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else if (data?.user) {
        // Auth state change listener will trigger onLogin
      }
    } catch (err: any) {
      setError(`Unexpected error: ${err?.message ?? String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Authentication service not available');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validation
      if (!displayName.trim()) {
        setError('Display name is required');
        setLoading(false);
        return;
      }
      if (!email || !password) {
        setError('Email and password are required');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const redirectTo = typeof window !== 'undefined'
        ? new URL('/workspace', window.location.origin).toString()
        : undefined;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          emailRedirectTo: redirectTo,
          data: { display_name: displayName }
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else if (data?.user) {
        setError('Account created! Please check your email to verify your account.');
      }
    } catch (err: any) {
      setError(`Unexpected error: ${err?.message ?? String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const primaryBtn = getButtonStyles('primary');

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full h-full relative p-8">
      
      {/* Back Button */}
      <div className="absolute top-0 left-6 z-10">
        <button 
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-6 text-sm opacity-60 hover:opacity-100 transition-opacity group"
            style={{ color: settings.mutedColor }}
        >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
        </button>
      </div>

      {/* Main Content Wrapper */}
      <div className="w-full max-w-md flex flex-col space-y-12 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header Section */}
        <div className="text-center space-y-3">
          <h1 
            className="text-4xl font-extralight tracking-tight"
            style={{ 
              color: settings.textColor,
              textShadow: `0 0 30px ${settings.highlightColor}40`
            }}
          >
            {isLogin ? 'Welcome Back' : 'Join Us'}
          </h1>
          <p 
            style={{ color: settings.mutedColor }} 
            className="text-sm font-light tracking-wide"
          >
            {isLogin ? 'Enter your credentials to access the workspace.' : 'Create your secure identity in the aether.'}
          </p>
        </div>

        {/* Form Section */}
        <form className="space-y-8" onSubmit={isLogin ? handleSignIn : handleSignUp}>
          
          <div className="space-y-6">
            {!isLogin && (
              <div className="relative group">
                <User 
                  className="absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300 group-focus-within:scale-110" 
                  size={20} 
                  style={{ color: settings.mutedColor }} 
                />
                <input 
                  type="text" 
                  id="fullname"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="peer w-full pl-12 pr-4 py-4 outline-none border-b-2 bg-transparent transition-all duration-300 placeholder-transparent"
                  style={{ 
                    borderColor: `${settings.mutedColor}30`,
                    color: settings.textColor,
                    fontFamily: 'inherit'
                  }}
                  placeholder="Full Name"
                  disabled={loading}
                />
                <label 
                  htmlFor="fullname"
                  className="absolute left-12 top-0 text-xs transition-all duration-300 pointer-events-none opacity-0
                             peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:opacity-50
                             peer-focus:top-0 peer-focus:text-xs peer-focus:opacity-100"
                  style={{ color: settings.mutedColor }}
                >
                  Full Name
                </label>
                <div 
                  className="absolute bottom-0 left-0 h-[2px] w-0 group-focus-within:w-full transition-all duration-500"
                  style={{ backgroundColor: settings.primaryColor }}
                ></div>
              </div>
            )}

            <div className="relative group">
              <Mail 
                className="absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300 group-focus-within:scale-110" 
                size={20} 
                style={{ color: settings.mutedColor }} 
              />
              <input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full pl-12 pr-4 py-4 outline-none border-b-2 bg-transparent transition-all duration-300 placeholder-transparent"
                style={{ 
                  borderColor: `${settings.mutedColor}30`,
                  color: settings.textColor,
                  fontFamily: 'inherit'
                }}
                placeholder="Email Address"
                disabled={loading}
              />
              <label 
                htmlFor="email"
                className="absolute left-12 top-0 text-xs transition-all duration-300 pointer-events-none opacity-0
                           peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:opacity-50
                           peer-focus:top-0 peer-focus:text-xs peer-focus:opacity-100"
                style={{ color: settings.mutedColor }}
              >
                Email Address
              </label>
              <div 
                className="absolute bottom-0 left-0 h-[2px] w-0 group-focus-within:w-full transition-all duration-500"
                style={{ backgroundColor: settings.primaryColor }}
              ></div>
            </div>

            <div className="relative group">
              <Lock 
                className="absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300 group-focus-within:scale-110" 
                size={20} 
                style={{ color: settings.mutedColor }} 
              />
              <input 
                type="password" 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer w-full pl-12 pr-4 py-4 outline-none border-b-2 bg-transparent transition-all duration-300 placeholder-transparent"
                style={{ 
                  borderColor: `${settings.mutedColor}30`,
                  color: settings.textColor,
                  fontFamily: 'inherit'
                }}
                placeholder="Password"
                disabled={loading}
              />
              <label 
                htmlFor="password"
                className="absolute left-12 top-0 text-xs transition-all duration-300 pointer-events-none opacity-0
                           peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:opacity-50
                           peer-focus:top-0 peer-focus:text-xs peer-focus:opacity-100"
                style={{ color: settings.mutedColor }}
              >
                Password
              </label>
              <div 
                className="absolute bottom-0 left-0 h-[2px] w-0 group-focus-within:w-full transition-all duration-500"
                style={{ backgroundColor: settings.primaryColor }}
              ></div>
            </div>

            {!isLogin && (
              <div className="relative group">
                <Lock 
                  className="absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300 group-focus-within:scale-110" 
                  size={20} 
                  style={{ color: settings.mutedColor }} 
                />
                <input 
                  type="password" 
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="peer w-full pl-12 pr-4 py-4 outline-none border-b-2 bg-transparent transition-all duration-300 placeholder-transparent"
                  style={{ 
                    borderColor: `${settings.mutedColor}30`,
                    color: settings.textColor,
                    fontFamily: 'inherit'
                  }}
                  placeholder="Confirm Password"
                  disabled={loading}
                />
                <label 
                  htmlFor="confirmPassword"
                  className="absolute left-12 top-0 text-xs transition-all duration-300 pointer-events-none opacity-0
                             peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:opacity-50
                             peer-focus:top-0 peer-focus:text-xs peer-focus:opacity-100"
                  style={{ color: settings.mutedColor }}
                >
                  Confirm Password
                </label>
                <div 
                  className="absolute bottom-0 left-0 h-[2px] w-0 group-focus-within:w-full transition-all duration-500"
                  style={{ backgroundColor: settings.primaryColor }}
                ></div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div 
              className="text-sm text-center px-4 py-2 rounded-md"
              style={{ 
                backgroundColor: error.includes('created') ? `${settings.primaryColor}20` : 'rgba(239, 68, 68, 0.1)',
                color: error.includes('created') ? settings.primaryColor : '#ef4444'
              }}
            >
              {error}
            </div>
          )}

          <div className="pt-2">
            <button 
                type="submit"
                disabled={loading}
                style={primaryBtn.style}
                className={`w-full py-4 px-6 group flex items-center justify-center gap-2 ${primaryBtn.className} transform active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                <span className="font-medium text-base">
                  {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign In' : 'Create Account')}
                </span>
                {!loading && <ArrowRight size={18} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />}
            </button>
          </div>
        </form>

        {/* Footer Toggle */}
        <div className="text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            disabled={loading}
            className="text-sm transition-all hover:tracking-wide duration-300 disabled:opacity-50"
            style={{ color: settings.mutedColor }}
          >
            {isLogin ? "New here? " : "Already have an account? "}
            <span style={{ color: settings.primaryColor }} className="font-semibold hover:underline">
              {isLogin ? 'Create an account' : 'Log in'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default AuthScreen;
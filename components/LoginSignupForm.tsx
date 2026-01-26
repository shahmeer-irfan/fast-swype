'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClickSound } from '@/hooks/useClickSound';
import { signIn, signUp } from '@/lib/supabase/api';
import { validateFastEmail, getCampusFromEmail, getBatchFromEmail } from '@/lib/validation';
import EmailVerification from '@/components/EmailVerification';

const LoginSignupForm = () => {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const { playClick, playConfirm, playHover, playDismiss } = useClickSound();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const validation = validateFastEmail(loginData.email);
      if (!validation.isValid) {
        playDismiss();
        setError(validation.error || 'Invalid email');
        setLoading(false);
        return;
      }

      const { error: signInError } = await signIn(loginData.email, loginData.password);
      
      if (signInError) {
        playDismiss();
        setError(signInError.message || 'Invalid credentials');
        setLoading(false);
        return;
      }

      playConfirm();
      router.push('/swipe');
    } catch (err: any) {
      playDismiss();
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const validation = validateFastEmail(signupData.email);
      if (!validation.isValid) {
        playDismiss();
        setError(validation.error || 'Invalid email');
        setLoading(false);
        return;
      }

      if (signupData.password !== signupData.confirmPassword) {
        playDismiss();
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (signupData.password.length < 6) {
        playDismiss();
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      const campus = getCampusFromEmail(signupData.email);
      const batch = getBatchFromEmail(signupData.email);

      const { data, error: signUpError } = await signUp({
        email: signupData.email,
        password: signupData.password,
        name: signupData.name,
        campus,
        batch,
        department: 'CS',
      });

      if (signUpError || !data) {
        playDismiss();
        // Check if error is about email already registered
        if (signUpError?.message?.toLowerCase().includes('already registered')) {
          setError('This email is already registered. Switching to login...');
          // Switch to login mode after 2 seconds
          setTimeout(() => {
            setIsSignUp(false);
            setError('');
            setLoginData({ email: signupData.email, password: '' });
            setSignupData({ name: '', email: '', password: '', confirmPassword: '' });
          }, 2000);
        } else {
          setError(signUpError?.message || 'Signup failed');
        }
        setLoading(false);
        return;
      }

      // Check if email verification is required
      if (data.user && !data.session) {
        // Email verification required
        playConfirm();
        setLoading(false);
        setRegisteredEmail(signupData.email);
        setShowEmailVerification(true);
        return;
      }

      // Auto-confirmed, proceed to profile
      playConfirm();
      setLoading(false);
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/profile/edit');
    } catch (err: any) {
      playDismiss();
      setError(err.message || 'Signup failed');
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Email Verification Modal */}
      {showEmailVerification && (
        <EmailVerification
          email={registeredEmail}
          onClose={() => {
            setShowEmailVerification(false);
            setIsSignUp(false);
            setSignupData({ name: '', email: '', password: '', confirmPassword: '' });
          }}
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="w-[320px] px-4 py-3 bg-[#ff4444] border border-[#cc0000] rounded-lg text-sm font-semibold text-white text-center">
          {error}
        </div>
      )}

      {/* Card Switch Container */}
      <div className="relative flex flex-col items-center gap-8">
        {/* Toggle Switch */}
        <label className="relative flex items-center gap-16 cursor-pointer">
          <span 
            className={`text-sm font-bold uppercase transition-all ${
              !isSignUp ? 'text-white underline' : 'text-[#999]'
            }`}
          >
            Log in
          </span>
          
          <div className="relative w-12 h-6">
            <input
              type="checkbox"
              className="sr-only"
              checked={isSignUp}
              onChange={(e) => {
                playClick();
                setIsSignUp(e.target.checked);
                setError('');
              }}
            />
            <div className="w-full h-full bg-[#2d2d2d] border-2 border-[#4387f4] rounded-md transition-all" />
            <div
              className={`absolute top-0 w-6 h-6 bg-[#4387f4] rounded-md transition-transform ${
                isSignUp ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </div>

          <span 
            className={`text-sm font-bold uppercase transition-all ${
              isSignUp ? 'text-white underline' : 'text-[#999]'
            }`}
          >
            Sign up
          </span>
        </label>

        {/* Flip Card Container */}
        <div className="relative w-[320px] h-[400px]" style={{ perspective: '1000px' }}>
          <div
            className="relative w-full h-full transition-all duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: isSignUp ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Login Card (Front) */}
            <div
              className="absolute w-full h-full bg-[#2d2d2d] border-2 border-[#4387f4] rounded-lg p-8 flex flex-col justify-center"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <h2 className="text-md font-black uppercase text-white mb-8 pb-4 text-center">
                Hey there! Welcome back.
              </h2>
              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
                <input
                  type="email"
                  placeholder="k990000@nu.edu.pk"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  disabled={loading}
                  className="w-full h-12 px-4 bg-[#1a1a1a] border-2 border-[#4387f4] rounded-lg text-white placeholder-[#666] text-sm font-semibold outline-none focus:border-[#5a9fff] transition-all disabled:opacity-50"
                />
                <input
                  type="password"
                  placeholder="Your Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  minLength={6}
                  disabled={loading}
                  className="w-full h-12 px-4 bg-[#1a1a1a] border-2 border-[#4387f4] rounded-lg text-white placeholder-[#666] text-sm font-semibold outline-none focus:border-[#5a9fff] transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  onMouseEnter={playHover}
                  disabled={loading}
                  className="w-full h-10 bg-[#4387f4] hover:bg-[#1a3a7d] text-white border-2 border-black rounded-lg font-black text-sm uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? 'WAIT...' : "LET'S GO!"}
                </button>
              </form>
            </div>

            {/* Sign Up Card (Back) */}
            <div
              className="absolute w-full h-full bg-[#2d2d2d] border-2 border-[#4387f4] rounded-lg p-8 flex flex-col  justify-center"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <h2 className="text-lg font-black uppercase text-white mb-6 pb-2  pt-8 text-center">
               Let's make your account!
              </h2>
              <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Your Good Name"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  required
                  disabled={loading}
                  className="w-full h-12 px-4 bg-[#1a1a1a] border-2 border-[#4387f4] rounded-lg text-white placeholder-[#666] text-sm font-semibold outline-none focus:border-[#5a9fff] transition-all disabled:opacity-50"
                />
                <input
                  type="email"
                  placeholder="k990000@nu.edu.pk"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  required
                  disabled={loading}
                  className="w-full h-12 px-4 bg-[#1a1a1a] border-2 border-[#4387f4] rounded-lg text-white placeholder-[#666] text-sm font-semibold outline-none focus:border-[#5a9fff] transition-all disabled:opacity-50"
                />
                <input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  required
                  minLength={6}
                  disabled={loading}
                  className="w-full h-12 px-4 bg-[#1a1a1a] border-2 border-[#4387f4] rounded-lg text-white placeholder-[#666] text-sm font-semibold outline-none focus:border-[#5a9fff] transition-all disabled:opacity-50"
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                  disabled={loading}
                  className="w-full h-12 px-4 bg-[#1a1a1a] border-2 border-[#4387f4] rounded-lg text-white placeholder-[#666] text-sm font-semibold outline-none focus:border-[#5a9fff] transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  onMouseEnter={playHover}
                  disabled={loading}
                  className="w-full h-10 bg-[#4387f4] hover:bg-[#1a3a7d] text-white border-2 border-black rounded-lg font-black text-sm uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? 'WAIT...' : 'CONFIRM!'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignupForm;

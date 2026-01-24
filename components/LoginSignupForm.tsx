'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClickSound } from '@/hooks/useClickSound';
import { signIn, signUp } from '@/lib/supabase/api';
import { validateFastEmail, getCampusFromEmail, getBatchFromEmail } from '@/lib/validation';

const LoginSignupForm = () => {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { playClick, playConfirm, playHover, playDismiss } = useClickSound();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate FAST email format
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
      // Validate FAST email format
      const validation = validateFastEmail(signupData.email);
      if (!validation.isValid) {
        playDismiss();
        setError(validation.error || 'Invalid email');
        setLoading(false);
        return;
      }

      // Validate password match
      if (signupData.password !== signupData.confirmPassword) {
        playDismiss();
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      // Validate password length
      if (signupData.password.length < 6) {
        playDismiss();
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      // Extract campus and batch from email
      const campus = getCampusFromEmail(signupData.email);
      const batch = getBatchFromEmail(signupData.email);

      const { data, error: signUpError } = await signUp({
        email: signupData.email,
        password: signupData.password,
        name: signupData.name,
        campus,
        batch,
        department: 'CS', // Default, user can update later
      });

      if (signUpError || !data) {
        playDismiss();
        setError(signUpError?.message || 'Signup failed');
        setLoading(false);
        return;
      }

      playConfirm();
      // Brief wait for auth state to sync
      await new Promise(resolve => setTimeout(resolve, 500));
      // Redirect to profile edit to complete profile
      router.push('/profile/edit');
    } catch (err: any) {
      playDismiss();
      setError(err.message || 'Signup failed');
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-8">
      {/* Toggle Switch */}
      <div className="relative flex items-center gap-12">
        <button
          onClick={() => {
            playClick();
            setIsSignUp(false);
            setError('');
          }}
          className={`text-sm font-black uppercase ${
            !isSignUp ? 'underline' : ''
          }`}
        >
          Log in
        </button>

        <label className="relative w-12 h-5 cursor-pointer">
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
          <div className="w-full h-full border-3 border-black bg-[#e5e5f7] rounded-md shadow-[4px_4px_0_#000] transition-colors">
            <div
              className={`absolute w-5 h-5 bg-[#e5e5f7] border-3 border-black rounded-md shadow-[0_3px_0_#000] -top-[3px] transition-transform ${
                isSignUp ? 'translate-x-[28px]' : 'translate-x-[-3px]'
              }`}
            />
          </div>
        </label>

        <button
          onClick={() => {
            playClick();
            setIsSignUp(true);
            setError('');
          }}
          className={`text-sm font-black uppercase ${
            isSignUp ? 'underline' : ''
          }`}
        >
          Sign up
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="w-[300px] p-3 bg-red-100 border-3 border-red-600 rounded-md shadow-[4px_4px_0_#000] text-sm font-bold text-red-800 text-center">
          {error}
        </div>
      )}

      {/* Card Container */}
      <div className="relative w-[300px] h-[420px]" style={{ perspective: '1000px' }}>
        <div
          className="relative w-full h-full transition-transform duration-700"
          style={{
            transformStyle: 'preserve-3d',
            transform: isSignUp ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Login Card (Front) */}
          <div
            className="absolute w-full h-full bg-[#e5e5f7] border-3 border-black rounded-md shadow-[4px_4px_0_#000] p-7 flex flex-col items-center justify-center"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <h2 className="text-4xl font-black uppercase tracking-[-2px] mb-6">
              LOG IN
            </h2>
            <form onSubmit={handleLoginSubmit} className="w-full flex flex-col items-center gap-4">
              <input
                type="email"
                placeholder="k220123@nu.edu.pk"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
                disabled={loading}
                className="w-full h-11 px-4 border-3 border-black bg-white rounded-md shadow-[4px_4px_0_#000] text-sm font-semibold outline-none focus:shadow-[6px_6px_0_#000] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all disabled:opacity-50"
              />
              <input
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
                disabled={loading}
                className="w-full h-11 px-4 border-3 border-black bg-white rounded-md shadow-[4px_4px_0_#000] text-sm font-semibold outline-none focus:shadow-[6px_6px_0_#000] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                onMouseEnter={playHover}
                disabled={loading}
                className="mt-4 w-36 h-12 bg-black text-white border-3 border-black rounded-md shadow-[4px_4px_0_#000] font-black text-base uppercase active:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'WAIT...' : "LET'S GO!"}
              </button>
            </form>
            <p className="mt-4 text-xs text-gray-600 text-center">
              Use your FAST email
            </p>
          </div>

          {/* Sign Up Card (Back) */}
          <div
            className="absolute w-full h-full bg-[#e5e5f7] border-3 border-black rounded-md shadow-[4px_4px_0_#000] p-6 flex flex-col items-center justify-center"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <h2 className="text-3xl font-black uppercase tracking-[-2px] mb-3">
              SIGN UP
            </h2>
            <form onSubmit={handleSignupSubmit} className="w-full flex flex-col items-center gap-2.5">
              <input
                type="text"
                placeholder="Full Name"
                value={signupData.name}
                onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                required
                disabled={loading}
                className="w-full h-10 px-4 border-3 border-black bg-white rounded-md shadow-[4px_4px_0_#000] text-sm font-semibold outline-none focus:shadow-[6px_6px_0_#000] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all disabled:opacity-50"
              />
              <input
                type="email"
                placeholder="k220123@nu.edu.pk"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                required
                disabled={loading}
                className="w-full h-10 px-4 border-3 border-black bg-white rounded-md shadow-[4px_4px_0_#000] text-sm font-semibold outline-none focus:shadow-[6px_6px_0_#000] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all disabled:opacity-50"
              />
              <input
                type="password"
                placeholder="Password (6+ chars)"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                required
                disabled={loading}
                className="w-full h-10 px-4 border-3 border-black bg-white rounded-md shadow-[4px_4px_0_#000] text-sm font-semibold outline-none focus:shadow-[6px_6px_0_#000] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all disabled:opacity-50"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                required
                disabled={loading}
                className="w-full h-10 px-4 border-3 border-black bg-white rounded-md shadow-[4px_4px_0_#000] text-sm font-semibold outline-none focus:shadow-[6px_6px_0_#000] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all disabled:opacity-50"
              />
              <button
                onMouseEnter={playHover}
                type="submit"
                disabled={loading}
                className="mt-2 w-36 h-11 bg-black text-white border-3 border-black rounded-md shadow-[4px_4px_0_#000] font-black text-sm uppercase active:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'WAIT...' : 'CONFIRM!'}
              </button>
            </form>
            <p className="mt-3 text-xs text-gray-600 text-center">
              FAST email only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignupForm;

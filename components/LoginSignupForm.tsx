'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClickSound } from '@/hooks/useClickSound';
import { signIn, signUp } from '@/lib/supabase/api';
import { validateFastEmail, getCampusFromEmail, getBatchFromEmail, validatePassword } from '@/lib/validation';
import EmailVerification from '@/components/EmailVerification';
import styled from 'styled-components';

const LoginSignupForm = () => {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    setPasswordErrors([]);
    setLoading(true);

    try {
      const validation = validateFastEmail(signupData.email);
      if (!validation.isValid) {
        playDismiss();
        setError(validation.error || 'Invalid email');
        setLoading(false);
        return;
      }

      const passwordValidation = validatePassword(signupData.password);
      if (!passwordValidation.isValid) {
        playDismiss();
        setPasswordErrors(passwordValidation.errors);
        setError('Password does not meet requirements');
        setLoading(false);
        return;
      }

      if (signupData.password !== signupData.confirmPassword) {
        playDismiss();
        setError('Passwords do not match');
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

      {/* Small Loader Component */}
      <StyledWrapper>
        <div className="mini-loader" style={{ display: loading ? 'block' : 'none' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <path d="M10,20 C10,17.24 11.12,14.74 12.93,12.93 L12.93,12.93 C14.74,11.12 17.24,10 20,10 L80,10 C82.76,10 85.26,11.12 87.07,12.93 L87.07,12.93 C88.88,14.74 90,17.24 90,20 L90,80 C90,82.76 88.88,85.26 87.07,87.07 L87.07,87.07 C85.26,88.88 82.76,90 80,90 L20,90 C17.24,90 14.74,88.88 12.93,87.07 L12.93,87.07 C11.12,85.26 10,82.76 10,80Z M68,50 C68,45.02 65.98,40.52 62.72,37.27 L62.72,37.27 C59.47,34.01 54.97,32 50,32 L50,32 C45.02,32 40.52,34.01 37.27,37.27 L37.27,37.27 C34.01,40.52 32,45.02 32,50 L32,50 C32,54.97 34.01,59.47 37.27,62.72 L37.27,62.72 C40.52,65.98 45.02,68 50,68 L50,68 C54.97,68 59.47,65.98 62.72,62.72 L62.72,62.72 C65.98,59.47 68,54.97 68,50Z" />
            <path d="M10,20 C10,17.24 11.12,14.74 12.93,12.93 L12.93,12.93 C14.74,11.12 17.24,10 20,10 L80,10 C82.76,10 85.26,11.12 87.07,12.93 L87.07,12.93 C88.88,14.74 90,17.24 90,20 L90,80 C90,82.76 88.88,85.26 87.07,87.07 L87.07,87.07 C85.26,88.88 82.76,90 80,90 L20,90 C17.24,90 14.74,88.88 12.93,87.07 L12.93,87.07 C11.12,85.26 10,82.76 10,80Z" />
            <path d="M10,37.57 C10,34.92 11.05,32.37 12.92,30.5 L30.5,12.92 C32.37,11.05 34.92,10 37.57,10 L62.42,10 C65.07,10 67.62,11.05 69.49,12.92 L87.07,30.5 C88.94,32.37 90,34.92 90,37.57 L90,62.42 C90,65.07 88.94,67.62 87.07,69.49 L69.49,87.07 C67.62,88.94 65.07,90 62.42,90 L37.57,90 C34.92,90 32.37,88.94 30.5,87.07 L12.92,69.49 C11.05,67.62 10,65.07 10,62.42Z" />
            <path d="M10,50 C10,38.95 14.48,28.95 21.72,21.72 L21.72,21.72 C28.95,14.48 38.95,10 50,10 L50,10 C61.05,10 71.05,14.48 78.28,21.72 L78.28,21.72 C85.52,28.95 90,38.95 90,50 L90,50 C90,61.05 85.52,71.05 78.28,78.28 L78.28,78.28 C71.05,85.52 61.05,90 50,90 L50,90 C38.95,90 28.95,85.52 21.72,78.28 L21.72,78.28 C14.48,71.05 10,61.05 10,50Z" />
          </svg>
        </div>
      </StyledWrapper>

      {/* Error Message */}
      {error && (
        <div className="w-[320px] px-4 py-3 bg-[#ff4444] border border-[#cc0000] rounded-lg text-sm font-semibold text-white text-center">
          {error}
        </div>
      )}

      {/* Password Requirements */}
      {passwordErrors.length > 0 && (
        <div className="w-[320px] px-4 py-3 bg-[#2d2d2d] border-2 border-[#ff4444] rounded-lg">
          <p className="text-xs font-bold text-[#ff4444] mb-2">PASSWORD REQUIREMENTS:</p>
          <ul className="text-xs text-[#999] space-y-1">
            {passwordErrors.map((err, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#ff4444]">✗</span>
                <span>{err}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Password Strength Hint (always show on signup) */}
      {isSignUp && passwordErrors.length === 0 && (
        <div className="w-[320px] px-4 py-3 bg-[#2d2d2d] border-2 border-[#4387f4] rounded-lg">
          <p className="text-xs font-bold text-[#4387f4] mb-2">PASSWORD MUST HAVE:</p>
          <ul className="text-xs text-[#999] space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-[#4387f4]">•</span>
              <span>At least 8 characters</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#4387f4]">•</span>
              <span>One uppercase & one lowercase letter</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#4387f4]">•</span>
              <span>One number</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#4387f4]">•</span>
              <span>One special character (!@#$%^&*)</span>
            </li>
          </ul>
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
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Your Password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    minLength={6}
                    disabled={loading}
                    className="w-full h-12 px-4 pr-12 bg-[#1a1a1a] border-2 border-[#4387f4] rounded-lg text-white placeholder-[#666] text-sm font-semibold outline-none focus:border-[#5a9fff] transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-white transition-colors"
                  >
                    {showLoginPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                <button
                  type="submit"
                  onMouseEnter={playHover}
                  disabled={loading}
                  className="w-full h-10 bg-[#4387f4] hover:bg-[#1a3a7d] text-white border-2 border-black rounded-lg font-black text-sm uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  LET'S GO!
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
                <div className="relative">
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="Password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                    minLength={6}
                    disabled={loading}
                    className="w-full h-12 px-4 pr-12 bg-[#1a1a1a] border-2 border-[#4387f4] rounded-lg text-white placeholder-[#666] text-sm font-semibold outline-none focus:border-[#5a9fff] transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-white transition-colors"
                  >
                    {showSignupPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                    disabled={loading}
                    className="w-full h-12 px-4 pr-12 bg-[#1a1a1a] border-2 border-[#4387f4] rounded-lg text-white placeholder-[#666] text-sm font-semibold outline-none focus:border-[#5a9fff] transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                <button
                  type="submit"
                  onMouseEnter={playHover}
                  disabled={loading}
                  className="w-full h-10 bg-[#4387f4] hover:bg-[#1a3a7d] text-white border-2 border-black rounded-lg font-black text-sm uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  CONFIRM!
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StyledWrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  pointer-events: none;

  .mini-loader {
    --main-color: #4387f4;
  }

  .mini-loader svg {
    width: 60px;
    height: 60px;
    filter: drop-shadow(0 0 10px rgba(67, 135, 244, 0.5));
  }

  .mini-loader svg path:first-child {
    will-change: d;
    fill: var(--main-color);
    animation: morph 2s ease-in-out infinite;
  }

  .mini-loader svg path:not(:first-child) {
    fill: none;
    stroke: var(--main-color);
    stroke-width: 0;
  }

  .mini-loader svg path:nth-child(2) {
    stroke-width: 2;
    stroke-dasharray: 400;
    animation: snake-1 2s ease-in-out infinite;
  }

  .mini-loader svg path:nth-child(3) {
    stroke-width: 2;
    stroke-dasharray: 400;
    animation: snake-2 2s ease-in-out infinite;
  }

  .mini-loader svg path:nth-child(4) {
    stroke-width: 2;
    stroke-dasharray: 400;
    animation: snake-3 2s ease-in-out infinite;
  }

  @keyframes morph {
    0%,
    100% {
      d: path("M10,20 C10,17.24 11.12,14.74 12.93,12.93 L12.93,12.93 C14.74,11.12 17.24,10 20,10 L80,10 C82.76,10 85.26,11.12 87.07,12.93 L87.07,12.93 C88.88,14.74 90,17.24 90,20 L90,80 C90,82.76 88.88,85.26 87.07,87.07 L87.07,87.07 C85.26,88.88 82.76,90 80,90 L20,90 C17.24,90 14.74,88.88 12.93,87.07 L12.93,87.07 C11.12,85.26 10,82.76 10,80Z M68,50 C68,45.02 65.98,40.52 62.72,37.27 L62.72,37.27 C59.47,34.01 54.97,32 50,32 L50,32 C45.02,32 40.52,34.01 37.27,37.27 L37.27,37.27 C34.01,40.52 32,45.02 32,50 L32,50 C32,54.97 34.01,59.47 37.27,62.72 L37.27,62.72 C40.52,65.98 45.02,68 50,68 L50,68 C54.97,68 59.47,65.98 62.72,62.72 L62.72,62.72 C65.98,59.47 68,54.97 68,50Z");
    }
    25% {
      d: path("M10,37.57 C10,34.92 11.05,32.37 12.92,30.5 L30.5,12.92 C32.37,11.05 34.92,10 37.57,10 L62.42,10 C65.07,10 67.62,11.05 69.49,12.92 L87.07,30.5 C88.94,32.37 90,34.92 90,37.57 L90,62.42 C90,65.07 88.94,67.62 87.07,69.49 L69.49,87.07 C67.62,88.94 65.07,90 62.42,90 L37.57,90 C34.92,90 32.37,88.94 30.5,87.07 L12.92,69.49 C11.05,67.62 10,65.07 10,62.42Z M68,50 C68,45.02 65.98,40.52 62.72,37.27 L62.72,37.27 C59.47,34.01 54.97,32 50,32 L50,32 C45.02,32 40.52,34.01 37.27,37.27 L37.27,37.27 C34.01,40.52 32,45.02 32,50 L32,50 C32,54.97 34.01,59.47 37.27,62.72 L37.27,62.72 C40.52,65.98 45.02,68 50,68 L50,68 C54.97,68 59.47,65.98 62.72,62.72 L62.72,62.72 C65.98,59.47 68,54.97 68,50Z");
    }
    50% {
      d: path("M10,50 C10,38.95 14.48,28.95 21.72,21.72 L21.72,21.72 C28.95,14.48 38.95,10 50,10 L50,10 C61.05,10 71.05,14.48 78.28,21.72 L78.28,21.72 C85.52,28.95 90,38.95 90,50 L90,50 C90,61.05 85.52,71.05 78.28,78.28 L78.28,78.28 C71.05,85.52 61.05,90 50,90 L50,90 C38.95,90 28.95,85.52 21.72,78.28 L21.72,78.28 C14.48,71.05 10,61.05 10,50Z M68,50 C68,45.02 65.98,40.52 62.72,37.27 L62.72,37.27 C59.47,34.01 54.97,32 50,32 L50,32 C45.02,32 40.52,34.01 37.27,37.27 L37.27,37.27 C34.01,40.52 32,45.02 32,50 L32,50 C32,54.97 34.01,59.47 37.27,62.72 L37.27,62.72 C40.52,65.98 45.02,68 50,68 L50,68 C54.97,68 59.47,65.98 62.72,62.72 L62.72,62.72 C65.98,59.47 68,54.97 68,50Z");
    }
    75% {
      d: path("M10,37.57 C10,34.92 11.05,32.37 12.92,30.5 L30.5,12.92 C32.37,11.05 34.92,10 37.57,10 L62.42,10 C65.07,10 67.62,11.05 69.49,12.92 L87.07,30.5 C88.94,32.37 90,34.92 90,37.57 L90,62.42 C90,65.07 88.94,67.62 87.07,69.49 L69.49,87.07 C67.62,88.94 65.07,90 62.42,90 L37.57,90 C34.92,90 32.37,88.94 30.5,87.07 L12.92,69.49 C11.05,67.62 10,65.07 10,62.42Z M68,50 C68,45.02 65.98,40.52 62.72,37.27 L62.72,37.27 C59.47,34.01 54.97,32 50,32 L50,32 C45.02,32 40.52,34.01 37.27,37.27 L37.27,37.27 C34.01,40.52 32,45.02 32,50 L32,50 C32,54.97 34.01,59.47 37.27,62.72 L37.27,62.72 C40.52,65.98 45.02,68 50,68 L50,68 C54.97,68 59.47,65.98 62.72,62.72 L62.72,62.72 C65.98,59.47 68,54.97 68,50Z");
    }
  }

  @keyframes snake-1 {
    0%,
    10%,
    100% {
      stroke-dashoffset: 800;
    }
    20%,
    70% {
      stroke-dashoffset: 0;
    }
    80%,
    90% {
      stroke-dashoffset: -800;
    }
  }

  @keyframes snake-2 {
    0%,
    20%,
    100% {
      stroke-dashoffset: 800;
    }
    30%,
    60% {
      stroke-dashoffset: 0;
    }
    70%,
    90% {
      stroke-dashoffset: -800;
    }
  }

  @keyframes snake-3 {
    0%,
    30%,
    100% {
      stroke-dashoffset: 800;
    }
    40%,
    50% {
      stroke-dashoffset: 0;
    }
    60%,
    90% {
      stroke-dashoffset: -800;
    }
  }
`;

export default LoginSignupForm;

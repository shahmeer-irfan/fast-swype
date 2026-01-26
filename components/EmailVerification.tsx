'use client';

import React, { useState, useEffect } from 'react';
import { useClickSound } from '@/hooks/useClickSound';
import { resendVerificationEmail } from '@/lib/supabase/api';

interface EmailVerificationProps {
  email: string;
  onClose?: () => void;
}

const EmailVerification = ({ email, onClose }: EmailVerificationProps) => {
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const { playClick, playConfirm, playDismiss } = useClickSound();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (canResend && !resending) {
      setResending(true);
      setResendMessage('');
      
      const { success, error } = await resendVerificationEmail(email);
      
      if (success) {
        playConfirm();
        setResendMessage('✓ Email sent! Check your inbox.');
        setCountdown(60);
        setCanResend(false);
      } else {
        playDismiss();
        setResendMessage(error?.message || 'Failed to resend email');
      }
      
      setResending(false);
      
      // Clear message after 5 seconds
      setTimeout(() => setResendMessage(''), 5000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80">
      <div className="relative w-full max-w-md bg-[#2d2d2d] border-4 border-[#4387f4] shadow-[8px_8px_0_#4387f4] p-8 animate-slideUp">
        {/* Animated Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24 bg-[#1a1a1a] border-4 border-[#4387f4] shadow-[4px_4px_0_#4387f4] flex items-center justify-center animate-bounce">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="#4387f4"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#00ff00] border-2 border-black rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-black">✓</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black uppercase text-center text-white mb-3 tracking-tight">
          Check Your Email!
        </h2>

        {/* Message */}
        <div className="bg-[#1a1a1a] border-2 border-[#4387f4] p-4 mb-6">
          <p className="text-sm font-semibold text-white text-center mb-2">
            We've sent a verification link to:
          </p>
          <p className="text-base font-black text-[#4387f4] text-center break-all">
            {email}
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#4387f4] border-2 border-black flex items-center justify-center shrink-0 font-black text-white">
              1
            </div>
            <p className="text-sm font-semibold text-white pt-1">
              Open your email inbox
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#4387f4] border-2 border-black flex items-center justify-center shrink-0 font-black text-white">
              2
            </div>
            <p className="text-sm font-semibold text-white pt-1">
              Click the verification link
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#4387f4] border-2 border-black flex items-center justify-center shrink-0 font-black text-white">
              3
            </div>
            <p className="text-sm font-semibold text-white pt-1">
              Come back and log in!
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-[#4387f4] bg-opacity-10 border-2 border-[#4387f4] p-3 mb-6">
          <p className="text-xs font-semibold text-white text-center">
            ⚠️ Check your spam folder if you don't see it in a few minutes
          </p>
        </div>

        {/* Resend Button */}
        <button
          onClick={handleResend}
          disabled={!canResend || resending}
          className={`w-full py-3 text-sm font-black uppercase border-2 border-black transition-all mb-3 ${
            canResend && !resending
              ? 'bg-[#4387f4] text-white shadow-[4px_4px_0_#2c5aa0] hover:shadow-[6px_6px_0_#2c5aa0] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-1 active:translate-y-1 cursor-pointer'
              : 'bg-[#1a1a1a] text-[#666] cursor-not-allowed'
          }`}
        >
          {resending ? 'Sending...' : canResend ? 'Resend Email' : `Resend in ${countdown}s`}
        </button>

        {/* Resend Message */}
        {resendMessage && (
          <div className={`mb-3 p-2 text-xs font-bold text-center border-2 ${
            resendMessage.includes('✓') 
              ? 'bg-[#00ff00] bg-opacity-20 border-[#00ff00] text-[#00ff00]' 
              : 'bg-[#ff4444] bg-opacity-20 border-[#ff4444] text-[#ff4444]'
          }`}>
            {resendMessage}
          </div>
        )}

        {/* Close Button */}
        {onClose && (
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="w-full py-3 text-sm font-black uppercase bg-[#1a1a1a] text-white border-2 border-[#4387f4] shadow-[4px_4px_0_#4387f4] hover:shadow-[6px_6px_0_#4387f4] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
          >
            Close
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EmailVerification;

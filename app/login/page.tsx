"use client";

import BrutalistPattern from "@/components/BrutalistPattern";
import Tooltip from "@/components/Tooltip";
import LoginSignupForm from "@/components/LoginSignupForm";
import Link from "next/link";
import { useClickSound } from "@/hooks/useClickSound";

export default function LoginPage() {
  const { playClick, playHover } = useClickSound();
  return (
    <div className="relative min-h-screen">
      <BrutalistPattern />
      <Tooltip 
        message="Use your FAST university email (e.g., k230123@nu.edu.pk) to sign up or log in. Your campus and batch will be auto-detected!"
        storageKey="login_instructions"
        delay={1500}
      />
      
      <main className="min-h-screen flex items-center justify-center p-5 relative z-10">
        <div className="w-full max-w-[450px] flex flex-col items-center gap-6 relative pt-16">
          {/* Back Button */}
          <Link href="/" className="absolute -top-4 left-0">
            <button 
              onClick={playClick}
              onMouseEnter={playHover}
              className="px-4 py-2 text-2xl font-black bg-white text-[#58A0C8] border-3 border-black rounded shadow-[4px_4px_0_#113F67] hover:shadow-[6px_6px_0_#113F67] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              ←
            </button>
          </Link>

          {/* Brand Section */}
          <div className="text-center">
            <h1 className="text-5xl font-black uppercase tracking-[-3px] leading-none text-[#113F67] mb-2">
              FastSwype
            </h1>
            <p className="text-base font-bold text-[#666]">Get started now!</p>
          </div>

          {/* Form */}
          <div className="w-full flex justify-center mt-2">
            <LoginSignupForm />
          </div>

          {/* Footer */}
          <p className="text-sm font-bold text-[#666] text-center mt-2">
            No commitment. Just vibes. 🤙
          </p>
        </div>
      </main>
    </div>
  );
}

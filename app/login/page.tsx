"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import BrutalistPattern from "@/components/BrutalistPattern";
import Tooltip from "@/components/Tooltip";
import LoginSignupForm from "@/components/LoginSignupForm";
import Link from "next/link";
import { useClickSound } from "@/hooks/useClickSound";

export default function LoginPage() {
  const { playClick, playHover, playConfirm } = useClickSound();
  const searchParams = useSearchParams();
  const [verificationMessage, setVerificationMessage] = useState("");

  useEffect(() => {
    // Check if user just confirmed email
    const type = searchParams?.get("type");
    const error = searchParams?.get("error");
    const errorDescription = searchParams?.get("error_description");

    if (type === "signup") {
      if (error) {
        setVerificationMessage(`Verification failed: ${errorDescription || error}`);
      } else {
        playConfirm();
        setVerificationMessage("✓ Email verified! Please log in.");
        // Clear message after 10 seconds
        setTimeout(() => setVerificationMessage(""), 10000);
      }
    }
  }, [searchParams, playConfirm]);

  return (
    <div className="relative min-h-screen">\n      <BrutalistPattern />
      <Tooltip 
        message="Use your FAST university email (e.g., k230123@nu.edu.pk) to sign up or log in. Your campus and batch will be auto-detected!"
        storageKey="login_instructions"
        delay={1500}
      />
      
      <main className="min-h-screen flex items-center justify-center p-5 relative z-10">
        <div className="w-full max-w-[450px] flex flex-col items-center gap-6 relative pt-16">\n          {/* Verification Success Message */}
          {verificationMessage && (
            <div className={`w-full px-4 py-3 border-2 text-sm font-bold text-center ${
              verificationMessage.includes("✓")
                ? "bg-[#00ff00] bg-opacity-20 border-[#00ff00] text-[#00ff00]"
                : "bg-[#ff4444] bg-opacity-20 border-[#ff4444] text-[#ff4444]"
            }`}>
              {verificationMessage}
            </div>
          )}
          {/* Back Button */}
          <Link href="/" className="absolute -top-4 left-0">
            <button 
              onClick={playClick}
              onMouseEnter={playHover}
              className="px-4 py-2 text-2xl font-black bg-[#2d2d2d] text-[#4387f4] border-3 border-[#4387f4] rounded shadow-[4px_4px_0_#4387f4] hover:shadow-[6px_6px_0_#4387f4] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              ←
            </button>
          </Link>

          {/* Brand Section */}
          <div className="text-center">
            <h1 className="text-5xl font-black uppercase tracking-[-3px] leading-none text-white mb-2">
              FastSwype
            </h1>
            <p className="text-base font-bold ">Find Your Fyp Soulmate</p>
          </div>

          {/* Form */}
          <div className="w-full flex justify-center mt-2">
            <LoginSignupForm />
          </div>

          {/* Footer */}
          <p className="text-sm text-[#999] text-center mt-2">
            you're just a few steps away from finding your fyp partner!
          </p>
        </div>
      </main>
    </div>
  );
}

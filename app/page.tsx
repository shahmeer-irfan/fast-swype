"use client";

import Link from "next/link";
import Image from "next/image";
import BrutalistPattern from "@/components/BrutalistPattern";
import Tooltip from "@/components/Tooltip";
import { useClickSound } from "@/hooks/useClickSound";
import { TargetIcon, LightningBoltIcon, HeartIcon } from "@radix-ui/react-icons";

export default function Home() {
  const { playConfirm, playHover } = useClickSound();
  return (
    <div className="relative">
      <BrutalistPattern />
      <Tooltip 
        message="Welcome to FastSwype! Find your perfect FYP partner from FAST students. Swipe, match, and collaborate for just 250 PKR!"
        storageKey="home_welcome"
        delay={1000}
      />
      <main className="min-h-screen flex items-center justify-center p-5 relative">
        <div className="w-full max-w-md flex flex-col items-center gap-4">
          {/* Logo/Brand */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path opacity="0.3" d="M9 6C9 7.65685 7.65685 9 6 9C4.34315 9 3 7.65685 3 6C3 4.34315 4.34315 3 6 3C7.65685 3 9 4.34315 9 6Z" fill="#4387f4"></path>
                  <path opacity="0.3" d="M21 18C21 19.6569 19.6569 21 18 21C16.3431 21 15 19.6569 15 18C15 16.3431 16.3431 15 18 15C19.6569 15 21 16.3431 21 18Z" fill="#4387f4"></path>
                  <path d="M9 6C9 7.65685 7.65685 9 6 9C4.34315 9 3 7.65685 3 6C3 4.34315 4.34315 3 6 3C7.65685 3 9 4.34315 9 6Z" stroke="#4387f4" strokeWidth="2"></path>
                  <path d="M21 18C21 19.6569 19.6569 21 18 21C16.3431 21 15 19.6569 15 18C15 16.3431 16.3431 15 18 15C19.6569 15 21 16.3431 21 18Z" stroke="#4387f4" strokeWidth="2"></path>
                  <path d="M15 3L12.0605 5.93945V5.93945C12.0271 5.97289 12.0271 6.02711 12.0605 6.06055V6.06055L15 9" stroke="#4387f4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path d="M9 21L11.9473 18.0527V18.0527C11.9764 18.0236 11.9764 17.9764 11.9473 17.9473V17.9473L9 15" stroke="#4387f4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path d="M12 6C14.8284 6 16.2426 6 17.1213 6.87868C18 7.75736 18 9.17157 18 12V15" stroke="#4387f4" strokeWidth="2"></path>
                  <path d="M12 18C9.17157 18 7.75736 18 6.87868 17.1213C6 16.2426 6 14.8284 6 12L6 9" stroke="#4387f4" strokeWidth="2"></path>
                </svg>
              </div>
              <h1 className="uppercase tracking-[-2px] leading-none text-white">
                FastSwype
              </h1>
            </div>
            <p className="text-base font-black text-white max-w-[320px] mx-auto leading-tight mb-1">
              Find Your FYP Soulmate
            </p>
          </div>

          {/* Features */}
          <div className="w-full flex flex-col gap-2.5">
            <div 
              onMouseEnter={playHover}
              className="flex items-center gap-3 bg-[#2d2d2d] border-3 border-[#4387f4] p-3 shadow-[4px_4px_0_#4387f4] hover:shadow-[6px_6px_0_#4387f4] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              <div className="w-9 h-9 bg-[#4387f4] border-2 border-[#4387f4] flex items-center justify-center shrink-0">
                <LightningBoltIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-black uppercase text-white mb-0.5 tracking-tight">
                  BUILD PROFILE
                </h3>
                <p className="text-[9px] font-semibold text-[#999] leading-tight">
                  Show what you can offer and what you need
                </p>
              </div>
            </div>

            <div 
              onMouseEnter={playHover}
              className="flex items-center gap-3 bg-[#2d2d2d] border-3 border-[#4387f4] p-3 shadow-[4px_4px_0_#4387f4] hover:shadow-[6px_6px_0_#4387f4] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              <div className="w-9 h-9 bg-[#4387f4] border-2 border-[#4387f4] flex items-center justify-center shrink-0">
                <TargetIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-black uppercase text-white mb-0.5 tracking-tight">
                  FIND YOUR MATCH
                </h3>
                <p className="text-[9px] font-semibold text-[#999] leading-tight">
                  Swipe left or right to your fyp partner
                </p>
              </div>
            </div>
            <div 
              onMouseEnter={playHover}
              className="flex items-center gap-3 bg-[#2d2d2d] border-3 border-[#4387f4] p-3 shadow-[4px_4px_0_#4387f4] hover:shadow-[6px_6px_0_#4387f4] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              <div className="w-9 h-9 bg-[#4387f4] border-2 border-[#4387f4] flex items-center justify-center shrink-0">
                <HeartIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-black uppercase text-white mb-0.5 tracking-tight">
                  Send proposals
                </h3>
                <p className="text-[9px] font-semibold text-[#999] leading-tight">
                 Send two proposals for free.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="w-full text-center">
            <Link href="/login">
              <button 
                onClick={playConfirm}
                onMouseEnter={playHover}
                className="w-full py-3 text-4xl font-black uppercase bg-[#4387f4] text-white border-3 border-[#4387f4] shadow-[6px_6px_0_#2c5aa0] tracking-tight mb-1.5 hover:shadow-[8px_8px_0_#2c5aa0] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-1.5 active:translate-y-1.5 transition-all"
              >
                LET'S GO
              </button>
            </Link>
          </div>

          {/* Footer */}
          <div className="w-full text-center">
            <p className="text-[10px] font-black uppercase text-[#999] tracking-wide mb-2">
              FAST STUDENTS ONLY • 250PKR TO UNLOCK FULL ACCESS
            </p>
            <a 
              href="https://bento.me/shahmpooh" 
              target="_blank" 
              rel="noopener noreferrer"
              onMouseEnter={playHover}
              className="inline-flex items-center gap-2 px-3 py-3 text-[10px] font-black uppercase bg-[#2d2d2d] text-white border-2 border-[#4387f4] shadow-[3px_3px_0_#4387f4] hover:shadow-[4px_4px_0_#4387f4] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
            >
              <HeartIcon className="w-4 h-4" /> Connect with Creator
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

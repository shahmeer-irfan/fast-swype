"use client";

import Link from "next/link";
import BrutalistPattern from "@/components/BrutalistPattern";
import { useClickSound } from "@/hooks/useClickSound";
import { RocketIcon, TargetIcon, LightningBoltIcon, HeartIcon } from "@radix-ui/react-icons";

export default function Home() {
  const { playConfirm, playHover } = useClickSound();
  return (
    <div className="relative">
      <BrutalistPattern />
      <main className="min-h-screen flex items-center justify-center p-5 relative">
        <div className="w-full max-w-[420px] flex flex-col items-center gap-4">
          {/* Logo/Brand */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <RocketIcon className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[-3px] leading-none text-black mb-3">
              FastSwype
            </h1>
            <p className="text-base font-black text-black max-w-[320px] mx-auto leading-tight mb-1">
              Find Your FYP Partner for Just PKR 250!
            </p>
            <p className="text-xs font-bold text-[#666] max-w-[320px] mx-auto leading-tight">
              (~$1) • Get 2 FREE proposals to try first
            </p>
          </div>

          {/* Features */}
          <div className="w-full flex flex-col gap-2.5">
            <div 
              onMouseEnter={playHover}
              className="flex items-center gap-3 bg-white border-3 border-black p-3 shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              <div className="w-9 h-9 bg-black border-2 border-black flex items-center justify-center shrink-0">
                <LightningBoltIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-[10px] font-black uppercase text-black mb-0.5 tracking-tight">
                  SWIPE TO MATCH
                </h3>
                <p className="text-[10px] font-semibold text-[#666] leading-tight">
                  Like Tinder, but for your 4.0 GPA dreams
                </p>
              </div>
            </div>

            <div 
              onMouseEnter={playHover}
              className="flex items-center gap-3 bg-white border-3 border-black p-3 shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              <div className="w-9 h-9 bg-black border-2 border-black flex items-center justify-center shrink-0">
                <TargetIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-[10px] font-black uppercase text-black mb-0.5 tracking-tight">
                  2 FREE TRIES
                </h3>
                <p className="text-[10px] font-semibold text-[#666] leading-tight">
                  Test it out before committing just 250 PKR
                </p>
              </div>
            </div>

            <div 
              onMouseEnter={playHover}
              className="flex items-center gap-3 bg-white border-3 border-black p-3 shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              <div className="w-9 h-9 bg-black border-2 border-black flex items-center justify-center shrink-0">
                <HeartIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-[10px] font-black uppercase text-black mb-0.5 tracking-tight">
                  ONLY FAST STUDENTS
                </h3>
                <p className="text-[10px] font-semibold text-[#666] leading-tight">
                  No randos. Just your classmates who get it.
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
                className="w-full py-3 text-xl font-black uppercase bg-black text-white border-3 border-black shadow-[6px_6px_0_#000] tracking-tight mb-1.5 hover:shadow-[8px_8px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-1.5 active:translate-y-1.5 transition-all"
              >
                LET'S GO
              </button>
            </Link>
            <p className="text-[10px] font-bold text-[#666]">
              Already have an account? Just log in there →
            </p>
          </div>

          {/* Footer */}
          <div className="w-full text-center">
            <p className="text-[9px] font-black uppercase text-[#666] tracking-wide mb-2">
              FAST STUDENTS ONLY • NO JUDGEMENT ZONE
            </p>
            <a 
              href="https://bento.me/shahmpooh" 
              target="_blank" 
              rel="noopener noreferrer"
              onMouseEnter={playHover}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-[9px] font-black uppercase bg-white border-2 border-black shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
            >
              <HeartIcon className="w-3 h-3" /> Connect with Creator
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

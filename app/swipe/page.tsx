"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import SwipeCard from "@/components/SwipeCard";
import BrutalistPattern from "@/components/BrutalistPattern";
import Link from "next/link";
import { useClickSound } from "@/hooks/useClickSound";
import { usePageLoader } from "@/hooks/usePageLoader";
import Loader from "@/components/Loader";
import Tooltip from "@/components/Tooltip";
import { useAuth } from "@/lib/auth-context";
import { getUnswipedProfiles, recordSwipe } from "@/lib/supabase/api";
import { Profile } from "@/lib/supabase/client";
import { campuses, lookingForOptions } from "@/lib/data";

export default function SwipePage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [selectedCampus, setSelectedCampus] = useState<string>("All");
  const [selectedLookingFor, setSelectedLookingFor] = useState<string>("All");
  const [showFilters, setShowFilters] = useState(false);
  const { playClick, playHover, playDismiss } = useClickSound();
  const pageLoading = usePageLoader(1500);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  // Redirect to edit if profile is incomplete
  useEffect(() => {
    if (!loading && user && profile) {
      if (!profile.bio || !profile.domain || !profile.looking_for || 
          (profile.skills && profile.skills.length === 0)) {
        router.push('/profile/edit');
      }
    }
  }, [loading, user, profile, router]);

  // Load profiles
  useEffect(() => {
    if (user) {
      loadProfiles();
    }
  }, [user]);

  // Apply filters when profiles or filter selections change
  useEffect(() => {
    applyFilters();
  }, [profiles, selectedCampus, selectedLookingFor]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const applyFilters = () => {
    let filtered = [...profiles];

    // Apply campus filter
    if (selectedCampus !== "All") {
      filtered = filtered.filter(p => p.campus === selectedCampus);
    }

    // Apply looking_for filter
    if (selectedLookingFor !== "All") {
      filtered = filtered.filter(p => p.looking_for === selectedLookingFor);
    }

    setFilteredProfiles(filtered);
    setCurrentIndex(0); // Reset to first card when filters change
  };

  const handleClearFilters = () => {
    playClick();
    setSelectedCampus("All");
    setSelectedLookingFor("All");
  };

  const loadProfiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await getUnswipedProfiles(user.id);
      if (error) {
        console.error('Error loading profiles:', error);
        setProfiles([]);
      } else {
        // Randomize the order of profiles
        const shuffledProfiles = shuffleArray(data || []);
        setProfiles(shuffledProfiles);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
      setProfiles([]);
    } finally {
      setLoadingProfiles(false);
    }
  };

  if (loading || pageLoading || loadingProfiles) {
    return <Loader />;
  }

  if (!user) {
    return null;
  }

  const handleSwipe = async (direction: "left" | "right") => {
    const currentProfile = filteredProfiles[currentIndex];
    
    // Record swipe in database
    try {
      await recordSwipe(user!.id, currentProfile.id, direction);
    } catch (error) {
      console.error('Error recording swipe:', error);
      playDismiss();
    }

    // Move to next profile
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 300);
  };

  if (currentIndex >= filteredProfiles.length) {
    return (
      <StyledWrapper>
        <BrutalistPattern />
        <div className="completion-container">
          <div className="completion-card">
            <div className="completion-icon">✨</div>
            <h2 className="completion-title">That's All!</h2>
            <p className="completion-text">
              You've seen all available profiles. Check back later for more potential partners!
            </p>
            <div className="refresh-notice">
              <span className="refresh-icon">🔄</span>
              <span className="refresh-text">Refresh the page to load new profiles</span>
            </div>
            <div className="completion-buttons">
              <button 
                onClick={() => {
                  playClick();
                  window.location.reload();
                }}
                onMouseEnter={playHover}
                className="completion-button refresh-button"
              >
                Refresh Now
              </button>
              <Link href="/profile">
                <button 
                  onClick={playClick}
                  onMouseEnter={playHover}
                  className="completion-button"
                >
                  View Profile
                </button>
              </Link>
              <Link href="/proposals">
                <button 
                  onClick={playClick}
                  onMouseEnter={playHover}
                  className="completion-button secondary"
                >
                  View Proposals
                </button>
              </Link>
            </div>
          </div>
        </div>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
      <BrutalistPattern />
      <Tooltip 
        message="Swipe left to pass, right to send a proposal! Unlimited proposals — go wild!"
        storageKey="swipe_intro"
        delay={1000}
      />
      <div className="swipe-container">
        {/* Header */}
        <div className="header">
          <Link href="/">
            <h1 className="logo" onMouseEnter={playHover}>FastSwype</h1>
          </Link>
          <div className="header-buttons">
            <Link href="/proposals">
              <button 
                onClick={playClick}
                onMouseEnter={playHover}
                className="proposals-button"
                title="View Proposals"
              >
                <span className="button-icon">📋</span>
              </button>
            </Link>
            <Link href="/profile">
              <button 
                onClick={playClick}
                onMouseEnter={playHover}
                className="profile-button"
                title="View Profile"
              >
                <span className="profile-icon">👤</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Filters Section */}
        <div className="filters-container">
          <button 
            className="filters-toggle"
            onClick={() => {
              playClick();
              setShowFilters(!showFilters);
            }}
            onMouseEnter={playHover}
          >
            <span className="filter-icon">🛠️</span>
            <span className="filter-text">FILTERS</span>
            <span className="filter-arrow">{showFilters ? '▲' : '▼'}</span>
          </button>

          {showFilters && (
            <div className="filters-panel">
              <div className="filter-group">
                <label className="filter-label">CAMPUS</label>
                <select
                  className="filter-select"
                  value={selectedCampus}
                  onChange={(e) => {
                    playClick();
                    setSelectedCampus(e.target.value);
                  }}
                  onMouseEnter={playHover}
                >
                  <option value="All">All Campuses</option>
                  {campuses.map((campus) => (
                    <option key={campus} value={campus}>{campus}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">LOOKING FOR</label>
                <select
                  className="filter-select"
                  value={selectedLookingFor}
                  onChange={(e) => {
                    playClick();
                    setSelectedLookingFor(e.target.value);
                  }}
                  onMouseEnter={playHover}
                >
                  <option value="All">All Types</option>
                  {lookingForOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {(selectedCampus !== "All" || selectedLookingFor !== "All") && (
                <button 
                  className="clear-filters-button"
                  onClick={handleClearFilters}
                  onMouseEnter={playHover}
                >
                  ✖ CLEAR FILTERS
                </button>
              )}

              <div className="filter-results">
                🎯 {filteredProfiles.length} profile{filteredProfiles.length !== 1 ? 's' : ''} found
              </div>
            </div>
          )}
        </div>

        {/* Cards Container */}
        <div className="cards-wrapper">
          <div className="card-container" key={currentIndex}>
            <SwipeCard
              key={filteredProfiles[currentIndex].id}
              profile={filteredProfiles[currentIndex]}
              onSwipe={handleSwipe}
            />
          </div>

          {/* Counter */}
          <div className="counter">
            <span className="counter-text">
              {currentIndex + 1} / {filteredProfiles.length}
            </span>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .swipe-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 20px;
    position: relative;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 500px;
    margin: 0 auto 40px;
    width: 100%;
  }

  .logo {
    font-size: 36px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -2px;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s;
  }

  .logo:hover {
    transform: scale(1.05);
  }

  .header-buttons {
    display: flex;
    gap: 12px;
  }

  .profile-button,
  .proposals-button {
    width: 48px;
    height: 48px;
    background: #4387f4;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #2c5aa0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }

  .profile-button::after,
  .proposals-button::after {
    content: attr(title);
    position: absolute;
    bottom: -40px;
    left: 50%;
    transform: translateX(-50%);
    background: #4387f4;
    color: #fff;
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    white-space: nowrap;
    border: 2px solid #000;
    box-shadow: 3px 3px 0 #2c5aa0;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
    z-index: 1000;
  }

  .profile-button:hover::after,
  .proposals-button:hover::after {
    opacity: 1;
  }

  .profile-button:hover,
  .proposals-button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #4387f4;
  }

  .profile-button:active,
  .proposals-button:active {
    transform: translate(4px, 4px);
    box-shadow: none;
  }

  .profile-icon,
  .button-icon {
    font-size: 24px;
    color: #ffffff;
  }

  /* Filters Section */
  .filters-container {
    max-width: 500px;
    margin: 0 auto 30px;
    width: 100%;
  }

  .filters-toggle {
    width: 100%;
    background: #4387f4;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #2c5aa0;
    padding: 14px 20px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 900;
    text-transform: uppercase;
    color: #ffffff;
  }

  .filters-toggle:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #2c5aa0;
  }

  .filters-toggle:active {
    transform: translate(4px, 4px);
    box-shadow: none;
  }

  .filter-icon {
    font-size: 18px;
  }

  .filter-arrow {
    margin-left: auto;
    font-size: 12px;
  }

  .filters-panel {
    background: #2d2d2d;
    border: 3px solid #000;
    border-top: none;
    box-shadow: 4px 4px 0 #2c5aa0;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    animation: slideDown 0.3s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .filter-label {
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    color: #4387f4;
    letter-spacing: 1px;
  }

  .filter-select {
    background: #1a1a1a;
    border: 3px solid #000;
    box-shadow: 3px 3px 0 #4387f4;
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s;
  }

  .filter-select:hover {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0 #4387f4;
  }

  .filter-select:focus {
    outline: none;
    border-color: #4387f4;
    box-shadow: 0 0 0 3px rgba(67, 135, 244, 0.3);
  }

  .filter-select option {
    background: #1a1a1a;
    color: #ffffff;
    font-weight: 700;
  }

  .clear-filters-button {
    background: #ff4444;
    border: 3px solid #000;
    box-shadow: 3px 3px 0 #cc0000;
    padding: 10px 20px;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .clear-filters-button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0 #cc0000;
  }

  .clear-filters-button:active {
    transform: translate(3px, 3px);
    box-shadow: none;
  }

  .filter-results {
    background: #4387f4;
    border: 3px solid #000;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 900;
    text-transform: uppercase;
    color: #ffffff;
    text-align: center;
    box-shadow: 3px 3px 0 #2c5aa0;
  }

  .cards-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 30px;
  }

  .card-container {
    display: flex;
    justify-content: center;
    align-items: center;
    animation: slideInFromRight 0.4s ease-out;
  }

  @keyframes slideInFromRight {
    from {
      opacity: 0;
      transform: translateX(100px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }

  .counter {
    background: #2d2d2d;
    border: 3px solid #000;
    padding: 8px 20px;
    box-shadow: 4px 4px 0 #4387f4;
  }

  .counter-text {
    font-size: 14px;
    font-weight: 900;
    text-transform: uppercase;
    color: #ffffff;
  }

  .completion-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    position: relative;
  }

  .completion-card {
    background: #2d2d2d;
    border: 4px solid #000;
    padding: 60px 40px;
    box-shadow: 10px 10px 0 #4387f4;
    text-align: center;
    max-width: 500px;
    width: 100%;
  }

  .completion-icon {
    font-size: 72px;
    margin-bottom: 30px;
  }

  .completion-title {
    font-size: 42px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -2px;
    margin-bottom: 15px;
    color: #ffffff;
  }

  .completion-text {
    font-size: 14px;
    font-weight: 600;
    color: #999;
    margin-bottom: 20px;
    line-height: 1.4;
  }

  .refresh-notice {
    background: #4387f4;
    border: 3px solid #000;
    padding: 16px 24px;
    margin-bottom: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      box-shadow: 4px 4px 0 #2c5aa0;
    }
    50% {
      transform: scale(1.02);
      box-shadow: 6px 6px 0 #2c5aa0;
    }
  }

  .refresh-icon {
    font-size: 24px;
    animation: rotate 3s linear infinite;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .refresh-text {
    font-size: 14px;
    font-weight: 900;
    text-transform: uppercase;
    color: #ffffff;
    letter-spacing: 0.5px;
  }

  .completion-buttons {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;
  }

  .completion-button {
    width: 100%;
    padding: 20px;
    font-size: 22px;
    font-weight: 900;
    text-transform: uppercase;
    background: #4387f4;
    color: #fff;
    border: 4px solid #000;
    box-shadow: 6px 6px 0 #2c5aa0;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: -1px;
  }

  .completion-button.refresh-button {
    background: #10b981;
    box-shadow: 6px 6px 0 #059669;
  }

  .completion-button.refresh-button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0 #059669;
  }

  .completion-button.secondary {
    background: #1a1a1a;
    color: #ffffff;
    box-shadow: 6px 6px 0 #4387f4;
  }

  .completion-button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0 #2c5aa0;
  }

  .completion-button.secondary:hover {
    background: #4387f4;
    color: #fff;
    box-shadow: 8px 8px 0 #2c5aa0;
  }

  .completion-button:active {
    transform: translate(6px, 6px);
    box-shadow: none;
  }

  @media (max-width: 640px) {
    .logo {
      font-size: 36px;
    }

    .profile-button {
      width: 50px;
      height: 50px;
    }

    .completion-title {
      font-size: 42px;
    }

    .completion-button {
      font-size: 18px;
      padding: 16px;
    }
  }
`;

"use client";

import styled from "styled-components";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrutalistPattern from "@/components/BrutalistPattern";
import { useClickSound } from "@/hooks/useClickSound";
import { usePageLoader } from "@/hooks/usePageLoader";
import Loader from "@/components/Loader";
import Tooltip from "@/components/Tooltip";
import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, user, loading } = useAuth();
  const { playClick, playHover } = useClickSound();
  const pageLoading = usePageLoader(1500);

  // Redirect to login if not authenticated
  if (!loading && !user) {
    router.push('/login');
    return null;
  }

  // Show loader while loading
  if (loading || pageLoading) {
    return <Loader />;
  }

  // Redirect to edit if profile is incomplete (first-time user) or doesn't exist
  if (!profile || !profile.name || !profile.bio || !profile.domain || !profile.looking_for || !profile.batch ||
      !profile.skills || profile.skills.length === 0 ||
      !profile.interests || profile.interests.length === 0) {
    router.push('/profile/edit');
    return <Loader />;
  }

  return (
    <StyledWrapper>
      <BrutalistPattern />
      <Tooltip 
        message="Make your profile stand out! Add skills and interests to get better matches."
        storageKey="profile_tips"
        delay={1500}
      />
      <div className="profile-container">
        <div className="header">
          <Link href="/swipe">
            <button 
              onClick={playClick}
              onMouseEnter={playHover}
              className="back-button"
            >
              ←
            </button>
          </Link>
          <h1 className="page-title">YOUR VIBE</h1>
          <Link href="/profile/edit">
            <button 
              onClick={playClick}
              onMouseEnter={playHover}
              className="edit-button"
            >
              EDIT
            </button>
          </Link>
        </div>

        <div className="content-wrapper">
          <div className="hero-card">
            <div className="hero-header">
              {/* Profile Picture */}
              {profile.profile_picture_url ? (
                <div className="profile-picture">
                  <img src={profile.profile_picture_url} alt={profile.name} />
                </div>
              ) : (
                <div className="profile-picture-placeholder">
                  <span className="profile-initial">{profile.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div className="hero-info">
                <div className="hero-name">{profile.name}</div>
                <div className="hero-meta">{profile.department} • {profile.batch} • {profile.campus}</div>
              </div>
            </div>
            <p className="hero-bio">{profile.bio || 'No bio yet. Edit your profile to add one!'}</p>
          </div>

          <div className="info-row">
            <div className="info-badge domain-badge">{profile.domain || 'Not Set'}</div>
            <div className="info-badge looking-badge">{profile.looking_for || 'Not Set'}</div>
          </div>

          <div className="section-card">
            <div className="section-title">SKILLS</div>
            <div className="tags-container">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((s: any, idx: number) => (
                  <span key={idx} className="tag">{s.skill}</span>
                ))
              ) : (
                <p className="empty-state">No skills added yet</p>
              )}
            </div>
          </div>

          <div className="section-card">
            <div className="section-title">INTERESTS</div>
            <div className="tags-container">
              {profile.interests && profile.interests.length > 0 ? (
                profile.interests.map((i: any, idx: number) => (
                  <span key={idx} className="tag interest-tag">#{i.interest}</span>
                ))
              ) : (
                <p className="empty-state">No interests added yet</p>
              )}
            </div>
          </div>

          <div className="availability-card">
            Status: <strong>{profile.availability || 'Not Set'}</strong>
          </div>

          <Link href="/contact">
            <button 
              onClick={playClick}
              onMouseEnter={playHover}
              className="contact-details-button"
            >
              📞 CONTACT DETAILS
            </button>
          </Link>

          <Link href="/swipe">
            <button 
              onClick={playClick}
              onMouseEnter={playHover}
              className="swipe-button"
            >
              JUMP TO SWIPE →
            </button>
          </Link>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .profile-container {
    min-height: 100vh;
    padding: 20px;
    position: relative;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 500px;
    margin: 0 auto 30px;
  }

  .back-button, .edit-button {
    padding: 10px 16px;
    font-size: 16px;
    font-weight: 900;
    text-transform: uppercase;
    background: #4387f4;
    color: #ffffff;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #2c5aa0;
    cursor: pointer;
    transition: all 0.2s;
  }

  .back-button {
    font-size: 24px;
  }

  .back-button:hover, .edit-button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #4387f4;
  }

  .back-button:active, .edit-button:active {
    transform: translate(4px, 4px);
    box-shadow: none;
  }

  .page-title {
    font-size: 28px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -1.5px;
    color: #ffffff;
  }

  .content-wrapper {
    max-width: 500px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .hero-card {
    background: #2d2d2d;
    border: 3px solid #000;
    padding: 25px 20px;
    box-shadow: 6px 6px 0 #4387f4;
    width: 100%;
  }

  .hero-header {
    display: flex;
    gap: 20px;
    align-items: center;
    margin-bottom: 15px;
  }

  .profile-picture {
    width: 80px;
    height: 80px;
    border: 3px solid #000;
    box-shadow: 3px 3px 0 #000;
    overflow: hidden;
    flex-shrink: 0;
  }

  .profile-picture img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .profile-picture-placeholder {
    width: 80px;
    height: 80px;
    border: 3px solid #000;
    box-shadow: 3px 3px 0 #4387f4;
    background: #4387f4;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .profile-initial {
    font-size: 36px;
    font-weight: 900;
    color: #fff;
  }

  .hero-info {
    flex: 1;
  }

  .hero-name {
    font-size: 36px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -2px;
    color: #ffffff;
    margin-bottom: 8px;
    line-height: 1;
  }

  .hero-meta {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    color: #999;
    margin-bottom: 15px;
  }

  .hero-bio {
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    line-height: 1.4;
  }

  .info-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .info-badge {
    padding: 12px;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    text-align: center;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #4387f4;
  }

  .domain-badge {
    background: #4387f4;
    color: #fff;
  }

  .looking-badge {
    background: #1a1a1a;
    color: #ffffff;
  }

  .section-card {
    background: #2d2d2d;
    border: 3px solid #000;
    padding: 20px;
    box-shadow: 4px 4px 0 #4387f4;
  }

  .section-title {
    font-size: 14px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #ffffff;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid #000;
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag {
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    border: 2px solid #000;
    background: #4387f4;
    color: #ffffff;
    box-shadow: 2px 2px 0 #2c5aa0;
  }

  .interest-tag {
    background: #1a1a1a;
  }

  .availability-card {
    background: #4387f4;
    border: 3px solid #000;
    padding: 15px;
    font-size: 13px;
    font-weight: 700;
    text-align: center;
    color: #ffffff;
    box-shadow: 4px 4px 0 #2c5aa0;
  }

  .contact-details-button {
    width: 100%;
    padding: 14px;
    margin-top: 20px;
    font-size: 15px;
    font-weight: 900;
    text-transform: uppercase;
    background: #2d2d2d;
    color: #4387f4;
    border: 3px solid #4387f4;
    box-shadow: 4px 4px 0 #4387f4;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.5px;
  }

  .contact-details-button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #4387f4;
    background: #1a1a1a;
  }

  .contact-details-button:active {
    transform: translate(4px, 4px);
    box-shadow: none;
  }

  .swipe-button {
    width: 100%;
    padding: 20px;
    margin-top: 20px;
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

  .swipe-button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0 #2c5aa0;
  }

  .swipe-button:active {
    transform: translate(6px, 6px);
    box-shadow: none;
  }

  .empty-state {
    font-size: 12px;
    color: #999;
    font-style: italic;
  }
`;

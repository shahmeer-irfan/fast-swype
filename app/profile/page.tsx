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

  if (loading || pageLoading || !profile) {
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
    background: #fff;
    color: #000;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #58A0C8;
    cursor: pointer;
    transition: all 0.2s;
  }

  .back-button {
    font-size: 24px;
  }

  .back-button:hover, .edit-button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #58A0C8;
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
    color: #113F67;
  }

  .content-wrapper {
    max-width: 500px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .hero-card {
    background: #fff;
    border: 3px solid #000;
    padding: 25px 20px;
    box-shadow: 6px 6px 0 #58A0C8;
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
    box-shadow: 3px 3px 0 #58A0C8;
    background: #58A0C8;
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
    color: #113F67;
    margin-bottom: 8px;
    line-height: 1;
  }

  .hero-meta {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    color: #666;
    margin-bottom: 15px;
  }

  .hero-bio {
    font-size: 14px;
    font-weight: 600;
    color: #000;
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
    box-shadow: 4px 4px 0 #58A0C8;
  }

  .domain-badge {
    background: #58A0C8;
    color: #fff;
  }

  .looking-badge {
    background: #fff;
    color: #113F67;
  }

  .section-card {
    background: #fff;
    border: 3px solid #000;
    padding: 20px;
    box-shadow: 4px 4px 0 #58A0C8;
  }

  .section-title {
    font-size: 14px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #113F67;
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
    background: #e5e5f7;
    color: #000;
    box-shadow: 2px 2px 0 #000;
  }

  .interest-tag {
    background: #fff;
  }

  .availability-card {
    background: #e5e5f7;
    border: 3px solid #000;
    padding: 15px;
    font-size: 13px;
    font-weight: 700;
    text-align: center;
    box-shadow: 4px 4px 0 #000;
  }

  .swipe-button {
    width: 100%;
    padding: 20px;
    margin-top: 20px;
    font-size: 22px;
    font-weight: 900;
    text-transform: uppercase;
    background: #58A0C8;
    color: #fff;
    border: 4px solid #000;
    box-shadow: 6px 6px 0 #113F67;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: -1px;
  }

  .swipe-button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0 #113F67;
  }

  .swipe-button:active {
    transform: translate(6px, 6px);
    box-shadow: none;
  }

  .empty-state {
    font-size: 12px;
    color: #666;
    font-style: italic;
  }
`;

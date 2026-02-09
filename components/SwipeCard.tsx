"use client";

import { useState } from "react";
import styled from "styled-components";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Profile } from "@/lib/supabase/client";
import { sendProposal } from "@/lib/supabase/api";
import { useAuth } from "@/lib/auth-context";
import { notifyNewProposal } from "@/lib/notify";
import { useClickSound } from "@/hooks/useClickSound";

interface SwipeCardProps {
  profile: Profile;
  onSwipe: (direction: "left" | "right") => void;
  userSkills?: { skill: string }[];
}

export default function SwipeCard({ profile, onSwipe, userSkills = [] }: SwipeCardProps) {
  const { user, profile: authProfile } = useAuth();
  const { playClick, playDismiss, playConfirm, playWoosh, playHover } = useClickSound();
  const [isFlipped, setIsFlipped] = useState(false);
  const [proposalText, setProposalText] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [exitX, setExitX] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25]);

  // Calculate skill match percentage
  const skillMatch = (() => {
    const userSet = new Set(userSkills.map(s => s.skill.toLowerCase().trim()));
    const profileSet = new Set((profile.skills || []).map((s: any) => s.skill.toLowerCase().trim()));
    if (userSet.size === 0 && profileSet.size === 0) return 0;
    const allSkills = new Set([...userSet, ...profileSet]);
    const common = [...userSet].filter(s => profileSet.has(s));
    return Math.round((common.length / allSkills.size) * 100);
  })();

  const getMatchColor = (pct: number) => {
    if (pct >= 60) return '#10b981';
    if (pct >= 30) return '#f59e0b';
    return '#ef4444';
  };

  const handleSendProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError("");
    setSending(true);

    try {
      // Send proposal
      const { error: proposalError } = await sendProposal(profile.id, proposalText);
      
      if (proposalError) {
        throw proposalError;
      }

      // Send push notification to receiver (fire and forget)
      notifyNewProposal(profile.id, authProfile?.name || "Someone").catch(console.error);

      // Success - show success message then swipe right
      playConfirm();
      setShowSuccess(true);
      setSending(false);
      
      // Wait 1.5 seconds before swiping to next card
      setTimeout(() => {
        setShowSuccess(false);
        onSwipe("right");
        setProposalText("");
        setIsFlipped(false);
      }, 1500);
    } catch (err: any) {
      console.error('Error sending proposal:', err);
      setError(err.message || 'Failed to send proposal');
      setSending(false);
      playDismiss();
    }
  };

  const handleReject = () => {
    playWoosh();
    playDismiss();
    onSwipe("left");
    setIsFlipped(false);
    setProposalText("");
  };

  const handleFlip = () => {
    playClick();
    setIsFlipped(!isFlipped);
  };

  const handleViewProfile = () => {
    playClick();
    setShowProfileModal(true);
  };

  const handleCloseProfile = () => {
    playClick();
    setShowProfileModal(false);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    // Disabled - using buttons now
  };

  const handlePassButton = () => {
    playWoosh();
    playDismiss();
    setExitX(-200);
    setTimeout(() => {
      onSwipe("left");
    }, 300);
  };

  const handleProposeButton = () => {
    playClick();
    setIsFlipped(true);
  };

  return (
    <StyledWrapper>
      {showSuccess && (
        <div className="success-toast">
          <div className="success-toast-content">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <div>
              <div className="success-title">Proposal Sent!</div>
              <div className="success-subtitle">Moving to next profile...</div>
            </div>
          </div>
        </div>
      )}
      

      
      {showProfileModal && (
        <div className="profile-modal-overlay" onClick={handleCloseProfile}>
          <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={handleCloseProfile}>×</button>
            
            <div className="modal-header">
              <div className="modal-avatar">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="modal-user-info">
                <div className="modal-name">{profile.name}</div>
                <div className="modal-meta">
                  {profile.department} • {profile.batch} • {profile.campus}
                </div>
              </div>
            </div>

            <div className="modal-content">
              <div className="modal-section">
                <div className="modal-section-title">BIO</div>
                <p className="modal-bio">{profile.bio || 'No bio provided'}</p>
              </div>

              <div className="modal-section">
                <div className="modal-section-title">DOMAIN</div>
                <div className="modal-domain">{profile.domain || 'Not specified'}</div>
              </div>

              <div className="modal-section">
                <div className="modal-section-title">LOOKING FOR</div>
                <div className="modal-looking">{profile.looking_for || 'Not specified'}</div>
              </div>

              <div className="modal-section">
                <div className="modal-section-title">AVAILABILITY</div>
                <div className="modal-availability">{profile.availability || 'Not specified'}</div>
              </div>

              <div className="modal-section">
                <div className="modal-section-title">SKILLS</div>
                <div className="modal-tags">
                  {profile.skills && profile.skills.length > 0 ? (
                    profile.skills.map((s: any, idx: number) => (
                      <span key={idx} className="modal-tag">{s.skill}</span>
                    ))
                  ) : (
                    <span className="modal-tag">No skills listed</span>
                  )}
                </div>
              </div>

              <div className="modal-section">
                <div className="modal-section-title">INTERESTS</div>
                <div className="modal-tags">
                  {profile.interests && profile.interests.length > 0 ? (
                    profile.interests.map((i: any, idx: number) => (
                      <span key={idx} className="modal-tag">{i.interest}</span>
                    ))
                  ) : (
                    <span className="modal-tag">No interests listed</span>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="modal-action-button reject-button" 
                onClick={() => {
                  handleCloseProfile();
                  handleReject();
                }}
                onMouseEnter={playDismiss}
              >
                Pass
              </button>
              <button 
                className="modal-action-button send-button" 
                onClick={() => {
                  handleCloseProfile();
                  handleFlip();
                }}
                onMouseEnter={playConfirm}
              >
                Send Proposal
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="card-layout">
        {/* Left: Pass Button */}
        {!isFlipped && (
          <button 
            className="side-btn pass-btn"
            onClick={handlePassButton}
            onMouseEnter={playHover}
            type="button"
            title="Pass"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}

        <motion.div 
          className={`brutalist-card ${isFlipped ? 'flipped' : ''}`}
          animate={exitX !== 0 ? { x: exitX, opacity: 0 } : {}}
          transition={{ duration: 0.3 }}
        >
        
          <div className="card-inner">
            {/* Front of card */}
            <div className="card-front">
              {/* Top Row: Avatar + Info side by side */}
              <div className="card-top">
                {profile.profile_picture_url ? (
                  <div className="avatar">
                    <img src={profile.profile_picture_url} alt={profile.name} />
                  </div>
                ) : (
                  <div className="avatar avatar-placeholder">
                    <span>{profile.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="card-top-info">
                  <div className="card-name">{profile.name}</div>
                  <div className="card-dept">{profile.department}</div>
                  <div className="card-batch-campus">{profile.batch} • {profile.campus}</div>
                </div>
              </div>

              {/* Content Area */}
              <div className="card-body">
                {profile.bio && profile.bio !== 'No bio yet' ? (
                  <p className="card-bio">{profile.bio}</p>
                ) : (
                  <p className="card-bio card-bio-empty">No bio added yet</p>
                )}

                {profile.looking_for && profile.looking_for !== 'Not specified' && (
                  <div className="card-tag-row">
                    <span className="card-tag-label">LOOKING FOR</span>
                    <span className="card-tag-value">{profile.looking_for}</span>
                  </div>
                )}

                {profile.domain && (
                  <div className="card-tag-row">
                    <span className="card-tag-label">DOMAIN</span>
                    <span className="card-tag-value">{profile.domain}</span>
                  </div>
                )}
              </div>

              {/* View Profile Button */}
              <div className="card-actions">
                <button 
                  className="btn-view-profile" 
                  onClick={handleViewProfile}
                  onMouseEnter={playClick}
                  type="button"
                >
                  👤 View Full Profile
                </button>
              </div>
            </div>

            {/* Back of card - Proposal form */}
            <div className="card-back">
            <div className="brutalist-card__header">
              <div className="brutalist-card__name">Slide Into DMs</div>
              <div className="proposal-to">to {profile.name}</div>
            </div>

            <form onSubmit={handleSendProposal} className="proposal-form">
              <div className="content-section">
                <div className="section-title">YOUR PITCH</div>
                <textarea
                  className="proposal-textarea"
                  placeholder="Keep it short and funny..."
                  maxLength={300}
                  value={proposalText}
                  onChange={(e) => setProposalText(e.target.value)}
                  required
                />
                <div className="char-count">{proposalText.length}/300</div>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="brutalist-card__actions">
                <button 
                  className="brutalist-card__button brutalist-card__button--back" 
                  onClick={handleFlip}
                  onMouseEnter={playClick}
                  type="button"
                  disabled={sending}
                >
                  Back
                </button>
                <button 
                  className="brutalist-card__button brutalist-card__button--confirm" 
                  type="submit"
                  onMouseEnter={playConfirm}
                  disabled={sending}
                >
                  {sending ? 'Sending...' : 'Send It'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Right: Propose Button */}
      {!isFlipped && (
        <button 
          className="side-btn propose-btn"
          onClick={handleProposeButton}
          onMouseEnter={playHover}
          type="button"
          title="Propose"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
      )}
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  /* ═══ CARD LAYOUT: Side buttons + Card ═══ */
  .card-layout {
    display: flex;
    align-items: center;
    gap: 16px;
    justify-content: center;
  }

  .side-btn {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 3px solid #000;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .side-btn.pass-btn {
    background: #ff4444;
    color: #fff;
    box-shadow: 4px 4px 0 #cc0000;
  }

  .side-btn.pass-btn:hover {
    transform: scale(1.15);
    box-shadow: 6px 6px 0 #cc0000;
  }

  .side-btn.pass-btn:active {
    transform: scale(0.95);
    box-shadow: none;
  }

  .side-btn.propose-btn {
    background: #10b981;
    color: #fff;
    box-shadow: 4px 4px 0 #059669;
  }

  .side-btn.propose-btn:hover {
    transform: scale(1.15);
    box-shadow: 6px 6px 0 #059669;
  }

  .side-btn.propose-btn:active {
    transform: scale(0.95);
    box-shadow: none;
  }

  .brutalist-card {
    width: 350px;
    height: 500px;
    perspective: 1000px;
    position: relative;
  }

  .card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.8s;
    transform-style: preserve-3d;
  }

  .brutalist-card.flipped .card-inner {
    transform: rotateY(180deg);
  }

  .card-front, .card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    background: #1e1e1e;
    border: 3px solid #000;
    font-family: "Arial", sans-serif;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 8px 8px 0 #4387f4;
  }

  .card-back {
    transform: rotateY(180deg);
    padding: 20px;
    background: #2d2d2d;
  }

  /* ═══ CARD FRONT — NEW LAYOUT ═══ */

  .card-top {
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 22px 20px 18px;
    border-bottom: 2px solid #333;
  }

  .avatar {
    width: 90px;
    height: 90px;
    overflow: hidden;
    flex-shrink: 0;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #4387f4;
  }

  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    background: #4387f4;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar-placeholder span {
    font-size: 38px;
    font-weight: 900;
    color: #fff;
  }

  .card-top-info {
    flex: 1;
    min-width: 0;
  }

  .card-name {
    font-size: 24px;
    font-weight: 900;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: -1.5px;
    line-height: 1.1;
    margin-bottom: 6px;
    word-wrap: break-word;
  }

  .card-dept {
    font-size: 14px;
    font-weight: 900;
    color: #4387f4;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  .card-batch-campus {
    font-size: 12px;
    font-weight: 800;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Skill Match Bar */
  .match-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 20px;
    padding: 8px 14px;
    background: #1a1a1a;
    border: 2px solid #000;
    border-left: 4px solid;
  }

  .match-value {
    font-size: 20px;
    font-weight: 900;
    line-height: 1;
    font-family: "Archivo Black", sans-serif;
  }

  .match-text {
    font-size: 11px;
    font-weight: 700;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Card Body */
  .card-body {
    flex: 1;
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: hidden;
  }

  .card-bio {
    font-size: 15px;
    font-weight: 500;
    color: #ccc;
    line-height: 1.6;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-bio-empty {
    color: #555;
    font-style: italic;
  }

  .card-tag-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .card-tag-label {
    font-size: 11px;
    font-weight: 900;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    flex-shrink: 0;
    min-width: 90px;
  }

  .card-tag-value {
    font-size: 13px;
    font-weight: 800;
    color: #fff;
    background: #4387f4;
    padding: 6px 14px;
    border: 2px solid #000;
    box-shadow: 2px 2px 0 #2c5aa0;
    text-transform: uppercase;
    letter-spacing: -0.3px;
    word-wrap: break-word;
    word-break: break-word;
  }

  /* Card Actions */
  .card-actions {
    border-top: 3px solid #000;
  }

  .btn-view-profile {
    width: 100%;
    padding: 14px 16px;
    font-size: 14px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    background: #1a1a1a;
    color: #aaa;
  }

  .btn-view-profile:hover {
    background: #4387f4;
    color: #fff;
  }

  .btn-view-profile:active {
    transform: scale(0.97);
  }

  .modal-match-badge {
    font-family: "Archivo Black", sans-serif;
    font-size: 22px;
    font-weight: 900;
    border: 3px solid;
    padding: 6px 12px;
    background: rgba(0,0,0,0.3);
    min-width: 60px;
    text-align: center;
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .tag {
    background-color: #4387f4;
    border: 2px solid #000;
    padding: 5px 10px;
    font-size: 11px;
    font-weight: 700;
    color: #ffffff;
    text-transform: uppercase;
    box-shadow: 2px 2px 0 #000;
  }

  .skill-tag {
    background-color: #1a1a1a;
  }

  .availability-badge {
    background-color: #4387f4;
    color: #fff;
    border: 2px solid #000;
    padding: 8px 12px;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    display: inline-block;
    box-shadow: 3px 3px 0 #2c5aa0;
  }

  .brutalist-card__actions {
    display: flex;
    gap: 8px;
  }

  .brutalist-card__button {
    flex: 1;
    padding: 14px;
    text-align: center;
    font-size: 14px;
    font-weight: 900;
    text-transform: uppercase;
    border: 3px solid #000;
    background-color: #1a1a1a;
    color: #ffffff;
    position: relative;
    transition: all 0.2s ease;
    box-shadow: 4px 4px 0 #4387f4;
    cursor: pointer;
    letter-spacing: -0.5px;
  }

  .brutalist-card__button--send,
  .brutalist-card__button--confirm {
    background-color: #4387f4;
    color: #fff;
  }

  .brutalist-card__button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #000;
  }

  .brutalist-card__button--send:hover,
  .brutalist-card__button--confirm:hover {
    background-color: #00ff00;
    color: #000;
  }

  .brutalist-card__button--back:hover {
    background-color: #e5e5f7;
  }

  .brutalist-card__button:active {
    transform: translate(4px, 4px);
    box-shadow: none;
  }

  .brutalist-card__button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error-message {
    padding: 8px;
    background: #ff6b6b;
    border: 2px solid #000;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    text-align: center;
    margin-bottom: 10px;
    box-shadow: 3px 3px 0 #000;
  }

  .proposal-to {
    font-size: 13px;
    font-weight: 700;
    color: #666;
    text-transform: uppercase;
  }

  .proposal-form {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .proposal-textarea {
    width: 100%;
    flex: 1;
    border: 3px solid #000;
    background-color: #1a1a1a;
    box-shadow: 4px 4px 0 #4387f4;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    padding: 12px;
    outline: none;
    resize: none;
    font-family: "Arial", sans-serif;
    transition: all 0.2s;
  }

  .proposal-textarea:focus {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #000;
  }

  .char-count {
    text-align: right;
    font-size: 10px;
    font-weight: 700;
    color: #999;
    margin-top: 6px;
  }

  .proposal-form .content-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
  }

  /* Profile Modal Styles */
  .profile-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 20px;
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .profile-modal-card {
    background: #2d2d2d;
    border: 4px solid #000;
    box-shadow: 12px 12px 0 #4387f4;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      transform: translateY(50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-close-button {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 40px;
    height: 40px;
    background: #4387f4;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #2c5aa0;
    font-size: 28px;
    font-weight: 900;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    z-index: 1;
  }

  .modal-close-button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #000;
    background: #ff0000;
    color: #fff;
  }

  .modal-header {
    background: #4387f4;
    color: #fff;
    padding: 30px;
    display: flex;
    align-items: center;
    gap: 20px;
    border-bottom: 4px solid #000;
  }

  .modal-avatar {
    width: 80px;
    height: 80px;
    background: #4387f4;
    color: #ffffff;
    border: 4px solid #000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    font-weight: 900;
    flex-shrink: 0;
  }

  .modal-user-info {
    flex: 1;
  }

  .modal-name {
    font-size: 32px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -1px;
    margin-bottom: 8px;
  }

  .modal-meta {
    font-size: 13px;
    font-weight: 700;
    opacity: 0.9;
    text-transform: uppercase;
  }

  .modal-content {
    padding: 30px;
  }

  .modal-section {
    margin-bottom: 25px;
  }

  .modal-section:last-child {
    margin-bottom: 0;
  }

  .modal-section-title {
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
    color: #ffffff;
    padding-bottom: 8px;
    border-bottom: 3px solid #000;
  }

  .modal-bio {
    font-size: 15px;
    line-height: 1.6;
    color: #ffffff;
    font-weight: 600;
    margin: 0;
  }

  .modal-domain,
  .modal-looking,
  .modal-availability {
    background: #4387f4;
    color: #fff;
    padding: 10px 15px;
    font-size: 13px;
    font-weight: 900;
    text-transform: uppercase;
    display: inline-block;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #2c5aa0;
  }

  .modal-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .modal-tag {
    background: #4387f4;
    border: 2px solid #000;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 700;
    color: #ffffff;
    text-transform: uppercase;
    box-shadow: 2px 2px 0 #000;
  }

  .modal-actions {
    display: flex;
    gap: 0;
    border-top: 4px solid #000;
  }

  .modal-action-button {
    flex: 1;
    padding: 20px;
    font-size: 16px;
    font-weight: 900;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: -0.5px;
  }

  .modal-action-button.reject-button {
    background: #1a1a1a;
    color: #ffffff;
    border-right: 4px solid #000;
  }

  .modal-action-button.reject-button:hover {
    background: #ff0000;
    color: #fff;
  }

  .modal-action-button.send-button {
    background: #4387f4;
    color: #fff;
  }

  .modal-action-button.send-button:hover {
    background: #2c5aa0;
    color: #fff;
  }

  .modal-action-button:active {
    transform: scale(0.98);
  }

  /* Success Toast */
  .success-toast {
    position: fixed;
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10000;
    animation: slideDown 0.3s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  .success-toast-content {
    background: #10b981;
    border: 4px solid #000;
    box-shadow: 6px 6px 0 #000;
    padding: 20px 30px;
    display: flex;
    align-items: center;
    gap: 15px;
    min-width: 320px;
  }

  .success-toast-content svg {
    flex-shrink: 0;
    color: #fff;
  }

  .success-title {
    font-size: 18px;
    font-weight: 900;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: -0.5px;
    margin-bottom: 4px;
  }

  .success-subtitle {
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    opacity: 0.9;
  }

  /* Proposals Left Toast */
  .proposals-left-toast {
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 10000;
    animation: slideInRight 0.3s ease-out;
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .proposals-left-content {
    background: #4387f4;
    border: 4px solid #000;
    box-shadow: 6px 6px 0 #000;
    padding: 20px 30px;
    display: flex;
    align-items: center;
    gap: 15px;
    min-width: 320px;
  }

  .proposals-left-icon {
    font-size: 32px;
    flex-shrink: 0;
  }

  .proposals-left-title {
    font-size: 18px;
    font-weight: 900;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: -0.5px;
    margin-bottom: 4px;
  }

  .proposals-left-subtitle {
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    opacity: 0.9;
  }

  /* View Profile button style — card back only */
  .brutalist-card__button--view {
    background-color: #1a1a1a;
    color: #ffffff;
  }

  .brutalist-card__button--view:hover {
    background-color: #4387f4;
    color: #ffffff;
  }

  /* ═══ CARD BACK OVERRIDES ═══ */
  .card-back .brutalist-card__header {
    border-bottom: 3px solid #000;
    padding-bottom: 10px;
    margin-bottom: 10px;
    position: relative;
  }

  .card-back .brutalist-card__name {
    font-weight: 900;
    color: #ffffff;
    font-size: 26px;
    text-transform: uppercase;
    line-height: 1;
    letter-spacing: -1.5px;
    margin-bottom: 6px;
  }

  .card-back .section-title {
    font-size: 11px;
    font-weight: 900;
    color: #ffffff;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .card-back .content-section {
    flex-shrink: 0;
  }

  /* ═══ RESPONSIVE ═══ */
  @media (max-width: 500px) {
    .side-btn {
      width: 52px;
      height: 52px;
    }

    .side-btn svg {
      width: 22px;
      height: 22px;
    }

    .card-layout {
      gap: 10px;
    }

    .brutalist-card {
      width: 260px;
      height: 440px;
    }

    .card-name {
      font-size: 20px;
    }

    .avatar {
      width: 70px;
      height: 70px;
    }

    .avatar-placeholder span {
      font-size: 30px;
    }
  }
`;

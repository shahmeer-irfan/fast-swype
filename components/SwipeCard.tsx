"use client";

import { useState } from "react";
import styled from "styled-components";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Profile } from "@/lib/supabase/client";
import { sendProposal, canSendProposal } from "@/lib/supabase/api";
import { useAuth } from "@/lib/auth-context";
import PaymentModal from "@/components/PaymentModal";
import { useClickSound } from "@/hooks/useClickSound";

interface SwipeCardProps {
  profile: Profile;
  onSwipe: (direction: "left" | "right") => void;
}

export default function SwipeCard({ profile, onSwipe }: SwipeCardProps) {
  const { user } = useAuth();
  const { playClick, playDismiss, playConfirm } = useClickSound();
  const [isFlipped, setIsFlipped] = useState(false);
  const [proposalText, setProposalText] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [exitX, setExitX] = useState(0);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleSendProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError("");
    setSending(true);

    try {
      // Check if user can send proposal
      const { canSend } = await canSendProposal(user.id);
      
      if (!canSend) {
        // Show payment modal
        setShowPaymentModal(true);
        setSending(false);
        playDismiss();
        return;
      }

      // Send proposal
      const { error: proposalError } = await sendProposal(profile.id, proposalText);
      
      if (proposalError) {
        throw proposalError;
      }

      // Success - swipe right
      playConfirm();
      onSwipe("right");
      setProposalText("");
      setIsFlipped(false);
    } catch (err: any) {
      console.error('Error sending proposal:', err);
      setError(err.message || 'Failed to send proposal');
      setSending(false);
      playDismiss();
    }
  };

  const handleReject = () => {
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
    if (info.offset.x > 100) {
      // Swipe right - show proposal form
      setExitX(200);
      playClick();
      setTimeout(() => {
        setIsFlipped(true);
        setExitX(0);
      }, 200);
    } else if (info.offset.x < -100) {
      // Swipe left - reject
      setExitX(-200);
      playDismiss();
      setTimeout(() => {
        onSwipe("left");
      }, 300);
    }
  };

  return (
    <StyledWrapper>
      {showPaymentModal && (
        <PaymentModal onClose={() => setShowPaymentModal(false)} />
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
      
      <motion.div 
        className={`brutalist-card ${isFlipped ? 'flipped' : ''}`}
        style={{ x, rotate, opacity }}
        drag={!isFlipped ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={exitX !== 0 ? { x: exitX, opacity: 0 } : {}}
        transition={{ duration: 0.3 }}
      >
        <div className="card-inner">
          {/* Front of card */}
          <div className="card-front">
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
            
            <div className="brutalist-card__header">
              <div className="brutalist-card__name">{profile.name}</div>
              <div className="brutalist-card__meta">
                <span className="meta-tag">{profile.department} • {profile.batch}</span>
              </div>
            </div>
            
            <div className="brutalist-card__content">
              <div className="content-section">
                <div className="section-title">BIO</div>
                <p className="bio-text">{profile.bio || 'No bio yet'}</p>
              </div>

              <div className="content-section">
                <div className="section-title">LOOKING FOR</div>
                <div className="looking-badge">{profile.looking_for || 'Not specified'}</div>
              </div>

              <div className="content-section">
                <div className="section-title">STATUS</div>
                <div className="availability-badge">{profile.availability || 'Not specified'}</div>
              </div>
            </div>

            <div className="swipe-hint">
              <span className="hint-left">← Swipe left to pass</span>
              <span className="hint-right">Swipe right to propose →</span>
            </div>

            <div className="brutalist-card__actions">
              <button 
                className="brutalist-card__button brutalist-card__button--view" 
                onClick={handleViewProfile}
                onMouseEnter={playClick}
                type="button"
              >
                View Profile
              </button>
              <button 
                className="brutalist-card__button brutalist-card__button--send" 
                onClick={handleFlip}
                onMouseEnter={playClick}
                type="button"
              >
                Let's Go
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
                  maxLength={100}
                  value={proposalText}
                  onChange={(e) => setProposalText(e.target.value)}
                  required
                />
                <div className="char-count">{proposalText.length}/100</div>
              </div>

              {/* Tips Section */}
              <div className="tips-section">
                <div className="tips-title">✨ psst... little tips</div>
                <div className="tips-list">
                  <div className="tip-item">Share WhatsApp/Calendar links to meet IRL ☕</div>
                  <div className="tip-item">Be genuine, people can smell fake vibes 👃</div>
                  <div className="tip-item">Show what makes you a great teammate 🤝</div>
                </div>
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
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .brutalist-card {
    width: 340px;
    height: 520px;
    perspective: 1000px;
    position: relative;
    cursor: grab;
  }

  .brutalist-card:active {
    cursor: grabbing;
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
    border: 3px solid #000;
    background-color: #fff;
    padding: 20px;
    box-shadow: 8px 8px 0 #000;
    font-family: "Arial", sans-serif;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .card-back {
    transform: rotateY(180deg);
  }

  .profile-picture {
    width: 120px;
    height: 120px;
    margin: 0 auto 20px;
    border: 4px solid #000;
    box-shadow: 4px 4px 0 #000;
    overflow: hidden;
  }

  .profile-picture img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .profile-picture-placeholder {
    width: 120px;
    height: 120px;
    margin: 0 auto 20px;
    border: 4px solid #000;
    box-shadow: 4px 4px 0 #58A0C8;
    background: #58A0C8;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .profile-initial {
    font-size: 48px;
    font-weight: 900;
    color: #fff;
  }

  .brutalist-card__header {
    border-bottom: 3px solid #000;
    padding-bottom: 15px;
    margin-bottom: 15px;
  }

  .brutalist-card__name {
    font-weight: 900;
    color: #113F67;
    font-size: 32px;
    text-transform: uppercase;
    line-height: 1;
    letter-spacing: -1.5px;
    margin-bottom: 10px;
  }

  .brutalist-card__meta {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .meta-tag {
    background-color: #58A0C8;
    color: #fff;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    border: 2px solid #000;
    display: inline-block;
    width: fit-content;
  }

  .brutalist-card__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 15px;
    overflow: hidden;
  }

  .content-section {
    flex-shrink: 0;
  }

  .section-title {
    font-size: 11px;
    font-weight: 900;
    color: #113F67;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .bio-text {
    color: #000;
    font-size: 14px;
    line-height: 1.5;
    font-weight: 600;
    max-height: 85px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
  }

  .domain-badge, .looking-badge {
    background-color: #58A0C8;
    color: #fff;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    display: inline-block;
    border: 2px solid #000;
    box-shadow: 3px 3px 0 #113F67;
  }

  .looking-badge {
    background-color: #fff;
    color: #113F67;
    border: 3px solid #000;
    box-shadow: 3px 3px 0 #58A0C8;
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .tag {
    background-color: #fff;
    border: 2px solid #000;
    padding: 5px 10px;
    font-size: 11px;
    font-weight: 700;
    color: #000;
    text-transform: uppercase;
    box-shadow: 2px 2px 0 #000;
  }

  .skill-tag {
    background-color: #e5e5f7;
  }

  .availability-badge {
    background-color: #58A0C8;
    color: #fff;
    border: 2px solid #000;
    padding: 8px 12px;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    display: inline-block;
    box-shadow: 3px 3px 0 #113F67;
  }

  .swipe-hint {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    margin-top: auto;
    border-top: 2px solid #000;
    font-size: 9px;
    font-weight: 700;
    color: #666;
    text-transform: uppercase;
  }

  .hint-left {
    color: #ff0000;
  }

  .hint-right {
    color: #00ff00;
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
    background-color: #fff;
    color: #000;
    position: relative;
    transition: all 0.2s ease;
    box-shadow: 4px 4px 0 #000;
    cursor: pointer;
    letter-spacing: -0.5px;
  }

  .brutalist-card__button--send {
    background-color: #58A0C8;
    color: #fff;
  }

  .brutalist-card__button--confirm {
    background-color: #58A0C8;
    color: #fff;
  }

  .brutalist-card__button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #000;
  }

  .brutalist-card__button--reject:hover {
    background-color: #ff0000;
    border-color: #000;
    color: #fff;
  }

  .brutalist-card__button--send:hover {
    background-color: #113F67;
    color: #fff;
  }

  .brutalist-card__button--confirm:hover {
    background-color: #113F67;
    color: #fff;
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
    min-height: 80px;
    border: 3px solid #000;
    background-color: #fff;
    box-shadow: 4px 4px 0 #000;
    font-size: 14px;
    font-weight: 600;
    color: #000;
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
    color: #666;
    margin-top: 6px;
  }

  .tips-section {
    margin: 8px 0 12px 0;
    padding: 10px;
    background: #f5f5f5;
    border: 2px solid #000;
  }

  .tips-title {
    font-size: 9px;
    font-weight: 900;
    text-transform: lowercase;
    letter-spacing: 0.5px;
    color: #666;
    margin-bottom: 6px;
  }

  .tips-list {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .tip-item {
    font-size: 9px;
    font-weight: 600;
    line-height: 1.3;
    color: #000;
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
    background: #fff;
    border: 4px solid #000;
    box-shadow: 12px 12px 0 #000;
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
    background: #fff;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #000;
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
    background: #58A0C8;
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
    background: #fff;
    color: #113F67;
    border: 4px solid #fff;
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
    color: #113F67;
    padding-bottom: 8px;
    border-bottom: 3px solid #000;
  }

  .modal-bio {
    font-size: 15px;
    line-height: 1.6;
    color: #000;
    font-weight: 600;
    margin: 0;
  }

  .modal-domain,
  .modal-looking,
  .modal-availability {
    background: #58A0C8;
    color: #fff;
    padding: 10px 15px;
    font-size: 13px;
    font-weight: 900;
    text-transform: uppercase;
    display: inline-block;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #113F67;
  }

  .modal-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .modal-tag {
    background: #e5e5f7;
    border: 2px solid #000;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 700;
    color: #000;
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
    background: #fff;
    color: #000;
    border-right: 4px solid #000;
  }

  .modal-action-button.reject-button:hover {
    background: #ff0000;
    color: #fff;
  }

  .modal-action-button.send-button {
    background: #58A0C8;
    color: #fff;
  }

  .modal-action-button.send-button:hover {
    background: #113F67;
    color: #fff;
  }

  .modal-action-button:active {
    transform: scale(0.98);
  }

  /* View Profile button style */
  .brutalist-card__button--view {
    background-color: #fff;
    color: #000;
  }

  .brutalist-card__button--view:hover {
    background-color: #e5e5f7;
    color: #000;
  }
`;

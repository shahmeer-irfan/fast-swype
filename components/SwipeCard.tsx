"use client";

import { useState } from "react";
import styled from "styled-components";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Profile } from "@/lib/supabase/client";
import { sendProposal, canSendProposal, getUserLimits } from "@/lib/supabase/api";
import { useAuth } from "@/lib/auth-context";
import PaymentModal from "@/components/PaymentModal";
import { useClickSound } from "@/hooks/useClickSound";

interface SwipeCardProps {
  profile: Profile;
  onSwipe: (direction: "left" | "right") => void;
}

export default function SwipeCard({ profile, onSwipe }: SwipeCardProps) {
  const { user } = useAuth();
  const { playClick, playDismiss, playConfirm, playWoosh } = useClickSound();
  const [isFlipped, setIsFlipped] = useState(false);
  const [proposalText, setProposalText] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [exitX, setExitX] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showProposalsLeft, setShowProposalsLeft] = useState(false);
  const [proposalsRemaining, setProposalsRemaining] = useState(0);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const leftIndicatorOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);
  const rightIndicatorOpacity = useTransform(x, [0, 50, 100], [0, 0.5, 1]);

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

      // Get updated limits to show remaining proposals
      try {
        const limits = await getUserLimits(user.id);
        const remaining = limits.proposals_limit - limits.proposals_sent;
        
        // Only show "proposals left" toast if user hasn't paid
        if (!limits.has_paid && remaining >= 0) {
          setProposalsRemaining(remaining);
          setShowProposalsLeft(true);
          
          // Hide the proposals left toast after 3 seconds
          setTimeout(() => {
            setShowProposalsLeft(false);
          }, 3000);
        }
      } catch (err) {
        console.error('Error getting user limits:', err);
      }

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
    if (info.offset.x > 100) {
      // Swipe right - just flip card (no swipe animation)
      playClick();
      setIsFlipped(true);
    } else if (info.offset.x < -100) {
      // Swipe left - reject with animation
      setExitX(-200);
      playWoosh();
      playDismiss();
      setTimeout(() => {
        onSwipe("left");
      }, 300);
    }
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
      
      {showProposalsLeft && (
        <div className="proposals-left-toast">
          <div className="proposals-left-content">
            <div className="proposals-left-icon">{proposalsRemaining > 0 ? '🎯' : '🔒'}</div>
            <div>
              <div className="proposals-left-title">
                {proposalsRemaining > 0 
                  ? `${proposalsRemaining} Free Proposal${proposalsRemaining !== 1 ? 's' : ''} Left!` 
                  : 'Free Proposals Used!'}
              </div>
              <div className="proposals-left-subtitle">
                {proposalsRemaining > 0 
                  ? 'Make them count!' 
                  : 'Unlock unlimited for just 250 PKR'}
              </div>
            </div>
          </div>
        </div>
      )}
      
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
        {/* Swipe Indicators */}
        {!isFlipped && (
          <>
            <div className="swipe-indicator left-indicator">
              <div className="indicator-content">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                <span>PASS</span>
              </div>
            </div>
            
            <div className="swipe-indicator right-indicator">
              <div className="indicator-content">
                <span>PROPOSE</span>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
          </>
        )}
        
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
                <span className="meta-tag">{profile.department} • {profile.batch} • {profile.campus}</span>
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
                <div className="tips-title">Some cute tips writing perfect proposal</div>
                <div className="tips-list">
                  <div className="tip-item">Share WhatsApp/Calendar links to meet IRL☕</div>
                  <div className="tip-item">Mention what you need and what you can offer👃</div>
                  <div className="tip-item">Show what makes you a great teammate🤝</div>
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
    background-color: #2d2d2d;
    padding: 20px;
    box-shadow: 8px 8px 0 #4387f4;
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
    box-shadow: 4px 4px 0 #4387f4;
    background: #4387f4;
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
    color: #ffffff;
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
    background-color: #4387f4;
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
    color: #ffffff;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .bio-text {
    color: #ffffff;
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
    background-color: #4387f4;
    color: #fff;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    display: inline-block;
    border: 2px solid #000;
    box-shadow: 3px 3px 0 #2c5aa0;
    word-wrap: break-word;
    max-width: 100%;
    line-height: 1.3;
  }

  .looking-badge {
    background-color: #4387f4;
    color: #ffffff;
    border: 3px solid #000;
    box-shadow: 3px 3px 0 #2c5aa0;
    word-wrap: break-word;
    max-width: 100%;
    line-height: 1.3;
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

  .swipe-indicator {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    z-index: 10;
    padding: 20px;
  }

  .left-indicator {
    left: -80px;
  }

  .right-indicator {
    right: -80px;
  }

  .indicator-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    animation: bounce 0.6s ease-in-out infinite;
  }

  .left-indicator .indicator-content {
    color: #ff4444;
  }

  .right-indicator .indicator-content {
    color: #00ff88;
  }

  .indicator-content span {
    font-size: 18px;
    font-weight: 900;
    letter-spacing: 2px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(${props => props.className?.includes('left') ? '-10px' : '10px'});
    }
  }

  .left-indicator .indicator-content {
    animation: bounceLeft 0.6s ease-in-out infinite;
  }

  .right-indicator .indicator-content {
    animation: bounceRight 0.6s ease-in-out infinite;
  }

  @keyframes bounceLeft {
    0%, 100% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(-10px);
    }
  }

  @keyframes bounceRight {
    0%, 100% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(10px);
    }
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

  .brutalist-card__button--send {
    background-color: #4387f4;
    color: #fff;
  }

  .brutalist-card__button--confirm {
    background-color: #4387f4;
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
    background-color: #00ff00;
    color: #000;
  }

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
    min-height: 80px;
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

  .tips-section {
    margin: 3px 0 12px 0;
    padding: 16px;
    background: #1a1a1a;
    border: 2px solid #4387f4;
  }

  .tips-title {
    font-size: 11px;
    font-weight: 900;
    text-transform: lowercase;
    letter-spacing: 0.5px;
    color: #999;
    margin-bottom: 8px;
  }

  .tips-list {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .tip-item {
    font-size: 10px;
    font-weight: 600;
    line-height: 1.4;
    color: #ffffff;
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

  /* View Profile button style */
  .brutalist-card__button--view {
    background-color: #1a1a1a;
    color: #ffffff;
  }

  .brutalist-card__button--view:hover {
    background-color: #4387f4;
    color: #ffffff;
  }
`;

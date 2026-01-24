"use client";

import { useState } from "react";
import styled from "styled-components";
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
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <StyledWrapper>
      {showPaymentModal && (
        <PaymentModal onClose={() => setShowPaymentModal(false)} />
      )}
      
      <div className={`brutalist-card ${isFlipped ? 'flipped' : ''}`}>
        <div className="card-inner">
          {/* Front of card */}
          <div className="card-front">
            <div className="brutalist-card__header">
              <div className="brutalist-card__name">{profile.name}</div>
              <div className="brutalist-card__meta">
                <span className="meta-tag">{profile.department} • {profile.batch}</span>
                <span className="meta-tag">{profile.campus}</span>
              </div>
            </div>
            
            <div className="brutalist-card__content">
              <div className="content-section">
                <p className="bio-text">{profile.bio || 'No bio yet'}</p>
              </div>

              <div className="content-section">
                <div className="section-title">DOMAIN</div>
                <div className="domain-badge">{profile.domain || 'Not specified'}</div>
              </div>

              <div className="content-section">
                <div className="section-title">SKILLS</div>
                <div className="tags-container">
                  {profile.skills && profile.skills.length > 0 ? (
                    profile.skills.slice(0, 4).map((s: any, idx: number) => (
                      <span key={idx} className="tag skill-tag">{s.skill}</span>
                    ))
                  ) : (
                    <span className="tag skill-tag">No skills listed</span>
                  )}
                </div>
              </div>

              <div className="content-section">
                <div className="section-title">LOOKING FOR</div>
                <div className="looking-badge">{profile.looking_for || 'Not specified'}</div>
              </div>

              <div className="availability-badge">{profile.availability || 'Not specified'}</div>
            </div>

            <div className="brutalist-card__actions">
              <button 
                className="brutalist-card__button brutalist-card__button--reject" 
                onClick={handleReject}
                type="button"
              >
                Nah
              </button>
              <button 
                className="brutalist-card__button brutalist-card__button--send" 
                onClick={handleFlip}
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
                  type="button"
                  disabled={sending}
                >
                  Back
                </button>
                <button 
                  className="brutalist-card__button brutalist-card__button--confirm" 
                  type="submit"
                  disabled={sending}
                >
                  {sending ? 'Sending...' : 'Send It'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .brutalist-card {
    width: 340px;
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
    border: 3px solid #000;
    background-color: #fff;
    padding: 20px;
    box-shadow: 8px 8px 0 #000;
    font-family: "Arial", sans-serif;
    display: flex;
    flex-direction: column;
  }

  .card-back {
    transform: rotateY(180deg);
  }

  .brutalist-card__header {
    border-bottom: 3px solid #000;
    padding-bottom: 15px;
    margin-bottom: 15px;
  }

  .brutalist-card__name {
    font-weight: 900;
    color: #000;
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
    background-color: #000;
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
    overflow-y: auto;
    margin-bottom: 15px;
  }

  .content-section {
    margin-bottom: 15px;
  }

  .section-title {
    font-size: 11px;
    font-weight: 900;
    color: #000;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .bio-text {
    color: #000;
    font-size: 14px;
    line-height: 1.4;
    font-weight: 600;
    margin-bottom: 15px;
  }

  .domain-badge, .looking-badge {
    background-color: #000;
    color: #fff;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    display: inline-block;
    border: 2px solid #000;
    box-shadow: 3px 3px 0 #000;
  }

  .looking-badge {
    background-color: #fff;
    color: #000;
    border: 3px solid #000;
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
    background-color: #e5e5f7;
    border: 2px solid #000;
    padding: 6px 10px;
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    text-align: center;
    margin-top: 10px;
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
    background-color: #000;
    color: #fff;
  }

  .brutalist-card__button--confirm {
    background-color: #000;
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
`;

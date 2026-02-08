"use client";

import { useState, use, useEffect } from "react";
import styled from "styled-components";
import BrutalistPattern from "@/components/BrutalistPattern";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClickSound } from "@/hooks/useClickSound";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase/client";
import { updateProposalStatus } from "@/lib/supabase/api";
import { Proposal } from "@/lib/supabase/client";
import { notifyProposalAccepted } from "@/lib/notify";
import Loader from "@/components/Loader";

export default function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { playClick, playConfirm, playDismiss, playHover } = useClickSound();
  
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionTaken, setActionTaken] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  // Load proposal
  useEffect(() => {
    if (user) {
      loadProposal();
    }
  }, [user, resolvedParams.id]);

  const loadProposal = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          from_profile:from_user_id(id, name, email, department, batch, campus, bio, domain, looking_for, profile_picture_url, phone_number, contact_email),
          to_profile:to_user_id(id, name, email, department, batch, campus, bio, domain, looking_for, profile_picture_url, phone_number, contact_email)
        `)
        .eq('id', resolvedParams.id)
        .single();

      if (error) throw error;

      setProposal(data as Proposal);
      setStatus(data.status);
      setActionTaken(data.status !== 'pending');
    } catch (error) {
      console.error('Error loading proposal:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <Loader />;
  }

  if (!user) {
    return null;
  }

  if (!proposal) {
    return (
      <StyledWrapper>
        <BrutalistPattern />
        <div className="error-container">
          <div className="error-card">
            <div className="error-icon">❌</div>
            <h2 className="error-title">Proposal Not Found</h2>
            <Link href="/proposals">
              <button 
                onClick={playClick}
                onMouseEnter={playHover}
                className="back-button-large"
              >
                Back to Proposals
              </button>
            </Link>
          </div>
        </div>
      </StyledWrapper>
    );
  }

  const handleAccept = () => {
    // Show confirmation modal first
    setShowConfirmModal(true);
  };

  const confirmAccept = async () => {
    if (!proposal) return;

    setUpdating(true);
    try {
      const { error } = await updateProposalStatus(proposal.id, 'accepted');
      if (error) throw error;

      // Send push notification to proposal sender (fire and forget)
      if (proposal.from_user_id) {
        const accepterName = user?.email || "Someone";
        notifyProposalAccepted(proposal.from_user_id, accepterName).catch(console.error);
      }

      playConfirm();
      setStatus("accepted");
      setActionTaken(true);
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Error accepting proposal:', error);
      playDismiss();
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!proposal) return;

    setUpdating(true);
    try {
      const { error } = await updateProposalStatus(proposal.id, 'rejected');
      if (error) throw error;

      playDismiss();
      setStatus("rejected");
      setActionTaken(true);
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      playDismiss();
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (s: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      pending: { bg: "#2d2d2d", text: "#4387f4" },
      accepted: { bg: "#4387f4", text: "#fff" },
      rejected: { bg: "#1a1a1a", text: "#ffffff" },
    };
    return colors[s] || colors.pending;
  };

  const statusColor = getStatusColor(status);

  return (
    <StyledWrapper>
      <BrutalistPattern />
      <div className="detail-container">
        {/* Header */}
        <div className="header">
          <Link href="/proposals">
            <button 
              onClick={playClick}
              onMouseEnter={playHover}
              className="back-button"
            >
              ←
            </button>
          </Link>
          <h1 className="page-title">PROPOSAL</h1>
          <div className="spacer" />
        </div>

        {/* Proposal Card */}
        <div className="proposal-detail-card">
          {/* User Info */}
          <div className="user-section">
            <div className="user-avatar">
              {proposal.from_profile?.profile_picture_url ? (
                <img 
                  src={proposal.from_profile.profile_picture_url} 
                  alt={proposal.from_profile.name || 'User'}
                />
              ) : (
                proposal.from_profile?.name?.charAt(0).toUpperCase() || '?'
              )}
            </div>
            <div className="user-details">
              <div className="user-name">{proposal.from_profile?.name || 'Unknown User'}</div>
              <div className="user-meta">
                {proposal.from_profile?.department} • {proposal.from_profile?.batch}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div 
            className="status-badge-large"
            style={{ 
              backgroundColor: statusColor.bg, 
              color: statusColor.text 
            }}
          >
            {status.toUpperCase()}
          </div>

          {/* Message Section */}
          <div className="message-section">
            <div className="section-title">THE PITCH</div>
            <div className="message-content">{proposal.message}</div>
          </div>

          {/* Timestamp */}
          <div className="timestamp">
            Sent: {new Date(proposal.created_at).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </div>

          {/* Action Buttons - Only show for received proposals */}
          {proposal.to_user_id === user.id && status === "pending" && !actionTaken && (
            <div className="action-buttons">
              <button
                onClick={handleReject}
                onMouseEnter={playHover}
                className="action-button reject-button"
                disabled={updating}
              >
                {updating ? 'UPDATING...' : 'DECLINE'}
              </button>
              <button
                onClick={handleAccept}
                onMouseEnter={playHover}
                className="action-button accept-button"
                disabled={updating}
              >
                {updating ? 'UPDATING...' : 'ACCEPT'}
              </button>
            </div>
          )}

          {/* Show status message after action */}
          {proposal.to_user_id === user.id && actionTaken && (
            <div className={`status-message ${status === "accepted" ? "accepted" : "rejected"}`}>
              {status === "accepted" 
                ? "✓ Accepted. Make sure you've contacted them!"
                : "✗ Declined. No worries, keep swiping!"}
            </div>
          )}

          {/* For sent proposals, show status and contact if accepted */}
          {proposal.from_user_id === user.id && (
            <>
              <div className="sent-status-info">
                <div className="info-text">
                  {status === "pending" && "⏳ Waiting for their response..."}
                  {status === "accepted" && "✓ They accepted! Reach out to them."}
                  {status === "rejected" && "✗ Not this time. Keep trying!"}
                </div>
              </div>
              
              {status === "accepted" && (
                <div className="contact-section">
                  <div className="section-title">CONTACT INFO</div>
                  <div className="contact-info">
                    <div className="contact-item">
                      📧 {(proposal.to_profile as any)?.contact_email || proposal.to_profile?.email}
                    </div>
                    {(proposal.to_profile as any)?.phone_number && (
                      <div className="contact-item">
                        📱 {(proposal.to_profile as any).phone_number}
                      </div>
                    )}
                    {!(proposal.to_profile as any)?.phone_number && !(proposal.to_profile as any)?.contact_email && (
                      <div className="contact-item contact-missing">
                        ⚠️ They haven't added contact details yet
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {status === "accepted" && proposal.to_user_id === user.id && (
            <div className="contact-section">
              <div className="section-title">CONTACT INFO</div>
              <div className="contact-info">
                <div className="contact-item">
                  📧 {(proposal.from_profile as any)?.contact_email || proposal.from_profile?.email}
                </div>
                {(proposal.from_profile as any)?.phone_number && (
                  <div className="contact-item">
                    📱 {(proposal.from_profile as any).phone_number}
                  </div>
                )}
                {!(proposal.from_profile as any)?.phone_number && !(proposal.from_profile as any)?.contact_email && (
                  <div className="contact-item contact-missing">
                    ⚠️ They haven't added contact details yet
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-title">⚠️ HOLD UP</div>
              <div className="modal-text">
                <strong>Only accept if you've already contacted {proposal.from_profile?.name}.</strong>
              </div>
              <div className="modal-text">
                Use WhatsApp, email, or Google Meet to reach out first.
              </div>
              <div className="modal-text-small">
                ⚡ There's no in-app chat. Accepting = you're ready to collaborate.
              </div>
              <div className="modal-buttons">
                <button
                  onClick={() => {
                    playClick();
                    setShowConfirmModal(false);
                  }}
                  onMouseEnter={playHover}
                  disabled={updating}
                  className="modal-button cancel-button"
                >
                  NOT YET
                </button>
                <button
                  onClick={confirmAccept}
                  onMouseEnter={playHover}
                  disabled={updating}
                  className="modal-button confirm-button"
                >
                  {updating ? 'CONFIRMING...' : 'YES, CONTACTED'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .detail-container {
    min-height: 100vh;
    padding: 20px;
    position: relative;
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    width: 100%;
  }

  .back-button {
    width: 48px;
    height: 48px;
    background: #4387f4;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #2c5aa0;
    font-size: 24px;
    font-weight: 900;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .back-button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #2c5aa0;
  }

  .back-button:active {
    transform: translate(4px, 4px);
    box-shadow: none;
  }

  .page-title {
    font-size: 32px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -1px;
    color: #ffffff;
  }

  .spacer {
    width: 48px;
  }

  .proposal-detail-card {
    background: #2d2d2d;
    border: 3px solid #000;
    box-shadow: 8px 8px 0 #4387f4;
    padding: 30px;
    width: 100%;
  }

  .user-section {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 3px solid #000;
  }

  .user-avatar {
    width: 64px;
    height: 64px;
    background: #4387f4;
    color: #fff;
    border: 3px solid #000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: 900;
    overflow: hidden;
  }

  .user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .user-details {
    flex: 1;
  }

  .user-name {
    font-size: 24px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.5px;
    color: #ffffff;
    margin-bottom: 4px;
  }

  .user-meta {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    color: #999;
  }

  .status-badge-large {
    display: inline-block;
    padding: 8px 16px;
    border: 3px solid #000;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 24px;
  }

  .message-section {
    margin-bottom: 24px;
  }

  .section-title {
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #ffffff;
    margin-bottom: 12px;
  }

  .message-content {
    font-size: 18px;
    line-height: 1.6;
    color: #ffffff;
    padding: 16px;
    background: #1a1a1a;
    border: 2px solid #4387f4;
  }

  .timestamp {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: #999;
    margin-bottom: 24px;
  }

  .action-buttons {
    display: flex;
    gap: 12px;
  }

  .action-button {
    flex: 1;
    padding: 16px;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #2c5aa0;
    font-size: 14px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #2c5aa0;
  }

  .action-button:active {
    transform: translate(4px, 4px);
    box-shadow: none;
  }

  .action-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  .reject-button {
    background: #1a1a1a;
    color: #ffffff;
  }

  .accept-button {
    background: #4387f4;
    color: #fff;
  }

  .contact-section {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 3px solid #000;
  }

  .contact-info {
    background: #1a1a1a;
    border: 2px solid #4387f4;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .contact-item {
    font-size: 12px;
    line-height: 1.6;
    color: #ffffff;
    padding: 10px;
    background: #2d2d2d;
    border: 2px solid #4387f4;
    font-weight: 600;
  }

  .contact-item.contact-missing {
    color: #f59e0b;
    border-color: #f59e0b;
    font-size: 12px;
  }

  .status-message {
    margin-top: 20px;
    padding: 16px;
    border: 3px solid #000;
    font-size: 14px;
    font-weight: 900;
    text-align: center;
    text-transform: uppercase;
  }

  .status-message.accepted {
    background: #4387f4;
    color: #fff;
  }

  .status-message.rejected {
    background: #1a1a1a;
    color: #ffffff;
  }

  .sent-status-info {
    margin-top: 20px;
    padding: 16px;
    background: #1a1a1a;
    border: 2px solid #4387f4;
  }

  .info-text {
    font-size: 13px;
    font-weight: 700;
    color: #999;
    text-align: center;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal-card {
    background: #2d2d2d;
    border: 4px solid #000;
    box-shadow: 12px 12px 0 #4387f4;
    padding: 30px;
    max-width: 450px;
    width: 100%;
  }

  .modal-title {
    font-size: 24px;
    font-weight: 900;
    text-transform: uppercase;
    color: #ffffff;
    margin-bottom: 16px;
    letter-spacing: -0.5px;
  }

  .modal-text {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.5;
    color: #ffffff;
    margin-bottom: 12px;
  }

  .modal-text-small {
    font-size: 12px;
    font-weight: 600;
    line-height: 1.4;
    color: #666;
    margin-bottom: 24px;
  }

  .modal-buttons {
    display: flex;
    gap: 12px;
  }

  .modal-button {
    flex: 1;
    padding: 14px;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #2c5aa0;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
  }

  .modal-button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #2c5aa0;
  }

  .modal-button:active {
    transform: translate(4px, 4px);
    box-shadow: none;
  }

  .cancel-button {
    background: #1a1a1a;
    color: #ffffff;
  }

  .confirm-button {
    background: #4387f4;
    color: #fff;
  }

  .rejected-message {
    margin-top: 20px;
    padding: 20px;
    background: #1a1a1a;
    border: 2px solid #4387f4;
    text-align: center;
  }

  .rejected-message p {
    font-size: 14px;
    color: #999;
    margin-bottom: 16px;
  }

  .reconsider-button {
    padding: 12px 24px;
    background: #4387f4;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #2c5aa0;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
  }

  .reconsider-button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #000;
  }

  .reconsider-button:active {
    transform: translate(4px, 4px);
    box-shadow: none;
  }

  .error-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    position: relative;
  }

  .error-card {
    background: #2d2d2d;
    border: 3px solid #000;
    box-shadow: 8px 8px 0 #4387f4;
    padding: 40px;
    text-align: center;
    max-width: 400px;
  }

  .error-icon {
    font-size: 64px;
    margin-bottom: 20px;
  }

  .error-title {
    font-size: 24px;
    font-weight: 900;
    text-transform: uppercase;
    color: #ffffff;
    margin-bottom: 24px;
  }

  .back-button-large {
    padding: 12px 24px;
    background: #4387f4;
    color: #fff;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #2c5aa0;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
  }

  .back-button-large:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #2c5aa0;
  }

  .back-button-large:active {
    transform: translate(4px, 4px);
    box-shadow: none;
  }
`;

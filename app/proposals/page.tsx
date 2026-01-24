"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import BrutalistPattern from "@/components/BrutalistPattern";
import Link from "next/link";
import { useClickSound } from "@/hooks/useClickSound";
import { usePageLoader } from "@/hooks/usePageLoader";
import Loader from "@/components/Loader";
import Tooltip from "@/components/Tooltip";
import { useAuth } from "@/lib/auth-context";
import { getReceivedProposals, getSentProposals } from "@/lib/supabase/api";
import { Proposal } from "@/lib/supabase/client";

export default function ProposalsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<"received" | "sent">("received");
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const { playClick, playHover } = useClickSound();
  const pageLoading = usePageLoader(1500);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  // Load proposals when tab changes
  useEffect(() => {
    if (user) {
      loadProposals();
    }
  }, [user, tab]);

  const loadProposals = async () => {
    if (!user) return;

    setLoadingProposals(true);
    try {
      if (tab === "received") {
        const { data, error } = await getReceivedProposals(user.id);
        if (!error && data) {
          setProposals(data);
        }
      } else {
        const { data, error } = await getSentProposals(user.id);
        if (!error && data) {
          setProposals(data);
        }
      }
    } catch (error) {
      console.error('Error loading proposals:', error);
    } finally {
      setLoadingProposals(false);
    }
  };

  if (loading || pageLoading) {
    return <Loader />;
  }

  if (!user) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      pending: { bg: "#fff", text: "#000" },
      accepted: { bg: "#000", text: "#fff" },
      rejected: { bg: "#e5e5f7", text: "#000" },
    };
    return colors[status] || colors.pending;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  return (
    <StyledWrapper>
      <BrutalistPattern />
      <Tooltip 
        message="Check received proposals and see who you've sent proposals to. Accept proposals to exchange contact info!"
        storageKey="proposals_guide"
        delay={1000}
      />
      <div className="proposals-container">
        {/* Header */}
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
          <h1 className="page-title">PROPOSALS</h1>
          <div className="spacer" />
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            onClick={() => {
              playClick();
              setTab("received");
            }}
            onMouseEnter={playHover}
            className={`filter-tab ${tab === "received" ? "active" : ""}`}
          >
            RECEIVED
          </button>
          <button
            onClick={() => {
              playClick();
              setTab("sent");
            }}
            onMouseEnter={playHover}
            className={`filter-tab ${tab === "sent" ? "active" : ""}`}
          >
            SENT
          </button>
        </div>

        {/* Proposals List */}
        <div className="proposals-list">
          {loadingProposals ? (
            <div className="empty-state">
              <p className="empty-text">Loading...</p>
            </div>
          ) : proposals.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p className="empty-text">No {tab} proposals yet</p>
            </div>
          ) : (
            proposals.map((proposal) => {
              const statusColor = getStatusBadge(proposal.status);
              const profile = tab === "received" ? proposal.from_profile : proposal.to_profile;
              const displayName = profile?.name || 'Unknown User';
              const displayMeta = tab === "received" && profile
                ? `${profile.department} • ${profile.batch}`
                : "";
              
              return (
                <Link key={proposal.id} href={`/proposals/${proposal.id}`}>
                  <div 
                    className="proposal-card"
                    onClick={playClick}
                    onMouseEnter={playHover}
                  >
                    <div className="proposal-header">
                      <div className="user-info">
                        <div className="user-name">{displayName}</div>
                        {displayMeta && (
                          <div className="user-meta">{displayMeta}</div>
                        )}
                      </div>
                      <div className="proposal-time">{formatTime(new Date(proposal.created_at))}</div>
                    </div>

                    <div className="proposal-message">{proposal.message}</div>

                    <div className="proposal-footer">
                      <div 
                        className="status-badge"
                        style={{ 
                          backgroundColor: statusColor.bg, 
                          color: statusColor.text 
                        }}
                      >
                        {proposal.status.toUpperCase()}
                      </div>
                      <div className="arrow">→</div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .proposals-container {
    min-height: 100vh;
    padding: 20px;
    position: relative;
    max-width: 600px;
    margin: 0 auto;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }

  .back-button {
    width: 48px;
    height: 48px;
    background: #fff;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #58A0C8;
    font-size: 24px;
    font-weight: 900;
    color: #000;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .back-button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #58A0C8;
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
    color: #000;
  }

  .spacer {
    width: 48px;
  }

  .filter-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .filter-tab {
    padding: 8px 16px;
    background: #fff;
    border: 3px solid #000;
    box-shadow: 3px 3px 0 #58A0C8;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    color: #000;
    cursor: pointer;
    transition: all 0.2s;
  }

  .filter-tab:hover {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0 #58A0C8;
  }

  .filter-tab:active,
  .filter-tab.active {
    transform: translate(3px, 3px);
    box-shadow: none;
    background: #58A0C8;
    color: #fff;
  }

  .proposals-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .proposal-card {
    background: #fff;
    border: 3px solid #000;
    box-shadow: 6px 6px 0 #58A0C8;
    padding: 20px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .proposal-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0 #58A0C8;
  }

  .proposal-card:active {
    transform: translate(6px, 6px);
    box-shadow: none;
  }

  .proposal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 2px solid #000;
  }

  .user-info {
    flex: 1;
  }

  .user-name {
    font-size: 20px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.5px;
    color: #000;
    margin-bottom: 4px;
  }

  .user-meta {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: #666;
  }

  .proposal-time {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: #666;
  }

  .proposal-message {
    font-size: 14px;
    line-height: 1.5;
    color: #000;
    margin-bottom: 12px;
  }

  .proposal-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .status-badge {
    padding: 4px 12px;
    border: 2px solid #000;
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .arrow {
    font-size: 20px;
    font-weight: 900;
    color: #000;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    background: #fff;
    border: 3px solid #000;
    box-shadow: 6px 6px 0 #58A0C8;
  }

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  .empty-text {
    font-size: 16px;
    font-weight: 700;
    text-transform: uppercase;
    color: #666;
  }
`;

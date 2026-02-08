"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import BrutalistPattern from "@/components/BrutalistPattern";
import Link from "next/link";
import { useClickSound } from "@/hooks/useClickSound";
import { useAuth } from "@/lib/auth-context";
import { getContactDetails, updateContactDetails } from "@/lib/supabase/api";
import Loader from "@/components/Loader";

export default function ContactPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { playClick, playConfirm, playDismiss, playHover } = useClickSound();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      loadContact();
    }
  }, [user]);

  const loadContact = async () => {
    if (!user) return;
    try {
      const { data, error } = await getContactDetails(user.id);
      if (error) throw error;
      if (data) {
        setPhoneNumber(data.phone_number || "");
        setContactEmail(data.contact_email || "");
      }
    } catch (err) {
      console.error("Error loading contact:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Basic validation
    if (!phoneNumber.trim() && !contactEmail.trim()) {
      setError("Add at least one contact method");
      playDismiss();
      return;
    }

    if (contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      setError("Enter a valid email address");
      playDismiss();
      return;
    }

    if (phoneNumber.trim() && !/^[\d+\-\s()]{7,20}$/.test(phoneNumber.trim())) {
      setError("Enter a valid phone number");
      playDismiss();
      return;
    }

    setError("");
    setSaving(true);

    try {
      const { error: updateError } = await updateContactDetails(user.id, {
        phone_number: phoneNumber.trim() || null as any,
        contact_email: contactEmail.trim() || null as any,
      });

      if (updateError) throw updateError;

      playConfirm();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      console.error("Error saving contact:", err);
      setError(err.message || "Failed to save");
      playDismiss();
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loadingData) {
    return <Loader />;
  }

  if (!user) return null;

  const hasContact = phoneNumber.trim() || contactEmail.trim();

  return (
    <StyledWrapper>
      <BrutalistPattern />
      <div className="contact-container">
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
          <h1 className="page-title">CONTACT INFO</h1>
          <div className="spacer" />
        </div>

        {/* Info Card */}
        <div className="info-card">
          <div className="info-icon">🔒</div>
          <p className="info-text">
            Your contact details are <strong>only revealed</strong> when someone accepts your proposal or you accept theirs.
          </p>
        </div>

        {/* Contact Form */}
        <div className="form-card">
          <div className="form-section">
            <label className="field-label">📱 PHONE / WHATSAPP</label>
            <input
              type="tel"
              className="field-input"
              placeholder="+92 300 1234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              maxLength={20}
            />
            <span className="field-hint">Best for quick WhatsApp contact</span>
          </div>

          <div className="form-section">
            <label className="field-label">📧 CONTACT EMAIL</label>
            <input
              type="email"
              className="field-input"
              placeholder="k230000@nu.edu.pk"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
            <span className="field-hint">Provide your nu.edu.pk email</span>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button
            className={`save-button ${saved ? "saved" : ""}`}
            onClick={handleSave}
            onMouseEnter={playHover}
            disabled={saving}
          >
            {saving ? "SAVING..." : saved ? "✓ SAVED!" : "SAVE CONTACT INFO"}
          </button>
        </div>

        {/* Status */}
        <div className={`status-card ${hasContact ? "complete" : "incomplete"}`}>
          <div className="status-icon">{hasContact ? "✅" : "⚠️"}</div>
          <div className="status-text">
            {hasContact
              ? "Your contact info is set. People who match with you can reach out!"
              : "No contact info yet. Add it so matched partners can contact you."}
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .contact-container {
    min-height: 100vh;
    padding: 20px;
    position: relative;
    max-width: 500px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    font-size: 28px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -1px;
    color: #ffffff;
  }

  .spacer {
    width: 48px;
  }

  /* Info Card */
  .info-card {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    background: #2d2d2d;
    border: 3px solid #4387f4;
    padding: 18px 20px;
    box-shadow: 4px 4px 0 #2c5aa0;
  }

  .info-icon {
    font-size: 24px;
    flex-shrink: 0;
  }

  .info-text {
    font-size: 13px;
    font-weight: 500;
    color: #aaa;
    line-height: 1.5;
    margin: 0;
  }

  .info-text strong {
    color: #4387f4;
    font-weight: 800;
  }

  /* Form Card */
  .form-card {
    background: #2d2d2d;
    border: 3px solid #000;
    padding: 28px 24px;
    box-shadow: 6px 6px 0 #4387f4;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .field-label {
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #888;
  }

  .field-input {
    width: 100%;
    padding: 14px 16px;
    font-size: 16px;
    font-weight: 700;
    font-family: inherit;
    background: #1a1a1a;
    color: #fff;
    border: 3px solid #333;
    outline: none;
    transition: border-color 0.2s;
  }

  .field-input:focus {
    border-color: #4387f4;
  }

  .field-input::placeholder {
    color: #555;
    font-weight: 500;
  }

  .field-hint {
    font-size: 11px;
    font-weight: 600;
    color: #555;
    letter-spacing: 0.5px;
  }

  .error-msg {
    font-size: 13px;
    font-weight: 800;
    color: #ef4444;
    background: #1a1a1a;
    border: 2px solid #ef4444;
    padding: 10px 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .save-button {
    width: 100%;
    padding: 16px 24px;
    font-size: 16px;
    font-weight: 900;
    text-transform: uppercase;
    background: #4387f4;
    color: #fff;
    border: 3px solid #000;
    box-shadow: 5px 5px 0 #2c5aa0;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.5px;
  }

  .save-button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 7px 7px 0 #2c5aa0;
  }

  .save-button:active {
    transform: translate(4px, 4px);
    box-shadow: none;
  }

  .save-button.saved {
    background: #10b981;
    box-shadow: 5px 5px 0 #059669;
  }

  .save-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Status Card */
  .status-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px;
    border: 3px solid #333;
    background: #1a1a1a;
  }

  .status-card.complete {
    border-color: #10b981;
  }

  .status-card.incomplete {
    border-color: #f59e0b;
  }

  .status-icon {
    font-size: 20px;
    flex-shrink: 0;
  }

  .status-text {
    font-size: 13px;
    font-weight: 600;
    color: #888;
    line-height: 1.4;
  }

  @media (max-width: 480px) {
    .contact-container {
      padding: 16px;
    }

    .page-title {
      font-size: 22px;
    }

    .form-card {
      padding: 20px 16px;
    }
  }
`;

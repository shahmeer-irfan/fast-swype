"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrutalistPattern from "@/components/BrutalistPattern";
import { departments, domains, lookingForOptions, availabilityOptions, campuses, skillsList, interestsList } from "@/lib/data";
import { useClickSound } from "@/hooks/useClickSound";
import { useAuth } from "@/lib/auth-context";
import { updateProfile, updateSkills, updateInterests } from "@/lib/supabase/api";
import Loader from "@/components/Loader";
import Tooltip from "@/components/Tooltip";


export default function EditProfilePage() {
  const router = useRouter();
  const { profile, user, loading, refreshProfile } = useAuth();
  const { playClick, playConfirm, playHover, playDismiss } = useClickSound();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    department: 'CS',
    batch: '',
    campus: 'Islamabad',
    domain: 'Full Stack',
    lookingFor: 'Product Development',
    availability: 'Looking actively',
    bio: '',
    skills: [] as string[],
    interests: [] as string[],
  });

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        department: profile.department || 'CS',
        batch: profile.batch || '',
        campus: profile.campus || 'Islamabad',
        domain: profile.domain || 'Full Stack',
        lookingFor: profile.looking_for || 'Product Development',
        availability: profile.availability || 'Looking actively',
        bio: profile.bio || '',
        skills: profile.skills ? profile.skills.map((s: any) => s.skill) : [],
        interests: profile.interests ? profile.interests.map((i: any) => i.interest) : [],
      });
    }
  }, [profile]);

  // Redirect if not authenticated
  if (!loading && !user) {
    router.push('/');
    return null;
  }

  if (loading || !profile) {
    return <Loader />;
  }

  const addSkill = (skill: string) => {
    if (!formData.skills.includes(skill)) {
      playClick();
      setFormData({ ...formData, skills: [...formData.skills, skill] });
    }
  };

  const removeSkill = (skill: string) => {
    playClick();
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });
  };

  const addInterest = (interest: string) => {
    if (!formData.interests.includes(interest)) {
      playClick();
      setFormData({ ...formData, interests: [...formData.interests, interest] });
    }
  };

  const removeInterest = (interest: string) => {
    playClick();
    setFormData({ ...formData, interests: formData.interests.filter((i) => i !== interest) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      // Update profile
      const { error: profileError } = await updateProfile(user!.id, {
        name: formData.name,
        department: formData.department,
        batch: formData.batch,
        campus: formData.campus,
        domain: formData.domain,
        looking_for: formData.lookingFor,
        availability: formData.availability,
        bio: formData.bio,
      });

      if (profileError) throw profileError;

      // Update skills
      const { error: skillsError } = await updateSkills(user!.id, formData.skills);
      if (skillsError) throw skillsError;

      // Update interests
      const { error: interestsError } = await updateInterests(user!.id, formData.interests);
      if (interestsError) throw interestsError;

      playConfirm();
      await refreshProfile();
      router.push("/profile");
    } catch (err: any) {
      playDismiss();
      setError(err.message || 'Failed to update profile');
      setSaving(false);
    }
  };

  return (
    <StyledWrapper>
      <BrutalistPattern />
      <Tooltip 
        message="Complete your profile to stand out! The better your profile, the more proposals you'll get."
        storageKey="edit_profile_tips"
        delay={1000}
      />
      <div className="edit-container">
        <div className="header">
          <Link href="/profile">
            <button 
              onClick={playClick}
              onMouseEnter={playHover}
              className="back-button"
            >
              ←
            </button>
          </Link>
          <h1 className="page-title">EDIT VIBE</h1>
          <div className="spacer" />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-wrapper">
          <div className="form-section">
            <h2 className="section-title">THE BASICS</h2>
            
            <div className="form-group">
              <label className="form-label">NAME</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">BIO <span className="hint">(Keep it short and funny)</span></label>
              <textarea
                className="form-textarea"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Will carry the team if you make memes..."
                rows={3}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">DEPT</label>
                <select
                  className="form-select"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">BATCH</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  placeholder="2021"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">CAMPUS</label>
              <select
                className="form-select"
                value={formData.campus}
                onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                required
              >
                {campuses.map((campus) => (
                  <option key={campus} value={campus}>{campus}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">DOMAIN</label>
              <select
                className="form-select"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                required
              >
                {domains.map((domain) => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">LOOKING FOR</label>
                <select
                  className="form-select"
                  value={formData.lookingFor}
                  onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
                  required
                >
                  {lookingForOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">AVAILABILITY</label>
                <select
                  className="form-select"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  required
                >
                  {availabilityOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">SKILLS <span className="hint">(Pick what you know)</span></h2>
            <div className="tags-select-container">
              {skillsList.map((skill, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`tag-select ${formData.skills.includes(skill) ? 'selected' : ''}`}
                  onClick={() => formData.skills.includes(skill) ? removeSkill(skill) : addSkill(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">INTERESTS <span className="hint">(What excites you?)</span></h2>
            <div className="tags-select-container">
              {interestsList.map((interest, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`tag-select ${formData.interests.includes(interest) ? 'selected' : ''}`}
                  onClick={() => formData.interests.includes(interest) ? removeInterest(interest) : addInterest(interest)}
                >
                  #{interest}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            onMouseEnter={playHover}
            disabled={saving}
            className="submit-button"
          >
            {saving ? 'SAVING...' : 'SAVE & FLEX'}
          </button>
        </form>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .edit-container {
    min-height: 100vh;
    padding: 20px;
    padding-bottom: 40px;
    position: relative;
  }

  .error-message {
    max-width: 500px;
    margin: 0 auto 15px;
    padding: 12px;
    background: #ff6b6b;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #000;
    color: #fff;
    font-weight: 700;
    text-align: center;
    font-size: 13px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 500px;
    margin: 0 auto 30px;
  }

  .back-button {
    padding: 10px 16px;
    font-size: 24px;
    font-weight: 900;
    background: #fff;
    color: #000;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #000;
    cursor: pointer;
    transition: all 0.2s;
  }

  .back-button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #000;
  }

  .back-button:active {
    transform: translate(4px, 4px);
    box-shadow: none;
  }

  .page-title {
    font-size: 28px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -1.5px;
    color: #000;
  }

  .spacer {
    width: 60px;
  }

  .form-wrapper {
    max-width: 500px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .form-section {
    background: #fff;
    border: 3px solid #000;
    padding: 20px;
    box-shadow: 4px 4px 0 #000;
  }

  .section-title {
    font-size: 18px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.5px;
    color: #000;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid #000;
  }

  .hint {
    font-size: 10px;
    font-weight: 600;
    color: #666;
    text-transform: none;
    letter-spacing: 0;
  }

  .form-group {
    margin-bottom: 15px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .form-label {
    display: block;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    color: #000;
    margin-bottom: 8px;
    letter-spacing: 0.5px;
  }

  .form-input, .form-textarea, .form-select {
    width: 100%;
    padding: 12px;
    font-size: 14px;
    font-weight: 600;
    border: 3px solid #000;
    background: #fff;
    color: #000;
    box-shadow: 3px 3px 0 #000;
    transition: all 0.2s;
    font-family: "Arial", "Helvetica", sans-serif;
  }

  .form-input:focus, .form-textarea:focus, .form-select:focus {
    outline: none;
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0 #000;
  }

  .form-textarea {
    resize: vertical;
    min-height: 80px;
  }

  .tags-select-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag-select {
    padding: 8px 12px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    background: #fff;
    border: 2px solid #000;
    color: #000;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tag-select:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0 #000;
  }

  .tag-select.selected {
    background: #000;
    color: #fff;
    box-shadow: 2px 2px 0 #000;
  }

  .submit-button {
    width: 100%;
    padding: 18px;
    font-size: 20px;
    font-weight: 900;
    text-transform: uppercase;
    background: #000;
    color: #fff;
    border: 3px solid #000;
    box-shadow: 6px 6px 0 #000;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: -1px;
  }

  .submit-button:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0 #000;
    background: #00ff00;
    color: #000;
  }

  .submit-button:active:not(:disabled) {
    transform: translate(6px, 6px);
    box-shadow: none;
  }

  .submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

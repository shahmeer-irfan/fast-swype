"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BrutalistPattern from "@/components/BrutalistPattern";
import { departments, domains, lookingForOptions, availabilityOptions, campuses, skillsList, interestsList } from "@/lib/data";
import { useClickSound } from "@/hooks/useClickSound";
import { useAuth } from "@/lib/auth-context";
import { updateProfile, updateSkills, updateInterests, uploadProfilePicture, deleteProfilePicture } from "@/lib/supabase/api";
import Loader from "@/components/Loader";
import Tooltip from "@/components/Tooltip";


export default function EditProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showWelcome = searchParams.get('welcome') === 'true';
  const { profile, user, loading, isRetrying, refreshProfile } = useAuth();
  const { playClick, playConfirm, playHover, playDismiss } = useClickSound();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [welcomeVisible, setWelcomeVisible] = useState(showWelcome);
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
      if (profile.profile_picture_url) {
        setProfilePicturePreview(profile.profile_picture_url);
      }
    }
  }, [profile]);

  // Redirect if not authenticated
  if (!loading && !user) {
    router.push('/');
    return null;
  }

  // Show loader while loading, retrying, OR if no profile (keep trying)
  if (loading || isRetrying || !profile) {
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

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      playClick();
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (profile?.profile_picture_url) {
      try {
        await deleteProfilePicture(user!.id, profile.profile_picture_url);
        await updateProfile(user!.id, { profile_picture_url: null as any });
        await refreshProfile();
        playClick();
      } catch (err) {
        console.error('Failed to delete profile picture:', err);
      }
    }
    setProfilePicture(null);
    setProfilePicturePreview(null);
    playClick();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      let profilePictureUrl = profile?.profile_picture_url;

      // Upload profile picture if changed
      if (profilePicture) {
        profilePictureUrl = await uploadProfilePicture(profilePicture, user!.id);
      }

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
        profile_picture_url: profilePictureUrl,
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
      
      {welcomeVisible && (
        <WelcomeMessage>
          <div className="welcome-content">
            <h2>🎉 Welcome to Fast-Swype!</h2>
            <p>Your email is verified! Complete your profile to start finding your perfect team match.</p>
            <button onClick={() => {
              playClick();
              setWelcomeVisible(false);
            }}>
              Got it!
            </button>
          </div>
        </WelcomeMessage>
      )}

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
          {/* Profile Picture Section */}
          <div className="form-section">
            <h2 className="section-title">PROFILE PICTURE (OPTIONAL)</h2>
            <div className="profile-picture-upload">
              <div className="picture-preview">
                {profilePicturePreview ? (
                  <img src={profilePicturePreview} alt="Profile" className="preview-image" />
                ) : (
                  <div className="preview-placeholder">
                    <span className="placeholder-icon">📷</span>
                    <span className="placeholder-text">No photo yet</span>
                  </div>
                )}
              </div>
              <div className="picture-actions">
                <label htmlFor="profile-picture" className="upload-button">
                  <input
                    type="file"
                    id="profile-picture"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    style={{ display: 'none' }}
                  />
                  {profilePicturePreview ? 'Change Photo' : 'Upload Photo'}
                </label>
                {profilePicturePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveProfilePicture}
                    className="remove-button"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

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
    box-shadow: 4px 4px 0 #4387f4;
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
    background: #4387f4;
    color: #ffffff;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #2c5aa0;
    cursor: pointer;
    transition: all 0.2s;
  }

  .back-button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #4387f4;
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
    color: #ffffff;
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
    background: #2d2d2d;
    border: 3px solid #000;
    padding: 20px;
    box-shadow: 4px 4px 0 #4387f4;
  }

  .section-title {
    font-size: 18px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.5px;
    color: #ffffff;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid #4387f4;
  }

  .hint {
    font-size: 10px;
    font-weight: 600;
    color: #999;
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
    color: #ffffff;
    margin-bottom: 8px;
    letter-spacing: 0.5px;
  }

  .profile-picture-upload {
    display: flex;
    gap: 20px;
    align-items: center;
  }

  .picture-preview {
    width: 120px;
    height: 120px;
    border: 4px solid #000;
    box-shadow: 4px 4px 0 #4387f4;
    overflow: hidden;
    background: #1a1a1a;
  }

  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .preview-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #4387f4;
  }

  .placeholder-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }

  .placeholder-text {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    color: #ffffff;
  }

  .picture-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .upload-button,
  .remove-button {
    padding: 10px 16px;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    border: 3px solid #000;
    background: #4387f4;
    color: #ffffff;
    box-shadow: 3px 3px 0 #2c5aa0;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
  }

  .upload-button:hover,
  .remove-button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0 #4387f4;
  }

  .upload-button:active,
  .remove-button:active {
    transform: translate(3px, 3px);
    box-shadow: none;
  }

  .remove-button {
    background: #ff0000;
    color: #fff;
  }

  .form-input, .form-textarea, .form-select {
    width: 100%;
    padding: 12px;
    font-size: 14px;
    font-weight: 600;
    border: 3px solid #000;
    background: #1a1a1a;
    color: #ffffff;
    box-shadow: 3px 3px 0 #4387f4;
    transition: all 0.2s;
    font-family: "Arial", "Helvetica", sans-serif;
  }

  .form-input:focus, .form-textarea:focus, .form-select:focus {
    outline: none;
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0 #4387f4;
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
    background: #1a1a1a;
    border: 2px solid #000;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tag-select:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0 #4387f4;
  }

  .tag-select.selected {
    background: #4387f4;
    color: #fff;
    box-shadow: 2px 2px 0 #4387f4;
  }

  .submit-button {
    width: 100%;
    padding: 18px;
    font-size: 20px;
    font-weight: 900;
    text-transform: uppercase;
    background: #4387f4;
    color: #fff;
    border: 3px solid #000;
    box-shadow: 6px 6px 0 #2c5aa0;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: -1px;
  }

  .submit-button:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0 #2c5aa0;
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

const WelcomeMessage = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .welcome-content {
    background: #1a1a1a;
    border: 4px solid #000;
    box-shadow: 8px 8px 0 #4387f4;
    padding: 40px;
    max-width: 500px;
    text-align: center;
    animation: slideUp 0.4s ease-out;
  }

  @keyframes slideUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  h2 {
    font-size: 28px;
    font-weight: 900;
    color: #4387f4;
    margin: 0 0 20px 0;
    text-transform: uppercase;
    letter-spacing: -1px;
  }

  p {
    font-size: 16px;
    color: #ffffff;
    margin: 0 0 30px 0;
    line-height: 1.6;
  }

  button {
    padding: 14px 36px;
    font-size: 16px;
    font-weight: 900;
    text-transform: uppercase;
    background: #4387f4;
    color: #fff;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #2c5aa0;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: -0.5px;
  }

  button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #2c5aa0;
  }

  button:active {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0 #2c5aa0;
  }
`;

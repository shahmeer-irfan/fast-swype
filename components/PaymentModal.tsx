"use client";

import { useState } from "react";
import styled from "styled-components";
import { createPayment, uploadPaymentScreenshot } from "@/lib/supabase/api";
import { useClickSound } from "@/hooks/useClickSound";

interface PaymentModalProps {
  onClose: () => void;
  onPaymentSubmitted?: () => void;
}

export default function PaymentModal({ onClose, onPaymentSubmitted }: PaymentModalProps) {
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [transactionDetails, setTransactionDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { playClick, playConfirm, playHover } = useClickSound();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!screenshot) {
      setError("Please upload payment screenshot");
      return;
    }

    if (!transactionDetails.trim()) {
      setError("Please provide transaction details");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Create payment record
      const payment = await createPayment(transactionDetails);
      
      // Upload screenshot
      await uploadPaymentScreenshot(screenshot, payment.id);

      playConfirm();
      
      // Close modal immediately
      onClose();
      
      // Show success notification
      alert("✅ Payment Submitted Successfully!\n\nYour payment has been submitted and will be verified within 24 hours. You'll get unlimited proposals once verified!");
      
      if (onPaymentSubmitted) {
        onPaymentSubmitted();
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit payment");
      setIsSubmitting(false);
    }
  };

  const handleCopyIBAN = () => {
    navigator.clipboard.writeText(process.env.NEXT_PUBLIC_IBAN_NUMBER || "");
    playClick();
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${process.env.NEXT_PUBLIC_PAYMENT_WHATSAPP?.replace('+', '')}`, '_blank');
    playClick();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>💰 UNLOCK UNLIMITED</ModalTitle>
          <CloseButton onClick={onClose} onMouseEnter={playHover}>×</CloseButton>
        </ModalHeader>

        <ModalContent>
          <InfoSection>
            <InfoTitle>💻 Help Me Get a New Laptop!</InfoTitle>
            <InfoText>
              You've used your 2 FREE proposals! I'm a broke student who built this tool instead of studying 😅
              <br/><br/>
              Just PKR 250 (~$1) helps me afford a laptop that doesn't crash during exams. Plus you get UNLIMITED proposals forever! Win-win? 🙏
            </InfoText>
          </InfoSection>

          <PaymentSteps>
            <Step>
              <StepNumber>1</StepNumber>
              <StepText>
                <strong>Send PKR 250</strong> to this account:
              </StepText>
            </Step>

            <IBANBox>
              <IBANText>{process.env.NEXT_PUBLIC_IBAN_NUMBER || "PK00XXXX0000000000000000"}</IBANText>
              <CopyButton onClick={handleCopyIBAN} onMouseEnter={playHover}>
                📋 COPY
              </CopyButton>
            </IBANBox>

            <Step>
              <StepNumber>2</StepNumber>
              <StepText>
                <strong>Take a screenshot</strong> of the transaction
              </StepText>
            </Step>

            <Step>
              <StepNumber>3</StepNumber>
              <StepText>
                <strong>Upload screenshot</strong> and submit below
              </StepText>
            </Step>
          </PaymentSteps>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Transaction Screenshot *</Label>
              <FileInput>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
                <FileLabel>
                  {screenshot ? `✓ ${screenshot.name}` : "📸 Choose Image"}
                </FileLabel>
              </FileInput>
            </FormGroup>

            <FormGroup>
              <Label>Transaction Details (Optional)</Label>
              <TextArea
                placeholder="e.g., Reference number, sender name..."
                value={transactionDetails}
                onChange={(e) => setTransactionDetails(e.target.value)}
                maxLength={200}
              />
              <CharCount>{transactionDetails.length}/200</CharCount>
            </FormGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <ButtonGroup>
              <WhatsAppButton 
                type="button" 
                onClick={handleWhatsApp}
                onMouseEnter={playHover}
              >
                💬 HELP VIA WHATSAPP
              </WhatsAppButton>
              <SubmitButton 
                type="submit" 
                disabled={isSubmitting || !screenshot}
                onMouseEnter={playHover}
              >
                {isSubmitting ? "SUBMITTING..." : "SUBMIT PAYMENT"}
              </SubmitButton>
            </ButtonGroup>
          </Form>

          <Note>
            ⏱️ Verification usually takes 2-24 hours. You'll get access once verified!
          </Note>
        </ModalContent>
      </ModalCard>
    </ModalOverlay>
  );
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
`;

const ModalCard = styled.div`
  background: #fff;
  border: 4px solid #000;
  box-shadow: 12px 12px 0 #000;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 3px solid #000;
  background: #000;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 900;
  text-transform: uppercase;
  color: #fff;
  margin: 0;
`;

const CloseButton = styled.button`
  background: #fff;
  border: 2px solid #000;
  width: 36px;
  height: 36px;
  font-size: 28px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;

  &:hover {
    transform: rotate(90deg);
  }
`;

const ModalContent = styled.div`
  padding: 24px;
`;

const InfoSection = styled.div`
  background: #f5f5f5;
  border: 3px solid #000;
  padding: 16px;
  margin-bottom: 20px;
`;

const InfoTitle = styled.div`
  font-size: 14px;
  font-weight: 900;
  text-transform: uppercase;
  color: #000;
  margin-bottom: 8px;
`;

const InfoText = styled.p`
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
  color: #000;
  margin: 0;
`;

const PaymentSteps = styled.div`
  margin-bottom: 24px;
`;

const Step = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const StepNumber = styled.div`
  width: 28px;
  height: 28px;
  background: #000;
  color: #fff;
  border: 2px solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 900;
  flex-shrink: 0;
`;

const StepText = styled.div`
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
  color: #000;
  padding-top: 4px;
`;

const IBANBox = styled.div`
  background: #fff;
  border: 3px solid #000;
  padding: 12px;
  margin: 12px 0 16px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const IBANText = styled.div`
  font-size: 12px;
  font-weight: 900;
  font-family: monospace;
  color: #000;
  flex: 1;
`;

const CopyButton = styled.button`
  background: #000;
  color: #fff;
  border: 2px solid #000;
  padding: 6px 12px;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fff;
    color: #000;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  color: #000;
`;

const FileInput = styled.div`
  position: relative;

  input[type="file"] {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
`;

const FileLabel = styled.div`
  background: #fff;
  border: 3px solid #000;
  padding: 12px;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
  }
`;

const TextArea = styled.textarea`
  background: #fff;
  border: 3px solid #000;
  padding: 12px;
  font-size: 13px;
  font-weight: 600;
  font-family: Arial, sans-serif;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #000;
  }
`;

const CharCount = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: #666;
  text-align: right;
`;

const ErrorMessage = styled.div`
  background: #ffe5e5;
  border: 2px solid #ff0000;
  padding: 12px;
  font-size: 12px;
  font-weight: 700;
  color: #ff0000;
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const WhatsAppButton = styled.button`
  background: #25D366;
  color: #fff;
  border: 3px solid #000;
  padding: 12px;
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 4px 4px 0 #000;
  transition: all 0.2s;

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #000;
  }

  &:active {
    transform: translate(4px, 4px);
    box-shadow: none;
  }
`;

const SubmitButton = styled.button`
  background: #000;
  color: #fff;
  border: 3px solid #000;
  padding: 14px;
  font-size: 14px;
  font-weight: 900;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 4px 4px 0 #000;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #000;
  }

  &:active:not(:disabled) {
    transform: translate(4px, 4px);
    box-shadow: none;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Note = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: #fffbea;
  border: 2px solid #000;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  color: #666;
`;

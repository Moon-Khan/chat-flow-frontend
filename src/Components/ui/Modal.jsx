import React, { useEffect } from 'react';
import styled from 'styled-components';
import { FiX } from 'react-icons/fi';
import { IconButton } from './IconButton';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndex.modal};
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  width: ${({ width }) => width || '450px'};
  max-width: 90%;
  max-height: 90vh;
  box-shadow: ${({ theme }) => theme.shadows.xl};
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const ModalHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight[600]};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ModalBody = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  overflow-y: auto;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ModalFooter = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
`;

export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    width,
    closeOnOutsideClick = true
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={closeOnOutsideClick ? onClose : undefined}>
            <ModalContainer width={width} onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>{title}</ModalTitle>
                    <IconButton onClick={onClose}>
                        <FiX size={20} />
                    </IconButton>
                </ModalHeader>
                <ModalBody>
                    {children}
                </ModalBody>
                {footer && <ModalFooter>{footer}</ModalFooter>}
            </ModalContainer>
        </ModalOverlay>
    );
};

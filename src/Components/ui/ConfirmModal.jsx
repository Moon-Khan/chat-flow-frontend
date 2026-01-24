import React from 'react';
import styled from 'styled-components';
import { Modal } from './Modal';
import { Button } from './Button';
import { FiAlertCircle } from 'react-icons/fi';

const ContentWrapper = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md} 0;
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.error[500]};
`;

const Title = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
`;

const Message = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
`;

const FooterActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
`;

export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger' // 'danger', 'info', 'warning'
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            width="400px"
            footer={
                <FooterActions>
                    <Button $variant="secondary" onClick={onClose} $fullWidth>
                        {cancelText}
                    </Button>
                    <Button
                        $variant={type === 'danger' ? 'danger' : 'primary'}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        $fullWidth
                    >
                        {confirmText}
                    </Button>
                </FooterActions>
            }
        >
            <ContentWrapper>
                <IconWrapper>
                    <FiAlertCircle size={48} />
                </IconWrapper>
                <Title>{title}</Title>
                <Message>{message}</Message>
            </ContentWrapper>
        </Modal>
    );
};

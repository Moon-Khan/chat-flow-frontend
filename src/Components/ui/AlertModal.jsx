import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import styled from 'styled-components';
import { FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ color }) => color};
`;

const AlertText = styled.div`
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
`;

export const AlertModal = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'info', // 'info', 'success', 'error'
    confirmText = 'OK'
}) => {
    const getIcon = () => {
        switch (type) {
            case 'success': return <FiCheckCircle size={48} color="#10B981" />;
            case 'error': return <FiAlertCircle size={48} color="#EF4444" />;
            default: return <FiInfo size={48} color="#3B82F6" />;
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            width="400px"
            footer={
                <Button onClick={onClose} $fullWidth>
                    {confirmText}
                </Button>
            }
        >
            <IconWrapper>
                {getIcon()}
            </IconWrapper>
            <AlertText>
                {message}
            </AlertText>
        </Modal>
    );
};

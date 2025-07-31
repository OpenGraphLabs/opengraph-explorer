import { useState, useCallback } from "react";

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "info";
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
}

const initialModalState: ModalState = {
  isOpen: false,
  title: "",
  message: "",
  type: "info",
  confirmText: "OK",
  cancelText: "Cancel",
  showCancel: false,
};

export function useModal() {
  const [modalState, setModalState] = useState<ModalState>(initialModalState);

  const openModal = useCallback((config: Partial<ModalState>) => {
    setModalState(prev => ({
      ...prev,
      ...config,
      isOpen: true,
    }));
  }, []);

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showSuccess = useCallback((title: string, message: string, onConfirm?: () => void) => {
    openModal({
      title,
      message,
      type: "success",
      onConfirm,
    });
  }, [openModal]);

  const showError = useCallback((title: string, message: string, onConfirm?: () => void) => {
    openModal({
      title,
      message,
      type: "error",
      onConfirm,
    });
  }, [openModal]);

  const showInfo = useCallback((title: string, message: string, onConfirm?: () => void) => {
    openModal({
      title,
      message,
      type: "info",
      onConfirm,
    });
  }, [openModal]);

  const showConfirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText = "Confirm",
    cancelText = "Cancel"
  ) => {
    openModal({
      title,
      message,
      type: "info",
      onConfirm,
      confirmText,
      cancelText,
      showCancel: true,
    });
  }, [openModal]);

  return {
    modalState,
    openModal,
    closeModal,
    showSuccess,
    showError,
    showInfo,
    showConfirm,
  };
}
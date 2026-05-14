"use client";

import React, { createContext, useContext, useState } from "react";

type ModalFormContextType = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

const ModalFormContext = createContext<ModalFormContextType | undefined>(undefined);

export function ModalFormProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ModalFormContext.Provider
      value={{
        isOpen,
        openModal: () => setIsOpen(true),
        closeModal: () => setIsOpen(false),
      }}
    >
      {children}
    </ModalFormContext.Provider>
  );
}

export function useModalForm() {
  const context = useContext(ModalFormContext);
  if (!context) {
    throw new Error("useModalForm must be used within ModalFormProvider");
  }
  return context;
}

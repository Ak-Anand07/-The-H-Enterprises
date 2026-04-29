"use client";
import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger"
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const colorClass = 
    type === "danger" ? "text-error bg-error/10" : 
    type === "warning" ? "text-tertiary bg-tertiary/10" : 
    "text-primary bg-primary/10";

  const btnClass = 
    type === "danger" ? "bg-error text-on-error" : 
    type === "warning" ? "bg-tertiary text-on-tertiary" : 
    "bg-primary text-on-primary";

  const icon = 
    type === "danger" ? "delete_forever" : 
    type === "warning" ? "warning" : 
    "info";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        <div className="p-8">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${colorClass}`}>
            <span className="material-symbols-outlined text-3xl">{icon}</span>
          </div>
          
          <h3 className="text-2xl font-extrabold text-on-surface tracking-tight mb-2">
            {title}
          </h3>
          <p className="text-on-surface-variant font-medium leading-relaxed">
            {message}
          </p>
          
          <div className="mt-10 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 px-6 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container transition-all border-none bg-transparent"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-4 px-6 rounded-xl font-bold shadow-lg active:scale-95 transition-all border-none ${btnClass}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
        
        {/* Decorative background element */}
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      </div>
    </div>
  );
}

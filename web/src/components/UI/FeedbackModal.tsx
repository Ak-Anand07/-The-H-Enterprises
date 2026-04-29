"use client";
import React from "react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "info";
  buttonText?: string;
}

export function FeedbackModal({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  buttonText = "Got it"
}: FeedbackModalProps) {
  if (!isOpen) return null;

  const colorClass = 
    type === "success" ? "text-primary bg-primary/10" : 
    type === "error" ? "text-error bg-error/10" : 
    "text-tertiary bg-tertiary/10";

  const btnClass = 
    type === "success" ? "bg-primary text-on-primary" : 
    type === "error" ? "bg-error text-on-error" : 
    "bg-tertiary text-on-tertiary";

  const icon = 
    type === "success" ? "check_circle" : 
    type === "error" ? "error" : 
    "info";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        <div className="p-8 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${colorClass}`}>
            <span className="material-symbols-outlined text-5xl">{icon}</span>
          </div>
          
          <h3 className="text-2xl font-extrabold text-on-surface tracking-tight mb-2">
            {title}
          </h3>
          <p className="text-on-surface-variant font-medium leading-relaxed">
            {message}
          </p>
          
          <div className="mt-8">
            <button
              onClick={onClose}
              className={`w-full py-4 px-6 rounded-xl font-bold shadow-lg active:scale-95 transition-all border-none ${btnClass}`}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

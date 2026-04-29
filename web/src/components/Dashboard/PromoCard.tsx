import React from "react";

export function PromoCard() {
  return (
    <div className="crm-primary-btn text-on-primary p-8 rounded-xl relative overflow-hidden shadow-xl">
      <div className="relative z-10">
        <h4 className="font-bold text-lg mb-2">Automate Your Audit</h4>
        <p className="text-xs text-on-primary/80 mb-6 leading-relaxed">
          Let our AI-driven ledger reconcile your accounts automatically overnight. High accuracy, zero effort.
        </p>
        <button className="bg-on-primary text-primary px-6 py-2 rounded-lg font-bold text-xs hover:bg-primary-fixed transition-colors">
          Learn More
        </button>
      </div>
      <span
        className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl text-on-primary/10 rotate-12"
        data-icon="auto_awesome"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        auto_awesome
      </span>
    </div>
  );
}

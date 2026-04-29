"use client";
import React, { useState } from "react";

const FAQS = [
  {
    q: "How do I update my company details on invoices?",
    a: "You can update your business name, GSTIN, and address in the Settings page. These changes will automatically reflect on all new PDF downloads."
  },
  {
    q: "Can I download multiple invoices at once?",
    a: "Currently, you can download invoices individually. We are working on a bulk export feature for our next update."
  },
  {
    q: "What is the difference between a Proforma and a Final Invoice?",
    a: "A Proforma invoice is a preliminary bill sent before work is completed. A Final Invoice is the official record used for accounting and tax purposes."
  },
  {
    q: "How is the 'Monthly Revenue Performance' calculated?",
    a: "The chart aggregates the total amount of all invoices issued within each calendar month, showing your gross revenue trend over the last 7 months."
  }
];

export default function SupportPage() {
  const [formState, setFormState] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormState({ name: "", email: "", subject: "", message: "" });
    }, 1500);
  };

  return (
    <div className="relative p-4 sm:p-8 z-0 min-h-screen">
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl -z-10"></div>
      <div className="absolute left-10 bottom-0 h-64 w-64 rounded-full bg-secondary-container/10 blur-3xl -z-10"></div>

      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">How can we help?</h1>
        <p className="text-on-surface-variant text-lg font-medium mt-3">
          Search our knowledge base or get in touch with our expert support team.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
        {/* Quick Help Cards */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="crm-panel p-6 rounded-2xl border-l-4 border-l-primary hover:translate-y-[-4px] transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined text-2xl">mail</span>
            </div>
            <h3 className="font-bold text-lg text-on-surface">Email Support</h3>
            <p className="text-sm text-on-surface-variant mt-2">Response within 24 hours.</p>
            <a href="mailto:support@aiaccounting.com" className="text-primary font-bold text-sm mt-4 inline-block hover:underline">support@aiaccounting.com</a>
          </div>

          <div className="crm-panel p-6 rounded-2xl border-l-4 border-l-secondary hover:translate-y-[-4px] transition-all">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-4">
              <span className="material-symbols-outlined text-2xl">menu_book</span>
            </div>
            <h3 className="font-bold text-lg text-on-surface">Documentation</h3>
            <p className="text-sm text-on-surface-variant mt-2">Step-by-step user guides.</p>
            <button className="text-secondary font-bold text-sm mt-4 inline-block hover:underline border-none bg-transparent">Browse Docs</button>
          </div>
        </div>

        {/* Support Form & FAQ */}
        <div className="w-full lg:w-2/3 space-y-8">
          {/* Contact Form */}
          <div className="crm-panel rounded-3xl p-4 sm:p-8 overflow-hidden relative">
            <h2 className="text-2xl font-extrabold text-on-surface mb-6">Send us a message</h2>
            
            {submitted ? (
              <div className="py-12 text-center animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                  <span className="material-symbols-outlined text-5xl">check_circle</span>
                </div>
                <h3 className="text-2xl font-bold text-on-surface">Message Received!</h3>
                <p className="text-on-surface-variant mt-2">Our team will get back to you shortly.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-8 text-primary font-bold hover:underline border-none bg-transparent"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-on-surface-variant ml-1 uppercase">Name</label>
                    <input 
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({...formState, name: e.target.value})}
                      className="crm-drawer-field w-full p-4 rounded-xl text-sm border-x-0 border-t-0 border-b-2 border-b-slate-400 focus:border-b-primary focus:ring-0 transition-all outline-none"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-on-surface-variant ml-1 uppercase">Email</label>
                    <input 
                      required
                      type="email"
                      value={formState.email}
                      onChange={(e) => setFormState({...formState, email: e.target.value})}
                      className="crm-drawer-field w-full p-4 rounded-xl text-sm border-x-0 border-t-0 border-b-2 border-b-slate-400 focus:border-b-primary focus:ring-0 transition-all outline-none"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant ml-1 uppercase">Subject</label>
                  <input 
                    required
                    value={formState.subject}
                    onChange={(e) => setFormState({...formState, subject: e.target.value})}
                    className="crm-drawer-field w-full p-4 rounded-xl text-sm border-x-0 border-t-0 border-b-2 border-b-slate-400 focus:border-b-primary focus:ring-0 transition-all outline-none"
                    placeholder="What do you need help with?"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant ml-1 uppercase">Message</label>
                  <textarea 
                    required
                    rows={4}
                    value={formState.message}
                    onChange={(e) => setFormState({...formState, message: e.target.value})}
                    className="crm-drawer-field w-full p-4 rounded-xl text-sm border-x-0 border-t-0 border-b-2 border-b-slate-400 focus:border-b-primary focus:ring-0 transition-all outline-none resize-none"
                    placeholder="Tell us more about your issue..."
                  />
                </div>
                <button 
                  disabled={isSubmitting}
                  className="crm-primary-btn w-full py-4 rounded-2xl text-on-primary font-bold flex items-center justify-center gap-2 transition-all active:scale-95 border-none disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined">send</span>
                  )}
                  {isSubmitting ? "Sending..." : "Submit Support Request"}
                </button>
              </form>
            )}
          </div>

          {/* FAQ Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-extrabold text-on-surface">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <details key={i} className="group crm-panel rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-surface-container-low transition-colors">
                    <h4 className="font-bold text-on-surface pr-4">{faq.q}</h4>
                    <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                  </summary>
                  <div className="px-5 pb-5 pt-0 text-sm text-on-surface-variant leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

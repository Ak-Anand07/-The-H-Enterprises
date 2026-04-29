"use client";
import React, { useState } from "react";
import { useAuth } from "../../providers/AuthProvider";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password });
    } catch (err: unknown) {
      setError("Failed to create account. Email may already be in use.");
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center px-5 py-4 min-h-screen relative overflow-hidden bg-background">
      {/* Abstract Architectural Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>
      
      {/* Container */}
      <div className="w-full max-w-[1040px] grid lg:grid-cols-2 bg-surface-container-low rounded-[10px] overflow-hidden shadow-sm border border-outline-variant/10 relative z-10">
        
        {/* Left Side: Visual/Branding */}
        <div className="hidden lg:flex flex-col justify-between p-8 bg-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              alt="Modern architectural glass building reflecting blue sky" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9nZRMSeNMM9CG0xxMVIP6jB7GUMsrT11UebposhtwPeATWCynWzjyysXg1UJ5b7B60sWO7sdcellJ2ktD4UikoISnk2qvppNTCNMA6-AOCxvAOsRtNcj1Za0kF7FSFQGvlx7kaa8YogunF8wRXX9r4ZgDPyB9f-bgdNOBzQkvBs4Hxm2nTATX-W0eQT-KZHw6Whjhnyxjn4Sl8lv0VNYrkHxabwpP0KBCt_KJ0roBGBTmdtJ-NcIzblvU-KEfJtREi3dgz72Kyxim"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary to-primary-container mix-blend-multiply opacity-65 z-10"></div>
          
          <div className="relative z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary font-bold">domain</span>
              </div>
              <span className="font-headline font-extrabold text-2xl text-white tracking-tight">The H Enterprises</span>
            </div>
          </div>
          
          <div className="relative z-20 space-y-3">
             <h1 className="font-headline text-[1.85rem] font-bold text-white leading-tight">
               Join our exclusive <br/>network of partners.
             </h1>
             <p className="mt-1 text-white/60 font-body text-[13px] leading-6 max-w-[19rem]">
               Create an account to gain access to premium management tools and insights.
             </p>
          </div>
          
          <div className="relative z-20 text-white/50 text-[10px] font-label uppercase tracking-[0.18em]">
            CRM for Hotel Client Management
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="p-4 md:p-6 lg:p-8 flex flex-col justify-center bg-surface-container-lowest">
          <div className="mb-3 lg:hidden">
            <span className="font-headline font-extrabold text-xl text-primary tracking-tight">The H Enterprises</span>
          </div>
          
          <div className="max-w-lg w-full mx-auto rounded-[20px] border border-outline-variant/10 bg-white/95 p-5 shadow-[0_20px_44px_rgba(15,23,42,0.08)] backdrop-blur-sm md:p-6">
            <div className="mb-4 border-b border-outline-variant/10 pb-3">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Create Account</h2>
              <p className="text-outline font-body text-sm">Fill in your details to create a new workspace account.</p>
            </div>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 rounded-lg bg-error-container text-on-error-container font-medium text-sm flex gap-3 text-left">
                  <span className="material-symbols-outlined text-lg shrink-0">error</span>
                  {error}
                </div>
              )}

              {/* Name Input */}
              <div className="space-y-2">
                <label className="block font-label text-xs font-semibold text-outline uppercase tracking-wider" htmlFor="name">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg">person</span>
                  </div>
                  <input 
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-transparent focus:border-primary/10 focus:ring-2 focus:ring-primary/20 rounded-[10px] text-on-surface font-body text-sm transition-all placeholder:text-outline/50" 
                    id="name" 
                    name="name" 
                    placeholder="E.g., Jane Doe" 
                    required 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="block font-label text-xs font-semibold text-outline uppercase tracking-wider" htmlFor="email">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg">alternate_email</span>
                  </div>
                  <input 
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-transparent focus:border-primary/10 focus:ring-2 focus:ring-primary/20 rounded-[10px] text-on-surface font-body text-sm transition-all placeholder:text-outline/50" 
                    id="email" 
                    name="email" 
                    placeholder="exec@theh-enterprises.com" 
                    required 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Password Input */}
              <div className="space-y-2">
                <label className="block font-label text-xs font-semibold text-outline uppercase tracking-wider" htmlFor="password">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg">lock</span>
                  </div>
                  <input 
                    className="w-full pl-11 pr-12 py-3 bg-surface-container-low border border-transparent focus:border-primary/10 focus:ring-2 focus:ring-primary/20 rounded-[10px] text-on-surface font-body text-sm transition-all placeholder:text-outline/50" 
                    id="password" 
                    name="password" 
                    placeholder="************" 
                    required 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-on-surface transition-colors" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
              </div>

               {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="block font-label text-xs font-semibold text-outline uppercase tracking-wider" htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg">lock_reset</span>
                  </div>
                  <input 
                    className="w-full pl-11 pr-12 py-3 bg-surface-container-low border border-transparent focus:border-primary/10 focus:ring-2 focus:ring-primary/20 rounded-[10px] text-on-surface font-body text-sm transition-all placeholder:text-outline/50" 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    placeholder="************" 
                    required 
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Login Link */}
              <div className="flex justify-start text-sm">
                <span className="text-outline">Already have an account? </span>
                <Link className="ml-1 font-semibold text-primary hover:text-primary-container transition-colors" href="/login">
                  Login here
                </Link>
              </div>

              {/* Register Button */}
              <button 
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-primary to-primary-container px-5 py-3 font-headline text-sm font-bold text-white shadow-[0_16px_30px_rgba(37,99,235,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(37,99,235,0.26)] active:translate-y-0 group disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                ) : (
                  <>
                    <span className="tracking-[0.01em]">Create Account</span>
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 border-t border-outline-variant/10 pt-3 text-center">
               <p className="text-[11px] text-outline/80 font-body">
                 By creating an account, you agree to our 
                 <a className="underline hover:text-slate-900 transition-colors ml-1" href="#">Terms of Service</a> and 
                 <a className="underline hover:text-slate-900 transition-colors mx-1" href="#">Privacy Policy</a>.
               </p>
            </div>
            
          </div>
        </div>
      </div>
    </main>
  );
}

"use client";
import React, { useState } from "react";
import { useAuth } from "../../providers/AuthProvider";
import Link from "next/link";
import app from "../../lib/feathersClient";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
    } catch {
      setError("Invalid login credentials. Please verify your email and password.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const apiUrl = app.get("host") || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3032";
    window.location.href = `${String(apiUrl).replace(/\/$/, "")}/oauth/google`;
  };

  return (
    <main className="flex-grow flex items-center justify-center px-5 py-4 min-h-screen relative overflow-hidden bg-background">
      {/* Abstract Architectural Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>
      
      {/* Login Container */}
      <div className="w-full max-w-[1040px] grid lg:grid-cols-2 bg-surface-container-low rounded-[10px] overflow-hidden shadow-sm border border-outline-variant/10 relative z-10">
        
        {/* Left Side: Visual/Branding */}
        <div className="hidden lg:flex flex-col justify-between p-8 bg-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              alt="Modern architectural glass building reflecting blue sky" 
              className="w-full h-full object-cover" 
              data-alt="Modern architectural glass building reflecting a clear blue sky with sharp geometric lines and premium corporate aesthetic" 
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
              Elevate your hotel <br/>management experience.
            </h1>
            <p className="mt-1 text-white/60 font-body text-[13px] leading-6 max-w-[19rem]">
              Experience the Digital Atelier, where architectural precision meets intuitive CRM efficiency.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-3">
                <div className="w-9 h-9 rounded-full border-2 border-primary overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="Executive" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC73xCl-d517P5a10BuORR3NI7OtwHuuIxakkQzOHAgohfDnfwruuwRV0u12at8Xoj4e_soAjuZChh3qYG_RRyUPEyw7xLnydYm5N7u8w04ZBemFJxCYNCRTL8ZEMO5CPDka7CUOpmAOxlZIf4f0biSQ6aOf_uK-xrpbqxaFZdQ4HxJP-gZ4nOKbmL31pCzYxrls_jvqNH81rk7BUooyZ5AZhbd8lVy3bXc_v8ceV9r4YbJFK3dWcWocAnhDBdCi7GrRaAB9j_2gjiw"/>
                </div>
                <div className="w-9 h-9 rounded-full border-2 border-primary overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="Executive" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4moZ8LiP0iIL7SzWCxXOMBkfYXK2SgBSeyuveKSx2hLdF6NBB1cvU-2UcV3HqFsCpJ_QLy5F6zX_VpqiGhHDrrNy0FZRsSFmtzWabknZyctoMrZ_q9BLx4sth73j5ymSPJC9GCCP-Mm8N8wi31R_bNAI6pDvoUYrvM7AUIXkB9I10EE_wmAIBczdOtlWjVjnbTDNEBsg5rmaTwRGZlfmY4HvMPfVRchvv69Rkph5j1NZXtf-YrdkmdbvkWVpMio0EZJs_zTWVdqJa"/>
                </div>
                <div className="w-9 h-9 rounded-full border-2 border-primary overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="Executive" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEAvAg62uFUdpyuWtqjA4YOhUZVpcYy137SDTvGRFXw9Wlqh8E1pUckRtIA9U06YIAXqU8u4mvg8eKALZWG4vxmrqlaproJs37koPWrRsxFT03Pdjd1BY1ZM6QGaxKSXVt5oqbyLqwqA357vnQprET14np7-VKfIvJP3AxieYXskiYlS8cDsKloZEgp9vOJM33olPRvg1YYXJ4J4zD1_dRsCxndYT5O7Co0mnRDABxVxV33bL-8kBi9DKNdqfAnif3M3uSTrsU3H5l"/>
                </div>
              </div>
              <span className="text-white/60 text-[11px] font-medium">Joined by 500+ Luxury Estates</span>
            </div>
          </div>
          
          <div className="relative z-20 text-white/50 text-[10px] font-label uppercase tracking-[0.18em]">
            CRM for Hotel Client Management
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-4 md:p-6 lg:p-8 flex flex-col justify-center bg-surface-container-lowest">
          <div className="mb-3 lg:hidden">
            <span className="font-headline font-extrabold text-xl text-primary tracking-tight">The H Enterprises</span>
          </div>
          
          <div className="max-w-lg w-full mx-auto rounded-[20px] border border-outline-variant/10 bg-white/95 p-5 shadow-[0_20px_44px_rgba(15,23,42,0.08)] backdrop-blur-sm md:p-6">
            <div className="mb-4 border-b border-outline-variant/10 pb-3">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Welcome Back</h2>
              <p className="text-outline font-body text-sm">Please enter your credentials to access the CRM workspace.</p>
            </div>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 rounded-lg bg-error-container text-on-error-container font-medium text-sm flex gap-3 text-left">
                  <span className="material-symbols-outlined text-lg shrink-0">error</span>
                  {error}
                </div>
              )}

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
                <div className="flex justify-between items-center">
                  <label className="block font-label text-xs font-semibold text-outline uppercase tracking-wider" htmlFor="password">Password</label>
                  <a className="text-xs font-medium text-primary hover:text-primary-container transition-colors" href="#">Forgot password?</a>
                </div>
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

              {/* Role Input */}
              <div className="space-y-2">
                <label className="block font-label text-xs font-semibold text-outline uppercase tracking-wider" htmlFor="role">Role</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-lg">badge</span>
                  </div>
                  <input 
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-transparent rounded-[10px] text-on-surface font-body text-sm transition-all" 
                    id="role" 
                    name="role" 
                    readOnly 
                    type="text" 
                    value="Accounts Team"
                  />
                </div>
                <p className="text-xs text-outline/80">This login is currently configured for the accounts workspace only.</p>
              </div>

              {/* Register Link */}
              <div className="flex justify-start text-sm pb-1">
                <span className="text-outline">Don&apos;t have an account? </span>
                <Link className="ml-1 font-semibold text-primary hover:text-primary-container transition-colors" href="/register">
                  Sign up
                </Link>
              </div>

              {/* Login Button */}
              <button 
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-primary to-primary-container px-5 py-3 font-headline text-sm font-bold text-white shadow-[0_16px_30px_rgba(37,99,235,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(37,99,235,0.26)] active:translate-y-0 group disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                ) : (
                  <>
                    <span className="tracking-[0.01em]">Login</span>
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* SSR / External Auth */}
            <div className="mt-4 border-t border-outline-variant/10 pt-3">
              <p className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-outline/40">Other Sign-In Options</p>
              <div className="mt-2 grid grid-cols-2 gap-2 opacity-90">
                <button aria-label="Continue with Google" className="flex items-center justify-center gap-2 rounded-xl border border-outline-variant/10 bg-slate-50 px-3 py-2.5 text-slate-600 transition-all hover:bg-surface-container-low" type="button" onClick={handleGoogleLogin}>
                  <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.805 12.23c0-.68-.061-1.334-.174-1.961H12v3.708h5.498a4.704 4.704 0 0 1-2.04 3.086v2.563h3.305c1.936-1.783 3.042-4.409 3.042-7.396Z" fill="#4285F4"/><path d="M12 22c2.76 0 5.077-.915 6.763-2.475l-3.305-2.563c-.916.614-2.087.976-3.458.976-2.66 0-4.913-1.795-5.719-4.209H2.865v2.644A9.997 9.997 0 0 0 12 22Z" fill="#34A853"/><path d="M6.281 13.729A5.992 5.992 0 0 1 5.961 12c0-.6.103-1.183.32-1.729V7.627H2.865a9.997 9.997 0 0 0 0 8.746l3.416-2.644Z" fill="#FBBC05"/><path d="M12 6.063c1.5 0 2.847.516 3.907 1.529l2.929-2.929C17.072 3.022 14.755 2 12 2A9.997 9.997 0 0 0 2.865 7.627l3.416 2.644c.806-2.414 3.059-4.208 5.719-4.208Z" fill="#EA4335"/></svg>
                  <span className="text-xs font-medium text-slate-600">Google</span>
                </button>
                <button aria-label="Continue with Microsoft" className="flex items-center justify-center gap-2 rounded-xl border border-outline-variant/10 bg-slate-50 px-3 py-2.5 text-slate-600 transition-all hover:bg-surface-container-low" type="button">
                  <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="8" height="8" fill="#F25022"/><rect x="13" y="3" width="8" height="8" fill="#7FBA00"/><rect x="3" y="13" width="8" height="8" fill="#00A4EF"/><rect x="13" y="13" width="8" height="8" fill="#FFB900"/></svg>
                  <span className="text-xs font-medium text-slate-600">Microsoft</span>
                </button>
              </div>
            </div>
            
            <div className="mt-4 border-t border-outline-variant/10 pt-3 text-center">
              <p className="text-[11px] text-outline/80 font-body">
                &copy; 2024 The H Enterprises. All rights reserved. 
                <a className="underline hover:text-slate-900 transition-colors ml-2" href="#">Privacy Policy</a>
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </main>
  );
}

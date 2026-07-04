import React, { useState } from "react";
import { motion } from "motion/react";
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { api } from "../lib/api";

interface AuthScreenProps {
  onAuthSuccess: (user: any) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "reset" | "verify">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signupResult, setSignupResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Email address is required");
      return;
    }

    if (mode !== "forgot" && mode !== "verify" && !password) {
      setError("Password is required");
      return;
    }

    if ((mode === "reset" || mode === "verify") && !code) {
      setError("Verification security token is required");
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const res = await api.login(email, password);
        onAuthSuccess(res.user);
      } else if (mode === "signup") {
        if (password.length < 6) {
          throw new Error("Password security threshold not met: minimum 6 characters required");
        }
        const res = await api.signup(email, password);
        setSignupResult(res);
        setMessage(res.message || "Security code sent! Enter code 888888 to complete your onboarding protocol.");
        setMode("verify");
      } else if (mode === "forgot") {
        const res = await api.forgotPassword(email);
        setMessage(res.message);
        setMode("reset");
      } else if (mode === "reset") {
        const res = await api.resetPassword(email, code, password);
        setMessage(res.message || "Password successfully changed. You may now authenticate.");
        setMode("login");
        setPassword("");
        setCode("");
      } else if (mode === "verify") {
        await api.verifyEmail(email, code);
        setMessage("Email address verified successfully. Connection live!");
        if (signupResult && signupResult.user) {
          onAuthSuccess(signupResult.user);
        } else {
          setMode("login");
        }
      }
    } catch (err: any) {
      setError(err.message || "An authentication protocol error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // Standard professional simulation of Google OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1200));
      const targetEmail = email || "preanshurajpurohit123@gmail.com";
      const res = await api.googleLogin(targetEmail);
      onAuthSuccess(res.user);
    } catch (err: any) {
      setError("Google authentication mock failed to establish local session: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] flex items-center justify-center p-4" id="auth-canvas">
      {/* Background ambient radial gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,172,254,0.08)_0,transparent_65%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-[#00f2fe]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-[#4facfe]/5 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-[#0d111a]/80 backdrop-blur-md border border-[#1e293b] p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10"
        id="auth-card"
      >
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-[#4facfe] to-[#00f2fe] p-[1.5px] shadow-[0_0_20px_rgba(79,172,254,0.4)] mb-4">
            <div className="h-full w-full bg-[#07090e] rounded-[11px] flex items-center justify-center">
              <span className="font-display font-black text-lg text-transparent bg-clip-text bg-gradient-to-tr from-[#4facfe] to-[#00f2fe]">Æ</span>
            </div>
          </div>
          <h1 className="font-display font-bold text-xl tracking-wider text-white">
            AETHERIS WEALTH
          </h1>
          <p className="text-slate-400 font-mono text-[10px] uppercase mt-1 tracking-widest">
            Algorithmic Portfolio Management
          </p>
        </div>

        {/* Info or Success Alerts */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs font-mono flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-mono flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#07090e] border border-slate-800 focus:border-[#00f2fe] rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-all font-sans"
                required
              />
            </div>
          </div>

          {/* Verification Code Input */}
          {(mode === "reset" || mode === "verify") && (
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">
                Verification security token
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <Shield className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={mode === "verify" ? "Enter code 888888" : "Enter code 123456"}
                  className="w-full bg-[#07090e] border border-slate-800 focus:border-[#00f2fe] rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-all font-sans"
                  required
                />
              </div>
            </div>
          )}

          {mode !== "forgot" && mode !== "verify" && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  {mode === "reset" ? "New Password" : "Password"}
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setError(null);
                      setMessage(null);
                    }}
                    className="text-[10px] font-mono text-brand-cyan hover:underline hover:text-[#4facfe]"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#07090e] border border-slate-800 focus:border-[#00f2fe] rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-all font-sans"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 mt-2 rounded-lg bg-gradient-to-r from-[#4facfe] to-[#00f2fe] hover:opacity-95 text-xs font-mono font-bold tracking-wide text-black flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_20px_rgba(79,172,254,0.25)] cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : mode === "login" ? (
              <>
                <span>ACCESS WORKSPACE</span>
                <ArrowRight className="h-4 w-4" />
              </>
            ) : mode === "signup" ? (
              <>
                <span>ESTABLISH PROTOCOL</span>
                <Sparkles className="h-4 w-4" />
              </>
            ) : mode === "forgot" ? (
              <span>SEND RECOVERY TRANSCRIPT</span>
            ) : mode === "reset" ? (
              <span>CONFIRM CREDENTIAL RECONCILIATION</span>
            ) : (
              <span>VERIFY SECURITY CODE</span>
            )}
          </button>
        </form>

        {/* Google SSO Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative bg-[#0d111a] px-3 font-mono text-[9px] text-slate-500 uppercase tracking-widest">
            OR SINGLE SIGN-ON
          </span>
        </div>

        {/* Google SSO Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-10 bg-[#07090e] hover:bg-[#0c0e15] border border-slate-800 focus:border-slate-700 rounded-lg text-xs font-mono text-slate-300 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.415 0-6.183-2.768-6.183-6.183s2.768-6.183 6.183-6.183c1.545 0 2.955.564 4.055 1.5l2.91-2.91C18.91 2.227 15.827 1 12.24 1 6.03 1 1 6.03 1 12.24s5.03 11.24 11.24 11.24c6.48 0 10.745-4.564 10.745-10.91 0-.64-.064-1.218-.173-1.782H12.24z"
            />
          </svg>
          <span>CONTINUE WITH GOOGLE</span>
        </button>

        {/* Footer Toggle */}
        <div className="mt-8 text-center text-[11px] font-mono text-slate-500">
          {mode === "login" ? (
            <p>
              New wealth commander?{" "}
              <button
                onClick={() => {
                  setMode("signup");
                  setError(null);
                  setMessage(null);
                }}
                className="text-brand-cyan hover:underline hover:text-[#00f2fe]"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already established?{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setMessage(null);
                }}
                className="text-brand-cyan hover:underline hover:text-[#00f2fe]"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

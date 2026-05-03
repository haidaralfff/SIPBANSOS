import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  const [form, setForm] = useState({
    identifier: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const result = await login(form);
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.message || "Login gagal.");
      return;
    }
    navigate(from, { replace: true });
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, from, navigate]);

  return (
    <div className="min-h-screen bg-primary-orange flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-[1024px] bg-white rounded-[2rem] p-3 flex flex-col md:flex-row shadow-2xl overflow-hidden min-h-[600px]">
        
        {/* Left Side - Orange Panel */}
        <div className="w-full md:w-1/2 bg-primary-orange rounded-3xl p-8 relative overflow-hidden flex flex-col justify-center shrink-0 shadow-inner">
          
          {/* Glassmorphism Card Behind Image */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[80%] bg-white/10 border border-white/20 rounded-2xl backdrop-blur-sm z-0"></div>
          
          <div className="relative z-10 w-full h-full flex flex-col mt-4">
            <h1 className="text-white text-3xl lg:text-4xl font-bold leading-tight mb-8 text-left max-w-[85%] mx-auto w-full drop-shadow-md">
              Bantu Anda<br />
              Dalam Menentukan<br />
              Penerima Bansos
            </h1>
            
            <div className="flex-1 flex items-center justify-center w-full relative mt-4">
              {/* Notification bubble 1 */}
              <div className="absolute left-4 top-[10%] bg-white rounded-2xl p-2.5 shadow-lg animate-float-soft z-20">
                <svg className="w-7 h-7 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>

              {/* Notification bubble 2 */}
              <div className="absolute right-8 top-[40%] bg-white rounded-xl px-4 py-2 shadow-lg animate-float-soft z-20" style={{ animationDelay: "1s" }}>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                </div>
              </div>

              {/* Main SVG Image */}
              <img 
                src="/undraw_active-support_v6g0.svg" 
                alt="Support Illustration" 
                className="w-full max-w-[280px] object-contain drop-shadow-2xl z-10 relative"
              />
            </div>
          </div>
          
          {/* Decorative Pattern / Circles */}
          <div className="absolute bottom-0 left-0 w-full h-40 opacity-10 pointer-events-none z-0">
             {/* X shape */}
             <div className="absolute bottom-6 left-8 flex space-x-1">
               <div className="w-12 h-12 bg-white rounded-sm transform rotate-45"></div>
               <div className="w-12 h-12 bg-white rounded-sm transform rotate-45 -ml-8 mt-6"></div>
             </div>
             {/* Square with border */}
             <div className="absolute bottom-8 left-32 w-14 h-14 border-4 border-white rounded-md"></div>
             {/* Circle with border */}
             <div className="absolute bottom-10 left-56 w-14 h-14 border-4 border-white rounded-full"></div>
             {/* Large semi circle */}
             <div className="absolute -bottom-20 right-0 w-48 h-48 bg-white rounded-full opacity-30"></div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col relative bg-white">
          {/* Logos */}
          <div className="flex justify-end items-center w-full gap-4 mb-auto">
             <div className="flex items-center">
               <span className="text-xl font-bold text-primary-orange">SIP</span>
               <span className="text-xl font-bold text-text-primary">BANSOS</span>
             </div>
             <div className="h-8 w-px bg-border"></div>
             <div className="flex items-center">
               <div className="flex flex-col items-start justify-center">
                  <span className="text-[10px] font-bold text-accent-red leading-none flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
                    KEMENDESA
                  </span>
                  <span className="text-[7px] text-text-secondary leading-none mt-1">SISTEM INFORMASI<br/>BANTUAN SOSIAL</span>
               </div>
             </div>
          </div>

          <div className="w-full max-w-[320px] mx-auto mt-16 mb-auto">
            <h2 className="text-2xl font-bold text-text-primary mb-6">Masuk</h2>
            
            {error ? (
              <div className="mb-4 rounded-lg bg-accent-red/10 px-4 py-2.5 text-sm text-accent-red font-medium">
                {error}
              </div>
            ) : null}
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <input
                  name="identifier"
                  type="text"
                  value={form.identifier}
                  onChange={handleChange}
                  placeholder="Nomor Ponsel atau Email"
                  className="w-full rounded-md border border-border bg-white px-4 py-2.5 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary-orange focus:ring-1 focus:ring-primary-orange transition-all"
                />
              </div>
              
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Kata Sandi"
                  className="w-full rounded-md border border-border bg-white px-4 py-2.5 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary-orange focus:ring-1 focus:ring-primary-orange transition-all pr-10"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              
              <div className="text-left mt-1">
                 <a href="#" className="text-[12px] font-semibold text-primary-orange underline underline-offset-2 hover:text-orange-600">
                   Lupa kata sandi
                 </a>
              </div>
              
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-primary-orange py-2.5 text-sm font-bold tracking-wide text-white shadow-md hover:bg-orange-600 focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "MEMPROSES..." : "MASUK"}
                </button>
              </div>
            </form>
          </div>
          
          {/* Footer text */}
          <div className="text-center text-[11px] text-text-secondary mt-auto font-medium">
             © 2026 SIPBANSOS DESA. All Rights Reserved
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

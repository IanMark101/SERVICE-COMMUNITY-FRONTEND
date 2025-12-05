"use client";

import { useRouter } from "next/navigation";

export default function CommunitySplash() {
  const router = useRouter();

  const handleGetStarted = () => {
    // ✅ Redirect to user login/signup
    router.push("/auth/login");
  };

  const handleUserLogin = () => {
    router.push("/auth/login");
  };

  const handleAdminLogin = () => {
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#EAF6FF] flex items-center justify-center p-6 md:p-12 font-sans">
      
      {/* Main Container */}
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* LEFT COLUMN: Text Content */}
        <div className="flex flex-col items-start space-y-8">
          
          {/* Badge / Logo Group */}
          <div className="bg-white rounded-2xl shadow-sm py-3 px-6 inline-flex items-center gap-4 transform hover:-translate-y-1 transition duration-300">
            {/* Mock Figma/Group Logo using SVG */}
            <div className="w-6 h-9 relative">
               <svg viewBox="0 0 30 45" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle cx="7.5" cy="7.5" r="7.5" fill="#F24E1E"/>
                <circle cx="22.5" cy="7.5" r="7.5" fill="#FF7262"/>
                <circle cx="7.5" cy="22.5" r="7.5" fill="#A259FF"/>
                <circle cx="7.5" cy="37.5" r="7.5" fill="#1ABCFE"/>
                <path d="M22.5 22.5C26.6421 22.5 30 19.1421 30 15C30 10.8579 26.6421 7.5 22.5 7.5C22.5 15 22.5 22.5 22.5 22.5Z" fill="#1ABCFE"/> 
                <circle cx="22.5" cy="22.5" r="7.5" fill="#1ABCFE"/>
              </svg>
            </div>
            <span className="text-gray-900 font-black text-lg tracking-wide">GROUP 1</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-[5rem] leading-[1.1] font-black text-[#8FB8FF]">
            COMMUNITY SERVICE
            <br />
            CONNECTOR
          </h1>

          {/* Features List */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <CheckmarkIcon />
              <span className="text-xl md:text-2xl font-bold text-[#9DBBF0]">Finding opportunities</span>
            </div>
            <div className="flex items-center gap-4">
              <CheckmarkIcon />
              <span className="text-xl md:text-2xl font-bold text-[#9DBBF0]">Connecting people</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: The Card */}
        <div className="w-full max-w-[500px] mx-auto lg:ml-auto">
          {/* UPDATED HERE: 
              Added `transition-transform duration-300 hover:scale-[1.02]` 
              to the main card container.
          */}
          <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border-4 border-white transition-transform duration-300 hover:scale-[1.02] cursor-pointer">
            
            {/* Image Area Container */}
            <div className="relative h-72 md:h-80 bg-[#FFF8E1] w-full flex items-center justify-center overflow-hidden">
              {/* UPDATED HERE: 
                  Removed `hover:scale-105 transition duration-700` from the img tag 
              */}
              <img 
                src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=80&w=2070&auto=format&fit=crop" 
                alt="Community thriving illustration" 
                className="object-cover w-full h-full opacity-90"
              />
              
              {/* Floating Banner overlay */}
              <div className="absolute top-6 w-full flex justify-center">
                <div className="bg-[#D9A066] text-[#5E3918] font-bold px-6 py-1 rounded-sm shadow-lg transform -rotate-2 text-sm tracking-widest">
                  TOGETHER WE THRIVE
                </div>
              </div>
            </div>

            {/* Card Content Area */}
            <div className="bg-[#D6E6F8] p-8 text-center flex flex-col items-center gap-6">
              <p className="text-[#5A7196] text-lg md:text-xl font-bold leading-relaxed max-w-xs">
                Linking people who need help with those ready to offer their skills.
              </p>

              <div className="flex gap-4 w-full justify-center">
                <button 
                  onClick={handleUserLogin}
                  className="bg-[#448AFF] hover:bg-[#3b7ceb] text-white text-sm font-bold py-3 px-8 rounded shadow-[0_4px_14px_0_rgba(68,138,255,0.39)] transition-all duration-200 active:scale-95 uppercase tracking-wider"
                >
                  User Login
                </button>
                <button 
                  onClick={handleAdminLogin}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-3 px-8 rounded shadow-[0_4px_14px_0_rgba(102,51,153,0.39)] transition-all duration-200 active:scale-95 uppercase tracking-wider"
                >
                  Admin Login
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

// Helper Component for the Checkmark
function CheckmarkIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M5 13L9 17L19 7" 
        stroke="#9DBBF0" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}
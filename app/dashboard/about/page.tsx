"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/app/dashboard/components/DashboardHeader";
import DashboardModals from "@/app/dashboard/components/DashboardModals";
import api from "@/services/api";
import { useDarkMode } from "@/app/context/DarkModeContext";

export default function About() {
  const router = useRouter();
  const { isDark } = useDarkMode();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-b from-[#e8ecf7] via-[#f0f1f7] to-[#ebe8f5]'}`}>
      {/* ✅ HEADER */}
      <DashboardHeader 
        onSettingsClick={() => setShowSettingsModal(true)}
        currentPage="about"
      />

      {/* ✅ MODALS */}
      <DashboardModals
        showSettingsModal={showSettingsModal}
        setShowSettingsModal={setShowSettingsModal}
        showChangePasswordModal={showChangePasswordModal}
        setShowChangePasswordModal={setShowChangePasswordModal}
        showEditProfileModal={showEditProfileModal}
        setShowEditProfileModal={setShowEditProfileModal}
        onLogout={handleLogout}
      />

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className={`text-center space-y-6 p-12 rounded-3xl border backdrop-blur-sm ${isDark ? 'bg-slate-800/50 border-sky-500/25' : 'bg-gradient-to-r from-[#6FA3EF]/15 to-[#5AC8FA]/15 border-[#6FA3EF]/25'}`}>
          <h1 className="text-5xl font-black bg-gradient-to-r from-[#6FA3EF] to-[#007AFF] bg-clip-text text-transparent">About Skill-Link</h1>
          <p className={`text-xl max-w-2xl mx-auto font-semibold ${isDark ? 'text-slate-300' : 'text-[#3d3f56]'}`}>
            Connecting talented people who share skills, knowledge, and opportunities with their communities.
          </p>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className={`py-16 ${isDark ? 'bg-gradient-to-b from-slate-900 to-slate-950' : 'bg-gradient-to-b from-[#e8ecf7] to-[#ebe8f5]'}`}>
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          <div className={`space-y-4 p-8 rounded-2xl border shadow-lg hover:shadow-xl transition-shadow ${isDark ? 'bg-slate-800 border-sky-500/25' : 'bg-gradient-to-br from-[#f8f9fc] to-[#eef0f8] border-[#6FA3EF]/25'}`}>
            <h2 className="text-3xl font-black bg-gradient-to-r from-[#6FA3EF] to-[#5C90DD] bg-clip-text text-transparent">Our Mission</h2>
            <p className={`leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-[#3d3f56]'}`}>
              We believe everyone has valuable skills to share. Skill-Link makes it easy to connect with others, exchange expertise, and build trust within your community.
            </p>
            <ul className={`space-y-2 font-medium ${isDark ? 'text-slate-300' : 'text-[#3d3f56]'}`}>
              <li className="text-[#6FA3EF]">✓ Connect talented individuals</li>
              <li className="text-[#6FA3EF]">✓ Enable peer-to-peer skill exchange</li>
              <li className="text-[#6FA3EF]">✓ Foster supportive communities</li>
            </ul>
          </div>

          <div className={`space-y-4 p-8 rounded-2xl border shadow-lg hover:shadow-xl transition-shadow ${isDark ? 'bg-slate-800 border-sky-500/25' : 'bg-gradient-to-br from-[#f8f9fc] to-[#eef0f8] border-[#5AC8FA]/25'}`}>
            <h2 className="text-3xl font-black bg-gradient-to-r from-[#5AC8FA] to-[#007AFF] bg-clip-text text-transparent">Our Vision</h2>
            <p className={`leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-[#3d3f56]'}`}>
              A world where everyone can access the skills they need and share their own expertise without boundaries. Economic limitations shouldn't prevent opportunities.
            </p>
            <ul className={`space-y-2 font-medium ${isDark ? 'text-slate-300' : 'text-[#3d3f56]'}`}>
              <li className="text-[#5AC8FA]">✓ Global skill marketplace</li>
              <li className="text-[#5AC8FA]">✓ Empowered communities</li>
              <li className="text-[#5AC8FA]">✓ Unlimited growth for all</li>
            </ul>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black bg-gradient-to-r from-[#6FA3EF] to-[#007AFF] bg-clip-text text-transparent mb-12 text-center">How It Works</h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { num: "1", title: "Create Profile", desc: "Sign up and show your skills" },
            { num: "2", title: "Post Services", desc: "Share what you offer or need" },
            { num: "3", title: "Find Matches", desc: "Connect with the right people" },
            { num: "4", title: "Collaborate", desc: "Exchange and grow together" },
          ].map((item, idx) => (
            <div key={idx} className={`text-center space-y-3 p-6 rounded-2xl border shadow-lg hover:shadow-xl transition-shadow ${isDark ? 'bg-slate-800 border-sky-500/25' : 'bg-gradient-to-br from-[#f8f9fc] to-[#eef0f8] border-[#6FA3EF]/25'}`}>
              <div className="w-12 h-12 bg-gradient-to-r from-[#6FA3EF] to-[#007AFF] text-white rounded-full flex items-center justify-center font-black text-xl mx-auto shadow-lg">
                {item.num}
              </div>
              <h3 className={`font-black text-lg ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>{item.title}</h3>
              <p className="text-[#7CA0D8] text-sm font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY JOIN */}
      <section className={`py-16 ${isDark ? 'bg-gradient-to-b from-slate-950 to-slate-900' : 'bg-gradient-to-b from-[#ebe8f5] to-[#e8ecf7]'}`}>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-black bg-gradient-to-r from-[#6FA3EF] to-[#007AFF] bg-clip-text text-transparent mb-12 text-center">Why Join Skill-Link?</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className={`p-6 rounded-lg border shadow-lg hover:shadow-xl transition-shadow ${isDark ? 'bg-slate-800 border-sky-500/25' : 'bg-gradient-to-br from-[#f8f9fc] to-[#eef0f8] border-[#6FA3EF]/25'}`}>
              <div className="text-4xl mb-3">💼</div>
              <h3 className={`font-black mb-2 ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>Diverse Skills</h3>
              <p className={`font-medium ${isDark ? 'text-slate-300' : 'text-[#7CA0D8]'}`}>Connect with professionals across every field and find exactly what you need.</p>
            </div>

            <div className={`p-6 rounded-lg border shadow-lg hover:shadow-xl transition-shadow ${isDark ? 'bg-slate-800 border-sky-500/25' : 'bg-gradient-to-br from-[#f8f9fc] to-[#eef0f8] border-[#5AC8FA]/25'}`}>
              <div className="text-4xl mb-3">⭐</div>
              <h3 className={`font-black mb-2 ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>Verified Reviews</h3>
              <p className={`font-medium ${isDark ? 'text-slate-300' : 'text-[#7CA0D8]'}`}>Make informed decisions with transparent ratings from the community.</p>
            </div>

            <div className={`p-6 rounded-lg border shadow-lg hover:shadow-xl transition-shadow ${isDark ? 'bg-slate-800 border-sky-500/25' : 'bg-gradient-to-br from-[#f8f9fc] to-[#eef0f8] border-[#6FA3EF]/25'}`}>
              <div className="text-4xl mb-3">🔐</div>
              <h3 className={`font-black mb-2 ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>Secure Transactions</h3>
              <p className={`font-medium ${isDark ? 'text-slate-300' : 'text-[#7CA0D8]'}`}>All exchanges are protected with advanced security measures.</p>
            </div>

            <div className={`p-6 rounded-lg border shadow-lg hover:shadow-xl transition-shadow ${isDark ? 'bg-slate-800 border-sky-500/25' : 'bg-gradient-to-br from-[#f8f9fc] to-[#eef0f8] border-[#5AC8FA]/25'}`}>
              <div className="text-4xl mb-3">🎓</div>
              <h3 className={`font-black mb-2 ${isDark ? 'text-slate-100' : 'text-[#3d3f56]'}`}>Continuous Learning</h3>
              <p className={`font-medium ${isDark ? 'text-slate-300' : 'text-[#7CA0D8]'}`}>Expand your knowledge by learning from experts in your field.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={`py-16 shadow-xl ${isDark ? 'bg-gradient-to-r from-slate-800 to-slate-900' : 'bg-gradient-to-r from-[#6FA3EF] via-[#5C90DD] to-[#007AFF]'}`}>
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className={`text-4xl font-black ${isDark ? 'text-slate-100' : 'text-white'}`}>Ready to Get Started?</h2>
          <p className={`text-lg font-semibold ${isDark ? 'text-slate-300' : 'text-blue-100'}`}>Join our community and start sharing your skills today.</p>
          <Link href="/dashboard" className={`inline-block px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 ${
            isDark
              ? 'bg-sky-500 text-slate-900 hover:bg-sky-400 hover:shadow-xl'
              : 'bg-white text-[#6FA3EF] hover:bg-gray-50 hover:shadow-xl'
          }`}>
            Go to Dashboard
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`text-white py-8 ${isDark ? 'bg-gradient-to-r from-slate-950 to-slate-900' : 'bg-gradient-to-r from-[#3d3f56] to-[#2a2d3f]'}`}>
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-300">
          &copy; 2024 Skill-Link. Connecting skills, building communities.
        </div>
      </footer>
    </div>
  );
}
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/app/dashboard/components/DashboardHeader";
import DashboardModals from "@/app/dashboard/components/DashboardModals";
import api from "@/services/api";

export default function About() {
  const router = useRouter();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-white">
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
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-black text-[#1a2a4a]">About Skill-Link</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connecting talented people who share skills, knowledge, and opportunities with their communities.
          </p>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-[#1a2a4a]">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              We believe everyone has valuable skills to share. Skill-Link makes it easy to connect with others, exchange expertise, and build trust within your community.
            </p>
            <ul className="space-y-2 text-gray-700 font-medium">
              <li>✓ Connect talented individuals</li>
              <li>✓ Enable peer-to-peer skill exchange</li>
              <li>✓ Foster supportive communities</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-black text-[#1a2a4a]">Our Vision</h2>
            <p className="text-gray-700 leading-relaxed">
              A world where everyone can access the skills they need and share their own expertise without boundaries. Economic limitations shouldn't prevent opportunities.
            </p>
            <ul className="space-y-2 text-gray-700 font-medium">
              <li>✓ Global skill marketplace</li>
              <li>✓ Empowered communities</li>
              <li>✓ Unlimited growth for all</li>
            </ul>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black text-[#1a2a4a] mb-12 text-center">How It Works</h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { num: "1", title: "Create Profile", desc: "Sign up and show your skills" },
            { num: "2", title: "Post Services", desc: "Share what you offer or need" },
            { num: "3", title: "Find Matches", desc: "Connect with the right people" },
            { num: "4", title: "Collaborate", desc: "Exchange and grow together" },
          ].map((item, idx) => (
            <div key={idx} className="text-center space-y-3">
              <div className="w-12 h-12 bg-[#007AFF] text-white rounded-full flex items-center justify-center font-black text-xl mx-auto">
                {item.num}
              </div>
              <h3 className="font-black text-[#1a2a4a] text-lg">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY JOIN */}
      <section className="bg-blue-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-black text-[#1a2a4a] mb-12 text-center">Why Join Skill-Link?</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-4xl mb-3">💼</div>
              <h3 className="font-black text-[#1a2a4a] mb-2">Diverse Skills</h3>
              <p className="text-gray-600">Connect with professionals across every field and find exactly what you need.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="font-black text-[#1a2a4a] mb-2">Verified Reviews</h3>
              <p className="text-gray-600">Make informed decisions with transparent ratings from the community.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-4xl mb-3">🔐</div>
              <h3 className="font-black text-[#1a2a4a] mb-2">Secure Transactions</h3>
              <p className="text-gray-600">All exchanges are protected with advanced security measures.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="font-black text-[#1a2a4a] mb-2">Continuous Learning</h3>
              <p className="text-gray-600">Expand your knowledge by learning from experts in your field.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#007AFF] py-16">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-4xl font-black text-white">Ready to Get Started?</h2>
          <p className="text-blue-100 text-lg">Join our community and start sharing your skills today.</p>
          <Link href="/dashboard" className="inline-block bg-white text-[#007AFF] px-6 py-3 rounded-lg font-black hover:bg-gray-100">
            Go to Dashboard
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1a2a4a] text-white py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-300">
          &copy; 2024 Skill-Link. Connecting skills, building communities.
        </div>
      </footer>
    </div>
  );
}
import React, { useState } from "react";
import { Search, Ban, CheckCircle, User, MoreHorizontal, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

export default function UserTable({ users, isLoading, toggleBanUser }: any) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  
  // --- Pagination Configuration ---
  const itemsPerPage = 5; 
  const allUsers = users || [];

  // 1. Filtering Logic
  const filteredUsers = allUsers.filter((user: any) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Pagination Calculation
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // 3. Handlers
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  // Display range for footer
  const startRange = filteredUsers.length > 0 ? indexOfFirstItem + 1 : 0;
  const endRange = Math.min(indexOfLastItem, filteredUsers.length);


  return (
    <div className="p-6 sm:p-12 bg-transparent min-h-0 flex justify-center font-sans text-slate-100">
      <div className="w-full max-w-6xl">
        {/* Main Card Container */}
        <div className="bg-slate-900/80 rounded-3xl shadow-2xl shadow-black/40 border border-slate-800/80 overflow-hidden backdrop-blur-xl">
          {/* Header Section with Gradient & Blur */}
          <div className="relative p-10 border-b border-slate-800/80 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-slate-950/80">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Title Area */}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2.5 bg-gradient-to-br from-cyan-500 via-sky-500 to-indigo-500 rounded-xl shadow-lg shadow-sky-600/40 text-white border border-white/20 backdrop-blur-sm">
                    <User size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="font-extrabold text-slate-50 text-3xl tracking-tight">User Management</h3>
                </div>
                <p className="text-slate-400 font-medium ml-1 text-lg">Overview of all registered members ({allUsers.length} total)</p>
              </div>

              {/* Action Area */}
              <div className="flex gap-3">
                <div className="relative group w-full md:w-72">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400 group-focus-within:text-sky-300 transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1); // Reset to page 1 on new search
                    }}
                    placeholder="Search by name or email..." 
                    className="block w-full pl-10 pr-4 py-4 text-base font-medium text-slate-100 bg-slate-900/70 border border-slate-700 rounded-xl focus:ring-4 focus:ring-sky-500/40 focus:border-sky-400 focus:bg-slate-900/90 transition-all placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table Area */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800/80">
                  <th className="px-10 py-7 text-sm font-bold text-slate-300 uppercase tracking-wider hover:text-sky-300 cursor-pointer transition-colors group">
                    <div className="flex items-center gap-2">
                      User Profile
                      <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </th>
                  <th className="px-10 py-7 text-sm font-bold text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-10 py-7 text-sm font-bold text-slate-300 uppercase tracking-wider text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                {isLoading ? (
                  // Skeleton Loading State (shows 5 items for the page limit)
                  [...Array(itemsPerPage)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-slate-800"></div>
                          <div className="space-y-2">
                            <div className="h-5 w-32 bg-slate-800 rounded"></div>
                            <div className="h-4 w-24 bg-slate-800 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="h-7 w-20 bg-slate-800 rounded-full"></div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="h-10 w-24 bg-slate-800 rounded-lg ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : currentUsers.length > 0 ? (
                  currentUsers.map((user: any) => (
                    <tr 
                      key={user.id} 
                      className="group transition-all duration-300 hover:bg-slate-800/70 hover:shadow-lg hover:shadow-sky-500/10 hover:-translate-y-0.5 relative border-l-4 border-l-transparent hover:border-l-sky-400"
                    >
                      {/* User Info */}
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-5">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 via-sky-500 to-indigo-600 flex items-center justify-center text-lg font-bold text-white shadow-md shadow-sky-500/30 ring-4 ring-slate-900">
                              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                            </div>
                            {/* Online Dot */}
                            {!user.banned && (
                              <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-900 shadow-lg shadow-emerald-400/50"></span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-100 group-hover:text-sky-300 transition-colors text-base">
                              {user.name || "Unknown User"}
                            </p>
                            <p className="text-slate-400 text-sm mt-1 font-medium tracking-wide">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-10 py-8">
                        <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full text-sm font-bold border shadow-sm backdrop-blur-sm ${
                          user.banned 
                            ? 'bg-red-500/15 text-red-100 border-red-500/40 shadow-red-500/20' 
                            : 'bg-emerald-500/15 text-emerald-100 border-emerald-500/40 shadow-emerald-500/20'
                        }`}>
                          <span className={`relative flex h-2 w-2`}>
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${user.banned ? 'bg-red-500' : 'bg-emerald-400'}`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${user.banned ? 'bg-red-400' : 'bg-emerald-300'}`}></span>
                          </span>
                          {user.banned ? 'Suspended' : 'Active Now'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {/* Secondary Action (Mock) */}
                          <button className="p-3 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 rounded-lg transition-all">
                            <MoreHorizontal size={20} />
                          </button>

                          {/* Primary Action */}
                          <button 
                            onClick={() => toggleBanUser(user.id, user.banned)}
                            className={`
                              flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 border backdrop-blur-sm
                              ${user.banned 
                                ? 'bg-emerald-500/20 text-emerald-100 border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-500/25 shadow-emerald-500/20' 
                                : 'bg-red-500/20 text-red-100 border-red-500/40 hover:border-red-400 hover:bg-red-500/25 shadow-red-500/20'
                              }
                            `}
                          >
                            {user.banned ? <CheckCircle size={14} /> : <Ban size={14} />}
                            {user.banned ? "Restore Access" : "Revoke Access"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  // Empty State / No Results
                  <tr>
                    <td colSpan={3} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner shadow-black/20">
                          <Search className="text-slate-500 w-10 h-10" />
                        </div>
                        <h3 className="text-slate-100 font-semibold text-2xl">No users found</h3>
                        <p className="text-slate-400 max-w-xs mx-auto mt-2 text-base">
                          {searchTerm ? `No results found for "${searchTerm}".` : "There are no users to display."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer / Pagination Controls */}
            <div className="bg-slate-900/70 border-t border-slate-800/80 p-6 px-10 flex items-center justify-between text-sm font-medium text-slate-300">
             <span className="text-base text-slate-200">
                Showing <span className="font-semibold text-sky-300">{startRange}</span> to <span className="font-semibold text-sky-300">{endRange}</span> of <span className="font-semibold text-sky-300">{filteredUsers.length}</span> results
             </span>
             
             <div className="flex gap-3">
                <button 
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1 || filteredUsers.length === 0}
                className="px-4 py-2.5 border border-slate-700 rounded-lg bg-slate-800/60 text-slate-200 hover:bg-slate-700 hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-semibold"
                >
                    <ChevronLeft size={16} /> Previous
                </button>
                
                {/* Page Number Indicator */}
              <div className="px-4 py-2.5 border border-sky-500/40 rounded-lg bg-sky-500/20 text-sky-200 font-bold text-base flex items-center justify-center shadow-lg shadow-sky-500/20">
                    {currentPage}
                </div>

                <button 
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || filteredUsers.length === 0}
                className="px-4 py-2.5 border border-slate-700 rounded-lg bg-slate-800/60 text-slate-200 hover:bg-slate-700 hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-semibold"
                >
                    Next <ChevronRight size={16} />
                </button>
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
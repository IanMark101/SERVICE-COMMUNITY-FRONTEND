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
    <div className="p-4 sm:p-10 bg-slate-50/50 min-h-screen flex justify-center font-sans">
      <div className="w-full max-w-6xl">
        
        {/* Main Card Container */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          
          {/* Header Section with Gradient & Blur */}
          <div className="relative p-8 border-b border-slate-100 bg-gradient-to-r from-white via-slate-50/30 to-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Title Area */}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20 text-white">
                    <User size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-2xl tracking-tight">User Management</h3>
                </div>
                <p className="text-slate-500 font-medium ml-1">Overview of all registered members ({allUsers.length} total)</p>
              </div>

              {/* Action Area */}
              <div className="flex gap-3">
                <div className="relative group w-full md:w-72">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1); // Reset to page 1 on new search
                    }}
                    placeholder="Search by name or email..." 
                    className="block w-full pl-10 pr-4 py-3 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table Area */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 cursor-pointer transition-colors group">
                    <div className="flex items-center gap-2">
                      User Profile
                      <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {isLoading ? (
                  // Skeleton Loading State (shows 5 items for the page limit)
                  [...Array(itemsPerPage)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-full bg-slate-100"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-slate-100 rounded"></div>
                            <div className="h-3 w-24 bg-slate-100 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="h-6 w-16 bg-slate-100 rounded-full"></div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="h-8 w-20 bg-slate-100 rounded-lg ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : currentUsers.length > 0 ? (
                  currentUsers.map((user: any) => (
                    <tr 
                      key={user.id} 
                      className="group transition-all duration-300 hover:bg-slate-50/50 hover:shadow-lg hover:shadow-slate-100 hover:-translate-y-0.5 relative"
                    >
                      {/* Left Accent Border on Hover */}
                      <td className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-r"></td>

                      {/* User Info */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-md shadow-blue-500/20 ring-4 ring-white">
                              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                            </div>
                            {/* Online Dot */}
                            {!user.banned && (
                              <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white"></span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors text-sm">
                              {user.name || "Unknown User"}
                            </p>
                            <p className="text-slate-400 text-xs mt-0.5 font-medium tracking-wide">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-8 py-5">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${
                          user.banned 
                            ? 'bg-red-50 text-red-600 border-red-100 shadow-red-100/50' 
                            : 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50'
                        }`}>
                          <span className={`relative flex h-2 w-2`}>
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${user.banned ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${user.banned ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                          </span>
                          {user.banned ? 'Suspended' : 'Active Now'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {/* Secondary Action (Mock) */}
                          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <MoreHorizontal size={18} />
                          </button>

                          {/* Primary Action */}
                          <button 
                            onClick={() => toggleBanUser(user.id, user.banned)}
                            className={`
                              flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95
                              ${user.banned 
                                ? 'bg-white text-emerald-600 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50' 
                                : 'bg-white text-red-600 border border-slate-200 hover:border-red-500 hover:bg-red-50'
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
                    <td colSpan={3} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                          <Search className="text-slate-300 w-8 h-8" />
                        </div>
                        <h3 className="text-slate-800 font-semibold text-lg">No users found</h3>
                        <p className="text-slate-400 max-w-xs mx-auto mt-1">
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
          <div className="bg-white border-t border-slate-100 p-4 px-8 flex items-center justify-between text-xs font-medium text-slate-500">
             <span className="text-sm text-slate-600">
                Showing <span className="font-semibold">{startRange}</span> to <span className="font-semibold">{endRange}</span> of <span className="font-semibold">{filteredUsers.length}</span> results
             </span>
             
             <div className="flex gap-2">
                <button 
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1 || filteredUsers.length === 0}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                    <ChevronLeft size={16} /> Previous
                </button>
                
                {/* Page Number Indicator */}
                <div className="px-3 py-1.5 border border-blue-500 rounded-lg bg-blue-50 text-blue-600 font-bold text-sm flex items-center justify-center">
                    {currentPage}
                </div>

                <button 
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || filteredUsers.length === 0}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
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
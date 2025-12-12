"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastData {
  id: number;
  message: string;
  type: ToastType;
  isLeaving: boolean;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, isLeaving: false }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isLeaving: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isLeaving: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const styles = {
    success: {
      bg: "bg-gradient-to-r from-emerald-500 to-teal-500",
      icon: <CheckCircle className="w-6 h-6" />,
      shadow: "shadow-emerald-500/25",
    },
    error: {
      bg: "bg-gradient-to-r from-red-500 to-rose-500",
      icon: <XCircle className="w-6 h-6" />,
      shadow: "shadow-red-500/25",
    },
    warning: {
      bg: "bg-gradient-to-r from-amber-500 to-orange-500",
      icon: <AlertTriangle className="w-6 h-6" />,
      shadow: "shadow-amber-500/25",
    },
    info: {
      bg: "bg-gradient-to-r from-blue-500 to-sky-500",
      icon: <Info className="w-6 h-6" />,
      shadow: "shadow-blue-500/25",
    },
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast, index) => {
          const currentStyle = styles[toast.type];
          return (
            <div
              key={toast.id}
              className={`
                pointer-events-auto
                ${currentStyle.bg} 
                text-white 
                px-5 py-4 
                rounded-2xl 
                shadow-2xl 
                ${currentStyle.shadow}
                flex items-center gap-4
                min-w-[300px] max-w-[450px]
                transform transition-all duration-300 ease-out
                ${toast.isLeaving 
                  ? "opacity-0 -translate-y-2 scale-95" 
                  : "opacity-100 translate-y-0 scale-100"
                }
              `}
              style={{
                animation: toast.isLeaving ? "" : "toastSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <div className="flex-shrink-0 bg-white/20 p-2 rounded-full">
                {currentStyle.icon}
              </div>
              <p className="flex-1 font-bold text-sm leading-tight">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 hover:bg-white/20 p-1.5 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @keyframes toastSlideIn {
          0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback to alert if used outside provider
    return {
      showToast: (message: string, type?: ToastType) => {
        alert(message);
      },
    };
  }
  return context;
}

// Global toast function for use outside React components
let globalShowToast: ((message: string, type?: ToastType) => void) | null = null;

export function setGlobalToast(fn: (message: string, type?: ToastType) => void) {
  globalShowToast = fn;
}

export function toast(message: string, type: ToastType = "success") {
  if (globalShowToast) {
    globalShowToast(message, type);
  } else {
    alert(message);
  }
}

export function ToastInitializer() {
  const { showToast } = useToast();
  
  // Set global reference on mount
  if (typeof window !== "undefined") {
    setGlobalToast(showToast);
  }
  
  return null;
}

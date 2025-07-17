import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCheck, FiX, FiAlertCircle, FiInfo } = FiIcons;

let toastId = 0;
const toastCallbacks = [];

export const toast = {
  success: (message) => showToast(message, 'success'),
  error: (message) => showToast(message, 'error'),
  warning: (message) => showToast(message, 'warning'),
  info: (message) => showToast(message, 'info'),
};

const showToast = (message, type) => {
  const id = ++toastId;
  toastCallbacks.forEach(callback => callback({ id, message, type }));
  
  setTimeout(() => {
    toastCallbacks.forEach(callback => callback({ id, remove: true }));
  }, 4000);
};

export const Toaster = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const callback = (toast) => {
      if (toast.remove) {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      } else {
        setToasts(prev => [...prev, toast]);
      }
    };

    toastCallbacks.push(callback);
    return () => {
      const index = toastCallbacks.indexOf(callback);
      if (index > -1) toastCallbacks.splice(index, 1);
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return FiCheck;
      case 'error': return FiX;
      case 'warning': return FiAlertCircle;
      case 'info': return FiInfo;
      default: return FiInfo;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'success': return 'bg-green-500 text-white';
      case 'error': return 'bg-red-500 text-white';
      case 'warning': return 'bg-yellow-500 text-white';
      case 'info': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${getColors(toast.type)} min-w-80`}
          >
            <SafeIcon icon={getIcon(toast.type)} className="w-5 h-5" />
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="hover:opacity-70 transition-opacity"
            >
              <SafeIcon icon={FiX} className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
import React from 'react';
import { motion } from 'framer-motion';

export const LoadingSpinner = ({ message = "Loading...", size = "medium" }) => {
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-8 h-8", 
    large: "w-12 h-12",
    xlarge: "w-16 h-16"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center space-y-4"
    >
      {/* Enhanced Spinner */}
      <div className="relative">
        <div className={`${sizeClasses[size]} loading-spinner`}></div>
        
        {/* Pulsing ring effect */}
        <motion.div
          className={`absolute inset-0 ${sizeClasses[size]} border-2 border-blue-200 rounded-full`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Additional pulsing rings */}
        <motion.div
          className={`absolute inset-0 ${sizeClasses[size]} border-2 border-purple-200 rounded-full`}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
      </div>
      
      {/* Loading message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <p className="text-gray-600 font-medium">{message}</p>
          <div className="flex justify-center mt-2 space-x-1">
            <motion.div
              className="w-2 h-2 bg-blue-500 rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-2 h-2 bg-purple-500 rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Full screen loading overlay
export const LoadingOverlay = ({ message = "Loading...", show = true }) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-white/20">
        <LoadingSpinner message={message} size="large" />
      </div>
    </motion.div>
  );
};

// Inline loading spinner for buttons and small areas
export const InlineSpinner = ({ size = "small" }) => {
  return (
    <div className="inline-flex items-center justify-center">
      <div className={`${size === "small" ? "w-4 h-4" : "w-5 h-5"} loading-spinner`}></div>
    </div>
  );
};

// Page loading spinner
export const PageSpinner = ({ message = "Loading page..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="text-center">
        <LoadingSpinner message={message} size="xlarge" />
      </div>
    </div>
  );
};

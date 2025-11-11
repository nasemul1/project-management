import React from 'react';

function Drawer({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-40"
        onClick={onClose}
        aria-label="Close drawer"
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}

export default Drawer;
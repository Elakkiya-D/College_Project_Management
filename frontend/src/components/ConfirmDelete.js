import React from 'react';

const ConfirmDelete = ({ open, setOpen, onConfirm, title, message }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">{title || "Are you sure?"}</h3>
                    <p className="text-sm font-medium text-gray-500 leading-relaxed">
                        {message || "This action cannot be undone. All associated records will be permanently removed from the system."}
                    </p>
                </div>
                <div className="flex bg-gray-50 border-t border-gray-100 divide-x divide-gray-100">
                    <button
                        onClick={() => setOpen(false)}
                        className="flex-1 py-4 text-sm font-bold text-gray-400 hover:text-gray-600 hover:bg-white transition-all uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            setOpen(false);
                        }}
                        className="flex-1 py-4 text-sm font-bold text-red-600 hover:bg-white transition-all uppercase tracking-widest"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDelete;

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-[#0A0F1C]/50">
      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
        Page {currentPage} of {totalPages || 1}
      </p>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage <= 1}
          className="p-2 bg-[#0E1525] border border-white/10 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage >= totalPages}
          className="p-2 bg-[#0E1525] border border-white/10 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

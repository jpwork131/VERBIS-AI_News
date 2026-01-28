import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

const Pagination = ({ page, totalPages, onPageChange }) => {
  const getPages = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);

    if (page <= 3) {
      start = 1;
      end = Math.min(totalPages, maxVisible);
    }

    if (page >= totalPages - 2) {
      start = Math.max(1, totalPages - maxVisible + 1);
      end = totalPages;
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  if (totalPages <= 1) return null;

  // Refined Editorial Style Class
  const baseBtnClass = `
    h-12 flex items-center justify-center transition-all duration-300
    border-t border-b border-l last:border-r border-slate-200
    font-medium text-xs tracking-[0.15em] uppercase
    disabled:opacity-20 disabled:cursor-not-allowed
  `;

  const formatNum = (n) => (n < 10 ? `0${n}` : n);

  return (
    <div className="mt-24 mb-16 flex flex-col items-center gap-6">
      {/* Decorative Label */}
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
        Index Selection
      </span>

      <div className="flex items-center">
        {/* PREV BUTTON */}
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className={`${baseBtnClass} px-6 bg-transparent hover:bg-slate-50 text-slate-900`}
        >
          <ChevronLeft size={14} className="mr-2" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* FIRST PAGE & ELLIPSIS */}
        {page > 3 && (
          <div className="flex">
            <button
              onClick={() => onPageChange(1)}
              className={`${baseBtnClass} w-12 bg-transparent hover:text-blue-600`}
            >
              01
            </button>
            <div className={`${baseBtnClass} w-12 text-slate-300`}>
              <MoreHorizontal size={14} />
            </div>
          </div>
        )}

        {/* PAGE NUMBERS */}
        <div className="flex">
          {getPages().map((p) => {
            const isActive = p === page;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`
                  ${baseBtnClass} w-12 relative overflow-hidden
                  ${isActive 
                    ? "text-white bg-slate-900 border-slate-900" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }
                `}
              >
                {formatNum(p)}
                {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* LAST PAGE & ELLIPSIS */}
        {page < totalPages - 2 && (
          <div className="flex">
            <div className={`${baseBtnClass} w-12 text-slate-300`}>
              <MoreHorizontal size={14} />
            </div>
            <button
              onClick={() => onPageChange(totalPages)}
              className={`${baseBtnClass} w-12 bg-transparent hover:text-blue-600`}
            >
              {formatNum(totalPages)}
            </button>
          </div>
        )}

        {/* NEXT BUTTON */}
        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className={`${baseBtnClass} px-6 bg-transparent hover:bg-slate-50 text-slate-900`}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={14} className="ml-2" />
        </button>
      </div>

      {/* Page Indicator Text */}
      <p className="font-serif italic text-sm text-slate-400">
        Displaying volume {page} of {totalPages}
      </p>
    </div>
  );
};

export default Pagination;
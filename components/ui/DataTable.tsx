'use client';

import React from 'react';
import {
  Eye,
  Edit3,
  Trash2,
  ChevronDown,
  Search,
} from 'lucide-react';

export interface TableColumn<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: TableColumn<T>[];

  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;

  page: number;
  totalPages: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;

  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;

  isActionLoading?: boolean;
}

export default function DataTable<T extends { _id: string }>({
  title,
  data,
  columns,

  search,
  setSearch,

  page,
  totalPages,
  setPage,

  onView,
  onEdit,
  onDelete,

  isActionLoading = false,
}: DataTableProps<T>) {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden">
      
      {/* ─── HEADER: STACKS ON MOBILE ─────────────────────────────────── */}
      <div className="px-4 py-4 sm:px-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between bg-white gap-4">
        <h2 className="text-xs font-black tracking-wider text-slate-800 uppercase">
          {title}
        </h2>

        {/* <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search
              size={14}
              className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="h-9 pl-9 pr-3 w-full sm:w-64 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button className="h-9 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg px-3 hover:bg-slate-50 transition flex items-center gap-2">
            <span className="hidden sm:inline">Reports</span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>
        </div> */}
      </div>

      {/* ─── MOBILE & TABLET LAYOUT (SM & MD SCREENS) ─────────────────── */}
      <div className="block lg:hidden">
        <div className="divide-y divide-slate-100 gap-2">
          {data.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-400 text-xs font-medium">
              No active collection data available inside this dashboard workspace.
            </div>
          ) : (
            data.map((item, rowIndex) => (
              <div 
                key={item._id || rowIndex} 
                className="p-4 bg-white hover:bg-slate-50/20  transition-colors space-y-3.5"
              >
                {/* Dynamically build rows inside the card from columns structure */}
                {columns.map((col, colIdx) => (
                  <div key={colIdx} className="flex justify-between items-start gap-4">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mt-0.5">
                      {col.header}
                    </span>
                    <div className="text-sm text-right font-medium text-slate-800">
                      {col.cell ? (
                        col.cell(item, rowIndex)
                      ) : (
                        <span className="text-slate-600">
                          {String(item[col.accessorKey as keyof T] || '')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Mobile Actions Toolbar */}
                {(onView || onEdit || onDelete) && (
                  <div className="pt-2.5 flex justify-end gap-2 border-t border-slate-100/60">
                    {onView && (
                      <button
                        onClick={() => onView(item)}
                        className="p-2 text-slate-500 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition"
                      >
                        <Eye size={16} />
                      </button>
                    )}

                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 text-slate-500 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition"
                      >
                        <Edit3 size={16} />
                      </button>
                    )}

                    {onDelete && (
                      <button
                        onClick={() => onDelete(item)}
                        disabled={isActionLoading}
                        className="p-2 text-red-500 bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-lg transition disabled:opacity-40"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─── DESKTOP LAYOUT (LG SCREENS AND ABOVE) ────────────────────── */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 font-semibold">
                  {col.header}
                </th>
              ))}

              {(onView || onEdit || onDelete) && (
                <th className="px-6 py-4 font-semibold text-center">
                  Action
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-6 py-10 text-center text-slate-400 text-xs font-medium"
                >
                  No active collection data available inside this dashboard workspace.
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr
                  key={item._id || rowIndex}
                  className="hover:bg-slate-50/30 transition-colors group text-black"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className="px-6 py-4 align-middle"
                    >
                      {col.cell ? (
                        col.cell(item, rowIndex)
                      ) : (
                        <span className="font-medium text-slate-600">
                          {String(item[col.accessorKey as keyof T] || '')}
                        </span>
                      )}
                    </td>
                  ))}

                  {(onView || onEdit || onDelete) && (
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center justify-center gap-2.5">
                        {onView && (
                          <button
                            onClick={() => onView(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition"
                          >
                            <Eye size={15} />
                          </button>
                        )}

                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition"
                          >
                            <Edit3 size={15} />
                          </button>
                        )}

                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            disabled={isActionLoading}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition disabled:opacity-40"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─── FOOTER & PAGINATION ──────────────────────────────────────── */}
      <div className="px-4 py-4 sm:px-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
        <p className="text-xs text-slate-500 font-medium">
          Page <span className="font-semibold text-slate-700">{page}</span> of{' '}
          <span className="font-semibold text-slate-700">{totalPages}</span>
        </p>

        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="h-8 px-3 border border-slate-200 bg-white rounded-lg text-xs font-semibold shadow-sm transition hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none"
          >
            Prev
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="h-8 px-3 border border-slate-200 bg-white rounded-lg text-xs font-semibold shadow-sm transition hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
// components/dashboard/DataTable.tsx

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
    <div className="w-full bg-white rounded border border-slate-200/70 shadow-sm overflow-hidden">
      
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <h2 className="text-xs font-black tracking-wider text-slate-800 uppercase">
          {title}
        </h2>

        <div className="flex items-center gap-3">
          <div className="relative">
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
              className="h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-sm focus:outline-none"
            />
          </div>

          <button className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition flex items-center gap-2">
            <span>Reports</span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
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
                      className="px-6 py-4 vertical-middle"
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
                    <td className="px-6 py-4">
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

      <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Page {page} of {totalPages}
        </p>

        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold disabled:opacity-40"
          >
            Prev
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
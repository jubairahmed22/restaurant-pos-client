'use client';

import React from 'react';
import { Eye, Edit3, Trash2, ChevronDown } from 'lucide-react';

// Define explicit types for our data structural arrays
export interface TableColumn<T> {
  header: string;
  accessorKey: keyof T | string; // supporting nested mappings
  cell?: (item: T, index: number) => React.ReactNode; // custom rendering injection layer
}

interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: TableColumn<T>[];
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  isActionLoading?: boolean;
}

export default function DataTable<T extends { _id: string }>({
  title,
  data,
  columns,
  onView,
  onEdit,
  onDelete,
  isActionLoading = false,
}: DataTableProps<T>) {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden">
      
      {/* Dynamic Structural Header Control */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <h2 className="text-xs font-black tracking-wider text-slate-800 uppercase">
          {title}
        </h2>
        <button className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition flex items-center gap-2">
          <span>Reports</span>
          <ChevronDown size={12} className="text-slate-400" />
        </button>
      </div>

      {/* Main Responsive Canvas Scroll Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full  text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 font-semibold">
                  {col.header}
                </th>
              ))}
              {(onView || onEdit || onDelete) && (
                <th className="px-6 py-4 font-semibold text-center">Action</th>
              )}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-10 text-center text-slate-400 text-xs font-medium">
                  No active collection data available inside this dashboard workspace.
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr key={item._id || rowIndex} className="hover:bg-slate-50/30 transition-colors group">
                  {columns.map((col, colIdx) => {
                    return (
                      <td key={colIdx} className="px-6 py-4 vertical-middle">
                        {col.cell ? (
                          col.cell(item, rowIndex)
                        ) : (
                          <span className="font-medium text-slate-600">
                            {String(item[col.accessorKey as keyof T] || '')}
                          </span>
                        )}
                      </td>
                    );
                  })}

                  {/* Actions Column */}
                  {(onView || onEdit || onDelete) && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2.5">
                        {onView && (
                          <button
                            onClick={() => onView(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition"
                            title="View Record Details"
                          >
                            <Eye size={15} />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition"
                            title="Modify Record Entry"
                          >
                            <Edit3 size={15} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            disabled={isActionLoading}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition disabled:opacity-40"
                            title="Delete Record Entry"
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
    </div>
  );
}
import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
} from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import DebugRerunIcon from '../icons/DebugRerunIcon';
import DeleteIcon from '../icons/DeleteIcon';

export interface UrlItem {
  id: string;
  url: string;
  status: 'queued' | 'running' | 'done' | 'error' | 'stopped';
  title: string;
  htmlVersion: string;
  headings: Record<string, number>;
  internalLinks: number;
  externalLinks: number;
  brokenLinks: { url: string; statusCode: number }[];
  hasLoginForm: boolean;
}

type Timeout = ReturnType<typeof setTimeout>;

interface RunningUrlsTableProps {
  data: UrlItem[];
  onStart: (ids: string[]) => Promise<void>;
  onStop: (ids: string[]) => Promise<void>;
  onDelete: (ids: string[]) => Promise<void>;
  onUpdate: (updated: UrlItem) => void;
  onError?: (error: string) => void;
  bulkStartLabel?: string;
}

interface ColumnMeta {
  hideOnMobile?: boolean;
}

const columnHelper = createColumnHelper<UrlItem>();

function CardRow({ row, onStart, onStop, onDelete, navigate }: {
  row: UrlItem;
  onStart: (ids: string[]) => void;
  onStop: (ids: string[]) => void;
  onDelete: (ids: string[]) => void;
  navigate: (url: string) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-blue-700 underline underline-offset-2 break-all cursor-pointer" onClick={() => navigate(`/urls/${row.id}`)}>{row.url}</div>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          row.status === 'queued' ? 'bg-gray-200 text-gray-800' :
          row.status === 'running' ? 'bg-blue-200 text-blue-800 animate-pulse' :
          row.status === 'done' ? 'bg-green-200 text-green-800' :
          row.status === 'error' ? 'bg-red-200 text-red-800' :
          row.status === 'stopped' ? 'bg-yellow-200 text-yellow-800' : ''
        }`}>{row.status.charAt(0).toUpperCase() + row.status.slice(1)}</span>
      </div>
      <div className="text-gray-700 text-sm break-all">{row.title}</div>
      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
        <span><b>HTML:</b> {row.htmlVersion}</span>
        <span><b>H1:</b> {row.headings.h1 || 0}</span>
        <span><b>H2:</b> {row.headings.h2 || 0}</span>
        <span><b>H3:</b> {row.headings.h3 || 0}</span>
        <span><b>Internal:</b> {row.internalLinks}</span>
        <span><b>External:</b> {row.externalLinks}</span>
        <span><b>Broken:</b> <span className={row.brokenLinks.length > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}>{row.brokenLinks.length}</span></span>
        <span><b>Login:</b> {row.hasLoginForm ? <span className="text-green-600 font-semibold">Yes</span> : <span className="text-gray-400">No</span>}</span>
      </div>
      <div className="flex gap-2 mt-2">
        {(row.status === 'queued' || row.status === 'stopped' || row.status === 'error') ? (
          <button
            onClick={() => onStart([row.id])}
            className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors duration-200 text-sm shadow flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {/* Start/Refresh Icon */}
            <svg className="w-4 h-4 text-gray-700" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M7.167 12a3 3 0 0 1-5.74 1.223l-.928.376A4.001 4.001 0 1 0 1 9.556V8.333H0V11l.5.5h2.333v-1H1.568A3 3 0 0 1 7.167 12z"/><path fillRule="evenodd" clipRule="evenodd" d="M5 2.41L5.78 2l9 6v.83L10 12.017v-1.2l3.6-2.397L6 3.35V7H5V2.41z"/></svg>
            Start
          </button>
        ) : (
          <button
            onClick={() => onStop([row.id])}
            className="px-3 py-1 border border-yellow-300 text-yellow-700 rounded-md hover:bg-yellow-50 transition-colors duration-200 text-sm shadow flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {/* Stop Icon */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            Stop
          </button>
        )}
        <button
          onClick={() => onDelete([row.id])}
          className="px-3 py-1 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors duration-200 text-sm shadow flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {/* Trash Icon */}
          <svg className="w-4 h-4 text-red-600" viewBox="0 0 1024 1024" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M993.763 493.538v35c0 13.331-6.04 26.664-18.135 37.137-140.149 121.422-280.35 242.795-420.49 364.219-11.813 10.237-25.813 15.501-42.454 15.501v-35c16.644 0 30.641-5.264 42.454-15.501C695.28 773.47 835.474 652.092 975.628 530.677c12.095-10.475 18.135-23.803 18.135-37.139z" fill="#EB613C"/><path d="M30.239 528.367v-3.5-1.75-3.5-3.5-1.75-3.5-3.5-1.75-3.5-3.5-1.75-3.5c0 14.707 6.701 29.313 19.037 40.019 138.449 120.064 277.049 239.996 415.562 360.02 13.002 11.26 28.74 16.466 47.853 16.994v35c-19.108-0.528-34.851-5.734-47.853-16.994C326.325 808.382 187.725 688.45 49.276 568.386c-12.337-10.705-19.037-25.312-19.037-40.019z" fill="#EB613C"/><path d="M510.786 76.601c16.263 0 32.546 5.362 44.946 16.097 139.949 121.188 279.9 242.376 419.818 363.586 24.241 20.995 24.295 53.413 0.079 74.396C835.48 652.101 695.28 773.478 555.141 894.898c-11.814 10.238-25.813 15.502-42.451 15.502-19.109-0.528-34.853-5.734-47.854-16.994C326.324 773.382 187.724 653.45 49.275 533.386c-19.581-16.987-24.96-43.81-11.895-65.251 3.919-6.438 8.669-11.829 14.465-16.849C189.954 331.734 328.024 212.152 466.107 92.567c12.296-10.64 28.478-15.966 44.679-15.966z" fill="#ED7764"/><path d="M582.413 335.149v16.8c0-1.498-0.016-2.986-0.062-4.473-0.434-13.969-10.353-22.802-26.469-22.907-7.067-0.048-14.138-0.082-21.205-0.103a6666.65 6666.65 0 0 0-19.492-0.029H514.224c-7.358 0-14.716 0.011-22.075 0.031-8.023 0.022-16.042 0.054-24.064 0.092-12.086 0.053-21.994 5.359-24.625 14.211v-16.8c2.63-8.852 12.54-14.158 24.625-14.211 8.021-0.039 16.041-0.072 24.064-0.092 7.357-0.02 14.716-0.031 22.075-0.031H515.185c6.497 0 12.993 0.009 19.492 0.029 7.068 0.022 14.14 0.055 21.205 0.103 16.118 0.105 26.037 8.938 26.469 22.907 0.045 1.486 0.062 2.974 0.062 4.473z" fill="#BF3F1F"/></svg>
          Delete
        </button>
        <button
          onClick={() => navigate(`/urls/${row.id}`)}
          className="px-3 py-1 border border-indigo-300 text-indigo-700 rounded-md hover:bg-indigo-50 transition-colors duration-200 text-sm shadow flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Details
        </button>
      </div>
    </div>
  );
}

const RunningUrlsTable: React.FC<RunningUrlsTableProps> = ({ data, onStart, onStop, onDelete, onUpdate, onError }) => {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const processingTimeouts = useRef<Map<string, Timeout>>(new Map());
  const navigate = useNavigate();

  const handleStart = async (ids: string[]) => {
    try {
      await onStart(ids);
    } catch (err: any) {
      onError?.(err.message || 'Failed to start URLs');
    }
  };
  const handleStop = async (ids: string[]) => {
    try {
      await onStop(ids);
    } catch (err: any) {
      onError?.(err.message || 'Failed to stop URLs');
    }
  };
  const handleDelete = async (ids: string[]) => {
    try {
      await onDelete(ids);
    } catch (err: any) {
      onError?.(err.message || 'Failed to delete URLs');
    }
  };

  // Columns definition for the table
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-indigo-600 rounded-md border-gray-300 cursor-pointer"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-indigo-600 rounded-md border-gray-300 cursor-pointer"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        enableSorting: false,
        enableColumnFilter: false,
        meta: { hideOnMobile: true },
      }),
      columnHelper.accessor('url', {
        header: 'URL',
        cell: info => {
          const url = info.getValue() as string;
          const display = url.length > 40 ? url.slice(0, 37) + '...' : url;
          const [hovered, setHovered] = React.useState(false);
          return (
            <span
              className="relative break-all text-blue-700 underline underline-offset-2 cursor-pointer"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              tabIndex={0}
              onFocus={() => setHovered(true)}
              onBlur={() => setHovered(false)}
              aria-label={url}
            >
              {display}
              {hovered && (
                <span className="absolute z-10 left-1/2 -translate-x-1/2 -top-8 bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-pre-line max-w-xs break-words">
                  {url}
                </span>
              )}
            </span>
          );
        },
        enableSorting: true,
        enableColumnFilter: true,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: info => {
          const status = info.getValue();
          let colorClass = '';
          switch (status) {
            case 'queued':
              colorClass = 'bg-gray-200 text-gray-800';
              break;
            case 'running':
              colorClass = 'bg-blue-200 text-blue-800 animate-pulse';
              break;
            case 'done':
              colorClass = 'bg-green-200 text-green-800';
              break;
            case 'error':
              colorClass = 'bg-red-200 text-red-800';
              break;
            case 'stopped':
              colorClass = 'bg-yellow-200 text-yellow-800';
              break;
          }
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
          );
        },
        enableSorting: true,
        enableColumnFilter: true,
      }),
      columnHelper.accessor('title', {
        header: 'Title',
        cell: info => {
          const title = info.getValue() as string;
          const display = title.length > 40 ? title.slice(0, 37) + '...' : title;
          const [hovered, setHovered] = React.useState(false);
          return (
            <span
              className="relative break-all cursor-pointer"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              tabIndex={0}
              onFocus={() => setHovered(true)}
              onBlur={() => setHovered(false)}
              aria-label={title}
            >
              {display}
              {hovered && (
                <span className="absolute z-10 left-1/2 -translate-x-1/2 -top-8 bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-pre-line max-w-xs break-words">
                  {title}
                </span>
              )}
            </span>
          );
        },
        enableSorting: true,
        enableColumnFilter: true,
      }),
      columnHelper.accessor('htmlVersion', {
        header: 'HTML Version',
        cell: info => info.getValue(),
        enableSorting: true,
        enableColumnFilter: true,
        meta: { hideOnMobile: true },
      }),
      columnHelper.display({
        id: 'h1',
        header: 'H1',
        cell: ({ row }) => row.original.headings.h1 || 0,
        meta: { hideOnMobile: true },
      }),
      columnHelper.display({
        id: 'h2',
        header: 'H2',
        cell: ({ row }) => row.original.headings.h2 || 0,
        meta: { hideOnMobile: true },
      }),
      columnHelper.display({
        id: 'h3',
        header: 'H3',
        cell: ({ row }) => row.original.headings.h3 || 0,
        meta: { hideOnMobile: true },
      }),
      columnHelper.accessor('internalLinks', {
        header: 'Internal Links',
        cell: info => info.getValue(),
        enableSorting: true,
        meta: { hideOnMobile: true },
      }),
      columnHelper.accessor('externalLinks', {
        header: 'External Links',
        cell: info => info.getValue(),
        enableSorting: true,
        meta: { hideOnMobile: true },
      }),
      columnHelper.display({
        id: 'brokenLinks',
        header: 'Inaccessible Links',
        cell: ({ row }) => (
          <span className={row.original.brokenLinks.length > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}>
            {row.original.brokenLinks.length}
          </span>
        ),
        meta: { hideOnMobile: true },
      }),
      columnHelper.display({
        id: 'loginForm',
        header: 'Login Form',
        cell: ({ row }) => (
          row.original.hasLoginForm ? <span className="text-green-600 font-semibold">Yes</span> : <span className="text-gray-400">No</span>
        ),
        meta: { hideOnMobile: true },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            {(row.original.status === 'queued' || row.original.status === 'stopped' || row.original.status === 'error') ? (
              <button
                onClick={() => handleStart([row.original.id])}
                className="px-3 py-1 border border-green-300 text-green-700 rounded-md hover:bg-green-50 transition-colors duration-200 text-sm shadow flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {/* Start/Refresh Icon */}
                <svg className="w-4 h-4 text-green-700" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M7.167 12a3 3 0 0 1-5.74 1.223l-.928.376A4.001 4.001 0 1 0 1 9.556V8.333H0V11l.5.5h2.333v-1H1.568A3 3 0 0 1 7.167 12z"/><path fillRule="evenodd" clipRule="evenodd" d="M5 2.41L5.78 2l9 6v.83L10 12.017v-1.2l3.6-2.397L6 3.35V7H5V2.41z"/></svg>
                Start
              </button>
            ) : (
              <button
                onClick={() => handleStop([row.original.id])}
                className="px-3 py-1 border border-yellow-300 text-yellow-700 rounded-md hover:bg-yellow-50 transition-colors duration-200 text-sm shadow flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {/* Stop Icon */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                Stop
              </button>
            )}
            <button
              onClick={() => handleDelete([row.original.id])}
              className="px-3 py-1 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors duration-200 text-sm shadow flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {/* Trash Icon */}
              <svg className="w-4 h-4 text-red-600" viewBox="0 0 1024 1024" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M993.763 493.538v35c0 13.331-6.04 26.664-18.135 37.137-140.149 121.422-280.35 242.795-420.49 364.219-11.813 10.237-25.813 15.501-42.454 15.501v-35c16.644 0 30.641-5.264 42.454-15.501C695.28 773.47 835.474 652.092 975.628 530.677c12.095-10.475 18.135-23.803 18.135-37.139z" fill="#EB613C"/><path d="M30.239 528.367v-3.5-1.75-3.5-3.5-1.75-3.5-3.5-1.75-3.5-3.5-1.75-3.5c0 14.707 6.701 29.313 19.037 40.019 138.449 120.064 277.049 239.996 415.562 360.02 13.002 11.26 28.74 16.466 47.853 16.994v35c-19.108-0.528-34.851-5.734-47.853-16.994C326.325 808.382 187.725 688.45 49.276 568.386c-12.337-10.705-19.037-25.312-19.037-40.019z" fill="#EB613C"/><path d="M510.786 76.601c16.263 0 32.546 5.362 44.946 16.097 139.949 121.188 279.9 242.376 419.818 363.586 24.241 20.995 24.295 53.413 0.079 74.396C835.48 652.101 695.28 773.478 555.141 894.898c-11.814 10.238-25.813 15.502-42.451 15.502-19.109-0.528-34.853-5.734-47.854-16.994C326.324 773.382 187.724 653.45 49.275 533.386c-19.581-16.987-24.96-43.81-11.895-65.251 3.919-6.438 8.669-11.829 14.465-16.849C189.954 331.734 328.024 212.152 466.107 92.567c12.296-10.64 28.478-15.966 44.679-15.966z" fill="#ED7764"/><path d="M582.413 335.149v16.8c0-1.498-0.016-2.986-0.062-4.473-0.434-13.969-10.353-22.802-26.469-22.907-7.067-0.048-14.138-0.082-21.205-0.103a6666.65 6666.65 0 0 0-19.492-0.029H514.224c-7.358 0-14.716 0.011-22.075 0.031-8.023 0.022-16.042 0.054-24.064 0.092-12.086 0.053-21.994 5.359-24.625 14.211v-16.8c2.63-8.852 12.54-14.158 24.625-14.211 8.021-0.039 16.041-0.072 24.064-0.092 7.357-0.02 14.716-0.031 22.075-0.031H515.185c6.497 0 12.993 0.009 19.492 0.029 7.068 0.022 14.14 0.055 21.205 0.103 16.118 0.105 26.037 8.938 26.469 22.907 0.045 1.486 0.062 2.974 0.062 4.473z" fill="#BF3F1F"/></svg>
              Delete
            </button>
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: false,
        meta: { hideOnMobile: true },
      }),
    ],
    [onStart, onStop, onDelete]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      globalFilter,
      sorting,
    },
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const selectedUrlIds = useMemo(
    () => table.getSelectedRowModel().rows.map(row => row.original.id),
    [table.getSelectedRowModel().rows]
  );

  // Cleanup timeouts on component unmount
  useEffect(() => {
    return () => {
      processingTimeouts.current.forEach(timeoutId => clearTimeout(timeoutId));
    };
  }, []);

  // Responsive: show cards on mobile, table on sm+
  return (
    <>
      {/* Card/List View for Mobile */}
      <div className="block sm:hidden">
        {data.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No URLs added yet. Add a URL to get started!</div>
        ) : (
          data.map(row => (
            <CardRow
              key={row.id}
              row={row}
              onStart={handleStart}
              onStop={handleStop}
              onDelete={handleDelete}
              navigate={navigate}
            />
          ))
        )}
      </div>

      {/* Table View for Desktop */}
      <div className="hidden sm:block w-full h-full flex flex-col min-h-[32rem]">
        {/* Bulk Actions */}
        {selectedUrlIds.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-4 items-center p-4 bg-indigo-50 rounded-md border border-indigo-200">
            <span className="text-indigo-800 font-medium">{selectedUrlIds.length} URL(s) selected</span>
            <button
              onClick={() => handleStart(selectedUrlIds)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 font-semibold shadow-sm flex items-center gap-2"
            >
              {/* Start/Refresh Icon */}
              <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M7.167 12a3 3 0 0 1-5.74 1.223l-.928.376A4.001 4.001 0 1 0 1 9.556V8.333H0V11l.5.5h2.333v-1H1.568A3 3 0 0 1 7.167 12z"/><path fillRule="evenodd" clipRule="evenodd" d="M5 2.41L5.78 2l9 6v.83L10 12.017v-1.2l3.6-2.397L6 3.35V7H5V2.41z"/></svg>
            </button>
            <button
              onClick={() => handleStop(selectedUrlIds)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200 font-semibold shadow-sm flex items-center gap-2"
            >
              {/* Stop Icon */}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            </button>
            <button
              onClick={() => handleDelete(selectedUrlIds)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 font-semibold shadow-sm flex items-center gap-2"
            >
              {/* Trash Icon */}
              <svg className="w-4 h-4 text-white" viewBox="0 0 1024 1024" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M993.763 493.538v35c0 13.331-6.04 26.664-18.135 37.137-140.149 121.422-280.35 242.795-420.49 364.219-11.813 10.237-25.813 15.501-42.454 15.501v-35c16.644 0 30.641-5.264 42.454-15.501C695.28 773.47 835.474 652.092 975.628 530.677c12.095-10.475 18.135-23.803 18.135-37.139z" fill="#EB613C"/><path d="M30.239 528.367v-3.5-1.75-3.5-3.5-1.75-3.5-3.5-1.75-3.5-3.5-1.75-3.5c0 14.707 6.701 29.313 19.037 40.019 138.449 120.064 277.049 239.996 415.562 360.02 13.002 11.26 28.74 16.466 47.853 16.994v35c-19.108-0.528-34.851-5.734-47.853-16.994C326.325 808.382 187.725 688.45 49.276 568.386c-12.337-10.705-19.037-25.312-19.037-40.019z" fill="#EB613C"/><path d="M510.786 76.601c16.263 0 32.546 5.362 44.946 16.097 139.949 121.188 279.9 242.376 419.818 363.586 24.241 20.995 24.295 53.413 0.079 74.396C835.48 652.101 695.28 773.478 555.141 894.898c-11.814 10.238-25.813 15.502-42.451 15.502-19.109-0.528-34.853-5.734-47.854-16.994C326.324 773.382 187.724 653.45 49.275 533.386c-19.581-16.987-24.96-43.81-11.895-65.251 3.919-6.438 8.669-11.829 14.465-16.849C189.954 331.734 328.024 212.152 466.107 92.567c12.296-10.64 28.478-15.966 44.679-15.966z" fill="#ED7764"/><path d="M582.413 335.149v16.8c0-1.498-0.016-2.986-0.062-4.473-0.434-13.969-10.353-22.802-26.469-22.907-7.067-0.048-14.138-0.082-21.205-0.103a6666.65 6666.65 0 0 0-19.492-0.029H514.224c-7.358 0-14.716 0.011-22.075 0.031-8.023 0.022-16.042 0.054-24.064 0.092-12.086 0.053-21.994 5.359-24.625 14.211v-16.8c2.63-8.852 12.54-14.158 24.625-14.211 8.021-0.039 16.041-0.072 24.064-0.092 7.357-0.02 14.716-0.031 22.075-0.031H515.185c6.497 0 12.993 0.009 19.492 0.029 7.068 0.022 14.14 0.055 21.205 0.103 16.118 0.105 26.037 8.938 26.469 22.907 0.045 1.486 0.062 2.974 0.062 4.473z" fill="#BF3F1F"/></svg>
            </button>
          </div>
        )}
        {/* Global Search */}
        <div className="mb-2">
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder="Search all columns..."
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm"
          />
        </div>
        {/* Table */}
        <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-gray-200 shadow-sm bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none border-b border-gray-200 ${header.column.columnDef.meta as ColumnMeta ? '' : ''}`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>,
                          desc: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 01-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                      {header.column.getCanFilter() ? (
                        <div className="mt-1">
                          <Filter column={header.column} table={table} />
                        </div>
                      ) : null}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                    No URLs added yet. Add a URL to get started!
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    onClick={e => {
                      // Prevent navigation if clicking a checkbox or action button
                      if ((e.target as HTMLElement).closest('button,input[type="checkbox"]')) return;
                      navigate(`/urls/${row.original.id}`);
                    }}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className={`px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-b border-gray-200 ${cell.column.columnDef.meta as ColumnMeta ? '' : ''}`}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </button>
            <button
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
            <span className="flex items-center gap-1 text-gray-700">
              Page
              <strong className="font-semibold">
                {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </strong>
            </span>
          </div>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value));
            }}
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm"
          >
            {[5, 10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

// Column Filter Component
function Filter({ column, table }: { column: any; table: any }) {
  const columnFilterValue = column.getFilterValue();

  return (
    <input
      type="text"
      value={(columnFilterValue ?? '') as string}
      onChange={e => column.setFilterValue(e.target.value)}
      placeholder={`Filter ${column.columnDef.header}...`}
      className="w-36 border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
      onClick={e => e.stopPropagation()} // Prevent sorting when clicking filter input
    />
  );
}

export default RunningUrlsTable;

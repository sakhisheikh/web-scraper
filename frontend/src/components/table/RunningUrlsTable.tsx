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
            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 text-sm shadow"
          >
            Start
          </button>
        ) : (
          <button
            onClick={() => onStop([row.id])}
            className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors duration-200 text-sm shadow"
          >
            Stop
          </button>
        )}
        <button
          onClick={() => onDelete([row.id])}
          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-sm shadow"
        >
          Delete
        </button>
        <button
          onClick={() => navigate(`/urls/${row.id}`)}
          className="px-3 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors duration-200 text-sm shadow"
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
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 text-sm shadow"
              >
                Start
              </button>
            ) : (
              <button
                onClick={() => handleStop([row.original.id])}
                className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors duration-200 text-sm shadow"
              >
                Stop
              </button>
            )}
            <button
              onClick={() => handleDelete([row.original.id])}
              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-sm shadow"
            >
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
        pageSize: 5,
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
      <div className="hidden sm:block w-full h-full flex flex-col">
        {/* Bulk Actions */}
        {selectedUrlIds.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-4 items-center p-4 bg-indigo-50 rounded-md border border-indigo-200">
            <span className="text-indigo-800 font-medium">{selectedUrlIds.length} URL(s) selected</span>
            <button
              onClick={() => handleStart(selectedUrlIds)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 font-semibold shadow-sm"
            >
              Start Selected
            </button>
            <button
              onClick={() => handleStop(selectedUrlIds)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200 font-semibold shadow-sm"
            >
              Stop Selected
            </button>
            <button
              onClick={() => handleDelete(selectedUrlIds)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 font-semibold shadow-sm"
            >
              Delete Selected
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

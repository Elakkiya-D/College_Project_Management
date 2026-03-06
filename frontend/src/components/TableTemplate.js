import React, { useState } from 'react'

const TableTemplate = ({ buttonHaver: ButtonHaver, columns, rows }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Pagination logic
    const totalPages = Math.ceil(rows.length / rowsPerPage);

    // Slice data for pagination
    const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <div className="w-full">
            <div className="overflow-x-auto w-full">
                <table className="table-auto w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/50">
                            {columns.map((column) => (
                                <th
                                    key={column.id}
                                    className={`py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}`}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </th>
                            ))}
                            {ButtonHaver && (
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {paginatedRows.length > 0 ? (
                            paginatedRows.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors duration-200">
                                    {columns.map((column) => {
                                        const value = row[column.id];
                                        return (
                                            <td
                                                key={column.id}
                                                className={`py-4 px-6 text-sm text-gray-800 ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}`}
                                            >
                                                {column.format && typeof value === 'number'
                                                    ? column.format(value)
                                                    : value}
                                            </td>
                                        );
                                    })}
                                    {ButtonHaver && (
                                        <td className="py-4 px-6 text-right">
                                            <ButtonHaver row={row} />
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (ButtonHaver ? 1 : 0)} className="py-8 text-center text-sm text-gray-500">
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Premium Pagination Footer */}
            {rows.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Rows per page:</span>
                        <select
                            value={rowsPerPage}
                            onChange={(e) => {
                                setRowsPerPage(Number(e.target.value));
                                setPage(0);
                            }}
                            className="bg-transparent border border-gray-200 rounded-md py-1 px-2 focus:ring-2 focus:ring-brand outline-none text-gray-700 font-medium"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-700">
                            {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, rows.length)} of {rows.length}
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 0}
                                className={`p-1.5 rounded-md transition-colors ${page === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                            </button>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page >= totalPages - 1}
                                className={`p-1.5 rounded-md transition-colors ${page >= totalPages - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TableTemplate
import React, { useState } from 'react'

const TableTemplate = ({ buttonHaver: ButtonHaver, columns, rows }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const safeColumns = Array.isArray(columns) ? columns : [];
    const safeRows = Array.isArray(rows) ? rows : [];

    // Pagination logic
    const totalPages = Math.ceil(safeRows.length / rowsPerPage);

    // Slice data for pagination
    const paginatedRows = safeRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <div className="w-full bg-white rounded-xl border border-textDark/10 overflow-hidden">
            <div className="overflow-x-auto w-full">
                <table className="table-auto w-full min-w-[820px] text-left border-collapse whitespace-nowrap">
                    <thead>
                        <tr className="border-b border-textDark/10 bg-brand/10 sticky top-0 z-10">
                            {safeColumns.map((column) => (
                                <th
                                    key={column.id}
                                    className={`py-3.5 px-6 text-xs font-semibold text-brand uppercase tracking-wide ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}`}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </th>
                            ))}
                            {ButtonHaver && (
                                <th className="py-3.5 px-6 text-xs font-semibold text-brand uppercase tracking-wide text-right min-w-[170px]">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-textDark/10 bg-white">
                        {paginatedRows.length > 0 ? (
                            paginatedRows.map((row) => (
                                <tr key={row.id || JSON.stringify(row)} className="hover:bg-brand/5 transition-colors duration-200">
                                    {safeColumns.map((column) => {
                                        const value = row[column.id];
                                        return (
                                            <td
                                                key={column.id}
                                                className={`py-3.5 px-6 text-sm text-textDark ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}`}
                                            >
                                                {column.format && typeof value === 'number'
                                                    ? column.format(value)
                                                    : value}
                                            </td>
                                        );
                                    })}
                                    {ButtonHaver && (
                                        <td className="py-3.5 px-6 text-right">
                                            <ButtonHaver row={row} />
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={safeColumns.length + (ButtonHaver ? 1 : 0)} className="py-12 text-center text-sm text-textMedium">
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Premium Pagination Footer */}
            {safeRows.length > 0 && (
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-t border-textDark/10">
                    <div className="flex items-center gap-2 text-sm text-textMedium">
                        <span>Rows per page:</span>
                        <select
                            value={rowsPerPage}
                            onChange={(e) => {
                                setRowsPerPage(Number(e.target.value));
                                setPage(0);
                            }}
                            className="bg-transparent border border-textDark/20 rounded-md py-1 px-2 focus:ring-2 focus:ring-brand/40 outline-none text-textDark font-medium"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-textDark">
                            {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, safeRows.length)} of {safeRows.length}
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 0}
                                className={`p-1.5 rounded-md transition-colors ${page === 0 ? 'text-textDark/30 cursor-not-allowed' : 'text-textMedium hover:bg-background hover:text-brand'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                            </button>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page >= totalPages - 1}
                                className={`p-1.5 rounded-md transition-colors ${page >= totalPages - 1 ? 'text-textDark/30 cursor-not-allowed' : 'text-textMedium hover:bg-background hover:text-brand'}`}
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
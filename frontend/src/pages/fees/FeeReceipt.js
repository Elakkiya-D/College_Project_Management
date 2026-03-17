import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { getApiErrorMessage, getApiUrl } from '../../utils/api';

const FeeReceipt = () => {
    const { receiptId } = useParams();
    const navigate = useNavigate();
    const [receipt, setReceipt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const receiptRef = useRef(null);

    useEffect(() => {
        const fetchReceipt = async () => {
            try {
                const result = await axios.get(getApiUrl(`/api/fees/receipt/${receiptId}`));
                setReceipt(result.data);
                setErrorMessage('');
            } catch (error) {
                setErrorMessage(getApiErrorMessage(error, 'Unable to load the receipt.'));
            } finally {
                setLoading(false);
            }
        };

        fetchReceipt();
    }, [receiptId]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleDownload = async () => {
        if (!receiptRef.current) return;

        const html2pdfModule = await import('html2pdf.js');
        const html2pdf = html2pdfModule.default || html2pdfModule;
        const filename = receipt?.billNumber ? `${receipt.billNumber}.pdf` : 'fee-receipt.pdf';

        html2pdf()
            .set({
                margin: 10,
                filename,
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            })
            .from(receiptRef.current)
            .save();
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-100 px-4 py-10 sm:px-8">
            <style>{`
                @media print {
                    body { background: #fff; }
                    .print-hidden { display: none !important; }
                    .print-area { box-shadow: none !important; border: none !important; }
                }
            `}</style>
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print-hidden">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-800"
                    >
                        <ArrowBackIcon sx={{ fontSize: 16 }} /> Back
                    </button>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="h-10 px-5 rounded-xl border border-gray-200 bg-white text-xs font-bold uppercase tracking-widest text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2"
                        >
                            <PrintIcon sx={{ fontSize: 16 }} /> Print
                        </button>
                        <button
                            onClick={handleDownload}
                            className="h-10 px-5 rounded-xl bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2"
                        >
                            <DownloadIcon sx={{ fontSize: 16 }} /> Download
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center text-sm font-semibold text-gray-400">
                        Loading receipt...
                    </div>
                ) : errorMessage ? (
                    <div className="rounded-3xl border border-red-100 bg-red-50 p-10 text-center text-sm font-semibold text-red-700">
                        {errorMessage}
                    </div>
                ) : (
                    <div ref={receiptRef} className="print-area rounded-3xl border border-slate-100 bg-white p-10 shadow-2xl">
                        <div className="flex flex-col gap-6 border-b border-slate-100 pb-8 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">Institution</p>
                                <h1 className="text-2xl font-bold text-slate-900">{receipt?.institution?.name}</h1>
                                <p className="text-sm text-slate-500">{receipt?.institution?.location || 'Campus Office'}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-right">
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Receipt</p>
                                <p className="text-lg font-bold text-slate-900">{receipt?.billNumber}</p>
                                <p className="text-xs font-semibold text-slate-500">Date: {formatDate(receipt?.receiptDate)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 border-b border-slate-100 py-8 md:grid-cols-2">
                            <InfoItem label="Student" value={receipt?.student?.name} />
                            <InfoItem label="Register Number" value={receipt?.student?.registerNumber || receipt?.student?.rollNum} />
                            <InfoItem label="Department" value={receipt?.student?.department || '-'} />
                            <InfoItem label="Course" value={receipt?.student?.course || '-'} />
                            <InfoItem label="Year" value={receipt?.student?.year || '-'} />
                            <InfoItem label="Payment Mode" value={receipt?.paymentType || '-'} />
                        </div>

                        <div className="py-8">
                            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                                <ReceiptLongIcon sx={{ fontSize: 18 }} /> Fee Details
                            </div>
                            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        <tr>
                                            <th className="px-6 py-4">Particulars</th>
                                            <th className="px-6 py-4 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {receipt?.items?.map((item, index) => (
                                            <tr key={`${item.particulars}-${index}`} className="border-t border-slate-100">
                                                <td className="px-6 py-4 font-semibold text-slate-800">{item.particulars}</td>
                                                <td className="px-6 py-4 text-right font-semibold text-slate-700">
                                                    {formatCurrency(item.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6 border-t border-slate-100 pt-8 md:flex-row md:items-end md:justify-between">
                            <div className="max-w-2xl">
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Amount in Words</p>
                                <p className="mt-2 text-sm font-semibold text-slate-700">{receipt?.amountInWords}</p>
                                {receipt?.paymentReference && (
                                    <p className="mt-3 text-xs text-slate-500">Reference: {receipt.paymentReference}</p>
                                )}
                            </div>
                            <div className="rounded-2xl bg-slate-900 px-6 py-5 text-white">
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">Total Paid</p>
                                <p className="text-2xl font-bold">{formatCurrency(receipt?.totalAmount)}</p>
                            </div>
                        </div>

                        <div className="mt-10 flex flex-col gap-6 border-t border-slate-100 pt-8 md:flex-row md:items-center md:justify-between">
                            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                                This receipt is system-generated.
                            </div>
                            <div className="text-right">
                                <div className="h-10 w-44 border-b border-dashed border-slate-200"></div>
                                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Authorized Signature</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const InfoItem = ({ label, value }) => (
    <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">{label}</p>
        <p className="mt-1 text-sm font-semibold text-slate-800">{value || '-'}</p>
    </div>
);

export default FeeReceipt;

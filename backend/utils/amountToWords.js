const units = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
];

const teens = [
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
];

const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
];

const twoDigitWords = (num) => {
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];

    const ten = Math.floor(num / 10);
    const unit = num % 10;
    return `${tens[ten]}${unit ? ` ${units[unit]}` : ''}`.trim();
};

const threeDigitWords = (num) => {
    const hundred = Math.floor(num / 100);
    const rest = num % 100;

    if (!hundred) return twoDigitWords(rest);

    return `${units[hundred]} Hundred${rest ? ` ${twoDigitWords(rest)}` : ''}`.trim();
};

const numberToWords = (num) => {
    if (num === 0) return 'Zero';

    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remainder = num % 1000;

    const parts = [];

    if (crore) parts.push(`${threeDigitWords(crore)} Crore`);
    if (lakh) parts.push(`${threeDigitWords(lakh)} Lakh`);
    if (thousand) parts.push(`${threeDigitWords(thousand)} Thousand`);
    if (remainder) parts.push(threeDigitWords(remainder));

    return parts.join(' ').trim();
};

const amountToWords = (amount) => {
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
        return 'Invalid Amount';
    }

    const rupees = Math.floor(numericAmount);
    const paise = Math.round((numericAmount - rupees) * 100);

    const rupeesWords = numberToWords(rupees);
    const paiseWords = paise ? numberToWords(paise) : '';

    if (paise) {
        return `${rupeesWords} Rupees and ${paiseWords} Paise Only`;
    }

    return `${rupeesWords} Rupees Only`;
};

module.exports = amountToWords;

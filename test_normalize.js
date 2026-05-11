const normalizeCurrencyAmount = (value) => {
  const normalized = value.trim();
  const numericValue = Number.parseFloat(normalized.replace(/[^\d.]/g, '').replace(/^\.+/, ''))
  return `INR ${new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericValue)}`;
}
console.log('1000 rs =>', normalizeCurrencyAmount('1000 rs'));
console.log('Rs. 1000.00 =>', normalizeCurrencyAmount('Rs. 1000.00'));
console.log('Rs. 1000 =>', normalizeCurrencyAmount('Rs. 1000'));
console.log('1000 =>', normalizeCurrencyAmount('1000'));
console.log('10.000 =>', normalizeCurrencyAmount('10.000'));

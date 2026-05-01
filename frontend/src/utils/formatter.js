export const formatNumber = (value) => {
  return new Intl.NumberFormat("id-ID").format(value);
};

export const formatRupiah = (value) => {
  return `Rp ${formatNumber(value)}`;
};

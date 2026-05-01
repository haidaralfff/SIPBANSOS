export const ROLE_LABELS = {
  admin: "Admin Desa",
  kepala_desa: "Kepala Desa",
  petugas: "Petugas Survei",
  operator_rw: "Operator RW/RT"
};

export const ROLE_OPTIONS = [
  { value: "admin", label: ROLE_LABELS.admin },
  { value: "kepala_desa", label: ROLE_LABELS.kepala_desa },
  { value: "petugas", label: ROLE_LABELS.petugas },
  { value: "operator_rw", label: ROLE_LABELS.operator_rw }
];

export const canAccess = (role, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!role) return false;
  return allowedRoles.includes(role);
};

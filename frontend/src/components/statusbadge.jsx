// Handles both vocabularies in the system:
// - reconciliationStatus: 'OK' | 'Re-check'
// - issuanceRecord.status: 'pending' | 'balanced'
const VARIANTS = {
  OK: "badge-ok",
  "Re-check": "badge-recheck",
  pending: "badge-pending",
  balanced: "badge-ok",
};

const StatusBadge = ({ status }) => (
  <span className={`badge ${VARIANTS[status] || "badge-pending"}`}>{status}</span>
);

export default StatusBadge;
// All formulas here are reverse-engineered directly from the legacy Excel
// sheet (spec Section 5). Keeping them in one place means the balancing
// controller (persists) and the /balancing/preview endpoint (doesn't
// persist) can never drift apart.

// 5.1 Issued Quantity
export const calcIssuedQuantity = (stickersPerSheet, handoverSheetsFull, handoverSheetsHalf) =>
  stickersPerSheet * handoverSheetsFull + handoverSheetsHalf;

// 5.2 Used Quantity
export const calcUsedQuantity = (boxQtyDone, itemsPerBox) => boxQtyDone * itemsPerBox;

// 5.3 System-suggested Balance
export const calcBalanceQuantitySystem = (issuedQuantity, usedQuantity) =>
  issuedQuantity - usedQuantity;

// 5.4 Excess/Short + reconciliation status
export const calcExcessShort = (issuedQuantity, usedQuantity, balanceQuantityFinal, damagedQuantity) =>
  issuedQuantity - (usedQuantity + balanceQuantityFinal + damagedQuantity);

export const calcReconciliationStatus = (excessShort) => (excessShort === 0 ? "OK" : "Re-check");

/**
 * Runs the full balancing calculation (5.2 - 5.4) in one call.
 * Used by both POST /api/balancing (persists the result) and
 * PUT /api/balancing/preview (stateless, live preview only).
 *
 * @param {Object} params
 * @param {number} params.issuedQuantity   - from the linked issuanceRecord
 * @param {number} params.itemsPerBox      - from the linked sticker
 * @param {number} params.boxQtyDone
 * @param {number} [params.balanceQuantityFinal] - defaults to the system-suggested balance if omitted
 * @param {number} [params.damagedQuantity] - defaults to 0
 */
export const computeBalancing = ({
  issuedQuantity,
  itemsPerBox,
  boxQtyDone,
  balanceQuantityFinal,
  damagedQuantity = 0,
}) => {
  const usedQuantity = calcUsedQuantity(boxQtyDone, itemsPerBox);
  const balanceQuantitySystem = calcBalanceQuantitySystem(issuedQuantity, usedQuantity);

  // Pre-fill with the system-suggested balance unless the supervisor
  // has already overridden it with a physically counted value.
  const finalBalance =
    balanceQuantityFinal === undefined || balanceQuantityFinal === null
      ? balanceQuantitySystem
      : Number(balanceQuantityFinal);

  const excessShort = calcExcessShort(issuedQuantity, usedQuantity, finalBalance, damagedQuantity);
  const reconciliationStatus = calcReconciliationStatus(excessShort);

  return {
    usedQuantity,
    balanceQuantitySystem,
    balanceQuantityFinal: finalBalance,
    damagedQuantity: Number(damagedQuantity),
    excessShort,
    reconciliationStatus,
  };
};
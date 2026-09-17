import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import PageNav from "../components/PageNav";
import StatusBadge from "../components/StatusBadge";
import { getPendingIssuance } from "../api/issuance.api";
import { previewBalancing, createBalancing } from "../api/balancing.api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const BalanceSticker = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [pending, setPending] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [selected, setSelected] = useState(null);

  const [boxQtyDone, setBoxQtyDone] = useState("");
  const [balanceQuantityFinal, setBalanceQuantityFinal] = useState("");
  const [damagedQuantity, setDamagedQuantity] = useState("0");
  const [remark, setRemark] = useState("");

  const [computed, setComputed] = useState(null); // { usedQuantity, balanceQuantitySystem, excessShort, reconciliationStatus }
  const [previewing, setPreviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const debounceRef = useRef(null);
  const userTouchedBalance = useRef(false);

  const loadPending = async () => {
    setLoadingPending(true);
    try {
      const data = await getPendingIssuance(user.location);
      setPending(data);
    } catch {
      setPending([]);
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectScenario = (issuance) => {
    setSelected(issuance);
    setBoxQtyDone("");
    setBalanceQuantityFinal("");
    setDamagedQuantity("0");
    setRemark("");
    setComputed(null);
    userTouchedBalance.current = false;
  };

  // Live preview: recompute whenever boxQtyDone / balanceQuantityFinal /
  // damagedQuantity change, debounced so we're not hitting the API on
  // every single keystroke.
  useEffect(() => {
    if (!selected || boxQtyDone === "") {
      setComputed(null);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setPreviewing(true);
      try {
        const result = await previewBalancing({
          issuanceId: selected._id,
          boxQtyDone: Number(boxQtyDone),
          balanceQuantityFinal:
            userTouchedBalance.current && balanceQuantityFinal !== ""
              ? Number(balanceQuantityFinal)
              : undefined,
          damagedQuantity: damagedQuantity === "" ? 0 : Number(damagedQuantity),
        });
        setComputed(result);
        // Pre-fill Balance Quantity with the system suggestion, but only
        // if the supervisor hasn't manually edited it themselves yet.
        if (!userTouchedBalance.current) {
          setBalanceQuantityFinal(String(result.balanceQuantityFinal));
        }
      } catch {
        setComputed(null);
      } finally {
        setPreviewing(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, boxQtyDone, balanceQuantityFinal, damagedQuantity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!selected || boxQtyDone === "") {
      setError("Select a pending scenario and enter Box Quantity.");
      return;
    }
    setSubmitting(true);
    try {
      await createBalancing({
        issuanceId: selected._id,
        boxQtyDone: Number(boxQtyDone),
        balanceQuantityFinal: Number(balanceQuantityFinal),
        damagedQuantity: damagedQuantity === "" ? 0 : Number(damagedQuantity),
        remark,
      });
      showToast("Balancing submitted");
      setSelected(null);
      loadPending();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit balancing.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <Navbar title="Sticker Balancing" />
      <main className="page-content">
        <PageNav links={["home", "issue"]} />

        <div className="balance-layout">
          <section className="card">
            <h2 className="card-heading">Pending scenarios &middot; {user?.location}</h2>
            {loadingPending && <p className="muted">Loading...</p>}
            {!loadingPending && pending.length === 0 && (
              <p className="muted">Nothing pending right now — all caught up.</p>
            )}
            <ul className="scenario-list">
              {pending.map((issuance) => (
                <li
                  key={issuance._id}
                  className={`scenario-item ${selected?._id === issuance._id ? "scenario-item-active" : ""}`}
                  onClick={() => selectScenario(issuance)}
                >
                  <div className="scenario-main">
                    <span className="scenario-sticker">{issuance.stickerId?.stickerName}</span>
                    <span className="scenario-table">Table {issuance.tableNo}</span>
                  </div>
                  <div className="scenario-meta mono">
                    Issued {issuance.issuedQuantity} &middot;{" "}
                    {new Date(issuance.date).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="card form-card">
            {!selected && <p className="muted">Select a scenario on the left to begin.</p>}

            {selected && (
              <form onSubmit={handleSubmit}>
                <h2 className="card-heading">
                  {selected.stickerId?.stickerName} &middot; Table {selected.tableNo}
                </h2>
                <p className="mono muted">Issued Quantity: {selected.issuedQuantity}</p>

                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label" htmlFor="boxQtyDone">
                      Box Quantity Done
                    </label>
                    <input
                      id="boxQtyDone"
                      type="number"
                      min="0"
                      value={boxQtyDone}
                      onChange={(e) => setBoxQtyDone(e.target.value)}
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label" htmlFor="balanceQtyFinal">
                      Balance Quantity
                    </label>
                    <input
                      id="balanceQtyFinal"
                      type="number"
                      min="0"
                      className={
                        computed
                          ? computed.reconciliationStatus === "OK"
                            ? "input-ok"
                            : "input-recheck"
                          : ""
                      }
                      value={balanceQuantityFinal}
                      onChange={(e) => {
                        userTouchedBalance.current = true;
                        setBalanceQuantityFinal(e.target.value);
                      }}
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label" htmlFor="damagedQty">
                      Damaged Quantity
                    </label>
                    <input
                      id="damagedQty"
                      type="number"
                      min="0"
                      value={damagedQuantity}
                      onChange={(e) => setDamagedQuantity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="remark">
                    Remark (optional)
                  </label>
                  <input
                    id="remark"
                    type="text"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                  />
                </div>

                {computed && (
                  <div
                    className={`balance-summary ${
                      computed.reconciliationStatus === "OK" ? "summary-ok" : "summary-recheck"
                    }`}
                  >
                    <div>
                      <span className="muted">Used Quantity</span>
                      <span className="mono">{computed.usedQuantity}</span>
                    </div>
                    <div>
                      <span className="muted">System Balance</span>
                      <span className="mono">{computed.balanceQuantitySystem}</span>
                    </div>
                    <div>
                      <span className="muted">Excess / Short</span>
                      <span className="mono">{computed.excessShort}</span>
                    </div>
                    <div>
                      <span className="muted">Status</span>
                      <StatusBadge status={computed.reconciliationStatus} />
                    </div>
                  </div>
                )}
                {previewing && <p className="muted">Calculating...</p>}

                {error && <div className="form-error">{error}</div>}

                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Submitting..." : "Balance / Submit"}
                </button>
              </form>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default BalanceSticker;
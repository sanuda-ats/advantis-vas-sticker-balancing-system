import { useState } from "react";
import Navbar from "../components/Navbar";
import PageNav from "../components/PageNav";
import StickerSearchPicker from "../components/StickerSearchPicker";
import { createIssuance } from "../api/issuance.api";
import { useToast } from "../context/ToastContext";

const emptyForm = { tableNo: "", handoverSheetsFull: "", handoverSheetsHalf: "" };

const IssueSticker = () => {
  const { showToast } = useToast();
  const [sticker, setSticker] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const isValid =
    sticker &&
    form.tableNo.trim() !== "" &&
    form.handoverSheetsFull !== "" &&
    Number(form.handoverSheetsFull) >= 0 &&
    form.handoverSheetsHalf !== "" &&
    Number(form.handoverSheetsHalf) >= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isValid) {
      setError("Please select a sticker and fill in all fields with valid numbers.");
      return;
    }
    setSubmitting(true);
    try {
      await createIssuance({
        stickerId: sticker._id,
        tableNo: form.tableNo.trim(),
        handoverSheetsFull: Number(form.handoverSheetsFull),
        handoverSheetsHalf: Number(form.handoverSheetsHalf),
      });
      showToast("Sticker issued successfully");
      setSticker(null);
      setForm(emptyForm);
    } catch (err) {
      setError(err.response?.data?.message || "Could not issue sticker. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <Navbar title="Sticker Issuing" />
      <main className="page-content">
        <PageNav links={["home", "balance", "add"]} />

        <form className="card form-card" onSubmit={handleSubmit}>
          <StickerSearchPicker onSelect={setSticker} />

          <div className="field-row">
            <div className="field-group">
              <label className="field-label" htmlFor="tableNo">
                Table No
              </label>
              <input
                id="tableNo"
                type="text"
                value={form.tableNo}
                onChange={handleChange("tableNo")}
              />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="full">
                Handover Sheets (Full)
              </label>
              <input
                id="full"
                type="number"
                min="0"
                value={form.handoverSheetsFull}
                onChange={handleChange("handoverSheetsFull")}
              />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="half">
                Handover Sheets (Half)
              </label>
              <input
                id="half"
                type="number"
                min="0"
                value={form.handoverSheetsHalf}
                onChange={handleChange("handoverSheetsHalf")}
              />
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Issuing..." : "Issue Sticker"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default IssueSticker;
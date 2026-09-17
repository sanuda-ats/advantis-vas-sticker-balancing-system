import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import PageNav from "../components/PageNav";
import { getNextStickerId, uploadStickerImage, createSticker } from "../api/stickers.api";
import { useToast } from "../context/ToastContext";

const emptyForm = {
  stickerName: "",
  itemName: "",
  volumeWeight: "",
  itemsPerBox: "",
  stickersPerSheet: "",
  price: "",
  mfdDate: "",
};

const AddSticker = () => {
  const { showToast } = useToast();
  const [nextId, setNextId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadNextId = async () => {
    try {
      const data = await getNextStickerId();
      setNextId(data.nextStickerId);
    } catch {
      setNextId(null);
    }
  };

  useEffect(() => {
    loadNextId();
  }, []);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    setFile(selected || null);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : "");
  };

  // Required per Appendix A: stickerName, itemName, itemsPerBox,
  // stickersPerSheet, and a picture. Volume/Weight, Price, MFD Date stay optional.
  const isValid =
    form.stickerName.trim() &&
    form.itemName.trim() &&
    Number(form.itemsPerBox) > 0 &&
    Number(form.stickersPerSheet) > 0 &&
    file;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isValid) {
      setError(
        "Sticker Name, Item Name, No. of items in a box, No. of stickers in a sheet, and a Picture are required."
      );
      return;
    }

    setSubmitting(true);
    try {
      const { url } = await uploadStickerImage(file);

      await createSticker({
        stickerName: form.stickerName.trim(),
        itemName: form.itemName.trim(),
        volumeWeight: form.volumeWeight.trim() || undefined,
        itemsPerBox: Number(form.itemsPerBox),
        stickersPerSheet: Number(form.stickersPerSheet),
        price: form.price !== "" ? Number(form.price) : undefined,
        mfdDate: form.mfdDate || undefined,
        pictureUrl: url,
      });

      showToast("Sticker added");
      setForm(emptyForm);
      setFile(null);
      setPreviewUrl("");
      loadNextId();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add sticker. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <Navbar title="Add New Sticker" />
      <main className="page-content">
        <PageNav links={["home", "issue", "balance"]} />

        <form className="card form-card" onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label">Sticker ID</label>
            <input type="text" className="mono" value={nextId ?? "..."} readOnly disabled />
          </div>

          <div className="field-row">
            <div className="field-group">
              <label className="field-label" htmlFor="stickerName">
                Sticker Name
              </label>
              <input
                id="stickerName"
                type="text"
                value={form.stickerName}
                onChange={handleChange("stickerName")}
              />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="itemName">
                Item Name
              </label>
              <input
                id="itemName"
                type="text"
                value={form.itemName}
                onChange={handleChange("itemName")}
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field-group">
              <label className="field-label" htmlFor="volumeWeight">
                Volume / Weight
              </label>
              <input
                id="volumeWeight"
                type="text"
                value={form.volumeWeight}
                onChange={handleChange("volumeWeight")}
              />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="itemsPerBox">
                No. of items in a box
              </label>
              <input
                id="itemsPerBox"
                type="number"
                min="1"
                value={form.itemsPerBox}
                onChange={handleChange("itemsPerBox")}
              />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="stickersPerSheet">
                No. of stickers in a sheet
              </label>
              <input
                id="stickersPerSheet"
                type="number"
                min="1"
                value={form.stickersPerSheet}
                onChange={handleChange("stickersPerSheet")}
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field-group">
              <label className="field-label" htmlFor="price">
                Price
              </label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange("price")}
              />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="mfdDate">
                MFD Date
              </label>
              <input
                id="mfdDate"
                type="date"
                value={form.mfdDate}
                onChange={handleChange("mfdDate")}
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Picture</label>
            <div className="picture-inputs">
              <label className="btn btn-secondary">
                Upload from device
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  hidden
                />
              </label>
              <label className="btn btn-secondary">
                Take Photo
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  hidden
                />
              </label>
            </div>
            {previewUrl && (
              <img src={previewUrl} alt="Preview" className="picture-preview" />
            )}
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Adding..." : "Add Sticker"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default AddSticker;
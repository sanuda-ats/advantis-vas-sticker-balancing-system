import { useEffect, useRef, useState } from "react";
import { searchStickers, getStickerById } from "../api/stickers.api";
import StickerBrowseModal from "./StickerBrowseModal";

// Debounced type-ahead against GET /api/stickers/search?q=&by=, matching
// either stickerName/itemName or stickerId depending on the selected mode.
// On selection, re-fetches the full doc via GET /api/stickers/:id (per
// spec 6.3) and hands it to onSelect.
const StickerSearchPicker = ({ onSelect }) => {
  const [mode, setMode] = useState("name"); // 'name' | 'id'
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query.trim() || selected) {
      setResults([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchStickers(query.trim(), mode);
        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, mode, selected]);

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  const resolveAndSelect = async (sticker) => {
    setOpen(false);
    setBrowseOpen(false);
    setQuery(sticker.stickerName);
    setSelected(sticker);
    try {
      const full = await getStickerById(sticker._id);
      setSelected(full);
      onSelect(full);
    } catch {
      onSelect(sticker);
    }
  };

  const clearSelection = () => {
    setSelected(null);
    setQuery("");
    setResults([]);
    onSelect(null);
  };

  return (
    <div className="sticker-picker">
      <div className="field-group">
        <label className="field-label">Sticker Type Search</label>

        <div className="search-mode-toggle">
          <label className="radio-pill">
            <input
              type="radio"
              name="search-mode"
              checked={mode === "name"}
              onChange={() => handleModeChange("name")}
            />
            By Sticker Name
          </label>
          <label className="radio-pill">
            <input
              type="radio"
              name="search-mode"
              checked={mode === "id"}
              onChange={() => handleModeChange("id")}
            />
            By Sticker ID
          </label>
        </div>

        <div className="search-input-row">
          <input
            id="sticker-search"
            type={mode === "id" ? "number" : "text"}
            placeholder={
              mode === "id" ? "Enter sticker ID..." : "Search by sticker name or item name..."
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (selected) setSelected(null);
            }}
            onFocus={() => results.length && setOpen(true)}
            autoComplete="off"
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setBrowseOpen(true)}
          >
            Browse All Stickers
          </button>
        </div>
      </div>

      {open && results.length > 0 && (
        <ul className="picker-dropdown">
          {results.map((s) => (
            <li key={s._id} onClick={() => resolveAndSelect(s)}>
              <span className="mono">#{s.stickerId}</span>
              <span>{s.stickerName}</span>
              <span className="picker-dropdown-sub">{s.itemName}</span>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div className="sticker-preview-card">
          {selected.pictureUrl && (
            <img src={selected.pictureUrl} alt={selected.stickerName} />
          )}
          <div className="sticker-preview-details">
            <div className="mono sticker-preview-id">#{selected.stickerId}</div>
            <div className="sticker-preview-name">{selected.stickerName}</div>
            <div className="sticker-preview-item">{selected.itemName}</div>
            <div className="sticker-preview-meta mono">
              {selected.itemsPerBox} items/box &middot; {selected.stickersPerSheet} stickers/sheet
            </div>
          </div>
          <button type="button" className="btn btn-ghost" onClick={clearSelection}>
            Change
          </button>
        </div>
      )}

      {browseOpen && (
        <StickerBrowseModal
          onSelect={resolveAndSelect}
          onClose={() => setBrowseOpen(false)}
        />
      )}
    </div>
  );
};

export default StickerSearchPicker;
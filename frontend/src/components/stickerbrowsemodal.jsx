import { useEffect, useState } from "react";
import { listStickers } from "../api/stickers.api";

const StickerBrowseModal = ({ onSelect, onClose }) => {
  const [stickers, setStickers] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  useEffect(() => {
    setLoading(true);
    listStickers(page, limit)
      .then((res) => {
        setStickers(res.data);
        setTotal(res.total);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>All Stickers</h2>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        {loading && <p className="muted">Loading...</p>}

        {!loading && (
          <ul className="browse-list">
            {stickers.map((s) => (
              <li key={s._id} onClick={() => onSelect(s)}>
                {s.pictureUrl && <img src={s.pictureUrl} alt={s.stickerName} />}
                <div className="browse-list-details">
                  <span className="mono browse-list-id">#{s.stickerId}</span>
                  <span className="browse-list-name">{s.stickerName}</span>
                  <span className="browse-list-item">{s.itemName}</span>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="modal-pagination">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="muted mono">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickerBrowseModal;
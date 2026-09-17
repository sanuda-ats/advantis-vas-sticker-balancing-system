import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import Navbar from "../components/Navbar";
import PageNav from "../components/PageNav";
import { getProductivity, exportProductivity } from "../api/productivity.api";
import { listStickers } from "../api/stickers.api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import { LOCATIONS } from "../constants/locations";

const todayISO = () => new Date().toISOString().slice(0, 10);

const ProductivitySheet = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { theme } = useTheme();
  const isSupervisor = user?.role === "Sticker Balancing Supervisor";

  const chartGrid = theme === "dark" ? "#2c2e57" : "#dfe2e8";
  const chartBar = theme === "dark" ? "#16abe3" : "#322e7e";
  const chartTick = theme === "dark" ? "#a3a6cf" : "#5b6472";

  const [date, setDate] = useState(todayISO());
  const [location, setLocation] = useState(
    LOCATIONS.includes(user?.location) ? user.location : LOCATIONS[0]
  );
  const [stickerId, setStickerId] = useState(""); // "" = All Stickers
  const [stickerOptions, setStickerOptions] = useState([]);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Populate the sticker dropdown from whatever's currently in the catalog.
  useEffect(() => {
    listStickers(1, 500)
      .then((res) => setStickerOptions(res.data))
      .catch(() => setStickerOptions([]));
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getProductivity(date, location, stickerId);
      setRows(data);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, location, stickerId]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportProductivity(date, location, stickerId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `productivity-${date}-${location || "all"}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      showToast("Could not export report", "error");
    } finally {
      setExporting(false);
    }
  };

  const total = rows.reduce((sum, r) => sum + r.quantity, 0);

  return (
    <div className="page">
      <Navbar title="Productivity Sheet" />
      <main className="page-content">
        {isSupervisor && <PageNav links={["home"]} />}

        <div className="card">
          <div className="field-row">
            <div className="field-group">
              <label className="field-label" htmlFor="date">
                Date
              </label>
              <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="location">
                Location
              </label>
              <select
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="stickerType">
                Sticker Type
              </label>
              <select
                id="stickerType"
                value={stickerId}
                onChange={(e) => setStickerId(e.target.value)}
              >
                <option value="">All Stickers</option>
                {stickerOptions.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.stickerName}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleExport}
              disabled={exporting || rows.length === 0}
            >
              {exporting ? "Preparing..." : "Download as Excel"}
            </button>
          </div>

          {loading && <p className="muted">Loading...</p>}

          {!loading && rows.length === 0 && (
            <p className="muted">No balanced work for this date/location/sticker yet.</p>
          )}

          {!loading && rows.length > 0 && (
            <>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                    <XAxis dataKey="tableNo" tick={{ fontSize: 12, fill: chartTick }} />
                    <YAxis tick={{ fontSize: 12, fill: chartTick }} allowDecimals={false} />
                    <Tooltip
                      formatter={(value) => [value, "Quantity"]}
                      labelFormatter={(label) => `Table ${label}`}
                    />
                    <Bar dataKey="quantity" fill={chartBar} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Table No</th>
                    <th className="align-right">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.tableNo}>
                      <td>{r.tableNo}</td>
                      <td className="align-right mono">{r.quantity}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total</td>
                    <td className="align-right mono">{total}</td>
                  </tr>
                </tfoot>
              </table>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductivitySheet;
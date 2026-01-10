import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "./Account.css";

const API = import.meta.env.VITE_API_URL || "/api";
const DAY_24H = 24 * 60 * 60 * 1000;

export default function AccountLayout() {
    const [tab, setTab] = useState("overview");
    const [overview, setOverview] = useState(null);
    const [apiKey, setApiKey] = useState(null);
    const [jobsBuy, setJobsBuy] = useState([]);
    const [jobsWork, setJobsWork] = useState([]);

    /* =====================
       HELPERS
    ===================== */
    const isInLast24Hours = (dateStr) => {
        if (!dateStr) return false;
        const created = new Date(dateStr).getTime();
        return Date.now() - created <= DAY_24H;
    };

    const calcPercent = (completed, quantity) => {
        if (!quantity || quantity === 0) return 0;
        return Math.round((completed / quantity) * 100);
    };

    /* =====================
       LOAD DATA
    ===================== */
    useEffect(() => {
        if (tab === "overview") loadOverview();
        if (tab === "api") loadApiKey();
        if (tab === "jobs-buy") loadJobsBuy();
        if (tab === "jobs-work") {
            if (!apiKey) {
                alert("⚠️ Vui lòng tạo API key trước");
                setTab("api");
            } else {
                loadJobsWork();
            }
        }
    }, [tab, apiKey]);

    /* =====================
       API CALLS
    ===================== */
    const loadOverview = async () => {
        const res = await axios.get(`${API}/user/account/overview`, { withCredentials: true });
        setOverview(res.data);
    };

    const loadApiKey = async () => {
        const res = await axios.get(`${API}/user/account/api-key`, { withCredentials: true });
        setApiKey(res.data.api_key);
    };

    const resetApiKey = async () => {
        const res = await axios.post(
            `${API}/user/account/api-key/reset`,
            {},
            { withCredentials: true }
        );
        setApiKey(res.data.api_key);
        alert("✅ API key mới đã tạo (key cũ vô hiệu)");
    };

    const loadJobsBuy = async () => {
        const res = await axios.get(`${API}/job/my-jobs`, { withCredentials: true });
        setJobsBuy(res.data || []);
    };

    const loadJobsWork = async () => {
        const res = await axios.get(`${API}/worker/jobs`, {
            headers: { "x-api-key": apiKey }
        });
        setJobsWork(res.data || []);
    };

    /* =====================
       🔥 FILTER + NORMALIZE (24H) – LỌC 1 LẦN
    ===================== */
    const jobs24h = useMemo(() => {
        return (jobsBuy || [])
            .filter(j => isInLast24Hours(j.created_at))
            .map(j => ({
                ...j,
                quantity: Number(j.quantity || 0),
                completed: Number(j.completed || 0),
                total_cost: Number(j.total_cost || 0)
            }))
            .filter(j => j.quantity > 0)               // bỏ job lỗi
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [jobsBuy]);

    /* =====================
       CALC STATS (24H)
    ===================== */
    const totalQuantity24h = jobs24h.reduce((s, j) => s + j.quantity, 0);

    const doneQuantity24h = jobs24h.reduce((s, j) => s + j.completed, 0);

    const processingQuantity24h = jobs24h.reduce(
        (s, j) => s + Math.max(j.quantity - j.completed, 0),
        0
    );

    const totalCost24h = jobs24h.reduce((s, j) => s + j.total_cost, 0);

    /* =====================
    💸 TIỀN CHỜ DUYỆT (24H)
    = (Σ completed × unit_price) × 60%
    ===================== */
    const WORKER_PERCENT = 0.6;

    const pendingMoney24h =
        jobs24h.reduce((sum, j) => {
            if (j.quantity <= 0 || j.total_cost <= 0) return sum;

            // giá đúng của job đó (90 / 50 / 30 / 10)
            const unitPrice = j.total_cost / j.quantity;

            // tiền job đó đã tạo ra
            const earned = j.completed * unitPrice;

            return sum + earned;
        }, 0) * WORKER_PERCENT;

    return (
        <div className="account-page">
            {/* SIDEBAR */}
            <aside className="account-sidebar">
                <div className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>
                    📊 Tổng quan
                </div>
                <div className={tab === "jobs-buy" ? "active" : ""} onClick={() => setTab("jobs-buy")}>
                    🛒 Job đã đặt
                </div>
                <div className={tab === "jobs-work" ? "active" : ""} onClick={() => setTab("jobs-work")}>
                    🧑‍💻 Job cần làm
                </div>
                <div className={tab === "api" ? "active" : ""} onClick={() => setTab("api")}>
                    🔑 API Key
                </div>
            </aside>

            {/* CONTENT */}
            <main className="account-content">

                {/* OVERVIEW – 24H */}
                {tab === "overview" && overview && (
                    <>
                        <h2>📊 Tổng quan (24 giờ gần nhất)</h2>

                        <div className="stat-grid">
                            <div className="stat-card">
                                <h4>💰 Số dư</h4>
                                <p>{Number(overview.wallet.balance).toLocaleString()} đ</p>
                            </div>

                            <div className="stat-card">
                                <h4>📌 Tổng job đã đặt</h4>
                                <p>{totalQuantity24h.toLocaleString()}</p>
                            </div>

                            <div className="stat-card">
                                <h4>✅ Job chạy thành công</h4>
                                <p>{doneQuantity24h.toLocaleString()}</p>
                            </div>

                            <div className="stat-card">
                                <h4>⏳ Đang xử lý</h4>
                                <p>{processingQuantity24h.toLocaleString()}</p>
                            </div>

                            <div className="stat-card">
                                <h4>💸 Tiền đã chi (24h)</h4>
                                <p>{totalCost24h.toLocaleString()} đ</p>
                            </div>

                            <div className="stat-card pending-money">
                                <h4>⏳ Tiền chờ duyệt</h4>
                                <p>{Math.round(pendingMoney24h).toLocaleString()} đ</p>
                            </div>
                        </div>
                    </>
                )}

                {/* JOB BUY – 24H */}
                {tab === "jobs-buy" && (
                    <>
                        <h2>🛒 Job đã đặt (24 giờ gần nhất)</h2>

                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Dịch vụ</th>
                                    <th>Tiến độ</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày tạo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs24h.map(j => {
                                    const percent = calcPercent(j.completed, j.quantity);
                                    return (
                                        <tr key={j.id}>
                                            <td>{j.id}</td>
                                            <td>{j.service_name}</td>
                                            <td>
                                                <div style={{ fontSize: 13, marginBottom: 4 }}>
                                                    {j.completed} / {j.quantity} ({percent}%)
                                                </div>
                                                <div style={{ width: "100%", height: 8, background: "#eee", borderRadius: 4 }}>
                                                    <div style={{
                                                        width: `${percent}%`,
                                                        height: "100%",
                                                        background: percent >= 100 ? "#4caf50" : "#2196f3",
                                                        borderRadius: 4
                                                    }} />
                                                </div>
                                            </td>
                                            <td>
                                                {j.status === "completed" && "✅ Hoàn thành"}
                                                {j.status === "running" && "⚙️ Đang chạy"}
                                                {j.status === "pending" && "⌛ Chờ xử lý"}
                                            </td>
                                            <td>{new Date(j.created_at).toLocaleString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {jobs24h.length === 0 && <p>❌ Không có job nào trong 24 giờ gần đây</p>}
                    </>
                )}

                {/* JOB WORK – GIỮ NGUYÊN */}
                {tab === "jobs-work" && (
                    <>
                        <h2>🧑‍💻 Job toàn hệ thống</h2>
                        {jobsWork.length === 0 ? (
                            <p>Không có job khả dụng</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Job ID</th>
                                        <th>Target</th>
                                        <th>Số lượng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobsWork.map(j => (
                                        <tr key={j.assignment_id}>
                                            <td>{j.job_id}</td>
                                            <td>{j.target}</td>
                                            <td>{j.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}

                {/* API KEY */}
                {tab === "api" && (
                    <>
                        <h2>🔑 API Key</h2>
                        <pre className="api-key-box">{apiKey || "Chưa có API key"}</pre>
                        <button onClick={resetApiKey}>🔄 Tạo / Reset API key</button>

                        <h3 style={{ marginTop: 20 }}>📡 Dùng cho tool</h3>
                        <pre>
GET /api/worker/jobs
Header:
x-api-key: YOUR_API_KEY
                        </pre>
                    </>
                )}
            </main>
        </div>
    );
}

import { useState, useMemo } from "react";
import { createJob } from "../api/job";
import "./BuyJob.css";

const PACKAGES = [
    { id: 1, name: "Share VIP", price: 120, speed: "super_fast", color: "vip" },
    { id: 2, name: "Share Nhanh", price: 90, speed: "fast", color: "blue" },
    { id: 3, name: "Share Thường", price: 60, speed: "normal", color: "green" }
];

export default function BuyShare() {
    const [target, setTarget] = useState("");
    const [quantity, setQuantity] = useState(50);
    const [packageId, setPackageId] = useState(3); // mặc định gói rẻ nhất
    const [loading, setLoading] = useState(false);

    const selectedPackage = PACKAGES.find(p => p.id === Number(packageId));

    const totalCost = useMemo(() => {
        return quantity * (selectedPackage?.price || 0);
    }, [quantity, selectedPackage]);

    const submit = async () => {
        if (!target || quantity <= 0 || !selectedPackage) {
            alert("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        setLoading(true);
        try {
            await createJob({
                service_id: 2, // SHARE
                package_id: packageId,
                target,
                quantity,
                unit_price: selectedPackage.price
            });

            alert("🎉 Tạo job Share thành công");
            setTarget("");
        } catch (e) {
            alert(e?.response?.data?.msg || "Lỗi tạo job");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="buy-page">
            <div className="buy-box">
                <h2>🔁 Tăng Share bài viết</h2>
                <p className="desc">
                    Share người dùng thật • Giá càng cao chạy càng nhanh
                </p>

                {/* LINK */}
                <div className="form-group">
                    <label>🔗 Link bài viết</label>
                    <input
                        placeholder="https://facebook.com/..."
                        value={target}
                        onChange={e => setTarget(e.target.value)}
                    />
                </div>

                {/* PACKAGE */}
                <label className="label">🎯 Chọn gói Share</label>
                <div className="package-grid">
                    {PACKAGES.map(p => (
                        <div
                            key={p.id}
                            className={`package-card ${p.color} ${packageId === p.id ? "active" : ""}`}
                            onClick={() => setPackageId(p.id)}
                        >
                            <h4>{p.name}</h4>
                            <b>{p.price} xu / share</b>
                            <p>⚡ {p.speed}</p>
                        </div>
                    ))}
                </div>

                {/* QUANTITY */}
                <div className="form-group">
                    <label>📦 Số lượng share</label>
                    <input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={e => setQuantity(Number(e.target.value))}
                    />
                </div>

                {/* TOTAL */}
                <div className="total-box">
                    <span>💰 THANH TOÁN</span>
                    <b>{totalCost.toLocaleString()} Xu</b>
                </div>

                <button className="submit-btn" disabled={loading} onClick={submit}>
                    {loading ? "⏳ Đang tạo đơn..." : "🚀 Tạo đơn ngay"}
                </button>
            </div>
        </div>
    );
}

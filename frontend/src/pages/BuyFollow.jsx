import { useState, useMemo } from "react";
import { createJob } from "../api/job";
import "./BuyJob.css";

const PACKAGES = [
    { id: 1, name: "Follow VIP", price: 80, speed: "super_fast", color: "vip" },
    { id: 2, name: "Follow Nhanh", price: 50, speed: "fast", color: "blue" },
    { id: 3, name: "Follow Thường", price: 30, speed: "normal", color: "green" }
];

export default function BuyFollow() {
    const [target, setTarget] = useState("");
    const [quantity, setQuantity] = useState(100);
    const [packageId, setPackageId] = useState(3); // mặc định gói rẻ
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
                service_id: 4, // FOLLOW
                package_id: packageId,
                target,
                quantity,
                unit_price: selectedPackage.price
            });

            alert("🎉 Tạo job Follow thành công");
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
                <h2>👤 Tăng Follow Facebook</h2>
                <p className="desc">
                    Follow người dùng thật • Giá càng cao chạy càng nhanh
                </p>

                {/* LINK */}
                <div className="form-group">
                    <label>🔗 Link Facebook</label>
                    <input
                        placeholder="https://facebook.com/username"
                        value={target}
                        onChange={e => setTarget(e.target.value)}
                    />
                </div>

                {/* PACKAGE */}
                <label className="label">🎯 Chọn gói Follow</label>
                <div className="package-grid">
                    {PACKAGES.map(p => (
                        <div
                            key={p.id}
                            className={`package-card ${p.color} ${packageId === p.id ? "active" : ""}`}
                            onClick={() => setPackageId(p.id)}
                        >
                            <h4>{p.name}</h4>
                            <b>{p.price} xu / follow</b>
                            <p>⚡ {p.speed}</p>
                        </div>
                    ))}
                </div>

                {/* QUANTITY */}
                <div className="form-group">
                    <label>📦 Số lượng follow</label>
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

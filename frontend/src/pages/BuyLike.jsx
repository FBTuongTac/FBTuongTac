import { useState, useMemo } from "react";
import { createJob } from "../api/job";
import "./BuyJob.css";

const REACTIONS = [
    { key: "like", label: "👍", name: "Like" },
    { key: "love", label: "❤️", name: "Love" },
    { key: "haha", label: "😆", name: "Haha" },
    { key: "wow", label: "😮", name: "Wow" },
    { key: "sad", label: "😢", name: "Sad" },
    { key: "angry", label: "😡", name: "Angry" }
];

const PACKAGES = [
    { id: 1, name: "Like VIP", price: 90, speed: "super_fast", color: "vip" },
    { id: 2, name: "Like Nhanh", price: 50, speed: "fast", color: "blue" },
    { id: 3, name: "Like Thường", price: 30, speed: "normal", color: "green" },
    { id: 4, name: "Like Giá Rẻ", price: 20, speed: "slow", color: "gray" }
];

export default function BuyLike() {
    const [target, setTarget] = useState("");
    const [quantity, setQuantity] = useState(50);
    const [packageId, setPackageId] = useState(4); // mặc định gói rẻ
    const [reactions, setReactions] = useState(["like"]);
    const [loading, setLoading] = useState(false);

    const selectedPackage = PACKAGES.find(p => p.id === Number(packageId));

    const totalCost = useMemo(() => {
        return quantity * (selectedPackage?.price || 0);
    }, [quantity, selectedPackage]);

    const toggleReaction = (key) => {
        setReactions(prev =>
            prev.includes(key)
                ? prev.filter(r => r !== key)
                : [...prev, key]
        );
    };

    const submit = async () => {
        if (!target || quantity <= 0 || reactions.length === 0 || !selectedPackage) {
            alert("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        setLoading(true);
        try {
            await createJob({
                service_id: 1, // LIKE
                package_id: packageId,
                target,
                quantity,
                reaction_types: reactions,
                unit_price: selectedPackage.price
            });

            alert("🎉 Tạo job Like thành công");
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
                <h2>👍 Tăng Like / Reaction bài viết</h2>
                <p className="desc">
                    Chọn loại cảm xúc • Giá càng cao chạy càng nhanh
                </p>

                {/* LINK */}
                <div className="form-group">
                    <label>🔗 Link hoặc Object ID</label>
                    <input
                        placeholder="https://facebook.com/..."
                        value={target}
                        onChange={e => setTarget(e.target.value)}
                    />
                </div>

                {/* REACTION */}
                <label className="label">😀 Chọn cảm xúc</label>
                <div className="reaction-grid">
                    {REACTIONS.map(r => (
                        <div
                            key={r.key}
                            className={`reaction-item ${reactions.includes(r.key) ? "active" : ""}`}
                            onClick={() => toggleReaction(r.key)}
                            title={r.name}
                        >
                            <span>{r.label}</span>
                        </div>
                    ))}
                </div>

                {/* PACKAGE */}
                <label className="label">🎯 Chọn gói Like</label>
                <div className="package-grid">
                    {PACKAGES.map(p => (
                        <div
                            key={p.id}
                            className={`package-card ${p.color} ${packageId === p.id ? "active" : ""}`}
                            onClick={() => setPackageId(p.id)}
                        >
                            <h4>{p.name}</h4>
                            <b>{p.price} xu / like</b>
                            <p>⚡ {p.speed}</p>
                        </div>
                    ))}
                </div>

                {/* QUANTITY */}
                <div className="form-group">
                    <label>📦 Số lượng like</label>
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

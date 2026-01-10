import { useState, useMemo } from "react";
import { createJob } from "../api/job";
import "./BuyJob.css";

const PACKAGES = [
    { id: 1, name: "Comment VIP", price: 120, speed: "fast", color: "vip" },
    { id: 2, name: "Comment Nhanh", price: 80, speed: "normal", color: "blue" },
    { id: 3, name: "Comment Thường", price: 60, speed: "slow", color: "gray" },
    { id: 4, name: "Comment Giá Rẻ", price: 40, speed: "very_slow", color: "green" }
];

export default function BuyComment() {
    const [target, setTarget] = useState("");
    const [comment, setComment] = useState("");
    const [quantity, setQuantity] = useState(10);
    const [packageId, setPackageId] = useState(4); // mặc định gói rẻ
    const [loading, setLoading] = useState(false);

    const selectedPackage = PACKAGES.find(p => p.id === Number(packageId));

    const totalCost = useMemo(() => {
        return quantity * (selectedPackage?.price || 0);
    }, [quantity, selectedPackage]);

    const submit = async () => {
        if (!target || !comment || quantity <= 0 || !selectedPackage) {
            alert("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        setLoading(true);
        try {
            await createJob({
                service_id: 3, // COMMENT
                package_id: packageId,
                target,
                quantity,
                comment_text: comment,
                unit_price: selectedPackage.price
            });

            alert("🎉 Tạo job Comment thành công");
            setComment("");
        } catch (e) {
            alert(e?.response?.data?.msg || "Lỗi tạo job");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="buy-page">
            <div className="buy-box">
                <h2>💬 Tăng Comment bài viết</h2>
                <p className="desc">
                    Comment người dùng thật • Không chứa link • Giá càng cao chạy càng nhanh
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

                {/* COMMENT TEXT */}
                <div className="form-group">
                    <label>✏️ Nội dung comment</label>
                    <textarea
                        className="comment-textarea"
                        placeholder={`Ví dụ:
                    Bài viết hay quá!
                    Like liền luôn 😍`}
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                    />

                    <small className="warning">❌ Không được chứa link</small>
                </div>

                {/* PACKAGE */}
                <label className="label">🎯 Chọn gói Comment</label>
                <div className="package-grid">
                    {PACKAGES.map(p => (
                        <div
                            key={p.id}
                            className={`package-card ${p.color} ${packageId === p.id ? "active" : ""}`}
                            onClick={() => setPackageId(p.id)}
                        >
                            <h4>{p.name}</h4>
                            <b>{p.price} xu / comment</b>
                            <p>⚡ {p.speed}</p>
                        </div>
                    ))}
                </div>

                {/* QUANTITY */}
                <div className="form-group">
                    <label>📦 Số lượng comment</label>
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

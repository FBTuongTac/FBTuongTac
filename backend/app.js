const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

/**
 * =========================
 * CORS (RẤT QUAN TRỌNG)
 * - origin: true  -> cho phép mọi origin hợp lệ (IP, domain, localhost)
 * - credentials: true -> cho phép cookie
 * =========================
 */
app.use(cors({
    origin: true,
    credentials: true
}));

/**
 * =========================
 * MIDDLEWARE CƠ BẢN
 * =========================
 */
app.use(express.json());
app.use(cookieParser());

/**
 * =========================
 * ROUTES
 * =========================
 */
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/job', require('./routes/job.routes'));
app.use('/api/worker', require('./routes/worker.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/wallet', require('./routes/wallet.routes')); // nếu có

/**
 * =========================
 * CRON / UTILS
 * =========================
 */
require('./utils/resetAssignmentCron');

/**
 * =========================
 * START SERVER
 * =========================
 */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});

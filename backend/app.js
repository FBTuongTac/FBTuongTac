const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use("/api/job", require("./routes/job.routes"));
app.use("/api/worker", require("./routes/worker.routes"));
app.use("/api/user", require("./routes/user.routes"));

require('./utils/resetAssignmentCron');

app.listen(3001, () => {
    console.log('Backend running :3001');
});

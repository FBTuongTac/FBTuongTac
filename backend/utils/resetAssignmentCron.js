const cron = require('node-cron');
const db = require('../config/db');

/*
  Chạy mỗi 1 phút
  - KHÔNG DELETE assignment
  - Chỉ reset assignment treo an toàn
*/
cron.schedule('* * * * *', async () => {
  try {

    /* =====================
       1️⃣ RESET ASSIGNMENT TREO (AN TOÀN)
       - chỉ reset khi chưa chạy gì
       - timeout 5 phút
    ===================== */
    const [assignRs] = await db.execute(`
      UPDATE job_assignments
      SET status = 'rejected'
      WHERE status = 'assigned'
        AND completed = 0
        AND assigned_at < (NOW() - INTERVAL 5 MINUTE)
    `);

    if (assignRs.affectedRows > 0) {
      console.log(`♻️ Reset ${assignRs.affectedRows} assignment timeout`);
    }

    /* =====================
       2️⃣ RESET JOB RUNNING MỒ CÔI
    ===================== */
    const [jobRs] = await db.execute(`
      UPDATE jobs j
      SET j.status = 'pending'
      WHERE j.status = 'running'
        AND NOT EXISTS (
            SELECT 1
            FROM job_assignments ja
            WHERE ja.job_id = j.id
              AND ja.status = 'assigned'
        )
    `);

    if (jobRs.affectedRows > 0) {
      console.log(`🔄 Reset ${jobRs.affectedRows} orphan running jobs`);
    }

  } catch (e) {
    console.error('❌ Cron reset error:', e);
  }
});

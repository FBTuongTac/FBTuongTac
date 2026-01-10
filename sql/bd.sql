-- ==============================
-- DATABASE
-- ==============================
CREATE DATABASE IF NOT EXISTS fbtuongtac
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE fbtuongtac;

-- ==============================
-- USERS
-- ==============================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),

    role ENUM('admin','buyer','worker') DEFAULT 'buyer',

    balance DECIMAL(15,2) DEFAULT 0,          -- ví dùng mua job
    earn_pending DECIMAL(15,2) DEFAULT 0,     -- tiền chờ duyệt
    total_withdraw DECIMAL(15,2) DEFAULT 0,   -- tổng đã rút

    api_key VARCHAR(64) UNIQUE,               -- key nhận job
    api_key_status TINYINT DEFAULT 1,         -- 1=hoạt động

    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- WALLET LOG
-- ==============================
CREATE TABLE wallet_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(15,2),
    type ENUM('deposit','job_buy','job_earn','refund','withdraw'),
    ref_id INT,
    note VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ==============================
-- DEPOSIT
-- ==============================
CREATE TABLE deposits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(15,2),
    method VARCHAR(50),
    status ENUM('pending','success','failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ==============================
-- WITHDRAW
-- ==============================
CREATE TABLE withdrawals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(15,2),
    bank_info TEXT,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ==============================
-- SERVICES
-- ==============================
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(100),
    type ENUM('like','share','comment','follow'),
    allow_link TINYINT DEFAULT 1,   -- CHỈ ÁP DỤNG CHO NỘI DUNG (comment)
    status TINYINT DEFAULT 1
);

INSERT INTO services (code,name,type,allow_link) VALUES
('like_post','Like bài viết','like',1),
('share_post','Share bài viết','share',1),
('comment_text','Comment bài viết (TEXT)','comment',0),
('follow_user','Follow Facebook','follow',1);

-- ==============================
-- SERVICE PACKAGES (GÓI TỐC ĐỘ)
-- ==============================
CREATE TABLE service_packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT,
    name VARCHAR(100),
    speed ENUM('slow','normal','fast','super_fast'),
    price INT,                 -- xu / 1 tương tác
    description VARCHAR(255),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

INSERT INTO service_packages (service_id,name,speed,price,description) VALUES
(1,'Like siêu nhanh','super_fast',90,'Ưu tiên chạy nhanh nhất'),
(1,'Like nhanh','fast',50,'Tốc độ nhanh'),
(1,'Like thường','normal',30,'Tốc độ trung bình'),
(1,'Like chậm','slow',10,'Giá rẻ – chạy chậm');

-- ==============================
-- JOBS (KHÁCH ĐẶT)
-- ==============================
CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    buyer_id INT NOT NULL,
    service_id INT NOT NULL,
    package_id INT NOT NULL,

    target VARCHAR(255) NOT NULL,     -- LINK BÀI VIẾT / OBJECT ID (BẮT BUỘC)
    reaction_types VARCHAR(100),      -- like,love,haha...
    quantity INT NOT NULL,
    completed INT DEFAULT 0,

    comment_text TEXT,                -- NỘI DUNG COMMENT (TEXT ONLY – KHÔNG LINK)
    note VARCHAR(255),

    total_cost DECIMAL(15,2),

    auto_retry TINYINT DEFAULT 1,
    retry_count INT DEFAULT 0,
    max_retry INT DEFAULT 3,

    status ENUM(
        'pending',
        'running',
        'completed',
        'failed',
        'refund'
    ) DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (package_id) REFERENCES service_packages(id)
);

-- ==============================
-- JOB ASSIGNMENTS (WORKER NHẬN)
-- ==============================
CREATE TABLE job_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    worker_id INT NOT NULL,
    api_key_used VARCHAR(64),

    quantity INT NOT NULL,
    completed INT DEFAULT 0,

    status ENUM('assigned','submitted','approved','rejected') DEFAULT 'assigned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (worker_id) REFERENCES users(id)
);

-- ==============================
-- JOB RESULTS (BẰNG CHỨNG)
-- ==============================
CREATE TABLE job_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    proof TEXT,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES job_assignments(id)
);

-- ==============================
-- API LOG
-- ==============================
CREATE TABLE api_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    api_key VARCHAR(64),
    endpoint VARCHAR(100),
    ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE job_assignments
ADD COLUMN assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP;

UPDATE users
SET role = 'admin'
WHERE id = 2;

SELECT j.*
FROM jobs j
WHERE j.status IN ('pending','running')
AND j.completed < j.quantity
AND (
    j.completed +
    IFNULL((
        SELECT SUM(ja.quantity)
        FROM job_assignments ja
        WHERE ja.job_id = j.id
        AND ja.status = 'assigned'
    ),0)
) < j.quantity
ORDER BY j.id ASC
LIMIT 1
FOR UPDATE;


ALTER TABLE jobs
ADD INDEX idx_jobs_status (status, completed, quantity);

ALTER TABLE job_assignments
ADD INDEX idx_assign_job_status (job_id, status);

ALTER TABLE job_assignments
ADD INDEX idx_assign_worker (worker_id, status);


CREATE TABLE worker_earnings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    worker_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    assignment_id BIGINT NOT NULL,
    amount BIGINT NOT NULL,
    status ENUM('pending','paid') DEFAULT 'pending',
    available_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uniq_assignment (assignment_id),
    INDEX idx_status_available (status, available_at),
    INDEX idx_worker (worker_id)
);

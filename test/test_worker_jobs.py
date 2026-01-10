import time
import random
import requests

# =====================
# CONFIG
# =====================
BASE_URL = "http://localhost:3001"
API_KEY = "af868c085f8e0eacfae7b9b418a40a7fbaa41f1c2751077a"

HEADERS = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

SLEEP_NO_JOB = 2
SLEEP_AFTER_SUBMIT = 1
MAX_PER_ASSIGNMENT = 20

# =====================
# CHỌN LOẠI JOB
# =====================
JOB_TYPES = {
    "1": "like",
    "2": "follow",
    "3": "share",
    "4": "comment"
}

print("🎛️ CHỌN LOẠI JOB MUỐN CHẠY")
print("1️⃣ Like")
print("2️⃣ Follow")
print("3️⃣ Share")
print("4️⃣ Comment")

choice = input("👉 Nhập số (1-4): ").strip()
WORK_TYPE = JOB_TYPES.get(choice)

if not WORK_TYPE:
    print("❌ Lựa chọn không hợp lệ")
    exit()

print(f"✅ Worker chỉ chạy job: {WORK_TYPE.upper()}")
print("-" * 40)

# =====================
# GET JOB
# =====================
def get_job():
    try:
        r = requests.get(
            f"{BASE_URL}/api/worker/jobs",
            headers=HEADERS,
            timeout=10
        )
        r.raise_for_status()
        jobs = r.json()
        return jobs[0] if jobs else None
    except Exception as e:
        print("❌ Get job error:", e)
        return None

# =====================
# SUBMIT JOB
# =====================
def submit_job(assignment_id, success_count, note=""):
    try:
        payload = {
            "assignment_id": assignment_id,
            "success_count": success_count,
            "proof": note or f"PY_TEST_{WORK_TYPE.upper()}:{success_count}"
        }

        r = requests.post(
            f"{BASE_URL}/api/worker/job/submit",
            headers=HEADERS,
            json=payload,
            timeout=10
        )

        if r.status_code != 200:
            print(f"❌ Submit FAIL | assignment_id={assignment_id}")
            return False

        print(f"✅ Submit OK | assignment_id={assignment_id} | success={success_count}")
        return True

    except Exception as e:
        print("❌ Submit error:", e)
        return False

# =====================
# MAIN LOOP
# =====================
def main():
    print("🚀 Fake Python Worker Started")

    while True:
        job = get_job()

        if not job:
            time.sleep(SLEEP_NO_JOB)
            continue

        assignment_id = job["assignment_id"]
        job_id = job["job_id"]
        job_type = job["service_type"]
        remain_qty = job["quantity"]

        # ❌ Job không đúng loại → release ngay
        if job_type != WORK_TYPE:
            print(
                f"⏭️ Bỏ qua job {job_id} | type={job_type} ≠ {WORK_TYPE}"
            )
            submit_job(
                assignment_id,
                0,
                note="SKIP_WRONG_TYPE"
            )
            continue

        # =====================
        # TEST LOGIC THEO TYPE
        # =====================
        success = min(
            remain_qty,
            random.randint(1, MAX_PER_ASSIGNMENT)
        )

        if job_type == "like":
            reactions = job.get("reaction_types", [])
            print(
                f"🎯 LIKE job {job_id} | reactions={reactions} | chạy={success}"
            )
            time.sleep(1)

        elif job_type == "comment":
            print(
                f"💬 COMMENT job {job_id} | text='{job.get('comment_text')}' | chạy={success}"
            )
            time.sleep(1)

        else:
            print(
                f"🎯 {job_type.upper()} job {job_id} | chạy={success}"
            )
            time.sleep(1)

        submit_job(
            assignment_id,
            success,
            note=f"PY_TEST_{job_type.upper()}:{success}"
        )

        time.sleep(SLEEP_AFTER_SUBMIT)

if __name__ == "__main__":
    main()

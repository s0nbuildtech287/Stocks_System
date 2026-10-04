from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from ingestion.config import DATABASE_URL

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def log_job_run(job_name: str, status: str, rows_affected: int = 0, error: str = None):
    query = text("""
        INSERT INTO job_runs (job_name, status, rows_affected, error, started_at, finished_at)
        VALUES (:job_name, :status, :rows_affected, :error, now(), now())
    """)
    with engine.begin() as conn:
        conn.execute(query, {
            "job_name": job_name,
            "status": status,
            "rows_affected": rows_affected,
            "error": error
        })

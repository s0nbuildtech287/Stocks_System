import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres123@localhost:5432/stocklab")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8080")
INTERNAL_KEY = os.getenv("INTERNAL_KEY", "stocklab_internal_secret_recompute_token")
VNSTOCK_API_KEY = os.getenv("VNSTOCK_API_KEY", "")
TIMEZONE = "Asia/Ho_Chi_Minh"

import requests
import logging
from ingestion.config import BACKEND_URL, INTERNAL_KEY

logger = logging.getLogger(__name__)

def trigger_backend_recompute():
    url = f"{BACKEND_URL}/api/v1/internal/jobs/recompute"
    headers = {
        "X-Internal-Key": INTERNAL_KEY,
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(url, headers=headers, timeout=60)
        if response.status_code == 200:
            logger.info("Successfully triggered backend recompute job.")
            return True
        else:
            logger.error(f"Failed to trigger recompute: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        logger.error(f"Error calling backend recompute endpoint: {e}")
        return False

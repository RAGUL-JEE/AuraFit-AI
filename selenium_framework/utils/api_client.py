import requests

class APIClient:
    def __init__(self, base_url="http://localhost:3000/api"):
        self.base_url = base_url

    def get_health(self):
        try:
            response = requests.get(f"{self.base_url}/health", timeout=5)
            return response.status_code, response.json()
        except Exception as e:
            return 500, {"error": str(e)}

# Generate 100 invalid login credential pairs
invalid_credentials = [(f"user{i}@test.com", f"pass{i}!") for i in range(1, 101)]

# Generate 50 SQL injection payloads
sql_payloads = [(f"admin' OR 1={1} --", "password") for i in range(1, 51)]

# Generate 50 XSS payloads
xss_payloads = [(f"<script>alert({i})</script>", "password") for i in range(1, 51)]

# Total 200 parameterized auth scenarios
AUTH_DATA = invalid_credentials + sql_payloads + xss_payloads

# Generate 100 random responsive viewport dimensions
VIEWPORTS = [(800, 600), (1024, 768), (1920, 1080), (375, 667), (414, 896)] * 20

# Generate 100 workout simulation inputs
WORKOUT_DATA = [(f"ex-{str(i).zfill(2)}", i*5) for i in range(1, 11)] * 10

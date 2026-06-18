# k6 Performance Baseline Testing

This directory contains the k6 load testing scripts designed to establish a performance baseline for your application.

## Test Configuration (`baseline.js`)
- **Virtual Users (VUs):** 100
- **Duration:** 1 minute
- **Goal:** Ensure the system can handle 100 concurrent users with fast response times (Average, Min, Max) and calculate the Requests Per Second (RPS).

## How to Run Locally

### 1. Install k6
You need to install the `k6` binary on your local machine.
- **Windows (Winget):** `winget install k6`
- **Windows (Chocolatey):** `choco install k6`
- **macOS (Homebrew):** `brew install k6`
- **Linux (Debian/Ubuntu):** `sudo apt-get install k6`

### 2. Execute the Test
Run the script using the `k6 run` command. You can optionally override the target URL using an environment variable.

```bash
# Run against the default URL
k6 run baseline.js

# Run against a specific URL
k6 run -e TARGET_URL=http://localhost:5173 baseline.js
```

## How to Read the Output

When the 1 minute test concludes, k6 will output a summary block. Look for these specific metrics:

- **http_reqs**: This shows the total requests and the **Requests per second (RPS)** (e.g., `120.5/s`).
- **http_req_duration**: This shows the response times:
  - `avg`: Average response time (e.g., `250ms`)
  - `min`: Fastest response time (e.g., `50ms`)
  - `max`: Slowest response time (e.g., `1500ms`)

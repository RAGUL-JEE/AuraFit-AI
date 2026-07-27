import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. Setup Options: 100 Virtual Users for 1 Minute
export const options = {
  vus: 100, // 100 virtual users
  duration: '1m', // Running continuously for 1 minute
  thresholds: {
    // We want the 95th percentile of response times to be < 1500ms
    http_req_duration: ['p(95)<1500'],
    // We want the error rate to be less than 1%
    http_req_failed: ['rate<0.01'], 
  },
};

// 2. The Test Scenario (Executed continuously by the 100 VUs)
export default function () {
  // Define the target URL you want to hammer. 
  // Update this to your actual API endpoint or Frontend URL.
  const targetURL = __ENV.TARGET_URL || 'http://localhost:5000/api/status';

  // Make the HTTP GET request
  const res = http.get(targetURL);

  // Validate the response
  check(res, {
    'is status 200': (r) => r.status === 200,
    'response time is fast enough (< 1500ms)': (r) => r.timings.duration < 1500,
  });

  // Small sleep to simulate realistic user delay (optional, remove to maximize RPS)
  // sleep(0.1); 
}

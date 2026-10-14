import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 }, // Ramp-up to 10 users
    { duration: '20s', target: 20 }, // Sustain steady load at 20 users
    { duration: '10s', target: 0 },  // Graceful ramp-down
  ],
  thresholds: {
    // Realistic threshold for local API talking to remote SSL cloud DB
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2 seconds
    http_req_failed: ['rate<0.02'],    // Error rate below 2%
  },
};

const BACKEND_URL = 'http://localhost:7000/api';
const AI_SERVICE_URL = 'http://localhost:8000';

export default function () {
  // 1. Backend Health
  const resBackend = http.get(`${BACKEND_URL}/health`);
  check(resBackend, {
    'Backend Health status is 200': (r) => r.status === 200,
  });

  // 2. AI Service Health
  const resAi = http.get(`${AI_SERVICE_URL}/health`);
  check(resAi, {
    'AI Service status is 200': (r) => r.status === 200,
  });

  // 3. Destinations Catalog Query
  const resDestinations = http.get(`${BACKEND_URL}/Destinations`);
  check(resDestinations, {
    'Destinations API status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
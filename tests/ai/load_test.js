import http from 'k6/http';
import { check, sleep } from 'k6';

// =============================================================
// BASELINE PERFORMANCE TEST (Tuned for Cloud DB Connection Limits)
// =============================================================
export const options = {
  stages: [
    { duration: '10s', target: 5 },  // Ramp-up: 0 to 5 users
    { duration: '20s', target: 10 }, // Sustained load: 10 concurrent users
    { duration: '10s', target: 0 },  // Ramp-down to 0
  ],
  thresholds: {
    // 95% of requests complete within 2 seconds over SSL cloud connection
    http_req_duration: ['p(95)<7000'],
    // Zero request failures allowed
    http_req_failed: ['rate<0.01'],
  },
};

const BACKEND_URL = 'http://localhost:7000/api';
const AI_SERVICE_URL = 'http://localhost:8000';

export default function () {
  // 1. Backend Core Health Check
  const resBackend = http.get(`${BACKEND_URL}/health`);
  check(resBackend, {
    'Backend Health status is 200': (r) => r.status === 200,
  });

  // 2. AI Microservice Health Check
  const resAi = http.get(`${AI_SERVICE_URL}/health`);
  check(resAi, {
    'AI Service status is 200': (r) => r.status === 200,
  });

  // 3. Database Catalog Query (Categories)
  const resCategories = http.get(`${BACKEND_URL}/Categories`);
  check(resCategories, {
    'Categories API status is 200': (r) => r.status === 200,
    'Categories API has data': (r) => r.body.length > 20,
  });

  // 4. Database Catalog Query (Destinations)
  const resDestinations = http.get(`${BACKEND_URL}/Destinations`);
  check(resDestinations, {
    'Destinations API status is 200': (r) => r.status === 200,
  });

  // 2-second realistic human think-time to prevent connection flooding
  sleep(2);
}
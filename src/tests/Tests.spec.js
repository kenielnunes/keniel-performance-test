import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const getContactsDuration = new Trend('get_contacts', true);
export const RateContentOK = new Rate('content_OK');

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.30'],
    get_contacts: ['p(99)<500'],
    content_OK: ['rate>0.95']
  },
  stages: [
    { duration: '10s', target: 5 },
    { duration: '20s', target: 15 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const baseUrl = 'https://api.themoviedb.org/3/movie/changes?page=1';

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0ZDgyNWIzNzk1MmYyMTkwMWM4ZjlkOGZlZGE2MWNkYiIsIm5iZiI6MTczMjgyNDY1MS41ODExOTgsInN1YiI6IjYyYzA3OGI2Mjg3MjNjMDA1OTNhYzhmMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.izE9OWIfLUZmaA9v2UdZ_9gUBfqsOuMLeUCIVeE4bZ4'
    }
  };

  const OK = 200;

  const res = http.get(`${baseUrl}`, params);

  getContactsDuration.add(res.timings.duration);

  RateContentOK.add(res.status === OK);

  check(res, {
    'GET Contacts - Status 200': () => res.status === OK
  });
}

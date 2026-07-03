const http = require('http');
const req = http.request('http://localhost:3000/api/client/1/contracts', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYUBhLmNvbSIsInJvbGUiOiJDTElFTlQiLCJpYXQiOjE2MjAwMDAwMDAsImV4cCI6MTkyMDAwMDAwMH0.1234'
  }
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', (chunk) => console.log(`BODY: ${chunk}`));
});
req.on('error', (e) => console.error(e));
req.end();

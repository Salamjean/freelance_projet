const http = require('http');

async function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) options.headers['Authorization'] = 'Bearer ' + token;
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null });
        } catch(e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  const ts = Date.now();
  // 1. Register Client
  const cRes = await request('POST', '/api/auth/register', { email: `client${ts}@test.com`, password: 'password123', role: 'CLIENT', firstName: 'C', lastName: 'C' });
  const cToken = cRes.data.accessToken;
  const cId = cRes.data.user.id;
  console.log('Client registered:', cId);

  // 2. Register Freelancer
  const fRes = await request('POST', '/api/auth/register', { email: `freelance${ts}@test.com`, password: 'password123', role: 'FREELANCER', firstName: 'F', lastName: 'F' });
  const fToken = fRes.data.accessToken;
  const fId = fRes.data.user.id;
  console.log('Freelancer registered:', fId);

  // 3. Client creates Project
  const pRes = await request('POST', `/api/client/${cId}/projects`, { title: 'Test Project', description: 'desc', budget: 1000, categoryId: 1, duration: 10 }, cToken);
  const pId = pRes.data.id;
  console.log('Project created:', pId);

  // 4. Freelancer applies
  const aRes = await request('POST', `/api/freelance/${fId}/applications`, { projectId: pId, bidAmount: 800, deliveryDelay: 5, coverLetter: 'hi' }, fToken);
  const aId = aRes.data.id;
  console.log('Application created:', aId);

  // 5. Client accepts (creates contract)
  const acRes = await request('PUT', `/api/client/applications/${aId}/status`, { status: 'ACCEPTED' }, cToken);
  console.log('Application accepted:', acRes.status);
  
  const appDetails = await request('GET', `/api/client/applications/${aId}`, null, cToken);
  const contractId = appDetails.data.contract ? appDetails.data.contract.id : null;
  console.log('Contract ID:', contractId);

  // 6. View Contract as Client
  const viewC = await request('GET', `/api/client/applications/${aId}`, null, cToken);
  console.log('Client view app:', viewC.status);

  // 7. View Contract as Freelancer
  const viewF = await request('GET', `/api/freelance/${fId}/missions/${contractId}`, null, fToken);
  console.log('Freelancer view mission:', viewF.status);
}

run().catch(console.error);

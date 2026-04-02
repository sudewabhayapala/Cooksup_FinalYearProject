require('dotenv').config();
const http = require('http');

const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = Number(process.env.PORT || 5000);

const requestJson = (path, method, body) => {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;

    const req = http.request(
      {
        hostname: API_HOST,
        port: API_PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
        }
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          let parsed;
          try {
            parsed = data ? JSON.parse(data) : {};
          } catch {
            return reject(new Error(`Invalid JSON response from ${path}: ${data}`));
          }

          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`${method} ${path} failed (${res.statusCode}): ${JSON.stringify(parsed)}`));
          }
        });
      }
    );

    req.on('error', (error) => reject(error));

    if (payload) {
      req.write(payload);
    }

    req.end();
  });
};

const run = async () => {
  try {
    console.log('🔍 Verifying signup flow (register -> login)...\n');

    const health = await requestJson('/api/health', 'GET');
    console.log(`✅ API health: ${health.status}`);

    const ts = Date.now();
    const email = `autotest_${ts}@example.com`;
    const password = 'Test@12345';

    const registerPayload = {
      email,
      password,
      firstName: 'Auto',
      lastName: 'Tester',
      phone: '1234567890',
      userType: 'customer',
      location: 'Automation City'
    };

    const registerResponse = await requestJson('/api/auth/register', 'POST', registerPayload);
    const loginResponse = await requestJson('/api/auth/login', 'POST', { email, password });

    const registeredUserId = registerResponse?.user?.id;
    const loginUserId = loginResponse?.user?.id;

    if (!registeredUserId || !loginUserId || registeredUserId !== loginUserId) {
      throw new Error('User IDs do not match between register and login responses.');
    }

    console.log('✅ Register response received');
    console.log('✅ Login response received');
    console.log('✅ Signup data persisted in database\n');

    console.log('Result Summary:');
    console.log(`- email: ${email}`);
    console.log(`- registeredUserId: ${registeredUserId}`);
    console.log(`- loginUserId: ${loginUserId}`);
    console.log(`- userType: ${loginResponse?.user?.userType}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Signup flow verification failed');
    console.error(error.message);
    process.exit(1);
  }
};

run();

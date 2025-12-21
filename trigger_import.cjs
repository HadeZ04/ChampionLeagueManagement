const http = require('http');

const data = JSON.stringify({
    seasonName: 'Champions League 2024/2025',
    createTournament: true
});

const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/import/champions-league',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Triggering Internal Data Import...');
const req = http.request(options, (res) => {
    let responseBody = '';
    console.log(`Status Code: ${res.statusCode}`);
    res.on('data', chunk => responseBody += chunk);
    res.on('end', () => console.log('Response:', responseBody));
});

req.on('error', (error) => console.error('Request Error:', error));
req.write(data);
req.end();

const http = require('http');

const data = JSON.stringify({
    season: '2024',
    syncTeams: false,   // Disabled to save requests
    syncPlayers: false, // Disabled to save requests
    syncMatches: true,  // Only syncing matches
    syncStandings: false // Disabled to save requests
});

const options = {
    hostname: 'localhost',
    port: 4001,
    path: '/api/sync',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Triggering Lighter Sync (Matches Only)...');
const req = http.request(options, (res) => {
    let responseBody = '';

    console.log(`Status Code: ${res.statusCode}`);

    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        console.log('Response:', responseBody);
    });
});

req.on('error', (error) => {
    console.error('Request Error:', error);
});

req.write(data);
req.end();

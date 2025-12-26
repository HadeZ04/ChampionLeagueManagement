/**
 * Player Avatar Fetcher - TheSportsDB Integration
 * Auto-fetch player avatars from TheSportsDB Free API
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ========================
// CONFIGURATION
// ========================
const CONFIG = {
  // TheSportsDB Free API Key
  THESPORTSDB_API_KEY: '3',
  
  // Mode: 'file' = download locally, 'api' = update via API
  MODE: 'file', // Change to 'api' to update via API
  
  // Rate limiting (free tier: 30 requests/minute)
  RATE_LIMIT_DELAY_MS: 2000, // 2 seconds between requests
  
  // Use simulated mode for testing (bypass network issues)
  SIMULATE_MODE: false, // Set to true to simulate API responses for testing
  
  // Proxy configuration
  USE_PROXY: false, // Set to false to bypass proxy
  
  // Output directory for downloaded images
  OUTPUT_DIR: './player-avatars',
  
  // Your internal API base URL (for MODE='api')
  INTERNAL_API_URL: 'http://localhost:3000',
  
  // Mock data for testing (replace with real API call)
  USE_MOCK_DATA: true,
};

// ========================
// MOCK DATA
// ========================
const MOCK_PLAYERS = [
  { playerId: 101, fullName: 'Lionel Messi', team: 'Inter Miami CF' },
  { playerId: 102, fullName: 'Cristiano Ronaldo', team: 'Al Nassr' },
  { playerId: 103, fullName: 'Kevin De Bruyne', team: 'Manchester City' },
  { playerId: 104, fullName: 'Erling Haaland', team: 'Manchester City' },
  { playerId: 105, fullName: 'Kylian Mbappe', team: 'Paris Saint-Germain' },
];

// ========================
// UTILITY FUNCTIONS
// ========================

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create slug from player name
 */
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Normalize team name for comparison
 */
function normalizeTeamName(teamName) {
  if (!teamName) return '';
  return teamName.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Check if teams match (fuzzy matching)
 */
function isTeamMatch(team1, team2) {
  const normalized1 = normalizeTeamName(team1);
  const normalized2 = normalizeTeamName(team2);
  return normalized1.includes(normalized2) || normalized2.includes(normalized1);
}

/**
 * Ensure directory exists
 */
function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

// ========================
// API FUNCTIONS
// ========================

/**
 * Fetch players from internal API
 */
async function fetchPlayersFromInternalAPI() {
  if (CONFIG.USE_MOCK_DATA) {
    console.log('🎭 Using mock data for testing');
    return MOCK_PLAYERS;
  }
  
  try {
    const response = await axios.get(`${CONFIG.INTERNAL_API_URL}/api/players`, {
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch from internal API:', error.message);
    console.log('🎭 Falling back to mock data');
    return MOCK_PLAYERS;
  }
}

/**
 * Simulated TheSportsDB response (for testing without network)
 */
function getSimulatedResponse(playerName) {
  const simData = {
    'lionel messi': {
      strPlayer: 'Lionel Messi',
      strTeam: 'Inter Miami',
      strCutout: 'https://www.thesportsdb.com/images/media/player/cutout/vwtp7w1534514345.png',
      strThumb: 'https://www.thesportsdb.com/images/media/player/thumb/w0zrmp1534514422.jpg',
    },
    'cristiano ronaldo': {
      strPlayer: 'Cristiano Ronaldo',
      strTeam: 'Al Nassr',
      strCutout: 'https://www.thesportsdb.com/images/media/player/cutout/5r2ggf1617634105.png',
      strThumb: 'https://www.thesportsdb.com/images/media/player/thumb/uqsxqw1420748311.jpg',
    },
    'kevin de bruyne': {
      strPlayer: 'Kevin De Bruyne',
      strTeam: 'Manchester City',
      strCutout: 'https://www.thesportsdb.com/images/media/player/cutout/ttkusy1668623747.png',
      strThumb: 'https://www.thesportsdb.com/images/media/player/thumb/t91rbk1626116720.jpg',
    },
    'erling haaland': {
      strPlayer: 'Erling Haaland',
      strTeam: 'Manchester City',
      strCutout: 'https://www.thesportsdb.com/images/media/player/cutout/6w63nn1659544243.png',
      strThumb: 'https://www.thesportsdb.com/images/media/player/thumb/q4vgmk1584456437.jpg',
    },
    'kylian mbappe': {
      strPlayer: 'Kylian Mbappe',
      strTeam: 'Paris Saint-Germain',
      strCutout: 'https://www.thesportsdb.com/images/media/player/cutout/b4v79e1632427614.png',
      strThumb: 'https://www.thesportsdb.com/images/media/player/thumb/7nkxyz1603099709.jpg',
    },
  };
  
  const key = playerName.toLowerCase();
  const player = simData[key];
  
  if (player) {
    return { player: [player] };
  }
  return { player: null };
}

/**
 * Search player in TheSportsDB
 */
async function searchPlayerInSportsDB(playerName, originalTeam) {
  const searchUrl = `https://www.thesportsdb.com/api/v1/json/${CONFIG.THESPORTSDB_API_KEY}/searchplayers.php`;
  
  try {
    console.log(`   🔍 Searching TheSportsDB: "${playerName}"`);
    
    let response;
    
    if (CONFIG.SIMULATE_MODE) {
      // Use simulated data
      console.log(`   🎭 Using simulated response`);
      response = { data: getSimulatedResponse(playerName) };
    } else {
      // Real API call
      const axiosConfig = {
        params: { p: playerName },
        timeout: 10000,
      };
      
      // Bypass proxy if configured
      if (!CONFIG.USE_PROXY) {
        axiosConfig.proxy = false;
      }
      
      response = await axios.get(searchUrl, axiosConfig);
    }
    
    if (!response.data.player || response.data.player.length === 0) {
      console.log(`   ❌ No results found`);
      return null;
    }
    
    const players = response.data.player;
    console.log(`   ✅ Found ${players.length} result(s)`);
    
    // Try to match by team first
    let bestMatch = players[0];
    if (originalTeam && players.length > 1) {
      const teamMatch = players.find(p => isTeamMatch(p.strTeam, originalTeam));
      if (teamMatch) {
        bestMatch = teamMatch;
        console.log(`   🎯 Team matched: ${bestMatch.strTeam}`);
      }
    }
    
    // Get avatar URL (priority: strCutout > strThumb)
    const avatarUrl = bestMatch.strCutout || bestMatch.strThumb;
    
    if (avatarUrl) {
      console.log(`   📷 Avatar found: ${avatarUrl.substring(0, 60)}...`);
      return {
        playerData: bestMatch,
        avatarUrl: avatarUrl,
      };
    } else {
      console.log(`   ⚠️  Player found but no avatar available`);
      return null;
    }
    
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(`   ❌ Player not found in TheSportsDB`);
      return null;
    }
    console.error(`   ❌ API Error: ${error.message}`);
    return null;
  }
}

/**
 * Download image from URL
 */
async function downloadImage(imageUrl, outputPath) {
  try {
    if (CONFIG.SIMULATE_MODE) {
      // Simulate download by creating a dummy file
      console.log(`   🎭 Simulating download (creating dummy file)`);
      const dummyContent = `Simulated image download from: ${imageUrl}\nTimestamp: ${new Date().toISOString()}`;
      fs.writeFileSync(outputPath, dummyContent);
      return;
    }
    
    const axiosConfig = {
      method: 'GET',
      url: imageUrl,
      responseType: 'stream',
      timeout: 30000,
    };
    
    // Bypass proxy if configured
    if (!CONFIG.USE_PROXY) {
      axiosConfig.proxy = false;
    }
    
    const response = await axios(axiosConfig);
    
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    throw new Error(`Download failed: ${error.message}`);
  }
}

/**
 * Update player avatar via internal API (mock)
 */
async function updatePlayerAvatarInAPI(playerId, avatarUrl) {
  console.log(`   📤 [MOCK] Updating player ${playerId} via API`);
  console.log(`   📤 [MOCK] PUT ${CONFIG.INTERNAL_API_URL}/api/players/${playerId}/avatar`);
  console.log(`   📤 [MOCK] Body: { "avatarUrl": "${avatarUrl}" }`);
  
  // In real implementation, uncomment this:
  /*
  try {
    await axios.put(
      `${CONFIG.INTERNAL_API_URL}/api/players/${playerId}/avatar`,
      { avatarUrl },
      { timeout: 5000 }
    );
    console.log(`   ✅ API updated successfully`);
  } catch (error) {
    throw new Error(`API update failed: ${error.message}`);
  }
  */
}

// ========================
// MAIN PROCESSING
// ========================

/**
 * Process a single player
 */
async function processPlayer(player) {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🏃 Player: ${player.fullName}`);
  console.log(`   ID: ${player.playerId}`);
  console.log(`   Team: ${player.team || 'N/A'}`);
  
  const result = {
    playerId: player.playerId,
    playerName: player.fullName,
    team: player.team,
    status: 'error',
    avatarUrl: null,
    localPath: null,
    error: null,
  };
  
  try {
    // Search in TheSportsDB
    const searchResult = await searchPlayerInSportsDB(player.fullName, player.team);
    
    if (!searchResult) {
      result.status = 'no_avatar';
      console.log(`   ⚠️  Status: NO AVATAR FOUND`);
      return result;
    }
    
    result.avatarUrl = searchResult.avatarUrl;
    
    // Process based on mode
    if (CONFIG.MODE === 'file') {
      // Download image
      ensureDirectory(CONFIG.OUTPUT_DIR);
      
      const slug = slugify(player.fullName);
      const extension = path.extname(new URL(searchResult.avatarUrl).pathname) || '.png';
      const filename = `${player.playerId}-${slug}${extension}`;
      const outputPath = path.join(CONFIG.OUTPUT_DIR, filename);
      
      console.log(`   ⬇️  Downloading to: ${filename}`);
      await downloadImage(searchResult.avatarUrl, outputPath);
      
      result.localPath = outputPath;
      result.status = 'success';
      console.log(`   ✅ Downloaded successfully`);
      
    } else if (CONFIG.MODE === 'api') {
      // Update via API
      await updatePlayerAvatarInAPI(player.playerId, searchResult.avatarUrl);
      result.status = 'success';
      console.log(`   ✅ API updated successfully`);
    }
    
  } catch (error) {
    result.error = error.message;
    console.error(`   ❌ ERROR: ${error.message}`);
  }
  
  return result;
}

/**
 * Process all players
 */
async function processAllPlayers(players) {
  console.log('\n' + '═'.repeat(60));
  console.log(`🚀 Starting to process ${players.length} players`);
  console.log('═'.repeat(60));
  
  const results = [];
  
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    console.log(`\n[${i + 1}/${players.length}]`);
    
    const result = await processPlayer(player);
    results.push(result);
    
    // Rate limiting delay
    if (i < players.length - 1) {
      console.log(`\n⏱️  Waiting ${CONFIG.RATE_LIMIT_DELAY_MS}ms (rate limiting)...`);
      await sleep(CONFIG.RATE_LIMIT_DELAY_MS);
    }
  }
  
  return results;
}

/**
 * Display summary report
 */
function displaySummary(results) {
  console.log('\n' + '═'.repeat(60));
  console.log('📊 SUMMARY REPORT');
  console.log('═'.repeat(60));
  
  const successful = results.filter(r => r.status === 'success');
  const noAvatar = results.filter(r => r.status === 'no_avatar');
  const errors = results.filter(r => r.status === 'error');
  
  console.log(`\n📈 Statistics:`);
  console.log(`   Total players processed: ${results.length}`);
  console.log(`   ✅ Success: ${successful.length}`);
  console.log(`   ❌ No avatar found: ${noAvatar.length}`);
  console.log(`   ⚠️  Errors: ${errors.length}`);
  
  if (successful.length > 0) {
    console.log(`\n✅ Players with avatars:`);
    successful.forEach(r => {
      console.log(`   • ${r.playerName} (ID: ${r.playerId})`);
      if (CONFIG.MODE === 'file') {
        console.log(`     └─ ${r.localPath}`);
      } else {
        console.log(`     └─ ${r.avatarUrl}`);
      }
    });
  }
  
  if (noAvatar.length > 0) {
    console.log(`\n❌ Players without avatars:`);
    noAvatar.forEach(r => {
      console.log(`   • ${r.playerName} (${r.team || 'Unknown team'})`);
    });
  }
  
  if (errors.length > 0) {
    console.log(`\n⚠️  Players with errors:`);
    errors.forEach(r => {
      console.log(`   • ${r.playerName}: ${r.error}`);
    });
  }
  
  // Save detailed report
  const reportPath = path.join(__dirname, `avatar-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed JSON report: ${reportPath}`);
  
  console.log('\n' + '═'.repeat(60));
}

// ========================
// MAIN EXECUTION
// ========================

async function main() {
  console.log('═'.repeat(60));
  console.log('🎯 PLAYER AVATAR FETCHER - THESPORTSDB');
  console.log('═'.repeat(60));
  console.log(`Mode: ${CONFIG.MODE.toUpperCase()}`);
  console.log(`API Key: ${CONFIG.THESPORTSDB_API_KEY}`);
  console.log(`Rate Limit: ${CONFIG.RATE_LIMIT_DELAY_MS}ms delay`);
  console.log(`Output: ${CONFIG.MODE === 'file' ? CONFIG.OUTPUT_DIR : 'API Update'}`);
  console.log('═'.repeat(60));
  
  try {
    // Fetch players
    const players = await fetchPlayersFromInternalAPI();
    
    if (players.length === 0) {
      console.log('\n⚠️  No players to process');
      return;
    }
    
    // Process all players
    const results = await processAllPlayers(players);
    
    // Display summary
    displaySummary(results);
    
    console.log('\n✅ Script completed successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, processPlayer, CONFIG };

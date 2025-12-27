import fs from 'fs';
import path from 'path';
import { query } from '../src/db/sqlServer';

/**
 * Run all database migrations in order
 * Usage: npx ts-node backend/scripts/runMigrations.ts
 */

const migrationsDir = path.join(__dirname, '../src/data/migrations');

// Migration files in order (by date prefix)
const migrationFiles = [
  '20250205_full_system_schema.sql',
  '20250205_seed_admin_roles.sql',
  '20250210_create_player_stats.sql',
  '20250210_enforce_ruleset_assignment_fk.sql',
  '20250226_player_suspensions.sql',
  '20250227_match_events_cards.sql', // Match events with card support
  '20251223_team_admin_scope.sql'
];

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${file} - skipping...`);
      continue;
    }

    try {
      console.log(`📄 Running migration: ${file}...`);
      const sqlContent = fs.readFileSync(filePath, 'utf-8');
      
      // Split by GO statements if present
      const statements = sqlContent
        .split(/^\s*GO\s*$/gim)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        if (statement.trim()) {
          await query(statement);
        }
      }

      console.log(`✅ Completed: ${file}\n`);
    } catch (error: any) {
      console.error(`❌ Error running ${file}:`, error.message);
      
      // Check if it's a "table already exists" error - that's okay
      if (error.message?.includes('already exists') || 
          error.message?.includes('There is already an object')) {
        console.log(`   ℹ️  Table/object already exists - skipping...\n`);
        continue;
      }
      
      // For other errors, ask if user wants to continue
      console.error(`   ⚠️  Migration failed. Do you want to continue? (y/n)`);
      // In non-interactive mode, we'll just throw
      throw error;
    }
  }

  console.log('🎉 All migrations completed successfully!');
}

// Run migrations
runMigrations()
  .then(() => {
    console.log('\n✅ Migration process finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration process failed:', error);
    process.exit(1);
  });


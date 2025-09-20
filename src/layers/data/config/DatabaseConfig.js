// Database Configuration
// Handles database connection and configuration

import APP_CONFIG from '../../../config/app.config'

export class DatabaseConfig {
  constructor() {
    this.config = APP_CONFIG.DATABASE
    this.connection = null
  }

  // Initialize database connection
  async initialize() {
    try {
      switch (this.config.TYPE) {
        case 'postgresql':
          return await this.initializePostgreSQL()
        case 'mysql':
          return await this.initializeMySQL()
        case 'mongodb':
          return await this.initializeMongoDB()
        default:
          throw new Error(`Unsupported database type: ${this.config.TYPE}`)
      }
    } catch (error) {
      console.error('Database initialization failed:', error)
      throw error
    }
  }

  // PostgreSQL initialization
  async initializePostgreSQL() {
    const { Pool } = require('pg')
    
    const pool = new Pool({
      host: this.config.CONNECTION.HOST,
      port: this.config.CONNECTION.PORT,
      database: this.config.CONNECTION.DATABASE,
      user: this.config.CONNECTION.USERNAME,
      password: this.config.CONNECTION.PASSWORD,
      min: this.config.POOL.MIN,
      max: this.config.POOL.MAX,
      idleTimeoutMillis: this.config.POOL.IDLE_TIMEOUT
    })

    // Test connection
    await pool.query('SELECT NOW()')
    console.log('PostgreSQL connection established')
    
    this.connection = pool
    return pool
  }

  // MySQL initialization
  async initializeMySQL() {
    const mysql = require('mysql2/promise')
    
    const pool = mysql.createPool({
      host: this.config.CONNECTION.HOST,
      port: this.config.CONNECTION.PORT,
      database: this.config.CONNECTION.DATABASE,
      user: this.config.CONNECTION.USERNAME,
      password: this.config.CONNECTION.PASSWORD,
      connectionLimit: this.config.POOL.MAX,
      acquireTimeout: this.config.POOL.IDLE_TIMEOUT
    })

    // Test connection
    await pool.execute('SELECT 1')
    console.log('MySQL connection established')
    
    this.connection = pool
    return pool
  }

  // MongoDB initialization
  async initializeMongoDB() {
    const { MongoClient } = require('mongodb')
    
    const connectionString = `mongodb://${this.config.CONNECTION.USERNAME}:${this.config.CONNECTION.PASSWORD}@${this.config.CONNECTION.HOST}:${this.config.CONNECTION.PORT}/${this.config.CONNECTION.DATABASE}`
    
    const client = new MongoClient(connectionString, {
      maxPoolSize: this.config.POOL.MAX,
      minPoolSize: this.config.POOL.MIN
    })

    await client.connect()
    console.log('MongoDB connection established')
    
    this.connection = client.db(this.config.CONNECTION.DATABASE)
    return this.connection
  }

  // Get database connection
  getConnection() {
    if (!this.connection) {
      throw new Error('Database not initialized. Call initialize() first.')
    }
    return this.connection
  }

  // Close database connection
  async close() {
    if (this.connection) {
      if (this.config.TYPE === 'mongodb') {
        await this.connection.client.close()
      } else {
        await this.connection.end()
      }
      this.connection = null
      console.log('Database connection closed')
    }
  }

  // Execute query (abstraction layer)
  async query(sql, params = []) {
    try {
      switch (this.config.TYPE) {
        case 'postgresql':
          const pgResult = await this.connection.query(sql, params)
          return pgResult.rows
        case 'mysql':
          const [mysqlRows] = await this.connection.execute(sql, params)
          return mysqlRows
        case 'mongodb':
          // MongoDB operations would be different
          throw new Error('MongoDB queries should use specific methods')
        default:
          throw new Error(`Unsupported database type: ${this.config.TYPE}`)
      }
    } catch (error) {
      console.error('Database query failed:', error)
      throw error
    }
  }

  // Transaction support
  async transaction(callback) {
    const client = await this.connection.connect()
    
    try {
      await client.query('BEGIN')
      const result = await callback(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
}

export default DatabaseConfig

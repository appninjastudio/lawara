// Database Connection Pool for SQL Server
// Uses connection pooling for optimal performance

import { config } from './config';

// Database connection interface
interface DbConnection {
  query: <T>(sql: string, params?: unknown[]) => Promise<T[]>;
  execute: (sql: string, params?: unknown[]) => Promise<{ affectedRows: number }>;
  transaction: <T>(fn: (conn: DbConnection) => Promise<T>) => Promise<T>;
}

// Connection pool configuration
interface PoolConfig {
  min: number;
  max: number;
  idleTimeoutMs: number;
  acquireTimeoutMs: number;
}

const poolConfig: PoolConfig = {
  min: 2,
  max: 10,
  idleTimeoutMs: 30000,
  acquireTimeoutMs: 30000,
};

// Mock database implementation
// Replace with actual mssql package implementation for production
class DatabasePool {
  private config: typeof config.database;
  private poolConfig: PoolConfig;
  private isConnected: boolean = false;

  constructor(dbConfig: typeof config.database, poolCfg: PoolConfig) {
    this.config = dbConfig;
    this.poolConfig = poolCfg;
  }

  async connect(): Promise<void> {
    // In production, use:
    // import sql from 'mssql';
    // await sql.connect({
    //   server: this.config.host,
    //   port: this.config.port,
    //   database: this.config.database,
    //   user: this.config.user,
    //   password: this.config.password,
    //   options: this.config.options,
    //   pool: this.poolConfig,
    // });
    
    console.log('Database connection pool initialized');
    this.isConnected = true;
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    console.log('Database connection pool closed');
  }

  async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    // In production, execute actual SQL query
    // const result = await sql.query(sql, params);
    // return result.recordset;

    console.log('Executing query:', sql, params);
    return [] as T[];
  }

  async execute(sql: string, params?: unknown[]): Promise<{ affectedRows: number }> {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    // In production, execute actual SQL
    // const result = await sql.query(sql, params);
    // return { affectedRows: result.rowsAffected[0] };

    console.log('Executing:', sql, params);
    return { affectedRows: 0 };
  }

  async transaction<T>(fn: (conn: DbConnection) => Promise<T>): Promise<T> {
    // In production:
    // const transaction = new sql.Transaction();
    // await transaction.begin();
    // try {
    //   const result = await fn(transaction);
    //   await transaction.commit();
    //   return result;
    // } catch (error) {
    //   await transaction.rollback();
    //   throw error;
    // }

    return fn(this);
  }

  get connected(): boolean {
    return this.isConnected;
  }
}

// Singleton database pool
let dbPool: DatabasePool | null = null;

export async function getDb(): Promise<DatabasePool> {
  if (!dbPool) {
    dbPool = new DatabasePool(config.database, poolConfig);
    await dbPool.connect();
  }
  return dbPool;
}

export async function closeDb(): Promise<void> {
  if (dbPool) {
    await dbPool.disconnect();
    dbPool = null;
  }
}

// Query builder helpers
export function buildWhereClause(filters: Record<string, unknown>): { sql: string; params: unknown[] } {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      conditions.push(`${key} = @p${paramIndex}`);
      params.push(value);
      paramIndex++;
    }
  }

  return {
    sql: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
  };
}

export function buildPaginationClause(page: number, pageSize: number): string {
  const offset = (page - 1) * pageSize;
  return `OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;
}

// Common queries
export const queries = {
  cases: {
    getAll: `
      SELECT c.*, d.FullName as DebtorName, cr.Name as CreditorName, co.Name as CourtName
      FROM Cases c
      LEFT JOIN Debtors d ON c.DebtorId = d.Id
      LEFT JOIN Creditors cr ON c.CreditorId = cr.Id
      LEFT JOIN Courts co ON c.CourtId = co.Id
    `,
    getById: `
      SELECT c.*, d.FullName as DebtorName, cr.Name as CreditorName, co.Name as CourtName
      FROM Cases c
      LEFT JOIN Debtors d ON c.DebtorId = d.Id
      LEFT JOIN Creditors cr ON c.CreditorId = cr.Id
      LEFT JOIN Courts co ON c.CourtId = co.Id
      WHERE c.Id = @p1
    `,
    insert: `
      INSERT INTO Cases (CaseNumber, FoyNumber, DebtorId, CreditorId, CourtId, PrincipalAmount, InterestAmount, TotalAmount, CaseType, Status, OpenDate, CreatedBy)
      OUTPUT INSERTED.*
      VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, @p12)
    `,
    update: `
      UPDATE Cases SET
        PrincipalAmount = @p2,
        InterestAmount = @p3,
        TotalAmount = @p4,
        Status = @p5,
        UpdatedAt = GETDATE()
      WHERE Id = @p1
    `,
  },
  
  commitments: {
    getByCase: `
      SELECT * FROM Commitments WHERE CaseId = @p1 ORDER BY CreatedAt DESC
    `,
    getInstallments: `
      SELECT * FROM CommitmentInstallments WHERE CommitmentId = @p1 ORDER BY InstallmentNumber
    `,
    checkViolation: `
      SELECT c.* FROM Commitments c
      INNER JOIN CommitmentInstallments ci ON c.Id = ci.CommitmentId
      WHERE ci.Status = 'pending' AND ci.DueDate < GETDATE() AND c.Status = 'active'
    `,
  },

  uyapLogs: {
    insert: `
      INSERT INTO UyapLogs (CaseId, Action, RequestXml, ResponseXml, Status, ErrorMessage, Duration, CreatedBy)
      OUTPUT INSERTED.*
      VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8)
    `,
    getRecent: `
      SELECT TOP 100 * FROM UyapLogs ORDER BY CreatedAt DESC
    `,
  },
};

export type { DbConnection, PoolConfig };

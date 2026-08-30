import { Injectable, Inject, Logger } from '@nestjs/common';
import { SpanishJetcostMysqlClient } from '../../database/spanish-jetcost-mysql.client';
import { CreateUsaMarkupDto } from './dto/create-usa-markup.dto';
import { UpdateUsaMarkupDto } from './dto/update-usa-markup.dto';

export interface UsaMarkupRow {
  Id: number;
  source: string;
  destination: string;
  airline: string;
  startDate: string;
  endDate: string;
  markupType: string;
  cabinClass: string;
  journeyType: string;
  adultAmount: number;
  childAmount: number;
  infantAmount: number;
  userId: string | null;
  userName: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Mappings between DB codes and Domain values
const MARKUP_TYPE_MAP_TO_DB: Record<string, string> = {
  'percentage': '0',
  'fixed': '1',
  'replace': '2'
};

const MARKUP_TYPE_MAP_FROM_DB: Record<string, 'percentage' | 'fixed' | 'replace'> = {
  '0': 'percentage',
  '1': 'fixed',
  '2': 'replace',
  'percentage': 'percentage',
  'fixed': 'fixed',
  'replace': 'replace'
};

const CABIN_CLASS_MAP_TO_DB: Record<string, string> = {
  'Economy': '0',
  'Premium Economy': '1',
  'Business': '2',
  'First': '3'
};

const CABIN_CLASS_MAP_FROM_DB: Record<string, string> = {
  '0': 'Economy',
  '1': 'Premium Economy',
  '2': 'Business',
  '3': 'First',
  'Economy': 'Economy',
  'Premium Economy': 'Premium Economy',
  'Business': 'Business',
  'First': 'First'
};

const JOURNEY_TYPE_MAP_TO_DB: Record<string, string> = {
  'OneWay': '0',
  'Return': '1'
};

const JOURNEY_TYPE_MAP_FROM_DB: Record<string, string> = {
  '0': 'OneWay',
  '1': 'Return',
  'OneWay': 'OneWay',
  'Return': 'Return'
};

function mapRowFromDb(row: any): UsaMarkupRow {
  if (!row) return row;
  return {
    ...row,
    markupType: MARKUP_TYPE_MAP_FROM_DB[row.markupType] ?? 'fixed',
    cabinClass: CABIN_CLASS_MAP_FROM_DB[row.cabinClass] ?? 'Economy',
    journeyType: JOURNEY_TYPE_MAP_FROM_DB[row.journeyType] ?? 'Return',
  };
}

@Injectable()
export class UsaMarkupRepository {
  private readonly logger = new Logger(UsaMarkupRepository.name);

  constructor(private readonly db: SpanishJetcostMysqlClient) {}

  async findAll(page = 1, limit = 10): Promise<{ data: UsaMarkupRow[]; total: number }> {
    const offset = (page - 1) * limit;

    try {
      const dbName = process.env.MYSQL_SPANISH_JETCOST_DATABASE || 'spanish_jetcost';
      const countRows = await this.db.query<{ total: number }>(
        `SELECT COUNT(*) as total FROM \`${dbName}\`.usa_table WHERE deleted_at IS NULL`,
        [],
      );
      const total = Number(countRows[0]?.total ?? 0);

      // Order by start date descending (latest dates first), falling back to Id DESC
      const data = await this.db.query<any>(
        `SELECT * FROM \`${dbName}\`.usa_table 
         WHERE deleted_at IS NULL 
         ORDER BY 
           IF(startDate LIKE '%-%', STR_TO_DATE(startDate, '%Y-%m-%d'), STR_TO_DATE(startDate, '%m/%d/%Y')) DESC, 
           Id DESC 
         LIMIT ? OFFSET ?`,
        [limit, offset],
      );

      return { data: data.map(mapRowFromDb), total };
    } catch (error: any) {
      this.logger.error(`[findAll] failed to query usa_table in ${process.env.MYSQL_SPANISH_JETCOST_DATABASE || 'spanish_jetcost'}: ${error.message}`, error.stack);
      if (error?.code === 'ER_NO_SUCH_TABLE') {
        throw new Error(`usa_table does not exist in the database. Please create it manually.`);
      }
      throw error;
    }
  }

  async findById(id: number): Promise<UsaMarkupRow | null> {
    try {
      const dbName = process.env.MYSQL_SPANISH_JETCOST_DATABASE || 'spanish_jetcost';
      const rows = await this.db.query<any>(
        `SELECT * FROM \`${dbName}\`.usa_table WHERE Id = ? AND deleted_at IS NULL LIMIT 1`,
        [id],
      );
      return rows[0] ? mapRowFromDb(rows[0]) : null;
    } catch (error: any) {
      this.logger.error(`[findById] failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async create(dto: CreateUsaMarkupDto): Promise<{ insertId: number }> {
    try {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const dbName = process.env.MYSQL_SPANISH_JETCOST_DATABASE || 'spanish_jetcost';
      
      const dbMarkupType = MARKUP_TYPE_MAP_TO_DB[dto.markupType] ?? dto.markupType;
      const dbCabinClass = CABIN_CLASS_MAP_TO_DB[dto.cabinClass] ?? dto.cabinClass;
      const dbJourneyType = JOURNEY_TYPE_MAP_TO_DB[dto.journeyType] ?? dto.journeyType;

      const insertId = await this.db.insert(
        `INSERT INTO \`${dbName}\`.usa_table
          (source, destination, airline, startDate, endDate, markupType, cabinClass, journeyType,
           adultAmount, childAmount, infantAmount, userId, userName, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dto.source,
          dto.destination,
          dto.airline,
          dto.startDate,
          dto.endDate,
          dbMarkupType,
          dbCabinClass,
          dbJourneyType,
          dto.adultAmount,
          dto.childAmount,
          dto.infantAmount,
          dto.userId ?? null,
          dto.userName ?? null,
          now,
          now,
        ],
      );
      return { insertId };
    } catch (error: any) {
      this.logger.error(`[create] failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: number, dto: UpdateUsaMarkupDto): Promise<void> {
    try {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const fields: string[] = [];
      const values: any[] = [];

      const mappable: (keyof UpdateUsaMarkupDto)[] = [
        'source', 'destination', 'airline', 'startDate', 'endDate',
        'markupType', 'cabinClass', 'journeyType',
        'adultAmount', 'childAmount', 'infantAmount',
        'userId', 'userName',
      ];

      for (const key of mappable) {
        if (dto[key] !== undefined) {
          fields.push(`${key} = ?`);
          let val = dto[key];
          if (key === 'markupType' && typeof val === 'string') {
            val = MARKUP_TYPE_MAP_TO_DB[val] ?? val;
          } else if (key === 'cabinClass' && typeof val === 'string') {
            val = CABIN_CLASS_MAP_TO_DB[val] ?? val;
          } else if (key === 'journeyType' && typeof val === 'string') {
            val = JOURNEY_TYPE_MAP_TO_DB[val] ?? val;
          }
          values.push(val);
        }
      }

      if (fields.length === 0) return;

      fields.push('updated_at = ?');
      values.push(now);
      values.push(id);

      const dbName = process.env.MYSQL_SPANISH_JETCOST_DATABASE || 'spanish_jetcost';
      await this.db.query(
        `UPDATE \`${dbName}\`.usa_table SET ${fields.join(', ')} WHERE Id = ?`,
        values,
      );
    } catch (error: any) {
      this.logger.error(`[update] failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async softDelete(id: number): Promise<void> {
    try {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const dbName = process.env.MYSQL_SPANISH_JETCOST_DATABASE || 'spanish_jetcost';
      await this.db.query(
        `UPDATE \`${dbName}\`.usa_table SET deleted_at = ?, updated_at = ? WHERE Id = ?`,
        [now, now, id],
      );
    } catch (error: any) {
      this.logger.error(`[softDelete] failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find active markup rules matching a flight search.
   * Matching criteria: source, destination, airline, cabinClass, journeyType,
   * and the search departure date falls within [startDate, endDate].
   */
  async findMatchingRules(
    origin: string,
    destination: string,
    cabinClass: string,
    journeyType: string,
    searchDate: string,
  ): Promise<UsaMarkupRow[]> {
    this.logger.debug(
      `[findMatchingRules] origin=${origin} dest=${destination} cabin=${cabinClass} journey=${journeyType} date=${searchDate}`,
    );

    try {
      const dbName = process.env.MYSQL_SPANISH_JETCOST_DATABASE || 'spanish_jetcost';
      const dbCabin = CABIN_CLASS_MAP_TO_DB[cabinClass] ?? cabinClass;
      const dbJourney = JOURNEY_TYPE_MAP_TO_DB[journeyType] ?? journeyType;

      const rows = await this.db.query<any>(
        `SELECT * FROM \`${dbName}\`.usa_table
         WHERE deleted_at IS NULL
           AND (source = '' OR source = ? OR source = '*')
           AND (destination = '' OR destination = ? OR destination = '*')
           AND (? = '' OR cabinClass = '' OR cabinClass = ? OR cabinClass = ? OR cabinClass = '*')
           AND (? = '' OR journeyType = '' OR journeyType = ? OR journeyType = ? OR journeyType = '*')
           AND IF(startDate LIKE '%-%', STR_TO_DATE(startDate, '%Y-%m-%d'), STR_TO_DATE(startDate, '%m/%d/%Y')) <= STR_TO_DATE(?, '%Y-%m-%d')
           AND IF(endDate LIKE '%-%', STR_TO_DATE(endDate, '%Y-%m-%d'), STR_TO_DATE(endDate, '%m/%d/%Y')) >= STR_TO_DATE(?, '%Y-%m-%d')
         ORDER BY Id ASC`,
        [
          origin.toUpperCase(),
          destination.toUpperCase(),
          cabinClass,
          cabinClass,
          dbCabin,
          journeyType,
          journeyType,
          dbJourney,
          searchDate,
          searchDate,
        ],
      );

      this.logger.log(`[findMatchingRules] Found ${rows.length} rule(s)`);
      return rows.map(mapRowFromDb);
    } catch (error: any) {
      this.logger.error(`[findMatchingRules] failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getRunningStatus(): Promise<string> {
    try {
      const dbName = process.env.MYSQL_SPANISH_JETCOST_DATABASE || 'spanish_jetcost';
      const rows = await this.db.query<any>(
        `SELECT running_status FROM \`${dbName}\`.api_status_ezee LIMIT 1`,
      );
      return rows[0]?.running_status || 'Stop';
    } catch (error: any) {
      this.logger.error(`[getRunningStatus] failed: ${error.message}`, error.stack);
      return 'Stop';
    }
  }

  async updateRunningStatus(status: string): Promise<void> {
    try {
      const dbName = process.env.MYSQL_SPANISH_JETCOST_DATABASE || 'spanish_jetcost';
      const rows = await this.db.query<any>(
        `SELECT id FROM \`${dbName}\`.api_status_ezee LIMIT 1`
      );
      if (rows.length > 0) {
        await this.db.query(
          `UPDATE \`${dbName}\`.api_status_ezee SET running_status = ? WHERE id = ?`,
          [status, rows[0].id]
        );
      } else {
        await this.db.insert(
          `INSERT INTO \`${dbName}\`.api_status_ezee (running_status) VALUES (?)`,
          [status]
        );
      }
    } catch (error: any) {
      this.logger.error(`[updateRunningStatus] failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}

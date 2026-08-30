const fs = require('fs');
const path = require('path');

const repoPath = path.join(__dirname, '../src/modules/admin/admin.repository.ts');
let content = fs.readFileSync(repoPath, 'utf8');

// Replace imports
content = content.replace(
  'import { PostgresClient } from "../../database/postgres.client";',
  `import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";\nimport { DataSource, Repository, In } from "typeorm";\nimport { User } from "../../user/entities/user.entity";\nimport { Role, Permission, AdminUser, SystemSetting, AuditLog, AdminSession, Alert, UserRoleEntity } from "./entities/admin.entity";`
);

// Replace constructor
content = content.replace(
  'constructor(private readonly db: PostgresClient) {}',
  `constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission) private readonly permRepo: Repository<Permission>,
    @InjectRepository(AdminUser) private readonly adminUserRepo: Repository<AdminUser>,
    @InjectRepository(SystemSetting) private readonly settingRepo: Repository<SystemSetting>,
    @InjectRepository(AuditLog) private readonly auditRepo: Repository<AuditLog>,
    @InjectRepository(AdminSession) private readonly sessionRepo: Repository<AdminSession>,
    @InjectRepository(Alert) private readonly alertRepo: Repository<Alert>,
    @InjectRepository(UserRoleEntity) private readonly userRoleRepo: Repository<UserRoleEntity>
  ) {}`
);

// Replace this.db.query with this.dataSource.query
content = content.replace(/this\.db\.query/g, 'this.dataSource.query');

// Replace this.db.queryOne with a custom helper
const helper = `
  private async queryOne<T>(query: string, params?: any[]): Promise<T | null> {
    const res = await this.dataSource.query(query, params);
    return res && res.length > 0 ? res[0] : null;
  }
`;
content = content.replace(/getAdminByUserId\(userId: string\) {/, helper + '\n  getAdminByUserId(userId: string) {');
content = content.replace(/this\.db\.queryOne/g, 'this.queryOne');

// Replace Postgres $1, $2 with MySQL ?
// This is tricky because we need to preserve strings, but a simple regex might work for these queries.
content = content.replace(/\$\d+/g, '?');

// Replace Postgres casts
content = content.replace(/::text/g, ''); // often just remove it, MySQL implicitly casts or we use CAST( AS CHAR)
// For ::float8, we can just remove it or use CAST(x as DECIMAL(10,2))
content = content.replace(/::float8/g, '');
content = content.replace(/::jsonb/g, '');
content = content.replace(/::date/g, '');

// Replace JSON access
// inq.flight_snapshot->>'totalCost' -> JSON_UNQUOTE(JSON_EXTRACT(inq.flight_snapshot, '$.totalCost'))
content = content.replace(/([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)->>'([^']+)'/g, "JSON_UNQUOTE(JSON_EXTRACT($1.$2, '$.$3'))");

// Replace RETURNING id
// MySQL doesn't support RETURNING. For inserts, we should use TypeORM Repositories where possible.
// For now, I will let the script replace what it can, and I'll manually fix the rest.

fs.writeFileSync(repoPath, content);
console.log('Done replacing strings in admin.repository.ts');

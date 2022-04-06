import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as config from 'config'
import { join } from 'path';


const dbConfig = config.get('db')

const typeOrmConfig: TypeOrmModuleOptions = {
    type: process.env.DB_TYPE || dbConfig.type,
    host: process.env.DB_HOST || dbConfig.host,
    port: +process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || dbConfig.username,
    password: process.env.DB_PASSWORD || dbConfig.password,
    database: process.env.DB_NAME || dbConfig.database,
    entities: [join(__dirname, '**', '*.entity.{ts,js}')],
    migrationsRun: false,
    logging: true,
    migrationsTableName: "migration",
    migrations: [join(__dirname, '**', '*.entity.{ts,js}')],
    synchronize: true,
    autoLoadEntities: false,
    cli: {
        migrationsDir: '../migration'
    }
}

export = typeOrmConfig
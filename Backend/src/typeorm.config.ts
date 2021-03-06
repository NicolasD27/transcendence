import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as config from 'config'
import { join } from 'path';


const dbConfig = config.get('db')

const typeOrmConfig: TypeOrmModuleOptions = {
    type: process.env.DB_TYPE || dbConfig.type,
    host: process.env.POSTGRES_HOST || dbConfig.host,
    port: +process.env.POSTGRES_PORT || 5432,
    username: process.env.POSTGRES_USERNAME || dbConfig.username,
    password: process.env.POSTGRES_PASSWORD || dbConfig.password,
    database: process.env.POSTGRES_NAME || dbConfig.database,
    entities: [join(__dirname, '**', '*.entity.{ts,js}')],
    migrationsRun: false,
    logging: false,
    migrationsTableName: "migration",
    migrations: [join(__dirname, '**', '*.entity.{ts,js}')],
    synchronize: true,
    autoLoadEntities: true,
    cli: {
        migrationsDir: '../migration'
    }
}

export = typeOrmConfig
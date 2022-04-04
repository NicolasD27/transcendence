import { TypeOrmModuleOptions } from "@nestjs/typeorm";


const host = process.env.DB_HOST

const typeOrmConfig: TypeOrmModuleOptions = {
    type: "postgres",
    host: "postgres-db",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "transcendence",
    entities: [__dirname + '/Back-end/**/*.entity.ts', __dirname + '/Back-end/**/*.entity.js'],
    migrationsRun: true,
    logging: true,
    migrationsTableName: "migration",
    migrations: [__dirname + '/Back-end/migration/**/*.ts', __dirname + '/Back-end/migration/**/*.js'],
    synchronize: true,
    cli: {
        migrationsDir: 'src/Back-end/migration'
    }
}

export = typeOrmConfig
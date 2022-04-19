import {
    Controller,
    Get,
    Param,
    UseInterceptors,
    ClassSerializerInterceptor,
    StreamableFile,
    Res,
    ParseIntPipe,
    UseGuards,
  } from '@nestjs/common';
  import { Readable } from 'stream';
  import { Response } from 'express';
import DatabaseFilesService from 'src/user/service/database-file.service';
import { TwoFactorGuard } from 'src/guards/two-factor.guard';
   
  @Controller('database-files')
  @UseInterceptors(ClassSerializerInterceptor)
  export default class DatabaseFilesController {
    constructor(
      private readonly databaseFilesService: DatabaseFilesService
    ) {}
   
    @UseGuards(TwoFactorGuard)
    @Get(':id')
    async getDatabaseFileById(@Param('id', ParseIntPipe) id: number, @Res({ passthrough: true }) response: Response) {
      const file = await this.databaseFilesService.getFileById(id);
   
      const stream = Readable.from(file.data);
   
      response.set({
        'Content-Disposition': `inline; filename="${file.filename}"`,
        'Content-Type': 'image'
      })
   
      return new StreamableFile(stream);
    }
  }
import { Module } from '@nestjs/common';
import { ApiModule, type ApiImplementations } from '../generated/openapi-server';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthApiService } from './openapi/health-api.service';

const apiImplementations: ApiImplementations = {
  healthApi: HealthApiService,
  academicsApi: undefined,
  attendanceApi: undefined,
  auditApi: undefined,
  authApi: undefined,
  examsApi: undefined,
  feesApi: undefined,
  meApi: undefined,
  rolesApi: undefined,
  studentsApi: undefined,
  timetableApi: undefined,
  usersApi: undefined
};

@Module({
  imports: [ApiModule.forRoot({ apiImplementations })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

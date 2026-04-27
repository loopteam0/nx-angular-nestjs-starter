import { Module } from '@nestjs/common';
import { ApiModule, type ApiImplementations } from '../generated/openapi-server';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/* TODO Implement the API implementations
  Details:
 Implement the API implementations and replace the empty objects with the actual implementations of the APIs.
 The `apiImplementations` object should contain the actual implementations of the APIs defined in the OpenAPI
 specification. Each property of the `apiImplementations` object corresponds to a specific API, and its value
 should be an instance of the class that implements the API's functionality. For example, if you have a `HealthApi`
class that implements the health check API, you would replace `healthApi: {} as any` with `healthApi: new HealthApi()`.
Make sure to implement all the necessary APIs and provide their implementations in this object to ensure that your application functions correctly.
*/

const apiImplementations: ApiImplementations = {
  healthApi: {} as any,
  auditApi: {} as any,
  authApi: {} as any,
  billingApi: {} as any,
  evaluationsApi: {} as any,
  meApi: {} as any,
  membersApi: {} as any,
  platformApi: {} as any,
  portalApi: {} as any,
  presenceApi: {} as any,
  rolesApi: {} as any,
  scheduleApi: {} as any,
  structureApi: {} as any,
  usersApi: {} as any
};

@Module({
  imports: [ApiModule.forRoot({ apiImplementations })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

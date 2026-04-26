import { Injectable } from '@nestjs/common';
import type { Request } from 'express';

import { HealthApi } from '../../generated/openapi-server/api';
import type { HealthResponse } from '../../generated/openapi-server/models';

@Injectable()
export class HealthApiService extends HealthApi {
  override getHealth(_request: Request): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}

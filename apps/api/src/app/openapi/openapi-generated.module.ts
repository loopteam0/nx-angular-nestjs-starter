import { Module, type Type } from '@nestjs/common';

// Generated output lives here after: nx run api-openapi:generate-nest-server-stub
// We keep this wrapper module hand-written so regeneration never overwrites app wiring.
import * as generated from '../../generated/openapi-server';

function isController(value: unknown): value is Type<unknown> {
  return typeof value === 'function' && /Controller$/.test((value as any).name);
}

const controllers = Object.values(generated).filter(isController) as Type<unknown>[];

@Module({
  controllers,
})
export class OpenApiGeneratedModule {}

import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ContestGateway } from './contest.gateway';

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [ContestGateway],
  exports: [ContestGateway],
})
export class GatewayModule {}

import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('System')
@Controller()
export class AppController {
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Application is operational' })
  getHealth() {
    return {
      status: 'ok',
      service: 'Olympido Backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}

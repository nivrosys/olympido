import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PresignUploadDto } from './dto/presign-upload.dto';
import { FilePayload, UploadService } from './upload.service';

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image or PDF document (max 10MB)',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload an image, diagram, or PDF document' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file format or file size exceeded' })
  async uploadFile(@UploadedFile() file: FilePayload) {
    return this.uploadService.handleDirectUpload(file);
  }

  @Post('presign')
  @ApiOperation({ summary: 'Generate a pre-signed upload URL for direct client storage upload' })
  @ApiResponse({ status: 201, description: 'Presigned upload URL created' })
  async presign(@Body() dto: PresignUploadDto) {
    return this.uploadService.generatePresignedUrl(dto);
  }
}

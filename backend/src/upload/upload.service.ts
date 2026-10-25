import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PresignUploadDto } from './dto/presign-upload.dto';

export class FilePayload {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir: string;
  private readonly appUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = path.resolve(process.cwd(), 'uploads');
    const port = this.configService.get<number>('PORT', 4000);
    this.appUrl = `http://localhost:${port}`;

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async handleDirectUpload(file: FilePayload) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.pdf'];

    if (!allowedExts.includes(ext)) {
      throw new BadRequestException(
        `File extension '${ext}' is not allowed. Supported: ${allowedExts.join(', ')}`,
      );
    }

    const uniqueName = `${uuidv4()}${ext}`;
    const destinationPath = path.join(this.uploadDir, uniqueName);

    await fs.promises.writeFile(destinationPath, file.buffer);

    const publicUrl = `${this.appUrl}/uploads/${uniqueName}`;
    this.logger.log(`File uploaded: ${file.originalname} -> ${publicUrl} (${file.size} bytes)`);

    return {
      url: publicUrl,
      fileName: uniqueName,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  async generatePresignedUrl(dto: PresignUploadDto) {
    const ext = path.extname(dto.fileName).toLowerCase();
    const key = `assets/${uuidv4()}${ext}`;

    // Return URL structure
    const uploadUrl = `${this.appUrl}/api/v1/upload`;
    const downloadUrl = `${this.appUrl}/uploads/${path.basename(key)}`;

    return {
      uploadUrl,
      downloadUrl,
      key,
      expiresInSeconds: 900, // 15 minutes
    };
  }
}

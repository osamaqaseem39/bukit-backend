import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { extname, join } from 'path';
import { randomBytes } from 'crypto';

function editFileName(
  _req: any,
  file: { originalname: string },
  callback: (error: Error | null, filename: string) => void,
) {
  const name = randomBytes(16).toString('hex');
  const fileExtName = extname(file.originalname);
  callback(null, `${name}${fileExtName}`);
}

// On Vercel/serverless the filesystem is read-only; we cannot mkdir `/uploads`.
// Use in-memory storage there, and keep disk storage for local/dev.
const isServerlessReadOnlyFs = !!process.env.VERCEL;

const uploadStorage = isServerlessReadOnlyFs
  ? memoryStorage()
  : diskStorage({
      destination: join(process.cwd(), 'uploads'),
      filename: editFileName,
    });

@Controller('auth')
export class UploadController {
  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('file', {
      storage: uploadStorage,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  uploadImage(@UploadedFile() file: { filename: string; size: number; mimetype: string }) {
    return {
      filename: file.filename,
      url: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}


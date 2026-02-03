import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomBytes } from 'crypto';

function editFileName(_req: any, file: Express.Multer.File, callback: any) {
  const name = randomBytes(16).toString('hex');
  const fileExtName = extname(file.originalname);
  callback(null, `${name}${fileExtName}`);
}

@Controller('auth')
export class UploadController {
  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: editFileName,
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      url: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}


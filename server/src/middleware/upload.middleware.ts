import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// 업로드 디렉토리 생성
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 파일 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 파일명 중복 방지를 위해 타임스탬프 추가
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// 파일 필터링
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.h5') {
    return cb(new Error('.h5 형식의 파일만 업로드 가능합니다.'));
  }
  cb(null, true);
};

// 파일 크기 제한 (50MB)
const limits = {
  fileSize: 50 * 1024 * 1024,
};

// Multer 미들웨어 설정
export const upload = multer({
  storage,
  fileFilter,
  limits,
}); 
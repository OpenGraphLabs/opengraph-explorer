import express, { Router } from 'express';
import { convertModel } from '../controllers/model.controller';
import { upload } from '../middleware/upload.middleware';

const router: Router = express.Router();

// .h5 파일 업로드 및 파싱
// @ts-ignore: multer와 express 타입 충돌 문제 무시
router.post('/convert', upload.single('model') as any, convertModel);

export { router as modelRoutes };
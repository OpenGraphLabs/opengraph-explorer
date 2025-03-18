import express, { Router } from 'express';
import { uploadModel, getModels, getModelById } from '../controllers/model.controller';
import { upload } from '../middleware/upload.middleware';

const router: Router = express.Router();

// .h5 파일 업로드 및 파싱
// @ts-ignore: multer와 express 타입 충돌 문제 무시
router.post('/upload', upload.single('model') as any, uploadModel);

// 모든 모델 가져오기
router.get('/', getModels);

// ID로 특정 모델 가져오기
router.get('/:id', getModelById);

export { router as modelRoutes };
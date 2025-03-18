import { Request, Response } from 'express';
import { parseModelFile } from '../services/model.service';
import path from 'path';

// Express의 Request 타입을 확장해 multer 파일 속성 추가
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// 모델 업로드 및 파싱
export const uploadModel = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '파일이 업로드되지 않았습니다.' });
    }

    // .h5 파일 형식 확인
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    if (fileExt !== '.h5') {
      return res.status(400).json({ message: '.h5 형식의 파일만 업로드 가능합니다.' });
    }

    // 모델 파일 파싱
    const modelData = await parseModelFile(req.file.path);

    return res.status(201).json({
      message: '모델이 성공적으로 파싱되었습니다.',
      model: modelData
    });
  } catch (error) {
    console.error('모델 업로드 오류:', error);
    return res.status(500).json({ 
      message: '모델 파싱 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
};

// 모든 모델 가져오기
export const getModels = async (req: Request, res: Response) => {
  try {
    // 추후 데이터베이스 연동 예정
    return res.status(200).json({ 
      message: '모델 목록 조회 성공',
      models: [] 
    });
  } catch (error) {
    console.error('모델 조회 오류:', error);
    return res.status(500).json({ 
      message: '모델 목록 조회 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
};

// ID로 특정 모델 가져오기
export const getModelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // 추후 데이터베이스 연동 예정
    return res.status(200).json({ 
      message: '모델 상세 조회 성공',
      model: { id } 
    });
  } catch (error) {
    console.error('모델 상세 조회 오류:', error);
    return res.status(500).json({ 
      message: '모델 조회 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류' 
    });
  }
};
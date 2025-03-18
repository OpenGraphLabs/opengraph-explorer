import { Request, Response } from 'express';
import path from 'path';
import {parseModelFile} from "../services/model.service";
import {Model} from "../models/model";

/**
 * .h5 파일을 Model 객체로 변환하는 컨트롤러
 * @param req 요청 객체 (업로드된 .h5 파일 포함)
 * @param res 응답 객체
 */
export const convertModel = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '파일이 업로드되지 않았습니다.' });
    }

    // .h5 파일 형식 확인
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    if (fileExt !== '.h5') {
      return res.status(400).json({ message: '.h5 형식의 파일만 업로드 가능합니다.' });
    }

    // TODO: 모델 변환 로직 구현
    // 1. .h5 파일을 파싱 & Model 객체 생성
    let model: Model = await parseModelFile(req.file.path);

    console.log(model);

    // 임시 응답
    model = {
      layerInDimensions: [1, 2, 3],
      layerOutDimensions: [3, 2, 1],
      weightsMagnitudes: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
      weightsSigns: [[0, 1, 0], [1, 0, 1], [0, 1, 0]],
      biasesMagnitudes: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
      biasesSigns: [[0, 1, 0], [1, 0, 1], [0, 1, 0]],
      scale: 2
    }

    console.log('default model', model);

    // TODO: 2. Model 객체 응답으로 전달
    return res.json(model);

  } catch (error) {
    console.error('모델 변환 오류:', error);
    return res.status(500).json({ 
      message: '모델 변환 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
};

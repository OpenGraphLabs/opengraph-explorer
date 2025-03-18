import * as tf from '@tensorflow/tfjs-node';
import fs from 'fs';
import path from 'path';

interface ModelMetadata {
  name: string;
  description?: string;
  version: string;
  inputShape: number[];
  outputShape: number[];
  layers: any[];
  type: string;
  size: number;
  createdAt: string;
}

/**
 * .h5 파일을 파싱하여 모델 메타데이터를 추출합니다.
 * @param filePath 업로드된 .h5 파일 경로
 * @returns 파싱된 모델 메타데이터
 */
export const parseModelFile = async (filePath: string): Promise<ModelMetadata> => {
  try {
    // 파일 크기 구하기
    const stats = fs.statSync(filePath);
    const fileSizeInBytes = stats.size;
    const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

    // TensorFlow.js를 사용하여 .h5 파일 로드
    const model = await tf.loadLayersModel(`file://${filePath}`);
    
    // 모델 구조 확인
    const layers = model.layers.map((layer: any) => ({
      name: layer.name,
      className: layer.getClassName(),
      config: layer.getConfig(),
      inputShape: layer.inputShape,
      outputShape: layer.outputShape,
    }));

    // 모델 입력 및 출력 형태 파악
    const inputShape = model.inputs[0].shape;
    const outputShape = model.outputs[0].shape;
    
    // 파일 이름에서 모델 이름 추출
    const fileName = path.basename(filePath, '.h5');

    // 모델 메타데이터 구성
    const modelMetadata: ModelMetadata = {
      name: fileName,
      version: '1.0.0',
      inputShape: Array.from(inputShape).filter((dim) => dim !== null) as number[],
      outputShape: Array.from(outputShape).filter((dim) => dim !== null) as number[],
      layers,
      type: 'keras',
      size: Number(fileSizeInMB.toFixed(2)),
      createdAt: new Date().toISOString(),
    };

    return modelMetadata;
  } catch (error) {
    console.error('모델 파싱 오류:', error);
    throw new Error('모델 파일을 파싱할 수 없습니다. 올바른 .h5 파일인지 확인하세요.');
  }
}; 
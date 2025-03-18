import * as tf from '@tensorflow/tfjs-node';
import path from 'path';
import { Model } from '../models/model';

/**
 * .h5 파일을 파싱하여 모델 메타데이터와 Sui 블록체인용 모델 데이터를 추출합니다.
 * @param filePath 업로드된 .h5 파일 경로
 * @returns 파싱된 HuggingFace3.0 모델 데이터
 */
export const parseModelFile = async (filePath: string): Promise<Model> => {
  // TODO(준환): .h5 파일을 로드/파싱해서 HuggingFace3.0의 Model 객체로 변환해주세요.
  try {
    // TensorFlow.js를 사용하여 .h5 파일 로드
    const tfModel = await tf.loadLayersModel(`file://${filePath}`);
    
    // 모델 구조 확인
    const layers = tfModel.layers;

    // 파일 이름에서 모델 이름 추출
    const fileName = path.basename(filePath, '.h5');

    // Sui 블록체인용 모델 데이터 변환
    const layerInDimensions: number[] = [];
    const layerOutDimensions: number[] = [];
    const weightsMagnitudes: number[][] = [];
    const weightsSigns: number[][] = [];
    const biasesMagnitudes: number[][] = [];
    const biasesSigns: number[][] = [];
    
    // 기본 스케일 설정
    const scale = 2;
    
    // 레이어 정보 추출
    for (const layer of layers) {
      if (layer.getClassName() === 'Dense') {
        // 입력 및 출력 차원 추출
        const inputDim = (layer.input as any).shape.slice(-1)[0] || 0;
        const outputDim = (layer.output as any).shape.slice(-1)[0] || 0;
        
        // 입력 및 출력 차원 추가
        layerInDimensions.push(inputDim);
        layerOutDimensions.push(outputDim);
        
        // 가중치 및 바이어스 추출
        const weights = layer.getWeights();
        
        if (weights.length >= 1) {
          const layerWeights = weights[0];
          const weightValues = layerWeights.dataSync();
          
          // 가중치 부호와 크기 분리
          const weightMagnitudes: number[] = [];
          const weightSigns: number[] = [];
          
          for (let i = 0; i < weightValues.length; i++) {
            const value = weightValues[i];
            const absValue = Math.abs(value);
            // 크기는 고정 소수점으로 스케일링하여 정수로 변환
            weightMagnitudes.push(Math.round(absValue * (1 << scale)));
            // 부호는 음수면 1, 양수면 0
            weightSigns.push(value < 0 ? 1 : 0);
          }
          
          weightsMagnitudes.push(weightMagnitudes);
          weightsSigns.push(weightSigns);
        }
        
        if (weights.length >= 2) {
          const layerBiases = weights[1];
          const biasValues = layerBiases.dataSync();
          
          // 바이어스 부호와 크기 분리
          const biasMagnitudes: number[] = [];
          const biasSigns: number[] = [];
          
          for (let i = 0; i < biasValues.length; i++) {
            const value = biasValues[i];
            const absValue = Math.abs(value);
            // 크기는 고정 소수점으로 스케일링하여 정수로 변환
            biasMagnitudes.push(Math.round(absValue * (1 << scale)));
            // 부호는 음수면 1, 양수면 0
            biasSigns.push(value < 0 ? 1 : 0);
          }
          
          biasesMagnitudes.push(biasMagnitudes);
          biasesSigns.push(biasSigns);
        } else {
          // 바이어스가 없는 경우 빈 배열 추가
          biasesMagnitudes.push([]);
          biasesSigns.push([]);
        }
      }
    }
    
    // Sui 블록체인용 모델 데이터
    return {
      layerInDimensions,
      layerOutDimensions,
      weightsMagnitudes,
      weightsSigns,
      biasesMagnitudes,
      biasesSigns,
      scale
    };
  } catch (error) {
    console.error('모델 파싱 오류:', error);
    throw new Error('모델 파일을 파싱할 수 없습니다. 올바른 .h5 파일인지 확인하세요.');
  }
}; 
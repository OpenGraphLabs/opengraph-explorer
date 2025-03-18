import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { modelRoutes } from './routes/model.routes';

// 환경 변수 설정
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(helmet()); // 보안 관련 HTTP 헤더 설정
app.use(cors()); // CORS 허용
app.use(morgan('dev')); // HTTP 요청 로깅
app.use(express.json()); // JSON 본문 파싱
app.use(express.urlencoded({ extended: true })); // URL 인코딩 파싱

// 라우트 설정
app.use('/api/models', modelRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to HuggingFace 3.0 API' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});

export default app; 
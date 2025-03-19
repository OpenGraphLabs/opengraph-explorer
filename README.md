# HuggingFace 3.0

이 프로젝트는 Sui 블록체인 위에 AI 모델을 배포하는 HuggingFace 3.0 플랫폼입니다. Web3 시대의 HuggingFace를 목표로 합니다.

## 프로젝트 구조

- `client/`: React + TypeScript + Vite 기반의 프론트엔드 애플리케이션
- `server/`: Python + FastAPI 기반의 백엔드 서버

## 설치 및 실행

### 클라이언트 설치 및 실행

```bash
# 클라이언트 디렉토리로 이동
cd client

# 의존성 설치
npm install
# 또는
yarn install

# 개발 서버 실행
npm run dev
# 또는
yarn dev
```

### 서버 설치 및 실행 (Python 버전)

```bash
# 서버 디렉토리로 이동
cd server

# 가상 환경 생성 (선택 사항)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 또는
.\venv\Scripts\activate  # Windows

# 의존성 설치
pip install -r requirements.txt

# 서버 실행
python main.py
```

## API 문서

FastAPI 서버가 실행되면 다음 URL에서 API 문서를 확인할 수 있습니다:

- Swagger UI: http://localhost:3000/docs
- ReDoc: http://localhost:3000/redoc

## 주요 기능

- AI 모델 파일(.h5)을 업로드하고 Sui 블록체인에 배포할 수 있는 형식으로 변환
- 변환된 모델을 Sui 블록체인에 배포

## 기술 스택

- **프론트엔드**: React, TypeScript, Vite, TensorFlow.js
- **백엔드**: Python, FastAPI, TensorFlow
- **블록체인**: Sui

## 🌟 Overview

HuggingFace 3.0 is a decentralized platform that brings machine learning models to the Sui blockchain. Our platform enables users to upload, share, and execute ML models in a fully on-chain environment, creating a decentralized ecosystem for AI development and deployment.

By combining the power of blockchain technology with machine learning, we're building a future where AI models are transparent, accessible, and owned by the community.

## ✨ Key Features

- **On-chain Model Repository**: Upload and store ML models directly on the Sui blockchain
- **Decentralized Inference**: Execute model inference through Sui smart contracts
- **Model Discovery**: Browse, search, and filter models by various criteria
- **User Profiles**: Track your uploaded models, favorites, and activity
- **Wallet Integration**: Seamless connection with Sui wallets
- **Flexible Model Formats**: Supporting .json, .bin, and .h5 file formats with automatic conversion for on-chain storage

<!-- ## 🖼️ Screenshots

<div align="center">
  <img src="https://via.placeholder.com/800x450.png?text=Home+Page" alt="Home Page" width="800">
  <p><em>Home Page</em></p>
  
  <img src="https://via.placeholder.com/800x450.png?text=Models+Page" alt="Models Page" width="800">
  <p><em>Models Page</em></p>
  
  <img src="https://via.placeholder.com/800x450.png?text=Model+Detail" alt="Model Detail" width="800">
  <p><em>Model Detail Page</em></p>
</div> -->

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Vite, Radix UI
- **Blockchain**: Sui Network
- **Wallet Connection**: @mysten/dapp-kit
- **Styling**: CSS Modules
- **Package Management**: Yarn

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later)
- Yarn package manager
- A Sui wallet (like Sui Wallet browser extension)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/OpenGraphLabs/huggingface-3.0.git
   cd huggingface-3.0
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Start the development server:
   ```bash
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
yarn build
```

## 🔄 Workflow

1. **Connect Wallet**: Connect your Sui wallet to the platform
2. **Explore Models**: Browse through available models or search for specific ones
3. **Upload Models**: Share your ML models with the community (supporting .json, .bin, and .h5 formats with automatic conversion)
4. **Execute Inference**: Run models directly on the blockchain
5. **Track Activity**: Monitor your uploads, favorites, and interactions

## 🧩 Project Structure

```
huggingface-3.0/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Home.tsx
│   │   ├── Models.tsx
│   │   ├── ModelDetail.tsx
│   │   ├── UploadModel.tsx
│   │   └── Profile.tsx
│   ├── styles/          # CSS modules and global styles
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
├── package.json         # Dependencies and scripts
└── README.md            # Project documentation
```

## 🔮 Future Roadmap

- **Support for More Model Formats**: Expanding beyond current formats to include more complex model formats
- **Datasets**: Support for on-chain datasets
- **Spaces**: Interactive environments for model demonstration
- **Community Features**: Comments, ratings, and collaboration tools
- **Enhanced Inference**: Support for more model types and optimized performance
- **Governance**: Community-driven decision making for platform development

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is supported by OpenGraph Labs and is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Sui Network](https://sui.io/) for the blockchain infrastructure
- [HuggingFace](https://huggingface.co/) for inspiration
- [Radix UI](https://www.radix-ui.com/) for UI components
- All contributors and community members

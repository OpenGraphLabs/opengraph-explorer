# HuggingFace 3.0

Sui 블록체인 위에서 fully onchain AI 모델 업로드/추론을 위한 Web3 HuggingFace 프로젝트입니다.

## 프로젝트 구조

```
huggingface_3.0/
├── client/                  # React 클라이언트 (프론트엔드)
│   ├── src/                 # 소스 코드
│   │   ├── pages/           # 라우트 페이지
│   │   └── ...
│   ├── index.html
│   ├── package.json
│   └── ...
│
├── server/                  # Node.js 서버 (백엔드)
│   ├── src/                 # 소스 코드
│   │   ├── controllers/     # 컨트롤러 로직
│   │   ├── routes/          # API 라우트
│   │   ├── services/        # 비즈니스 로직 서비스
│   │   ├── middleware/      # 미들웨어
│   │   ├── models/          # 데이터 모델
│   │   └── utils/           # 유틸리티 함수
│   ├── package.json
│   └── ...
│
├── package.json             # 루트 패키지 (워크스페이스 설정)
└── ...
```

## 기술 스택

- **프론트엔드**: React, TypeScript, Vite
- **백엔드**: Node.js, Express, TypeScript
- **AI**: TensorFlow.js
- **블록체인**: Sui

## 설치 및 실행

### 전제 조건

- Node.js 16 이상
- Yarn 패키지 매니저

### 설치

1. 저장소 클론:

```bash
git clone https://github.com/yourusername/huggingface_3.0.git
cd huggingface_3.0
```

2. 의존성 설치:

```bash
yarn install
```

### 개발 서버 실행

동시에 클라이언트와 서버 모두 실행:

```bash
yarn dev
```

클라이언트만 실행:

```bash
yarn dev:client
```

서버만 실행:

```bash
yarn dev:server
```

### 빌드

```bash
yarn build
```

## 주요 기능

- .h5 파일을 입력으로 받아 AI 모델 객체로 파싱
- Sui 블록체인 위에 AI 모델 메타데이터 저장
- 온체인 AI 모델 추론 (Inference)

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

# HuggingFace 3.0 - AI Models on the Sui Blockchain

<div align="center">
  <img src="https://via.placeholder.com/200x200.png?text=HF3.0" alt="HuggingFace 3.0 Logo" width="200" height="200">
  <h3>The AI Community Building the Future</h3>
  <p>A fully on-chain machine learning model sharing and inference platform powered by Sui blockchain</p>
  
  <div>
    <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Sui-5A67D8?style=for-the-badge&logo=sui&logoColor=white" alt="Sui" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  </div>
</div>

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

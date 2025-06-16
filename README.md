# OpenGraph Explorer

<div align="center">
  <img src="./client/src/assets/logo/logo_name.png" alt="OpenGraph Explorer Logo" width="300" style="margin-bottom: 20px" />
  <h3>Bringing Transparency to AI through On-Chain Machine Learning</h3>
</div>

## SUI Overflow !!

Our Overflow Deck [Overflow, Decentralized Data Annotation Platform]: 
https://www.figma.com/deck/jz6NCLwVX3RazYHqBvoOnE/OpenGraph--Overflow2025--AI-?node-id=6-1055&t=ZetcuAb0izQp9lVz-0&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1

Vote! [AI Track - OpenGraph]
https://vote.sui.io/

Twitter :
https://x.com/opengraph_labs

Challenges Demo : 
https://explorer.opengraphlabs.xyz/challenges



## 🌟 Vision

OpenGraph Explorer is pioneering a new era of transparent and decentralized AI by bringing machine learning models fully on-chain. We're transforming the traditional "black box" nature of AI into a transparent, auditable, and community-owned ecosystem powered by the Sui blockchain.

Our platform allows developers to deploy ML models on-chain and execute inference operations with complete visibility - tracking every layer, every calculation, and every transformation directly on the blockchain. This creates an unprecedented level of transparency and trust in AI systems.

## ✨ Key Features

- **On-Chain Model Repository**: Deploy your ML models directly to the Sui blockchain
- **Transparent Layer-by-Layer Inference**: Witness and verify every step of the inference process
- **Real-Time Execution Tracking**: Monitor each layer's processing status as inference occurs
- **Blockchain Verification**: Every operation is recorded on-chain with transaction receipts
- **Visual Model Exploration**: Interactive UI for exploring model architecture and inference results
- **Multi-Format Support**: Compatible with various model formats with automatic conversion for on-chain deployment

## 🔍 Why On-Chain Machine Learning?

Traditional ML/AI systems suffer from opacity - users must trust black-box models without visibility into their operations. OpenGraph Explorer solves this by:

- **Complete Transparency**: Every model parameter and inference calculation is visible and verifiable on-chain
- **Auditability**: The entire model execution path can be audited by following on-chain transactions
- **Immutability**: Model architectures and parameters are immutably recorded on the blockchain
- **Decentralization**: No central authority controls model access or execution
- **Community Ownership**: Models become public goods that anyone can access, verify, and build upon

## 🖥️ Technology Stack

- **Frontend**: React, TypeScript, Vite, Radix UI
- **Blockchain**: Sui Network
- **Wallet Connection**: @mysten/dapp-kit
- **Visualization**: Custom layer-by-layer inference visualization
- **Styling**: CSS Modules, Framer Motion
- **Package Management**: Yarn/npm

## 🏗️ Architecture

OpenGraph Explorer breaks down complex ML models into layers and executes them sequentially on the Sui blockchain:

1. **Model Upload & Decomposition**: Models are decomposed into their constituent layers
2. **On-Chain Deployment**: Each layer is stored as an immutable object on the Sui blockchain
3. **Layer-by-Layer Execution**: Input vectors propagate through each layer with full transparency
4. **Transaction Verification**: Each layer execution generates a verifiable transaction record
5. **Real-Time Visualization**: The UI provides a visual representation of the entire process

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later)
- Yarn/npm package manager
- A Sui wallet (like Sui Wallet browser extension)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/OpenGraphLabs/opengraph-explorer.git
   cd opengraph-explorer
   ```

2. Install dependencies:
   ```bash
   yarn install
   # or
   npm install
   ```

3. Start the development server:
   ```bash
   yarn dev
   # or
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## 🔄 Workflow

1. **Connect Wallet**: Connect your Sui wallet to access the platform
2. **Explore Models**: Browse through available on-chain models
3. **Upload Models**: Deploy your ML models to the Sui blockchain
4. **Execute Inference**: Run transparent, layer-by-layer inference with any input
5. **Verify Results**: Follow each step of the execution with on-chain verification
6. **Analyze Outputs**: Examine final outputs and the entire execution path

## 🌐 Global Impact

OpenGraph Explorer is designed for the global AI community, enabling:

- **Researchers**: Verify model behaviors and compare execution patterns across models
- **Developers**: Build applications on top of trusted, transparent AI models
- **Auditors**: Analyze models for bias, security vulnerabilities, or unexpected behaviors
- **End Users**: Gain confidence in AI systems through unprecedented transparency

## 🔮 Future Roadmap

- **Model Composition**: Combine multiple on-chain models to create new architectures
- **Federated Training**: Distribute model training across the network
- **Governance Mechanisms**: Community-driven decision making for platform development
- **Performance Optimization**: Enhance on-chain execution efficiency
- **Expanded Model Support**: Additional model architectures and layer types
- **Cross-Chain Integration**: Extend to other blockchain networks

## 🛠️ Project Structure

```
opengraph-explorer/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── model/
│   │   │   │   ├── ModelInferenceTab.tsx
│   │   │   │   ├── ModelOverviewTab.tsx
│   │   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Models.tsx
│   │   │   ├── ModelDetail.tsx
│   │   │   └── ...
│   │   ├── utils/
│   │   │   ├── modelUtils.ts
│   │   │   ├── sui.ts
│   │   │   └── ...
│   │   ├── App.tsx
│   │   └── main.tsx
├── server/ (Optional backend services)
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue for discussion.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Sui Network](https://sui.io/) for blockchain infrastructure
- [Mysten Labs](https://mystenlabs.com/) for Sui ecosystem tools
- All contributors and community members

---

<div align="center">
  <p>Built with ❤️ by OpenGraph Labs</p>
  <p>
    <a href="https://twitter.com/opengraphlabs">Twitter</a> •
    <a href="https://discord.gg/opengraphlabs">Discord</a> •
    <a href="https://github.com/opengraphlabs">GitHub</a>
  </p>
</div>

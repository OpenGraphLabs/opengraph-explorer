/**
 * 모델 관련 유틸리티 함수
 */

// Task name conversion function
export function getTaskName(taskId: string): string {
  const taskMap: Record<string, string> = {
    "text-generation": "Text Generation",
    "image-classification": "Image Classification",
    "object-detection": "Object Detection",
    "text-to-image": "Text-to-Image",
    translation: "Translation",
  };
  return taskMap[taskId] || taskId;
}

// Task-specific input placeholders
export function getPlaceholderByTask(task: string): string {
  switch (task) {
    case "text-generation":
      return "Enter a text prompt...";
    case "image-classification":
      return "Enter an image URL...";
    case "object-detection":
      return "Enter an image URL...";
    case "text-to-image":
      return "Enter a text prompt for image generation...";
    case "translation":
      return "Enter text to translate...";
    default:
      return "Enter input...";
  }
}

// Model architecture information
export function getModelArchitecture(task: string): string {
  switch (task) {
    case "text-generation":
      return "This model is based on the Transformer architecture, using a decoder-only design for autoregressive language modeling.";
    case "image-classification":
      return "This model uses a Convolutional Neural Network (CNN) architecture to classify images.";
    case "object-detection":
      return "This model uses a Single Shot Detector (SSD) architecture to detect and classify objects in images.";
    case "text-to-image":
      return "This model uses a diffusion model architecture to generate images from text prompts.";
    case "translation":
      return "This model uses an encoder-decoder Transformer architecture to translate text from one language to another.";
    default:
      return "This model uses state-of-the-art deep learning architecture.";
  }
}

// Model files list
export function getModelFiles(task: string): Array<{ name: string; size: string }> {
  const commonFiles = [
    { name: "config.json", size: "4.2KB" },
    { name: "README.md", size: "8.5KB" },
    { name: "LICENSE", size: "1.1KB" },
  ];

  switch (task) {
    case "text-generation":
      return [
        { name: "model.bin", size: "548MB" },
        { name: "tokenizer.json", size: "1.2MB" },
        { name: "vocab.json", size: "798KB" },
        ...commonFiles,
      ];
    case "image-classification":
      return [
        { name: "model.bin", size: "102MB" },
        { name: "classes.txt", size: "12KB" },
        ...commonFiles,
      ];
    default:
      return [{ name: "model.bin", size: "256MB" }, ...commonFiles];
  }
}

// Layer type name conversion function
export function getLayerTypeName(layerType: string): string {
  const layerTypeMap: Record<string, string> = {
    "0": "Convolutional Layer",
    "1": "Fully Connected Layer",
    "2": "Max Pooling Layer",
    "3": "Average Pooling Layer",
    "4": "Flatten Layer",
    "5": "ReLU Activation Layer",
    "6": "Softmax Activation Layer",
    "7": "Sigmoid Activation Layer",
    "8": "Tanh Activation Layer",
    "9": "Leaky ReLU Activation Layer",
    "10": "Batch Normalization Layer",
    "11": "Dropout Layer",
    "12": "Embedding Layer",
    "13": "LSTM Layer",
    "14": "GRU Layer",
    "15": "RNN Layer",
    "16": "Bidirectional Layer",
    "17": "Transposed Convolutional Layer",
    "18": "Up Sampling Layer",
    "19": "Down Sampling Layer",
    "20": "Cropping Layer",
    "21": "Resizing Layer",
    "22": "Concatenation Layer",
    "23": "Addition Layer",
  };
  return layerTypeMap[layerType] || `Unknown Layer (${layerType})`;
}

// 활성화 함수 이름 가져오기
export function getActivationTypeName(type: number): string {
  const activationTypes: Record<number, string> = {
    0: "None",
    1: "ReLU",
    2: "Sigmoid",
    3: "Tanh",
    4: "Softmax",
    5: "LeakyReLU",
  };
  return activationTypes[type] || `Unknown (${type})`;
}

// 벡터 형식화 함수
export function formatVector(magnitudes: number[], signs: number[]): string {
  if (magnitudes.length !== signs.length) return "";

  return magnitudes
    .map((mag, i) => {
      // 0이 양수, 1이 음수
      const sign = signs[i] === 0 ? 1 : -1;
      return (sign * mag).toFixed(2);
    })
    .join(", ");
}

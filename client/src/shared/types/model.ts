export interface Model {
  layerDimensions: number[][];
  weightsMagnitudes: number[][];
  weightsSigns: number[][];
  biasesMagnitudes: number[][];
  biasesSigns: number[][];
  scale: number;
}

export function validateModel(model: Model) {
  if (
    !Array.isArray(model.weightsMagnitudes) ||
    model.weightsMagnitudes.length !== model.layerDimensions.length
  ) {
    throw new Error("Weights magnitudes array length must match layer dimensions.");
  }
  if (
    !Array.isArray(model.weightsSigns) ||
    model.weightsSigns.length !== model.layerDimensions.length
  ) {
    throw new Error("Weights signs array length must match layer dimensions.");
  }
  if (
    !Array.isArray(model.biasesMagnitudes) ||
    model.biasesMagnitudes.length !== model.layerDimensions.length
  ) {
    throw new Error("Biases magnitudes array length must match layer dimensions.");
  }
  if (
    !Array.isArray(model.biasesSigns) ||
    model.biasesSigns.length !== model.layerDimensions.length
  ) {
    throw new Error("Biases signs array length must match layer dimensions.");
  }

  for (let i = 0; i < model.layerDimensions.length; i++) {
    if (model.layerDimensions[i].length !== 2) {
      throw new Error(`Layer dimensions at index ${i} must be an array of two numbers.`);
    }
    if (
      model.weightsMagnitudes[i].length !==
      model.layerDimensions[i][0] * model.layerDimensions[i][1]
    ) {
      throw new Error(
        `Weights magnitudes at index ${i} must have length ${model.layerDimensions[i][0] * model.layerDimensions[i][1]}.`
      );
    }
    if (
      model.weightsSigns[i].length !==
      model.layerDimensions[i][0] * model.layerDimensions[i][1]
    ) {
      throw new Error(
        `Weights signs at index ${i} must have length ${model.layerDimensions[i][0] * model.layerDimensions[i][1]}.`
      );
    }
    if (model.biasesMagnitudes[i].length !== model.layerDimensions[i][1]) {
      throw new Error(
        `Biases magnitudes at index ${i} must have length ${model.layerDimensions[i][1]}.`
      );
    }
    if (model.biasesSigns[i].length !== model.layerDimensions[i][1]) {
      throw new Error(
        `Biases signs at index ${i} must have length ${model.layerDimensions[i][1]}.`
      );
    }
  }
}

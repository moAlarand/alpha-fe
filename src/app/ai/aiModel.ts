"use client";
import * as tf from "@tensorflow/tfjs";
import { useEffect, useState } from "react";
import { Stock, Technical } from "app/stocks/types";
import { supabase } from "utils/supabase/client";
// Model instance and state management
let modelInstance: tf.Sequential | undefined;
let isTrained = false;

// Function to create a new model
const createModel = (inputShape: number): tf.Sequential => {
  const model = tf.sequential();

  model.add(
    tf.layers.dense({
      units: 50,
      activation: "sigmoid",
      inputShape: [inputShape],
    })
  );
  model.add(tf.layers.dense({ units: 50, activation: "relu" }));
  model.add(tf.layers.dense({ units: 16, activation: "sigmoid" })); // 16 units for multi-label classification

  model.compile({
    optimizer: "adam",
    loss: "binaryCrossentropy",
    metrics: ["accuracy"],
  });

  return model;
};

// Function to initialize or load a model instance
const InitModelInstance = async (
  inputShape: number
): Promise<tf.Sequential> => {
  if (!modelInstance) {
    try {
      modelInstance = await loadModel();
      if (!modelInstance) throw new Error("Model instance is undefined");
      isTrained = true;
    } catch (error) {
      console.error("Error loading model, creating a new one:", error);
      modelInstance = createModel(inputShape);
    }
  }
  if (!modelInstance) {
    throw new Error("Model instance is undefined");
  }
  return modelInstance;
};

// Function to save the model to Supabase
export const saveModel = async () => {
  if (!modelInstance) {
    throw new Error("No model instance to save");
  }

  try {
    const saveHandler = async (
      artifacts: tf.io.ModelArtifacts
    ): Promise<tf.io.SaveResult> => {
      // Save the model topology as a JSON file
      const modelTopologyBlob = new Blob(
        [JSON.stringify(artifacts.modelTopology)],
        { type: "application/json" }
      );

      const weightDataBlob = new Blob([artifacts.weightData], {
        type: "application/octet-stream",
      });

      // Upload files to Supabase Storage
      const modelTopologyUpload = await supabase.storage
        .from("models")
        .upload("model.json", modelTopologyBlob, {
          cacheControl: "3600",
          upsert: true,
        });

      const weightDataUpload = await supabase.storage
        .from("models")
        .upload("model.weights.bin", weightDataBlob, {
          cacheControl: "3600",
          upsert: true,
        });

      if (modelTopologyUpload.error || weightDataUpload.error) {
        throw new Error("Error uploading model to Supabase Storage");
      }

      console.log("Model uploaded to Supabase!");

      return {
        modelArtifactsInfo: {
          dateSaved: new Date(),
          modelTopologyType: "JSON",
          modelTopologyBytes: modelTopologyBlob.size,
          weightDataBytes: weightDataBlob.size,
          weightSpecsBytes: JSON.stringify(artifacts.weightSpecs).length,
        },
      };
    };

    // Trigger saving process
    await modelInstance.save(tf.io.withSaveHandler(saveHandler));
  } catch (error) {
    console.error("Error saving model:", error);
  }
};

// Function to load a model from Supabase
export const loadModel = async () => {
  try {
    const { data: modelJsonData, error: modelJsonError } =
      await supabase.storage.from("models").download("model.json");
    console.log("🚀 ~ loadModel ~ data:", modelJsonData);

    const { data: modelWeightsData, error: weightsError } =
      await supabase.storage.from("models").download("model.weights.bin");
    console.log("🚀 ~ loadModel ~ data:", modelWeightsData);

    if (modelJsonError || weightsError) {
      console.log("🚀 ~ loadModel ~ weightsError:", weightsError);
      console.log("🚀 ~ loadModel ~ modelJsonError:", modelJsonError);
      throw new Error("Error downloading model files from Supabase");
    }

    const modelJson = new File([modelJsonData!], "model.json", {
      type: "application/json",
    });
    console.log("🚀 ~ loadModel ~ modelJson:1", modelJson);
    const modelWeights = new File([modelWeightsData!], "model.weights.bin");
    console.log("🚀 ~ loadModel ~ modelWeights:2", modelWeights);

    const model = await tf.loadLayersModel(
      tf.io.browserFiles([modelJson, modelWeights])
    );
    console.log("Model loaded successfully from Supabase!");
    return model as tf.Sequential;
  } catch (error) {
    console.error("Error loading model from Supabase:", error);
  }
};

// Function to train the model
export const trainModel = async (data: {
  inputs: number[][];
  labels: number[][];
}) => {
  const { inputs, labels } = data;

  if (!inputs.length || !labels.length) {
    throw new Error("Inputs or labels are empty!");
  }

  const inputTensor = tf.tensor2d(inputs, [inputs.length, inputs[0].length]);
  const labelTensor = tf.tensor2d(labels, [labels.length, labels[0].length]);

  await modelInstance?.fit(inputTensor, labelTensor, {
    epochs: 50,
    batchSize: 32,
    validationSplit: 0.2,
  });

  inputTensor.dispose();
  labelTensor.dispose();
};

// Function to update the model with new data
export const updateModel = async (newData: {
  inputs: number[][];
  labels: number[][];
}) => {
  const { inputs, labels } = newData;

  if (!inputs.length || !labels.length) {
    throw new Error("Inputs or labels are empty!");
  }

  const inputTensor = tf.tensor2d(inputs, [inputs.length, inputs[0].length]);
  const labelTensor = tf.tensor2d(labels, [labels.length, labels[0].length]);

  await modelInstance?.fit(inputTensor, labelTensor, {
    epochs: 1,
    batchSize: 32,
  });

  inputTensor.dispose();
  labelTensor.dispose();
};

// Function to make predictions and return "win" or "loss"
export const predictWinOrLoss = async (
  stock: Stock
): Promise<"win" | "loss" | "loading"> => {
  const prepareData = prepareTrainingData([stock]);
  if (!modelInstance) {
    return "loading";
  }

  // Make predictions using the model
  const prediction = modelInstance.predict(
    tf.tensor2d(prepareData.inputs)
  ) as tf.Tensor;

  // Extract the first prediction value (assuming binary classification)
  const predictedValue = prediction.dataSync()[0];

  // Classify as "win" or "loss" based on a threshold
  const result = predictedValue > 0.5 ? "win" : "loss";

  prediction.dispose(); // Clean up tensor to avoid memory leaks

  return result;
};

// Function to prepare training data
export const prepareTrainingData = (
  stocks: Stock[]
): { inputs: number[][]; labels: number[][] } => {
  const inputs: number[][] = [];
  const labels: number[][] = [];

  for (const stock of stocks) {
    const input = [
      stock.TechnicalDay === Technical.STRONG_BUY ? 1 : 0,
      stock.TechnicalWeek === Technical.STRONG_BUY ? 1 : 0,
      stock.TechnicalMonth === Technical.STRONG_BUY ? 1 : 0,
      stock.PerformanceDay,
      stock.PerformanceMonth,
      stock.FundamentalBeta,
      stock.Last,
      stock.High,
      stock.Low,
      stock.AvgVolume,
      stock.ChgPct,
      stock.Chg,
      stock.PerformanceWeek,
      stock.PerformanceYear,
      stock.PerformanceYtd,
      stock.Performance3Year,
    ];

    const label = [
      stock.TechnicalDay === Technical.STRONG_BUY ? 1 : 0,
      stock.TechnicalWeek === Technical.STRONG_BUY ? 1 : 0,
      stock.TechnicalMonth === Technical.STRONG_BUY ? 1 : 0,
      stock.PerformanceDay > 0 ? 1 : 0,
      stock.PerformanceMonth > 0 ? 1 : 0,
      stock.FundamentalBeta > 1 ? 1 : 0,
      stock.Last > stock.High * 0.9 ? 1 : 0,
      stock.Low < stock.High * 0.1 ? 1 : 0,
      stock.AvgVolume > 1000000 ? 1 : 0,
      stock.ChgPct > 0 ? 1 : 0,
      stock.Chg > 0 ? 1 : 0,
      stock.Last > stock.Low * 1.1 ? 1 : 0,
      stock.PerformanceWeek > 0 ? 1 : 0,
      stock.PerformanceYear > 0 ? 1 : 0,
      stock.PerformanceYtd > 0 ? 1 : 0,
      stock.Performance3Year > 0 ? 1 : 0,
    ];

    inputs.push(input);
    labels.push(label);
  }

  return { inputs, labels };
};

// React hook to train, update, and save the model
export const useTrainAndUpdateModel = (stocks: Stock[]) => {
  const [isTraining, setIsTraining] = useState(false);

  const _train = async () => {
    if (isTraining || !stocks?.length) return;
    setIsTraining(true);

    const trainingData = prepareTrainingData(stocks);
    if (trainingData.inputs.length === 0) return;

    await InitModelInstance(trainingData.inputs[0].length);
    try {
      if (isTrained) await updateModel(trainingData);
      await trainModel(trainingData);
      await saveModel();
    } catch (error) {
      console.error("Error during training and updating model:", error);
    } finally {
      setIsTraining(false);
    }
  };

  useEffect(() => {
    _train();
  }, [stocks]);
};

import { useEffect, useState } from "react";

type OllamaModel = {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
};

type OllamaModelsResponse = {
  models: OllamaModel[];
};

export function useOllamaModels() {
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("http://localhost:11434/api/tags");
      
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }
      
      const data: OllamaModelsResponse = await response.json();
      const modelNames = data.models.map(model => model.name);
      
      setModels(modelNames);
      
      // Set the first model as default if no model is selected and we have models
      if (modelNames.length > 0) {
        setSelectedModel(modelNames[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch models");
      console.error("Error fetching Ollama models:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return {
    models,
    selectedModel,
    setSelectedModel,
    isLoading,
    error,
    refetchModels: fetchModels,
  };
}
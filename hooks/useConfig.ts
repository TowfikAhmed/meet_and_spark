import { useMemo, useState } from 'react';

type InputsSettings = {
  camera: boolean;
  mic: boolean;
};

type Config = {
  settings: {
    inputs: InputsSettings;
  };
};

export function useConfig() {
  const [inputs, setInputs] = useState<InputsSettings>({ camera: true, mic: true });

  const config: Config = useMemo(
    () => ({ settings: { inputs } }),
    [inputs]
  );

  const setUserSettings = (next: Partial<InputsSettings>) => {
    setInputs((prev) => ({ ...prev, ...next }));
  };

  return { config, setUserSettings };
}


import { useEffect, useState } from "react";
import { sleep } from "../../utils/generic";

export function useOllamaStatus() {
  const [isAlive, setIsAlive] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [isTrying, setIsTrying] = useState(true);

  const getOllamaStatus = async () => {
    setIsAlive(false);
    setIsDead(false);
    setIsTrying(true);

    // Prevent stuff for loading too fast.
    await sleep(2150);

    fetch("http://localhost:11434")
      .then(() => setIsAlive(true))
      .catch(() => setIsDead(true))
      .finally(() => setIsTrying(false));
  };

  useEffect(() => {
    getOllamaStatus();
  }, []);

  return {
    isAlive,
    isDead,
    isTrying,
    retryConnection: getOllamaStatus,
  };
}

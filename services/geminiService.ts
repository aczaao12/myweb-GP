interface StreamCallbacks {
  onUpdate: (chunk: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

const generateContentStream = async (
  prompt: string,
  task: string,
  workerUrl: string,
  callbacks: StreamCallbacks
): Promise<void> => {
  try {
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, task }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudflare Worker Error: ${response.status} ${errorText}`);
    }

    if (!response.body) {
      throw new Error('Response body is empty.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    const read = async () => {
      const { done, value } = await reader.read();
      if (done) {
        callbacks.onComplete();
        return;
      }
      const chunk = decoder.decode(value, { stream: true });
      callbacks.onUpdate(chunk);
      await read();
    };

    await read();
  } catch (error) {
    console.error("Streaming failed:", error);
    callbacks.onError(error instanceof Error ? error : new Error(String(error)));
  }
};


const analyzePrompt = (rawPrompt: string): { warnings: string[] } => {
    const warnings: string[] = [];
    const riskyKeywords = ['delete', 'remove', 'drop', 'password', 'secret', 'api key', 'private key', 'rm -rf', 'destroy', 'credentials'];

    riskyKeywords.forEach(keyword => {
        if (new RegExp(`\\b${keyword}\\b`, 'i').test(rawPrompt)) {
            warnings.push(`Yêu cầu của bạn chứa từ khóa tiềm ẩn rủi ro: "${keyword}". Hãy đảm bảo bạn không vô tình thực hiện các hành động phá hoại hoặc để lộ thông tin nhạy cảm.`);
        }
    });

    return { warnings };
};

export { analyzePrompt, generateContentStream };

interface HashResult {
  imageHash: string;
}

type HashResponse = HashResult & {
  id: number;
  error?: string | undefined;
};

interface PendingHash {
  resolve: (result: HashResult) => void;
  reject: (error: Error) => void;
}

let hashWorker: Worker | null = null;
let nextRequestId = 1;
const pendingHashes = new Map<number, PendingHash>();

function rejectPendingHashes(error: Error): void {
  for (const pendingHash of pendingHashes.values()) {pendingHash.reject(error);}
  pendingHashes.clear();
}

function getHashWorker(): Worker {
  if (hashWorker) {return hashWorker;}

  const worker = new Worker(new URL("pageHash.worker.ts", import.meta.url), {
    type: "module",
  });

  // eslint-disable-next-line unicorn/prefer-add-event-listener
  worker.onmessage = (event: MessageEvent<HashResponse>) => {
    const pendingHash = pendingHashes.get(event.data.id);
    if (!pendingHash) {return;}

    pendingHashes.delete(event.data.id);

    if (event.data.error) {
      pendingHash.reject(new Error(event.data.error));
      return;
    }

    pendingHash.resolve({ imageHash: event.data.imageHash });
  };

  worker.onerror = () => { // eslint-disable-line unicorn/prefer-add-event-listener
    rejectPendingHashes(new Error("计算图片哈希失败"));
    worker.terminate();
    hashWorker = null; // eslint-disable-line unicorn/no-top-level-assignment-in-function
  };

  hashWorker = worker; // eslint-disable-line unicorn/no-top-level-assignment-in-function
  return worker;
}

/**
Calculates one file's SHA-256 in a dedicated worker.
*/
export function hashPageFile(file: File): Promise<HashResult> {
  return new Promise((resolve, reject) => {
    const id = nextRequestId++; // eslint-disable-line unicorn/no-top-level-assignment-in-function

    pendingHashes.set(id, { resolve, reject });

    getHashWorker().postMessage({ id, file });
  });
}

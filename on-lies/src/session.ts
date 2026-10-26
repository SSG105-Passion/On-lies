export function createSessionId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Keep the first result, including a failed sync, so reopening results cannot award again.
export class SessionResults<T> {
  private results = new Map<string, Promise<T>>();

  public run(id: string, save: () => Promise<T>): Promise<T> {
    const existing = this.results.get(id);
    if (existing) return existing;
    const result = Promise.resolve().then(save);
    this.results.set(id, result);
    return result;
  }
}

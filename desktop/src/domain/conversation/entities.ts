/** 用户语音消息 */
export interface VoiceMessage {
  id: string;
  text: string;
  language: string;
  timestamp: number;
}

/** 对话消息角色 */
export type Role = 'USER' | 'ASSISTANT';
export const Role = {
  USER: 'USER' as Role,
  ASSISTANT: 'ASSISTANT' as Role,
};

/** 单条对话消息 */
export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

/** AI 回复结果 */
export interface ChatResponse {
  message: ChatMessage;
  audioData?: ArrayBuffer;
}

/** 对话历史 */
export class ChatHistory {
  private messages: ChatMessage[] = [];

  addUser(text: string): ChatMessage {
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      role: Role.USER,
      content: text,
      timestamp: Date.now(),
    };
    this.messages.push(msg);
    return msg;
  }

  addAssistant(text: string): ChatMessage {
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      role: Role.ASSISTANT,
      content: text,
      timestamp: Date.now(),
    };
    this.messages.push(msg);
    return msg;
  }

  toList(): ChatMessage[] {
    return [...this.messages];
  }

  clear(): void {
    this.messages = [];
  }

  get size(): number {
    return this.messages.length;
  }
}

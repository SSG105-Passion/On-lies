import type { SmsActionResult } from './sms/deliveryModel';

export type GameMode = 'mail' | 'messages' | 'posts' | 'browser' | 'market';

export interface ScenarioItem {
  id: number;
  sender: string;
  address: string;
  subject: string;
  spf: string;
  body: string;
  attachment: string;
  isScam: boolean;
  round: number;
  explanation: string;
}

export interface UserAnswer {
  item: ScenarioItem;
  userChoiceIsScam: boolean;
  isCorrect: boolean;
  smsAction?: SmsActionResult;
}

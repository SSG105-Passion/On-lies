export type Channel = 'mail' | 'sms' | 'phone' | 'social' | 'market';

export type ClueCat = 'sender' | 'urgent' | 'ask' | 'link' | 'bait' | 'fake';

export const CLUE_CATEGORIES: Record<ClueCat, string> = {
  sender: 'Người gửi / tên miền',
  urgent: 'Thúc giục / ép thời gian',
  ask: 'Đòi tiền, OTP, mật khẩu',
  link: 'Link, tệp lạ không rõ nguồn',
  bait: 'Quà quá hời / việc nhẹ lương cao',
  fake: 'Mạo danh / giả người quen'
};

export interface Clue {
  text: string;
  cat: ClueCat;
  why: string;
  rule?: number;
}

export type RawPart = string | [string, ClueCat, string, number?];

export interface RawCase {
  id: number;
  d: number; // day
  k: string; // channel label (Email, Tin nhắn, Cuộc gọi...)
  channel: Channel;
  who: string;
  note: string;
  a?: RawPart; // sender / from field
  p: RawPart[]; // message body parts
  ok?: string; // explanation if safe
  verdict: boolean;
  conflict?: [string, string];
}

export interface ParsedItem {
  text: string;
  clue?: Clue;
}

export interface Rule {
  id: number;
  text: string;
  day: number;
  cat?: ClueCat;
}

export interface CaseFile {
  id: number;
  day: number;
  channel: Channel;
  channelLabel: string;
  who: string;
  note: string;
  senderItem?: ParsedItem;
  bodyItems: ParsedItem[];
  allItems: ParsedItem[];
  isScam: boolean;
  clueIndices: number[];
  okWhy?: string;
}

export interface CaseResult {
  isCorrect: boolean;
  userRejected: boolean;
  wrongFlagsCount: number;
  detectedCluesCount: number;
  totalCluesCount: number;
  isPerfect: boolean;
  logs: { type: 'hit' | 'miss' | 'warn'; message: string }[];
}

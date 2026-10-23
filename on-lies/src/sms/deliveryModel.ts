export const DELIVERY_ITEM_ID = 202;
export type SmsTool = 'order' | 'link' | 'history';
export type DeliveryAction = 'pay' | 'verify' | 'ignore';

export interface DeliveryInvestigation {
  activeTool: SmsTool | null;
  inspected: SmsTool[];
  contactConfirmed: boolean;
}

export interface SmsActionResult {
  action: DeliveryAction;
  outcome: 'verified' | 'cautious' | 'unsafe';
  scoreDelta: number;
  livesLost: number;
  title: string;
  feedback: string;
  actionLabel: string;
  inspected: SmsTool[];
}

export const SMS_TOOL_LABELS: Record<SmsTool, string> = {
  order: 'Đơn hàng', link: 'Liên kết', history: 'Lịch sử',
};

export const DELIVERY_ACTIONS: { id: DeliveryAction; label: string; caption: string }[] = [
  { id: 'pay', label: 'Thanh toán qua liên kết SMS', caption: 'Làm theo yêu cầu để nhận hàng.' },
  { id: 'verify', label: 'Liên hệ bên vận chuyển từ đơn hàng', caption: 'Dùng thông tin trong ứng dụng đã biết.' },
  { id: 'ignore', label: 'Bỏ qua tin nhắn', caption: 'Không bấm link, chưa kiểm tra đơn hàng.' },
];

export function createDeliveryInvestigation(): DeliveryInvestigation {
  return { activeTool: null, inspected: [], contactConfirmed: false };
}

export function inspectDeliveryTool(state: DeliveryInvestigation, tool: string): boolean {
  if (!['order', 'link', 'history'].includes(tool)) return false;
  state.activeTool = tool as SmsTool;
  if (!state.inspected.includes(tool as SmsTool)) state.inspected.push(tool as SmsTool);
  return true;
}

export function confirmDeliveryContact(state: DeliveryInvestigation): boolean {
  if (state.activeTool !== 'order' || !state.inspected.includes('order')) return false;
  state.contactConfirmed = true;
  return true;
}

export function evaluateDeliveryAction(action: string, state: DeliveryInvestigation): SmsActionResult | null {
  const choice = DELIVERY_ACTIONS.find(choice => choice.id === action);
  if (!choice) return null;
  const inspected = [...new Set(state.inspected)];
  if (action === 'verify' || (action === 'ignore' && state.contactConfirmed && inspected.includes('order'))) {
    if (!state.contactConfirmed || !inspected.includes('order')) return null;
    return {
      action: choice.id, outcome: 'verified', scoreDelta: 1, livesLost: 0,
      title: action === 'ignore' ? 'Bạn bỏ qua yêu cầu sau khi xác minh' : 'Bạn đã xác minh qua nguồn độc lập', actionLabel: choice.label, inspected,
      feedback: 'Thông tin liên hệ được lấy từ đơn đã đặt, không từ SMS. Bên vận chuyển xác nhận đơn vẫn đang giao và không phát sinh phí. Bạn tránh thanh toán qua liên kết lạ và vẫn kiểm tra được tình trạng đơn hàng.',
    };
  }
  if (action === 'ignore') {
    return {
      action: 'ignore', outcome: 'cautious', scoreDelta: 0, livesLost: 0,
      title: 'Tránh được rủi ro, nhưng chưa xác minh', actionLabel: choice.label, inspected,
      feedback: 'Bạn không mở liên kết hay cung cấp thông tin nên không mất mạng. Tuy nhiên, bạn chưa kiểm tra đơn thật có gặp vấn đề hay không. Lượt này chưa ghi nhận điểm xử lý tối ưu; hãy đối chiếu và tự liên hệ qua ứng dụng trong lần sau.',
    };
  }
  return {
    action: 'pay', outcome: 'unsafe', scoreDelta: 0, livesLost: 1,
    title: 'Bạn đã làm theo yêu cầu từ nguồn chưa xác minh', actionLabel: choice.label, inspected,
    feedback: 'Trong tình huống mô phỏng, liên kết dẫn đến trang yêu cầu thông tin thẻ để thu phí. Đơn thật không có khoản thu mới. Bạn mất 1 mạng vì chọn thanh toán qua nguồn chưa xác minh. Game không mở trang ngoài, thu tiền hoặc thu thông tin thẻ.',
  };
}

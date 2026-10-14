import type { GameMode, ScenarioItem, UserAnswer } from './types';

const products: Record<number, { icon: string; name: string; price: string; tag: string }> = {
  501: { icon: '🎧', name: 'Tai nghe không dây', price: '149.000', tag: 'Giá sốc hôm nay' },
  502: { icon: '📚', name: 'Bộ sách khám phá', price: '189.000', tag: 'Đơn hàng trong ứng dụng' },
  503: { icon: '📦', name: 'Kiện hàng chưa xác nhận', price: '12.000', tag: 'Yêu cầu phí giao hàng' },
  504: { icon: '💻', name: 'Laptop đã qua sử dụng', price: '6.500.000', tag: 'Bạn là người bán' },
  505: { icon: '👟', name: 'Giày thể thao', price: '329.000', tag: 'Đơn hàng đang giao' },
  506: { icon: '💳', name: 'Yêu cầu hoàn tiền', price: '249.000', tag: 'Tin nhắn hỗ trợ' },
  507: { icon: '👕', name: 'Áo khoác nhẹ', price: '179.000', tag: 'Yêu cầu đặt cọc' },
  508: { icon: '👜', name: 'Túi đeo chéo', price: '219.000', tag: 'Hồ sơ đổi trả' },
  509: { icon: '🎮', name: 'Máy chơi game', price: '899.000', tag: 'Ưu đãi từ người bán' },
};
const state = (answer?: UserAnswer) => answer ? answer.isCorrect ? '✓ Đã xử lý' : '✕ Cần lưu ý' : 'Mới';

export function renderChannelList(mode: GameMode, items: ScenarioItem[], answers: UserAnswer[]): string {
  if (mode === 'market') return `<div class="shop-banner"><div><span>ON-LIES • SÀN MUA SẮM MÔ PHỎNG</span><h2>Deal hời hay bẫy lừa?</h2><p>Kiểm tra người bán và cách thanh toán trước khi quyết định.</p></div><div class="shop-banner-bag">🛍</div></div><div class="shop-categories"><span>Tất cả</span><span>Đơn hàng</span><span>Tin từ shop</span></div><div class="product-grid">${items.map(item=>{
    const product=products[item.id], answer=answers.find(a=>a.item.id===item.id);
    return `<button class="product-card" data-item-id="${item.id}"><div class="product-art art-${item.id%3}"><span class="product-tag">${product.tag}</span><span class="product-object">${product.icon}</span></div><div class="product-info"><small>${item.sender}</small><h3>${product.name}</h3><div class="product-price">₫${product.price}</div><p>${item.subject}</p><div class="product-bottom"><span>${state(answer)}</span><b>Xem giao dịch →</b></div></div></button>`;
  }).join('')}</div>`;
  const sms=mode==='messages';
  return `<div class="conversation-home ${sms?'sms-home':'messenger-home'}"><header class="conversation-heading"><div><h2>${sms?'Tin nhắn':'Messenger'}</h2><p>${sms?'SMS / Tin nhắn văn bản':'Đoạn chat • On-Lies mô phỏng'}</p></div><span>${sms?'●●●':'ϟ'}</span></header><div class="chat-search">⌕ ${sms?'Tìm trong tin nhắn':'Tìm kiếm trên Messenger'}</div>${!sms?`<div class="chat-stories">${items.map(item=>`<div><span>${item.sender.slice(0,1)}</span><small>${item.sender.split(' ')[0]}</small></div>`).join('')}</div>`:''}<div class="conversation-list">${items.map(item=>{
    const answer=answers.find(a=>a.item.id===item.id);
    return `<button class="conversation-row" data-item-id="${item.id}"><span class="chat-avatar avatar-${item.id%3}">${item.sender.slice(0,1)}</span><div><strong>${item.sender}</strong><p>${item.body.slice(0,70)}…</p></div><span class="conversation-time">${answer?state(answer):'Bây giờ'}<i class="unread-dot ${answer?'hidden':''}"></i></span></button>`;
  }).join('')}</div><div class="conversation-bottom">${sms?'Tin nhắn cá nhân · Chạm để đọc':'💬 Đoạn chat · Chạm vào một người để mở hội thoại'}</div></div>${!sms?'<div class="messenger-empty"><span>ϟ</span><h2>Chọn một cuộc trò chuyện</h2><p>Bạn bè, người lạ, tài khoản mạo danh…<br>Hãy đọc kỹ trước khi trả lời.</p></div>':''}`;
}

const dialogue = (item: ScenarioItem) => item.body.split(/(?<=[.!?])\s+(?!\d)/).filter(Boolean);
export function renderChannelDetail(mode: GameMode, item: ScenarioItem): string {
  const buttons=`<div id="answerButtons"><button id="btnActionSafe" class="safe-button">✓ Tiếp tục, không có dấu hiệu bất thường</button><button id="btnActionScam" class="scam-button">⚑ Dừng lại, có dấu hiệu lừa đảo</button></div><div id="answerFeedback" class="hidden" role="status"></div>`;
  if (mode==='market') {
    const product=products[item.id];
    return `<article class="shop-detail"><header><strong>🛍 Shopee · Mô phỏng On-Lies</strong><button id="closeModalBtn" aria-label="Đóng giao dịch">×</button></header><div class="shop-detail-grid"><div class="product-art art-${item.id%3}"><span class="product-object">${product.icon}</span></div><div class="shop-detail-info"><small>${product.tag}</small><h2>${product.name}</h2><p class="product-price">₫${product.price}</p><div class="shop-seller">🏪 <strong>${item.sender}</strong><p>${item.address}</p></div><h3>${item.subject}</h3><div class="seller-message">💬 Nội dung giao dịch<p>${item.body}</p></div></div></div><footer><p>Bạn có tiếp tục giao dịch này không?</p>${buttons}</footer></article>`;
  }
  const sms=mode==='messages';
  return `<article class="chat-detail ${sms?'sms-detail':'messenger-detail'}"><header><button id="closeModalBtn" aria-label="Quay lại hội thoại">‹</button><span class="chat-avatar avatar-${item.id%3}">${item.sender.slice(0,1)}</span><div><strong>${item.sender}</strong><small>${item.address}</small></div><span class="chat-header-icon">${sms?'ⓘ':'☎ · ⓘ'}</span></header><div class="chat-timeline"><small class="chat-day">Hôm nay · ${sms?'Tin nhắn văn bản':'Cuộc trò chuyện mô phỏng'}</small>${!sms?'<p class="chat-outgoing">Chào bạn, có chuyện gì vậy?</p>':''}${dialogue(item).map(line=>`<div class="chat-incoming">${line}</div>`).join('')}<small class="chat-delivered">${sms?'Đã nhận':'Đã xem'} · Nội dung giả lập, các link không mở được</small></div><footer><div class="chat-compose"><span>${sms?'+':'⊕'}</span><span>${sms?'Tin nhắn văn bản':'Aa'}</span><span>${sms?'↑':'👍'}</span></div><p>Bạn sẽ phản ứng thế nào?</p>${buttons}</footer></article>`;
}

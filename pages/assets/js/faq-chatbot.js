document.addEventListener('DOMContentLoaded', () => {
    // ĐƯỜNG DẪN API – chỉnh cho đúng backend của bạn
    const apiUrl = 'http://localhost:8000/faqs?status=answered';

    const bodyEl = document.getElementById('faq-chatbot-body');
    const inputEl = document.getElementById('faq-chatbot-question');
    const sendBtn = document.getElementById('faq-chatbot-send');
    const toggleBtn = document.getElementById('faq-chatbot-toggle');

    let faqs = [];

    // Hàm hiển thị 1 tin nhắn
    function addMessage(text, from = 'bot') {
        const msg = document.createElement('div');
        msg.className = 'faq-msg ' + from;
        msg.style.opacity = '0';
        msg.style.transform = from === 'user' ? 'translateX(20px)' : 'translateX(-20px)';
        
        msg.innerHTML = `
            <div class="bubble">
                ${text}
            </div>
        `;

        bodyEl.appendChild(msg);
        
        // Smooth scroll
        setTimeout(() => {
            bodyEl.scrollTo({
                top: bodyEl.scrollHeight,
                behavior: 'smooth'
            });
        }, 50);
        
        // Animate in
        setTimeout(() => {
            msg.style.transition = 'all 0.3s ease-out';
            msg.style.opacity = '1';
            msg.style.transform = 'translateX(0)';
        }, 10);
    }

    // Hàm render các câu hỏi gợi ý (nút bấm)
    function renderSuggestions() {
        if (!faqs.length) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'faq-msg bot';
        wrapper.style.opacity = '0';
        wrapper.style.transform = 'translateX(-20px)';

        const inner = document.createElement('div');
        inner.className = 'bubble';

        inner.innerHTML = '<div style="font-weight: 600; margin-bottom: 8px; color: #374151;">💡 Một số câu hỏi thường gặp:</div>';

        const list = document.createElement('div');
        list.className = 'faq-suggest-list';

        // Lấy tối đa 6 câu để demo
        faqs.slice(0, 6).forEach((f, index) => {
            const btn = document.createElement('button');
            btn.className = 'faq-suggest-btn';
            btn.textContent = f.question;
            btn.style.opacity = '0';
            btn.style.transform = 'scale(0.8)';
            btn.addEventListener('click', () => {
                handleUserAsk(f.question);
            });
            list.appendChild(btn);
            
            // Stagger animation for buttons
            setTimeout(() => {
                btn.style.transition = 'all 0.3s ease-out';
                btn.style.opacity = '1';
                btn.style.transform = 'scale(1)';
            }, index * 50);
        });

        inner.appendChild(list);
        wrapper.appendChild(inner);
        bodyEl.appendChild(wrapper);
        
        // Animate wrapper
        setTimeout(() => {
            wrapper.style.transition = 'all 0.3s ease-out';
            wrapper.style.opacity = '1';
            wrapper.style.transform = 'translateX(0)';
        }, 10);
        
        setTimeout(() => {
            bodyEl.scrollTo({
                top: bodyEl.scrollHeight,
                behavior: 'smooth'
            });
        }, 400);
    }

    // Tìm câu trả lời tốt nhất cho câu hỏi user gõ
    function findBestAnswer(userText) {
        const text = userText.toLowerCase();

        let best = { score: 0, faq: null };

        faqs.forEach(f => {
            const q = f.question.toLowerCase();

            // Đếm số từ khóa trùng nhau
            let score = 0;
            const words = text.split(/\s+/).filter(w => w.length > 2);
            words.forEach(w => {
                if (q.includes(w)) score++;
            });

            if (score > best.score) {
                best = { score, faq: f };
            }
        });

        if (!best.faq || best.score === 0) return null;
        return best.faq;
    }

    // Xử lý khi user hỏi (gõ tay hoặc bấm gợi ý)
    function handleUserAsk(text) {
        // hiển thị câu hỏi user
        addMessage(text, 'user');

        const best = findBestAnswer(text);

        if (best) {
            addMessage(best.answer, 'bot');
        } else {
            addMessage('Mình chưa tìm được câu trả lời phù hợp. Bạn thử hỏi lại với câu ngắn gọn hơn hoặc chọn câu gợi ý bên dưới nhé.', 'bot');
            renderSuggestions();

        }
    }

    // Click nút gửi
    sendBtn.addEventListener('click', () => {
        const text = inputEl.value.trim();
        if (!text) return;
        handleUserAsk(text);
        inputEl.value = '';
    });

    // Enter để gửi
    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendBtn.click();
        }
    });

    // Nút thu/phóng chatbot với smooth animation
    toggleBtn.addEventListener('click', () => {
        const body = document.querySelector('.faq-chatbot-body');
        const inputWrap = document.querySelector('.faq-chatbot-input');
        const chatbot = document.getElementById('faq-chatbot');

        if (body.style.display === 'none' || body.style.maxHeight === '0px') {
            body.style.display = 'flex';
            body.style.maxHeight = '350px';
            body.style.opacity = '1';
            inputWrap.style.display = 'flex';
            inputWrap.style.opacity = '1';
            toggleBtn.textContent = '−';
            chatbot.style.maxHeight = '500px';
            chatbot.style.height = 'auto';
        } else {
            body.style.maxHeight = '0px';
            body.style.opacity = '0';
            inputWrap.style.opacity = '0';
            toggleBtn.textContent = '+';
            chatbot.style.maxHeight = '60px';
            chatbot.style.height = '60px';
            
            setTimeout(() => {
                body.style.display = 'none';
                inputWrap.style.display = 'none';
            }, 300);
        }
    });

    // Gọi API lấy dữ liệu FAQ
    fetch(apiUrl)
  .then(res => res.json())
  .then(data => {
    console.log('FAQ chatbot data:', data); // để bạn tự nhìn JSON trong console

    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
      faqs = data.data;
      addMessage('Xin chào 👋 Mình là chatbot FAQ. Bạn có thể gõ câu hỏi hoặc bấm vào các câu hỏi gợi ý nhé.', 'bot');
      renderSuggestions();
    } else {
      addMessage('Không tải được dữ liệu FAQ. Vui lòng thử lại sau.', 'bot');
    }
  })
  .catch(err => {
    console.error('FAQ chatbot API error:', err);
    addMessage('Có lỗi khi kết nối server. Vui lòng thử lại sau.', 'bot');
  });

});

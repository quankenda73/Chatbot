document.addEventListener('DOMContentLoaded', () => {
    loadChatHistory();
  });
  
  document.getElementById('send-btn').addEventListener('click', sendMessage);
  document.getElementById('voice-btn').addEventListener('click', startVoiceRecognition);
  document.getElementById('image-input').addEventListener('change', handleImageUpload);
  
  async function sendMessage() {
    const userInput = document.getElementById('user-input').value.trim();
    if (userInput === '') return;
  
    displayMessage(userInput, 'user');
    saveChatHistory();
  
    const botReply = await getChatbotResponse(userInput);
    displayMessage(botReply, 'bot');
    saveChatHistory();
  
    document.getElementById('user-input').value = '';
  }
  
  function displayMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add(sender);
    messageElement.textContent = message;
    document.getElementById('chat-box').appendChild(messageElement);
  }
  
  async function getChatbotResponse(userInput) {
    try {
      // Gửi yêu cầu tới backend của bạn (địa chỉ "/chat" sẽ được định nghĩa ở server)
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
      });
  
      const data = await response.json();
      return data.reply || 'Xin lỗi, tôi không hiểu.';
    } catch (error) {
      console.error(error);
      return 'Lỗi khi gọi API.';
    }
  }
  
  // Lưu lịch sử chat vào localStorage
  function saveChatHistory() {
    const chatBox = document.getElementById('chat-box').innerHTML;
    localStorage.setItem('chatHistory', chatBox);
  }
  
  function loadChatHistory() {
    const chatHistory = localStorage.getItem('chatHistory');
    if (chatHistory) {
      document.getElementById('chat-box').innerHTML = chatHistory;
    }
  }
  
  // Nhận diện giọng nói sử dụng Web Speech API
  function startVoiceRecognition() {
    // Kiểm tra hỗ trợ SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
  
    recognition.onresult = function(event) {
      document.getElementById('user-input').value = event.results[0][0].transcript;
    };
  
    recognition.start();
  }
  
  // Xử lý ảnh tải lên
  async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('image', file);
  
    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });
  
      const result = await response.json();
      displayMessage(`Ảnh đã tải lên: ${result.url}`, 'bot');
    } catch (error) {
      console.error(error);
      displayMessage('Lỗi khi tải ảnh.', 'bot');
    }
  }
  
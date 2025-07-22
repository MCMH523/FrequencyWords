const socket = io();
const loginEl = document.getElementById('login');
const chatEl = document.getElementById('chat');
const nicknameInput = document.getElementById('nickname');
const enterBtn = document.getElementById('enter');
const messagesEl = document.getElementById('messages');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('send');
const statsEl = document.getElementById('stats');

enterBtn.onclick = () => {
  const nick = nicknameInput.value.trim();
  if (nick) {
    socket.emit('join', nick);
    loginEl.classList.add('hidden');
    chatEl.classList.remove('hidden');
  }
};

sendBtn.onclick = sendMessage;
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const text = messageInput.value.trim();
  if (text) {
    socket.emit('chat-message', text);
    messageInput.value = '';
  }
}

socket.on('chat-message', (data) => {
  const msg = document.createElement('div');
  msg.classList.add('message');
  if (data.score > 0) msg.classList.add('positive');
  else if (data.score < 0) msg.classList.add('negative');
  msg.textContent = `${data.nickname}: ${data.text}`;
  messagesEl.appendChild(msg);
  messagesEl.scrollTop = messagesEl.scrollHeight;
});

socket.on('user-count', (count) => {
  statsEl.textContent = `Users online: ${count}`;
});

socket.on('stats', (s) => {
  statsEl.textContent = `Users online: ${s.users} | Messages: ${s.totalMessages} | Avg sentiment: ${s.averageScore.toFixed(2)}`;
});

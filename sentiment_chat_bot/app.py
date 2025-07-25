import json
from pathlib import Path
from flask import Flask, render_template, request, jsonify
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

app = Flask(__name__)

CHAT_HISTORY_FILE = Path(__file__).with_name('chat_history.json')
analyzer = SentimentIntensityAnalyzer()

# load existing chat history
if CHAT_HISTORY_FILE.exists():
    with open(CHAT_HISTORY_FILE, 'r', encoding='utf-8') as f:
        chat_history = json.load(f)
else:
    chat_history = []

def save_history():
    with open(CHAT_HISTORY_FILE, 'w', encoding='utf-8') as f:
        json.dump(chat_history, f, ensure_ascii=False, indent=2)

@app.route('/')
def index():
    return render_template('index.html', history=chat_history)

@app.route('/analyze', methods=['POST'])
def analyze():
    text = request.json.get('text', '')
    sentiment = analyzer.polarity_scores(text)
    compound = sentiment['compound']
    if compound >= 0.05:
        mood = 'positive'
        emoji = '😊'
        response = 'Great to hear!'
    elif compound <= -0.05:
        mood = 'negative'
        emoji = '😟'
        response = 'I\'m sorry to hear that.'
    else:
        mood = 'neutral'
        emoji = '😐'
        response = 'Thanks for sharing.'

    entry = {'text': text, 'mood': mood, 'emoji': emoji, 'response': response}
    chat_history.append(entry)
    save_history()
    return jsonify(entry)

if __name__ == '__main__':
    app.run(debug=True)

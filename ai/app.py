from flask import Flask, request, jsonify
import pandas as pd
import os

app = Flask(__name__)

# تحميل البيانات إذا كان الملف موجود
csv_path = 'final_data_for_ai.csv'
df = None
if os.path.exists(csv_path):
    try:
        df = pd.read_csv(csv_path)
        print(f"✅ Data loaded: {len(df)} rows")
    except Exception as e:
        print(f"⚠️ Could not load CSV: {e}")

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    subject = data.get('subject')
    difficulty = data.get('difficulty', 'medium')
    
    # هنا منطق توليد الأسئلة
    # إذا عندك ملف generate.py تقدر تستوردينه
    # try:
    #     from generate import generate_questions
    #     questions = generate_questions(subject, difficulty, df)
    # except:
    #     questions = []
    
    # مؤقتاً: أسئلة افتراضية
    questions = [
        {
            "question": f"What is the main concept of {subject}?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": "Option A",
            "difficulty": difficulty
        },
        {
            "question": f"Which of the following best describes {subject}?",
            "options": ["Definition 1", "Definition 2", "Definition 3", "Definition 4"],
            "correctAnswer": "Definition 1",
            "difficulty": difficulty
        }
    ]
    
    return jsonify({'questions': questions})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'AI service is running ✅'})

if __name__ == '__main__':
    app.run(port=5002, debug=True)
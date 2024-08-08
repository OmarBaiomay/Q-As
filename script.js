document.getElementById('courses').addEventListener('change', function() {
    const course = document.getElementById('courses').value;
    const chapters = document.getElementById('chapters');
    const generateButton = document.getElementById('generate-questions');

    if (course) {
        chapters.disabled = false;
    } else {
        chapters.disabled = true;
        generateButton.disabled = true;
    }
});

document.getElementById('chapters').addEventListener('change', function() {
    const chapter = document.getElementById('chapters').value;
    const generateButton = document.getElementById('generate-questions');

    if (chapter) {
        generateButton.disabled = false;
    } else {
        generateButton.disabled = true;
    }
});

document.getElementById('generate-questions').addEventListener('click', async function() {
    const course = document.getElementById('courses').value;
    const chapter = document.getElementById('chapters').value;

    const text = await loadTextFile(course, chapter);
    const questionsDiv = document.getElementById('questions');
    questionsDiv.innerHTML = 'Loading...';

    const questions = await generateQuestions(text);
    displayQuestions(questions);

    // Show the submit button after generating questions
    document.getElementById('submit-answers').style.display = 'block';
});

document.getElementById('submit-answers').addEventListener('click', function() {
    validateAnswers();
});

async function loadTextFile(course, chapter) {
    const response = await fetch(`new.txt`);
    return response.text();
}

async function generateQuestions(text) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer sk-JO3YB4Fb51bxFVgQfiRs-SzAvI4YDirav_MJgoJdfwT3BlbkFJf_CEkUGgGZoZuuV3flKUlWQREccPkug4JEwvOj-qUA`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'Generate 5 multiple-choice questions with four options each. The correct answer should be indicated in the explanations without being marked in the options. Provide explanations for each answer. Base the questions on the following text:' },
                { role: 'user', content: text }
            ],
            max_tokens: 2000
        })
    });

    const data = await response.json();
    console.log('API Response:', data);
    return parseQuestions(data.choices[0].message.content);
}

function displayQuestions(questions) {
    const questionsDiv = document.getElementById('questions');
    questionsDiv.innerHTML = '';

    questions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.innerHTML = `
            <p>${index + 1}. ${q.question}</p>
            <ul>
                ${q.options.map((opt, i) => `
                    <li>
                        <input type="radio" id="q${index}a${i}" name="q${index}" data-correct="${opt.correct}">
                        <label for="q${index}a${i}">${String.fromCharCode(65 + i)}. ${opt.text}</label>
                    </li>
                `).join('')}
            </ul>
            <div id="explanation${index}" class="explanation" style="display: none;" data-original-text="${q.explanation}">${q.explanation}</div>
        `;
        questionsDiv.appendChild(questionDiv);
    });
}

function validateAnswers() {
    const questionsDiv = document.getElementById('questions');
    const questions = questionsDiv.querySelectorAll('.question');
    let correctCount = 0;

    questions.forEach((question, index) => {
        const selectedOption = question.querySelector(`input[name="q${index}"]:checked`);
        const explanationDiv = document.getElementById(`explanation${index}`);
        const correct = selectedOption && selectedOption.dataset.correct === 'true';

        explanationDiv.textContent = explanationDiv.dataset.originalText; // Reset the explanation text
        if (correct) {
            explanationDiv.style.color = 'green';
            explanationDiv.textContent = 'Correct! ' + explanationDiv.textContent;
            correctCount++;
        } else {
            explanationDiv.style.color = 'red';
            explanationDiv.textContent = 'Incorrect! ' + explanationDiv.textContent;
        }

        explanationDiv.style.display = 'block';
    });

    const scoreDiv = document.getElementById('score');
    scoreDiv.textContent = `You got ${correctCount} out of ${questions.length} correct!`;
}


function parseQuestions(content) {
    const questions = [];
    const lines = content.split('\n').filter(line => line.trim() !== '');
    console.log('Parsed Lines:', lines);

    let currentQuestion = null;
    let currentOptions = [];
    let correctAnswer = '';

    lines.forEach(line => {
        line = line.trim();
        if (/^\d+\./.test(line)) { // Match lines starting with "1.", "2.", etc.
            if (currentQuestion) {
                if (currentOptions.length > 0) {
                    currentQuestion.options = currentOptions.map(option => ({
                        ...option,
                        correct: option.text.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
                    }));
                    questions.push(currentQuestion);
                }
            }
            currentQuestion = { question: line.replace(/^\d+\.\s*/, ''), options: [], explanation: '' };
            currentOptions = [];
            correctAnswer = '';
        } else if (/^[A-D]\)/.test(line)) { // Match lines starting with "A)", "B)", etc.
            const text = line.replace(/^[A-D]\)\s*/, '').trim();
            currentOptions.push({ text, correct: false });
        } else if (/^Explanation:/.test(line) || /^\*\*Explanation:/.test(line)) {
            if (currentQuestion) {
                const explanation = line.replace(/^(\*\*Explanation:|Explanation:)\s*/, '').trim();
                currentQuestion.explanation = explanation;
                const match = explanation.match(/The correct answer is ([A-D])\)/i);
                if (match) {
                    const answerIndex = match[1].toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
                    correctAnswer = currentOptions[answerIndex]?.text;
                }
            }
        }
    });

    // Ensure the last question is added
    if (currentQuestion && currentOptions.length > 0) {
        currentQuestion.options = currentOptions.map(option => ({
            ...option,
            correct: option.text.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
        }));
        questions.push(currentQuestion);
    }

    console.log('Parsed Questions:', questions);
    return questions;
}

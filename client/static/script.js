document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    const username = urlParams.get('username');
    const stage = parseInt(urlParams.get('stage')) || 1;
    const answer = urlParams.get('answer');
    const nextStage = urlParams.get('next_stage');
    const text = urlParams.get('text');
    const img = urlParams.get('img');
    const textAnswerInput = urlParams.get('text_answer_input');
    const help = urlParams.get('help');

    // Проверка наличия всех параметров
    if (!userId || !username || !stage || !answer || !nextStage || !text || !img || !textAnswerInput || !help) {
        showModal('Ошибка: неполные данные в URL.', false, () => {
            window.location.href = 'map1.html';
        });
        return;
    }

    // Инициализация звуковых эффектов
    const clickSound = new Audio('static/sound/click.mp3');
    const wrongSound = new Audio('static/sound/wrong.mp3');
    const stageCompleteSound = new Audio('static/sound/stage_complete.mp3');
    const backgroundMusic = new Audio('static/sound/background_lofi.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.2;
    let isBackgroundMusicPlaying = false;

    // Защита от копирования и контекстного меню
    document.addEventListener('copy', e => e.preventDefault());
    document.addEventListener('cut', e => e.preventDefault());
    document.addEventListener('selectstart', e => {
        if (!e.target.matches('#answer-input')) {
            e.preventDefault();
        }
    });

    // Создание фоновых элементов
    const backgroundTop = document.createElement('div');
    backgroundTop.className = 'background-top';
    document.body.appendChild(backgroundTop);

    const backgroundBottom = document.createElement('div');
    backgroundBottom.className = 'background-bottom';
    document.body.appendChild(backgroundBottom);

    // Кнопка музыки
    function toggleBackgroundMusic() {
        if (isBackgroundMusicPlaying) {
            backgroundMusic.pause();
            isBackgroundMusicPlaying = false;
            document.getElementById('music-toggle').textContent = '🔈';
        } else {
            backgroundMusic.play().then(() => {
                isBackgroundMusicPlaying = true;
                document.getElementById('music-toggle').textContent = '🔊';
            }).catch(error => console.error('Ошибка воспроизведения:', error));
        }
    }

    const musicToggleButton = document.createElement('button');
    musicToggleButton.id = 'music-toggle';
    musicToggleButton.textContent = '🔈';
    musicToggleButton.className = 'music-toggle';
    document.body.appendChild(musicToggleButton);
    musicToggleButton.addEventListener('click', () => {
        clickSound.play().catch(error => console.error('Ошибка:', error));
        toggleBackgroundMusic();
    });

    // Функция модального окна
    function showModal(message, isCorrect = null, onClose = null) {
        const existingModal = document.querySelector('.modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-header">Информация</div>
            <div class="modal-content ${isCorrect !== null ? (isCorrect ? 'correct' : 'incorrect') : ''}">${message}</div>
            <div class="modal-footer">
                <button id="modal-close">OK</button>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.modal-content').addEventListener('contextmenu', e => e.preventDefault());
        modal.style.display = 'block';

        document.getElementById('modal-close').addEventListener('click', () => {
            clickSound.play().catch(error => console.error('Ошибка:', error));
            modal.remove();
            if (onClose) onClose();
        });
    }

    // Показ начального модального окна
    showModal(`ЭТАП ${stage}`, null, toggleBackgroundMusic);

    // Отображение данных
    document.getElementById('username').textContent = username;
    document.getElementById('stage-number').textContent = stage;
    const puzzleImage = document.getElementById('puzzle-image');
    puzzleImage.src = img;
    puzzleImage.draggable = false;
    puzzleImage.addEventListener('contextmenu', e => e.preventDefault());
    puzzleImage.onerror = () => {
        console.error('Failed to load image:', img);
        puzzleImage.src = 'static/picture/fallback.jpg';
    };
    const puzzleText = document.getElementById('puzzle-text');
    puzzleText.textContent = text;
    puzzleText.addEventListener('contextmenu', e => e.preventDefault());
    const answerInput = document.getElementById('answer-input');
    answerInput.placeholder = textAnswerInput;
    const puzzleHint = document.getElementById('puzzle-hint');
    puzzleHint.textContent = help;
    puzzleHint.addEventListener('contextmenu', e => e.preventDefault());

    // Обработчик отправки ответа
    document.getElementById('submit-answer').addEventListener('click', function() {
        clickSound.play().catch(error => console.error('Ошибка:', error));
        const userAnswer = document.getElementById('answer-input').value.trim().toLowerCase();

        if (userAnswer === answer.toLowerCase()) {
            stageCompleteSound.play();
            showModal(`Правильно! Кодовое слово: ${nextStage}. Отправьте его боту в Telegram с помощью команды /answer ${nextStage}`, true);
        } else {
            wrongSound.play();
            showModal('Неверно! Попробуйте ещё раз.', false);
        }
    });

    // Адаптация для мобильных
    const container = document.querySelector('.container');
    const answerInputElement = document.getElementById('answer-input');
    let initialWindowHeight = window.innerHeight;

    function adjustContainerPosition() {
        if (window.innerWidth <= 600) {
            const currentWindowHeight = window.innerHeight;
            if (currentWindowHeight < initialWindowHeight) {
                const inputRect = answerInputElement.getBoundingClientRect();
                const offset = inputRect.top + inputRect.height - currentWindowHeight + 20;
                if (offset > 0) {
                    container.style.transform = `translate(-50%, -${offset}px)`;
                }
            } else {
                container.style.transform = 'translate(-50%, -50%)';
            }
        }
    }

    answerInputElement.addEventListener('focus', adjustContainerPosition);
    window.addEventListener('resize', () => {
        initialWindowHeight = window.innerHeight;
        adjustContainerPosition();
    });
});
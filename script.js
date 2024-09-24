let playerName = '';
let isPaused = false;
let currentLevel = 1;
const totalLevels = 3; // Общее количество уровней
const colorsByLevel = [
    ['green', 'green', 'red', 'red'],
    ['green', 'green', 'red', 'red', 'blue', 'blue'],
    ['green', 'green', 'red', 'red', 'blue', 'blue', 'yellow', 'yellow']
];

// Элементы страницы
const createPlayerButton = document.getElementById('createPlayer');
const playerNameInput = document.getElementById('playerName');
const startGameButton = document.getElementById('startGame');
const pauseGameButton = document.getElementById('pauseGame');
const replayGameButton = document.getElementById('replayGame');
const gameArea = document.getElementById('gameArea');
const welcomeMessage = document.getElementById('welcomeMessage');
const pauseMessage = document.getElementById('pauseMessage');

// Переменные для игры
let firstCard, secondCard;
let pairsFound = 0; // Количество найденных пар
let cards = []; // Карты на уровне, для сохранения их состояния
let cardStates = []; // Состояния карт (открыта/скрыта/найдена)

// Создание имени игрока
createPlayerButton.addEventListener('click', () => {
    createPlayerButton.classList.add('hidden');
    playerNameInput.classList.remove('hidden');
    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && playerNameInput.value) {
            playerName = playerNameInput.value;
            playerNameInput.classList.add('hidden');
            welcomeMessage.textContent = `Привет, ${playerName}! Будем играть?`;
            startGameButton.disabled = false;
        }
    });
});

// Начало игры или продолжение после паузы
startGameButton.addEventListener('click', () => {
    if (isPaused) {
        resumeGame();
    } else {
        startGame();
    }
});

function startGame() {
    isPaused = false;
    gameArea.classList.remove('hidden');
    pauseMessage.classList.add('hidden');
    startGameButton.disabled = true;
    pauseGameButton.disabled = false;
    pairsFound = 0; // Обнуляем счетчик найденных пар при старте уровня

    // Отображаем текущий уровень и подсказку
    welcomeMessage.innerHTML = `Уровень ${currentLevel}<br>Выбирай кликом картинку, находи одинаковые цвета`;

    displayLevel(currentLevel); // Показ карточек для выбора
}

// Пауза
pauseGameButton.addEventListener('click', () => {
    isPaused = true;
    gameArea.classList.add('hidden');
    pauseMessage.classList.remove('hidden');
    pauseGameButton.disabled = true; // Делаем кнопку "Пауза" неактивной
    startGameButton.disabled = false; // Активируем кнопку "Начать игру/Продолжить игру"
});

// Перезапуск игры
replayGameButton.addEventListener('click', () => {
    currentLevel = 1;
    replayGameButton.disabled = true;
    startGame();
});

// Отображение уровня
function displayLevel(level) {
    gameArea.innerHTML = '';
    const colors = shuffle(colorsByLevel[level - 1]);
    cards = []; // Очищаем карты для нового уровня
    cardStates = []; // Очищаем состояния карт для нового уровня

    colors.forEach((color, index) => {
        const card = document.createElement('div');
        card.style.backgroundColor = '#ddd';
        card.dataset.color = color;
        card.dataset.index = index;
        card.addEventListener('click', () => selectCard(card)); // Открытие по одному клику
        cards.push(card); // Сохраняем карту для работы с ее состоянием
        cardStates.push({ color: color, status: 'hidden' }); // Возможные состояния: 'hidden', 'visible', 'found'
        gameArea.appendChild(card);
    });
}

// Перемешивание цветов
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Логика выбора карточек
function selectCard(card) {
    if (isPaused || cardStates[card.dataset.index].status === 'found' || cardStates[card.dataset.index].status === 'visible') return; // Не реагируем при паузе или если карта уже найдена или открыта
    card.style.backgroundColor = card.dataset.color;
    cardStates[card.dataset.index].status = 'visible'; // Сохраняем состояние карты как "открыта"

    if (!firstCard) {
        firstCard = card;
    } else {
        secondCard = card;
        isPaused = true; // Блокируем ввод до завершения проверки
        setTimeout(checkMatch, 500);
    }
}

// Проверка совпадения карт
function checkMatch() {
    if (firstCard.dataset.color === secondCard.dataset.color) {
        firstCard.style.visibility = 'hidden';
        secondCard.style.visibility = 'hidden';
        cardStates[firstCard.dataset.index].status = 'found';
        cardStates[secondCard.dataset.index].status = 'found';
        pairsFound++;
        checkLevelCompletion(); // Проверяем, завершен ли уровень
    } else {
        firstCard.style.backgroundColor = '#ddd';
        secondCard.style.backgroundColor = '#ddd';
        cardStates[firstCard.dataset.index].status = 'hidden';
        cardStates[secondCard.dataset.index].status = 'hidden';
    }
    firstCard = secondCard = null;
    isPaused = false; // Разблокируем ввод
}

// Проверка завершения уровня
function checkLevelCompletion() {
    const totalPairs = colorsByLevel[currentLevel - 1].length / 2; // Всего пар на уровне
    if (pairsFound === totalPairs) {
        setTimeout(() => {
            if (currentLevel < totalLevels) {
                alert('Ты молодец! Переход на следующий уровень.');
                currentLevel++;
                pairsFound = 0; // Обнуляем счетчик пар для следующего уровня
                startGame(); // Начинаем следующий уровень
            } else {
                alert('Игра пройдена! Ты прошел все уровни.');
                replayGameButton.disabled = false;
                pauseGameButton.disabled = true;
                startGameButton.disabled = true;
                isPaused = true;
            }
        }, 500);
    }
}

// Возобновление игры после паузы
function resumeGame() {
    isPaused = false;
    gameArea.classList.remove('hidden');
    pauseMessage.classList.add('hidden');
    pauseGameButton.disabled = false;
    startGameButton.disabled = true; // Отключаем кнопку "Начать игру/Продолжить игру"

    // Восстанавливаем состояния карт
    cards.forEach((card, index) => {
        if (cardStates[index].status === 'visible') {
            card.style.backgroundColor = card.dataset.color; // Карта открыта
        } else if (cardStates[index].status === 'found') {
            card.style.visibility = 'hidden'; // Карта уже найдена
        } else {
            card.style.backgroundColor = '#ddd'; // Карта закрыта
        }
    });
}

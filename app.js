// Digit Span Oral - PWA avec TTS et STT

// État de l'application
const state = {
    currentSequence: [],
    currentIndex: 0,
    isPlaying: false,
    isListening: false,
    isSubmitting: false,
    results: [],
    correctCount: 0,
    totalCount: 0,
    recognition: null,
    synthesis: window.speechSynthesis,
    mode: 'forward'
};

// Éléments DOM
const elements = {
    startBtn: document.getElementById('startBtn'),
    stopBtn: document.getElementById('stopBtn'),
    submitBtn: document.getElementById('submitBtn'),
    numberDisplay: document.getElementById('numberDisplay'),
    currentNumber: document.getElementById('currentNumber'),
    status: document.getElementById('status'),
    inputContainer: document.getElementById('inputContainer'),
    resultsList: document.getElementById('resultsList'),
    correctCount: document.getElementById('correctCount'),
    successRate: document.getElementById('successRate'),
    modal: document.getElementById('modal'),
    modalTitle: document.getElementById('modalTitle'),
    modalMessage: document.getElementById('modalMessage'),
    modalClose: document.getElementById('modalClose'),
    spanLength: document.getElementById('spanLength'),
    allowDuplicates: document.getElementById('allowDuplicates'),
    modeInputs: document.querySelectorAll('input[name="mode"]')
};

// Initialisation
function init() {
    // Vérifier la compatibilité TTS/STT
    if (!('speechSynthesis' in window)) {
        showModal('Erreur', 'La synthèse vocale (TTS) n\'est pas supportée par votre navigateur. Essayez Chrome ou Edge.');
    }
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showModal('Erreur', 'La reconnaissance vocale (STT) n\'est pas supportée par votre navigateur. Essayez Chrome ou Edge.');
    }
    
    // Initialiser la reconnaissance vocale
    initSpeechRecognition();
    
    // Ajouter les écouteurs d'événements
    setupEventListeners();
    
    // Mettre à jour l'interface
    updateUI();
}

// Initialiser la reconnaissance vocale
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
        state.recognition = new SpeechRecognition();
        state.recognition.continuous = false;
        state.recognition.interimResults = false;
        state.recognition.lang = 'fr-FR';
        
        state.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            handleSpeechResult(transcript);
        };
        
        state.recognition.onerror = (event) => {
            console.error('Erreur de reconnaissance vocale:', event.error);
            if (event.error === 'no-speech') {
                showStatus('Aucune parole détectée. Essayez à nouveau.');
            } else if (event.error === 'not-allowed') {
                showModal('Permission refusée', 'Veuillez autoriser l\'accès au microphone pour utiliser cette fonctionnalité.');
            }
            state.isListening = false;
            updateUI();
        };
        
        state.recognition.onend = () => {
            state.isListening = false;
            updateUI();
        };
    }
}

// Configurer les écouteurs d'événements
function setupEventListeners() {
    elements.startBtn.addEventListener('click', startExercise);
    elements.stopBtn.addEventListener('click', stopExercise);
    elements.submitBtn.addEventListener('click', submitAnswer);
    elements.modalClose.addEventListener('click', () => {
        elements.modal.classList.add('hidden');
    });
    
    // Modes
    elements.modeInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            state.mode = e.target.value;
        });
    });
    
    // Paramètres
    elements.spanLength.addEventListener('change', (e) => {
        const value = parseInt(e.target.value);
        if (value < 3) e.target.value = 3;
        if (value > 12) e.target.value = 12;
    });
}

// Démarrer l'exercice
async function startExercise() {
    if (state.isPlaying) return;
    
    const spanLength = parseInt(elements.spanLength.value);
    const allowDuplicates = elements.allowDuplicates.checked;
    
    // Générer la séquence
    state.currentSequence = generateSequence(spanLength, allowDuplicates);
    state.currentIndex = 0;
    state.isPlaying = true;
    state.isListening = false;
    
    // Réinitialiser l'interface
    elements.numberDisplay.classList.remove('hidden');
    elements.currentNumber.textContent = '';
    showStatus('Écoutez la séquence...');
    
    // Désactiver les boutons
    updateUI();
    
    // Attendre un court délai avant de commencer
    await sleep(500);
    
    // Jouer la séquence
    await playSequence();
    
    // Après avoir joué la séquence, préparer la réponse
    await prepareResponse();
}

// Générer une séquence de chiffres
function generateSequence(length, allowDuplicates) {
    const sequence = [];
    const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    for (let i = 0; i < length; i++) {
        let digit;
        if (allowDuplicates) {
            digit = digits[Math.floor(Math.random() * digits.length)];
        } else {
            // Sans doublons
            const availableDigits = digits.filter(d => !sequence.includes(d));
            digit = availableDigits[Math.floor(Math.random() * availableDigits.length)];
        }
        sequence.push(digit);
    }
    
    return sequence;
}

// Jouer la séquence avec TTS
async function playSequence() {
    // Arrêter toute synthèse en cours
    state.synthesis.cancel();
    
    for (let i = 0; i < state.currentSequence.length; i++) {
        const digit = state.currentSequence[i];
        
        // Afficher le chiffre
        elements.currentNumber.textContent = digit;
        elements.numberDisplay.classList.add('pulse');
        
        // Dire le chiffre
        await speak(digit.toString());
        
        // Retirer l'animation
        elements.numberDisplay.classList.remove('pulse');
        
        // Attendre un court délai entre les chiffres
        await sleep(500);
    }
    
    // Effacer l'affichage après la séquence
    elements.currentNumber.textContent = '';
}

// Préparer la section de réponse
async function prepareResponse() {
    state.isPlaying = false;
    state.isListening = false;
    
    // Générer les inputs pour la réponse
    generateInputFields();
    
    // Mettre à jour le statut
    showStatus(`Répétez la séquence en ordre ${getModeLabel()}.`);
    
    // Activer le bouton de soumission
    updateUI();
    
    // Focus sur le premier input
    const firstInput = elements.inputContainer.querySelector('input');
    if (firstInput) {
        await sleep(300);
        firstInput.focus();
    }
}

// Générer les champs de saisie
function generateInputFields() {
    elements.inputContainer.innerHTML = '';
    
    const length = state.currentSequence.length;
    
    for (let i = 0; i < length; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.max = '9';
        input.maxLength = 1;
        input.dataset.index = i;
        
        // Gérer la navigation entre les inputs
        input.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value.length > 1) {
                e.target.value = value.slice(0, 1);
            }
            
            // Passer au prochain input si un chiffre est saisi
            if (value.length === 1 && i < length - 1) {
                const nextInput = elements.inputContainer.querySelector(`input[data-index="${i + 1}"]`);
                if (nextInput) {
                    nextInput.focus();
                }
            }
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && e.target.value === '' && i > 0) {
                const prevInput = elements.inputContainer.querySelector(`input[data-index="${i - 1}"]`);
                if (prevInput) {
                    prevInput.focus();
                }
            }
        });
        
        elements.inputContainer.appendChild(input);
    }
}

// Obtenir le libellé du mode
function getModeLabel() {
    switch (state.mode) {
        case 'forward': return 'normal';
        case 'reverse': return 'inverse';
        case 'ascending': return 'croissant';
        default: return 'normal';
    }
}

// Traiter le résultat de la reconnaissance vocale
function handleSpeechResult(transcript) {
    // Extraire les chiffres de la transcription
    const digits = transcript.match(/\d+/g);
    
    if (digits && digits.length > 0) {
        const answer = digits.join('').split('').map(d => parseInt(d)).slice(0, state.currentSequence.length);
        
        // Remplir les inputs
        const inputs = elements.inputContainer.querySelectorAll('input');
        answer.forEach((digit, index) => {
            if (inputs[index]) {
                inputs[index].value = digit;
            }
        });
        
        showStatus(`Réponse vocale enregistrée: ${answer.join('')}`);
    } else {
        showStatus('Aucun chiffre reconnu. Essayez à nouveau.');
    }
}

// Démarrer l'écoute vocale
function startListening() {
    if (!state.recognition || state.isListening) return;
    
    try {
        state.recognition.start();
        state.isListening = true;
        showStatus('Écoute en cours... Parlez maintenant.');
        updateUI();
    } catch (error) {
        console.error('Erreur lors du démarrage de la reconnaissance vocale:', error);
        showStatus('Erreur lors de l\'activation du microphone.');
    }
}

// Arrêter l'exercice
function stopExercise() {
    if (state.isPlaying) {
        state.synthesis.cancel();
        state.isPlaying = false;
    }
    
    if (state.isListening && state.recognition) {
        state.recognition.stop();
        state.isListening = false;
    }
    
    state.isSubmitting = false;
    showStatus('Exercice arrêté.');
    updateUI();
    
    // Effacer l'affichage
    elements.currentNumber.textContent = '';
    elements.numberDisplay.classList.add('hidden');
}

// Soumettre la réponse
function submitAnswer() {
    if (state.isSubmitting) return;
    
    const inputs = elements.inputContainer.querySelectorAll('input');
    const userAnswer = [];
    
    for (let input of inputs) {
        const value = input.value;
        if (value === '') {
            showModal('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }
        userAnswer.push(parseInt(value));
    }
    
    state.isSubmitting = true;
    
    // Calculer la bonne réponse selon le mode
    const correctAnswer = getCorrectAnswer();
    
    // Vérifier la réponse
    const isCorrect = checkAnswer(userAnswer, correctAnswer);
    
    // Mettre à jour les statistiques
    state.totalCount++;
    if (isCorrect) {
        state.correctCount++;
    }
    
    // Ajouter aux résultats
    state.results.unshift({
        sequence: [...state.currentSequence],
        userAnswer: [...userAnswer],
        correctAnswer: [...correctAnswer],
        isCorrect,
        mode: state.mode,
        date: new Date()
    });
    
    // Limiter à 10 résultats
    if (state.results.length > 10) {
        state.results.pop();
    }
    
    // Mettre à jour l'interface
    updateResults();
    
    // Afficher le feedback
    if (isCorrect) {
        showModal('Bravo ! ✅', `Votre réponse est correcte. La bonne réponse était: ${correctAnswer.join('')}`);
    } else {
        showModal('Presque ! ❌', `Votre réponse: ${userAnswer.join('')}\nLa bonne réponse était: ${correctAnswer.join('')}`);
    }
    
    // Réinitialiser
    state.isSubmitting = false;
    state.isPlaying = false;
    elements.currentNumber.textContent = '';
    elements.numberDisplay.classList.add('hidden');
    updateUI();
}

// Obtenir la bonne réponse selon le mode
function getCorrectAnswer() {
    const sequence = [...state.currentSequence];
    
    switch (state.mode) {
        case 'forward':
            return sequence;
        case 'reverse':
            return sequence.reverse();
        case 'ascending':
            return sequence.sort((a, b) => a - b);
        default:
            return sequence;
    }
}

// Vérifier la réponse
function checkAnswer(userAnswer, correctAnswer) {
    if (userAnswer.length !== correctAnswer.length) return false;
    
    for (let i = 0; i < userAnswer.length; i++) {
        if (userAnswer[i] !== correctAnswer[i]) {
            return false;
        }
    }
    
    return true;
}

// Mettre à jour les résultats
function updateResults() {
    // Mettre à jour la liste des résultats
    elements.resultsList.innerHTML = '';
    
    state.results.forEach((result, index) => {
        const item = document.createElement('div');
        item.className = `result-item ${result.isCorrect ? 'correct' : 'incorrect'}`;
        
        const modeLabel = getModeLabelForMode(result.mode);
        const userStr = result.userAnswer.join('');
        const correctStr = result.correctAnswer.join('');
        
        item.innerHTML = `
            <span>${modeLabel}: ${userStr} → ${correctStr}</span>
            <span>${result.isCorrect ? '✅' : '❌'}</span>
        `;
        
        elements.resultsList.appendChild(item);
    });
    
    // Mettre à jour les statistiques
    elements.correctCount.textContent = state.correctCount;
    
    const successRate = state.totalCount > 0 ? Math.round((state.correctCount / state.totalCount) * 100) : 0;
    elements.successRate.textContent = `${successRate}%`;
}

// Obtenir le libellé du mode pour l'affichage
function getModeLabelForMode(mode) {
    switch (mode) {
        case 'forward': return 'Normal';
        case 'reverse': return 'Inverse';
        case 'ascending': return 'Croissant';
        default: return 'Normal';
    }
}

// Mettre à jour l'interface
function updateUI() {
    elements.startBtn.disabled = state.isPlaying || state.isSubmitting;
    elements.stopBtn.disabled = !state.isPlaying && !state.isListening;
    elements.submitBtn.disabled = !state.currentSequence.length || state.isPlaying || state.isSubmitting;
    
    // Ajouter/supprimer la classe listening
    if (state.isListening) {
        document.body.classList.add('listening');
    } else {
        document.body.classList.remove('listening');
    }
}

// Afficher un statut
function showStatus(message) {
    elements.status.textContent = message;
}

// Afficher une modale
function showModal(title, message) {
    elements.modalTitle.textContent = title;
    elements.modalMessage.textContent = message;
    elements.modal.classList.remove('hidden');
}

// Parler avec TTS
function speak(text) {
    return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        utterance.rate = 1;
        utterance.pitch = 1;
        
        utterance.onend = () => {
            resolve();
        };
        
        utterance.onerror = (event) => {
            console.error('Erreur TTS:', event);
            resolve();
        };
        
        state.synthesis.speak(utterance);
    });
}

// Fonction utilitaire pour attendre
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Démarrer l'application
init();

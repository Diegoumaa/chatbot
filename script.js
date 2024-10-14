document.addEventListener('DOMContentLoaded', function() {
    // Animaciones al hacer scroll
    const sections = document.querySelectorAll('.animate');

    function checkVisibility() {
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight - 100) {
                section.classList.add('visible');
            }
        });
    }

    window.addEventListener('scroll', checkVisibility);
    checkVisibility();

    // Mejora en "Juega y Aprende"
    const quizData = [
        {
            question: "¿Cómo te sientes hoy?",
            options: ["Bien", "Regular", "Mal"],
            feedback: "Gracias por compartir cómo te sientes."
        },
        {
            question: "¿Qué te motiva más?",
            options: ["Familia", "Trabajo", "Amigos"],
            feedback: "Es genial saber qué te motiva."
        },
        {
            question: "¿Cómo manejas el estrés?",
            options: ["Ejercicio", "Meditación", "Hablar con alguien"],
            feedback: "¡Excelente elección para manejar el estrés!"
        }
    ];

    let currentQuiz = 0;
    const quizQuestion = document.getElementById('quiz-question');
    const quizOptions = document.getElementById('quiz-options');
    const quizFeedback = document.getElementById('quiz-feedback');
    const nextQuestionBtn = document.getElementById('next-question');

    function loadQuiz() {
        const currentData = quizData[currentQuiz];
        quizQuestion.textContent = currentData.question;
        quizOptions.innerHTML = '';
        quizFeedback.textContent = '';
        currentData.options.forEach((option, index) => {
            const btn = document.createElement('div');
            btn.textContent = option;
            btn.classList.add('quiz-option');
            btn.addEventListener('click', () => {
                quizFeedback.textContent = currentData.feedback;
                nextQuestionBtn.style.display = 'inline-block';
                quizOptions.querySelectorAll('.quiz-option').forEach(opt => {
                    opt.style.pointerEvents = 'none';
                    opt.style.opacity = '0.6';
                });
                btn.style.opacity = '1';
            });
            quizOptions.appendChild(btn);
        });
    }

    nextQuestionBtn.addEventListener('click', () => {
        currentQuiz++;
        nextQuestionBtn.style.display = 'none';
        if (currentQuiz < quizData.length) {
            loadQuiz();
        } else {
            quizQuestion.textContent = '¡Gracias por participar!';
            quizOptions.innerHTML = '';
            quizFeedback.textContent = '';
        }
    });

    loadQuiz();

    // Acordeón de Preguntas Frecuentes
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const isActive = this.classList.contains('active');

            document.querySelectorAll('.faq-answer').forEach(ans => {
                ans.style.maxHeight = null;
            });
            document.querySelectorAll('.faq-question').forEach(q => {
                q.classList.remove('active');
            });

            if (!isActive) {
                this.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // Carrusel de especialistas
    const specialistCarousel = document.querySelector('.specialist-carousel');
    const prevSpecialistBtn = document.getElementById('prev-specialist');
    const nextSpecialistBtn = document.getElementById('next-specialist');

    prevSpecialistBtn.addEventListener('click', () => {
        specialistCarousel.scrollBy({
            left: -250,
            behavior: 'smooth'
        });
    });

    nextSpecialistBtn.addEventListener('click', () => {
        specialistCarousel.scrollBy({
            left: 250,
            behavior: 'smooth'
        });
    });

    // Carrusel de testimonios
    const testimonials = document.querySelectorAll('.testimonial');
    const prevTestimonialBtn = document.getElementById('prev-testimonial');
    const nextTestimonialBtn = document.getElementById('next-testimonial');
    let currentTestimonial = 0;

    function showTestimonial(index) {
        testimonials.forEach((testimonial, i) => {
            testimonial.classList.remove('active');
            if (i === index) {
                testimonial.classList.add('active');
            }
        });
    }

    prevTestimonialBtn.addEventListener('click', () => {
        currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
        showTestimonial(currentTestimonial);
    });

    nextTestimonialBtn.addEventListener('click', () => {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(currentTestimonial);
    });

    showTestimonial(currentTestimonial);

    // Chatbot emergente con respuestas predefinidas
    const chatbotIcon = document.getElementById('chatbot-icon');
    const chatbotPopup = document.getElementById('chatbot-popup');
    const closeChatbot = document.getElementById('close-chatbot');
    const chatbotContent = document.getElementById('chatbot-content');

    const chatbotConversations = {
        start: {
            message: "Hola, soy tu asistente virtual. ¿En qué puedo ayudarte?",
            options: ["Información sobre servicios", "Agendar una cita", "Hablar con un especialista"]
        },
        "Información sobre servicios": {
            message: "Ofrecemos terapia individual, orientación familiar y asesoramiento en línea.",
            options: ["Volver al inicio"]
        },
        "Agendar una cita": {
            message: "Puedes agendar una cita a través de nuestro formulario en línea o llamando a nuestro número de contacto.",
            options: ["Volver al inicio"]
        },
        "Hablar con un especialista": {
            message: "Un especialista se pondrá en contacto contigo pronto.",
            options: ["Volver al inicio"]
        },
        "Volver al inicio": {
            message: "¿En qué más puedo ayudarte?",
            options: ["Información sobre servicios", "Agendar una cita", "Hablar con un especialista"]
        }
    };

    function addChatbotMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chatbot-message');
        messageElement.innerHTML = `<p>${message}</p>`;
        chatbotContent.appendChild(messageElement);
        chatbotContent.scrollTop = chatbotContent.scrollHeight;
    }

    function showChatbotOptions(options) {
        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('chatbot-options');

        options.forEach(option => {
            const btn = document.createElement('div');
            btn.textContent = option;
            btn.classList.add('chatbot-option');
            btn.addEventListener('click', () => {
                addChatbotMessage(`<strong>Tú:</strong> ${option}`);
                chatbotContent.removeChild(optionsContainer);
                handleChatbotResponse(option);
            });
            optionsContainer.appendChild(btn);
        });

        chatbotContent.appendChild(optionsContainer);
        chatbotContent.scrollTop = chatbotContent.scrollHeight;
    }

    function handleChatbotResponse(option) {
        const response = chatbotConversations[option];
        if (response) {
            setTimeout(() => {
                addChatbotMessage(response.message);
                if (response.options) {
                    showChatbotOptions(response.options);
                }
            }, 500);
        }
    }

    chatbotIcon.addEventListener('click', function() {
        chatbotPopup.style.display = 'flex';
        chatbotContent.innerHTML = '';
        addChatbotMessage(chatbotConversations.start.message);
        showChatbotOptions(chatbotConversations.start.options);
    });

    closeChatbot.addEventListener('click', function() {
        chatbotPopup.style.display = 'none';
    });
});

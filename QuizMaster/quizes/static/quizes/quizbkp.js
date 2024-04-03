// Log a message to the console
console.log('hello world quiz');

// Get the current URL
const url = window.location.href;

// Get the quiz-box, score-box, result-box, and timer-box elements from the DOM
const quizBox = document.getElementById('quiz-box');
const scoreBox = document.getElementById('score-box');
const resultBox = document.getElementById('result-box');
const timerBox = document.getElementById('timer-box');

// Function to activate the timer
const activateTimer = (time) => {
    // Format the time to display
    if (time.toString().length < 2) {
        timerBox.innerHTML = `<b>0${time}:00</b>`;
    } else {
        timerBox.innerHTML = `<b>${time}:00</b>`;
    }

    let minutes = time - 1;
    let seconds = 60;

    // Update the timer every second
    const timer = setInterval(() => {
        seconds--;
        if (seconds < 0) {
            seconds = 59;
            minutes--;
        }
        // Format minutes and seconds for display
        const displayMinutes = minutes.toString().padStart(2, '0');
        const displaySeconds = seconds.toString().padStart(2, '0');
        if (minutes == 0 && seconds == 0) {
            // Display time over message and submit the quiz
            timerBox.innerHTML = '<b>00:00</b>';
            setTimeout(() => {
                clearInterval(timer);
                alert('Time Over');
                sendData();
            }, 500);
        }
        // Update the timer display
        timerBox.innerHTML = `<b>Time Left: ${displayMinutes}:${displaySeconds}</b>`;
    }, 1000);
};

// Make an AJAX request to fetch data from the server
$.ajax({
    type: 'GET',
    url: `${url}data`, // Endpoint to fetch quiz data
    success: function(response) {
        const data = response.data;
        // Iterate over the data received
        data.forEach(el => {
            // Iterate over each question and its answers
            for (const [question, answers] of Object.entries(el)) {
                // Append question to quiz-box
                quizBox.innerHTML += `
                    <hr>
                    <div class="mb-2">
                        <b>${question}</b>
                    </div>`;
                // Append answers to quiz-box
                answers.forEach(answer => {
                    quizBox.innerHTML += `
                        <div>
                            <input type="radio" class="ans" id="${question}-${answer}" name="${question}" value="${answer}">
                            <label for="${question}">${answer}</label>
                        </div>`;
                });
            }
        });
        // Activate the timer with the time received
        activateTimer(response.time);
    },
    error: function(error) {
        console.log(error);
    }
});

// Get the quiz form and csrf token from the DOM
const quizForm = document.getElementById('quiz-form');
const csrf = document.getElementsByName('csrfmiddlewaretoken');

// Function to send data to the server
const sendData = () => {
    // Get all selected answers
    const elements = [...document.getElementsByClassName('ans')];
    // Prepare data to be sent to the server
    const data = { csrfmiddlewaretoken: csrf[0].value };
    elements.forEach(el => {
        if (el.checked) {
            data[el.name] = el.value;
        } else {
            if (!data[el.name]) {
                data[el.name] = null;
            }
        }
    });
    // Make an AJAX request to save data on the server
    $.ajax({
        type: 'POST',
        url: `${url}save/`, // Endpoint to save quiz data
        data: data,
        success: function(response) {
            const results = response.results
            console.log(results)
            quizForm.classList.add('not-visible')
            // Display quiz result
            scoreBox.innerHTML = `${response.passed ? 'Congratulations! ' : 'Oops...:( '} Your result is ${response.score.toFixed(2)}%`;
            // Display individual question results
            results.forEach(res => {
                const resDiv = document.createElement("div")
                for (const [question, resp] of Object.entries(res)) {
                    resDiv.innerHTML += question
                    const cls = ['container', 'p-3', 'text-light', 'h6']
                    resDiv.classList.add(...cls)
                    if (resp == 'not_answered') {
                        resDiv.innerHTML += '- not answered'
                        resDiv.classList.add('bg-danger')
                    } else {
                        const answer = resp['answered']
                        const correct = resp['correct_answer']
                        if (answer == correct) {
                            resDiv.classList.add('bg-success')
                            resDiv.innerHTML += ` answered: ${answer}`
                        } else {
                            resDiv.classList.add('bg-danger')
                            resDiv.innerHTML += ` | correct answer: ${correct}`
                            resDiv.innerHTML += ` | answered: ${answer}`
                        }
                    }
                }
                resultBox.append(resDiv);
            });
        },
        error: function(error) {
            console.log(error);
        }
    });
};

// Add event listener to the quiz form submission
quizForm.addEventListener('submit', e => {
    e.preventDefault(); // Prevent default form submission behavior
    sendData(); // Call sendData function to send data to the server
});
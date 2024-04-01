// Log a message to the console
console.log("Hello word!");

// Get all elements with the class 'modal-button' and convert them to an array
const modalBtns = [...document.getElementsByClassName('modal-button')];
// Get the element with the id 'modal-body-confirm'
const modalBody = document.getElementById('modal-body-confirm');
// Get the element with the id 'start-button'
const startBtn = document.getElementById('start-button')

const url = window.location.href
// Loop through each modal button
modalBtns.forEach(modalBtn => modalBtn.addEventListener('click', () => {
    // Get the value of 'data-*' attributes from the modal button
    const pk = modalBtn.getAttribute('data-pk');
    const name = modalBtn.getAttribute('data-quiz');
    const numQuestions = modalBtn.getAttribute('data-questions');
    const difficulty = modalBtn.getAttribute('data-difficulty');
    const passScore = modalBtn.getAttribute('data-pass');
    const time = modalBtn.getAttribute('data-time');

    // Set the innerHTML of the modal body with dynamic content
    modalBody.innerHTML =
        `<div class="h5 mb-3">Are you sure you want to begin "<b>${name}</b>"</div>
        <div class="text-muted">
            <ul>
                <li>Difficulty: <b>${difficulty}</b></li>
                <li>No of Questions: <b>${numQuestions}</b></li>
                <li>Passing Score: <b>${passScore}%</b></li>
                <li>Duration: <b>${time} min</b></li>
            </ul>
        </div>`

    startBtn.addEventListener('click', ()=>{
        window.location.href = url + pk
    })
}))

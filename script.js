// LPU Grading System
const gradePoints = {
    "O": 10,
    "A+": 9,
    "A": 8,
    "B+": 7,
    "B": 6,
    "C": 5,
    "D": 4,
    "E": 0, // Reappear
    "F": 0, // Fail
    "I": 0  // Incomplete
};

// ----- TGPA Functions -----

function createSubjectRow() {
    const div = document.createElement('div');
    div.className = 'subject-row';
    div.innerHTML = `
        <div class="col">
            <input type="text" placeholder="e.g. Mathematics" class="sub-name">
        </div>
        <div class="col">
            <input type="number" placeholder="4" class="sub-credit" min="1" max="10">
        </div>
        <div class="col">
            <select class="sub-grade">
                <option value="" disabled selected>Grade</option>
                <option value="O">O (Outstanding)</option>
                <option value="A+">A+ (Excellent)</option>
                <option value="A">A (Very Good)</option>
                <option value="B+">B+ (Good)</option>
                <option value="B">B (Above Avg)</option>
                <option value="C">C (Average)</option>
                <option value="D">D (Marginal)</option>
                <option value="E">E (Reappear)</option>
                <option value="F">F (Fail)</option>
            </select>
        </div>
        <div class="col action-col">
            <button class="remove-row-btn" onclick="removeRow(this)">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;
    return div;
}

function addSubjectRow() {
    const container = document.getElementById('subjects-container');
    container.appendChild(createSubjectRow());
}

function removeRow(btn) {
    const row = btn.closest('.subject-row');
    const container = document.getElementById('subjects-container');
    if (container.children.length > 1) {
        row.remove();
    } else {
        // Clear input instead of removing the last row
        row.querySelector('.sub-name').value = '';
        row.querySelector('.sub-credit').value = '';
        row.querySelector('.sub-grade').selectedIndex = 0;
    }
}

function clearTgpaForms() {
    const container = document.getElementById('subjects-container');
    container.innerHTML = '';
    for (let i = 0; i < 3; i++) addSubjectRow(); // Reset to 3 rows
    document.getElementById('tgpa-result').style.display = 'none';
}

function calculateTGPA() {
    const rows = document.querySelectorAll('.subject-row');
    let totalCredits = 0;
    let totalPoints = 0;
    let allValid = true;

    if (rows.length === 0) return;

    for (let row of rows) {
        const creditInput = row.querySelector('.sub-credit');
        const gradeInput = row.querySelector('.sub-grade');

        const credits = parseFloat(creditInput.value);
        const grade = gradeInput.value;

        // Skip empty rows if user didn't fill them
        if (isNaN(credits) && grade === "") continue;

        if (isNaN(credits) || grade === "") {
            allValid = false;
            // Visual feedback could be added here
            creditInput.style.borderColor = isNaN(credits) ? '#ff7675' : '';
            gradeInput.style.borderColor = grade === "" ? '#ff7675' : '';
            continue;
        } else {
            // Reset styles
            creditInput.style.borderColor = '';
            gradeInput.style.borderColor = '';
        }

        const points = gradePoints[grade];
        if (points !== undefined) {
            totalCredits += credits;
            totalPoints += (credits * points);
        }
    }

    if (!allValid || totalCredits === 0) {
        alert("Please fill in Credits and Grade for all subjects correctly.");
        return;
    }

    const tgpa = totalPoints / totalCredits;

    // Display
    const resultBox = document.getElementById('tgpa-result');
    const valueSpan = document.getElementById('tgpa-value');
    const messageSpan = document.getElementById('tgpa-message');

    valueSpan.textContent = tgpa.toFixed(2);
    resultBox.style.display = 'block';

    if (tgpa >= 9) messageSpan.textContent = "Outstanding Performance! 🌟";
    else if (tgpa >= 8) messageSpan.textContent = "Excellent Work! 🔥";
    else if (tgpa >= 7) messageSpan.textContent = "Good Job! 👍";
    else if (tgpa >= 5) messageSpan.textContent = "You Passed. Setup up next time! 📈";
    else messageSpan.textContent = "Needs Improvement. Work Harder! 💪";
    messageSpan.style.color = getMessageColor(tgpa);
}

function getMessageColor(gpa) {
    if (gpa >= 8) return '#00b09b'; // Green/Teal
    if (gpa >= 6) return '#fdcb6e'; // Yellow/Orange
    return '#ff7675'; // Red
}

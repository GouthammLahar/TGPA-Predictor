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

// Global state to share between TGPA and CGPA
let lastCalculatedTgpa = null;
let lastCalculatedCredits = null;

// ==========================================
// ----- Tab Navigation Functions -----
// ==========================================

function switchMainTab(tab) {
    const tgpaTabBtn = document.getElementById('tab-tgpa-btn');
    const cgpaTabBtn = document.getElementById('tab-cgpa-btn');
    const tgpaSection = document.getElementById('tgpa-section');
    const cgpaSection = document.getElementById('cgpa-section');

    if (tab === 'tgpa') {
        tgpaTabBtn.classList.add('active');
        cgpaTabBtn.classList.remove('active');
        tgpaSection.style.display = 'block';
        cgpaSection.style.display = 'none';
    } else {
        cgpaTabBtn.classList.add('active');
        tgpaTabBtn.classList.remove('active');
        cgpaSection.style.display = 'block';
        tgpaSection.style.display = 'none';
    }
}

function switchCgpaMode(mode) {
    const semestersBtn = document.getElementById('subtab-semesters-btn');
    const quickBtn = document.getElementById('subtab-quick-btn');
    const semestersMode = document.getElementById('cgpa-semesters-mode');
    const quickMode = document.getElementById('cgpa-quick-mode');
    const cgpaResult = document.getElementById('cgpa-result');

    // Hide result on mode switch
    cgpaResult.style.display = 'none';

    if (mode === 'semesters') {
        semestersBtn.classList.add('active');
        quickBtn.classList.remove('active');
        semestersMode.style.display = 'block';
        quickMode.style.display = 'none';
    } else {
        quickBtn.classList.add('active');
        semestersBtn.classList.remove('active');
        quickMode.style.display = 'block';
        semestersMode.style.display = 'none';
    }
}

// ==========================================
// ----- TGPA Functions -----
// ==========================================

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
            <button class="remove-row-btn" onclick="removeRow(this)" title="Remove subject">
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
    for (let i = 0; i < 5; i++) addSubjectRow(); // Reset to 5 rows
    document.getElementById('tgpa-result').style.display = 'none';
    lastCalculatedTgpa = null;
    lastCalculatedCredits = null;
}

function calculateTGPA() {
    const rows = document.querySelectorAll('.subject-row');
    let totalCredits = 0;
    let totalPoints = 0;
    let validRowCount = 0;
    let hasInvalidFields = false;

    if (rows.length === 0) return;

    for (let row of rows) {
        const creditInput = row.querySelector('.sub-credit');
        const gradeInput = row.querySelector('.sub-grade');

        const credits = parseFloat(creditInput.value);
        const grade = gradeInput.value;

        // Skip completely empty rows
        if (isNaN(credits) && grade === "") {
            creditInput.style.borderColor = '';
            gradeInput.style.borderColor = '';
            continue;
        }

        if (isNaN(credits) || credits <= 0 || grade === "") {
            hasInvalidFields = true;
            creditInput.style.borderColor = (isNaN(credits) || credits <= 0) ? '#ff7675' : '';
            gradeInput.style.borderColor = grade === "" ? '#ff7675' : '';
            continue;
        } else {
            creditInput.style.borderColor = '';
            gradeInput.style.borderColor = '';
        }

        const points = gradePoints[grade];
        if (points !== undefined) {
            totalCredits += credits;
            totalPoints += (credits * points);
            validRowCount++;
        }
    }

    if (hasInvalidFields || validRowCount === 0 || totalCredits === 0) {
        alert("Please enter valid Credits (> 0) and Grade for at least one subject.");
        return;
    }

    const tgpa = totalPoints / totalCredits;
    lastCalculatedTgpa = parseFloat(tgpa.toFixed(2));
    lastCalculatedCredits = totalCredits;

    // Display
    const resultBox = document.getElementById('tgpa-result');
    const valueSpan = document.getElementById('tgpa-value');
    const messageSpan = document.getElementById('tgpa-message');

    valueSpan.textContent = tgpa.toFixed(2);
    resultBox.style.display = 'block';

    if (tgpa >= 9) messageSpan.textContent = "Outstanding Performance! 🌟";
    else if (tgpa >= 8) messageSpan.textContent = "Excellent Work! 🔥";
    else if (tgpa >= 7) messageSpan.textContent = "Good Job! 👍";
    else if (tgpa >= 5) messageSpan.textContent = "You Passed. Step up next time! 📈";
    else messageSpan.textContent = "Needs Improvement. Work Harder! 💪";
    messageSpan.style.color = getMessageColor(tgpa);

    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Send TGPA to CGPA Quick Calculator
function transferTgpaToCgpa() {
    if (lastCalculatedTgpa === null) {
        alert("Please calculate your TGPA first!");
        return;
    }

    switchMainTab('cgpa');
    switchCgpaMode('quick');

    const currTgpaInput = document.getElementById('curr-tgpa');
    const currCreditsInput = document.getElementById('curr-credits');
    const prevCgpaInput = document.getElementById('prev-cgpa');

    currTgpaInput.value = lastCalculatedTgpa;
    currCreditsInput.value = lastCalculatedCredits;

    // Highlight populated fields
    currTgpaInput.classList.add('field-highlight');
    currCreditsInput.classList.add('field-highlight');
    setTimeout(() => {
        currTgpaInput.classList.remove('field-highlight');
        currCreditsInput.classList.remove('field-highlight');
    }, 1500);

    prevCgpaInput.focus();
}

// ==========================================
// ----- CGPA Semester-Wise Functions -----
// ==========================================

function initSemesters() {
    const container = document.getElementById('semesters-container');
    container.innerHTML = '';
    for (let i = 1; i <= 4; i++) {
        container.appendChild(createSemesterRow(i));
    }
}

function createSemesterRow(semNumber) {
    const div = document.createElement('div');
    div.className = 'semester-row';
    div.innerHTML = `
        <div class="col col-sem-name">
            <input type="text" class="sem-name" value="Semester ${semNumber}" placeholder="e.g. Sem ${semNumber}">
        </div>
        <div class="col">
            <input type="number" class="sem-tgpa" placeholder="TGPA (e.g. 8.5)" min="0" max="10" step="0.01">
        </div>
        <div class="col">
            <input type="number" class="sem-credits" placeholder="Credits (e.g. 20)" min="1" max="50" step="1" value="20">
        </div>
        <div class="col action-col">
            <button class="remove-row-btn" onclick="removeSemesterRow(this)" title="Remove semester">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;
    return div;
}

function addSemesterRow() {
    const container = document.getElementById('semesters-container');
    const currentCount = container.children.length;
    container.appendChild(createSemesterRow(currentCount + 1));
}

function removeSemesterRow(btn) {
    const row = btn.closest('.semester-row');
    const container = document.getElementById('semesters-container');
    if (container.children.length > 1) {
        row.remove();
    } else {
        row.querySelector('.sem-tgpa').value = '';
        row.querySelector('.sem-credits').value = '20';
    }
}

function clearCgpaSemesters() {
    initSemesters();
    document.getElementById('cgpa-result').style.display = 'none';
}

function calculateSemesterCgpa() {
    const rows = document.querySelectorAll('.semester-row');
    let totalWeightedPoints = 0;
    let totalCredits = 0;
    let validSemCount = 0;
    let hasInvalidFields = false;

    for (let row of rows) {
        const tgpaInput = row.querySelector('.sem-tgpa');
        const creditInput = row.querySelector('.sem-credits');

        const tgpaVal = parseFloat(tgpaInput.value);
        const creditVal = parseFloat(creditInput.value);

        // Skip completely empty TGPA rows
        if (isNaN(tgpaVal) && isNaN(creditVal)) {
            tgpaInput.style.borderColor = '';
            creditInput.style.borderColor = '';
            continue;
        }

        if (isNaN(tgpaVal) || tgpaVal < 0 || tgpaVal > 10) {
            hasInvalidFields = true;
            tgpaInput.style.borderColor = '#ff7675';
            continue;
        } else {
            tgpaInput.style.borderColor = '';
        }

        if (isNaN(creditVal) || creditVal <= 0) {
            hasInvalidFields = true;
            creditInput.style.borderColor = '#ff7675';
            continue;
        } else {
            creditInput.style.borderColor = '';
        }

        totalCredits += creditVal;
        totalWeightedPoints += (tgpaVal * creditVal);
        validSemCount++;
    }

    if (hasInvalidFields || validSemCount === 0 || totalCredits === 0) {
        alert("Please enter a valid TGPA (0 to 10) and Credits (> 0) for your semesters.");
        return;
    }

    const cgpa = totalWeightedPoints / totalCredits;
    displayCgpaResult(cgpa, `Calculated across ${validSemCount} semesters • Total Credits: ${totalCredits}`);
}

// ==========================================
// ----- CGPA Quick Mode Functions -----
// ==========================================

function calculateQuickCgpa() {
    const prevCgpaInput = document.getElementById('prev-cgpa');
    const prevCreditsInput = document.getElementById('prev-credits');
    const currTgpaInput = document.getElementById('curr-tgpa');
    const currCreditsInput = document.getElementById('curr-credits');

    const prevCgpa = parseFloat(prevCgpaInput.value);
    const prevCredits = parseFloat(prevCreditsInput.value);
    const currTgpa = parseFloat(currTgpaInput.value);
    const currCredits = parseFloat(currCreditsInput.value);

    let isValid = true;

    if (isNaN(prevCgpa) || prevCgpa < 0 || prevCgpa > 10) {
        prevCgpaInput.style.borderColor = '#ff7675';
        isValid = false;
    } else {
        prevCgpaInput.style.borderColor = '';
    }

    if (isNaN(prevCredits) || prevCredits <= 0) {
        prevCreditsInput.style.borderColor = '#ff7675';
        isValid = false;
    } else {
        prevCreditsInput.style.borderColor = '';
    }

    if (isNaN(currTgpa) || currTgpa < 0 || currTgpa > 10) {
        currTgpaInput.style.borderColor = '#ff7675';
        isValid = false;
    } else {
        currTgpaInput.style.borderColor = '';
    }

    if (isNaN(currCredits) || currCredits <= 0) {
        currCreditsInput.style.borderColor = '#ff7675';
        isValid = false;
    } else {
        currCreditsInput.style.borderColor = '';
    }

    if (!isValid) {
        alert("Please check all fields. GPA must be between 0 and 10, and credits must be greater than 0.");
        return;
    }

    const totalCredits = prevCredits + currCredits;
    const totalPoints = (prevCgpa * prevCredits) + (currTgpa * currCredits);
    const newCgpa = totalPoints / totalCredits;
    const diff = newCgpa - prevCgpa;

    let diffHtml = '';
    if (diff > 0.001) {
        diffHtml = `<span class="diff-badge positive"><i class="fa-solid fa-arrow-trend-up"></i> +${diff.toFixed(2)} (Improved)</span>`;
    } else if (diff < -0.001) {
        diffHtml = `<span class="diff-badge negative"><i class="fa-solid fa-arrow-trend-down"></i> ${diff.toFixed(2)} (Decreased)</span>`;
    } else {
        diffHtml = `<span class="diff-badge neutral"><i class="fa-solid fa-minus"></i> No Change</span>`;
    }

    const statsInfo = `Total Credits: ${totalCredits} • ${diffHtml}`;
    displayCgpaResult(newCgpa, statsInfo);
}

function clearQuickCgpaForm() {
    document.getElementById('prev-cgpa').value = '';
    document.getElementById('prev-credits').value = '';
    document.getElementById('curr-tgpa').value = '';
    document.getElementById('curr-credits').value = '';
    document.getElementById('cgpa-result').style.display = 'none';
}

// Display CGPA Result Helper
function displayCgpaResult(cgpa, statsHtml) {
    const resultBox = document.getElementById('cgpa-result');
    const valueSpan = document.getElementById('cgpa-value');
    const statsDiv = document.getElementById('cgpa-stats');
    const messageSpan = document.getElementById('cgpa-message');

    valueSpan.textContent = cgpa.toFixed(2);
    if (statsHtml) {
        statsDiv.innerHTML = statsHtml;
        statsDiv.style.display = 'block';
    } else {
        statsDiv.style.display = 'none';
    }

    if (cgpa >= 9) messageSpan.textContent = "Outstanding Performance! 🌟";
    else if (cgpa >= 8) messageSpan.textContent = "Excellent Academic Standing! 🔥";
    else if (cgpa >= 7) messageSpan.textContent = "Great Progress! 👍";
    else if (cgpa >= 5) messageSpan.textContent = "Satisfactory! Aim higher next semester! 📈";
    else messageSpan.textContent = "Needs Academic Focus. Push harder! 💪";

    messageSpan.style.color = getMessageColor(cgpa);
    resultBox.style.display = 'block';
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function getMessageColor(gpa) {
    if (gpa >= 8) return '#00b09b'; // Green/Teal
    if (gpa >= 6) return '#fdcb6e'; // Yellow/Orange
    return '#ff7675'; // Red
}

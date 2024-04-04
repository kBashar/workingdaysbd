document.addEventListener('DOMContentLoaded', () => {
    let publicHolidays = {};

    // Load public holidays from the JSON file
    fetch('holidays.json')
        .then(response => response.json())
        .then(data => {
            publicHolidays = data;
        })
        .catch(error => console.error('Error loading public holidays:', error));

    document.getElementById('startDate').valueAsDate = new Date();

    document.getElementById('calculateBtn').addEventListener('click', () => {
        const startDate = document.getElementById('startDate').value;
        const daysToAdd = parseInt(document.getElementById('daysToAdd').value);
        const weekends = Array.from(document.querySelectorAll('input[name="weekend"]:checked')).map(el => parseInt(el.value));
        const results = calculateWorkingDaysDetailed(startDate, daysToAdd, Object.keys(publicHolidays), weekends, publicHolidays);
        
        showResults(results.resultDate, results.weekendDates, results.holidays, results.workingDates, publicHolidays);
    });
});

function calculateWorkingDaysDetailed(startDate, daysToAdd, publicHolidays, weekends, holidaysData) {
    let currentDate = new Date(startDate);
    let holidaysCounted = [];
    let weekendDates = [];
    let workingDates = [];
    let totalDays = 0;

    while (daysToAdd > 0) {
        currentDate.setDate(currentDate.getDate() + 1);
        totalDays++;
        let dayOfWeek = currentDate.getDay();
        let dateString = currentDate.toISOString().split('T')[0];
        let isWeekend = weekends.includes(dayOfWeek);
        let isPublicHoliday = publicHolidays.includes(dateString);

        if (isWeekend) {
            weekendDates.push(dateString);
        } else if (isPublicHoliday) {
            holidaysCounted.push(dateString);
        } else {
            daysToAdd--;
            workingDates.push(dateString);
        }
    }

    return {
        resultDate: currentDate.toISOString().split('T')[0],
        totalDays,
        holidays: holidaysCounted,
        weekendDates,
        workingDates
    };
}

function showResults(resultDate, weekendDates, holidays, workingDates, holidaysData) {
    document.getElementById('resultDate').textContent = resultDate;

    // Clear previous details
    const detailsContainer = document.getElementById('detailsContainer');
    detailsContainer.innerHTML = '';

    // Conditionally show sections
    if (weekendDates.length > 0) {
        detailsContainer.appendChild(createDetailSection('Weekends', weekendDates.length, weekendDates.map(formatDateDetail)));
    }

    if (holidays.length > 0) {
        detailsContainer.appendChild(createDetailSection('Holidays', holidays.length, holidays.map(holiday => formatHolidayDetail(holiday, holidaysData[holiday]))));
    }

    // if (workingDates.length > 0) {
    //     detailsContainer.appendChild(createDetailSection('Working Days', workingDates.length, workingDates.map(formatDateDetail)));
    // }
}

function createDetailSection(title, count, details) {
    const section = document.createElement('div');
    section.className = 'details-section';
    const titleEl = document.createElement('div');
    titleEl.className = 'details-title';
    const titleText = `${count} ${title}${count !== 1 ? 's' : ''}`;
    titleEl.onclick = () => {
        titleEl.classList.toggle('active');
        contentEl.classList.toggle('active'); // Show/hide the details
    };
    section.appendChild(titleEl);

    const contentEl = document.createElement('div');
    contentEl.className = 'details-content';
    details.forEach(detail => {
        contentEl.appendChild(detail);
    });
    section.appendChild(contentEl);

    return section;
}

function formatDateDetail(dateString) {
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const p = document.createElement('p');
    p.textContent = `${dateString} - ${dayName}`;
    return p;
}

function formatHolidayDetail(dateString, holiday) {
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const p = document.createElement('p');
    p.textContent = `${dateString} - ${dayName}, ${holiday.Name} (${holiday.Type})`;
    return p;
}

// ... additional functions as needed ...

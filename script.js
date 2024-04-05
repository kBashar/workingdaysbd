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
        
        const formattedResultDate = formatDate(results.resultDate);
        showResults(formattedResultDate, results.weekendDates, results.holidays, results.workingDates, publicHolidays);
    });
});

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

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
        detailsContainer.appendChild(createDetailSection('Weekend', weekendDates.length, weekendDates.map(formatDateDetail)));
    }

    if (holidays.length > 0) {
        detailsContainer.appendChild(createDetailSection('Holiday', holidays.length, holidays.map(holiday => formatHolidayDetail(holiday, holidaysData[holiday]))));
    }

    // if (workingDates.length > 0) {
    //     detailsContainer.appendChild(createDetailSection('Working Days', workingDates.length, workingDates.map(formatDateDetail)));
    // }
}

function createDetailSection(title, count, details) {
    const section = document.createElement('div');
    section.className = 'details-section has-details';
    
    // Add correct pluralization
    const titleText = `${count} ${title}${count !== 1 ? 's' : ''}`;
    
    // Create the expand/collapse indicator
    const indicator = document.createElement('span');
    indicator.textContent = '▼'; // Downward triangle for collapsed
    indicator.className = 'details-indicator';

    const titleEl = document.createElement('div');
    titleEl.className = 'details-title';
    titleEl.appendChild(indicator); // Append the indicator to the title
    const textNode = document.createTextNode(' ' + titleText);
    titleEl.appendChild(textNode); // Append the title text

    titleEl.onclick = () => {
        titleEl.classList.toggle('active');
        contentEl.classList.toggle('active'); // Show/hide the details
        // Change the indicator based on whether the section is expanded or collapsed
        indicator.textContent = titleEl.classList.contains('active') ? '▲' : '▼';
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
    const formattedDate = formatDate(dateString);
    const dayName = new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' });
    const p = document.createElement('p');
    p.textContent = `${formattedDate} - ${dayName}`;
    return p;
}

function formatHolidayDetail(dateString, holiday) {
    const formattedDate = formatDate(dateString);
    const dayName = new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' });
    const p = document.createElement('p');
    p.textContent = `${formattedDate} - ${dayName}, ${holiday.Name} (${holiday.Type})`;
    return p;
}
// ... additional functions as needed ...

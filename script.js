document.addEventListener('DOMContentLoaded', () => {
    let publicHolidays = {};

    // Load public holidays from the JSON file
    fetch('holidays.json')
        .then(response => response.json())
        .then(data => {
            publicHolidays = data;
        })
        .catch(error => console.error('Error loading public holidays:', error));

    document.getElementById('calculateBtn').addEventListener('click', () => {
        const startDate = document.getElementById('startDate').value;
        const daysToAddError = document.getElementById('daysToAddError');
        const daysToAddInput = document.getElementById('daysToAdd');
        const daysToAdd = parseInt(daysToAddInput.value);

        // Clear previous error message
        daysToAddError.textContent = '';

        // Validate input
        if (!daysToAdd || daysToAdd < parseInt(daysToAddInput.min, 10)) {
            daysToAddError.textContent = 'Please enter a valid number of days to add.';
            return; // Prevent the calculation from proceeding
        }
        const weekends = Array.from(document.querySelectorAll('input[name="weekend"]:checked')).map(el => parseInt(el.value));
        const results = calculateWorkingDaysDetailed(startDate, daysToAdd, Object.keys(publicHolidays), weekends, publicHolidays);
        
        const formattedResultDate = formatDate(results.resultDate);
        showResults(formattedResultDate, results.weekendDates, results.holidays, results.workingDates, publicHolidays);
    });
    document.querySelectorAll('input[name="calculationMode"]').forEach(radio => {
        radio.addEventListener('change', handleModeChange);
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
    const dayName = new Date(formatDate(resultDate)).toLocaleDateString('en-US', { weekday: 'long' });
    const result_date_str = `${formatDate(resultDate)} (${dayName})`
    document.getElementById('resultDate').textContent = result_date_str;

    // Clear previous details
    const detailsContainer = document.getElementById('detailsContainer');
    detailsContainer.innerHTML = '';

    // Conditionally show sections
    if (weekendDates.length > 0) {
        detailsContainer.appendChild(createDetailSection('Weekend', weekendDates.length, createDetailsTable(weekendDates)));
    }

    if (holidays.length > 0) {
        detailsContainer.appendChild(createDetailSection('Holiday', holidays.length, createDetailsTable(holidays, true, holidaysData)));
    }

    // Uncomment if you want to show working days in the same table format
    // if (workingDates.length > 0) {
    //     detailsContainer.appendChild(createDetailSection('Working Day', workingDates.length, createDetailsTable(workingDates)));
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
    contentEl.appendChild(details);
    section.appendChild(contentEl);

    return section;
}

function createDetailsTable(details, isHoliday = false, holidaysData = {}) {
    // Create table elements
    const table = document.createElement('table');
    table.className = 'details-table';
    
    // Add table body
    const tbody = document.createElement('tbody');
    details.forEach(dateString => {
        const tr = document.createElement('tr');
        const dateTd = document.createElement('td');
        const dayNameTd = document.createElement('td');
        const nameTd = document.createElement('td');

        const formattedDate = formatDate(dateString);
        const dayName = new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' });
        dateTd.textContent = `${formattedDate}`;
        dayNameTd.textContent = `${dayName}`;
        tr.appendChild(dateTd);
        tr.appendChild(dayNameTd);
        
        if (isHoliday) {
            nameTd.textContent = `${holidaysData[dateString].Name}`;
            tr.appendChild(nameTd);
        }

        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    
    return table;
}

function handleModeChange(event) {
    const mode = event.target.value;
    const workingDaysDiv = document.getElementById('workingDaysCalculation');
    const deadlineDiv = document.getElementById('deadlineCalculation');

    if (mode === 'workingDays') {
        workingDaysDiv.style.display = 'block'; // Show working days calculation div
        deadlineDiv.style.display = 'none';     // Hide deadline calculation div
        document.getElementById('startDate').valueAsDate = new Date();
    } else if (mode === 'deadline') {
        workingDaysDiv.style.display = 'none';  // Hide working days calculation div
        deadlineDiv.style.display = 'block';    // Show deadline calculation div
        document.getElementById('deadlineStartDate').valueAsDate = new Date();

    }
    // Reset or adjust other UI elements as necessary
}
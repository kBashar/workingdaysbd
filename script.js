document.addEventListener('DOMContentLoaded', () => {
    let publicHolidays = {};

    // Load public holidays from the JSON file
    fetch('holidays.json')
        .then(response => response.json())
        .then(data => {
            publicHolidays = data;
            console.log('Public Holidays Loaded:', publicHolidays);
        })
        .catch(error => console.error('Error loading public holidays:', error));

    // Set the start date to today
    document.getElementById('startDate').valueAsDate = new Date();

    document.getElementById('calculateBtn').addEventListener('click', () => {
        const startDate = document.getElementById('startDate').value;
        const daysToAdd = parseInt(document.getElementById('daysToAdd').value);
        const resultDate = calculateWorkingDays(startDate, daysToAdd, Object.keys(publicHolidays));
        document.getElementById('result').textContent = `Result Date: ${resultDate}`;
    });
});

function calculateWorkingDays(startDate, daysToAdd, publicHolidays) {
    const weekends = [5, 6]; // Friday and Saturday
    let currentDate = new Date(startDate);

    while (daysToAdd > 0) {
        currentDate.setDate(currentDate.getDate() + 1);
        let dayOfWeek = currentDate.getDay();
        let isWeekend = weekends.includes(dayOfWeek);
        let isPublicHoliday = publicHolidays.includes(currentDate.toISOString().split('T')[0]);

        if (!isWeekend && !isPublicHoliday) {
            daysToAdd--;
        }
    }

    return currentDate.toISOString().split('T')[0]; // Returns the final date in YYYY-MM-DD format
}

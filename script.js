document.addEventListener('DOMContentLoaded', () => {
    const publicHolidays = ['2024-05-01', '2024-07-04', '2024-12-25']; // Example public holidays
    document.getElementById('startDate').valueAsDate = new Date();

    document.getElementById('calculateBtn').addEventListener('click', () => {
        const startDate = document.getElementById('startDate').value;
        const daysToAdd = parseInt(document.getElementById('daysToAdd').value);
        const resultDate = calculateWorkingDays(startDate, daysToAdd, publicHolidays);
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

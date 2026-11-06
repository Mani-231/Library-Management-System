
const API_URL = 'http://localhost:5000/api';

// Load dashboard statistics from PostgreSQL
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_URL}/dashboard/stats`);

        if (!response.ok) {
            throw new Error('Unable to fetch dashboard data');
        }

        const data = await response.json();

        // Display statistics
        document.getElementById('totalBooks').textContent =
            data.total_book_titles;

        document.getElementById('totalCopies').textContent =
            data.total_book_copies;

        document.getElementById('totalMembers').textContent =
            data.total_members;

        document.getElementById('currentlyIssued').textContent =
            data.currently_issued;

        document.getElementById('overdueBooks').textContent =
            data.overdue_books;

        document.getElementById('availableCopies').textContent =
            data.available_copies;

        console.log('Dashboard data loaded successfully:', data);

    } catch (error) {
        console.error('Dashboard loading error:', error);

        document.getElementById('totalBooks').textContent = 'Error';
    }
}

// Run when dashboard page loads
document.addEventListener('DOMContentLoaded', loadDashboardStats);

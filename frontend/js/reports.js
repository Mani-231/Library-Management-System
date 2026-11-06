
const API_URL = 'http://localhost:5000/api/reports';

const elements = {
    totalTitles: document.getElementById('totalTitles'),
    totalCopies: document.getElementById('totalCopies'),
    totalMembers: document.getElementById('totalMembers'),
    currentlyIssued: document.getElementById('currentlyIssued'),
    overdueBooks: document.getElementById('overdueBooks'),
    availableCopies: document.getElementById('availableCopies'),
    categoryTable: document.getElementById('categoryTable'),
    overdueTable: document.getElementById('overdueTable'),
    popularBooksTable: document.getElementById('popularBooksTable'),
    overdueCount: document.getElementById('overdueCount'),
    message: document.getElementById('message'),
    refreshButton: document.getElementById('refreshButton')
};

// Display a message inside a table
function showTableMessage(table, columns, message) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');

    cell.colSpan = columns;
    cell.textContent = message;

    row.appendChild(cell);
    table.replaceChildren(row);
}

// Safely create table rows using textContent
function addTableRow(table, values) {
    const row = document.createElement('tr');

    values.forEach(value => {
        const cell = document.createElement('td');
        cell.textContent = value ?? '-';
        row.appendChild(cell);
    });

    table.appendChild(row);
}

// 1. Load summary report
async function loadSummary() {
    const response = await fetch(`${API_URL}/summary`);

    if (!response.ok) {
        throw new Error('Unable to load summary report');
    }

    const data = await response.json();

    elements.totalTitles.textContent = data.total_book_titles;
    elements.totalCopies.textContent = data.total_book_copies;
    elements.totalMembers.textContent = data.total_members;
    elements.currentlyIssued.textContent = data.currently_issued;
    elements.overdueBooks.textContent = data.overdue_books;
    elements.availableCopies.textContent = data.available_copies;
}

// 2. Load category report
async function loadCategories() {
    const response = await fetch(`${API_URL}/categories`);

    if (!response.ok) {
        throw new Error('Unable to load category report');
    }

    const categories = await response.json();

    elements.categoryTable.replaceChildren();

    if (categories.length === 0) {
        showTableMessage(
            elements.categoryTable,
            4,
            'No category data available.'
        );
        return;
    }

    categories.forEach(category => {
        addTableRow(elements.categoryTable, [
            category.category,
            category.total_titles,
            category.total_copies,
            category.available_copies
        ]);
    });
}

// 3. Load overdue report
async function loadOverdue() {
    const response = await fetch(`${API_URL}/overdue`);

    if (!response.ok) {
        throw new Error('Unable to load overdue report');
    }

    const overdueBooks = await response.json();

    elements.overdueTable.replaceChildren();

    elements.overdueCount.textContent =
        `${overdueBooks.length} overdue`;

    if (overdueBooks.length === 0) {
        showTableMessage(
            elements.overdueTable,
            6,
            'No overdue books found.'
        );
        return;
    }

    overdueBooks.forEach(book => {
        addTableRow(elements.overdueTable, [
            book.issue_id,
            book.book_title,
            book.member_name,
            book.member_phone,
            book.due_date,
            book.days_overdue
        ]);
    });
}

// 4. Load popular books report
async function loadPopularBooks() {
    const response = await fetch(`${API_URL}/popular-books`);

    if (!response.ok) {
        throw new Error('Unable to load popular books report');
    }

    const books = await response.json();

    elements.popularBooksTable.replaceChildren();

    if (books.length === 0) {
        showTableMessage(
            elements.popularBooksTable,
            5,
            'No books available.'
        );
        return;
    }

    books.forEach(book => {
        addTableRow(elements.popularBooksTable, [
            book.book_id,
            book.title,
            book.author,
            book.category,
            book.times_issued
        ]);
    });
}

// Load all reports
async function loadReports() {
    elements.refreshButton.disabled = true;
    elements.message.textContent = '';
    elements.message.className = 'message';

    try {
        await Promise.all([
            loadSummary(),
            loadCategories(),
            loadOverdue(),
            loadPopularBooks()
        ]);

        console.log('All reports loaded successfully.');

    } catch (error) {
        console.error('Reports loading error:', error);

        elements.message.textContent =
            `${error.message}. Please check the backend server.`;

        elements.message.className = 'message error';

    } finally {
        elements.refreshButton.disabled = false;
    }
}

elements.refreshButton.addEventListener('click', loadReports);

document.addEventListener('DOMContentLoaded', loadReports);

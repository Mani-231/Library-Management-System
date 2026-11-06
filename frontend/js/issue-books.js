
const API_URL = 'http://localhost:5000/api/issues';

const issueForm = document.getElementById('issueForm');
const bookSelect = document.getElementById('bookId');
const memberSelect = document.getElementById('memberId');
const dueDateInput = document.getElementById('dueDate');
const issueButton = document.getElementById('issueButton');
const message = document.getElementById('message');
const issuesTableBody = document.getElementById('issuesTableBody');
const issueCount = document.getElementById('issueCount');

// Display messages
function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
}

// Load available books and members
async function loadOptions() {
    try {
        const response = await fetch(`${API_URL}/options`);

        if (!response.ok) {
            throw new Error('Unable to load books and members');
        }

        const data = await response.json();

        bookSelect.innerHTML = '<option value="">Select a book</option>';

        data.books.forEach(book => {
            const option = document.createElement('option');

            option.value = book.book_id;
            option.textContent =
                `${book.title} (${book.available_copies} available)`;

            bookSelect.appendChild(option);
        });

        if (data.books.length === 0) {
            bookSelect.innerHTML =
                '<option value="">No books available</option>';
        }

        memberSelect.innerHTML =
            '<option value="">Select a member</option>';

        data.members.forEach(member => {
            const option = document.createElement('option');

            option.value = member.member_id;
            option.textContent = member.name;

            memberSelect.appendChild(option);
        });

        if (data.members.length === 0) {
            memberSelect.innerHTML =
                '<option value="">No members registered</option>';
        }

    } catch (error) {
        console.error('Options loading error:', error);
        showMessage(error.message, 'error');
    }
}

// Load currently issued books
async function loadActiveIssues() {
    try {
        const response = await fetch(`${API_URL}/active`);

        if (!response.ok) {
            throw new Error('Unable to load issued books');
        }

        const issues = await response.json();

        issuesTableBody.innerHTML = '';
        issueCount.textContent = `${issues.length} active issues`;

        if (issues.length === 0) {
            issuesTableBody.innerHTML = `
                <tr>
                    <td colspan="5">No books are currently issued.</td>
                </tr>
            `;
            return;
        }

        issues.forEach(issue => {
            const row = document.createElement('tr');

            const values = [
                issue.issue_id,
                issue.title,
                issue.member_name,
                issue.issue_date,
                issue.due_date
            ];

            values.forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.appendChild(cell);
            });

            issuesTableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Active issues loading error:', error);

        issuesTableBody.innerHTML = `
            <tr>
                <td colspan="5">Unable to load issued books.</td>
            </tr>
        `;

        issueCount.textContent = 'Error';
    }
}

// Set minimum due date to today
function setMinimumDueDate() {
    const today = new Date();
    const localDate = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().split('T')[0];

    dueDateInput.min = localDate;
}

// Issue a book
issueForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const bookId = Number(bookSelect.value);
    const memberId = Number(memberSelect.value);
    const dueDate = dueDateInput.value;

    if (!bookId || !memberId || !dueDate) {
        showMessage('Please select a book, member and due date.', 'error');
        return;
    }

    issueButton.disabled = true;
    issueButton.textContent = 'Processing...';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                book_id: bookId,
                member_id: memberId,
                due_date: dueDate
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Unable to issue book');
        }

        showMessage('Book issued successfully!', 'success');

        issueForm.reset();
        setMinimumDueDate();

        await loadOptions();
        await loadActiveIssues();

    } catch (error) {
        console.error('Issue book error:', error);
        showMessage(error.message, 'error');

    } finally {
        issueButton.disabled = false;
        issueButton.textContent = 'Issue Book';
    }
});

// Load data when page opens
document.addEventListener('DOMContentLoaded', () => {
    setMinimumDueDate();
    loadOptions();
    loadActiveIssues();
});

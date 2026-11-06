
const API_URL = 'http://localhost:5000/api/issues';

const issuesTableBody = document.getElementById('issuesTableBody');
const issueCount = document.getElementById('issueCount');
const message = document.getElementById('message');
const refreshButton = document.getElementById('refreshButton');

// Display messages
function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
}

// Load currently issued books
async function loadActiveIssues() {
    try {
        refreshButton.disabled = true;

        const response = await fetch(`${API_URL}/active`);

        if (!response.ok) {
            throw new Error('Unable to load active issues');
        }

        const issues = await response.json();

        issuesTableBody.innerHTML = '';
        issueCount.textContent = `${issues.length} active issues`;

        if (issues.length === 0) {
            issuesTableBody.innerHTML = `
                <tr>
                    <td colspan="6">No books are currently issued.</td>
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

            const actionCell = document.createElement('td');
            const returnButton = document.createElement('button');

            returnButton.textContent = 'Return Book';
            returnButton.className = 'return-button';

            returnButton.addEventListener('click', () => {
                returnBook(issue.issue_id, returnButton);
            });

            actionCell.appendChild(returnButton);
            row.appendChild(actionCell);

            issuesTableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Loading active issues error:', error);

        issuesTableBody.innerHTML = `
            <tr>
                <td colspan="6">Unable to load records. Check the backend server.</td>
            </tr>
        `;

        issueCount.textContent = 'Error';

    } finally {
        refreshButton.disabled = false;
    }
}

// Return a selected book
async function returnBook(issueId, button) {
    const confirmed = confirm(
        'Are you sure you want to mark this book as returned?'
    );

    if (!confirmed) {
        return;
    }

    button.disabled = true;
    button.textContent = 'Processing...';

    try {
        const response = await fetch(
            `${API_URL}/${issueId}/return`,
            {
                method: 'PUT'
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Unable to return book');
        }

        showMessage('Book returned successfully!', 'success');

        await loadActiveIssues();

    } catch (error) {
        console.error('Return book error:', error);

        showMessage(error.message, 'error');

        button.disabled = false;
        button.textContent = 'Return Book';
    }
}

// Refresh records
refreshButton.addEventListener('click', loadActiveIssues);

// Load records when page opens
document.addEventListener('DOMContentLoaded', loadActiveIssues);

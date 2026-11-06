
const API_URL = 'http://localhost:5000/api/transactions';

const transactionsTableBody =
    document.getElementById('transactionsTableBody');

const transactionCount =
    document.getElementById('transactionCount');

const totalTransactions =
    document.getElementById('totalTransactions');

const issuedTransactions =
    document.getElementById('issuedTransactions');

const returnedTransactions =
    document.getElementById('returnedTransactions');

const message = document.getElementById('message');

const refreshButton = document.getElementById('refreshButton');

// Load all transactions
async function loadTransactions() {
    try {
        refreshButton.disabled = true;

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Unable to retrieve transactions');
        }

        const transactions = await response.json();

        transactionsTableBody.innerHTML = '';

        const issuedCount = transactions.filter(
            item => item.status === 'Issued'
        ).length;

        const returnedCount = transactions.filter(
            item => item.status === 'Returned'
        ).length;

        totalTransactions.textContent = transactions.length;
        issuedTransactions.textContent = issuedCount;
        returnedTransactions.textContent = returnedCount;

        transactionCount.textContent =
            `${transactions.length} transactions`;

        if (transactions.length === 0) {
            transactionsTableBody.innerHTML = `
                <tr>
                    <td colspan="8">No transactions found.</td>
                </tr>
            `;
            return;
        }

        transactions.forEach(transaction => {
            const row = document.createElement('tr');

            const values = [
                transaction.issue_id,
                transaction.book_title,
                transaction.member_name,
                transaction.librarian_name,
                transaction.issue_date,
                transaction.due_date,
                transaction.return_date || 'Not returned'
            ];

            values.forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.appendChild(cell);
            });

            const statusCell = document.createElement('td');
            const statusBadge = document.createElement('span');

            statusBadge.textContent = transaction.status;
            statusBadge.className =
                `status ${transaction.status.toLowerCase()}`;

            statusCell.appendChild(statusBadge);
            row.appendChild(statusCell);

            transactionsTableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Transactions loading error:', error);

        transactionsTableBody.innerHTML = `
            <tr>
                <td colspan="8">Unable to load transactions. Check the backend server.</td>
            </tr>
        `;

        transactionCount.textContent = 'Error';
        message.textContent = error.message;
        message.className = 'message error';

    } finally {
        refreshButton.disabled = false;
    }
}

// Refresh transactions
refreshButton.addEventListener('click', loadTransactions);

// Load when page opens
document.addEventListener('DOMContentLoaded', loadTransactions);

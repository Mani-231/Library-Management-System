
const API_URL = 'http://localhost:5000/api/books';

const booksTableBody = document.getElementById('booksTableBody');
const bookCount = document.getElementById('bookCount');
const bookForm = document.getElementById('bookForm');
const bookFormCard = document.getElementById('bookFormCard');
const message = document.getElementById('message');

// Display messages
function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
}

// Load all books from PostgreSQL
async function loadBooks() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Unable to load books');
        }

        const books = await response.json();

        booksTableBody.innerHTML = '';

        bookCount.textContent = `${books.length} books`;

        if (books.length === 0) {
            booksTableBody.innerHTML = `
                <tr>
                    <td colspan="6">No books found.</td>
                </tr>
            `;
            return;
        }

        books.forEach(book => {
            const row = document.createElement('tr');

            const values = [
                book.book_id,
                book.title,
                book.author || '-',
                book.category || '-',
                book.total_copies,
                book.available_copies
            ];

            values.forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.appendChild(cell);
            });

            booksTableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Books loading error:', error);

        booksTableBody.innerHTML = `
            <tr>
                <td colspan="6">Unable to load books. Check the backend server.</td>
            </tr>
        `;

        bookCount.textContent = 'Error';
    }
}

// Show add-book form
document.getElementById('showFormButton').addEventListener('click', () => {
    bookFormCard.hidden = false;
    message.textContent = '';
});

// Hide add-book form
document.getElementById('cancelButton').addEventListener('click', () => {
    bookFormCard.hidden = true;
    bookForm.reset();
});

// Add a new book
bookForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const category = document.getElementById('category').value.trim();
    const totalCopies = Number(
        document.getElementById('totalCopies').value
    );

    if (!title || !Number.isInteger(totalCopies) || totalCopies <= 0) {
        showMessage('Enter a title and a valid number of copies.', 'error');
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                author,
                category,
                total_copies: totalCopies
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Unable to add book');
        }

        bookForm.reset();
        bookFormCard.hidden = true;

        showMessage('Book added successfully!', 'success');

        await loadBooks();

    } catch (error) {
        console.error('Add book error:', error);
        showMessage(error.message, 'error');
    }
});

// Load books when the page opens
document.addEventListener('DOMContentLoaded', loadBooks);

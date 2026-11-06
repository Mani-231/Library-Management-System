
const API_URL = 'http://localhost:5000/api/members';

const membersTableBody = document.getElementById('membersTableBody');
const memberCount = document.getElementById('memberCount');
const memberForm = document.getElementById('memberForm');
const memberFormCard = document.getElementById('memberFormCard');
const message = document.getElementById('message');

// Display messages
function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
}

// Load all members from PostgreSQL
async function loadMembers() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Unable to load members');
        }

        const members = await response.json();

        membersTableBody.innerHTML = '';
        memberCount.textContent = `${members.length} members`;

        if (members.length === 0) {
            membersTableBody.innerHTML = `
                <tr>
                    <td colspan="4">No members found.</td>
                </tr>
            `;
            return;
        }

        members.forEach(member => {
            const row = document.createElement('tr');

            const values = [
                member.member_id,
                member.name,
                member.email || '-',
                member.phone || '-'
            ];

            values.forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.appendChild(cell);
            });

            membersTableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Members loading error:', error);

        membersTableBody.innerHTML = `
            <tr>
                <td colspan="4">Unable to load members. Check the backend server.</td>
            </tr>
        `;

        memberCount.textContent = 'Error';
    }
}

// Show registration form
document.getElementById('showFormButton').addEventListener('click', () => {
    memberFormCard.hidden = false;
    message.textContent = '';
});

// Cancel registration
document.getElementById('cancelButton').addEventListener('click', () => {
    memberFormCard.hidden = true;
    memberForm.reset();
});

// Register a new member
memberForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!name) {
        showMessage('Member name is required.', 'error');
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                phone
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Unable to register member');
        }

        memberForm.reset();
        memberFormCard.hidden = true;

        showMessage('Member registered successfully!', 'success');

        await loadMembers();

    } catch (error) {
        console.error('Register member error:', error);
        showMessage(error.message, 'error');
    }
});

// Load members when page opens
document.addEventListener('DOMContentLoaded', loadMembers);

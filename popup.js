document.addEventListener('DOMContentLoaded', function () {
    const siteInput = document.getElementById('site');
    const usernameInput = document.getElementById('username');
    const lengthInput = document.getElementById('length');
    const generateButton = document.getElementById('generate');
    const passwordInput = document.getElementById('password');
    const saveButton = document.getElementById('save');
    const customPasswordInput = document.getElementById('customPassword');
    const saveCustomButton = document.getElementById('saveCustom');
    const statusLabel = document.getElementById('status');
    const passwordList = document.getElementById('passwordList');

    // Generate a random password
    generateButton.addEventListener('click', function () {
        const length = parseInt(lengthInput.value);
        if (isNaN(length) || length < 1) {
            passwordInput.value = 'Invalid length';
            return;
        }
        const password = generatePassword(length);
        passwordInput.value = password;
    });

    // Save generated password to the database
    saveButton.addEventListener('click', function () {
        savePassword(passwordInput.value);
    });

    // Save custom password to the database
    saveCustomButton.addEventListener('click', function () {
        savePassword(customPasswordInput.value);
    });

    // Display saved passwords when popup is loaded
    displayPasswords();

    // Function to generate a random password
    function generatePassword(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
        let password = '';
        for (let i = 0; i < length; i++) {
            const character = characters.charAt(Math.floor(Math.random() * characters.length));
            password += character;
        }
        return password;
    }

    // Function to save password to the database
    function savePassword(password) {
        const site = siteInput.value.trim();
        const username = usernameInput.value.trim();
        if (!site || !username || !password) {
            statusLabel.textContent = 'Please fill in all fields';
            statusLabel.style.color = 'red';
            return;
        }

        chrome.runtime.sendMessage({ action: 'addPassword', site, username, password }, function (response) {
            statusLabel.textContent = response.message;
            statusLabel.style.color = 'green';
            displayPasswords();
        });
    }

    // Function to display saved passwords
    function displayPasswords() {
        chrome.runtime.sendMessage({ action: 'getPasswords' }, function (response) {
            passwordList.innerHTML = '';
            response.passwords.forEach(function (password) {
                const recordDiv = document.createElement('div');
                recordDiv.classList.add('record');
                recordDiv.innerHTML = `
                    <p>Site: ${password.site}</p>
                    <p>Username: ${password.username}</p>
                    <p>Password: ${password.password}</p>
                    <button data-id="${password.id}" class="copy">Copy</button>
                    <button data-id="${password.id}" class="delete">Delete</button>
                `;
                passwordList.appendChild(recordDiv);

                // Add event listeners for Copy and Delete buttons
                const copyButton = recordDiv.querySelector('.copy');
                copyButton.addEventListener('click', function () {
                    copyToClipboard(password.password);
                });

                const deleteButton = recordDiv.querySelector('.delete');
                deleteButton.addEventListener('click', function () {
                    deletePassword(password.id);
                });
            });
        });
    }

    // Function to copy a password to clipboard
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => {
                statusLabel.textContent = 'Password copied to clipboard';
                statusLabel.style.color = 'green';
            })
            .catch(err => {
                statusLabel.textContent = 'Error copying password';
                statusLabel.style.color = 'red';
                console.error('Copy error:', err);
            });
    }

    // Function to delete a password
    function deletePassword(id) {
        chrome.runtime.sendMessage({ action: 'deletePassword', id }, function (response) {
            statusLabel.textContent = response.message;
            statusLabel.style.color = 'green';
            displayPasswords();
        });
    }
});

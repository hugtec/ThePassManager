chrome.runtime.onInstalled.addListener(function () {
    // Initialiser le stockage local pour les mots de passe
    chrome.storage.local.set({ passwords: [], lastId: 0 }, function () {
        console.log('Initialisation des mots de passe.');
    });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'addPassword') {
        addPassword(request.site, request.username, request.password, sendResponse);
        return true; // Indique que sendResponse sera utilisé de manière asynchrone
    } else if (request.action === 'getPasswords') {
        getPasswords(sendResponse);
        return true; // Indique que sendResponse sera utilisé de manière asynchrone
    } else if (request.action === 'deletePassword') {
        deletePassword(request.id, sendResponse);
        return true; // Indique que sendResponse sera utilisé de manière asynchrone
    }
});

function addPassword(site, username, password, sendResponse) {
    chrome.storage.local.get(['passwords', 'lastId'], function (data) {
        let passwords = data.passwords || [];
        let lastId = data.lastId || 0;

        // Increment lastId to get the new ID
        lastId++;

        passwords.push({ id: lastId, site: site, username: username, password: password });
        chrome.storage.local.set({ passwords: passwords, lastId: lastId }, function () {
            console.log('Mot de passe ajouté.');
            sendResponse({ message: 'Mot de passe ajouté avec succès.' });
        });
    });
}

function getPasswords(sendResponse) {
    chrome.storage.local.get('passwords', function (data) {
        let passwords = data.passwords || [];

        // Sort passwords by ID
        passwords.sort((a, b) => a.id - b.id);

        sendResponse({ passwords: passwords });
    });
}

function deletePassword(id, sendResponse) {
    chrome.storage.local.get('passwords', function (data) {
        let passwords = data.passwords || [];

        passwords = passwords.filter(password => password.id !== id);
        chrome.storage.local.set({ passwords: passwords }, function () {
            console.log('Mot de passe supprimé.');
            sendResponse({ message: 'Mot de passe supprimé avec succès.' });
        });
    });
}

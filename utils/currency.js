const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../userData.json');

const ensureDataFile = () => {
    if (!fs.existsSync(dataPath)) {
        fs.writeFileSync(dataPath, JSON.stringify({}));
    }
};

const getUserData = (userId) => {
    ensureDataFile();
    const userData = JSON.parse(fs.readFileSync(dataPath));
    if (!userData[userId]) {
        userData[userId] = { coins: 0, lastDaily: 0 };
        fs.writeFileSync(dataPath, JSON.stringify(userData));
    }
    return userData[userId];
};

const updateUserData = (userId, data) => {
    ensureDataFile();
    const userData = JSON.parse(fs.readFileSync(dataPath));
    userData[userId] = data;
    fs.writeFileSync(dataPath, JSON.stringify(userData));
};

const addCoins = (userId, amount) => {
    const userData = getUserData(userId);
    userData.coins += amount;
    updateUserData(userId, userData);
};

const removeCoins = (userId, amount) => {
    const userData = getUserData(userId);
    userData.coins = Math.max(0, userData.coins - amount);
    updateUserData(userId, userData);
};

module.exports = {
    ensureDataFile, // Exporte la fonction ensureDataFile
    getUserData,
    updateUserData,
    addCoins,
    removeCoins,
};

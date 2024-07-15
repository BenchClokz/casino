const { getUserData, addCoins, removeCoins, updateUserData } = require('../utils/currency');
const suits = ['♠', '♥', '♣', '♦'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
let games = {};

const createDeck = () => {
    let deck = [];
    for (const suit of suits) {
        for (const value of values) {
            deck.push({ suit, value });
        }
    }
    return deck;
};

const shuffleDeck = (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
};

const drawCards = (deck, num) => {
    return deck.splice(0, num);
};

const handToString = (hand) => hand.map(card => `${card.value}${card.suit}`).join(' ');

const evaluateHand = (hand) => {
    return hand.reduce((acc, card) => acc + values.indexOf(card.value), 0);
};

const startGame = (channelId) => {
    if (!games[channelId]) {
        let deck = shuffleDeck(createDeck());
        games[channelId] = {
            deck,
            players: [],
            pot: 0,
            currentBet: 0,
            currentTurn: 0,
            round: 0,
            communityCards: [],
            channelId
        };
    }
};

const joinGame = async (channelId, userId, userName) => {
    const game = games[channelId];
    if (game && !game.players.find(player => player.id === userId)) {
        const hand = drawCards(game.deck, 2);
        game.players.push({
            id: userId,
            name: userName,
            hand,
            bet: 0,
            folded: false
        });

        const playerCards = handToString(hand);
        try {
            const member = await game.channelId.guild.members.fetch(userId);
            await member.send(`Vos cartes: ${playerCards}`);
        } catch (error) {
            console.error(`Impossible d'envoyer les cartes à ${userName}:`, error);
        }
    }
};

const resetBets = (channelId) => {
    const game = games[channelId];
    game.players.forEach(player => player.bet = 0);
    game.currentBet = 0;
};

const advanceTurn = (channelId) => {
    const game = games[channelId];
    do {
        game.currentTurn = (game.currentTurn + 1) % game.players.length;
    } while (game.players[game.currentTurn].folded);
};

const getCurrentPlayer = (channelId) => {
    const game = games[channelId];
    return game.players[game.currentTurn];
};

const nextRound = (channelId) => {
    const game = games[channelId];
    game.round++;
    if (game.round === 1) {
        game.communityCards = drawCards(game.deck, 3); // Flop
    } else if (game.round === 2) {
        game.communityCards.push(...drawCards(game.deck, 1)); // Turn
    } else if (game.round === 3) {
        game.communityCards.push(...drawCards(game.deck, 1)); // River
    }
};

const showdown = (channelId) => {
    const game = games[channelId];
    let winner = null;
    let highestScore = -1;
    game.players.forEach(player => {
        if (!player.folded) {
            const combinedHand = player.hand.concat(game.communityCards);
            const score = evaluateHand(combinedHand);
            if (score > highestScore) {
                highestScore = score;
                winner = player;
            }
        }
    });
    return winner;
};

module.exports = {
    name: 'poker',
    description: 'Jouer au poker simplifié.',
    async execute(message, args) {
        const userId = message.author.id;
        const userName = message.author.username;
        const channelId = message.channel.id;

        if (args[0] === 'start') {
            startGame(channelId);
            message.channel.send('Une nouvelle partie de poker a commencé ! Tapez `!poker join` pour rejoindre.');
        } else if (args[0] === 'join') {
            const game = games[channelId];
            if (game.players.find(player => player.id === userId)) {
                return message.reply('❗ Vous avez déjà rejoint la partie. ❗');
            }
            await joinGame(channelId, userId, userName);
            message.channel.send(`${userName} a rejoint la partie et a reçu ses cartes.`);
            if (game.players.length >= 2) {
                message.channel.send('La partie peut maintenant commencer ! Chaque joueur doit `!poker bet <montant>` ou `!poker fold`.');
            }
        } else if (args[0] === 'bet') {
            const game = games[channelId];
            if (!game) {
                return message.reply('❗ Aucun jeu en cours. Utilisez `!poker start` pour démarrer une nouvelle partie. ❗');
            }
            const player = game.players.find(p => p.id === userId);
            if (!player) {
                return message.reply('❗ Vous n\'êtes pas dans la partie. Utilisez `!poker join` pour rejoindre. ❗');
            }
            const betAmount = parseInt(args[1], 10);
            if (isNaN(betAmount) || betAmount <= 0) {
                return message.reply('❗ Veuillez placer un pari valide. ❗');
            }
            if (player.bet + betAmount < game.currentBet) {
                return message.reply('❗ Vous devez suivre ou relancer le pari actuel. ❗');
            }
            const userData = getUserData(userId);
            if (userData.coins < betAmount) {
                return message.reply('🚫 Vous n\'avez pas assez de pièces pour ce pari. 🚫');
            }
            removeCoins(userId, betAmount);
            player.bet += betAmount;
            game.pot += betAmount;
            if (player.bet > game.currentBet) {
                game.currentBet = player.bet;
            }
            message.channel.send(`${userName} a parié ${betAmount} pièces.`);
            advanceTurn(channelId);
            const currentPlayer = getCurrentPlayer(channelId);
            if (currentPlayer.id === userId) {
                nextRound(channelId);
                message.channel.send('Tous les joueurs ont parié. Les cartes communautaires sont: ' + handToString(game.communityCards));
            } else {
                message.channel.send(`C'est au tour de ${currentPlayer.name}. Tapez \`!poker bet <montant>\` ou \`!poker fold\`.`);
            }
        } else if (args[0] === 'fold') {
            const game = games[channelId];
            if (!game) {
                return message.reply('❗ Aucun jeu en cours. Utilisez `!poker start` pour démarrer une nouvelle partie. ❗');
            }
            const player = game.players.find(p => p.id === userId);
            if (!player) {
                return message.reply('❗ Vous n\'êtes pas dans la partie. Utilisez `!poker join` pour rejoindre. ❗');
            }
            player.folded = true;
            message.channel.send(`${userName} s'est couché.`);
            advanceTurn(channelId);
            const currentPlayer = getCurrentPlayer(channelId);
            if (currentPlayer.id === userId) {
                nextRound(channelId);
                message.channel.send('Tous les joueurs ont parié. Les cartes communautaires sont: ' + handToString(game.communityCards));
            } else {
                message.channel.send(`C'est au tour de ${currentPlayer.name}. Tapez \`!poker bet <montant>\` ou \`!poker fold\`.`);
            }
        } else if (args[0] === 'reveal') {
            const game = games[channelId];
            if (!game) {
                return message.reply('❗ Aucun jeu en cours. Utilisez `!poker start` pour démarrer une nouvelle partie. ❗');
            }
            const winner = showdown(channelId);
            if (winner) {
                addCoins(winner.id, game.pot);
                message.channel.send(`🎉 ${winner.name} a gagné le pot de ${game.pot} pièces avec la main ${handToString(winner.hand)} ! 🎉`);
            } else {
                message.channel.send('🟰 Il n\'y a pas de gagnant. 🟰');
            }
            delete games[channelId];
        } else {
            message.reply('❗ Commande non reconnue. Utilisez `!poker start`, `!poker join`, `!poker bet <montant>`, `!poker fold`, ou `!poker reveal`. ❗');
        }
    }
};

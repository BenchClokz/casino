const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Afficher toutes les commandes disponibles.',
    async execute(message) {
        const baseEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📜 Commandes de base')
            .setDescription('Voici les commandes de base que vous pouvez utiliser :')
            .addFields(
                { name: '💰 Économie', value: [
                    '`!daily` : Réclamer votre récompense quotidienne.',
                    '`!argent` : Afficher l\'argent que vous possédez.',
                    '`!don <@utilisateur> <montant>` : Donner de l\'argent à un utilisateur.',
                    '`!top` : Afficher le top des joueurs.'
                ].join('\n') }
            );

        const soloGamesEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🎰 Jeux solo')
            .setDescription('Voici les jeux solo que vous pouvez jouer :')
            .addFields(
                { name: '🎲 Jeux', value: [
                    '`!slotmachine <montant>` : Jouer à la machine à sous.',
                    '`!roulette <montant> <numéro|couleur>` : Jouer à la roulette.',
                    '`!pileouface <montant> <pile|face>` : Jouer à pile ou face.',
                    '`!pierrepapier <montant> <pierre|papier|ciseau>` : Jouer à pierre, feuille, ciseau.',
                    '`!blackjack <montant>` : Jouer au blackjack contre le bot.',
                    '`!dice <montant> <nombre>` : Jouer au jeu de dés.',
                    '`!trivia` : Jouer à un jeu de questions-réponses.',
                    '`!baccarat <montant> <joueur|banquier>` : Jouer au baccarat simplifié.',
                    '`!rpsls <montant> <pierre|papier|ciseau|lézard|spock>` : Jouer à Pierre-Papier-Ciseau-Lézard-Spock.',
                    '`!poker <montant>` : Jouer au poker simplifié.'
                ].join('\n') }
            );

        const multiplayerGamesEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('👥 Jeux multijoueurs')
            .setDescription('Voici les jeux multijoueurs que vous pouvez jouer :')
            .addFields(
                { name: '🎲 Jeux', value: [
                    '`!tictactoe <@opponent>` : Jouer à Tic-Tac-Toe contre un autre joueur.',
                    '`!battleship <@opponent>` : Jouer à la bataille navale contre un autre joueur.'
                ].join('\n') }
            );

        const pages = [
            baseEmbed,
            soloGamesEmbed,
            multiplayerGamesEmbed
        ];

        if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const staffEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🔧 Commandes Staff')
                .setDescription('Voici les commandes réservées aux administrateurs :')
                .addFields(
                    { name: '🔧 Administration', value: [
                        '`!giveall <montant>` : Donner de l\'argent à tous les joueurs.',
                        '`!give <@utilisateur|ID> <montant>` : Ajouter ou enlever de l\'argent à un joueur.',
                        '`!reseteconomy` : Réinitialiser l\'économie (mettre tous les joueurs à 500 pièces).'
                    ].join('\n') }
                );

            pages.push(staffEmbed);
        }

        let page = 0;

        const getButtons = (page) => new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('⏪')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('⏩')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === pages.length - 1)
            );

        const curPage = await message.channel.send({ embeds: [pages[page]], components: [getButtons(page)] });

        const filter = i => ['prev', 'next'].includes(i.customId) && i.user.id === message.author.id;
        const collector = curPage.createMessageComponentCollector({ filter, time: 120000 });

        collector.on('collect', async i => {
            if (i.customId === 'next' && page < pages.length - 1) {
                page++;
            } else if (i.customId === 'prev' && page > 0) {
                page--;
            }

            await i.update({ embeds: [pages[page]], components: [getButtons(page)] });
        });

        collector.on('end', () => {
            curPage.edit({ components: [] });
        });
    },
};

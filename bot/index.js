import { Client, GatewayIntentBits, Events, Collection, REST, Routes, AttachmentBuilder } from 'discord.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import axios from 'axios';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cria o cliente do Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
  ],
});

// Collection para armazenar comandos
client.commands = new Collection();

// Armazena solicitações ativas
const activeRequests = new Map();

// Event: Bot pronto
client.once(Events.ClientReady, async (c) => {
  console.log(`✅ Bot online como ${c.user.tag}`);

  // Registra comandos slash
  try {
    await registerCommands();
    console.log('✅ Comandos slash registrados');
  } catch (error) {
    console.error('❌ Erro ao registrar comandos:', error);
  }
});

// Event: Interação (comandos slash)
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    if (commandName === 'solicitar-maos') {
      await handleSolicitarMaos(interaction);
    } else if (commandName === 'status-maos') {
      await handleStatusMaos(interaction);
    } else if (commandName === 'cobrar') {
      await handleCobrar(interaction);
    } else if (commandName === 'registrar-jogador') {
      await handleRegistrarJogador(interaction);
    } else if (commandName === 'listar-jogadores') {
      await handleListarJogadores(interaction);
    }
  } catch (error) {
    console.error('Erro ao executar comando:', error);
    await interaction.reply({
      content: '❌ Erro ao executar comando. Tente novamente.',
      ephemeral: true
    });
  }
});

// Event: Mensagens (para receber arquivos)
client.on(Events.MessageCreate, async (message) => {
  // Ignora mensagens do próprio bot
  if (message.author.bot) return;

  // Verifica se tem anexos (arquivos)
  if (message.attachments.size > 0) {
    await handleFileUpload(message);
  }
});

// Função: Solicitar mãos
async function handleSolicitarMaos(interaction) {
  const customMessage = interaction.options.getString('mensagem');
  const message = customMessage || process.env.DEFAULT_REQUEST_MESSAGE;

  await interaction.reply({
    content: '📤 Enviando solicitação de mãos...',
    ephemeral: true,
  });

  // Envia mensagem no canal
  const channel = interaction.channel;
  const sentMessage = await channel.send(message);

  // Registra a solicitação
  const requestId = Date.now().toString();
  activeRequests.set(requestId, {
    id: requestId,
    messageId: sentMessage.id,
    channelId: channel.id,
    requestedBy: interaction.user.id,
    requestedAt: new Date(),
    players: new Map(), // playerId -> { submitted: boolean, files: [] }
  });

  // Salva no backend
  try {
    await axios.post(`${process.env.API_URL}/requests`, {
      discordMessageId: sentMessage.id,
      requestedBy: interaction.user.id,
      message,
    });
  } catch (error) {
    console.error('Erro ao salvar solicitação no backend:', error);
  }

  await interaction.followUp({
    content: '✅ Solicitação de mãos enviada!',
    ephemeral: true,
  });
}

// Função: Status das mãos
async function handleStatusMaos(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    // Busca status do backend
    const response = await axios.get(`${process.env.API_URL}/submissions/status`);
    const { submitted, pending } = response.data;

    let statusMessage = '📊 **Status dos Envios**\n\n';

    if (submitted.length > 0) {
      statusMessage += '✅ **Enviaram:**\n';
      submitted.forEach(player => {
        statusMessage += `- ${player.nickname} (${player.filesCount} arquivo(s))\n`;
      });
    }

    if (pending.length > 0) {
      statusMessage += '\n⏳ **Faltam enviar:**\n';
      pending.forEach(player => {
        statusMessage += `- ${player.nickname}\n`;
      });
    }

    if (submitted.length === 0 && pending.length === 0) {
      statusMessage += 'Nenhum jogador registrado ainda.';
    }

    await interaction.editReply(statusMessage);
  } catch (error) {
    console.error('Erro ao buscar status:', error);
    await interaction.editReply('❌ Erro ao buscar status. Verifique se o backend está rodando.');
  }
}

// Função: Cobrar envio
async function handleCobrar(interaction) {
  const user = interaction.options.getUser('jogador');

  let message = '⚠️ **Lembrete de Envio de Mãos** ⚠️\n\n';
  message += 'Olá! Notamos que você ainda não enviou seus históricos de mãos.\n';
  message += 'Por favor, envie o quanto antes para não atrasar o processo.\n\n';
  message += 'Envie seus arquivos aqui ou no canal principal.\n\n';
  message += 'Obrigado! 🃏';

  try {
    if (user) {
      // Cobra usuário específico
      await user.send(message);
      await interaction.reply({
        content: `✅ Cobrança enviada para ${user.tag}`,
        ephemeral: true,
      });
    } else {
      // Cobra todos que não enviaram
      await interaction.deferReply({ ephemeral: true });

      const response = await axios.get(`${process.env.API_URL}/submissions/status`);
      const { pending } = response.data;

      let sentCount = 0;
      for (const player of pending) {
        try {
          const discordUser = await client.users.fetch(player.discordId);
          await discordUser.send(message);
          sentCount++;
        } catch (error) {
          console.error(`Erro ao enviar DM para ${player.nickname}:`, error);
        }
      }

      await interaction.editReply(`✅ Cobrança enviada para ${sentCount} jogador(es)`);
    }
  } catch (error) {
    console.error('Erro ao cobrar:', error);
    await interaction.reply({
      content: '❌ Erro ao enviar cobrança.',
      ephemeral: true,
    });
  }
}

// Função: Registrar jogador
async function handleRegistrarJogador(interaction) {
  const user = interaction.options.getUser('usuario');
  const nickname = interaction.options.getString('nickname');

  await interaction.deferReply({ ephemeral: true });

  try {
    await axios.post(`${process.env.API_URL}/players`, {
      discordId: user.id,
      discordTag: user.tag,
      nickname,
    });

    await interaction.editReply(`✅ Jogador ${nickname} (${user.tag}) registrado com sucesso!`);
  } catch (error) {
    console.error('Erro ao registrar jogador:', error);
    await interaction.editReply('❌ Erro ao registrar jogador. Talvez ele já esteja registrado.');
  }
}

// Função: Listar jogadores
async function handleListarJogadores(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const response = await axios.get(`${process.env.API_URL}/players`);
    const players = response.data;

    if (players.length === 0) {
      await interaction.editReply('Nenhum jogador registrado ainda.');
      return;
    }

    let message = '👥 **Jogadores Registrados**\n\n';
    players.forEach((player, index) => {
      message += `${index + 1}. **${player.nickname}** - <@${player.discordId}>\n`;
    });

    await interaction.editReply(message);
  } catch (error) {
    console.error('Erro ao listar jogadores:', error);
    await interaction.editReply('❌ Erro ao listar jogadores.');
  }
}

// Função: Processar upload de arquivo
async function handleFileUpload(message) {
  console.log(`📎 Arquivo(s) recebido(s) de ${message.author.tag}`);

  // Busca informações do jogador
  try {
    const response = await axios.get(`${process.env.API_URL}/players/discord/${message.author.id}`);
    const player = response.data;

    // Processa cada anexo
    for (const attachment of message.attachments.values()) {
      const validExtensions = ['.txt', '.zip'];
      const fileExt = attachment.name.toLowerCase().slice(attachment.name.lastIndexOf('.'));

      if (!validExtensions.includes(fileExt)) {
        await message.reply('⚠️ Apenas arquivos .txt e .zip são aceitos.');
        continue;
      }

      // Faz download do arquivo
      const fileResponse = await axios.get(attachment.url, { responseType: 'arraybuffer' });
      const fileBuffer = Buffer.from(fileResponse.data);

      // Envia para o backend processar
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: attachment.contentType });
      formData.append('file', blob, attachment.name);
      formData.append('playerId', player.id);
      formData.append('discordMessageId', message.id);

      await axios.post(`${process.env.API_URL}/submissions/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log(`✅ Arquivo ${attachment.name} processado para ${player.nickname}`);
    }

    await message.react('✅');
    await message.reply(`✅ Arquivo(s) recebido(s), **${player.nickname}**! Obrigado pelo envio.`);
  } catch (error) {
    console.error('Erro ao processar arquivo:', error);

    if (error.response && error.response.status === 404) {
      await message.reply('⚠️ Você não está registrado como jogador. Peça ao administrador para te registrar com `/registrar-jogador`.');
    } else {
      await message.reply('❌ Erro ao processar arquivo. Tente novamente ou contate o administrador.');
    }
  }
}

// Função: Registrar comandos slash
async function registerCommands() {
  const commands = [
    {
      name: 'solicitar-maos',
      description: 'Solicita envio de mãos aos jogadores',
      options: [
        {
          name: 'mensagem',
          description: 'Mensagem personalizada (opcional)',
          type: 3, // STRING
          required: false,
        },
      ],
    },
    {
      name: 'status-maos',
      description: 'Mostra status dos envios (quem enviou e quem falta)',
    },
    {
      name: 'cobrar',
      description: 'Cobra envio de jogador(es)',
      options: [
        {
          name: 'jogador',
          description: 'Jogador específico (opcional - sem isso cobra todos)',
          type: 6, // USER
          required: false,
        },
      ],
    },
    {
      name: 'registrar-jogador',
      description: 'Registra um novo jogador no sistema',
      options: [
        {
          name: 'usuario',
          description: 'Usuário do Discord',
          type: 6, // USER
          required: true,
        },
        {
          name: 'nickname',
          description: 'Nickname do jogador (usado nos arquivos)',
          type: 3, // STRING
          required: true,
        },
      ],
    },
    {
      name: 'listar-jogadores',
      description: 'Lista todos os jogadores registrados',
    },
  ];

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  if (process.env.GUILD_ID) {
    // Comandos específicos do servidor (atualização instantânea)
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
      { body: commands }
    );
  } else {
    // Comandos globais (pode demorar até 1 hora para propagar)
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
  }
}

// Login no Discord
client.login(process.env.DISCORD_TOKEN);

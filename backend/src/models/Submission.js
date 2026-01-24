import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Player from './Player.js';

const Submission = sequelize.define('Submission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  playerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'player_id',
    references: {
      model: Player,
      key: 'id',
    },
  },
  originalFileName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'original_file_name',
  },
  processedFileName: {
    type: DataTypes.STRING,
    field: 'processed_file_name',
  },
  fileType: {
    type: DataTypes.ENUM('txt', 'zip'),
    allowNull: false,
    field: 'file_type',
  },
  site: {
    type: DataTypes.STRING,
    comment: 'gg, pokerstars, etc.',
  },
  isGG: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_gg',
    comment: 'Se é arquivo do GGPoker',
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Se foi verificado pelo admin',
  },
  discordMessageId: {
    type: DataTypes.STRING,
    field: 'discord_message_id',
  },
  filePath: {
    type: DataTypes.STRING,
    field: 'file_path',
    comment: 'Caminho do arquivo processado',
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at',
  },
}, {
  tableName: 'submissions',
  timestamps: true,
});

// Relacionamentos
Player.hasMany(Submission, { foreignKey: 'player_id' });
Submission.belongsTo(Player, { foreignKey: 'player_id' });

export default Submission;

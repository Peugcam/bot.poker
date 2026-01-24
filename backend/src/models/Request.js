import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Request = sequelize.define('Request', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  discordMessageId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'discord_message_id',
  },
  requestedBy: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'requested_by',
    comment: 'Discord ID de quem solicitou',
  },
  message: {
    type: DataTypes.TEXT,
    comment: 'Mensagem enviada',
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
  },
}, {
  tableName: 'requests',
  timestamps: true,
  updatedAt: false,
});

export default Request;

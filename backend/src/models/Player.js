import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Player = sequelize.define('Player', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  discordId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'discord_id',
  },
  discordTag: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'discord_tag',
  },
  nickname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
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
  tableName: 'players',
  timestamps: true,
});

export default Player;

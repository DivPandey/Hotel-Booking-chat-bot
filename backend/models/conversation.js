const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  messages: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      return JSON.parse(this.getDataValue('messages'));
    },
    set(value) {
      this.setDataValue('messages', JSON.stringify(value));
    }
  }
});

sequelize.sync();

module.exports = Conversation;
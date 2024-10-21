const Sequelize = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
});

const UserData = sequelize.define('UserData', {
  userId: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  points: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
});

const WelcomeMessage = sequelize.define('WelcomeMessage', {
  message: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
});


sequelize.sync();

module.exports = {
  UserData,
  WelcomeMessage,
  sequelize,
};

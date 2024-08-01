const { Sequelize, DataTypes } = require('sequelize');


const sequelize = new Sequelize('saqAgordzineba', 'root', 'mysqlserver', {
    dialect: 'mysql',
    host: 'localhost',
})

const Data = sequelize.define('Data', {
    header: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    pinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Default to not pinned
    },
    pinnedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
});


module.exports = { sequelize, Data };
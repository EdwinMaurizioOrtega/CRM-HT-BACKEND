module.exports = (sequelize, Sequelize) => {
    const ValidacionImei = sequelize.define("validacionimei", {
        description: {
            type: Sequelize.STRING
        }
    });

    return ValidacionImei;
};

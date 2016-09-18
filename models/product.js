module.exports = function(sequelize, DataTypes) {
  return sequelize.define("Product", {
    name: DataTypes.STRING,
    image: DataTypes.STRING,
    productId: DataTypes.INTEGER,
    variantId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    variant: DataTypes.STRING,
    size: DataTypes.INTEGER,
    customerName: DataTypes.STRING,
    customerEmail: DataTypes.STRING,
    customerPhone: DataTypes.STRING,
    comments: DataTypes.STRING,
    store: DataTypes.STRING,
    type: DataTypes.STRING
  });
}
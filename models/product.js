module.exports = function(sequelize, DataTypes) {
  return sequelize.define("Product", {
    name: DataTypes.STRING,
    image: DataTypes.STRING,
    productId: DataTypes.STRING,
    variantId: DataTypes.STRING,
    quantity: DataTypes.STRING,
    variant: DataTypes.STRING,
    size: DataTypes.STRING,
    customerFirstName: DataTypes.STRING,
    customerLastName: DataTypes.STRING,
    customerEmail: DataTypes.STRING,
    customerPhone: DataTypes.STRING,
    comments: DataTypes.STRING,
    store: DataTypes.STRING,
    type: DataTypes.STRING,
    status: DataTypes.STRING
  });
}
if (!global.hasOwnProperty('db')) {
  var Sequelize = require('sequelize')
    , sequelize = null

  // the application is executed on Heroku ... use the postgres database
  sequelize = new Sequelize('postgres://ssifxtlukxuvhx:bZanhYWi7SKRsOqZEMRTTeWLwL@ec2-54-217-213-156.eu-west-1.compute.amazonaws.com:5432/d86jck52dm112l', {
    dialect:  'postgres',
    protocol: 'postgres',
    port:     5432,
    host:     'ec2-54-217-213-156.eu-west-1.compute.amazonaws.com',
    logging:  true //false
  });

  global.db = {
    Sequelize: Sequelize,
    sequelize: sequelize,
    Product:      sequelize.import(__dirname + '/product') 
    // add your other models here
  }
  /*
    Associations can be defined here. E.g. like this:
    global.db.User.hasMany(global.db.SomethingElse)
  */
}

module.exports = global.db
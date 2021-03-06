/*
 * Shopify Embedded App. skeleton.
 *
 * Copyright 2014 Richard Bremner
 * richard@codezuki.com
 */

// var bodyParser = require('body-parser'),
//     cookieParser = require('cookie-parser'),
//     cookieSession = require('cookie-session'),
//     express = require('express'),
//     routes = require('./routes'),
//     shopifyAuth = require('./routes/shopify_auth'),
//     path = require('path'),
//     nconf = require('nconf'),
//     db      = require('./models'),
//     cors = require('cors'),
//     morgan = require('morgan');

//load settings from environment config
// nconf.argv().env().file({
//     file: 'dev-settings.json'
// });
// exports.nconf = nconf;

//configure express
// var app = express();

//log all requests
// app.use(morgan('combined'));

//support json and url encoded requests
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

//setup encrypted session cookies
// app.use(cookieParser());
// app.use(cookieSession({
//     secret: "--express-session-encryption-key--"
// }));

//statically serve from the 'public' folder
// app.use(express.static(path.join(__dirname, 'public')));

//use jade templating engine for view rendering
// app.set('view engine', 'jade');

//use the environment's port if specified
// app.set('port', process.env.PORT || 3000);

// var appAuth = new shopifyAuth.AppAuth();

// var whitelist = ['https://www.caramel.ro','http://www.caramel.ro'];

// var corsOptions = {
//   origin: function(origin, callback){
//       var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
//       callback(originIsWhitelisted ? null : 'Bad Request', originIsWhitelisted);
//   },
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// };

//configure routes
// app.get('/', routes.index);
// app.get('/auth_app', appAuth.initAuth);
// app.get('/escape_iframe', appAuth.escapeIframe);
// app.get('/auth_code', appAuth.getCode);
// app.get('/auth_token', appAuth.getAccessToken);
// app.get('/render_app', routes.renderApp);
// app.get('/preorderd_products', routes.preorderProduct);
// app.get('/book-confirmation/:productId', routes.bookConfirmation);
// app.get('/view-product/:productId', routes.viewProduct);
// app.get('/delete-product/:variantId', routes.deleteProduct);
// app.get('/soft-delete-product/:variantId', routes.softDeleteProduct);
// app.post('/book-product', cors(corsOptions), routes.bookProduct);


// db.sequelize.sync().then(function() {
//   app.listen(app.get('port'), function() {
//       console.log('Listening on port ' + app.get('port'));
//   });
// });

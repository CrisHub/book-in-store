/*
 * Shopify Embedded App. skeleton.
 *
 * Copyright 2014 Richard Bremner
 * richard@codezuki.com
 */

const util = require('util');
var app = require('../app'),
    url = require("url"),
    querystring = require('querystring'),
    request     = require('request'),
    shopifyAPI  = require('shopify-node-api'),
    fs = require('fs'),
    moment = require('moment'),
    _ = require('lodash');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('JCVkS2N7lJmYOcDUrUkdOA');

var Shopify;

var setShopify = function(req, res) {
    var parsedUrl = url.parse(req.originalUrl, true);
    req.session.oauth_access_token = 'c70a3aa425c46ec2e70067f1f6b36b10';
    req.session.shopUrl = 'https://caramel-dev.myshopify.com';
    //In case server stops and starts again, check if we need the auth token again
    if (!req.session.oauth_access_token) {
        if (parsedUrl.query && parsedUrl.query.shop) {
        req.session.shopUrl = 'https://' + parsedUrl.query.shop;
        }

        res.redirect('/auth_app');
    }
    else {
        //Using the shopify node.js library to make the calls to Shopify. This var is the configuration object.
        Shopify = new shopifyAPI({
            shop: req.session.shopUrl.split('//')[1],
            shopify_api_key: app.nconf.get('oauth:api_key'),
            shopify_shared_secret: app.nconf.get('oauth:client_secret'),
            access_token: req.session.oauth_access_token,
            verbose: false
        });
    }
};

/*
 * Get /
 *
 * if we already have an access token then
 * redirect to render the app, otherwise
 * redirect to app authorisation.
 */
exports.index = function(req, res){
    req.session.oauth_access_token = 'c70a3aa425c46ec2e70067f1f6b36b10';
    if (!req.session.oauth_access_token) {
        var parsedUrl = url.parse(req.originalUrl, true);
        if (parsedUrl.query && parsedUrl.query.shop) {
            req.session.shopUrl = 'https://' + parsedUrl.query.shop;
        }
        res.redirect("/auth_app");
    }
    else {
        res.redirect("/render_app");
    }
};





/*
 * Get /render_app
 *
 * render the main app view
 */
exports.renderApp = function(req, res){
    setShopify(req, res); 
    var parsedUrl = url.parse(req.originalUrl, true);
    db.Product.findAll({
      where:{'type':'book-in-store'},
      raw:true,
      offset: 0,
      limit: 250
  })
  .then(function(products) {
      res.render('app_view', {
          title: 'Configuration',
          apiKey: app.nconf.get('oauth:api_key'),
          shopUrl: req.session.shopUrl,
          body: 'Database configured',
          type:'book-in-store',
          products:products
      });
  });

};




exports.bookProduct = function(req, res) {
    setShopify(req, res);
    var parsedUrl = url.parse(req.originalUrl, true);
    db.Product
    .findOrCreate({where: req.body})
    .spread(function(product, created) {
      var product = product.get({plain: true});
      if (created) {
        res.json({product:product,created:created, email:'success'});
        return;
      }
      if (req.body.type == 'book-in-store') {
          var subject = "Rezervare produs",
              template_name = "Comanda ta este in curs de rezervare!",
              template_content = [{
                "name": "Rezervare produs",
                "content": "Rezervare produs"
              }];
      }
      if (req.body.type == 'preorder') {
          var subject = "Precomanda produs",
              template_name = "Precomanda ta a fost inregistrata cu succes!",
              template_content = [{
                "name": "Precomanda produs",
                "content": "Precomanda produs"
              }];
      }
      if (req.body.type == 'book-confirmation') {
          var subject = "Rezervare produs: Succes!",
              template_name = "Comanda ta te asteapta in magazinul Caramel!",
              template_content = [{
                "name": "Rezervare produs",
                "content": "Rezervare produs"
              }];
      }
      var message = {
              "subject": subject,
              "from_email": "contact@caramel.ro",
              "from_name": "Caramel Fashion",
              "to": [{
                      "email": product.customerEmail,
                      "name": product.customerFirstName+' '+product.customerLastName,
                      "type": "to"
                  }],
              "merge": true,
              "merge_language": "mailchimp",
              "merge_vars": [{
                      "rcpt": product.customerEmail,
                      "vars": [{
                                "name": "username",
                                'content':product.customerLastName
                              }, {
                                'name': 'storeName',
                                'content':product.store
                              }, {
                                'name': 'pTitle',
                                'content':product.name
                              }, {
                                'name':'pQty',
                                'content':product.quantity
                              }, {
                                'name':'pVariant',
                                'content':product.variant.split('-')[0]
                              }, {
                                'name':'pPrice',
                                'content':product.variant.split('-')[1]
                              }, {
                                'name':'pLink',
                                'content':product.link
                              }]
                  }],
          };

      
      var async = false;
      var sendObject = {"template_name": template_name, "template_content": template_content, "message": message, "async": async};

      mandrill_client.messages.sendTemplate(sendObject, function(result) {
          console.log(result);
          res.json({product:product,created:created, email:'success'});

          /*
          [{
                  "email": "recipient.email@example.com",
                  "status": "sent",
                  "reject_reason": "hard-bounce",
                  "_id": "abc123abc123abc123abc123abc123"
              }]
          */
      }, function(e) {
          // Mandrill returns the error as an object with name and message keys
          console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
          res.json({product:product,created:created, email:'error'});
          // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
      });
    });
};

exports.bookConfirmation = function(req, res) {
  db.Product
    .findOne({where: {id:req.params.productId}})
    .then(function(product) {
      product.set('status', 'email-sent').save().then(function(product) {
        console.log(product);
      });
      var product = product.get({plain: true});
      
      var subject = "Rezervare produs: Succes!",
      template_name = "Comanda ta te asteapta in magazinul Caramel!",
      template_content = [{
        "name": "Rezervare produs",
        "content": "Rezervare produs"
      }];
      var message = {
              "subject": subject,
              "from_email": "contact@caramel.ro",
              "from_name": "Caramel Fashion",
              "to": [{
                      "email": product.customerEmail,
                      "name": product.customerFirstName+' '+product.customerLastName,
                      "type": "to"
                  }],
              "merge": true,
              "merge_language": "mailchimp",
              "merge_vars": [{
                      "rcpt": product.customerEmail,
                      "vars": [{
                                "name": "username",
                                'content':product.customerLastName
                              }, {
                                'name': 'storeName',
                                'content':product.store
                              }, {
                                'name': 'pTitle',
                                'content':product.name
                              }, {
                                'name':'pQty',
                                'content':product.quantity
                              }, {
                                'name':'pVariant',
                                'content':product.variant.split('-')[0]
                              }, {
                                'name':'pPrice',
                                'content':product.variant.split('-')[1]
                              }, {
                                'name':'pLink',
                                'content':product.link
                              }, {
                                'name':'crtDate',
                                'content': moment().format("DD.MM.YYYY")
                              }]
                  }],
          };

      
      var async = false;
      var sendObject = {"template_name": template_name, "template_content": template_content, "message": message, "async": async};

      mandrill_client.messages.sendTemplate(sendObject, function(result) {
          console.log(result);
          res.redirect("/render_app");

          /*
          [{
                  "email": "recipient.email@example.com",
                  "status": "sent",
                  "reject_reason": "hard-bounce",
                  "_id": "abc123abc123abc123abc123abc123"
              }]
          */
      }, function(e) {
          // Mandrill returns the error as an object with name and message keys
          console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
          res.redirect("/render_app");
          // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
      });

    });
};


exports.preorderProduct = function(req, res) {
  setShopify(req, res);
  var parsedUrl = url.parse(req.originalUrl, true);
  db.Product
    .findAll({
      where: {type:'preorder'},
      raw:true,
      offset: 0,
      limit: 250
    })
    .then(function(products) {
      res.render('app_view', {
          title: 'Configuration',
          apiKey: app.nconf.get('oauth:api_key'),
          shopUrl: req.session.shopUrl,
          body: 'Database configured',
          type:'preorder',
          products:products
      });
    });
};

exports.deleteProduct = function(req, res) {
  setShopify(req, res);
  var parsedUrl = url.parse(req.originalUrl, true);
  console.log(req.params.variantId);
  Shopify.put('/admin/variants/'+req.params.variantId+'.json',
    {
      "variant": {
        "id": parseInt(req.params.variantId),
        "inventory_quantity_adjustment": -1
      }
    },
    function(err, data, headers) {
        console.log("GET: ", data);
        db.Product
        .destroy({where:{variantId:req.params.variantId}, force:true})
        .then(function(product) {
          res.redirect("/render_app");
        })
    });
  
};

exports.viewProduct = function(req, res) {
    setShopify(req, res);
    console.log('GET: ',req.params);
    Shopify.get('/admin/metafields.json?namespace=book-in-store', function(err, data, headers) {
        console.log("GET: ", data);
        res.render('view-product', {
            title: 'Configuration',
            apiKey: app.nconf.get('oauth:api_key'),
            shopUrl: req.session.shopUrl,
            product: data.product,
        });
    });
};

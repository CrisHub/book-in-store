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
    _ = require('lodash');

var Shopify;

var setShopify = function(req, res) {
    var parsedUrl = url.parse(req.originalUrl, true);
    req.session.oauth_access_token = '997beac785c428cf78b878961f1ec62a';
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
    req.session.oauth_access_token = '997beac785c428cf78b878961f1ec62a';
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
    var page = 1;
    if(parsedUrl.query.page){
        page = parsedUrl.query.page;
    }
    var getCount = 0;
    var setTags = function(data){
      var p = data.products[0],
          pVariants = p.variants,
          tagsArray = p.tags.trim(),
          tagsArray = tagsArray.split(',');
      _.forEach(pVariants, function(value, key) {
          _.each(tagsArray, function(val, idx) {
            if (val == value.option1){
              console.log('abc');
            }
          });
          tagsArray.push(value.option1)
          tagsArray.push(value.option2);
      });
      tagsArray = _.uniq(tagsArray);
      // _.each(tagsArray, function(value, idx) {

      // }); 
      tagsArray = tagsArray.join(',');
          // console.log(p.variants);
      res.render('app_view', {
            title: 'Configuration',
            apiKey: app.nconf.get('oauth:api_key'),
            shopUrl: req.session.shopUrl,
            products: data.products,
            tagsArray: tagsArray,
            page:parseInt(page)
        });
    };
    //274091393 is hardcoded
    Shopify.get('/admin/products.json?ids=7497850881', function(err, data, headers){
        setTags(data);
        // console.log("GET: ", JSON.stringify(data));
        
    });
};

exports.bookProduct = function(req, res) {
    setShopify(req, res);
    var parsedUrl = url.parse(req.originalUrl, true);
    var page = 1;
    if(parsedUrl.query.page){
        page = parsedUrl.query.page;
    }
    
    Shopify.post('/admin/products/7530600065/metafields.json',
        {
            "metafield": req.body
        }, function(err, data, headers) {
        console.log("POST: ", JSON.stringify(data));
        
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

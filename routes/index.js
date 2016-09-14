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
    var allProd = [];
    var colors = [];
    // var setTags = function(data, callback){
    //   var p = data.products[getCount],
    //       pVariants = p.variants,
    //       tagsArrayTrimed = p.tags.replace(/^[,\s]+|[,\s]+$/g, ''),
    //       tagsArrayTrimed = tagsArrayTrimed.replace(/\s*,\s*/g, ','),
    //       tagsArray = tagsArrayTrimed.split(',');
    //   _.forEach(pVariants, function(value, key) {
    //     if (value.inventory_quantity > 0) {
    //       tagsArray.push(value.option1)
    //       tagsArray.push(value.option2);
    //     }
    //   });
    //   tagsArray = _.uniq(tagsArray);
    //   tagsArray = tagsArray.join(', ');
    //   console.log(tagsArray, p.id);
    //   Shopify.put('/admin/products/'+p.id+'.json', {
    //       "product": {
    //         "id": p.id,
    //         "tags": tagsArray
    //       }
    //     }, function(err, data, headers) {
    //       getCount = getCount+1;
    //       console.log(getCount);
    //       setTags(allProd);
    //       // res.render('app_view', {
    //       //     title: 'Configuration',
    //       //     apiKey: app.nconf.get('oauth:api_key'),
    //       //     shopUrl: req.session.shopUrl,
    //       //     products: data.products,
    //       //     tagsArray: tagsArray,
    //       //     page:parseInt(page)
    //       // });
    //   });
    // };
    var desProd = {colors:[]};
    var getProducts = function(page, limit) {
      //274091393 is hardcoded
      Shopify.get('/admin/products.json?page='+page+'&limit=250&fields=options', function(err, data, headers){
          allProd.push(data.products);
          getCount = getCount + 1;
            for (i=0; allProd.length>i; i++) {
              for (k=0; allProd[i].length>k; k++) {
                for (j=0; allProd[i][k].options.length>j; j++){
                  if (allProd[i][k].options[j].name == 'Color'){
                    _.forEach(allProd[i][k].options[j].values, function(val) {
                      desProd.colors.push(val);
                    });
                  }
                }
              }
            }
          if(data.products.length != 250) {
            console.log(desProd);
            return;

          }

          getProducts(getCount);

      });
    }
    getProducts(1);
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

// connect-formidable.js: -*- javascript -*- an alternative middleware to multipart
//
// Copyright (c) 2013 Alex Zlotnik
// Author: Alex Zlotnik (zlotnika@gmail.com) 

var formidable = require('formidable')

var hasBody = function(req) {
  var encoding = 'transfer-encoding' in req.headers;
  var length = 'content-length' in req.headers && req.headers['content-length'] !== '0';
  return encoding || length;
};

var mime = function(req) {
  var str = req.headers['content-type'] || '';
  return str.split(';')[0];
};

exports = module.exports = function(options) {
    options = options || {}

    return function connect-formidable(req, res, next) {
        if (req._body) return next();
        req.body = req.body || {};
        req.files = req.files || {};

        if (!hasBody(req)) return next();

        // ignore GET
        if ('GET' == req.method || 'HEAD' == req.method) return next();

        // check Content-Type
        if ('multipart/form-data' != mime(req)) return next();

        // flag as parsed
        req._body = true;

        // parse
        var form = new formidable.IncomingForm()
        form.uploadDir = options.uploadDir || __dirname + '/tmp'
        form.keepExtensions = options.keepExtensions || true

        form.parse(req, function(err, fields, files) {
            if (err) return next(err);

            req.body = fields
            req.files = files

            next()
        })

    }
}

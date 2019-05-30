/* xlsx.js (C) 2013-present  SheetJS -- http://sheetjs.com */
const sprintf = require('printj').sprintf;

const logit = (req, res) => console.log(sprintf("%s %s %d", req.method, req.url, res.statusCode));

logit.mw = (req, res, next) => {
	logit(req, res);
	next();
};

module.exports = logit;
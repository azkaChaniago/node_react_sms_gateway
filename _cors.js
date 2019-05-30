/* xlsx.js (C) 2013-present  SheetJS -- http://sheetjs.com */
const cors = (req, res) => res.header('Access-Control-Allow-Origin', '*');

cors.mw = (req, res, next) => {
	cors(req, res);
	next();
}

module.exports = cors;
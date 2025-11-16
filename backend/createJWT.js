const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.createToken = function (body)
{
    return _createToken(body, "24h");
}

exports.customToken = function(body, time) {
    return _createToken(body, time);
}

_createToken = function (body, time)
{
    var ret;
    try {
        const expiration = new Date();
        //const user = {userId:id,firstName:fn,lastName:ln};
        const accessToken = jwt.sign(body, process.env.TOKEN_SECRET, { "expiresIn":time });
        // In order to expire with a value other than the default, use the
        // following
        /*
        const accessToken= jwt.sign(user,process.env.TOKEN_SECRET,
        { expiresIn: '30m'} );
        '24h'
        '365d'
        */

       ret = {"accessToken":accessToken};
    }
    catch(e) {
        ret = {"error":e.message};
    }

    return ret;
}

exports.isExpired = function(token)
{
    var isError = jwt.verify(token, process.env.TOKEN_SECRET,
    (err, verifiedJwt) => {
        if (err) {
            return true;
        }
        else {
            return false;
        }
    });

    return isError;
}

exports.refresh = function(ud)
{
    //var ud = jwt.decode(token, { "complete":true });
    //var userId = ud.payload.id;
    //var firstName = ud.payload.firstName;
    //var lastName = ud.payload.lastName;
    return _createToken(ud.payload);
}
exports.decode = function(token) {
    var ud = jwt.decode(token, { "complete":true });
    return ud;
}

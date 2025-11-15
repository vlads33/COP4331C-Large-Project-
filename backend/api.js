require("express");
require("mongoose");
const JWT = require("./createJWT.js");

exports.setApp = function (app, mongoose)
{
    const bcrypt = require("bcrypt");
    const User = require("/root/database/models/User.js");
    const Product = require("/root/database/models/Product.js");
    const Order = require("/root/database/models/Order.js");
    const Item = require("/root/database/models/OrderItem.js");

    app.post("/api/register", async (req, res) =>
    {
        // incoming: firstName, lastName, email, username, password

        var error = "";

        //const db = client.db("LargeProjectDB");
        const username = req.body["username"];
        const results = await User.find({ "username":username });

        if (results.length > 0) {
            res.status(400).json({ "error":"This user already exists" });
            return;
        }

        const newUser = new User(req.body);

        try {
            //const result = await db.collection("Users").insertOne(req.body);
            newUser.save();
            res.status(200).json("");
        }
        catch (err) {
            res.status(400).json({"error":err.message});
        }
    });

    app.post("/api/login", async (req, res) =>
    {
        // incoming: login, password
        // outgoing: id, firstName, lastName, email, dateCreated, error

        var error = "";

        const { username, password } = req.body;
        //const db = client.db("LargeProjectDB");
        //const results = await db.collection("Users").find({"username":user,"password":password}).toArray();
        const results = await User.find({ "username":username });

        //var id = -1;
        //var firstName = "";
        //var lastName = "";
        //var email = "";

        const isMatch = await bcrypt.compare(password, results[0].password);
        if(results.length > 0 && isMatch) {
            //id = results[0].UserId;
            //firstname = results[0].FirstName;
            //lastName = results[0].LastName;
            //email = results[0].Email;

            try {
                var result = results[0].toJSON();

                result["userID"] = result["_id"];

                delete result.__v;
                delete result._id;
                var token = JWT.createToken( result );

                if ("error" in token) { // for web token errors
                    token["error"] = "JWT: " + token["error"];
                    res.status(400).json(token);
                }
                else {
                    result["accessToken"] = token["accessToken"];
                    res.status(200).json(result);
                }
            }
            catch(err) {
                res.status(400).json({ "error":err.message });
            }
        }
        else {
            res.status(400).json({"error":"Login/Password incorrect"});
        }
    });

    app.get("/api/test", async (req, res, next) => {
        res.send("Hello World!\n")
    });

    app.post("/api/add_product", async (req, res) => {
        // incoming: JWT Token ("accessToken"), Product details

        const token = tokenDecode(req.body["accessToken"]);
        if ("error" in token) {
            res.status(400).json(token);
            return;
        }

        const userID = token.payload["userID"];
        var request = req.body;
        delete request.accessToken;
        request["userID"] = userID;

        const newProduct = new Product(request);
        try {
            newProduct.save();
            refreshReturn({}, res, token);
        }
        catch (err) {
            res.status(400).json({ "error":err.message });
        }
    });

    app.post("/api/user_products", async (req, res) => {
        // incoming: JWT Token ("accessToken")

        const token = tokenDecode(req.body["accessToken"]);
        if ("error" in token) {
            res.status(400).json(token);
            return;
        }

        const userID = token.payload["userID"];
        var results = await Product.find({ "userID":userID });

        if (results.length == 0) {
            res.status(404).json({ "error":"No products exist for this user" });
            return;
        }

        try {
            var _ret = [];
            for (var i = 0; i < results.length; i++) {
                var result = results[i].toJSON();

                result["productID"] = result["_id"];
                delete result.__v;
                delete result._id;

                _ret.push(result);
            }

            var ret = { "results":_ret };
            refreshReturn(ret, res, token);
        }
        catch (err) {
            res.status(400).json({ "error":err.message });
        }
    });

    app.post("/api/search_products", async (req, res) => {
        // incoming: JWT Token ("accessToken"), search string

        const token = tokenDecode(req.body["accessToken"]);
        if ("error" in token) {
            res.status(400).json(token);
            return;
        }

        var search = req.body["search"].trim();
        var results = await Product.find({ "name": { $regex:search+".*", $options:"i" } });

        if (results.length == 0) {
            res.status(404).json({ "error":"No matching products found" });
            return;
        }

        try {
            var _ret = [];
            for (var i = 0; i < results.length; i++) {
                var result = results[i].toJSON();

                result["productID"] = result["_id"];
                delete result.__v;
                delete result._id;

                _ret.push(result);
            }

            var ret = { "results":_ret };
            refreshReturn(ret, res, token);
        }
        catch (err) {
            res.status(400).json({ "error":err.message });
        }
    });

    app.post("/api/edit_product", async (req, res) => {
        // incoming: JWT Token ("accessToken"), Product ID, Product changes

        const token = tokenDecode(req.body["accessToken"]);
        if ("error" in token) {
            res.status(400).json(token);
            return;
        }

        const userID = token.payload["userID"];
        const productID = req.body["productID"];

        const results = await Product.find({ "_id":productID });
        if (results.length == 0) {
            res.status(404).json({ "error":"Invalid product ID." });
            return;
        }
        const result = results[0];

        if (result["userID"].toString() !== userID) {
            res.status(403).json({ "error":"Permission denied; cannot edit a product without ownership." });
            return;
        }

        var request = req.body;

        if ("userID" in request) {
            res.status(403).json({ "error":"Permission denied. Cannot change object ownership" });
            return;
        }

        var valid_reqs = Object.keys(Product.schema.tree);
        delete valid_reqs.userID;
        delete valid_reqs._id;
        delete valid_reqs.__v;

        try {
            var _request = {};
            for (i of Object.keys(request)) {
                if (valid_reqs.includes(i)) {
                    _request[i] = request[i];
                }
            }
            console.log("Request: ", _request);
            var update = await Product.findByIdAndUpdate(productID, _request, { "new":true });
            console.log("Updated Product: ", update);
            refreshReturn({}, res, token);
        }
        catch (err) {
            res.status(400).json({ "error":err.message });
        }
    });

app.post("/api/delete_product", async (req, res) => {
        // incoming: JWT Token ("accessToken"), Product ID

        const token = tokenDecode(req.body["accessToken"]);
        if ("error" in token) {
            res.status(400).json(token);
            return;
        }

        const userID = token.payload["userID"];
        const productID = req.body["productID"];

        const results = await Product.find({ "_id":productID });
        if (results.length == 0) {
            res.status(404).json({ "error":"Invalid product ID." });
            return;
        }
        const result = results[0];

        if (result["userID"].toString() !== userID) {
            res.status(403).json({ "error":"Permission denied; cannot delete a product without ownership." });
            return;
        }

        try {
            var deleted = await Product.findByIdAndDelete(productID);
            console.log("Deleted Product: ", deleted);
            refreshReturn({}, res, token);
        }
        catch (err) {
            res.status(400).json({ "error":err.message });
        }
    });

    app.post("/api/add_item", async (req, res) => {
        // incoming: JWT Token ("accessToken"), Product ID, quantity

        const token = tokenDecode(req.body["accessToken"]);
        if ("error" in token) {
            res.status(400).json(token);
            return;
        }

        const userID = token.payload["userID"];
        const productID = req.body["productID"];
        const quantity = req.body["quantity"];
        const product = await Product.find({ "_id":productID });
        if (product.length == 0 || !("quantity" in req.body) || quantity <= 0) {
            res.status(400).json({ "error":"Invalid product ID or quantity" });
            return;
        }

        var order = await Order.find({ "userID":userID, "status":"active" });
        if (order.length == 0) {
            order = new Order({ "userID":userID, "status":"active" });
            order.save();
        }
        else {
            order = order[0];
        }


        try {
            const request = { "orderID":order._id, "productID":productID, "quantity":quantity };
            const newItem = new Item(request);

            newItem.save();
            console.log(newItem);
            refreshReturn({}, res, token);
        }
        catch (err) {
            res.status(400).json({ "error":err.message });
        }
    });

    app.post("/api/get_items", async (req, res) => {
        // incoming: JWT Token ("accessToken"), order ID (active if unspecified),
            // product or item ID (all if unspecified)

        const token = tokenDecode(req.body["accessToken"]);
        if ("error" in token) {
            res.status(400).json(token);
            return;
        }

        const userID = token.payload["userID"];
        var order;
        if ("orderID" in req.body) {
            order = await Order.find({ "userID":userID, "_id":req.body["orderID"] });
        }
        else {
            order = await Order.find({ "userID":userID, "status":"active" });
        }

        if (order.length == 0) {
            res.status(404).json({ "error":"Order does not exist" });
            return;
        }
        order = order[0].toJSON();
        const orderID = order["_id"];

        var items;
        if ("itemID" in req.body) {
            items = await Item.find({ "orderID":orderID, "_id":req.body["itemID"] });
        }
        else if ("productID" in req.body) {
            items = await Item.find({ "orderID":orderID, "productID":req.body["productID"] });
        }
        else {
            items = await Item.find({ "orderID":orderID });
        }

        try {
            var _ret = [];
            for (var i = 0; i < items.length; i++) {
                var result = items[i].toJSON();

                result["itemID"] = result["_id"];
                delete result.__v;
                delete result._id;

                _ret.push(result);
            }

            var ret = { "results":_ret };
            refreshReturn(ret, res, token);
        }
        catch (err) {
            res.status(400).json({ "error":err.message });
        }
    });

    app.post("/api/order_history", async (req, res) => {
        // incoming: JWT Token ("accessToken")

        const token = tokenDecode(req.body["accessToken"]);
        if ("error" in token) {
            res.status(400).json(token);
            return;
        }

        const userID = token.payload["userID"];
        var actives = await Order.find({ "userID":userID, "status":"active" }).sort({ "dateCreated":"desc" });
        var pendings = await Order.find({ "userID":userID, "status":"pending" }).sort({ "dateCreated":"desc" });
        var completes = await Order.find({ "userID":userID, "status":"complete" }).sort({ "dateCreated":"desc" });
        var results = [].concat(actives, pendings, completes);

        try {
            var _ret = [];
            for (var i = 0; i < results.length; i++) {
                var result = results[i].toJSON();

                result["orderID"] = result["_id"];
                delete result.__v;
                delete result._id;

                _ret.push(result);
            }

            var ret = { "results":_ret };
            refreshReturn(ret, res, token);
        }
        catch (err) {
            res.status(400).json({ "error":err.message });
        }
    });

    app.post("/api/delete_item", async (req, res) => {
        // incoming: JWT Token ("accessToken"), product or item ID

        const token = tokenDecode(req.body["accessToken"]);
        if ("error" in token) {
            res.status(400).json(token);
            return;
        }

        const userID = token.payload["userID"];
        var order = await Order.find({ "userID":userID, "status":"active" });

        if (order.length == 0) {
            res.status(404).json({ "error":"No active order" });
            return;
        }
        order = order[0].toJSON();
        const orderID = order["_id"];

        var items;
        if ("itemID" in req.body) {
            items = await Item.find({ "orderID":orderID, "_id":req.body["itemID"] });
        }
        else if ("productID" in req.body) {
            items = await Item.find({ "orderID":orderID, "productID":req.body["productID"] });
        }
        else {
            res.status(404).json({ "error":"Item not found" });
            return;
        }
        if (items.length == 0) {
            res.status(404).json({ "error":"Item not found" });
            return;
        }

        try {
            for (var i = 0; i < items.length; i++) {
                var result = items[i].toJSON();
                var deleted = await Item.findByIdAndDelete(result["_id"]);
                console.log("Deleted Item: ", deleted);
            }

            refreshReturn({}, res, token);
        }
        catch (err) {
            res.status(400).json({ "error":err.message });
        }
    });

    app.post("/api/clear_order", async (req, res) => {
        // incoming: JWT Token ("accessToken")
        const token = tokenDecode(req.body["accessToken"]);
        if ("error" in token) {
            res.status(400).json(token);
            return;
        }

        const userID = token.payload["userID"];
        var order = await Order.find({ "userID":userID, "status":"active" });

        if (order.length == 0) {
            res.status(404).json({ "error":"No active order" });
            return;
        }
        order = order[0].toJSON();
        const orderID = order["_id"];

        var items = await Item.find({ "orderID":orderID });

        try {
            for (var i = 0; i < items.length; i++) {
                var result = items[i].toJSON();
                var deleted = await Item.findByIdAndDelete(result["_id"]);
                console.log("Deleted Item: ", deleted);
            }

            var deleted = await Order.findByIdAndDelete(orderID);
            console.log("Deleted Order: ", deleted);

            refreshReturn({}, res, token);
        }
        catch (err) {
            res.status(400).json({ "error":err.message });
        }
    });

    app.post("/api/checkout", async (req, res) => {
        // incoming: JWT Token ("accessToken"), shippingAddress

        const token = tokenDecode(req.body["accessToken"]);
        if ("error" in token) {
            res.status(400).json(token);
            return;
        }

        if (!("shippingAddress" in req.body)) {
            res.status(400).json({ "error":"Must specify shipping address" });
            return;
        }

        const userID = token.payload["userID"];
        var user = await User.find({ "_id":userID });
        user = user[0].toJSON();
        var order = await Order.find({ "userID":userID, "status":"active" });

        if (order.length == 0) {
            res.status(404).json({ "error":"No active order" });
            return;
        }
        order = order[0].toJSON();
        const orderID = order["_id"];

        var items = await Item.find({ "orderID":orderID });

        try {
            var changes = {};
            var totalPrice = 0;
            for (var i = 0; i < items.length; i++) {
                var result = items[i].toJSON();

                var p = await Product.find({ "_id":result["productID"] });
                p = p[0].toJSON();
                totalPrice += p["price"] * result["quantity"];

                if (result.productID in changes) {
                    changes[result.productID] -= result["quantity"];
                }
                else {
                    changes[result.productID] = p["stockQuantity"] - result["quantity"];
                }

                if (changes[result.productID] < 0) {
                    res.status(400).json({ "error":`Insufficient quantity of ${p.name}` });
                    return;
                }
            }

            if (!("balance" in user) || totalPrice > user["balance"]) {
                res.status(400).json({ "error":`Insufficient balance (${totalPrice} needed)` });
                return;
            }

            const now = new Date(Date.now());
            var newOrder = await Order.findByIdAndUpdate(orderID, { "shippingAddress":req.body["shippingAddress"], "dateCreated":now, "status":"pending" }, { "new":true });
            console.log("Updated Order: ", newOrder);

            var newUser = await User.findByIdAndUpdate(userID, { "balance":(user["balance"] - totalPrice) }, { "new":true });
            console.log("Updated User: ", newUser);

            const itemUpdates = await Item.updateMany({ "orderID":orderID }, { $set: { "status":"pending" } });
            if (!itemUpdates.acknowledged) {
                res.status(500).json({ "error":"Unknown error" });
                console.log(itemUpdates);
                await User.findByIdAndUpdate(userID, { "balance":(user["balance"] + totalPrice) });
                await Order.findByIdAndUpdate(orderID, { "status":"active" });
            }

            for (i of Object.keys(changes)) {
                var newProduct = await Product.findByIdAndUpdate(i, { "stockQuantity":changes[i] }, { "new":true });
                console.log("Updated Product: ", newProduct);
            }

            refreshReturn({}, res, token);
        }
        catch (err) {
            res.status(400).json({ "error":err.message });
        }
    });

    app.post("/api/get_orders", async (req, res) => {
        // incoming: JWT Token ("accessToken"), Product ID

        const token = tokenDecode(req.body["accessToken"]);
        if ("error" in token) {
            res.status(400).json(token);
            return;
        }

        const userID = token.payload["userID"];
        const productID = req.body["productID"];

        const results = await Product.find({ "_id":productID });
        if (results.length == 0) {
            res.status(404).json({ "error":"Invalid product ID." });
            return;
        }
        const result = results[0];

        if (result["userID"].toString() !== userID) {
            res.status(403).json({ "error":"Permission denied; cannot view orders for a product without ownership." });
            return;
        }

        const items = await Item.find({ "productID":productID, "status":"pending" });

        try {
            var _ret = [];
            for (var i = 0; i < items.length; i++) {
                var result = items[i].toJSON();

                var order = await Order.find({ "_id":result["orderID"] });
                order = order[0].toJSON();

                result["itemID"] = result["_id"];
                result["shippingAddress"] = order["shippingAddress"];
                reult["dateCreated"] = order["dateCreated"];
                delete result.__v;
                delete result._id;

                _ret.push(result);
            }

            _ret.sort((a, b) => a.dateCreated - b.dateCreated);
            var ret = { "results":_ret };
            refreshReturn(ret, res, token);
        }
        catch (err) {
            res.status(400).json({ "error":err.message });
        }
    });

    app.post("/api/mark_order", async (req, res) => {
        // incoming: JWT Token ("accessToken"), Item ID, status (fulfilled or refunded, fulfilled if unspecified)

        const token = tokenDecode(req.body["accessToken"]);
        if ("error" in token) {
            res.status(400).json(token);
            return;
        }

        const userID = token.payload["userID"];
        const itemID = req.body["itemID"];

        const results = await Item.find({ "_id":itemID, "status":"pending" });
        if (results.length == 0) {
            res.status(404).json({ "error":"Invalid item ID." });
            return;
        }
        const result = results[0];

        var product = await Product.find({ "_id":result["productID"] });
        product = product[0];

        if (product["userID"].toString() !== userID) {
            res.status(403).json({ "error":"Permission denied; cannot view orders for a product without ownership." });
            return;
        }

        var order = await Order.find({ "_id":result["orderID"] });
        order = order[0];

        const totalPrice = result["quantity"] * product["price"];

        try {
            var updated;
            var status;
            if ("status" in req.body && req.body["status"] == "refunded") {
                status = "refunded";
                updated = await User.findByIdAndUpdate(order["userID"], {$inc: { "balance":totalPrice } }, { "new":true });
                console.log("Updated User: ", updated);
            }
            else {
                status = "fulfilled";
                updated = await User.findByIdAndUpdate(userID, {$inc: { "balance":totalPrice } }, { "new":true });
                console.log("Updated User: ", updated);
            }

            updated = await Item.findByIdAndUpdate(itemID, { "status":status }, { "new": true });
            console.log("Updated Item: ", updated);

            const items = await Item.find({ "orderID":order["_id"], "status":"pending" });
            if (items.length == 0) {
                updated = await Order.findByIdAndUpdate(result["orderID"], { "status":"complete" }, { "new":true });
                console.log("Updated Order: ", updated);
            }

            refreshReturn({}, res, token);
        }
        catch (err) {
            res.status(400).json({ "error":err.message });
        }
    });

    app.post("/api/deposit", async (req, res) => {
        // incoming: JWT Token ("accessToken"), deposit (positive)

        const token = tokenDecode(req.body["accessToken"]);
        if ("error" in token) {
            res.status(400).json(token);
            return;
        }

        const userID = token.payload["userID"];

        const results = await User.find({ "_id":userID });
        const result = results[0];

        if (!("deposit" in req.body) || req.body["deposit"] <= 0) {
            res.status(400).json({ "error":"nonpositive deposit" });
            return;
        }

        try {
            const newBalance = result.balance + req.body["deposit"];
            var update = await User.findByIdAndUpdate(userID, { "balance":newBalance }, { "new":true });
            console.log("Updated User: ", update);
            refreshReturn({}, res, token);
        }
        catch (err) {
            res.status(400).json({ "error":err.message });
        }
    });

app.post("/api/update_user", async (req, res) => {
        // incoming: JWT Token ("accessToken"), User changes

        const token = tokenDecode(req.body["accessToken"]);
        if ("error" in token) {
            res.status(400).json(token);
            return;
        }

        const userID = token.payload["userID"];

        const results = await User.find({ "_id":userID });
        const result = results[0];

        var request = req.body;

        if ("userID" in request) {
            res.status(403).json({ "error":"Permission denied. Cannot change user ID" });
            return;
        }

        if ("dateCreated" in request) {
            res.status(403).json({ "error":"Permission denied. Cannot change user creation date" });
            return;
        }

        if ("balance" in request) {
            res.status(403).json({ "error":"Permission denied. Cannot change user balance" });
            return;
        }

        var valid_reqs = Object.keys(User.schema.tree);
        delete valid_reqs.dateCreated;
        delete valid_reqs.balance;
        delete valid_reqs._id;
        delete valid_reqs.__v;

        try {
            var _request = {};
            for (i of Object.keys(request)) {
                if (valid_reqs.includes(i)) {
                    _request[i] = request[i];
                }
            }
            console.log("Request: ", _request);
            var update = await User.findByIdAndUpdate(userID, _request, { "new":true });
            console.log("Updated User: ", update);
            refreshReturn({}, res, token);
        }
        catch (err) {
            res.status(400).json({ "error":err.message });
        }
    });


    /*app.get("/api/testget", async (req, res, next) => {
        const results = await Product.find({"name":"randomname"});
        res.status(200).json(results);
    });*/
}

// refresh JWT Token and append to response, or respond with error
function refreshReturn(ret, res, token) {
    try {
        var refreshedToken = JWT.refresh(token);
        ret["accessToken"] = refreshedToken["accessToken"];
        res.status(200).json(ret);
    }
    catch (err) {
        res.status(400).json({ "error":err.message });
        console.log(err.message);
    }
}

function tokenDecode(token) {
    try {
        if (JWT.isExpired(token)) {
            return { "error":"This JSON Web Token is no longer valid" };
        }
        const decoded = JWT.decode(token);
        return decoded;
    }
    catch (err) {
        return { "error":err.message };
        console.log(err.message);
    }
}

function cancelCheckout()

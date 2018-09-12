function checkLoginAdmin(isAPI) {
    return function (req, res, next) {
        if (req.user) {
            next();
        } else {
            if (isAPI) {
                res.send("您沒有權限");
            } else {
                res.redirect("/admin/login");
            }
        }
    }
}

module.exports = {
    "checkLoginAdmin": checkLoginAdmin
}
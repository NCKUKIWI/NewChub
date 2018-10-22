var express = require('express');
var router = express.Router();
var fs = require('fs');
var multer = require('multer');
var rimraf = require('rimraf');
var bcrypt = require('bcrypt');
var Project = require("../models/Project");
var Image = require("../models/Image");

var bannerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(`${__dirname}/../uploads/project/${req.params.id}`)) {
            fs.mkdirSync(`${__dirname}/../uploads/project/${req.params.id}`);
        }
        if (fs.existsSync(`${__dirname}/../uploads/project/${req.params.id}/banner.png`)) {
            rimraf.sync(`${__dirname}/../uploads/project/${req.params.id}/banner.png`);
        }
        cb(null, `${__dirname}/../uploads/project/${req.params.id}`);
    },
    filename: function (req, file, cb) {
        cb(null, "banner.png");
    }
});

var bannerUpload = multer({
    storage: bannerStorage
}).single("banner");

var imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(`${__dirname}/../uploads/project/${req.params.id}`)) {
            fs.mkdirSync(`${__dirname}/../uploads/project/${req.params.id}`);
        }
        if (!fs.existsSync(`${__dirname}/../uploads/project/${req.params.id}/${req.params.type}`)) {
            fs.mkdirSync(`${__dirname}/../uploads/project/${req.params.id}/${req.params.type}`);
        }
        cb(null, `${__dirname}/../uploads/project/${req.params.id}/${req.params.type}`);
    },
    filename: function (req, file, cb) {
        var timestamp = new Date().getTime();
        cb(null, timestamp + ".jpg");
    }
});

var imageUpload = multer({
    storage: imageStorage
}).single("image");

router.get('/', function (req, res) {
    Project.findAll().then(projects => {
        res.send(projects);
    });
});

router.post('/', function (req, res) {
    Project.create(req.body).then(function (project) {
        res.send(project);
    });
});

router.get('/:id', function (req, res) {
    var id = parseInt(req.params.id);
    Project.findById(id).then(project => {
        Image.findAll({
            where: {
                project_id: id
            }
        }).then(images => {
    		project["images"] = images;
            res.send(project);
        });
    })
})

router.post('/update/:id', function (req, res) {
    var id = parseInt(req.params.id);
    Project.update(req.body, {
        where: {
            id: id
        }
    }).then(function () {
        res.send("更新成功");
    });
});

router.post('/banner/:id', function (req, res) {
    var id = parseInt(req.params.id);
    bannerUpload(req, res, function (err) {
        if (err) {
            res.send({
                error: err
            });
        } else {
            Project.update({
                banner: 1
            }, {
                where: {
                    id: id
                }
            }).then(function () {
                res.send("ok");
            });
        }
    });
});

router.post('/image/:type/:id', function (req, res) {
    var id = parseInt(req.params.id);
    var type = req.params.type;
    imageUpload(req, res, function (err) {
        if (err) {
            res.send({
                error: err
            });
        } else {
            Image.create({
                "project_id": id,
                "name": req.file.filename,
                "type": type
            }).then(function () {
                res.send("ok");
            });
        }
    });
});

router.delete('/banner/:id', function (req, res) {
    var id = parseInt(req.params.id);
    Project.update({
        "banner": 0
    }, {
        where: {
            id: id
        }
    }).then(function () {
        rimraf.sync(`${__dirname}/../uploads/project/${id}/banner.png`);
        res.send("刪除成功");
    });
});

router.delete('/image/:id', function (req, res) {
    var id = parseInt(req.params.id);
    Image.findById(id).then(image => {
        Image.destroy({
            where: {
                id: id
            }
        }).then(function () {
            rimraf.sync(`${__dirname}/../uploads/project/${image.project_id}/${image.name}`);
            res.send("刪除成功");
        });
    });
});

router.delete('/:id', function (req, res) {
    var id = parseInt(req.params.id);
    Project.destroy({
        where: {
            id: id
        }
    }).then(function () {
        Image.destroy({
            where: {
                project_id: id
            }
        }).then(function () {
            rimraf.sync(`${__dirname}/../uploads/project/${id}`);
            res.send("刪除成功");
        });
    });
});

module.exports = router;
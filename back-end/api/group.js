// Dependencies
const basicAuth   = require('basic-auth');
const logger      = require('../logger');
const sessions    = require('../session');

// Procedures
const groupProc   = require('../procedures/group');

// Models
const Group       = require('../schemas/group');
const Message     = require('../schemas/message');
const User     = require('../schemas/user');


exports.newMessage = function(req, res) {
  groupProc.newMessage(req.body.message);
}

exports.getMessages = function(req, res) {
  logger('Get messages request by ' + sessions.getUserId(req.cookies));
  Message.find({group: req.params.group}, function(err, result) {
    if (err) {
      logger('Database error: ' + err);
      res.status(500).json({success: false});
      return;
    }
    res.json({success: true, messages: result});
  });
};

exports.createGroup = function(req, res) {
  logger('Group creation request.');
  try {
    for (member of req.body.members) {

        User.count({_id: member}, function(err, result) {
          if (err)
            throw err;

          if (result == 0)
            throw 'Not a valid userId';
        })

    }

    var owner     = sessions.getUserId(req.cookies);
    var members   = [owner].concat(req.body.members);
    var newGroup  =　new Group({
      name: req.body.name,
      owner: owner,
      members: members
    });

    newGroup.save(function(err) {
      if (err) {
        throw err;
      } else {
        res.json({success: true, newGroup: newGroup});
        logger('Group successfully created.');
      }
    });
  } catch(err) {
    logger('Database error: ' + err);
    res.status(500).json({succes: false, reason: 'Database error.'});
    return;
  }
}

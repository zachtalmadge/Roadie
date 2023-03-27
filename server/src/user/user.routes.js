module.exports = app => {

    const UserController = require('./user.controller')

    app.route('/user')
        .get(UserController.findUserEvents)

    app.route('/user/:festivalID')
        .put(UserController.addUserEvent)
        .delete(UserController.deleteUserEvent)
}
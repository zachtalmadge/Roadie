module.exports = app => {

    const FestivalController = require('./festivals.controllers')

    app.route('/festivals')
        .get(FestivalController.findFestivals)
        .post(FestivalController.createFestival)

    app.route('/festivals/:id')
        .get(FestivalController.findOneFestival)
}
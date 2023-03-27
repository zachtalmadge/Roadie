module.exports = app => {
    const ArtistController = require('./artists.controller')

    app.route('/artists')
        .get(ArtistController.getArtists)
        .post(ArtistController.addArtist)

    app.route('/artists/:id')
        .get(ArtistController.artistDetails)
}
/**
 * Created by klug§ on 2015-12-11.
 */

/*
Router.route('/', {
    name: 'home',
    controller: NewPostsController,
    fastRender: true
});

*/
Router.route("/example");
Router.route("/", {
    template: "home"
});

Router.route("/game");
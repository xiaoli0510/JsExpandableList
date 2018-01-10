// Determine theme depending on device
var isAndroid = Framework7.prototype.device.android === true;
var isIos = Framework7.prototype.device.ios === true;
 
// Set Template7 global devices flags
Template7.global = {
    android: isAndroid,
    ios: isIos
};
 
// Define Dom7
var $$ = Dom7;
 
// Add CSS Styles
if (!isAndroid) {
    $$('head').append(
        '<link rel="stylesheet" href="lib/css/framework7.material.min.css">' +
        '<link rel="stylesheet" href="lib/css/framework7.material.colors.min.css">'
    );
} else {
    $$('head').append(
        '<link rel="stylesheet" href="lib/css/framework7.ios.min.css">' +
        '<link rel="stylesheet" href="lib/css/framework7.ios.colors.min.css">'
    );
}
 
// Change Through navbar layout to Fixed
if (!isAndroid) {
    // Change class
    $$('.view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
    // And move Navbar into Page
    $$('.view .navbar').prependTo('.view .page');
}

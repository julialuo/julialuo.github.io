/**
 * Created by julia on 2016-07-11.
 */

$(document).ready(function() {

    //check window size when document loads
    if($(window).width() <= 600) {
        $("#profile-pic").attr("src", "assets/images/pic2 cropped.png");
    }
    else {
        $("#profile-pic").attr("src", "assets/images/pic2.png");
    }

    //colour changes on home page based on cursor position
    /*$(document).mousemove(function(e){
        var $width = ($(document).width())/255;
        var $height = ($(document).height())/255;
        var $pageX = parseInt(e.pageX / $width, 10);
        var $pageY = parseInt(e.pageY / $height, 10);
        $('#home-header').css('color', 'rgb('+(255-$pageX)+', 0,'+(255-$pageY)+')');
        $('.home-container').css('color', 'rgb('+$pageX+','+$pageY+', 255)');
    });*/

    //smooth scrolling
    $("a").on('click', function(event) {

        if (this.hash !== "") {
            event.preventDefault();

            var hash = this.hash;

            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 800, function(){

                window.location.hash = hash;
            });
        }
    });


    //check window size again whenever window is resized
    window.onresize = function () {
        if($(window).width() <= 600) {
            $("#profile-pic").attr("src", "assets/images/pic2 cropped.png");
            
        }
        else {
            $("#profile-pic").attr("src", "assets/images/pic2.png");
        }
    }

    var previous_id = 'home-nav';

    $('#home').waypoint(function(direction) {
        if (direction == 'down') {
            $('#' + previous_id).css('background-color', 'rgba(9, 38, 68, 0.7)');
            $('#home-nav').css('background-color', 'rgba(50, 50, 50, 0.7');
            previous_id = 'home-nav';
        }
    });

    $('#home').waypoint(function(direction) {
        if (direction == 'up') {
            $('#' + previous_id).css('background-color', 'rgba(9, 38, 68, 0.7)');
            $('#home-nav').css('background-color', 'rgba(50, 50, 50, 0.7)'); //rgb(181, 170, 255)
            previous_id = 'home-nav';
        }
    }, {
        offset: '-1%'
    });

    $('#about').waypoint(function(direction) {
        if (direction == 'down') {
            $('#' + previous_id).css('background-color', 'rgba(9, 38, 68, 0.7)');
            $('#about-nav').css('background-color', 'rgba(103, 51, 128, 0.7)');
            previous_id = 'about-nav';
        }
    }, {
        offset: '1%'
    });

    $('#about').waypoint(function(direction) {
        if (direction == 'up') {
            $('#' + previous_id).css('background-color', 'rgba(9, 38, 68, 0.7)');
            $('#about-nav').css('background-color', 'rgba(103, 51, 128, 0.7)');
            previous_id = 'about-nav';
        }
    }, {
        offset: '-1%'
    });

    $('#projects').waypoint(function(direction) {
        if (direction == 'down') {
            $('#' + previous_id).css('background-color', 'rgba(9, 38, 68, 0.7)');
            $('#projects-nav').css('background-color', 'rgba(126, 0, 64, 0.7)');
            previous_id = 'projects-nav';
        }
    }, {
            offset: '1%'
    });

    $('#projects').waypoint(function(direction) {
        if (direction == 'up') {
            $('#' + previous_id).css('background-color', 'rgba(9, 38, 68, 0.7)');
            $('#projects-nav').css('background-color', 'rgba(126, 0, 64, 0.7)');
            previous_id = 'projects-nav';
        }
    }, {
        offset: '-1%'
    });

    $('#contact').waypoint(function(direction) {
        if (direction == 'down') {
            $('#' + previous_id).css('background-color', 'rgba(9, 38, 68, 0.7)');
            $('#contact-nav').css('background-color', 'rgba(192, 85, 63, 0.7)');
            previous_id = 'contact-nav';
        }
    }, {
        offset: '1%'
    });

    $('#contact').waypoint(function(direction) {
        if (direction == 'up') {
            $('#' + previous_id).css('background-color', 'rgba(9, 38, 68, 0.7)');
            $('#contact-nav').css('background-color', 'rgba(203, 79, 18, 0.7)');
            previous_id = 'contact-nav';
        }
    }, {
        offset: '-1%'
    });
});

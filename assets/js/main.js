/**
 * Created by julia on 2016-07-11.
 */

$(document).ready(function() {

    //check window size when document loads
    if($(window).width() <= 600) {
        $("#profile-pic").attr("src", "assets/images/mdb_cropped.png");
    }
    else {
        $("#profile-pic").attr("src", "assets/images/mdb.png");
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
            $("#profile-pic").attr("src", "assets/images/mdb_cropped.png");
            
        }
        else {
            $("#profile-pic").attr("src", "assets/images/mdb.png");
        }
    }

    var previous_id = 'home-nav';
    var unselected_color = 'rgba(0, 0, 0, 0)';
    var selected_color = 'rgba(0, 0, 0, 0.2)';

    $('#home').waypoint(function(direction) {
        if (direction == 'down') {
            $('#' + previous_id).css('background-color', unselected_color);
            $('#home-nav').css('background-color', selected_color);
            previous_id = 'home-nav';
        }
    }, {
        offset: '1%'
    });

    $('#home').waypoint(function(direction) {
        if (direction == 'up') {
            $('#' + previous_id).css('background-color', unselected_color);
            $('#home-nav').css('background-color', selected_color); //rgb(181, 170, 255)
            previous_id = 'home-nav';
        }
    }, {
        offset: '-1%'
    });

    $('#about').waypoint(function(direction) {
        if (direction == 'down') {
            $('#' + previous_id).css('background-color', unselected_color);
            $('#about-nav').css('background-color', selected_color);
            previous_id = 'about-nav';
        }
    }, {
        offset: '1%'
    });

    $('#about').waypoint(function(direction) {
        if (direction == 'up') {
            $('#' + previous_id).css('background-color', unselected_color);
            $('#about-nav').css('background-color', selected_color);
            previous_id = 'about-nav';
        }
    }, {
        offset: '-1%'
    });

    $('#projects').waypoint(function(direction) {
        if (direction == 'down') {
            $('#' + previous_id).css('background-color', unselected_color);
            $('#projects-nav').css('background-color', selected_color);
            previous_id = 'projects-nav';
        }
    }, {
            offset: '1%'
    });

    $('#projects').waypoint(function(direction) {
        if (direction == 'up') {
            $('#' + previous_id).css('background-color', unselected_color);
            $('#projects-nav').css('background-color', selected_color);
            previous_id = 'projects-nav';
        }
    }, {
        offset: '-1%'
    });

    $('#contact').waypoint(function(direction) {
        if (direction == 'down') {
            $('#' + previous_id).css('background-color', unselected_color);
            $('#contact-nav').css('background-color', selected_color);
            previous_id = 'contact-nav';
        }
    }, {
        offset: '1%'
    });

    $('#contact').waypoint(function(direction) {
        if (direction == 'up') {
            $('#' + previous_id).css('background-color', unselected_color);
            $('#contact-nav').css('background-color', selected_color);
            previous_id = 'contact-nav';
        }
    }, {
        offset: '-1%'
    });
});

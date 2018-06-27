/**
 * Created by julia on 2016-07-11.
 */

$(document).ready(function() {

    setSidebarWidth();
    setProjectContentWidth();

    window.onresize = function () {
        setSidebarWidth();
        setProjectContentWidth();
    };

    ['#about', '#home', '#projects'].forEach(function (page) {
        $(page + "-nav").click(function(e) {
            $.smoothScroll({
                scrollElement: $('#content'),
                scrollTarget: page,
                speed: 1000,
            });
            return false;
        });
    });
});

function setSidebarWidth() {
    var contentWidth = $("#content").width();
    var contentHeight = $("#content").height();
    $("ul").width(contentWidth * 0.2);
    $("ul").height(contentHeight);
}

function setProjectContentWidth() {
    projectWidth = $(".project-content").width();
    $(".projects-container").css("grid-auto-rows", projectWidth);
}

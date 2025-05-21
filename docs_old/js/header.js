$(document.ready(function(){
    $(window).scroll(function(){
        if( $(this).scrolltop() > 0){
            $('header').addClass('header2');
        }else{
            $('header').removeClass('header2');
        }
    })
}))
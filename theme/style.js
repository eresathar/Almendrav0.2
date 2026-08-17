var myTheme = {
    init: function () {
        // Funciones comunes de eXe
        if (this.inIframe()) $('body').addClass('in-iframe');
        if (!$('body').hasClass('exe-web-site')) return;
        
        // Ejecutamos la inserción del logo de forma segura
        this.insertLogo();

        // Añadir botones de menú y buscador
        var togglers =
            '\
            <button type="button" id="siteNavToggler" class="toggler" title="' + $exe_i18n.menu + '">\
                <span class="sr-av">' + $exe_i18n.menu + '</span>\
            </button>\
            <button type="button" id="searchBarTogger" class="toggler" title="' + $exe_i18n.search + '">\
                <span class="sr-av">' + $exe_i18n.search + '</span>\
            </button>\
        ';
        $('#siteNav').before(togglers);

        // Comprobar estado de la navegación actual
        var url = window.location.href;
        url = url.split('?');
        if (url.length > 1) {
            if (url[1].indexOf('nav=false') != -1) {
                $('body').addClass('siteNav-off');
                myTheme.params('add');
            }
        }

        // Lógica del botón de menú lateral
        $('#siteNavToggler').on('click', function () {
            if (myTheme.isLowRes()) {
                $('#exe-client-search').hide();
                if ($('body').hasClass('siteNav-off')) {
                    $('body').removeClass('siteNav-off');
                } else {
                    if ($('#siteNav').isInViewport()) {
                        $('body').addClass('siteNav-off');
                        myTheme.params('add');
                    }
                }
            } else {
                $('body').toggleClass('siteNav-off');
                myTheme.params($('body').hasClass('siteNav-off') ? 'add' : 'remove');
            }
        });

        // Lógica del buscador
        $('#searchBarTogger').on('click', function () {
            var bar = $('#exe-client-search');
            if (bar.is(':visible')) {
                bar.hide();
            } else {
                if (myTheme.isLowRes()) {
                    $('body').addClass('siteNav-off');
                }
                bar.show();
                $('#exe-client-search-text').focus();
            }
        });

        // Fijar navegación lateral
        $('#siteNav').wrap('<div id="sidebar-nav"></div>');
        myTheme.checkNav();
        $(window).bind('resize', function () {
            myTheme.checkNav();
        });

        this.searchForm();
        this.movePageTitle();
    },
    inIframe: function () {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    },
    searchForm: function () {
        $('#exe-client-search-text').attr('class', 'form-control');
    },
    isLowRes: function () {
        return $('#siteNav').css('float') == 'none';
    },
    checkNav: function () {
        var wrapper = $('#sidebar-nav');
        var navH = $('#siteNav > ul').height();
        navH = navH + 50;
        if (navH < $(window).height()) wrapper.addClass('fixed');
        else wrapper.removeClass('fixed');
    },
    param: function (e, act) {
        if (act == 'add') {
            var ref = e.href;
            var con = '?';
            if (ref.indexOf('.html?') != -1) con = '&';
            var param = 'nav=false';
            if (ref.indexOf(param) == -1) {
                ref += con + param;
                e.href = ref;
            }
        } else {
            var ref = e.href;
            ref = ref.split('?');
            e.href = ref[0];
        }
    },
    params: function (act) {
        $('.nav-buttons a').each(function () {
            myTheme.param(this, act);
        });
    },

    // NUEVA FUNCIÓN CONTROLADA: Inserta el logo de forma única antes del título principal
    insertLogo: function () {
        // Buscamos el contenedor exacto del título del paquete dentro de la cabecera fija
        var $title = $('.page > header .package-title');
        
        // Verificamos si existe el título y aseguramos que no se haya inyectado ya el logo antes
        if ($title.length && !$('.custom-logo').length) {
            // Obtenemos la ruta base del script style.js para resolver correctamente la ruta relativa en eXeLearning
            var stylePath = '';
            var scripts = document.getElementsByTagName('script');
            for (var i = 0; i < scripts.length; i++) {
                var src = scripts[i].getAttribute('src') || scripts[i].src;
                if (src && src.indexOf('style.js') !== -1) {
                    stylePath = src.substring(0, src.indexOf('style.js'));
                    break;
                }
            }
            var logoHtml = '<img src="' + stylePath + 'img/logo.png" alt="Logo" class="custom-logo" />';
            // Colocamos el logo justo antes del texto del título, de forma interna y limpia
            $title.before(logoHtml);
        }
    },

    movePageTitle: function () {
        const tryMove = () => {
            const $header = $('.main-header .page-header');
            const $title = $header.find('.page-title').first();

            let $content = $('.page-content').first();
            if (!$content.length) $content = $('.content, main .content').first();
            if (!$content.length) $content = $('#main, #content').first();
            if (!$content.length && $header.length) $content = $header.nextAll(':not(header)').first();
            if (!$content.length && $header.length) $content = $header.parent();

            // Evitamos que se duplique comprobando si el contenedor ya tiene el título
            if ($header.length && $title.length && $content.length && !$content.find('> .page-title').length) {
                $content.prepend($title);
                return true;
            }
            return false;
        };

        if (tryMove()) return;
        const observer = new MutationObserver(() => {
            if (tryMove()) observer.disconnect();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
};

$(function () {
    myTheme.init();
});

$.fn.isInViewport = function () {
    var elementTop = $(this).offset().top;
    var elementBottom = elementTop + $(this).outerHeight();
    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();
    return elementBottom > viewportTop && elementTop < viewportBottom;
};
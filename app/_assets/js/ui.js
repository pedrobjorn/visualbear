"use strict";

var storeHash = '';

function scroller(destination) {
    if (destination) {
        $('html, body').animate({
            scrollTop: $('#' + destination).offset().top
        }, 750);
    }
}

var addEvent = function(object, type, callback) {
    if (object == null || typeof(object) == 'undefined') return;
    if (object.addEventListener) {
        object.addEventListener(type, callback, false);
    } else if (object.attachEvent) {
        object.attachEvent("on" + type, callback);
    } else {
        object["on" + type] = callback;
    }
};

var resize = function() {
    var clientHeight = $(window).height();
    $('.js-container').css('height', clientHeight - 48);
}

var clickHandler = function(anchor) {
    anchor.setAttribute('class', 'active');
    $('.navmenu').offcanvas('toggle');
}

var linkFinder = function(hash) {
    var els = document.getElementsByTagName("a"),
        els_length = els.length;

    if (storeHash != hash || storeHash.length == 0) {
        for (var i = 0, l = els_length; i < l; i++) {
            var el = els[i];

            if (el.href === '/' + hash) {

                storeHash = hash;

            }
        }
    }
}

$(document).ready(function() {

    window.addEventListener('resize', function(event) {
        resize();
    });

    var bootstrapButton = $.fn.button.noConflict(); // return $.fn.button to previously assigned value
    var menu = document.querySelector('.navigation');
    var anchors = menu.getElementsByTagName('a');
    var url = "http://localhost:9000";

    $.fn.bootstrapBtn = bootstrapButton; // give $().bootstrapBtn the Bootstrap functionality

    $('.navmenu').offcanvas({
        disableScrolling: false,
        toggle: false,
        placement: 'right',
        recalc: false,
        canvas: false
    });

    // $('img').bind('contextmenu', function(e){
    //     return false;
    // });

    ! function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0],
            p = /^http:/.test(d.location) ? 'http' : 'https';
        if (!d.getElementById(id)) {
            js = d.createElement(s);
            js.id = id;
            js.src = p + '://platform.twitter.com/widgets.js';
            fjs.parentNode.insertBefore(js, fjs);
        }
    }(document, 'script', 'twitter-wjs');

    for (var i = 0; i < anchors.length; i += 1) {
        anchors[i].addEventListener('click', function() {

            for (var i = 0; i < anchors.length; i += 1) {
                anchors[i].setAttribute('class', 'inactive');
            };
            clickHandler(this);
        }, false);
    }

    window.Parsley.on('form:error', function() {
        // This global callback will be called for any field that fails validation.
        console.log('Validation failed for: ', this.$element);
    });

    window.Parsley.on('form:success', function() {
        document.getElementById("success").style.display = "initial";
        document.getElementById("submit").disabled = true;
        setTimeout(function() {
            document.getElementById("submit").disabled = false;
            document.getElementById("success").style.display = "none";
        }, 3000);
    });

    // $(window).scroll(function() {

    //     console.log(($('#about').offset().top < $(this).height() + $(this).scrollTop()) || ($('#about').height > $(this).height() + $(this).scrollTop()));
    // });

    var jumboId = document.getElementById('jumbo');
    var workId = document.getElementById('work');
    var anchor_offset;

    var navBar = document.getElementsByClassName('navbar');
    
    if (workId != null) {
        anchor_offset = $('#work').offset().top;
    }

        if ($(window).scrollTop() < (anchor_offset - 48)) {

            navBar[0].style.backgroundColor = "transparent";
            if (screen.width < 767) {
                navBar[0].style.display = "none";
            }
        }
    for (var i = 0; i < navBar.length;i++) {
        if (jumboId === null) {
            navBar[i].style.backgroundColor = "#313135";
            navBar[i].style.display = "inherit";
        }
    }
    $(window).scroll(function() {
        if (anchor_offset != null) {
            if ($(window).scrollTop() > (anchor_offset - 48)) {
                navBar[0].style.backgroundColor = "#313135";
                navBar[0].style.display = "inherit";
            } else {
                navBar[0].style.backgroundColor = "transparent";
                if (screen.width < 767) {
                    navBar[0].style.display = "none";
                }
            }
        }
    });

    $("#jumbo").mouseover(function() {
        linkFinder("#jumbo");
    });

    $("#work").mouseover(function() {
        linkFinder("#work");
    });

    $("#about").mouseover(function() {
        linkFinder("#about");
    });

    $("#contact").mouseover(function() {
        linkFinder("#contact");
    });

    //button animation
    /* var toggles = $(".vb-cross");
  var button =  document.getElementsByClassName("vb-cross");

  toggleHandler(toggles[0]);

  function toggleHandler(toggle) {
   $(".container").on('click',function(e){
         e.preventDefault();
      if(button[0].classList.contains("active") === true) {
          button[0].classList.remove("active");
         }
   });
    toggle.addEventListener( "click", function(e) {
      e.preventDefault();
      (this.classList.contains("active") === true) ? this.classList.remove("active") : this.classList.add("active");
    });
  }*/

});


/* ========================================================================
 * Bootstrap: offcanvas.js v3.1.3
 * http://jasny.github.io/bootstrap/javascript/#offcanvas
 * ========================================================================
 * Copyright 2013-2014 Arnold Daniels
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

+ function($) {
    "use strict";

    // OFFCANVAS PUBLIC CLASS DEFINITION
    // =================================

    var OffCanvas = function(element, options) {
        this.$element = $(element)
        this.options = $.extend({}, OffCanvas.DEFAULTS, options)
        this.state = null
        this.placement = null

        if (this.options.recalc) {
            this.calcClone()
            $(window).on('resize', $.proxy(this.recalc, this))
        }

        if (this.options.autohide)
            $(document).on('click', $.proxy(this.autohide, this))

        if (this.options.toggle) this.toggle()

        if (this.options.disablescrolling) {
            this.options.disableScrolling = this.options.disablescrolling
            delete this.options.disablescrolling
        }
    }

    OffCanvas.DEFAULTS = {
        toggle: true,
        placement: 'auto',
        autohide: true,
        recalc: true,
        disableScrolling: true
    }

    OffCanvas.prototype.offset = function() {
        switch (this.placement) {
            case 'left':
            case 'right':
                return this.$element.outerWidth()
            case 'top':
            case 'bottom':
                return this.$element.outerHeight()
        }
    }

    OffCanvas.prototype.calcPlacement = function() {
        if (this.options.placement !== 'auto') {
            this.placement = this.options.placement
            return
        }

        if (!this.$element.hasClass('in')) {
            this.$element.css('visiblity', 'hidden !important').addClass('in')
        }

        var horizontal = $(window).width() / this.$element.width()
        var vertical = $(window).height() / this.$element.height()

        var element = this.$element

        function ab(a, b) {
            if (element.css(b) === 'auto') return a
            if (element.css(a) === 'auto') return b

            var size_a = parseInt(element.css(a), 10)
            var size_b = parseInt(element.css(b), 10)

            return size_a > size_b ? b : a
        }

        this.placement = horizontal >= vertical ? ab('left', 'right') : ab('top', 'bottom')

        if (this.$element.css('visibility') === 'hidden !important') {
            this.$element.removeClass('in').css('visiblity', '')
        }
    }

    OffCanvas.prototype.opposite = function(placement) {
        switch (placement) {
            case 'top':
                return 'bottom'
            case 'left':
                return 'right'
            case 'bottom':
                return 'top'
            case 'right':
                return 'left'
        }
    }

    OffCanvas.prototype.getCanvasElements = function() {
        // Return a set containing the canvas plus all fixed elements
        var canvas = this.options.canvas ? $(this.options.canvas) : this.$element

        var fixed_elements = canvas.find('*').filter(function() {
            return $(this).css('position') === 'fixed'
        }).not(this.options.exclude)

        return canvas.add(fixed_elements)
    }

    OffCanvas.prototype.slide = function(elements, offset, callback) {
        // Use jQuery animation if CSS transitions aren't supported
        if (!$.support.transition) {
            var anim = {}
            anim[this.placement] = "+=" + offset
            return elements.animate(anim, 600, callback)
        }

        var placement = this.placement
        var opposite = this.opposite(placement)

        elements.each(function() {
            if ($(this).css(placement) !== 'auto')
                $(this).css(placement, (parseInt($(this).css(placement), 10) || 0) + offset)

            if ($(this).css(opposite) !== 'auto')
                $(this).css(opposite, (parseInt($(this).css(opposite), 10) || 0) - offset)
        })

        this.$element
            .one($.support.transition.end, callback)
            .emulateTransitionEnd(600)
    }

    OffCanvas.prototype.show = function() {
        if (this.state) return

        var startEvent = $.Event('show.bs.offcanvas')
        this.$element.trigger(startEvent)
        if (startEvent.isDefaultPrevented()) return

        this.state = 'slide-in'
        this.calcPlacement();

        var elements = this.getCanvasElements()
        var placement = this.placement
        var opposite = this.opposite(placement)
        var offset = this.offset()

        if (elements.index(this.$element) !== -1) {
            $(this.$element).data('offcanvas-style', $(this.$element).attr('style') || '')
            this.$element.css(placement, -1 * offset)
            this.$element.css(placement); // Workaround: Need to get the CSS property for it to be applied before the next line of code
        }

        elements.addClass('canvas-sliding').each(function() {
            if ($(this).data('offcanvas-style') === undefined) $(this).data('offcanvas-style', $(this).attr('style') || '')
            if ($(this).css('position') === 'static') $(this).css('position', 'relative')
            if (($(this).css(placement) === 'auto' || $(this).css(placement) === '0px') &&
                ($(this).css(opposite) === 'auto' || $(this).css(opposite) === '0px')) {
                $(this).css(placement, 0)
            }
        })

        if (this.options.disableScrolling) {
            this.disableScrolling()
        }

        var complete = function() {
            if (this.state != 'slide-in') return

            this.state = 'slid'

            elements.removeClass('canvas-sliding').addClass('canvas-slid')
            this.$element.trigger('shown.bs.offcanvas')
        }

        setTimeout($.proxy(function() {
            this.$element.addClass('in')
            this.slide(elements, offset, $.proxy(complete, this))
        }, this), 1)
    }

    OffCanvas.prototype.hide = function(fast) {
        if (this.state !== 'slid') return

        var startEvent = $.Event('hide.bs.offcanvas')
        this.$element.trigger(startEvent)
        if (startEvent.isDefaultPrevented()) return

        this.state = 'slide-out'

        var elements = $('.canvas-slid')
        var placement = this.placement
        var offset = -1 * this.offset()

        var complete = function() {
            if (this.state != 'slide-out') return

            this.state = null
            this.placement = null

            this.$element.removeClass('in')

            elements.removeClass('canvas-sliding')
            elements.add(this.$element).add('body').each(function() {
                //$(this).attr('style', $(this).data('offcanvas-style')).removeData('offcanvas-style')
            })

            this.$element.trigger('hidden.bs.offcanvas')
        }


        elements.removeClass('canvas-slid').addClass('canvas-sliding')

        setTimeout($.proxy(function() {
            this.slide(elements, offset, $.proxy(complete, this))
        }, this), 0)
    }

    OffCanvas.prototype.toggle = function() {
        if (this.state === 'slide-in' || this.state === 'slide-out') return
        this[this.state === 'slid' ? 'hide' : 'show']()
    }

    OffCanvas.prototype.calcClone = function() {
        this.$calcClone = this.$element.clone()
            .html('')
            .addClass('offcanvas-clone').removeClass('in')
            .appendTo($('body'))
    }

    OffCanvas.prototype.recalc = function() {
        if (this.$calcClone.css('display') === 'none' || (this.state !== 'slid' && this.state !== 'slide-in')) return

        this.state = null
        this.placement = null
        var elements = this.getCanvasElements()

        this.$element.removeClass('in')

        elements.removeClass('canvas-slid')
        elements.add(this.$element).add('body').each(function() {
            //$(this).attr('style', $(this).data('offcanvas-style')).removeData('offcanvas-style')
        })
    }

    OffCanvas.prototype.autohide = function(e) {
        if ($(e.target).closest(this.$element).length === 0) this.hide()
    }

    // OFFCANVAS PLUGIN DEFINITION
    // ==========================

    var old = $.fn.offcanvas

    $.fn.offcanvas = function(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.offcanvas')
            var options = $.extend({}, OffCanvas.DEFAULTS, $this.data(), typeof option === 'object' && option)

            if (!data) $this.data('bs.offcanvas', (data = new OffCanvas(this, options)))
            if (typeof option === 'string') data[option]()
        })
    }

    $.fn.offcanvas.Constructor = OffCanvas


    // OFFCANVAS NO CONFLICT
    // ====================

    $.fn.offcanvas.noConflict = function() {
        $.fn.offcanvas = old
        return this
    }

    // OFFCANVAS DATA-API
    // =================

    $(document).on('click.bs.offcanvas.data-api', '[data-toggle=offcanvas]', function(e) {
        var $this = $(this),
            href
        var target = $this.attr('data-target') || e.preventDefault() || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
        var $canvas = $(target)
        var data = $canvas.data('bs.offcanvas')
        var option = data ? 'toggle' : $this.data()

        e.stopPropagation()

        if (data) data.toggle()
        else $canvas.offcanvas(option)
    })

}(window.jQuery);
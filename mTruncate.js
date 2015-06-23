(function ($) {
    $.fn.mtruncate = function (options) {
        var settings = $.extend({
            maxLines: 11,
            expandText: 'Expand',
            collapseText: 'Collapse',
            hideImageOnCollapse: true
        }, options);

        return this.each(function () {
            var truncateElement = $(this).css('overflow', 'hidden');
            var wrapper = truncateElement.wrap('<div class="mTruncate-wrapper mTruncate-collapsed" />').parent();
            var control = $('<div class="mTruncate-control">' + settings.expandText + '</div>').appendTo(wrapper);

            var collapsedHeight = 0;
            var foundLines = 0;

            function calculateLines(first, element) {
                if (first == true) {
                    collapsedHeight = 0;
                    foundLines = 0;
                }

                element.each(function () {
                    if (this.nodeType == 8) {
                        return true;
                    }

                    var tagName = $(this).prop('tagName');
                    if (typeof tagName == 'undefined') {
                        var text = this.textContent.trim();
                        if (text.length == 0) {
                            return true;
                        }

                        var textParent = $(this).parent();
                        var height = textParent.height();
                        var lineHeight = parseFloat(textParent.css('line-height'));
                        var tempLines = Math.round(height / lineHeight);

                        collapsedHeight += parseFloat(textParent.css('margin-top'));

                        if ((foundLines + tempLines) >= settings.maxLines) {
                            tempLines = (settings.maxLines - foundLines);
                        }

                        collapsedHeight += tempLines * lineHeight;
                        foundLines += tempLines;

                        if (foundLines < settings.maxLines) {
                            collapsedHeight += parseFloat(textParent.css('margin-bottom'));
                        }

                        return true;
                    }

                    if (tagName.startsWith('H') && tagName.length == 2 && !isNaN(tagName[1])) {
                        collapsedHeight += $(this).height();
                        collapsedHeight += parseFloat($(this).css('margin-top'));
                        collapsedHeight += parseFloat($(this).css('margin-bottom'));

                        foundLines++;
                    }
                    else if (tagName.toLowerCase() == 'img') {
                        if (settings.hideImageOnCollapse) {
                            if ($(this).hasClass('mTruncate-hidden') == false) {
                                $(this).addClass('mTruncate-hidden');
                            }

                            return true;
                        }

                        collapsedHeight += $(this).height();
                        collapsedHeight += parseFloat($(this).css('margin-top'));
                        collapsedHeight += parseFloat($(this).css('margin-bottom'));

                        foundLines++;
                    }
                    else if ($(this).contents().length != 0) {
                        calculateLines(false, $(this).contents());
                    }

                    if (foundLines >= settings.maxLines) {
                        return false;
                    }
                });
            }

            $(window).resize(function () {
                calculateLines(true, truncateElement.contents());

                if (wrapper.hasClass('mTruncate-collapsed')) {
                    truncateElement.height(collapsedHeight);
                }
            }).trigger('resize');

            control.click(function () {
                if (wrapper.hasClass('mTruncate-collapsed')) {
                    $('.mTruncate-hidden').show();
                    var fullHeight = truncateElement.css('height', '100%').outerHeight();

                    $('.mTruncate-hidden').hide();
                    truncateElement.css('height', collapsedHeight);

                    truncateElement.animate({height: fullHeight}, 'slow', function () {
                        truncateElement.css('height', '');
                    });
                    control.html(settings.collapseText);

                    $('.mTruncate-hidden').fadeIn('slow');

                    wrapper.removeClass('mTruncate-collapsed');
                } else {
                    if (settings.hideImageOnCollapse == true) {
                        $('.mTruncate-hidden').fadeOut('slow');
                    }

                    truncateElement.animate({height: collapsedHeight}, 'slow');
                    control.html(settings.expandText);

                    wrapper.addClass('mTruncate-collapsed');
                }
            });
        });
    };
}(jQuery));
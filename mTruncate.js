(function ($) {
    $.fn.mtruncate = function (options) {
        var settings = $.extend({
            maxLines: 11,
            expandText: 'Expand',
            collapseText: 'Collapse',
            hideImageOnCollapse: true
        }, options);
        var self = this;

        return this.each(function () {
            //Modify the container so that it supports collapsing
            var truncateElement = $(this).css('overflow', 'hidden');
            var wrapper = truncateElement.wrap('<div class="mTruncate-wrapper mTruncate-collapsed" />').parent();
            var control = $('<div class="mTruncate-control">' + settings.expandText + '</div>').appendTo(wrapper);

            var floatStyle = truncateElement.css('float');
            if(floatStyle == 'left' || floatStyle == 'right') {
                wrapper.css('float', floatStyle);
            }

            var collapsedHeight = 0;
            var foundLines = 0;

            function calculateLines(first, element) {
                if (first == true) {
                    collapsedHeight = 0;
                    foundLines = 0;
                }

                //Iterate through every element in the container
                element.each(function () {

                    //Type 8 is a comment node, this item is not displayed
                    if (this.nodeType == 8) {
                        return true;
                    }

                    //All elements that are direct in the container?
                    var tagName = $(this).prop('tagName');
                    if (typeof tagName == 'undefined') {

                        //When the item has no height, stop calculating
                        var text = this.textContent.trim();
                        if (text.length == 0) {
                            return true;
                        }

                        //Calculate the height and lines of the text element
                        var textParent = $(this).parent();
                        var height = textParent.height();
                        var lineHeight = parseFloat(textParent.css('line-height'));
                        var containerLinesThatHaveToBeVisible = Math.round(height / lineHeight);

                        //Add size to ignore, we want to collapse with lines, not size
                        collapsedHeight += parseFloat(textParent.css('margin-top'));

                        //When there are to much lines, determine how many can be shown
                        var thisIsTheLastElementThatIsShown = foundLines + containerLinesThatHaveToBeVisible == settings.maxLines;
                        if ((foundLines + containerLinesThatHaveToBeVisible) >= settings.maxLines) {
                            containerLinesThatHaveToBeVisible = (settings.maxLines - foundLines);
                        }

                        //Set the new collapsedHeight and increase the total lines
                        collapsedHeight += containerLinesThatHaveToBeVisible * lineHeight;
                        foundLines += containerLinesThatHaveToBeVisible;

                        //When this element is folly shown, add the bottom margin
                        if (foundLines < settings.maxLines || thisIsTheLastElementThatIsShown) {
                            collapsedHeight += parseFloat(textParent.css('margin-bottom'));
                        }

                        return true;
                    }

                    //Include all header items, even when they have to be truncated, the the user will see that he is missing text
                    if (tagName.indexOf('H') == 0 && tagName.length == 2 && !isNaN(tagName[1])) {
                        collapsedHeight += $(this).height();
                        collapsedHeight += parseFloat($(this).css('margin-top'));
                        collapsedHeight += parseFloat($(this).css('margin-bottom'));

                        foundLines++;
                    } else if (tagName.toLowerCase() == 'img') {
                        //An image is not text, always show
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
                    } else if ($(this).contents().length != 0) {
                        //Calculate for sub elements
                        calculateLines(false, $(this).contents());
                    }

                    if (foundLines >= settings.maxLines) {
                        return false;
                    }
                });
            }

            //On resize, recalculate the show more
            $(window).resize(function () {
                calculateLines(true, truncateElement.contents());

                if(collapsedHeight == self.height()) {
                    self.parent().find('.mTruncate-control').hide();
                }

                if (wrapper.hasClass('mTruncate-collapsed')) {
                    truncateElement.height(collapsedHeight);
                }
            }).trigger('resize');

            //Show hide the element
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
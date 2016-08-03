(function ($) {
    $.fn.mtruncate = function (options) {
        var self = this;
        var settings = $.extend({
            maxLines: 11,
            expandText: 'Expand',
            collapseText: 'Collapse',
            hideImageOnCollapse: true
        }, options);


        return this.each(function () {
            //Modify the container so that it supports collapsing
            var truncateElement = $(this).css('overflow', 'hidden');
            var wrapper = truncateElement.wrap('<div class="mTruncate-wrapper mTruncate-collapsed" />').parent();
            var control = $('<div class="mTruncate-control">' + settings.expandText + '</div>').appendTo(wrapper);

            var floatStyle = truncateElement.css('float');
            if (floatStyle == 'left' || floatStyle == 'right') {
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
                element.each(function (key, value) {
                    //Type 8 is a comment node, this item is not displayed
                    if (value.nodeType == 8) {
                        return true;
                    }

                    var tagName = value.tagName ? value.tagName.toLowerCase() : undefined;

                    // Unwrapped elements inside the container must be text, calculate the height based on lineheight
                    if (typeof tagName == 'undefined') {
                        //When the item has no height, stop calculating
                        var text = value.textContent.trim();
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

                        //When there are too much lines, determine how many can be shown
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
                    } else if (tagName.length == 2 && tagName[0] == 'h' && isNaN(tagName[1]) == false) {
                        //Include all header items, even when they have to be truncated, so the user will see that he is missing text
                        collapsedHeight += $(value).height();
                        collapsedHeight += parseFloat($(value).css('margin-top'));
                        collapsedHeight += parseFloat($(value).css('margin-bottom'));

                        foundLines++;
                    } else if (tagName == 'img') {
                        //An image is not text, always show
                        if (settings.hideImageOnCollapse) {
                            if ($(value).hasClass('mTruncate-hidden') == false) {
                                $(value).addClass('mTruncate-hidden');
                            }

                            return true;
                        }

                        collapsedHeight += $(value).height();
                        collapsedHeight += parseFloat($(value).css('margin-top'));
                        collapsedHeight += parseFloat($(value).css('margin-bottom'));

                        foundLines++;
                    } else if ($(value).contents().length > 0) {
                        // Add height of children
                        calculateLines(false, $(value).contents());
                    }

                    if (foundLines >= settings.maxLines) {
                        return false;
                    }
                });
            }

            //On resize, recalculate the show more
            $(window).resize(function () {
                calculateLines(true, truncateElement.contents());

                if (collapsedHeight == self.height() || foundLines < settings.maxLines) {
                    control.hide();
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
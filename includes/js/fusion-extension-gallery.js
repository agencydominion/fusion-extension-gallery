/**
 * Scripts for Fusion Extension - Gallery
 */

jQuery(document).ready(function() {
	jQuery('.placeholder-controls a').on('click', function(e) {
		e.preventDefault();
	});
});

/**
 * Masthead Gallery
 */
 
jQuery(window).load(function() {
	var mastheadGalleries = jQuery('.fsn-gallery .masthead');	
	mastheadGalleries.each(function() {
		var currentGallery = jQuery(this);
		var currentGalleryID = currentGallery.attr('data-gallery-id');
		var currentGalleryContentData = currentGallery.data('galleryContent');
		var currentGalleryAuto = currentGallery.attr('data-gallery-auto');
		//if first slide is a video, init gallery
		var slideVideo = currentGallery.find('.video');
		//trigger load gallery event
		if (Modernizr.touch) {
			currentGallery.on('touchstart.loadGallery', function() {
				currentGallery.off('touchstart.loadGallery');
		        currentGallery.prepend(currentGalleryContentData);
		        var currentViewport = jQuery('body').attr('data-view');
		        ADimageSwap(currentViewport);
		        currentGallery.imagesLoaded(function() {
			        currentGallery.trigger('fsnGalleryReady', currentGalleryID);
		        });
	        });
			currentGallery.trigger('touchstart.loadGallery');
		} else {
	    	currentGallery.on('mouseenter.loadGallery', function() {
	    		currentGallery.off('mouseenter.loadGallery');
		        currentGallery.prepend(currentGalleryContentData);
		        var currentViewport = jQuery('body').attr('data-view');
		        ADimageSwap(currentViewport);
		        currentGallery.imagesLoaded(function() {
			        currentGallery.trigger('fsnGalleryReady', currentGalleryID);
		        });
	        });
	        if (currentGalleryAuto != undefined) {
				currentGallery.trigger('mouseenter.loadGallery');
			} else {
				var viewportHeight = jQuery(window).height();
				var currentGalleryOffset = currentGallery.offset().top;
				if (currentGalleryOffset < viewportHeight) {
					setTimeout(function() {
						currentGallery.trigger('mouseenter.loadGallery');	
					}, 1000);	
				}
			}
        }
	});
});

jQuery(document).ready(function() {
	//initialize gallery
	jQuery('.fsn-gallery .masthead').on('fsnGalleryReady', function(event, galleryID) {
		var currentGalleryID = galleryID;
		var currentGallery = jQuery('.fsn-gallery .masthead[data-gallery-id="'+ currentGalleryID +'"]');
		var currentGalleryPlaceholder = currentGallery.find('.masthead-placeholder-container');
		var currentGalleryPlaceholderControls = currentGallery.find('.placeholder-controls');
		currentGalleryPlaceholderControls.remove();
		var currentGalleryAuto = currentGallery.attr('data-gallery-auto');
		var currentGallerySpeed = currentGallery.attr('data-gallery-speed');
		var galleryAuto = currentGalleryAuto == undefined ? false : true;
		var gallerySpeed = currentGallerySpeed == undefined ? 7000 : parseInt(currentGallerySpeed);
		//overlays
		var overlayData = currentGallery.data('galleryOverlay');
		if (overlayData != undefined) {
			var overlayStyle = 'background:'+ overlayData.color +';opacity:'+ overlayData.colorOpacity +';';
			if (!Modernizr.opacity) {
				overlayStyle += 'filter:alpha(opacity='+ (overlayData.colorOpacity * 100) +');';
			}
			var slides = currentGallery.find('.slide');
			slides.each(function() {
				var slide = jQuery(this);
				slide.find('.masthead-item-image, .masthead-item-video').append('<span class="masthead-overlay" style="'+ overlayStyle +'"></span>');
			});
		}
		
		currentGallery.flexslider({
			animation: 'fade',
			slideshow: galleryAuto,
			slideshowSpeed: gallerySpeed,
			multipleKeyboard: true,
			controlsContainer: '.controls-'+ currentGalleryID,
			controlNav: false,
			start: function(slider) {
				setTimeout(function() {
					currentGalleryPlaceholder.remove();
					currentGallery.trigger('fsnGalleryInitialized', currentGalleryID);
				}, 400);
				var incomingSlide = slider.find('.slide').eq(0);
				var slideVideo = incomingSlide.find('.masthead-item-video');
				if (slideVideo.length > 0) {
					var videoPlayerElement = slideVideo.find('.video-element').attr('id');
					galleryPlayVideo(videoPlayerElement);
				}
				centerMastheadImages();
				//load next slide image
				var nextSlide = incomingSlide.next('.slide');
				if (nextSlide.length > 0) {
					var nextSlideVideo = nextSlide.find('.masthead-item-video');
					if (nextSlide.attr('data-lazy-load') != undefined && nextSlideVideo.length == 0) {
						nextSlide.addClass('loading');
						var loadID = nextSlide.attr('data-image-id');
						var loadSizeDesktop = nextSlide.attr('data-image-size-desktop');
						var loadSizeMobile = nextSlide.attr('data-image-size-mobile');
						var viewportMode = jQuery('body').attr('data-view');
						jQuery.post(
						    fsnGalleryExtAjax.ajaxurl,
						    {
						        action : 'gallery-lazy-load',
						        attachmentID : loadID,
						        imageSizeDesktop : loadSizeDesktop,
						        imageSizeMobile : loadSizeMobile,
						        viewport : viewportMode,
						        classes : 'masthead-image'
						    },
						    function( response ) {
						    	nextSlide.find('.masthead-item-image').append(response);
						        nextSlide.removeAttr('data-lazy-load data-image-id');
						        nextSlide.imagesLoaded(function() {
							        centerMastheadImages();
							        nextSlide.removeClass('loading');
							        nextSlide.find('.preloader').remove();
						        });
						    }
						);
					}
				}
			},
			before: function(slider) {
				var incomingSlide = slider.find('.slide').eq(slider.animatingTo);
				var slideVideo = incomingSlide.find('.masthead-item-video');
				if (slideVideo.length > 0) {
					var videoPlayerElement = slideVideo.find('.video-element').attr('id');
					galleryPlayVideo(videoPlayerElement);
				}
				//load incoming slide if not already loaded
				if (incomingSlide.attr('data-lazy-load') != undefined && incomingSlide.hasClass('loading') == false && slideVideo.length == 0) {
					incomingSlide.addClass('loading');
					var loadID = incomingSlide.attr('data-image-id');
					var loadSizeDesktop = incomingSlide.attr('data-image-size-desktop');
					var loadSizeMobile = incomingSlide.attr('data-image-size-mobile');
					var viewportMode = jQuery('body').attr('data-view');
					jQuery.post(
					    fsnGalleryExtAjax.ajaxurl,
					    {
					        action : 'gallery-lazy-load',
					        attachmentID : loadID,
					        imageSizeDesktop : loadSizeDesktop,
					        imageSizeMobile : loadSizeMobile,
					        viewport : viewportMode,
					        classes : 'masthead-image'
					    },
					    function( response ) {
					    	incomingSlide.find('.masthead-item-image').append(response);
					        incomingSlide.removeAttr('data-lazy-load data-image-id');
					        incomingSlide.imagesLoaded(function() {
						        centerMastheadImages();
						        incomingSlide.removeClass('loading');
						        incomingSlide.find('.preloader').remove();
					        });
					    }
					);
				}
				//ensure slide is ready
				if (incomingSlide.hasClass('loading')) {
					var activeSlide = slider.find('.flex-active-slide');
					activeSlide.addClass('waiting');
					var slideInterval = setInterval(function() {
						if (incomingSlide.hasClass('loading') === false) {
							clearInterval(slideInterval);	
							setTimeout(function() {
								activeSlide.removeClass('waiting');
							}, 600);
						}
					}, 250);
				}
				//load next slide image
				if (slider.direction == 'prev') {
					var nextSlide = incomingSlide.prev('.slide');
				} else {
					var nextSlide = incomingSlide.next('.slide');
				}
				if (nextSlide.length > 0) {
					var nextSlideVideo = nextSlide.find('.masthead-item-video');
					if (nextSlide.attr('data-lazy-load') != undefined && nextSlideVideo.length == 0) {
						nextSlide.addClass('loading');
						var loadID = nextSlide.attr('data-image-id');
						var loadSizeDesktop = nextSlide.attr('data-image-size-desktop');
						var loadSizeMobile = nextSlide.attr('data-image-size-mobile');
						var viewportMode = jQuery('body').attr('data-view');
						jQuery.post(
						    fsnGalleryExtAjax.ajaxurl,
						    {
						        action : 'gallery-lazy-load',
						        attachmentID : loadID,
						        imageSizeDesktop : loadSizeDesktop,
						        imageSizeMobile : loadSizeMobile,
						        viewport : viewportMode,
						        classes : 'masthead-image'
						    },
						    function( response ) {
						    	nextSlide.find('.masthead-item-image').append(response);
						        nextSlide.removeAttr('data-lazy-load data-image-id');
						        nextSlide.imagesLoaded(function() {
							        centerMastheadImages();
							        nextSlide.removeClass('loading');
							        nextSlide.find('.preloader').remove();
						        });
						    }
						);
					}
				}
			},
			after: function(slider) {
				nonActiveSlides = slider.find('.slide').not('.flex-active-slide');
				nonActiveSlides.each(function() {
					var nonActiveSlide = jQuery(this);
					var slideVideo = nonActiveSlide.find('.masthead-item-video');
					if (slideVideo.length > 0) {
						var videoPlayerElement = slideVideo.find('.video-element').attr('id');
						galleryPauseVideo(videoPlayerElement);
					}
				});
			}
		});
	});
	//placeholder overlay
	var mastheadGalleries = jQuery('.fsn-gallery .masthead');	
	mastheadGalleries.each(function() {
		var currentGallery = jQuery(this);
		var overlayData = currentGallery.data('galleryOverlay');
		if (overlayData != undefined) {
			var overlayStyle = 'background:'+ overlayData.color +';opacity:'+ overlayData.colorOpacity +';';
			if (!Modernizr.opacity) {
				overlayStyle += 'filter:alpha(opacity='+ (overlayData.colorOpacity * 100) +');';
			}
			currentGallery.find('.masthead-placeholder-container .masthead-image').after('<span class="masthead-overlay" style="'+ overlayStyle +'"></span>');
		}
	});
	//center images on swap
	jQuery('body').on('imagesSwapped.fsn', function() {
		setMastheadDimensions();
	});
});

//image centering
function centerMastheadImages() {
	jQuery('.fsn-gallery .masthead').each(function() {
		var containerWidth = jQuery(this).width();		
		var containerHeight = jQuery(this).height();
		var slideImages = jQuery(this).find('img.masthead-image');
		slideImages.each(function() {
			var slideImg = jQuery(this);
			slideImg.removeAttr('style');
			//sizing
			var slideImgRealWidth = slideImg.attr('width');
			var slideImgRealHeight = slideImg.attr('height');
			var slideImgForcedWidth = slideImg.width();
			var slideImgForcedHeight = slideImg.height();
			
			if (slideImgForcedWidth > containerWidth) {				
				slideImgForcedWidth = containerWidth;
				var difference = slideImgForcedWidth / slideImgRealWidth;
				slideImgForcedHeight = Math.round(slideImgRealHeight * difference);
			}
			if (slideImgForcedHeight < containerHeight) {
				slideImgForcedHeight = containerHeight;
				var difference = slideImgForcedHeight / slideImgRealHeight;
				slideImgForcedWidth = Math.round(slideImgRealWidth * difference);
			}
			if (slideImgForcedWidth != slideImgRealWidth || slideImgForcedHeight != slideImgRealHeight) {				
				slideImgWidth = slideImgForcedWidth;
				slideImgHeight = slideImgForcedHeight;
			} else {
				slideImgWidth = slideImgRealWidth;
				slideImgHeight = slideImgRealHeight;
			}
			slideImg.width(slideImgWidth);
			slideImg.height(slideImgHeight);

			//centering
			if (slideImgWidth >= containerWidth) {			
				var imgOffset = -((slideImgWidth - containerWidth)/2);				
				slideImg.css('left', imgOffset);
			} else {
				slideImg.css('left', 0);
			}
			if (slideImgHeight > containerHeight) {			
				var imgOffset = -((slideImgHeight - containerHeight)/2);				
				slideImg.css('top', imgOffset);
			} else {
				slideImg.css('top', 0);
			}
		});
	});
}

//Set masthead dimensions
jQuery(document).ready(function() {
	setMastheadDimensions();
	jQuery(window).load(function() {
		setMastheadDimensions();
		setTimeout(function() {
			jQuery(window).resize(function() {
				setMastheadDimensions();
			});	
		}, 1000);
	});
	jQuery('.fsn-gallery .masthead').on('fsnGalleryReady', function() {
		setMastheadDimensions();
	});
});

function setMastheadDimensions() {
	var mastheads = jQuery('.fsn-gallery .masthead');
	var viewportWidth = jQuery(window).width();
	var viewportHeight = jQuery(window).height();
	mastheads.each(function() {
		var masthead = jQuery(this);
		var mastheadContainerWidth = masthead.closest('.masthead-container').width();
		if (mastheadContainerWidth > viewportWidth) {
			mastheadMaxWidth = mastheadContainerWidth;
		} else {
			mastheadMaxWidth = viewportWidth;
		}
		//get params
		var mastheadDimensions = masthead.data('galleryDimensions');
		//set width
		var widthUnit = mastheadDimensions.galleryWidth.unit;
		switch(widthUnit) {
			case 'percent':
				var mastheadWidth = mastheadMaxWidth * (parseInt(mastheadDimensions.galleryWidth.percent) / 100);
				break;
			case 'pixels':
				var mastheadWidth = mastheadDimensions.galleryWidth.pixels + 'px';
				break;
		}
		masthead.width(mastheadWidth);
		//set height
		var heightUnit = mastheadDimensions.galleryHeight.unit;
		switch(heightUnit) {
			case 'percent':
				var mastheadHeight = viewportHeight * (parseInt(mastheadDimensions.galleryHeight.percent) / 100);
				break;
			case 'pixels':
				var mastheadHeight = mastheadDimensions.galleryHeight.pixels + 'px';
				break;
		}
		masthead.height(mastheadHeight);
	});
	centerMastheadImages();
}

/**
 * Inline Gallery
 */
 
jQuery(window).load(function() {
	var galleryWithThumbnails = jQuery('.fsn-gallery .inline');
	galleryWithThumbnails.each(function() {
		//trigger load gallery event
		var currentGallery = jQuery(this);
		var currentGalleryID = currentGallery.attr('data-gallery-id');
		var currentGalleryContentData = currentGallery.data('galleryContent');
		var currentGalleryContainer = currentGallery.closest('.inline-container');
		var currentGalleryAuto = currentGallery.attr('data-gallery-auto');
		if (Modernizr.touch) {
			currentGalleryContainer.on('touchstart.loadGallery', function() {
				currentGalleryContainer.off('touchstart.loadGallery');
		        currentGallery.prepend(currentGalleryContentData);
		        var currentViewport = jQuery('body').attr('data-view');
		        ADimageSwap(currentViewport);
		        currentGallery.imagesLoaded(function() {
			        currentGallery.trigger('fsnGalleryReady', currentGalleryID);
		        });
	        });
	        jQuery('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
				jQuery(e.target).find('.fsn-gallery .inline').trigger('touchstart.loadGallery');
				setTimeout(function() {
					jQuery(window).trigger('resize');	
				}, 100);
			});
			currentGalleryContainer.trigger('touchstart.loadGallery');
		} else {
	    	currentGalleryContainer.on('mouseenter.loadGallery', function() {
	    		currentGalleryContainer.off('mouseenter.loadGallery');
		        currentGallery.prepend(currentGalleryContentData);
		        var currentViewport = jQuery('body').attr('data-view');
		        ADimageSwap(currentViewport);
		        currentGallery.imagesLoaded(function() {
			        currentGallery.trigger('fsnGalleryReady', currentGalleryID);
		        });
	        });
	        jQuery('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
				jQuery(e.target).find('.fsn-gallery .inline').trigger('mouseenter.loadGallery');
				setTimeout(function() {
					jQuery(window).trigger('resize');	
				}, 100);
			});
			if (currentGalleryAuto != undefined) {
				currentGalleryContainer.trigger('mouseenter.loadGallery');
			}
        }
        //gallery thumbnail navigation
        if (currentGallery.attr('data-gallery-thumbs') != undefined) {
	        var galleryWithThumbnailsNav = jQuery('.inline-nav');
			galleryWithThumbnailsNav.each(function() {
				
				// store the gallery in a local variable
				var $window = jQuery(window),
				flexslider;
			
				var currentGallery = jQuery(this);
				var currentGalleryID = jQuery(this).attr('data-gallery-id');
				currentGallery.flexslider({
					animation: 'slide',
					slideshow: false,
					controlNav: false,
					animationLoop: false,
					itemWidth: 172,
					itemMargin: 5,
					asNavFor: '.inline[data-gallery-id="'+ currentGalleryID +'"]',
				});
				
				var viewportWidth = $window.width();
				if (viewportWidth < 768) {
					currentGallery.data('flexslider').vars.itemWidth = 100;
				} else {
					currentGallery.data('flexslider').vars.itemWidth = 172;
				}
				$window.resize(function() {
					var viewportWidth = $window.width();
					if (viewportWidth < 768) {
						currentGallery.data('flexslider').vars.itemWidth = 100;
					} else {
						currentGallery.data('flexslider').vars.itemWidth = 172;
					}
				});
			});
		}
	});
});

jQuery(document).ready(function() {
	//initialize gallery
	jQuery('.fsn-gallery .inline').on('fsnGalleryReady', function(event, galleryID) {		
		var currentGalleryID = galleryID;
		var currentGallery = jQuery('.fsn-gallery .inline[data-gallery-id="'+ currentGalleryID +'"]');
		var currentGalleryPlaceholder = currentGallery.find('.inline-placeholder-container');
		var currentGalleryPlaceholderControls = currentGallery.find('.placeholder-controls');
		currentGalleryPlaceholderControls.remove();
		var currentGalleryAuto = currentGallery.attr('data-gallery-auto');
		var currentGallerySpeed = currentGallery.attr('data-gallery-speed');
		var currentGalleryThumbs = currentGallery.attr('data-gallery-thumbs');
		var galleryAuto = currentGalleryAuto == undefined ? false : true;
		var gallerySpeed = currentGallerySpeed == undefined ? 7000 : parseInt(currentGallerySpeed);
		var gallerySync = currentGalleryThumbs == undefined ? '' : '.inline-nav[data-gallery-id="'+ currentGalleryID +'"]';
		
		currentGallery.flexslider({
			animation: 'fade',
			slideshow: galleryAuto,
			slideshowSpeed: gallerySpeed,
			multipleKeyboard: true,
			controlNav: false,
			controlsContainer: '.controls-'+ currentGalleryID,
			sync: gallerySync,
			start: function(slider) {
				setTimeout(function() {
					currentGalleryPlaceholder.remove();
					currentGallery.trigger('fsnGalleryInitialized', currentGalleryID);
				}, 400);
				//load next slide image
				var incomingSlide = slider.find('.slide').eq(0);
				var nextSlide = incomingSlide.next('.slide');
				if (nextSlide.length > 0) {
					if (nextSlide.attr('data-lazy-load') != undefined) {
						nextSlide.addClass('loading');
						var loadID = nextSlide.attr('data-image-id');
						var loadSizeDesktop = nextSlide.attr('data-image-size-desktop');
						var loadSizeMobile = nextSlide.attr('data-image-size-mobile');
						var viewportMode = jQuery('body').attr('data-view');
						jQuery.post(
						    fsnGalleryExtAjax.ajaxurl,
						    {
						        action : 'gallery-lazy-load',
						        attachmentID : loadID,
						        imageSizeDesktop : loadSizeDesktop,
						        imageSizeMobile : loadSizeMobile,
						        viewport : viewportMode,
						        classes : 'inline-image'
						    },
						    function( response ) {
						    	nextSlide.prepend(response).removeAttr('data-lazy-load data-image-id');
						        nextSlide.imagesLoaded(function() {
							        nextSlide.removeClass('loading');
							        nextSlide.find('.preloader').remove();
						        });
						    }
						);
					}
				}	
			},
			before: function(slider) {
				var incomingSlide = slider.find('.slide').eq(slider.animatingTo);
				//load incoming slide if not already loaded
				if (incomingSlide.attr('data-lazy-load') != undefined && incomingSlide.hasClass('loading') == false) {
					incomingSlide.addClass('loading');
					var loadID = incomingSlide.attr('data-image-id');
					var loadSizeDesktop = incomingSlide.attr('data-image-size-desktop');
					var loadSizeMobile = incomingSlide.attr('data-image-size-mobile');
					var viewportMode = jQuery('body').attr('data-view');
					jQuery.post(
					    fsnGalleryExtAjax.ajaxurl,
					    {
					        action : 'gallery-lazy-load',
					        attachmentID : loadID,
					        imageSizeDesktop : loadSizeDesktop,
					        imageSizeMobile : loadSizeMobile,
					        viewport : viewportMode,
					        classes : 'inline-image'
					    },
					    function( response ) {
					    	incomingSlide.prepend(response).removeAttr('data-lazy-load data-image-id');
					        incomingSlide.imagesLoaded(function() {
						        incomingSlide.removeClass('loading');
						        incomingSlide.find('.preloader').remove();
					        });
					    }
					);
				}
				//ensure slide is ready
				if (incomingSlide.hasClass('loading')) {
					var activeSlide = slider.find('.flex-active-slide');
					activeSlide.addClass('waiting');
					var slideInterval = setInterval(function() {
						if (incomingSlide.hasClass('loading') === false) {
							clearInterval(slideInterval);	
							setTimeout(function() {
								activeSlide.removeClass('waiting');
							}, 600);
						}
					}, 250);
				}
				//load next slide image
				if (slider.direction == 'prev') {
					var nextSlide = incomingSlide.prev('.slide');
				} else {
					var nextSlide = incomingSlide.next('.slide');
				}
				if (nextSlide.length > 0) {
					if (nextSlide.attr('data-lazy-load') != undefined) {
						nextSlide.addClass('loading');
						var loadID = nextSlide.attr('data-image-id');
						var loadSizeDesktop = nextSlide.attr('data-image-size-desktop');
						var loadSizeMobile = nextSlide.attr('data-image-size-mobile');
						var viewportMode = jQuery('body').attr('data-view');
						jQuery.post(
						    fsnGalleryExtAjax.ajaxurl,
						    {
						        action : 'gallery-lazy-load',
						        attachmentID : loadID,
						        imageSizeDesktop : loadSizeDesktop,
						        imageSizeMobile : loadSizeMobile,
						        viewport : viewportMode,
						        classes : 'inline-image'
						    },
						    function( response ) {
						    	nextSlide.prepend(response).removeAttr('data-lazy-load data-image-id');
						        nextSlide.imagesLoaded(function() {
							        nextSlide.removeClass('loading');
							        nextSlide.find('.preloader').remove();
						        });
						    }
						);
					}
				}
			}
		});
	});
});

/**
 * Carousels
 */

jQuery(window).load(function() {
	//desktop carousels
	var carousels = jQuery('.carousel');
	carousels.each(function() {
		var carousel = jQuery(this);
		var carouselID = carousel.attr('data-gallery-id');
		var itemsPerPage = parseInt(carousel.attr('data-pager'));
		var carouselControls = carousel.attr('data-controls');
		var carouselControlNav = true;
		var carouselDirectionNav = false;
		var carouselSlideshow = carousel.attr('data-slideshow');
		var carouselSpeed = carousel.attr('data-gallery-speed');
		carouselSlideshow = carouselSlideshow != undefined ? true : false;
		carouselSpeed = carouselSpeed == undefined ? 7000 : parseInt(carouselSpeed);
		
		switch(carouselControls) {
			case 'paging':
				carouselControlNav = true;
				carouselDirectionNav = false;
				break;
			case 'direction':
				carouselControlNav = false;
				carouselDirectionNav = true;
				break;
			case 'both':
				carouselControlNav = true;
				carouselDirectionNav = true;
				break;
			case 'none':
				carouselControlNav = false;
				carouselDirectionNav = false;
				break;
		}
		if (carousel.parents('.tab-pane').not(':visible').length > 0) {
			var slideWidth = Math.floor((carousel.closest('.tab-content').width() * 0.8290598291 ) / itemsPerPage);
		} else {
			var slideWidth = Math.floor((carousel.closest('.row').width() * 0.8290598291 ) / itemsPerPage);
		}
		//init gallery
		carousel.flexslider({
			animation: 'slide',
			animationLoop: true,
			multipleKeyboard: true,
			itemWidth: slideWidth,
			itemMargin: 0,
			minItems: itemsPerPage,
			maxItems: itemsPerPage,
			move: 1,
			slideshow: carouselSlideshow,
			slideshowSpeed: carouselSpeed,
			controlsContainer: '.controls-'+ carouselID,
			directionNav: carouselDirectionNav,
			controlNav: carouselControlNav,
			start: function(slider) {
				slider.resize(); //fixes slide width bug
				var controls = carousel.find('.carousel-controls');
				var controlsOffset = controls.outerWidth() / 2;
				controls.css('margin-left','-'+ controlsOffset +'px').removeClass('loading');
				if (carousel.parents('.tab-pane').not(':visible').length > 0) {
					jQuery('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
						var controlsOffset = controls.outerWidth() / 2;
						controls.css('margin-left','-'+ controlsOffset +'px').removeClass('loading');		
					});
				}
			}
		});			
	});
	
	//mobile carousels
	var mobileCarousels = jQuery('.carousel-mobile');	
	mobileCarousels.each(function() {		
		var mobileCarousel = jQuery(this);
		var carouselControls = mobileCarousel.attr('data-controls');
		var carouselControlNav = true;
		var carouselDirectionNav = false;
		
		switch(carouselControls) {
			case 'paging':
				carouselControlNav = true;
				carouselDirectionNav = false;
				break;
			case 'direction':
				carouselControlNav = false;
				carouselDirectionNav = true;
				break;
			case 'both':
				carouselControlNav = true;
				carouselDirectionNav = true;
				break;
			case 'none':
				carouselControlNav = false;
				carouselDirectionNav = false;
				break;
		}
		
		var slideWidth = Math.floor((mobileCarousel.closest('.row').width() * 0.8290598291 ) / 1);
		//init gallery
		mobileCarousel.flexslider({
			animation: 'slide',
			animationLoop: false,
			multipleKeyboard: true,
			itemWidth: slideWidth,
			itemMargin: 0,
			minItems: 1,
			maxItems: 1,
			move: 1,
			slideshow: false,
			directionNav: carouselDirectionNav,
			controlNav: carouselControlNav,
			start: function(slider) {
				slider.resize(); //fixes slide width bug
			}
		});			
	});
});

//videos
function galleryPlayVideo(video) {
	if (!Modernizr.video) {
		var videoContainer = jQuery('#' + video).closest('.slide');
		videoContainer.find('.video-fallback').css('display','block');
		videoContainer.find('.masthead-slide-video').remove();
		videoContainer.removeClass('video');
		return false;
	}
	var videoPlayer = document.getElementById(video);
	videoPlayer.onerror = function() {			
		var videoContainer = jQuery('#' + video).closest('.slide');
		videoContainer.find('.video-fallback').css('display','block');
		videoContainer.find('.masthead-slide-video').remove();
		videoContainer.removeClass('video');
	};
	centerGalleryVideos();
	videoPlayer.play();
}
function galleryPauseVideo(video) {
	if (!Modernizr.video) {
		return false;	
	}
	var videoPlayer = document.getElementById(video);
	videoPlayer.currentTime = 0;
	videoPlayer.pause();	
}

//video centering
jQuery(window).load(function() {
	centerGalleryVideos();
	setTimeout(function() {
		jQuery(window).resize(function() {
			centerGalleryVideos();
		});	
	}, 1000);
});

function centerGalleryVideos() {
	jQuery('.flexslider').each(function() {
		var slideVideos = jQuery(this).find('.video-element');
		slideVideos.each(function() {
			var slideVideo = jQuery(this);
			var containerWidth = slideVideo.parent().width();
			var containerHeight = slideVideo.parent().height();
			//use attributes so it works on invisible videos and fix ajax load
			var slideVideoWidth = slideVideo.attr('width');
			var slideVideoHeight = slideVideo.attr('height');
			//if video is stretched
			var slideVideoForcedWidth = containerWidth;
			if (slideVideoForcedWidth > slideVideoWidth) {				
				slideVideoWidth = slideVideoForcedWidth;
				var difference = slideVideoForcedWidth / slideVideo.attr('width');
				slideVideoHeight = slideVideo.attr('height') * difference;				
			}
			if (slideVideoHeight < containerHeight) {
				slideVideoHeight = containerHeight;
				var difference = slideVideoHeight / slideVideo.attr('height');
				slideVideoWidth = slideVideo.attr('width') * difference;				
			}
			//width
			if (slideVideoWidth >= containerWidth) {			
				var videoOffset = -((slideVideoWidth - containerWidth)/2);				
				slideVideo.css('left', videoOffset);
			} else {
				slideVideo.css('left', 0);
			}
			//height
			if (slideVideoHeight >= containerHeight) {			
				var videoOffset = -((slideVideoHeight - containerHeight)/2);				
				slideVideo.css('top', videoOffset);
			} else {
				slideVideo.css('top', 0);
			}
		});
	});
}
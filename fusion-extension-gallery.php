<?php
/**
 * @package Fusion_Extension_Gallery
 */
 
/**
 * Plugin Name: Fusion : Extension - Gallery
 * Plugin URI: http://fusion.1867dev.com/
 * Description: Gallery Extension Package for Fusion.
 * Version: 1.0.4
 * Author: Agency Dominion
 * Author URI: http://agencydominion.com
 * License: GPL2
 */
 
/**
 * FusionExtensionGallery class.
 *
 * Class for initializing an instance of the Fusion Gallery Extension.
 *
 * @since 1.0.0
 */

class FusionExtensionGallery	{ 
	public function __construct() {
						
		// Initialize the language files
		load_plugin_textdomain( 'fusion-extension-gallery', false, plugin_dir_url( __FILE__ ) . 'languages' );
		
		// Enqueue admin scripts and styles
		add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts_styles'));
		
		// Enqueue front end scripts and styles
		add_action('wp_enqueue_scripts', array($this, 'front_enqueue_scripts_styles'));
		
		// Filter Image Sizes
		add_filter('fsn_selectable_image_sizes', array($this, 'selectable_image_sizes'));
		
		// Output PhotoSwipe container in footer
		add_action('wp_footer', array($this, 'photoswipe_container'));
		
	}
	
	/**
	 * Enqueue JavaScript and CSS on Admin pages.
	 *
	 * @since 1.0.0
	 *
	 * @param string $hook_suffix The current admin page.
	 */
	 
	public function admin_enqueue_scripts_styles($hook_suffix) {
		global $post;
		
		$options = get_option('fsn_options');
		$fsn_post_types = !empty($options['fsn_post_types']) ? $options['fsn_post_types'] : '';
		
		// Editor scripts and styles
		if ( ($hook_suffix == 'post.php' || $hook_suffix == 'post-new.php') && (!empty($fsn_post_types) && is_array($fsn_post_types) && in_array($post->post_type, $fsn_post_types)) ) {
			wp_enqueue_script( 'fsn_gallery_admin', plugin_dir_url( __FILE__ ) . 'includes/js/fusion-extension-gallery-admin.js', array('jquery'), '1.0.0', true );
			wp_enqueue_style( 'fsn_gallery_admin', plugin_dir_url( __FILE__ ) . 'includes/css/fusion-extension-gallery-admin.css', false, '1.0.0' );
			wp_localize_script( 'fsn_gallery_admin', 'fsnExtGalleryJS', array(
					'fsnEditGalleryNonce' => wp_create_nonce('fsn-admin-edit-gallery')
				)
			);
		}
	}
	
	/**
	 * Enqueue JavaScript and CSS on Front End pages.
	 *
	 * @since 1.0.0
	 *
	 */
	 
	 public function front_enqueue_scripts_styles() {
		//flexslider
		wp_register_script('flexslider', plugin_dir_url( __FILE__ ) .'includes/utilities/flexslider/jquery.flexslider-min.js', array('jquery'), '2.6.0', true);
		wp_enqueue_style('flexslider', plugin_dir_url( __FILE__ ) .'includes/utilities/flexslider/flexslider.css');
		//photoswipe
		wp_enqueue_style('photoswipe', plugin_dir_url( __FILE__ ) .'includes/utilities/photoswipe/photoswipe.css');
		wp_enqueue_style('photoswipe_skin', plugin_dir_url( __FILE__ ) .'includes/utilities/photoswipe/default-skin/default-skin.css');
		wp_register_script('photoswipe_core', plugin_dir_url( __FILE__ ) .'includes/utilities/photoswipe/photoswipe.min.js', array('jquery'), '4.0.3', true);
		wp_register_script('photoswipe_ui', plugin_dir_url( __FILE__ ) .'includes/utilities/photoswipe/photoswipe-ui-default.min.js', array('jquery','photoswipe_core'), '4.0.3', true);
		//plugin
		wp_register_script( 'fsn_gallery', plugin_dir_url( __FILE__ ) . 'includes/js/fusion-extension-gallery.js', array('jquery','flexslider','fsn_core'), '1.0.0', true );
		wp_enqueue_style( 'fsn_gallery', plugin_dir_url( __FILE__ ) . 'includes/css/fusion-extension-gallery.css', false, '1.0.0' );
		//videoJS
	 	wp_register_script( 'video_js', plugin_dir_url( __FILE__ ) . 'includes/utilities/video-js/video.js', array('jquery'), '4.11.2', true );
	 	wp_enqueue_style( 'video_js', plugin_dir_url( __FILE__ ) . 'includes/utilities/video-js/video-js.min.css', false, '4.11.2' );
		
		//setup front end script for use with AJAX
		wp_localize_script( 'fsn_gallery', 'fsnGalleryExtAjax', array(
				'ajaxurl' => admin_url( 'admin-ajax.php' ),
				'pluginurl' =>  plugin_dir_url( __FILE__ )
			)
		);
	}
	
	/**
	 * Filter image sizes
	 *
	 * Filter out image sizes that should not be user-selectable
	 *
	 * @since 1.0.0
	 */
	 
	public function selectable_image_sizes($fsn_selectable_image_sizes) {
		//unset Gallery image sizes
		unset($fsn_selectable_image_sizes['masthead-mobile']);
		unset($fsn_selectable_image_sizes['masthead-desktop']);
		unset($fsn_selectable_image_sizes['inline-mobile']);
		unset($fsn_selectable_image_sizes['inline-desktop']);
		unset($fsn_selectable_image_sizes['inline-thumb-mobile']);
		unset($fsn_selectable_image_sizes['inline-thumb-desktop']);
		unset($fsn_selectable_image_sizes['carousel-mobile']);
		unset($fsn_selectable_image_sizes['carousel-desktop']);
		return $fsn_selectable_image_sizes;
	}
    
    /**
	 * Output PhotoSwipe container in footer.
	 *
	 * @since 1.0.0
	 *
	 */
	 
	public function photoswipe_container() {
		?>
		<!-- Root element of PhotoSwipe. Must have class pswp. -->
		<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">
			<div class="pswp__bg"></div>
			<div class="pswp__scroll-wrap">
				<div class="pswp__container">
					<div class="pswp__item"></div>
					<div class="pswp__item"></div>
					<div class="pswp__item"></div>
				</div>
				<div class="pswp__ui pswp__ui--hidden">
					<div class="pswp__top-bar">
						<div class="pswp__counter"></div>
						<button class="pswp__button pswp__button--close" title="Close (Esc)"></button>
						<button class="pswp__button pswp__button--share" title="Share"></button>
						<button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>
						<button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button>
						<div class="pswp__preloader">
							<div class="pswp__preloader__icn">
								<div class="pswp__preloader__cut">
									<div class="pswp__preloader__donut"></div>
								</div>
							</div>
						</div>
					</div>
					<div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
						<div class="pswp__share-tooltip"></div> 
					</div>
					<button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"></button>
					<button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)"></button>
					<div class="pswp__caption">
						<div class="pswp__caption__center"></div>
					</div>
				</div>
			</div>
		</div>
		<?php	
	}
}

$fsn_extension_gallery = new FusionExtensionGallery();

//EXTENSIONS

//Gallery
require_once('includes/extensions/gallery.php');

?>
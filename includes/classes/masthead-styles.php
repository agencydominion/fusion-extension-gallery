<?php
/**
 * @package Fusion
 */

/**
 * Fusion Masthead Styles
 *
 * Class for adding and outputting CSS for the Masthead layout of the Fusion Gallery Extension
 *
 * @since 1.1.11
 */
 
class FusionMastheadStyles {
	private static $instance;
	
	public static function get_instance() {
		if ( ! isset(self::$instance) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}
	
	private function __construct() {
		add_action('wp_footer', array($this, 'output_styles'));
	}
	
	/**
	 * Add Gallery
	 */
	 
	public function add_gallery($id, $styles) {
		$this->$id = $styles;
	}
	
	/**
	 * Output Styles
	 */
	 
	public function output_styles() {
		if (!empty($this)) {
			echo '<style>';
				foreach($this as $key => $value) {
					$selector = '.masthead[data-gallery-id="'. $key .'"]';
					//desktop
					echo $selector . '{';
						switch($value['galleryWidth']['unit']) {
							case 'pixels':
								echo 'width:'. $value['galleryWidth']['pixels'] .'px;';
								break;
							case 'percent':
								echo 'width:'. $value['galleryWidth']['percent'] .'vw;';
								break;
						}
						switch($value['galleryHeight']['unit']) {
							case 'pixels':
								echo 'height:'. $value['galleryHeight']['pixels'] .'px;';
								break;
							case 'percent':
								echo 'height:'. $value['galleryHeight']['percent'] .'vh;';
								break;
						}
					echo '}';
					//mobile
					echo '@media (max-width: 767px) {'. $selector . '{';
						switch($value['galleryHeightMobile']['unit']) {
							case 'pixels':
								echo 'height:'. $value['galleryHeightMobile']['pixels'] .'px !important;';
								break;
							case 'percent':
								echo 'height:'. $value['galleryHeightMobile']['percent'] .'vh !important;';
								break;
							case 'flex':
								echo 'height:auto;';
								break;
						}
					echo '}}';
				}
			echo '</style>';
		}
	}
}

?>
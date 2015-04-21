//personal data has been removed
var bMobile = false;
var canvas, stage, exportRoot;
var currLocation = "hotel";
var currBackgroundVideo = '';
var landingBackgroundVideoName = '';
var hotelBackgroundVideoName = '';
var nightclubBackgroundVideoName = '';
var garageBackgroundVideoName = '';
var currentVideo = '';
var nextLocationToShow = '';
var bLandingPage = true;
var bDeepLinking = false;
var currQuote = 0;
var totalQuotes = 1;
var quoteRotateTimer = null;
var currCharName = '';
var totalCanvasImages = 0;
var loadedCanvasImages = 0;
var currentHouseRules = 0;
var videosLoaded = false;

$(document).ready(function(){
 
	$('#content .loader').fadeIn();

    //Error handling
    function imgError (arg) {
    }
	
	function init() {
		canvas = document.getElementById("canvas");
		images = images||{};
	
		var loader = new createjs.LoadQueue(true);
		loader.addEventListener("fileload", handleFileLoad);
		loader.addEventListener("progress", handleFileProgress);
		loader.addEventListener("complete", handleComplete);
		loader.loadManifest(lib.properties.manifest);
		//on mobile or tablet
		
		
	}
	
	function handleFileLoad(evt) {
		totalCanvasImages++;
		if (evt.item.type == "image") { images[evt.item.id] = evt.result; }
	}
	
	function handleFileProgress(evt){
		var perc = Math.round(evt.progress * 50) + 50;
		var percString = String(perc) + '%';
		$("#content .loader p").html(percString); 
	}
	
	function handleComplete() {
			continueSiteLoad();
		
	}
	
		
	function continueSiteLoad(){
			
		exportRoot = new lib.locations();
	
		stage = new createjs.Stage(canvas);
		stage.addChild(exportRoot);
		stage.update();
	
		createjs.Ticker.setFPS(lib.properties.fps);
		createjs.Ticker.addEventListener("tick", stage);
		
		
		totalQuotes = $('#landing .landing_content .quote_rotator a').length;
		$('#landing .landing_content .quote_rotator a').on('click', function(e){
			e.preventDefault();
		});
		
		exportRoot.addEventListener("popup", function(e){
			var hotspotObj = exportRoot.sendObject;
		});
	
		startPreloadingLargeFiles();
		//DEEP LINKING
		$('#content .loader').fadeOut();
		switch(pageDestination){
			case "hotel":
			case "nightclub":
			case "garage":
			case "houserules":
				bDeepLinking = true;
				bLandingPage = false;
				nextLocationToShow = pageDestination;
				if(pageDestination == "houserules"){
					nextLocationToShow = "hotel";
				}
				switch(pageDestination){
					case "hotel":
					case "houserules":
						currBackgroundVideo = hotelBackgroundVideoName;
					break;
					case "nightclub":
						currBackgroundVideo = nightclubBackgroundVideoName;
					break;
					case "garage":
						currBackgroundVideo = garageBackgroundVideoName;
					break;
				}
				preloadBackgroundLocationVideo(currBackgroundVideo);
				afterVideoLogic();
			break;
			case "gallery":
				bDeepLinking = true;
				afterVideoLogic();
				$( "#content #nav #nav_closed" ).trigger( "click" );
				$( "#content #nav .nav_item#gallery a" ).trigger( "click" );
				openModal('gallery');
			break;
			case "videos":
				bDeepLinking = true;
				afterVideoLogic();
				$( "#content #nav #nav_closed" ).trigger( "click" );
				$( "#content #nav .nav_item#videos a" ).trigger( "click" );
				openModal('videos');
			break;
			case "":
			default:
				playTransitionVideo("intro");
			break;
		}
	}
	
	/* VIDEO FUNCTIONS */
	
	function playTransitionVideo(videoName){
		currentVideo = videoName;
		if(bMobile){
			afterVideoLogic();
		}
		else{
			$('#bg_videos').fadeIn();
			hideBackgroundVideo();
			$('#content #canvasArea').fadeOut();
			$('#revenge_ride').hide();
			$('#canvas_video_holder').fadeOut();
			$('#content #footer .footer_TT').fadeOut();
			$('#content .skip').fadeIn();
			
			$('#video_'+videoName).fadeIn();
			var v = document.getElementById('video_'+videoName);
			v.addEventListener('ended', transitionVideoEndEvent, false);
			try{
				v.load();
				v.play();
			}catch(e){}
		
			
			
			
			switch(nextLocationToShow){
				case "hotel":
					currBackgroundVideo = hotelBackgroundVideoName;
					preloadBackgroundLocationVideo(currBackgroundVideo);
				break;
				case "nightclub":
					currBackgroundVideo = nightclubBackgroundVideoName;
					preloadBackgroundLocationVideo(currBackgroundVideo);
				break;
				case "garage":
					currBackgroundVideo = garageBackgroundVideoName;
					preloadBackgroundLocationVideo(currBackgroundVideo);
				break;
				case "":
				break;
			}
		}
	}
	
	function skipTransitionVideo(){
		var v = document.getElementById('video_'+currentVideo);
		$('#video_'+currentVideo).fadeOut();
		v.removeEventListener('ended', transitionVideoEndEvent, false);
		try{
			v.pause();
		}catch(e){}
		afterVideoLogic();
	}
	
	function transitionVideoEndEvent(e) {
		if(!e) { e = window.event; }
		$('#video_'+currentVideo).fadeOut();
		document.getElementById('video_'+currentVideo).removeEventListener('ended', transitionVideoEndEvent, false);
		afterVideoLogic();
	}
	
	function afterVideoLogic(){
		$('#content .skip').fadeOut();
		$('#bg_videos').fadeOut();
		if(bLandingPage){
			bLandingPage = false;
		//	if(!bMobile){
				//do desktop landing page logic
				$('video#landing_video').fadeIn();
				$('#content #landing').fadeIn();
				$('#content #footer .footer_TT').fadeOut();
				$('#landing .landing_content .quote_rotator a').hide();
				$('#landing .landing_content .quote_rotator a:eq(0)').show();
				if(quoteRotateTimer != null){
					clearTimeout(quoteRotateTimer);
				}
				quoteRotateTimer = setTimeout(nextQuote, 3000);
				playLandingPageVideo();
		/*	}
			else{
				//mobile logic 
				$('#content #header #nav').fadeIn();
				$('#content #footer .footer_TT').fadeIn();
				$('#content #mobile_frame').fadeIn();
			}*/
		}
		else{
			startLocation();
		}
	}
	
	$('#content .skip a').on('click', function(e){
		e.preventDefault();
		skipTransitionVideo();
	});
	
	
	
	function nextQuote(){
		currQuote++;
		if(currQuote == totalQuotes){
			currQuote = 0;
		}
		$('#landing .landing_content .quote_rotator a').not(':eq('+currQuote+')').fadeOut(400);
		$('#landing .landing_content .quote_rotator a:eq('+currQuote+')').delay(400).fadeIn(400);
		quoteRotateTimer = setTimeout(nextQuote, 3000);
	}
	
	function startLocation(){
		
		exportRoot.showLocation(nextLocationToShow);
		$('#content #locations_nav a#' + currLocation).removeClass('selected');
		$('#content #locations_nav a#' + nextLocationToShow).addClass('selected');
		if(!bMobile){
			$("#locations_container").on('mousemove', startLocationPanning);
		}
		else{
			$('#content #landing img.bg_landing').fadeOut();
		}
		currLocation = nextLocationToShow;
		
		if(currLocation == 'garage'){
			$('#revenge_ride').show();
		}
		
		$('#content #canvasArea').fadeIn();
		$('#content #locations_nav').fadeIn();
		$('#content #header #nav').fadeIn();
		$('#content #footer .footer_TT').fadeIn();
		playBackgroundLocationVideo();
		
		if(bDeepLinking){
			//set to specific character based on itemID
			if(pageDestination == "houserules"){
				showHouseRules(itemID);
			}else{
				showCanvasPopup(itemID);
			}
			//cancel out further forced popup
			bDeepLinking = false;
		}
	}
	
	function showCanvasPopup(charName){
		$('#canvas_popup .character_card .character_image').hide();
		$('#canvas_popup .character_card .description').hide();
		$('#canvas_popup .character_card .character_image#' + charName).show();
		$('#canvas_popup .character_card .description#desc_' + charName).show();
		$('#canvas_popup').fadeIn();
		currCharName = charName;
		var charNameCamelCase = toTitleCase(charName);
		$('#canvas_popup .character_card .character_image#'+ charName +' img').flipbook({
			'start': 1,
			'end': 30,
			'loop': false,
			'fps': 8,
			'mobileStep': 1,
			'images': 'img/character_cards/'+ charName +'/'+ charNameCamelCase +'_0%d.png'
		}); 
		
		
		
	}
	
	function toTitleCase(str) {
		return str.replace(/(?:^|\s)\w/g, function(match) {
			return match.toUpperCase();
		});
	}
	
	function showItemPopup(itemName){
		$('#item_popup .item_container img').hide();
		$('#item_popup .item_container img#' + itemName).show();
		$('#item_popup').fadeIn();
	}

	
	
	
	$('#content #footer .footer_TT').on('click', function(e){
		//send back to landing page, unless mobile
		e.preventDefault();
		//if(!bMobile){
			$('#content #canvasArea').fadeOut();
			$('#revenge_ride').hide();
			$('#canvas_video_holder').fadeOut();
			$('#content #locations_nav').fadeOut();
			$('#content #header #nav').fadeOut();
			$('#content #landing').fadeIn();
			$('#content #footer .footer_TT').fadeOut();
			$('#canvas_popup').hide();
			if(!bMobile){
				hideBackgroundVideo();
				$('video#landing_video').fadeIn();
				$("#locations_container").off('mousemove');
			}
			else{
				$('#content #landing img.bg_landing').show();
			}
			if(quoteRotateTimer != null){
				clearTimeout(quoteRotateTimer);
			}
			quoteRotateTimer = setTimeout(nextQuote, 3000);
		//}
	});
	
	
	function playLandingPageVideo(){
		
		$('#content #landing img.bg_landing').show();
		if(bMobile){
			//show background image
		}
		else{
			$('video#landing_video #landing_mp4').attr('src', 'video/'+landingBackgroundVideoName+'.mp4');
			$('video#landing_video #landing_webm').attr('src', 'video/'+landingBackgroundVideoName+'.webm');
			$('video#landing_video #landing_ogv').attr('src', 'video/'+landingBackgroundVideoName+'.ogv');
			
		
			var v = document.getElementById('landing_video');
			try{
				v.load();
				v.play();
			}catch(e){}
		}
	}
	
	function preloadBackgroundLocationVideo(videoName){
		if(!bMobile){
			$('video#canvas_video #canvas_mp4').attr('src', 'video/'+videoName+'.mp4');
			$('video#canvas_video #canvas_webm').attr('src', 'video/'+videoName+'.webm');
			$('video#canvas_video #canvas_ogv').attr('src', 'video/'+videoName+'.ogv');
			
			
			var v = document.getElementById('canvas_video');
			try{
				v.load();
			}catch(e){}
		}
	}
	
	
	function playBackgroundLocationVideo(){
		$('#canvas_video_holder').fadeIn();
		if(bMobile){
			$('#canvas_video_holder #temp_image img').hide();
			$('#canvas_video_holder #temp_image img#temp_' + currLocation).show();
		}
		else{
			
		
			var v = document.getElementById('canvas_video');
			try{
				v.play();
			}catch(e){}
		}
	}
	
	function hideBackgroundVideo(){
			var v = document.getElementById('canvas_video');
			try{
				if(!v.paused){
					v.pause();
				}
			}catch(e){}
		
	}
	
	/* START LOGIC */
	
	function startPreloadingLargeFiles(){
		var preloadPNGSequenceArray = [];
		preloadPNGSequenceArray.push('img/bg_story_2.jpg');
		
		for(var i = 1; i <= 30; i++){
			preloadPNGSequenceArray.push('img/character_cards/'+i+'.png');
		}
		preload(preloadPNGSequenceArray);
	}
	
	if($('#background #bg_videos .video').css('display') == 'none'){
		bMobile = true;
	}
	
	$(window).resize(function(){
		resizeCanvas();
	});
	
	
	
	
	function startLocationPanning(e){
		var containerWidth = $('#locations_container').width();
		var containerHeight = $('#locations_container').height();
		
		centerLeft =  -1*(((containerWidth*1.3) - containerWidth)/2);
		centerTop = -1*(((containerHeight*1.3) - containerHeight)/2);
		var dX = (containerWidth /2) - e.pageX;
		var dY = (containerHeight / 2) - e.pageY;
		$('#canvas_video_holder, #content #canvasArea').css('left', centerLeft+Math.round(dX/8));
		$('#canvas_video_holder, #content #canvasArea').css('top', centerTop+Math.round(dY/8));
	}
	
	
	
	$('#background #bg_videos .video video').on('loadedmetadata', function() {
		var $width, $height, // Width and height of screen
			$vidwidth = this.videoWidth, // Width of video (actual width)
			$vidheight = this.videoHeight, // Height of video (actual height)
			$aspectRatio = $vidwidth / $vidheight; // The ratio the videos height and width are in
					
		(adjSize = function() { // Create function called adjSize
						
			$width = $(window).width(); // Width of the screen
			$height = $(window).height(); // Height of the screen
						
			$boxRatio = $width / $height; // The ratio the screen is in
						
			$adjRatio = $aspectRatio / $boxRatio; // The ratio of the video divided by the screen size
						
			// Set the container to be the width and height of the screen
			$('#background #bg_videos .video').css({'width' : $width+'px', 'height' : $height+'px'}); 
						
			if($boxRatio < $aspectRatio) { // If the screen ratio is less than the aspect ratio..
				// Set the width of the video to the screen size multiplied by $adjRatio
				$vid = $('#background #bg_videos .video video').css({'width' : $width*$adjRatio+'px'}); 
				$vid = $('#background #bg_videos .video video').css({'margin-left' : (-1 * ($width*$adjRatio)/2) }); 
			} else {
				// Else just set the video to the width of the screen/container
				$vid = $('#background #bg_videos .video video').css({'width' : $width+'px'});
				$vid = $('#background #bg_videos .video video').css({'margin-left' : (-1 * ($width)/2) }); 
			}	 
		})(); // Run function immediately	
		// Run function also on window resize.
		$(window).resize(adjSize);		
	});
	
	
	function resizeCanvas(){
		var widthToHeight = 1920 / 1200;
		var newWidth = window.innerWidth;
		var newHeight = window.innerHeight;
		var newWidthToHeight = newWidth / newHeight;
		if (newWidthToHeight > widthToHeight) {
		  // window width is too wide relative to desired game width
		  newWidth = newHeight * widthToHeight;
		} else { // window height is too high relative to desired game height
		  newHeight = newWidth / widthToHeight;
		}
		
		
		
		var oldW = 1187;
		var oldH = 790;
		var ratio = 0.9;
		if(bMobile){
			if(window.innerWidth < 640 && window.innerWidth > 360){
				ratio = 0.85;
			}
			else{
				ratio = 0.60;
			}
		}
		var smallWidthToHeight = oldW / oldH;
		var smallNewHeight = window.innerWidth * ratio;
		var smallNewWidth = window.innerHeight * ratio;
		
		var smallNewWidthToHeight = smallNewWidth / smallNewHeight;
		if (smallNewWidthToHeight > smallWidthToHeight) {
		  // window width is too wide relative to desired game width
		  smallNewWidth = smallNewHeight * smallWidthToHeight;
		} else { // window height is too high relative to desired game height
		  smallNewHeight = smallNewWidth / smallWidthToHeight;
		}
		
		$('.overlay#gallery_modal .slideshow_container').css('width', smallNewWidth);
		$('.overlay#gallery_modal .slideshow_container').css('height', smallNewHeight);
		$('.overlay#gallery_modal .slideshow_container').css('margin-left', -1*smallNewWidth/2);
		
		
		$('.overlay#videos_modal .videos_container').css('width', smallNewWidth);
		$('.overlay#videos_modal .videos_container').css('height', smallNewHeight);
		$('.overlay#videos_modal .videos_container').css('margin-left', -1*smallNewWidth/2);
		
		
		$('#house_rules .house_rules_container').css('width', smallNewWidth);
		$('#house_rules .house_rules_container').css('height', smallNewHeight);
		$('#house_rules .house_rules_container').css('margin-left', -1*smallNewWidth/2);
		$('#house_rules .house_rules_container').css('margin-top', -1*smallNewHeight/2);
		
		
		
		
		
	}
	
	$('#content #locations_nav a').on('click', function(e){
		e.preventDefault();
		if(currLocation != $(this).attr('id')){
			if(!bMobile){
				$('#content #header #nav').fadeOut();
				$('#content #locations_nav').fadeOut();
			}
			nextLocationToShow = $(this).attr('id');
			playTransitionVideo(nextLocationToShow);
		}
	});
	
	$('#landing_location_nav a').on('click', function(e){
		e.preventDefault();
		$('video#landing_video').fadeOut();
		$('#content #landing').fadeOut();
		nextLocationToShow = $(this).attr('id');
		playTransitionVideo(nextLocationToShow);
		
	});
	
	
	$('#content #landing a#landing_CTA').on('click', function(e){
		e.preventDefault();
		$('video#landing_video').fadeOut();
		$('#content #landing').fadeOut();
		//$('#content #locations_nav').fadeIn();
		//$('#content #canvasArea').fadeIn();
		//exportRoot.showLocation(currLocation);
		nextLocationToShow = 'hotel';
		playTransitionVideo(nextLocationToShow);
	});
	
	var $navSelected = null;
	$('#content #nav .nav_item a').on('click', function(e){
		e.preventDefault();
		if($navSelected != null){
			$navSelected.find('a').removeClass('selected');
		}
		$(this).addClass('selected');
		$navSelected = $(this).parent();
		openModal($(this).parent().attr('id'));
	});
	
	$('#landing_nav .nav_item a').on('click', function(e){
		e.preventDefault();
		//$('#content #landing').fadeOut();
		//$('#content #header #nav').fadeIn();
		openModal($(this).parent().attr('id'));
		
	});
	
	
	
	
	var currOpenModal = '';
	function openModal(modalName){
		if(currOpenModal != modalName){
			if(currOpenModal != null){
				closeModal(currOpenModal);
			}
			switch(modalName){
				case "story":
					$('.overlay#story_modal .storyPage.page1').show();
					$('.overlay#story_modal .storyPage.page2').hide();
				break;
				case "cast":
					currentCharacterNum = 0;
					showCastChar(1);
				break;
				case "gallery":
					if(bDeepLinking && itemID != ''){
						showGalleryImage(Number(itemID));
						//cancel further forcing of item after first time
						bDeepLinking = false;
					}
					else{
						showGalleryImage(1);
					}
				break;
				case "videos":
					currVideoNum = 0;
					if(  $("#sound").hasClass('on') ){
						$("video").prop('muted', true);
					}
					if(bDeepLinking && itemID != ''){
						showVideo(Number(itemID));
						//cancel further forcing of item after first time
						bDeepLinking = false;
					}
					else{
						showVideo(1);
					}
				break;
			}
			$('#'+modalName + '_modal').fadeIn();
			currOpenModal = modalName;
		}
	}
	
	function closeModal(modalName){
		$('#'+modalName + '_modal').fadeOut();
		currOpenModal = '';
		if( modalName == "videos"){
			if($('.overlay#videos_modal .videos_container .videos_holder div#video' + currVideoNum + ' iframe').attr('src') != ''){
				$('.overlay#videos_modal .videos_container .videos_holder div#video' + currVideoNum + ' iframe').attr('src', '');
			}
		 	if($("#sound").hasClass('on') ){
				$("video").prop('muted', false);
			}
		}

	}
	
	
	$('#canvas_popup .character_card a.btn_close').on('click', function(e){
		e.preventDefault();
		closeCharacterShareMenu();
		$('#canvas_popup').hide();
	});
	
	
	$('#house_rules .house_rules_container a.btn_close').on('click', function(e){
		e.preventDefault();
		closeHouseRulesShareMenu();
		$('#house_rules').hide();
	});
	
	$('#item_popup .item_container a.btn_close').on('click', function(e){
		e.preventDefault();
		$('#item_popup').hide();
	});
	
	function showHouseRules(){
		currentHouseRules = 0;
		if(itemID != '' && itemID > 0){
			currentHouseRules = Number(itemID) - 1;
		}
		$('#house_rules .house_rules_container .rules_holder img').not(':eq('+currentHouseRules+')').hide();
		$('#house_rules .house_rules_container .rules_holder img:eq('+currentHouseRules+')').show();
		$('#house_rules').fadeIn();
	}
	
	var totalHouseRules = $('#house_rules .house_rules_container .rules_holder img').length - 1;
	$('#house_rules .house_rules_container a.rules_arrow.left').on('click', function(e){
		e.preventDefault();
		currentHouseRules--;
		if(currentHouseRules<0){
			currentHouseRules = totalHouseRules;
		}
		$('#house_rules .house_rules_container .rules_holder img').not(':eq('+currentHouseRules+')').fadeOut(400);
		$('#house_rules .house_rules_container .rules_holder img:eq('+currentHouseRules+')').delay(200).fadeIn(400);
		refreshHouseRulesShare();
		
	});
	
	$('#house_rules .house_rules_container a.rules_arrow.right').on('click', function(e){
		e.preventDefault();
		currentHouseRules++;
		if(currentHouseRules>totalHouseRules){
			currentHouseRules = 0;
		}
		$('#house_rules .house_rules_container .rules_holder img').not(':eq('+currentHouseRules+')').fadeOut(400);
		$('#house_rules .house_rules_container .rules_holder img:eq('+currentHouseRules+')').delay(200).fadeIn(400);
		refreshHouseRulesShare();
	});
	
	$('.overlay a.btn_close').on('click', function(e){
		e.preventDefault();
		if($navSelected != null){
			$navSelected.find('a').removeClass('selected');
		}
		
		$navSelected = null;
		closeModal(currOpenModal);
	});
	
	
	
	
	
	
	$("#sound").click( function (){
		if(  $("video").prop('muted') ){
			$("video").prop('muted', false);
			$("#sound").addClass('on');
			$("#sound").removeClass('off');
		}
		else {
			$("video").prop('muted', true);
			$("#sound").addClass('off');
			$("#sound").removeClass('on');
		}
	});
	
});

function preload(arrayOfImages) {
    $(arrayOfImages).each(function(){
        $('<img/>')[0].src = this;
    });
}

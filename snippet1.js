//client code has been removed
var paidRequire = require.config({
    baseUrl: './',
    appDir: './',
    context: '',
    shim: {
        VHS: {
            deps: ['jquery'],
            exports: 'VHS'
        },
        imagesLoaded: {
            deps: ['jquery'],
            exports: 'imagesLoaded'
        },
		createJs : {
			exports: 'createjs'
		},
		movieclip: {
			deps: ['createJs'],
			exports: 'MovieClip'
		}
    },
    paths: {
        VHS:"",
        jquery: 'js/lib/jquery.min',
        imagesLoaded: 'js/lib/imagesloaded.pkgd',
        skrollr: 'js/lib/skrollr',
		createJs : '//code.createjs.com/createjs-2013.12.12.min',
		movieclip : '//code.createjs.com/movieclip-0.7.1.min'
    }
});

paidRequire(['jquery', 'VHS', 'skrollr', 'squares', 'imagesLoaded'], function ($, VHS, skrollr, squares, imagesLoaded) {

	'use strict';
	( function( $ ) {	
		var canvas1, stage1, exportRoot1;
		var canvas1a, stage1a, exportRoot1a;
		var canvas2, stage2, exportRoot2;
		var canvas3, stage3, exportRoot3;
		var canvas3a, stage3a, exportRoot3a;
		var erArray = [];
		var textArray = [];
		var $anim1 = $('#anim1')[0];
		var $anim1a = $('#anim1a')[0];
		var $anim2 = $('#anim2')[0];
		var $anim3 = $('#anim3')[0];
		var $anim3a = $('#anim3a')[0];
		var $text1 = $('#canvasText1');
		var $text1a = $('#canvasText1a');
		var $text2 = $('#canvasText2');
		var $text3 = $('#canvasText3');
		var $text3a = $('#canvasText3a');
		//var $statsStress = $('#stats_stress')[0];
		var $statsHealth = $('#stats_health')[0];
		var isMobile = false;
		
		
		if((/Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i).test(navigator.userAgent || navigator.vendor || window.opera)){
			isMobile = true;
		}

		function addCanvas(canvas, stage, exportRoot, canvasName){
			canvas = document.getElementById(canvasName);
			exportRoot = new squares.squares();
			stage = new createjs.Stage(canvas);
			stage.addChild(exportRoot);
			stage.update();
			createjs.Ticker.setFPS(squares.properties.fps);
			createjs.Ticker.addEventListener("tick", stage);
			erArray.push(exportRoot);
		}
		
		addCanvas(canvas1, stage1, exportRoot1, "anim1");
		addCanvas(canvas1a, stage1a, exportRoot1a, "anim1a");
		addCanvas(canvas2, stage2, exportRoot2, "anim2");
		addCanvas(canvas3, stage3, exportRoot3, "anim3");
		addCanvas(canvas3a, stage3a, exportRoot3a, "anim3a");
		textArray = ['canvasText1', 'canvasText1a', 'canvasText2', 'canvasText3', 'canvasText3a'];
		
		$('#image1').height($(window).height());
	  
		$('.main').imagesLoaded( function() {
			setTimeout(function() {
				  
				  // Resize sections
				  adjustWindow();
				  
			}, 800);
		});
		
		$('a.stats_arrow').on('click', function(e){
			e.preventDefault();
			if($(this).hasClass('left')){
				switchStats($(this).parent().parent().attr('id'), 'left');
			}
			else{
				switchStats($(this).parent().parent().attr('id'), 'right');
				
			}
		});
		
		//setup stats galleries if in mobile view
		if($('.mobile-stats-nav').css('display') != 'none'){
			$('.mobile-stats-viewer .mobile-item:nth-child(1)').css('left', '0');
			$('.mobile-stats-viewer').data('curr-stats-item', 1);
		}
		
		
		function switchStats(statsID, dir){
			var totalItems, oldStatsItem, newStatsItem, startLeft, endLeft;
			totalItems = $('#' + statsID + ' .mobile-item').size();
			oldStatsItem = Number($('#' + statsID).data('curr-stats-item'));
			if(dir == 'right'){
				startLeft = '100%';
				endLeft = '-100%';
				newStatsItem = oldStatsItem + 1;
				if(newStatsItem > totalItems){
					newStatsItem = 1;
				}
			}
			else{
				startLeft = '-100%';
				endLeft = '100%';
				newStatsItem = oldStatsItem - 1;
				if(newStatsItem < 1){
					newStatsItem = totalItems;
				}
			}
			
			$('#' + statsID + ' .mobile-item:nth-child(' + String(newStatsItem) + ')').css('left', startLeft);
			$('#' + statsID + ' .mobile-item:nth-child(' + String(oldStatsItem) + ')').animate({'left': endLeft});
			$('#' + statsID + ' .mobile-item:nth-child(' + String(newStatsItem) + ')').animate({'left': '0'});
			$('#' + statsID + ' .mobile-stats-nav .nav-markers p:nth-child('+ oldStatsItem + ')').removeClass('selected');
			$('#' + statsID + ' .mobile-stats-nav .nav-markers p:nth-child('+ newStatsItem + ')').addClass('selected');
			$('#' + statsID).data('curr-stats-item', newStatsItem);
		}
		
		$(window).resize(function() {
			resizeCanvasText();
			//if not mobile
			
			if(!isMobile){
				$('#image1').height($('#bgvid').height());
				$('#bgvid').css('margin-left', -1*($('#bgvid').width()/2)).css('left', '50%');
				//$('.imageSlide').height($(window).height() - 115);
				$('.imageSlideTall').height( ($(window).height() - 115)*2);
				$('.imageSlideHalf').height((($(window).height() - 115)/3)*2);
			}
			$('.box_anim').height(Math.floor(($('.box_anim').width() * 400)/405));
		});
		resizeCanvasText();
		
		
		function resizeCanvasText(){
			$('#canvasText1').css('top',  parseFloat($('#anim1').css('top')) + Math.floor(($('#anim1').height() / 4) * 3));
			$('#canvasText1a').css('bottom', '4.5%');
			$('#anim1a').css('bottom', parseFloat($('#canvasText1a').css('bottom')) + ($('#canvasText1a').height() - 135));
			$('#canvasText2').css('bottom', '4.5%');
			$('#anim2').css('bottom', parseFloat($('#canvasText2').css('bottom')) + ($('#canvasText2').height() - 135));
			$('#canvasText3').css('top',  parseFloat($('#anim3').css('top')) + Math.floor(($('#anim3').height() / 4) * 3));
			$('#canvasText3a').css('bottom', '9%');
			$('#anim3a').css('bottom', parseFloat($('#canvasText3a').css('bottom')) + ($('#canvasText3a').height() - 135));
		}
		
		function adjustWindow(){
			
			// Init Skrollr
			
		if(!isMobile){
			var s = skrollr.init({
				forceHeight:false, 
				smoothScrolling:true,
				keyframe: function(element, keyframe, direction) {
					var arrElem;
					var textElem;
					var textDir = 'left';
				  	if(element == $anim1){
						arrElem = erArray[0];
						textElem = textArray[0];
						textDir = 'right';
					}
				  	if(element == $anim1a){
						arrElem = erArray[1];
						textElem = textArray[1];
						textDir = 'left';
					}
				  	if(element == $anim2){
						arrElem = erArray[2];
						textElem = textArray[2];
						textDir = 'left';
					}
				  	if(element == $anim3){
						arrElem = erArray[3];
						textElem = textArray[3];
						textDir = 'right';
					}
				  	if(element == $anim3a){
						arrElem = erArray[4];
						textElem = textArray[4];
						textDir = 'left';
					}
					if(element == $anim1 || element == $anim1a || element == $anim2 || element == $anim3 || element == $anim3a){
						switch(keyframe){
							case 'dataBottomTop':
					  			arrElem.reset();
								$('#' + textElem).css(textDir, '-100%');
							break;
							case 'dataTopBottom':
					  			arrElem.reset();
								$('#' + textElem).css(textDir, '-100%');
							break;
							case 'dataBottom':
								if(direction == "down"){
					  				arrElem.replay();
									if(textDir == 'left'){
										$('#' + textElem).animate({'left': '0'}, 2000);
									}
									else{
										$('#' + textElem).animate({'right': '0'}, 2000);
									}
								}									
							break;
							case 'dataTop':
								if(direction == "up"){
					  				arrElem.replay();
									if(textDir == 'left'){
										$('#' + textElem).animate({'left': '0'}, 2000);
									}
									else{
										$('#' + textElem).animate({'right': '0'}, 2000);
									}
								}									
							break;
						}
					}
					
					if(element == $statsHealth && keyframe=="dataBottomTop" && ($('.mobile-stats-nav').css('display') == 'none')){
						$('#stats_health .stats-column-fixed .stats-bar-item .bar-color').css('width', 0);
					}
					
					if(element == $statsHealth && keyframe=="dataCenter" && ($('.mobile-stats-nav').css('display') == 'none') && direction=='down'){
						$('#health_1 .bar-color.teal').animate({'width': Math.round((35*200)/100) });
						$('#health_1 .bar-color.royal').delay(100).animate({'width': Math.round((35*200)/100) });
						$('#health_2 .bar-color.teal').delay(200).animate({'width': Math.round((23*200)/100) });
						$('#health_2 .bar-color.royal').delay(300).animate({'width': Math.round((4*200)/100) });
						$('#health_3 .bar-color.teal').delay(400).animate({'width': Math.round((27*200)/100) });
						$('#health_3 .bar-color.royal').delay(500).animate({'width': Math.round((8*200)/100) });
						$('#health_4 .bar-color.teal').delay(600).animate({'width': Math.round((44*200)/100) });
						$('#health_4 .bar-color.royal').delay(700).animate({'width': Math.round((4*200)/100) });
					}
					
					//hide fixed background on mobile
					if(element == $('#unscrolled')[0] && keyframe=="data500End"){
						$('#unscrolled').css('visibility', 'hidden');
					}
					if(element == $('#unscrolled')[0] && keyframe=="data600End"){
						$('#unscrolled').css('visibility', 'visible');
					}
				}
			});
			
		}
			
			//var winH = $(window).height() - 135;
			var winH = $(window).height() - 115;
			// Resize our slides
			if(isMobile){
				$('#image1').height(winH);
				$('#image2').height(winH);
				$('#image3').height(winH);
			}
			else{
				$('#image1').height($('#bgvid').height());
				$('#bgvid').css('margin-left', -1*($('#bgvid').width()/2)).css('left', '50%');;
				//$('.imageSlide').height(winH);
				$('.imageSlideTall').height(winH*2);
				$('.imageSlideHalf').height((winH/3)*2);
				
			}
			
			if(!isMobile){
				$('#image1 #bgvid').css('display', 'block');
			}
			$('#image1').animate({'opacity': 1}, 500);
			
			$('.box_anim').height(Math.floor(($('.box_anim').width() * 400)/405));
			
			// Refresh Skrollr after resizing our sections
			if(!isMobile){
				s.refresh($('.imageSlide'));
			}
			
		}
	} )( jQuery );
			

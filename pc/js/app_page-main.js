'use strict';

/**
 * 메인
**/

mm.load(function() {

	// 페이지 로드시 윙배너 확장
	(function (__$wingBanner) {

		if (!__$wingBanner) return;
		if (mm.cookie.get('IS_WING_POPUP_HIDE') == 'true') {
			__$wingBanner.classList.add('__today-hide');
			return;
		}

		mm.delay.on(function () {

			if (__$wingBanner.classList.contains('__switch-on')) return;

			mm.switch.on(mm.find('.btn_banner-extend', __$wingBanner)[0]);

		}, { _time: 500 });

	})(mm.find('.mm_wing-rside-banner')[0]);

	// 메인 히어로 배너 메뉴 마우스오버, 랜덤
	(function (__$heroMenu) {

		var $btnSubs = mm.find('.m__menu-sub a', __$heroMenu);
		var data = mm.data.get(mm.find('.m_main-hero .mm_swiper')).swiper;
		var interval;

		mm.event.on($btnSubs, 'mouseenter', function (__e) {

			data.Swiper.slideTo(mm.element.index($btnSubs, this) + 1);

		});

		// 랜덤 순서(첫 번째 메뉴 내부 순서는 고정)
		var arrs = [];
		var _firstTotal = mm.siblings($btnSubs[0].parentElement).length + 1;
		var _count = 0;

		for (var _i = 0; _i < $btnSubs.length; _i++) {
			if (_i < _firstTotal) arrs.push(_i);
			else arrs.splice(Math.floor(Math.random() * $btnSubs.length) + _firstTotal, 0, _i);
		}

		function startInterval() {

			clearInterval(interval);
			interval = setInterval(function () {

				data.Swiper.slideTo(arrs[_count] + 1);
				_count = (_count < $btnSubs.length - 1) ? _count + 1 : 0;

			}, 3000);

		}
		startInterval();

		mm.event.on(mm.find('.m_main-hero')[0], 'mouseenter mouseleave', function (__e) {

			switch (__e.type) {
				case 'mouseenter':
					clearInterval(interval);
					break;
				case 'mouseleave':
					startInterval();
					break;
			}

		});

	})(mm.find('.m_main-hero-menu')[0]);

	// 상단 3분할 배너 3초 간격으로 와이드 형태로 자동 변경
	(function (__$threeBanner) {

		var $banners = mm.find('ul li', __$threeBanner);
		if (!$banners[0]) return;

		var interval;
		var _index = 1;

		// 3분할 배너 자동 와이드 인터벌
		function startInterval() {

			clearInterval(interval);
			interval = setInterval(function () {

				bannerWide($banners[_index]);

				_index ++;
				if (_index === $banners.length) _index = 0;

			}, 3000);

		}
		startInterval();

		// 배너 와이드
		function bannerWide(__$banner) {

			var _classWide = '__wide';
			if (__$banner.classList.contains(_classWide)) return;

			gsap.to($banners, { width: '22.03125%', duration: 0.4 });
			gsap.to(mm.find('figcaption', $banners), { bottom: 22, duration: 0.4 });
			gsap.to(mm.find('.text_main', $banners), { fontWeight: 400, fontSize: '20px', lineHeight: '28px', duration: 0.4 });
			gsap.to(mm.find('.text_main span', $banners), { borderWidth: 0, duration: 0.4 });
			gsap.to(mm.find('.image_dim', $banners), { opacity: 0, duration: 0.4 });
			gsap.to(mm.find('.image_shadow', $banners), { opacity: 0.66, duration: 0.4 });

			gsap.to(__$banner, { width: '54.6875%', duration: 0.4, onComplete: (function () {

				mm.class.remove($banners, _classWide);
				mm.class.add(__$banner, _classWide);

			}) });
			gsap.to(mm.find('figcaption', __$banner), { bottom: 151, duration: 0.4 });
			gsap.to(mm.find('.text_main', __$banner), { fontWeight: 700, fontSize: '30px', lineHeight: '42px', duration: 0.4 });
			gsap.to(mm.find('.text_main span', __$banner), { borderTopWidth: 4, borderBottomWidth: 4, duration: 0.4 });
			gsap.to(mm.find('.image_dim', __$banner), { opacity: 1, duration: 0.4 });
			gsap.to(mm.find('.image_shadow', __$banner), { opacity: 0, duration: 0.4 });

		}

		// 마우스 오버시 인터벌 중단
		mm.event.on($banners, 'mouseenter mouseleave', function (__e) {

			switch (__e.type) {
				case 'mouseenter':
					clearInterval(interval);
					bannerWide(this);

					_index ++;
					if (_index === $banners.length) _index = 0;

					break;

				case 'mouseleave':
					startInterval();
					break;
			}

		});

		// 스크롤 위치가 3분할 배너가 아닐경우 인터벌 중단
		mm.event.on(mm.scroll.el, 'scroll', function () {

			var rect = __$threeBanner.getBoundingClientRect();
			if (-(__$threeBanner.offsetHeight) > rect.top && interval) {
				clearInterval(interval);

				interval = false;
			}
			else if ((__$threeBanner.offsetHeight + rect.top >= 0) && !interval) startInterval();

		});

	})(mm.find('.m_main-banner-three')[0]);

	// 진행중 타임어택 상품 이미지 썸네일 마우스 오버시 이미지 변경
	var $timedeal = mm.find('.m_timedeal-ongoing');

	_.forEach(mm.find('.m_timedeal-ongoing-item', $timedeal), function (__$thumb) {

		var $thumbImage = mm.find('.image_product', __$thumb)[0];
		var $btnThumbs = mm.find('.m__item-thumbnail li', __$thumb);
		var _classOn = '__thumbnail-on';

		mm.event.on($btnThumbs, 'mouseenter', function (__e) {

			mm.class.remove($btnThumbs, _classOn);
			mm.element.attribute($btnThumbs, { 'title': '' });
			mm.class.add(this, _classOn);
			mm.element.attribute(this, { 'title': '선택됨' });
			mm.element.style($thumbImage, { 'background-image': mm.string.template('url(${URL})', { URL: mm.data.get(mm.find('i', this)[0]).preload._src }) });

		});

		mm.event.dispatch($btnThumbs[0], 'mouseenter');

	});

});

// 메인 히어로 배너 스와이퍼 change 메뉴 on/off
function mainHeroChange () {

	var data = mm.data.get(this, 'data-swiper').Swiper;
	if (!data) return;

	var $heroMenu = mm.find('.m_main-hero-menu')[0];
	var $btns = mm.find('a', $heroMenu);
	var $btnSub = mm.find('.m__menu-sub a', $heroMenu)[data.realIndex];
	var $btnMain = $btnSub.closest('.m__menu-sub').previousElementSibling;
	var _classOn = '__menu-on';

	mm.element.attribute($btns, { 'title': '' });
	mm.class.remove($btns, _classOn);

	$btnSub.classList.add(_classOn);
	$btnSub.setAttribute('title', '선택됨');

	$btnMain.classList.add(_classOn);
	$btnMain.setAttribute('title', '선택됨');

}


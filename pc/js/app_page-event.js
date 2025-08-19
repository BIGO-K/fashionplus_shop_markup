/**
 * 기획전, 콜라보
**/

//< 기획전
mm.pageEvent = (function () {

	// UI 고유 객체
	var base = {
		// 연결
		init: function () {

			var $lists = mm.find('.m_promotion-list');
			if ($lists.length === 0) return;

			var $header = mm.find('.mm_header')[0];
			var $anchor = mm.find('.m_promotion-anchor')[0];
			var $anchorMenu = mm.find('ul', $anchor)[0];
			var $btnAnchors = mm.find('a', $anchor);
			var _classSticky = '__anchor-sticky';
			var _classOn = '__anchor-on';

			mm.element.style($anchor, { 'height': mm.number.unit($anchor.offsetHeight) });

			// 	// 앵커 메뉴 높이에 따른 전체보기 버튼 노출
			if ($anchorMenu.scrollHeight > $btnAnchors[0].offsetHeight) mm.class.add($anchor, '__menu-over');

			function scrollEventHandler() {

				if (mm.element.position($anchor).top < $header.offsetHeight + mm.element.position($header).top) $anchor.classList.add(_classSticky);
				else $anchor.classList.remove(_classSticky);

			}

			mm.event.off(mm.scroll.el, 'scroll', scrollEventHandler);// 중복방지
			mm.event.on(mm.scroll.el, 'scroll', scrollEventHandler);
			scrollEventHandler();

			// 스크롤 구간 상품섹션 변경
			mm.intersection.on($lists, function (__entry, __is) {

				if (__is) {
					mm.class.remove($btnAnchors, _classOn);
					mm.element.attribute($btnAnchors, { 'title': '' });

					var _index = mm.element.index($lists, __entry.target);
					var $btn = $btnAnchors[_index];
					mm.class.add($btn, _classOn);
					mm.element.attribute($btn, { 'title': '선택됨' });
					mm.element.style($anchorMenu, {'top': -Math.floor(_index / 4) * ($btnAnchors[0].offsetHeight - 1) + 'px' });
				}

			}, {
				config: {
					rootMargin: '-35% 0px -65% 0px',// 요소의 상단이 스크롤 높이의 35%
					threshold: [0, 1],// 요소의 시작과 끝 모두 감지
				}
			});

			// 상품 앵커 이동
			mm.event.off($btnAnchors, 'click', 'clickInlineHandler');
			mm.event.on($btnAnchors, 'click', function clickInlineHandler(__e) {

				__e.preventDefault();

				var _index = mm.element.index($btnAnchors, this);
				mm.scroll.to($lists[_index], { _margin: $header.offsetHeight + $btnAnchors[0].offsetHeight });

			});
		},
	};

	// private
	(function () {

		base.init();

	})();

	// public
	return {
		// 이벤트 연결
		update: function () {

			base.init();

		},
	};

})();
//> 기획전

//< 레디
mm.ready(function() {

	// 기획전 C타입 상품 이미지 썸네일 마우스 오버시 이미지 변경
	var $promoTypeC = mm.find('.m_promotion-list.__list_c__');

	_.forEach(mm.find('.m__c-item', $promoTypeC), function (__$thumb) {
		var $thumbImage = mm.find('.image_product', __$thumb)[0];
		var $btnThumbs = mm.find('.m__c-item-thumbnail li', __$thumb);
		var _classOn = '__thumbnail-on';

		mm.event.on($btnThumbs, 'mouseenter', function (__e) {

			mm.class.remove($btnThumbs, _classOn);
			mm.element.attribute($btnThumbs, { 'title': '' });
			this.classList.add(_classOn);
			this.setAttribute('title', '선택됨');
			mm.element.style($thumbImage, { 'background-image': mm.string.template('url(${URL})', { URL: mm.data.get(mm.find('i', this)[0]).preload._src }) });

		});

		mm.event.dispatch($btnThumbs[0], 'mouseenter')

	})

	// 기획전 상품리스트 타이틀 이미지 사용시 이미지 위치
	var $btnAnchors = mm.find('.m_promotion-anchor a');
	var $title = mm.find('.m_promotion-list h3 b');

	_.forEach($btnAnchors, function (__$anchor) {
		var _index = mm.element.index($btnAnchors, __$anchor);
		mm.element.style($title[_index], { 'background-position': mm.string.template('50% -${VALUE}px', { VALUE: $title[_index].offsetHeight * _index }) });
	})

});

//> 레디
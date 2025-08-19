/**
 * 기획전
 * * vue 실행 시점 이슈로 외부에서 실행할 수 있게 object 구조로 적용
**/

//< 기획전
mm.pageEvent = (function () {

	// UI 고유 객체
	var base = {
		// 연결
		init() {

			var $lists = mm.find('.m_promotion-list');
			if ($lists.length === 0) return;

			var $header = mm.find('.mm_header')[0];
			var $anchor = mm.find('.m_promotion-anchor')[0];
			var $btnDropdown = mm.find('.btn_dropdown', $anchor)[0];
			var $anchorText = mm.find('b', $btnDropdown)[0];
			var $btnAnchors = mm.find('a', $anchor);
			var _classSticky = '__anchor-sticky';
			var _classOn = '__anchor-on';
			var _headerHeight = ($header) ? $header.offsetHeight : 0;
			var _headerTop = ($header) ? mm.element.position($header).top : 0;

			function scrollEventHandler() {

				mm.dropdown.close($anchor);

				if (mm.element.offset($anchor).top < _headerHeight + _headerTop - parseFloat(mm.element.style($anchor, 'padding-top'))) $anchor.classList.add(_classSticky);
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

					var $btn = $btnAnchors[mm.element.index($lists, __entry.target)];
					mm.class.add($btn, _classOn);
					mm.element.attribute($btn, { 'title': '선택됨' });
					$anchorText.textContent = $btn.textContent;
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

				mm.scroll.to(this.getAttribute('href'), { _margin: _headerHeight + $btnDropdown.offsetHeight });

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
		update() {

			base.init();

		},
	};

})();
//> 기획전
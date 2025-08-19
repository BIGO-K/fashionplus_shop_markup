'use strict';

/**
 * 페이지 공통
**/

//< 최초(레디 전)
(function () {

	/*
	// 우클릭 및 드래그 방지
	function returnHandler(__e) {

		__e.preventDefault();

	}

	window.addEventListener('contextmenu', returnHandler);
	// document.addEventListener('selectstart', returnHandler);// 에디터 입력 이슈
	document.addEventListener('dragstart', returnHandler);
	*/

	// 로딩 제거(크롬 페이지 뒤로가기 시 이전 링크 이동으로 생긴 로딩 제거)
	mm.event.on(window, 'unload', function (__e) {

		mm.loading.hide();

	});

})();
//< 최초(레디 전)

//< 레디
mm.ready(function () {

	// 아이프레임
	if (frameElement) {
		mm.observer.dispatch(mm.event.type.frame_ready, { data: { this: window } });

		// 컨텐츠 아이프레임 리사이즈
		if (mm._isFrame) mm.frameResize(null, { _isLoad: true });
	}

	// 컴포넌트
	mm.ui.update();

	// autofill 감지
	mm.event.on('[data-text]', 'animationstart', function (__e) {

		var $text = this.closest('.mm_form-text');
		if (!$text) return;

		switch (__e.animationName) {
			case 'autofill-on':
				$text.classList.add('__text-on');
				break;
			case 'autofill-cancel':
				if (this.value.trim().length === 0) $text.classList.remove('__text-on');
				break;
		}

	});

	// 터치이벤트 확인
	mm.event.on(document, 'mousedown mouseup', function (__e) {

		switch (__e.type) {
			case 'mousedown':
				mm._isTouch = true;
				break;
			case 'mouseup':
				mm._isTouch = false;
				break;
		}

	});

	// a 링크
	mm.delegate.on(document, 'a[data-href]', 'click', function (__e) {

		if (this.target.toLowerCase() === 'blank') return;// target blank 제외

		// mm.data에 저장할 기본 값
		var initial = {
			openEl: this,// ? :element - 클릭한 요소
			_type: null,// ? :string - link, popup, modal, anchor, back, forward, reload
			_frameId: null,// ? :string - popup, modal을 iframe으로 노출할 때 id 값
			_frameName: null,// ? :string - popup, modal을 iframe으로 노출할 때 name 값
			// _isCloseBefore: false,// ? :boolean - type 값이 link/popup일 때 현재 팝업 요소를 닫음(교체)
			// _isLinkStage: true,// ? :boolean - type이 link일 때 true(스테이지에서 실행 mm.popup.open), false(현재 창에서 실행 location.href)
			_step: 1,// ? :number - mm.history.back/forward 이동 수
			// * 이 외 mm.link, mm.scroll.to  등에서 사용하는 변수를 추가로 적용하여 사용
		};

		var data = mm.data.get(this, 'data-href', { initial: initial });
		if (mm.is.empty(data)) data = mm.data.set(this, 'data-href', { initial: initial });
		var _attrHref = this.getAttribute('href');
		var _href = this.href;

		if (!data._type) return false;
		if (data._type === 'link') {
			if (_attrHref.replace('#', '').trim().length === 0 || _attrHref.toLowerCase().includes('javascript:')) return false;

			if (_href.split('#')[0] === location.href.split('#')[0]) data._type = 'reload';// 링크가 같으면 reload로 변경
			if (data._type === 'reload' && _href.includes('#')) data._type = 'anchor';// 링크가 같고 #이 있으면 anchor로 변경
		}

		__e.preventDefault();

		// 외부링크
		if (['link', 'popup'].includes(data._type)) {
			if (!_href.includes(location.host)) {
				// 프로토콜이 https 일 때 외부 http 경로의 iframe이 보안상 이유로 연결 안됨
				// mm.popup.open('popup_externalLink.html?url=' + _href);
				window.open(_href);// 새 창 열림
				return false;
			}
		}

		switch (data._type) {
			case 'reload':
				location.reload();// location.reload(true);
				break;
			case 'back':
				mm.history.back(data._step);
				break;
			case 'forward':
				mm.history.forward(data._step);
				break;
			case 'anchor':
				mm.scroll.to(_attrHref, data);
				break;
			case 'modal':
			case 'popup':
				// data.openEl = this;
			case 'link':
			case 'home':
				mm.link(_href, data);
				break;
		}

	});

	// PC 사용 추가
	(function () {

		var $header = mm.find('.mm_header')[0];
		var $footer = mm.find('.mm_footer')[0];

		// flex 수직 정렬이 ie에서 적용되지 않아서 높이값을 강제로 적용 > 컨텐츠를 ajax로 로드 하면 처음 높이를 가져올 수 없어 ie 높이 무시
		// error 레이아웃에서만 적용
		if (mm.is.ie() && mm._isError) {

			var $view = mm.find('.mm_view')[0];
			var _footerHeight = ($footer) ? $footer.offsetHeight : 0;
			var _pageHeight = $view.offsetHeight - _footerHeight - parseFloat(mm.element.style($view, 'padding-top'));
			var _contentHeight = mm.find('.mm_page-content')[0].offsetHeight;

			if (_pageHeight > _contentHeight) mm.element.style('.mm_page', { 'height': '100%' });
		}

		// 이미지 썸네일(썸네일 클릭 시 이미지 변경)
		_.forEach(mm.find('.m_prodetail-thumbnail'), function (__$thumb) {

			var $thumbImage = mm.find('.image_thumbnail', __$thumb)[0];
			var $btnThumbs = mm.find('.btn_thumbnail', __$thumb);
			var _classOn = '__thumbnail-on';

			mm.event.on($btnThumbs, 'click', function (__e) {

				mm.class.remove($btnThumbs, _classOn);
				mm.element.attribute($btnThumbs, { 'title': '' });
				this.classList.add(_classOn);
				this.setAttribute('title', '선택됨');
				mm.element.style($thumbImage, { 'background-image': mm.string.template('url(${URL})', { URL: mm.data.get(mm.find('i', this)[0]).preload._src }) });

			});

			mm.event.dispatch($btnThumbs[0], 'click');

		});

		if (mm._isModal) return;// 아래 스크립트는 모달에서는 사용 안함

		// 스크롤 이벤트
		var $stickies = mm.find('data-horizon');

		var _headerHeight = ($header) ? $header.offsetHeight : null;
		var _classStickyHeader = '__header-sticky';

		// 카테고리 사이드바
		var $side = mm.find('.mm_sidebar')[0];
		var $sideCate = mm.find('.mm_sidebar-category', $side)[0];
		var $sideCatemenu = mm.find('.mm_sidebar-category-menu', $sideCate)[0];
		var $btnCategory = mm.find('.btn_category', $sideCatemenu);

		var _classOnCategory = '__category-on';

		// 사이드바 dim 클릭시 사이드바 닫기
		mm.event.on(mm.find('.mm_sidebar-dim',  $side), 'click', function () {

			mm.event.dispatch(mm.find('.btn_sidebar-open',  $side), 'click');

		});

		// 사이드바 카테고리메뉴 마우스 오버시 하위 sub메뉴 노출
		mm.event.on($btnCategory, 'mouseenter', function (__e) {

			var $target = __e.target;

			mm.class.remove($btnCategory, _classOnCategory);
			if (!$target.classList.contains(_classOnCategory)) mm.class.add($target, _classOnCategory);

		});

		mm.event.on(mm.find('section', $sideCate), 'mouseenter', function (__e) {

			if (mm.find(mm.selector(_classOnCategory, '.'), $sideCatemenu)[0]) mm.class.remove($btnCategory, _classOnCategory);

		});

		mm.event.on($sideCatemenu, 'mouseleave', function (__e) {

			if (__e.toElement != $sideCatemenu && __e.toElement != mm.scroll.find($side)) mm.class.remove($btnCategory, _classOnCategory);

		});

		// 스크롤 이벤트
		var $wing = mm.find('.mm_wing')[0];
		var $prodCate = mm.find('.m_prod-category')[0];
		var $prodCateList = mm.find('.m_prod-category-list', $prodCate)[0];
		var _isShowAnchor = false;

		mm.event.on(mm.scroll.el, 'load scroll', function (__e) {

			var scrollOffset = mm.scroll.offset(this);

			// 헤더 sticky
			if ($header) {
				if (scrollOffset.top > _headerHeight) $header.classList.add(_classStickyHeader);
				else $header.classList.remove(_classStickyHeader);
			}

			// 사이드 카테고리 리스트 sticky (브랜드샵 등)
			if ($prodCateList && !$prodCateList.closest('.mm_rside')) {
				var _classStickyCate = '__category-sticky';
				var _classStickyEnd = '__sticky-end';

				if (mm.element.offset(mm.find('.mm_filter', $prodCate)[0]).top - 70 <= 0) mm.class.add($prodCate, _classStickyCate);
				else mm.class.remove($prodCate, _classStickyCate);

				if ($prodCate.classList.contains(_classStickyCate)) {
					var $scroller = mm.find('.mm_scroller', $prodCateList)[0];
					var _isScroll = $scroller.scrollHeight != $scroller.clientHeight; // mm_scroller에 스크롤이 생겼는지 체크

					var _breakPoint = (_isScroll) ? window.innerHeight + scrollOffset.top : mm.element.position($prodCateList).top + $scroller.offsetHeight + 86; // 페이지 하단 sticky 끝나는 분기점
					var _isOverBottom = _breakPoint > mm.element.position($prodCate).top + $prodCate.offsetHeight; // 카테고리 리스트가 페이지 하단을 넘었는지 체크
					var _isStickyEnd = $prodCate.classList.contains(_classStickyEnd);

					if (_isScroll) {
						if (_isOverBottom) {
							if (_isStickyEnd) mm.element.style($prodCateList,  { 'top': 'auto', 'height': mm.number.unit(window.innerHeight - $header.offsetHeight) });
							else {
								mm.element.style($prodCateList,  { 'top': mm.number.unit(scrollOffset.top - mm.element.position($prodCate).top + $header.offsetHeight) });
								mm.class.add($prodCate, _classStickyEnd);
							}
						}
						else if (_isStickyEnd) {
							mm.element.style($prodCateList,  { 'top': mm.number.unit($header.offsetHeight), 'height': 'auto' });
							mm.class.remove($prodCate, _classStickyEnd);
						}
					}
					else {
						if (_isOverBottom) {
							mm.element.style($prodCateList,  { 'top': 'auto', 'height': mm.number.unit($scroller.offsetHeight + 86) });

							if (!_isStickyEnd) mm.class.add($prodCate, _classStickyEnd);
						}
						else if (_isStickyEnd) {
							if (mm.element.offset($prodCateList).top - 70 > 0) {
								mm.element.style($prodCateList,  { 'top': mm.number.unit($header.offsetHeight), 'height': 'auto' });
								mm.class.remove($prodCate, _classStickyEnd);
							}
						}
					}
				}
				else mm.class.remove($prodCate, _classStickyEnd);
			}

			// fixed 요소 가로 스크롤 할 때 위치 이동
			if ($stickies) mm.element.style($stickies, { 'left': mm.number.unit(-scrollOffset.left) });

			// 윙배너 sticky
			if ($wing) {
				var $wingContent = mm.find('.mm_wing-rside', $wing)[0];
				var $btnAnchorTop = mm.find('.btn_anchor-top', $wing)[0];
				var _classStickyWing = '__wing-sticky';
				var _stickyHeaderY = ($header.classList.contains('__header-sticky')) ? $header.offsetHeight : 0;

				if ($wing.getBoundingClientRect().top < _stickyHeaderY) $wing.classList.add(_classStickyWing);
				else $wing.classList.remove(_classStickyWing);

				mm.element.style(mm.find('.mm_inner', $wing)[0], { 'left': mm.number.unit($wing.classList.contains(_classStickyWing) ? -scrollOffset.left : 0) });
				mm.element.style($btnAnchorTop, { 'margin-left': $wing.classList.contains(_classStickyWing) ? '' : mm.number.unit(-scrollOffset.left + 15) });

				// 스크롤시 사이드바 TOP 버튼 노출
				if ($wingContent) {
					var _isOverBanner = (mm.element.position($btnAnchorTop).top - 60 > mm.element.position($wingContent).top + $wingContent.offsetHeight);
					if (_isOverBanner && !_isShowAnchor) {
						_isShowAnchor = true;
						gsap.to($btnAnchorTop, { autoAlpha: 1, duration: 0.2, bottom: 60, ease: 'sine.out' });
					}
					else if (!_isOverBanner && _isShowAnchor) {
						_isShowAnchor = false;
						gsap.to($btnAnchorTop, { autoAlpha: 0, duration: 0.2, bottom: 0, ease: 'sine.out' });
					}
				}
				else {
					_isShowAnchor = true;
					gsap.to($btnAnchorTop, { autoAlpha: 1, duration: 0.2, bottom: 60, ease: 'sine.out' });
				}
			}

		});

		// 화면 리사이즈 이벤트
		var _classSmall = '__sidebar-sm';

		// 사이드바 최소화(화면 최소 사이즈 1360 + 좌측 여백 106)
		if ($side) {
			mm.event.on(window, 'load resize', function (__e) {

				if (window.innerWidth <= 1360 + 106) $side.classList.add(_classSmall);
				else $side.classList.remove(_classSmall);

			});
		}

		// 헤더 검색
		(function (__$search) {

			if (!__$search) return;

			var $searchInput = mm.find('data-text', __$search)[0];// 검색어 입력창
			var $recentWord = mm.find('.mm_header-search-keyword', __$search)[0];// 최근검색어
			var $recommendWord = mm.find('.mm_header-search-auto', __$search)[0];// 추천검색어
			var $btnClose = mm.find('.btn_close', __$search)[0];
			var _classOn = '__search-on';

			// 키보드 방향키 제어
			function keyDownFocus(__e, __$el) {

				__e.preventDefault();// 스크롤 움직임 방지

				mm.delay.on(function () {

					mm.class.remove(mm.find('.__over', __$search), '__over');
					__$el.classList.add('__over');

					$searchInput.value = _.last(mm.find('b:not(.text_date)', __$el)).textContent;

				});

			}

			mm.element.attribute(__$search, { 'tabindex': 0, 'style': { 'cursor': 'auto' } });

			mm.event.on($searchInput, 'click change keydown keyup', function (__e) {

				var _isKeyword = this.value.trim().length > 0;
				switch (__e.type) {
					case 'click':
					case 'keydown':
						if (__$search.classList.contains(_classOn)) return;// 이미 열려있으면 리턴

						__$search.classList.add(_classOn);
						gsap.to([$recentWord, $recommendWord], { alpha: 1, height: 550, duration: mm.time._fast, ease: 'cubic.inOut' });

						// break;
					case 'change':
						if (__e.detail && __e.detail._isUpdate === true) return;
					case 'keyup':
						if (__e.type === 'keyup' && __e.keyCode > 36 && __e.keyCode < 41) return;// 방향키

						mm.class.remove([$recommendWord, $recentWord], _classOn);
						if (_isKeyword) $recommendWord.classList.add(_classOn);
						else $recentWord.classList.add(_classOn);
						break;
				}

			});

			mm.event.on(__$search, 'keydown mouseover mouseenter mouseleave focusin focusout', function (__e) {

				var $searchOn = mm.find(mm.selector(_classOn, '.'), __$search);
				mm.delay.off('DELAY_SEARCH_CLOSE');

				switch (__e.type) {
					case 'keydown':
						if ($searchOn.length === 0) return;

						var $active = mm.find('.__over', __$search)[0] || document.activeElement;
						var $items = mm.find('li > a', $searchOn);
						var _itemIndex = mm.element.index($items, $active);
						var _isText = $active.matches('[data-text]');

						// 방향키 상
						if (__e.keyCode === 38) {
							if (_isText) return;

							if ($active.tagName !== 'A' || _itemIndex === 0) keyDownFocus(__e, $items[$items.length - 1]);
							else keyDownFocus(__e, $items[_itemIndex - 1]);
						}
						// 방향키 하
						else if (__e.keyCode === 40) {
							if ($active.tagName === 'A' && _itemIndex === $items.length - 1) keyDownFocus(__e, $items[0]);
							else keyDownFocus(__e, $items[_itemIndex + 1]);
						}
						break;
					case 'mouseover':// 리스트 아이템에 hover시 포커스
						mm.class.remove(mm.find('.__over', __$search), '__over');
						if (document.activeElement.tagName === 'A') mm.focus.in($searchInput);

						var $searchItem = __e.target.closest('a');
						if ($searchItem) $searchItem.classList.add('__over');
						break;
					// case 'mouseenter':
					// case 'focusin':
					// 	break;
					case 'mouseleave':
					case 'focusout':
						mm.delay.on(function () {

							mm.event.dispatch($btnClose, 'click');

						}, { _time: (__e.type === 'mouseleave') ? 1 : 0, _isSec: true, _name: 'DELAY_SEARCH_CLOSE', _isOverwrite: true });
						break;
				}

			});

			// 검색창 닫기
			mm.event.on($btnClose, 'click', function (__e) {

				gsap.to([$recentWord, $recommendWord], { alpha: 0, height: 0, duration: mm.time._faster, ease: 'quart.out',
					onComplete: function () {

						mm.class.remove([__$search, $recentWord, $recommendWord], _classOn);

					},
				});

			});

		})(mm.find('.mm_header-search')[0]);


		// 헤더 인기 검색어 자동 롤링
		(function (__$popular) {

			if (!__$popular) return;

			var $popularItems = mm.find('ol > li', __$popular);
			var _index = 0;
			var popularInterval;

			function popularAutoPlay() {

				popularInterval = setInterval(function () {

					gsap.fromTo($popularItems[_index], { y: '0%' }, { y: '-100%', duration: 0.3, ease: 'sine.inOut' });

					_index = (_index === $popularItems.length - 1) ? 0 : _index + 1;
					gsap.fromTo($popularItems[_index], { y: '100%' }, { y: '0', duration: 0.3, ease: 'sine.inOut' });

				}, 4000);

			}

			popularAutoPlay();

			mm.observer.on(__$popular, 'SEARCH_POPULAR_CHANGE', function (__e) {

				gsap.set( $popularItems, { clearProps: 'all' });

				if (__e.detail._is) {
					gsap.killTweensOf($popularItems);
					clearInterval(popularInterval);
					_.forEach($popularItems, function (__$el, __index) {

						gsap.fromTo(__$el, {rotateX: 90 }, { rotateX: 0.1, duration: 0.4, delay: (__index + 1) * 0.04, ease: 'back' });

					});

					// 인기검색어 영역 외 클릭 시 닫기
					mm.event.on(mm.find('.mm__popular-dim'), 'click', function () {

						mm.switch.off(mm.find('.mm__popular-inner > .btn_close'));

					});
				}
				else {
					_index = 0;
					_.forEach($popularItems, function (__$el, __index) {

						gsap.killTweensOf(__$el);

					});
					popularAutoPlay();

					mm.event.off(mm.find('.mm__popular-dim'), 'click');
				}

			});

		})(mm.find('.mm_header-popular')[0]);

		// 상품목록 상단
		mm.event.on('.mm_product-item-foot select', 'update change', function (__e) {

			mm.find('.text_selected', this.parentElement)[0].textContent = this.options[this.selectedIndex].text;

		});

	})();

	// 상품 선택(셀렉트박스 형태)
	_.forEach(mm.find('.mm_select-product'), function (__$el) {

		var $selected = mm.find('.mm_select-product-selected', __$el)[0];

		mm.event.on(mm.find('.btn_option', __$el), 'click', function (__e) {

			__e.preventDefault();

			mm.dropdown.close(this.closest('.mm_dropdown'));

			$selected.innerHTML = '';

			mm.element.append($selected, this.cloneNode(true));
			mm.element.unwrap(mm.find('.btn_option', $selected));
			mm.element.append($selected, mm.element.create('<button type="button" class="btn_remove" title="선택 해제하기"><i class="mco_remove-circle"></i></button>'));

			__$el.classList.add('__product-selected');

		});

		mm.delegate.on($selected, '.btn_remove', 'click', function (__e) {

			__e.preventDefault();

			$selected.innerHTML = '';
			__$el.classList.remove('__product-selected');

		});

	});

});
//> 레디

//< 로드
mm.load(function () {

	// 팝업 리사이즈
	if (mm._isPopup) mm.popup.resize();
	else if (mm._isModal) mm.modal.resize({ _isLoad: true });

	// 컨텐츠 아이프레임 리사이즈
	if (mm._isFrame) mm.frameResize(null, { _isLoad: true });

	// 익스/엣지 브라우저에서 새로고침 할 때 라디오/체크박스의 기존 선택을 물고있는거나 날려버리는 이슈가 있어 초기화 후 재연결
	if (mm.is.ie()) {
		var $checked = mm.find('[checked]');
		_.forEach($checked, function (__$check) {

			__$check.checked = true;

		});

		mm.form.update($checked);// mm.delay 필요?
	}

	// mm을 수정하지 못하도록 적용
	Object.freeze(mm);

});
//> 로드

//< 스와이퍼
// * 추후 삭제
mm.swiper = (function() {

	// .mm_swiper에만 적용됨
	// __element: 적용할 셀렉터 또는 셀렉터들을 포함하는 부모 (없으면 페이지 전체)

	var initial = {
		// 플러그인 옵션
		Swiper: null,// :Swiper
		configs: {
			initialSlide: 0,// 초기 슬라이드,
			spaceBetween: 0,// 간격
			// autoHeight: false,// 자동 높이조절
			// loop: false,
			// touchReleaseOnEdges: false,
			// allowTouchMove: true,
			// autoplay: false,
			wrapperClass: 'swiper-wrapper',
			slideClass: 'swiper-slide',
			slideActiveClass: 'swiper-slide-active',
			slideDuplicateClass: 'swiper-slide-duplicate',
			// navigation: {
			// 	nextEl: '.btn_swiper-next',
			// 	prevEl: '.btn_swiper-prev',
			// },
			pagination: {
				el: '.swiper-pagination',
			}
		},
		_type: 'swiper_box',// 고정 값 - swiper_box(일반), swiper_free(메뉴), swiper_page(페이지)
		count: '> .swiper-count',
		_isCountPad: false,
		controls: {
			_isSwiperInner: true,
			prev: '.btn_swiper-prev',
			next: '.btn_swiper-next',
		},
		syncer: null,// 스와이퍼와 연동되는 다른 스와이퍼 요소 (string, element, $selector)
		// _isSyncerUpdate: true,// :boolean - 싱커 업데이트 이벤트 실행 여부
		_isRemoveClone: false,// 복제요소삭제 (swiper_page와 swiper_box의 slide개수가 3개 이상일 때는 자동 적용)
		onReady: null,
		onReadyArgs: [],
		onChange: null,// 변경시작 콜백
		onChangeArgs: [],
		onChangeEnd: null,// 변경완료 콜백
		onChangeEndArgs: [],
		_index: null,// 페이지 내 스와이퍼 번호
		_classInitial: null,// initialSlide index 확인을 위한 클래스
		// 내부사용
		__: {
			preload: null,// 프리로드 적용
			resize: function() {},// 리사이즈 함수
		},
	};
	var _dataName = 'data-swiper';// 데이타 속성 이름
	var _swiperIndex = 0;// 다중 컨트롤 방지 고유번호 부여

	// private
	(function() {

		mm.ui.add('swiper');

	})();

	// public
	return {
		//- 스와이퍼 연결
		update: function(__element) {

			var $elements = mm.ui.element(_dataName, __element);
			$elements = _.filter($elements, function (__$el) { return mm.is.display(__$el); });// 숨겨진 요소 제외

			_.forEach($elements, function(__$el) {

				var data = mm.data.get(__$el, _dataName);
				if (mm.is.empty(data)) data = mm.data.set(__$el, _dataName, { initial: initial });

				var $wrapper = mm.find(mm.selector(data.configs.wrapperClass, '.'), __$el);
				var $slides = mm.find(mm.selector(data.configs.slideClass, '.'), $wrapper);
				var $pagination = mm.find(data.configs.pagination.el, __$el)[0];
				var $count = mm.find(data.count, __$el)[0];
				var $btnControls = (data.controls._isSwiperInner) ? mm.find(mm.string.template('${PREV}, ${NEXT}', { PREV: data.controls.prev, NEXT: data.controls.next }), __$el) : mm.find(mm.string.template('${PREV}, ${NEXT}', { PREV: data.controls.prev, NEXT: data.controls.next }));

				// 슬라이드 요소가 2보다 작으면 적용 안됨
				if ($slides.length < 2) {
					mm.class.add($slides, data.configs.slideActiveClass);
					mm.element.remove([$pagination, $count]);
					mm.element.remove($btnControls);

					mm.apply(data.onReady, __$el, [null].concat(data.onReadyArgs));
					return;
				}

				if (data.Swiper) {
					mm.swiper.reset(__$el);// 중복 실행 시 리셋
					// if (data.Swiper.snapIndex < 0) mm.swiper.reset(__$el);// 제대로 적용이 안된 요소는 리셋

					return;// 이미 적용되어 있는 요소는 적용 안됨
				}

				// 다중 컨트롤 방지 고유번호 부여
				data._index = _swiperIndex++;
				__$el.classList.add(mm.string.template('__swiper-index${INDEX}', { INDEX: data._index }));
				var _classSwiper = mm.selector(__$el.getAttribute('class').replace(/ /gi, '.'), '.');

				// 페이지네이션 추가
				data.configs = mm.extend(data.configs, {
					pagination: {
						el: mm.string.template('${SWIPER} ${PAGINATION}', { SWIPER: _classSwiper, PAGINATION: data.configs.pagination.el }),
						clickable: true,
					}
				});

				// 카운터 추가
				if ($count) {
					data.configs = mm.extend(data.configs, {
						pagination: {
							el: mm.string.template('${SWIPER} ${COUNT}', { SWIPER: _classSwiper, COUNT: data.count }),
							type: 'fraction',
							formatFractionCurrent: function (__index) {

								return (data._isCountPad && __index < 10) ? '0' + __index : __index;

							},
							formatFractionTotal: function (__total) {

								return (data._isCountPad && __total < 10) ? '0' + __total : __total;

							},
						}
					});
				}

				// data.configs = mm.extend(data.configs, {
				// 	navigation: {
				// 		nextEl: _classSwiper + ' ' + data.configs.navigation.nextEl,
				// 		prevEl: _classSwiper + ' ' + data.configs.navigation.prevEl,
				// 	},
				// });

				// 이전, 다음 컨트롤(swiper 자체 navigation 사용 시 다중 swiper가 제어되는 이슈 발생)
				mm.event.off($btnControls, 'click');
				mm.event.on($btnControls, 'click', function (__e) {

					__e.preventDefault();

					if (this.matches(data.controls.prev)) data.Swiper.slidePrev();
					else data.Swiper.slideNext();

					checkControlBtn();

				});

				// 버튼 처음과 끝에서 disabled 적용
				function checkControlBtn(__swiper) {

					var swiper = __swiper || data.Swiper;
					if (!swiper) return;

					if (data.configs.loop !== true && $btnControls.length > 0) {
						_.forEach($btnControls, function (__$btn) {

							if (swiper.isBeginning === true && __$btn.matches(data.controls.prev)) __$btn.setAttribute('disabled', '');
							else if (swiper.isEnd === true && __$btn.matches(data.controls.next)) __$btn.setAttribute('disabled', '');
							else __$btn.removeAttribute('disabled');

						});
					}

				}

				// 초기슬라이드 인덱스
				if (data._classInitial) data.configs.initialSlide = mm.element.index(slides, mm.find(mm.selector(data._classInitial, '.'), __$el)[0].closest(mm.selector(data.configs.slideClass, '.')));

				// 컨텐츠/본문타입
				if (data._type == 'swiper_box' || data._type == 'swiper_page') {
					data.configs = mm.extend(data.configs, {
						on: {
							init: function() {

								// 복제로 인한 프리로드 강제 적용
								mm.preload.destroy(__$el);
								mm.preload.force(__$el);

								if (data._isRemoveClone) {

									var swiper = this;
									_.forEach(swiper.slides, function(__$slide) {

										if (__$slide.classList.contains(data.configs.slideDuplicateClass)) {
											__$slide.innerHTML = '';
											mm.element.style(__$slide, { 'z-index': -1 });
											_.forEach(__$slide.attributes, function (__key) {

												// 복제요소 스와이퍼 속성 외 삭제
												if (!/^class$|^style$|^data\-swiper\-slide/i.test(__key)) __$slide.removeAttribute(__key);

											});
										}

									});

									__$el.classList.add('swiper-removeclone');
									checkControlBtn(swiper);
								}

								mm.delay.on(mm.apply, { params: [data.onReady, __$el, [this.realIndex].concat(data.onReadyArgs)] });

							},
							slideChangeTransitionStart: function() {

								var swiper = this;
								if (data.Swiper && data._isRemoveClone && data.configs.effect != 'fade') data.__.resize(this);// 복제 제거로 자동높이 직접 적용

								mm.apply(data.onChange, __$el, [swiper.realIndex].concat(data.onChangeArgs));

								// 싱크된 메뉴가 있을 때
								var $menu = mm.find(data.syncer)[0];
								if ($menu) {
									var menuData = mm.data.get($menu, _dataName);
									if (menuData.Swiper) menuData.Swiper.slideTo(swiper.realIndex);

									mm.apply(menuData.onChange, $menu, [swiper.realIndex].concat(menuData.onChangeArgs));
								}

							},
							slideChangeTransitionEnd: function() {

								var swiper = this;
								checkControlBtn();

								mm.apply(data.onChangeEnd, __$el, [swiper.realIndex].concat(data.onChangeEndArgs));

							},
							transitionStart: function() {

								var swiper = this;
								if (!swiper.params.loop || !data._isRemoveClone) return;

								// 스와이퍼 복제 사용 안함으로 인한 위치 이동
								// var $slides = mm.find(swiper.slides);
								var $slideFirst = _.head($slides);
								var $slideLast = _.last($slides);

								if (!$slideFirst || !$slideLast) return;

								// 효과 페이드
								if (data.configs.effect == 'fade') {
									//
								}
								// 효과 슬라이드
								else {
									mm.element.style($slideFirst, { 'visibility': '', 'transform': '' });
									mm.element.style($slideLast, { 'visibility': '', 'transform': '' });

									var _lastLeft = mm.number.unit(mm.element.position($slideLast).left - mm.element.position($slideLast.parentElement).left);

									// 처음
									if (swiper.activeIndex == 1) {
										mm.element.style($slideLast, { 'visibility': 'inherit', 'transform': mm.string.template('translateX(-${LEFT})', { LEFT: _lastLeft }) });
									}
									// 처음 복제
									else if (swiper.activeIndex == swiper.slides.length - 1) {
										mm.element.style($slideFirst, { 'visibility': 'inherit', 'transform': mm.string.template('translateX(${LEFT})', { LEFT: _lastLeft }) });
									}
									// 마지막
									else if (swiper.activeIndex == swiper.slides.length - 2) {
										mm.element.style($slideFirst, { 'visibility': 'inherit', 'transform': mm.string.template('translateX(${LEFT})', { LEFT: _lastLeft }) });
									}
									// 마지막 복제
									else if (swiper.activeIndex == 0) {
										mm.element.style($slideLast, { 'visibility': 'inherit', 'transform': mm.string.template('translateX(-${LEFT})', { LEFT: _lastLeft }) });
									}
								}

								checkControlBtn();

							}
						}
					});

					if (data._type == 'swiper_page' || $slides.length > 2) data._isRemoveClone = true;// 클론요소삭제

					if (mm.is.empty(data.configs.loop)) data.configs.loop = (data._type == 'swiper_page' && __$el.closest('.mm_swiper')) ? false : true;// page 타입 컨텐츠가 mm_swiper 안에 있을 때 loop 안됨
					if (mm.is.empty(data.configs.touchReleaseOnEdges)) data.configs.touchReleaseOnEdges = !data.configs.loop;// loop가 false 일 때 multiple swiper 내부 처음/마지막에서 상위 swiper 이동
					if (mm.is.empty(data.configs.allowTouchMove)) data.configs.allowTouchMove = data.configs.loop;// loop가 false 일 때 본문 스와이퍼 안됨 (lnb로 컨트롤 가능)
					if (mm.is.empty(data.configs.autoplay)) data.configs.autoplay = (data._type == 'swiper_page') ? false : { delay: 3000, disableOnInteraction: false };// 페이지타입과 autoplay가 false가 아니면 자동롤링 적용

					// 컨텐츠 자동 높이
					if (data.configs.autoHeight) {
						if (!data._isRemoveClone) data.configs.autoHeight = true;// 복제 제거로 slideChangeTransitionStart 함수에 직접 적용
						// else {
							// 높이 업데이트
							data.__.resize = function() {

								var $slide = mm.swiper.activeSlide(data)[0];
								mm.element.style(data.Swiper.$wrapperEl[0], { 'height': mm.number.unit($slide.offsetHeight) });

							}
						// }
					}
				}

				// 자유/메뉴타입
				if (data._type == 'swiper_free') {
					data.configs = mm.extend(data.configs, {
						// freeMode: true,
						slidesPerView: 'auto',
						centeredSlides: (typeof(data.configs.centeredSlides) === 'boolean') ? data.configs.centeredSlides : true,
						on: {
							init: function(__e) {

								// __$el.css({ 'visibility': 'inherit' });
								mm.delay.on(data.__.resize, { _time: 400 });// 위치 초기화 2중 확인
								checkControlBtn(this);

								// 복제로 인한 프리로드 강제 적용
								mm.preload.destroy(__$el);
								mm.preload.force(__$el);

								mm.delay.on(mm.apply, { params: [data.onReady, __$el, [this.realIndex].concat(data.onReadyArgs)] });

							},
							tap: function(__e) {

								var $syncer = mm.find(data.syncer)[0];

								// 싱크된 컨텐츠가 있을 때
								if ($syncer) {
									__e.returnValue = false;

									var syncData = mm.data.get($syncer, _dataName);
									var syncSwiper = syncData.Swiper;
									var _index = (syncSwiper.params.loop) ? this.clickedIndex + 1 : this.clickedIndex;

									if (syncSwiper) syncSwiper.slideTo(_index, 0);
								}

							},
							resize: function(__e) {

								if (data.__.resize) data.__.resize();// 안드로이드 키패드업, 카카오톡 스크롤 시 resize로 위치가 바뀌는 이슈로 적용

							},
							transitionStart: function() {

								checkControlBtn();

							},
							slideChangeTransitionStart: function() {

								var swiper = this;
								mm.apply(data.onChange, __$el, [swiper.realIndex].concat(data.onChangeArgs));

							},
							slideChangeTransitionEnd: function() {

								var swiper = this;
								checkControlBtn();

								mm.apply(data.onChangeEnd, __$el, [swiper.realIndex].concat(data.onChangeEndArgs));

							},
						}
					});

					// 사이즈, 위치 업데이트
					data.__.resize = function() {

						var swiper = data.Swiper;
						if (!swiper) return;

						swiper.update();

						var _max = swiper.wrapperEl.scrollWidth - swiper.width;
						_.forEach(swiper.slidesGrid, function(__value, __index) {

							if (__value < 0) {
								swiper.slidesGrid[__index] = 0;
								swiper.snapGrid[__index] = 0;
							}
							else if (__value > _max) {
								swiper.slidesGrid[__index] = _max;
								swiper.snapGrid[__index] = _max;
							}

						});
						if (swiper.translate > 0) swiper.setTranslate(0);
						else if (swiper.translate < -_max) swiper.setTranslate(-_max);

						mm.class.remove(swiper.wrapperEl, ['mm_box-flex', '__flex_auto__']);
						if (swiper.wrapperEl.scrollWidth <= __$el.offsetWidth) mm.class.add(swiper.wrapperEl, ['mm_box-flex', '__flex_auto__']);

					}
				}

				if (data.configs.slidesPerView && data.configs.slidesPerView != 1) data._isRemoveClone = false;// 클론삭제안함(단일 노출에만 적용)

				// 스와이퍼 적용
				data.Swiper = new Swiper(mm.string.template('${SWIPER} .mm_swiper-inner', { SWIPER: _classSwiper }), data.configs);

				// 위치 초기화
				data.__.resize();
				mm.load(data.__.resize);

			});

		},
		//- 스와이퍼 재설정
		reset: function(__element) {

			if (!Swiper) return;// swiper js가 없으면 적용 안됨

			var $elements = mm.ui.element(_dataName, __element);

			_.forEach($elements, function(__$el) {

				var data = mm.data.get(__$el, _dataName);
				if (mm.is.empty(data)) data = mm.data.set(__$el, _dataName, { initial: initial });

				if (data.Swiper) {
					mm.class.remove(__$el, [mm.string.template('__swiper-index${INDEX}', { INDEX: data._index }), 'swiper-removeclone']);
					data.Swiper.destroy();
					data.Swiper = null;
					mm.data.remove(__$el, _dataName);
				}

				mm.swiper.update(__$el);

			});

		},
		//- 스와이퍼 현재 슬라이드
		activeSlide: function(__data) {

			var swiper = __data.Swiper;
			var $slide = (!swiper.params.loop) ? mm.find(mm.string.template('> .${SLIDE}', { SLIDE: __data.configs.slideActiveClass }), swiper.$wrapperEl) : _.filter(swiper.slides, function(__$slide) { return __$slide.getAttribute('data-swiper-slide-index') == swiper.realIndex && !__$slide.classList.contains(__data.configs.slideDuplicateClass); });
			if (!$slide) $slide = swiper.slides;

			return $slide;

		},
	};

})();
//> 스와이퍼

//< 상품 찜하기
function toggleLikeProduct(__is, __callback, __params) {

	var $switch = this;
	var _isSwiperLoop = (!$switch.closest('.mm_swiper')) ? false : mm.data.get($switch.closest('.mm_swiper')).swiper.configs.loop;

	// * 슬라이드형 상품리스트가 swiper loop인 경우 좋아요 버튼을 눌러도 복제된 swiper-slide에는 반영되지 않는 이슈로 찜하기 클릭시 복제된 요소에도 좋아요 활성화 처리
	// * 이때, 복제된 요소 좋아요처리는 dispatch가 아닌 단순 __switch-on 클래스만 추가
	if (_isSwiperLoop) {
		var _classOn = '__switch-on';
		var $slide = mm.find('.swiper-slide-duplicate-active', $switch.closest('.swiper-wrapper'))[0];

		var _index = mm.element.index($switch.closest('.mm_product-list').children, $switch.closest('.mm_product-item'));
		var $item = mm.find('.mm_product-item', $slide)[_index];

		mm.class.toggle(mm.find('.mm_like', $item), _classOn);
	}

	mm.apply(__callback, $switch, [__is].concat(__params));

	// 좋아요 모션
	// if (__is) {
	// 	var $likeIcon = $switch.children[0];

	// 	gsap.to($likeIcon, { alpha: 0.5, scale: 0.5, duration: 0.15, ease: 'sine.out', onComplete: function () {

	// 		gsap.set($likeIcon, { scale: 2 });
	// 		gsap.to($likeIcon, { alpha: 1, scale: 1, duration: 0.2, ease: 'cubic.out' });

	// 	} });
	// }

}
//> 상품 찜하기

//< 브랜드 찜하기 활성화
function toggleLikeBrand(__is, __callback, __params) {

	var $switch = this;
	mm.apply(__callback, $switch, [__is].concat(__params));

	// 좋아요 모션
	if (__is) {
		var $likeIcon = $switch.children[0];

		gsap.to($likeIcon, { alpha: 0.5, scale: 0.5, duration: 0.15, ease: 'sine.out', onComplete: function () {

			gsap.set($likeIcon, { scale: 2 });
			gsap.to($likeIcon, { alpha: 1, scale: 1, duration: 0.2, ease: 'cubic.out' });

		} });
	}

}
//> 브랜드 찜하기 활성화

//< 윙배너 확장
function extendWingBanner(__is) {

	var $wingBanner = mm.find('.mm_wing-rside-banner')[0];
	var $swiper = mm.find('.mm_swiper', $wingBanner);

	var dataSwiper = mm.data.get($swiper, 'swiper').Swiper;
	var activeIndex = (!dataSwiper) ? 0 : dataSwiper.activeIndex;

	var $slide = mm.find('.swiper-slide', $swiper)[activeIndex];
	var $bannerDefault = mm.find('.btn_banner-extend', $slide)[0];// 작은 배너 영역
	var $bannerExtend = mm.find('.mm__banner-extend', $slide)[0];// 큰 배너 영역
	var $imageSmall = mm.find('.mm_image-banner img', $bannerDefault)[0];// 작은 배너 이미지
	var $imageLarge = mm.find('.mm_image-banner img', $bannerExtend)[0];// 큰 배너 이미지
	var $btnClose = mm.find('.btn_close', $bannerExtend)[0];

	if (__is) {
		if (!mm.is.empty(dataSwiper)) dataSwiper.autoplay.stop(); // 배너 확장시 윙배너 롤링stop
		mm.delay.off('DELAY_SWITCH_OFF');

		mm.element.append($wingBanner, $bannerExtend);
		if (mm.cookie.get('IS_WING_POPUP_HIDE') == 'true') $wingBanner.classList.add('__today-hide');

		var defaultRect = $bannerDefault.getBoundingClientRect();
		var scrollOffset = mm.scroll.offset(mm.scroll.el);
		mm.element.style($bannerExtend, { 'position': 'fixed', 'top': mm.number.unit(defaultRect.top), 'right': mm.number.unit(document.body.offsetWidth - defaultRect.right - scrollOffset.left), 'margin-top': '0px', 'width': mm.number.unit($imageSmall.naturalWidth), 'height': mm.number.unit($imageSmall.naturalHeight) });
		gsap.to($bannerExtend, { top: '50%', marginTop: -$imageLarge.naturalHeight / 2, width: $imageLarge.naturalWidth, height: $imageLarge.naturalHeight, duration: 0.3, ease: 'sine.InOut' });
		mm.element.show($btnClose);

		// 열린 윙배너가 4초후 닫힘
		mm.delay.on(function () {

			mm.event.dispatch($btnClose, 'click');

		}, { _time: 4, _isSec: true, _name: 'DELAY_WING_OFF' });

		mm.event.on($wingBanner, 'mouseover mouseleave', function wingBannerInlineHandler(__e) {

			switch (__e.type) {
				case 'mouseover':
					mm.delay.off('DELAY_WING_OFF');
					break;
				case 'mouseleave':
					mm.delay.on(function () { mm.event.dispatch(mm.find('.btn_close', $wingBanner), 'click') }, { _time: 1000, _name: 'DELAY_WING_OFF' });
					console.log('4242');
					break;
			}

		});

		mm.event.on($btnClose, 'click', function windCloseInlineHandler() {

			mm.element.hide($btnClose);

			// 오늘하루 그만보기
			if (mm.find('data-check', $bannerExtend)[0].checked) mm.cookie.set('IS_WING_POPUP_HIDE', true, 1, true);// 1일 자정 리셋

			var defaultRect = mm.element.offset($bannerDefault);
			gsap.to($bannerExtend, { 'top': defaultRect.top, 'right': document.body.offsetWidth - defaultRect.right - scrollOffset.left, 'margin-top': 0, 'width': $imageSmall.naturalWidth, 'height': $imageSmall.naturalHeight, duration: 0.15, ease: 'sine.out', onComplete: function () {

				$bannerExtend.removeAttribute('style');
				mm.element.append($bannerDefault.closest('li'), $bannerExtend);

				if (!mm.is.empty(dataSwiper)) dataSwiper.autoplay.start(); // 배너 축소시 윙배너 롤링 start

			} });

			mm.delay.on(mm.switch.off, { _time: 100, _name: 'DELAY_SWITCH_OFF', params: [$bannerDefault] });

		}, { _isOnce: true });
	}
	else {
		mm.event.off($wingBanner, 'mouseover mouseleave', 'wingBannerInlineHandler');
		mm.event.off($btnClose, 'click', 'windCloseInlineHandler');
	}

}
//> 윙배너 확장

//< 인기검색어 스위칭
function searchPopularChange(__is) {

	mm.observer.dispatch('SEARCH_POPULAR_CHANGE', { _isLocal: true, data: { _is: __is } });

}
//> 인기검색어 스위칭

//< 타임어택 윙배너 자동닫기
function autoCloseTimedeal(__is) {

	var $timeDeal = mm.find('.m__timedeal-content')[0];

	if (__is) {
		mm.event.on($timeDeal.parentElement, 'mouseenter mouseleave', function (__e) {

			switch (__e.type) {
				case 'mouseenter':
					mm.delay.off('DELAY_TIME_OFF');
					break;
				case 'mouseleave':
					mm.delay.on(function () {

						mm.switch.off(mm.siblings($timeDeal, '.mm_switch')[0]);

					}, { _time: 500, _name: 'DELAY_TIME_OFF', _isOverwrite: true });
					break;
			}

		});
	}

}
//> 타임어택 윙배너 자동닫기

//< 헤더 최근 본 상품 영역 외 클릭 시 닫기
function closeRecent(__is) {

	mm.event.on(mm.find('.mm__recent-dim'), 'click', function () {

		mm.switch.off(mm.find('.mm_header-quick-recent > .mm_switch'));

	});

}
//> 헤더 최근 본 상품 영역 외 클릭 시 닫기
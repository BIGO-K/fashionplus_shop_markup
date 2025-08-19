'use strict';

/**
 * 상품상세
 * (프레임)
**/

//< 레디
mm.ready(function () {

	// 상품 상세정보 태그/속성 정리
	_.forEach(mm.find('.m_prodetail-desc'), function (__$el) {

		// 불필요한 태그 삭제
		mm.element.remove(mm.find('link', __$el));
		// mm.element.unwrap(_.filter(mm.find('a', __$el), function (__$item) { return !__$item.closest('.m__desc-deal'); }));// 딜상품 제외 >> a링크 내부 기획전 연결을 위해 허용
		// data-href 속성은 개발에서 내부 경로에만 적용

		// 이미지에 사용자가 등록한 이미지 속성 제거
		_.forEach(mm.find('img'), function (__$img) {

			var attr = { style: { 'width': 'auto', 'max-width': '100%' } };
			_.forEach(__$img.attributes, function (__key) {

				if (!['id', 'class', 'src', 'alt', 'usemap'].includes(__key.name) && !__key.name.startsWith('data-')) attr[__key.name] = '';// usemap은 pc에서만 허용

			});
			mm.element.attribute(__$img, attr);

		});

		// 이미지를 제외한 width 속성 제거(style 제외)
		_.forEach(mm.find('[width]'), function (__$item) {

			mm.element.attribute('[width]', { 'width': '' });

		});

		// 유튜브 가변 사이즈 구조 적용
		_.forEach(mm.find('iframe'), function(__$iframe) {

			if (__$iframe.getAttribute('src').includes('youtube') && !__$iframe.parentElement.classList.contains('m__desc-media')) {
				mm.element.wrap(__$iframe, 'div');
				__$iframe.parentElement.classList.add('m__desc-media');
			}

		});

		// ERP에서 삽입된 font, center 태그를 P태그로 변경
		_.forEach(mm.find(mm.selector(['font', 'center']), __$el), function (__$tag) {

			mm.element.wrap(__$tag, 'p');
			mm.element.unwrap(__$tag);

		});

		// 프리로드(오류 이미지 삭제)
		_.forEach(mm.find('data-preload'), function (__$loader) {

			if (__$loader.closest('.m__desc-deal')) return;// 딜상품 제외

			var data = mm.data.get(__$loader).preload;
			data._isPass = false;
			data._isErrorImage = false;
			data.onComplete = mm.frameResize;
			data.onError = function () {

				mm.element.remove([this.closest('figure, li, i'), this]);
				mm.frameResize();

			}

		});
		mm.preload.update();

	});

	// 묶음상품 옵션선택
	mm.event.on(mm.find('.m__desc-deal .btn_option-select'), 'click', function (__e) {

		mm.observer.dispatch('PROD_FRAME_OPTION_SELECT', { data: { _index: mm.find('.text_index', this.closest('.m__deal-item'))[0].textContent } });

	});

	// 상품평 이미지 크게보기
	mm.event.on('.m__item-content ul li a', 'click', function (__e) {

		__e.preventDefault();

		var $frameParent = parent.document.getElementsByClassName('mm_page-content');
		var $reviewLists = mm.find('li', this.closest('ul'));
		var _targetIndex = mm.element.index($reviewLists, this.parentElement);
		var $item = mm.element.create(mm.string.template([
			'<div class="m_review-modal">',
				'<div class="m_review-modal-item">',
				'	<h5><b>이미지 크게 보기</b></h5>',
				'	<div class="mm_swiper" data-swiper>',
				'		<div class="mm_swiper-inner">',
				'			<ul class="swiper-wrapper"></ul>',
				'		</div>',
				'		<div class="swiper-controls">',
				'			<button type="button" class="btn_swiper-prev"><i class="mco_control-prev"></i><b class="mm_ir-blind">이전</b></button>',
				'			<button type="button" class="btn_swiper-next"><i class="mco_control-next"></i><b class="mm_ir-blind">다음</b></button>',
				'		</div>',
				'		<div class="swiper-pagination"></div>',
				'	</div>',
				'	<button type="button" class="btn_close"><i class="mco_close"></i><b class="mm_ir-blind">닫기</b></button>',
				'</div>',
			'</div>'
		]))[0];

		_.forEach($reviewLists, function (__$el, __index) {

			var $reviewImage = mm.find('.image_review', __$el);
			var $slideItem = mm.element.create('<li class="swiper-slide"><i class="image_review"></i></li>');

			mm.element.append(mm.find('.swiper-wrapper', $item), $slideItem);
			mm.element.style(mm.find('.image_review', $item)[__index], { 'background-image': mm.string.template('url(${URL})', { URL: $reviewImage[0].children[0].getAttribute('src') }) });

		});

		mm.element.attribute(mm.find('.mm_swiper', $item), { 'data-swiper' : { 'configs': { 'initialSlide': _targetIndex, 'autoplay': false } } });

		mm.element.append($frameParent, $item);
		mm.class.add($item, '__on');
		parent.mm.scroll.off();
		parent.mm.swiper.update('.m_review-modal');

		// 닫기
		mm.event.on(mm.find('.btn_close', $item), 'click', function (__e) {

			this.closest('.m_review-modal').remove();
			parent.mm.scroll.on();

		});

	});

});
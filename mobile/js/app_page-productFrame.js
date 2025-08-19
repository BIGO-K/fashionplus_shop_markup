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

				if (!['id', 'class', 'src', 'alt'].includes(__key.name) && !__key.name.startsWith('data-')) attr[__key.name] = '';

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

		// 레이지로드(오류 이미지 삭제)
		_.forEach(mm.find('data-lazyload'), function (__$loader) {

			if (__$loader.closest('.m__desc-deal')) return;// 딜상품 제외

			var data = mm.data.get(__$loader).lazyload;
			data._isPass = false;
			data._isErrorImage = false;
			data.onComplete = mm.frameResize;
			data.onError = function () {

				mm.element.remove([this.closest('figure, li, i'), this]);
				mm.frameResize();

			}

		});
		mm.lazyload.update();

	});

	// 묶음상품 옵션선택
	mm.event.on(mm.find('.m__deal-item .btn_option-select'), 'click', function (__e) {

		var $element = parent.mm.ui.element('data-product');
		var _index = mm.find('.text_index', this.closest('.m__deal-item'))[0].textContent;

		if (!mm.class.every($element, '__option-open')) mm.event.dispatch(parent.mm.find('.btn_option-toggle', $element), 'click');
		if (!mm.class.every($element, '__option-selecting')) mm.event.dispatch(mm.find('.btn_option-open', $element), 'click');

		if (mm.class.every($element, '__option-selecting')) {
			var $dropdown = mm.find('.mm_dropdown', $element)[0];
			var $target = mm.find(mm.string.template('[data-index="${INDEX}"]', { INDEX: _index }), $dropdown)[0];

			// 품절상품인 경우 옵션을 선택하지 않습니다
			if ($target.classList.contains('__option-soldout')) return;

			// 옵션선택을 delay 없이 할 경우 preload가 완료되지 않아 delay 후 옵션선택 이벤트를 실행합니디
			mm.delay.on(function () {

				mm.event.dispatch(mm.find('.btn_option', $target), 'click');

			}, { _time: 100 });
		}

	});

});
'use strict';

/**
 * 상품상세
 * (옵션선택, 스크롤)
**/

//< 옵션선택
function prodOption(__json) {

	if (!__json) return false;

	var _dataName = 'data-product';

	var data = __json;
	var dataProduct = data.product;

	var $element = mm.ui.element(_dataName);

	var PROD_OPTION_QTY = 'PROD_OPTION_QTY';//? 옵션수량변경
	var PROD_OPTION_SELECT = 'PROD_OPTION_SELECT';//? 최종 옵션선택
	var PROD_FRAME_OPTION_SELECT = 'PROD_FRAME_OPTION_SELECT';// 딜상품 아이프레임에서 옵션선택

	var _searchOn = '__search-on';

	var _isDeal = (dataProduct[0].options.sub) ? true : false; // 딜상품 여부 체크

	// 옵션1 생성
	(function () {
		// 로드시 옵션은 옵션1만 생성하며, 옵션2는 옵션1 선택시에 생성합니다

		_.forEach($element, function (__$el) {

			var $dropdown = mm.find('.mm_dropdown', __$el)[0];
			var $optionList = mm.find('.m__option-list:not(.__option-searched)', $dropdown)[0];

			mm.element.remove(mm.find('.mm_scroller', $optionList));
			mm.element.append($optionList, mm.element.create('<div class="mm_scroller"><ul></ul></div>'));

			var options = (_isDeal) ? dataProduct : dataProduct[0].options;

			_.forEach(options, function (__option, __index) {

				var _optionHtml = mm.string.template([
					'<li data-index="${INDEX}">',
						'<button type="button" class="btn_option">',
							(_isDeal) ? '<b>선택${INDEX}) ${OPTION}</b>' : '<b>${OPTION}</b>',
							'<b class="text_info"><strong>${PRICE}</strong></b>',
						'</button>',
					'</li>'
				], { INDEX: (_isDeal) ? __option._index : __index + 1, OPTION: __option._name, PRICE: mm.number.comma(__option._price) });

				var $option = mm.element.create(_optionHtml);

				if (_isDeal) {
					// 상품 썸네일 추가
					mm.element.prepend(mm.find('.btn_option', $option), '<i class="image_product"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" data-preload></i>');
					mm.element.attribute(mm.find('[data-preload]', $option), { 'data-preload': { _src: __option._image }});
					mm.preload.update($option);

					// 옵션1에 속한 옵션2가 모두 품절인지 체크
					var _isSoldout = false;
					var _soldoutCount = 0;
					_.forEach(__option.options.sub, function (__optionSub) {

						if (__optionSub._stock === 0) _soldoutCount++;
						if (__option.options.sub.length === _soldoutCount) _isSoldout = true;

					});

					if (_isSoldout) {
						mm.element.append(mm.find('.text_info', $option), '<span class="text_stock">(품절)</span>');
						mm.class.add($option, '__option-soldout');
					}
				}
				else {
					// 옵션의 구매가능 수량이 5개 미만이거나 품절인 경우에 대한 처리
					if (__option._stock === 0) {
						mm.element.append(mm.find('.text_info', $option), '<span class="text_stock">(품절)</span>');
						mm.class.add($option, '__option-soldout');
					}
					else if (__option._stock <= 5) mm.element.append(mm.find('.text_info', $option), mm.string.template('<span class="text_stock">(${STOCK}개)</span>', { STOCK: __option._stock }));

					// 각 옵션 요소에 옵션 id 값을 data 값으로 부여
					mm.data.get(mm.find('.btn_option', $option))._id = __option._id;
				}

				mm.element.append(mm.find('ul', $optionList), $option);

			});

		});

		selectedResize();

	})();

	// 옵션 선택
	_.forEach($element, function (__$el, __index) {

		var $selected = mm.find('.m__option-selected', __$el);
		var $search = mm.find('.m__option-search', __$el);
		var $dropdown = mm.find('.mm_dropdown', __$el);

		_.forEach($dropdown, function (__$dropdown, __dropdownIndex) {

			if (mm.is.empty(mm.data.get(__$dropdown))) return;

			// 옵션 드롭다운 change
			mm.data.get(__$dropdown).dropdown.onChange = function (__is) {

				if (__is) {
					if (mm.element.index($dropdown, this) === 0) mm.find('.btn_dropdown b', this)[0].textContent = "옵션명1";
				}
				else {
					// 옵션검색 초기화
					mm.form.value(mm.find('.textfield', $search), '');
					mm.class.remove($search, _searchOn);

					if (mm.element.index($dropdown, this) === 0 && !__$dropdown.classList.contains('__option-selected')) mm.find('.btn_dropdown b', this)[0].textContent = "옵션을 선택하세요";
				}

			}

			// 옵션 선택
			mm.delegate.on(__$el, '.btn_option', 'click', function (__e) {

				var $this = this;
				if (!mm.is.empty(mm.data.get($this))) {
					// 옵션 중복 선택시의 처리
					var _isOverwrite = false;
					_.forEach(mm.find('.m__selected-prod', $selected), function (__$selectedProd) {

						if (mm.data.get(__$selectedProd).option._id === mm.data.get($this)._id) {
							_isOverwrite = true;
							return false;
						}

					});

					if (_isOverwrite) {
						mm.bom.alert('이미 선택된 옵션입니다');
						return;
					}

				}

				if (_isDeal) {
					// 딜 상품인경우 옵션1 선택시 선택한 옵션1에 속한 옵션2를 생성합니다
					if (__dropdownIndex === 0 && mm.is.empty(mm.data.get($this))) {
						if (mm.find('.m__option-step', __$dropdown)[0]) mm.element.remove(mm.find('.m__option-step', __$dropdown));

						var _stepHtml = mm.string.template([
							'<div class="m__option-step">',
								'${CLONE}',
							'</div>'
						], { CLONE: $this.innerHTML });

						var $step = mm.element.create(_stepHtml);
						mm.element.append(__$dropdown, $step);
						mm.class.add(__$dropdown, '__option-selected');

						mm.dropdown.open(__$dropdown.nextElementSibling);

						var _optionIndex = mm.element.index(mm.find('.btn_option', __$dropdown), $this); // 옵션1의 index
						var optionSub = dataProduct[_optionIndex].options.sub;

						var $optionListSub = mm.find('.m__option-list', __$dropdown.nextElementSibling);
						mm.element.remove(mm.find('.mm_scroller', $optionListSub));
						mm.element.append($optionListSub, mm.element.create('<div class="mm_scroller"><ul></ul></div>'));

						// 옵션1에 속한 옵션2 리스트 생성
						_.forEach(optionSub, function (__optionSub) {

							var _optionHtml = mm.string.template([
								'<li>',
									'<button type="button" class="btn_option">',
										'<b>선택${INDEX}) ${OPTION}</b>',
										'<b class="text_info"><strong>${PRICE}</strong></b>',
									'</button>',
								'</li>'
							], { INDEX: dataProduct[_optionIndex]._index, OPTION: __optionSub._name, PRICE: mm.number.comma(__optionSub._price) });

							var $option = mm.element.create(_optionHtml);

							// 각 옵션 요소에 옵션 id 값을 data 값으로 부여
							mm.data.get(mm.find('.btn_option', $option))._id = __optionSub._id;

							mm.element.append(mm.find('ul', $optionListSub), $option);

							// 옵션의 구매가능 수량이 5개 미만이거나 품절인 경우에 대한 처리
							if (__optionSub._stock === 0) {
								mm.element.append(mm.find('.text_info', $option), '<span class="text_stock">(품절)</span>');
								mm.class.add($option, '__option-soldout');

								if (mm.find('[type="checkbox"]', $search)[0].checked) mm.element.hide($option);
							}
							else if (__optionSub._stock <= 5) mm.element.append(mm.find('.text_info', $option),  mm.string.template('<span class="text_stock">(${STOCK}개)</span>', { STOCK: __optionSub._stock }));

						});
					}
				}

				if (!mm.is.empty(mm.data.get($this))) mm.observer.dispatch(PROD_OPTION_SELECT, { data: { option: mm.data.get($this)._id } });

				selectedResize();

			});

		});

		// 옵션 검색
		mm.event.on(mm.find('.textfield', $search), 'keyup focusin', function (__e) {

			var $searchList = mm.find('.m__option-list.__option_searched__', __$el)[0];
			var _keyword = this.value.trim();

			if (!_keyword) {
				mm.class.remove($search, _searchOn);
				return;
			}
			else {
				if (__e.type === "focusin") {
					mm.class.add($search, _searchOn);
					return;
				}
			}

			mm.class.add($search, _searchOn);
			mm.element.remove($searchList.children);
			var $scroller = mm.element.create('<div class="mm_scroller"><ul></ul></div>')[0];

			mm.element.append($searchList, $scroller);

			var options = (_isDeal) ? dataProduct : dataProduct[0].options;

			_.forEach(options, function (__option, __optionIndex) {

				var _optionStr = __option._name;

				// 옵션 검색 키워드와 옵션명 매칭해서 매칭되면 검색결과 리스트에 옵션 생성
				if (_isDeal) {
					// 딜상품인 경우 옵션2의 값까지 포함해서 옵션검색 키워드를 매칭해야합니다
					_.forEach(__option.options.sub, function (__optionSub) {

						if (__optionSub._stock === 0) return;

						_optionStr = __option._name + '/' + __optionSub._name;

						if (new RegExp(mm.string.escape(_keyword), 'i').test(_optionStr)) {
							var _optionHtml = _optionStr.replace(new RegExp(mm.string.escape(_keyword), 'gi'), function(__text) {

								return mm.string.template('<em class="mm_text-primary">${KEYWORD}</em>', { KEYWORD: __text });

							});

							var $resultOption = mm.element.create(mm.string.template([
								'<li>',
									'<button type="button" class="btn_option">',
										'<b>선택${INDEX}) ${OPTION}</b>',
										'<b class="text_info"><strong>${PRICE}</strong></b>',
									'</button>',
								'</li>'
							], { INDEX: __option._index, OPTION: _optionHtml, PRICE: mm.number.comma(__optionSub._price) }));

							if (__optionSub._stock <= 5) mm.element.append(mm.find('.text_info', $resultOption), mm.string.template('<span class="text_stock">(${STOCK}개)</span>', { STOCK: __optionSub._stock }));

							mm.element.prepend(mm.find('.btn_option', $resultOption), '<i class="image_product"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" data-preload></i>');
							mm.element.attribute(mm.find('[data-preload]', $resultOption), { 'data-preload': { _src: __option._image }});

							mm.data.get(mm.find('.btn_option', $resultOption))._id = __optionSub._id;
							mm.element.append(mm.find('ul', $scroller), $resultOption);
						}

					});
				}
				else {
					if (__option._stock === 0) return;

					if (new RegExp(mm.string.escape(_keyword), 'i').test(_optionStr)) {
						var _optionHtml = _optionStr.replace(new RegExp(mm.string.escape(_keyword), 'gi'), function(__text) {

							return mm.string.template('<em class="mm_text-primary">${KEYWORD}</em>', { KEYWORD: __text });

						});

						var $resultOption = mm.element.create(mm.string.template([
							'<li>',
								'<button type="button" class="btn_option">',
									'<b>${OPTION}</b>',
									'<b class="text_info"><strong>${PRICE}</strong></b>',
								'</button>',
							'</li>'
						], { INDEX: __optionIndex + 1, OPTION: _optionHtml, PRICE: mm.number.comma(__option._price) }));

						if (__option._stock <= 5) mm.element.append(mm.find('.text_info', $resultOption), mm.string.template('<span class="text_stock">(${STOCK}개)</span>', { STOCK: __option._stock }));

						mm.data.get(mm.find('.btn_option', $resultOption))._id = __option._id;
						mm.element.append(mm.find('ul', $scroller), $resultOption);
					}
				}

			});

			if (mm.find('li', $scroller).length === 0) mm.element.append($searchList, '<p class="mm_text-none">검색어에 해당하는 옵션이 없습니다</p>');
			else {
				mm.element.append($searchList, $scroller);

				if (_isDeal) mm.preload.update($scroller);
			}

			selectedResize();

		});

		// 옵션 검색어 지우기
		// 검색어 input 영역에 change 이벤트를 걸어두면 검색상품을 click 했을때 1회차에는 change 이벤트밖에 실행되지 않아 클릭을 2번해야 하는 이슈가 있어 change 이벤트를 빼고, 검색어를 지우면 검색영역 클래스를 초기화 시킵니다
		mm.event.on(mm.find('.btn_text-clear', $search), 'click',function () {

			mm.class.remove($search, _searchOn);

			if (__index === 1) mm.element.remove(mm.find('.m__option-list', $search)[0].children);

		});

		// 품절제외
		mm.event.on(mm.find('.mm_form-check', $search), 'change', function () {

			var _isChecked = mm.find('[type="checkbox"]', this)[0].checked;

			if (_isChecked) mm.element.hide(mm.find('.__option-soldout', $dropdown));
			else mm.element.show(mm.find('.__option-soldout', $dropdown));

		});

		// 옵션 삭제
		mm.delegate.on($selected, '.btn_option-remove', 'click', function (__e) {

			var _removeIndex = mm.element.index(mm.find('li', this.closest('ul')), this.closest('li'));

			_.forEach($element, function (__$el) {

				mm.element.remove(mm.find('li', mm.find('.m__option-selected', __$el))[_removeIndex]);

			});

			mm.observer.dispatch(PROD_OPTION_QTY, { data: { element: null } });
			if (mm.element.index($element, __$el) === 0) mm.apply(data.onChange, $selected, [mm.data.get(this.previousElementSibling).option._id, 'remove']);

		});

		// 선택옵션 생성
		mm.observer.on($selected, PROD_OPTION_SELECT, function(__e) {

			var $el = this;
			var _optionId = __e.detail.option;

			// 옵션 체크 (.btn_option이 data값으로 가지고 있던 option id를 기준으로 dataProduct에서 해당 id값에 해당하는 옵션을 체크합니다)
			var selectOption = null; // ? :object 선택된 옵션1
			var selectOptionSub = null; // ? :object 선택된 옵션2

			if (_isDeal) {
				selectOption = dataProduct.find(function (__option) {

					return selectOptionSub = __option.options.sub.find(function (__optionSub) {

						return (__optionSub._id === _optionId);

					});

				});
			}
			else {
				selectOption = dataProduct[0].options.find(function (__optionSub) {

					return (__optionSub._id === _optionId);

				});
			}

			if (!mm.find('.mm_scroller', $el)[0]) mm.element.append($el, mm.element.create('<div class="mm_scroller"><ul></ul></div>'));
			var _optionIndex = (_isDeal) ? selectOption._index : _.findIndex(dataProduct[0].options, selectOption) + 1;
			var _textOption = (_isDeal) ? mm.string.template('${OPTION}/${OPTIONSUB}', {  OPTION: selectOption._name, OPTIONSUB: selectOptionSub._name }) : selectOption._name;
			var _optionPrice = (_isDeal) ? selectOptionSub._price : selectOption._price;

			var $option = mm.element.create(mm.string.template([
				'<li>',
					'<div class="m__selected-prod">',
						(_isDeal) ? '<p class="text_option">선택${INDEX}) ${OPTION}</p>' : '<p class="text_option">${OPTION}</p>',
						'<div class="mm_stepper" data-stepper>',
							'<div class="mm_form-text">',
								'<label>',
									'<input type="text" class="textfield text_stepper" data-text><i class="bg_text"></i>',
									'<span class="mm_ir-blind text_placeholder">수량</span>',
								'</label>',
							'</div>',
							'<button type="button" class="btn_stepper-subtract"><i class="ico_stepper-subtract"></i><b class="mm_ir-blind">수량 빼기</b></button>',
							'<button type="button" class="btn_stepper-add"><i class="ico_stepper-add"></i><b class="mm_ir-blind">수량 더하기</b></button>',
						'</div>',
						'<p class="text_price"><strong>${PRICE}</strong></p>',
					'</div>',
					'<button type="button" class="btn_option-remove"><i class="mco_option-remove"></i><b class="mm_ir-blind">삭제</b></button>',
				'</li>'
			], { INDEX: _optionIndex, OPTION: _textOption, PRICE: mm.number.comma(_optionPrice) }));

			// 최종옵션은 옵션의 가격과 id값을 data로 가지고 있으며, 가격은 옵션 수량에 따른 가격계산시 사용되고, id는 옵션 삭제시 arguments 리턴시 사용됩니다
			mm.data.get(mm.find('.m__selected-prod', $option)).option = { _price: _optionPrice, _id: _optionId };

			mm.element.append(mm.find('ul', $el), $option);

			// 스텝퍼 업데이트
			var $stepper = mm.find('[data-stepper]', $option)[0];
			mm.element.attribute($stepper, { 'data-stepper': { _max: (_isDeal) ? selectOptionSub._stock : selectOption._stock }});
			mm.stepper.update($option);

			mm.data.get($stepper, 'data-stepper').onChange = function () { mm.observer.dispatch(PROD_OPTION_QTY, { data: { element: $stepper } }); };
			mm.form.update($stepper);

			if (_isDeal) {
				// 딜상품 썸네일 추가
				mm.element.prepend($option, '<i class="image_product"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" data-preload></i>');
				mm.element.attribute(mm.find('[data-preload]', $option), { 'data-preload': { _src: selectOption._image }});
				mm.preload.update($option);

				// 옵션선택 클래스 초기화
				mm.element.remove(mm.find('.m__option-step', __$el));
				mm.class.remove(mm.find('.__option-selected', __$el), '__option-selected');

				mm.find('.btn_dropdown b', mm.find('.mm_dropdown', __$el)[0])[0].textContent = "옵션을 선택하세요";
			}

			// 검색영역 초기화
			mm.form.value(mm.find('.textfield', $search), '');
			mm.class.remove($search, _searchOn);

			mm.dropdown.close(mm.find('.mm_dropdown', __$el));
			selectedResize();

			if (mm.element.index($element, __$el) === 0) mm.apply(data.onChange, this, [_optionId, 'add']);

		});

		// 딜상품 아이프레임에서 옵션선택
		mm.observer.on(__$el, PROD_FRAME_OPTION_SELECT, function(__e) {

			var $el = this;

			// 프레임에서 선택한 옵션의 index를 기준으로 json data에서 해당 index의 옵션을 선택합니다(json의 옵션 순서와 아이프레임 옵션의 순서는 같습니다)
			if ($el.closest('.m_prodetail-body-option')) {
				mm.dropdown.open($dropdown[0]);

				var $selectItem = mm.find(mm.string.template('[data-index="${INDEX}"]', { INDEX: __e.detail._index }), $dropdown[0])[0];
				var _isSoldout = $selectItem.classList.contains('__option-soldout');
				if (!_isSoldout) mm.delay.on(function () { mm.event.dispatch(mm.find('.btn_option', $selectItem)[0], 'click') }, { _time: 0 });
			}

		});

	});

	// 옵션 수량 변경
	mm.observer.on($element, PROD_OPTION_QTY, function(__e) {

		var $el = this;
		var $target = __e.detail.element;
		var $selected = mm.find('.m__option-selected', $el);
		var $total = mm.find('.m__option-total', $el);

		var _totalPrice = 0;
		var _totalQty = 0;

		_.forEach(mm.find('.m__selected-prod', $selected), function (__$prod, __index) {

			var $stepper = mm.find('[data-stepper]', __$prod);

			if ($target) {
				// 스텝퍼 증감시 스탭퍼 요소가 $target이 되며, 해당 최종 선택 옵션의 index를 구해서
				// 다른 옵션 영역(스텝퍼 증감하지 않은 다른 옵션 영역)에도 동일하게 변경된 스텝퍼 값으로 반영합니다.
				var _targetIndex = mm.element.index(mm.find('li', $target.closest('ul')), $target.closest('li'));
				if (__index === _targetIndex) {
					var _changeValue = Number(mm.find('.text_stepper', $target)[0].value);
					var _stepperValue = Number(mm.find('.text_stepper', $stepper)[0].value);

					// stepper.change를 실행하면 수량변경이 재귀함수로 실행되기 때문에 현재 stepper의 value 와 변경할 value가 다를때만 stepper.change를 실행합니다.
					if (_stepperValue != _changeValue) mm.stepper.change($stepper[0], _changeValue);
				}
			}

			var _qty = Number(mm.find('.text_stepper', $stepper)[0].value);
			var _price = mm.data.get(__$prod).option._price * _qty;

			_totalPrice += _price;
			_totalQty += _qty;

			mm.find('.text_price > strong', __$prod)[0].textContent = mm.number.comma(_price);

		});

		// 최종 가격, 수량 적용
		mm.find('.text_price > strong', $total)[0].textContent = mm.number.comma(_totalPrice);
		mm.find('.text_qty > strong', $total)[0].textContent = mm.number.comma(_totalQty);

		// 옵션이 모두 삭제되었을때 mm_scroller를 제거합니다
		if (mm.find('.mm_scroller li', $selected).length === 0) mm.element.remove(mm.find('.mm_scroller', $selected)[0]);

	});

	// 옵션 영역이 아닌 영역을 클릭시 옵션창 닫힘
	mm.event.on(document, 'click', function (__e) {

		if (__e.target.closest('.mm_bom')) return; // 옵션 중복 선택시 mm.bom.alert 이후 옵션창이 닫히지 않도록 처리
		if (!__e.target.closest('.m__product-option')) {
			mm.dropdown.close($element);

			mm.class.remove(mm.find(mm.selector(_searchOn, '.'), $element), _searchOn);
		}

	});

};
//> 옵션선택

// 옵션 리스트 높이값 조절
function selectedResize() {

	var $option = mm.find('.m_prodetail-body-option');
	var $optionInner = mm.find('.m__option-inner', $option)[0];
	var $optionList = mm.find('.m__option-list', $option);
	var $optionSelected = mm.find('.m__option-selected', $option);

	mm.element.style(mm.find('.mm_scroller', $optionSelected), { 'max-height': (window.innerHeight - 70 - ($optionInner.offsetHeight - $optionSelected[0].offsetHeight)) + 'px' });
	mm.element.style(mm.find('.mm_scroller', $optionList), { 'max-height': (window.innerHeight - ($optionInner.offsetHeight - $optionSelected[0].offsetHeight)) + 'px' });

}

//< 레디
mm.ready(function () {

	// 품절임박 숨김
	(function (__$stock) {

		if (!__$stock) return;

		gsap.fromTo('.m_prodetail-head-stock .mco_clock', { rotate: -15 }, { rotate: 15, duration: 0.05, ease: 'linear.none', yoyo: true, yoyoEase: 'linear.none', repeat: 100 });
		gsap.to('.m_prodetail-head-stock .mco_clock', { scale: 1.4, duration: 0.4, delay: 0.5, ease: 'bounce.out', yoyo: true, repeat: 5, yoyoEase: 'back.in',
			onComplete: function () {

				gsap.to(__$stock, { autoAlpha: 0, height: 0, duration: 0.4, delay: 2, ease: 'cubic.inOut' });

			},
		});

	})(mm.find('.m_prodetail-head-stock')[0]);

	// 탭메뉴
	_.forEach(mm.find('.m_prodetail-body-tab'), function (__$tab) {

		var $header = mm.find('.mm_header')[0];
		var $scroll = mm.scroll.el;

		var _classSticky = '__tab-sticky';
		var _classStickyEnd = '__tab-stickyEnd';

		var data = mm.data.get(__$tab).tab;
		data.onChange = function() {

			mm.frameResize(mm.find('.mm_tab-item.__tab-on iframe', __$tab))
			mm.event.dispatch($scroll, 'scroll');

			if (mm.class.some(__$tab, [_classSticky, _classStickyEnd])) mm.scroll.to(__$tab, { _time: 0, _margin: $header.offsetHeight });

		};

		// 스크롤
		mm.event.on($scroll, 'load scroll', function () {

			var tabTop = mm.element.offset(__$tab).top;
			var $sideOption = mm.find('.m_prodetail-body-option');

			// 탭메뉴, 사이드옵션 영역 sticky
			if (tabTop - $header.offsetHeight - mm.element.offset($header).top < 0) {

				if (tabTop + __$tab.offsetHeight > $sideOption[0].offsetHeight + 70) {
					__$tab.classList.remove(_classStickyEnd);
					__$tab.classList.add(_classSticky);
				}
				else {
					__$tab.classList.remove(_classSticky);

					if (mm.find('.m__option-inner', $sideOption)[0].offsetHeight < __$tab.offsetHeight) {
						__$tab.classList.add(_classStickyEnd);
					}
				}
			}
			else {
				__$tab.classList.remove(_classSticky);
			}

		});

		// 탭메뉴 위치 이동 (가로 스크롤)
		var tabRectLeft = __$tab.getBoundingClientRect().left;
		var $stickied = mm.find('data-horizon', __$tab);
		mm.event.on($scroll, 'load scroll resize', function () {

			if ($stickied) {
				if (__$tab.getBoundingClientRect().left < 0) {
					mm.element.style($stickied, { 'left': mm.number.unit(-mm.scroll.offset(this).left + tabRectLeft) });
				}
				else {
					mm.element.style($stickied, { 'left': mm.number.unit(__$tab.getBoundingClientRect().left) });
				}
			}

		});

		// 상세정보 더보기
		mm.event.on(mm.find('.m__desc-frame .mm_switch'), 'click', function () {

			__$tab.classList.remove(_classStickyEnd);
			__$tab.classList.add(_classSticky);

		});

		// 상단 상품평 클릭 시 앵커이동
		mm.event.on(mm.find('.btn_review', mm.find('.m_prodetail-head-product')), 'click', function () {

			mm.find('.btn_tab-review', __$tab)[0].click();
			mm.scroll.to(__$tab, { _margin: '70' });

		});

	});

	// 사이드 옵션영역
	mm.event.on(window, 'resize', selectedResize);

	// 이미지 썸네일(썸네일 클릭 시 이미지 변경)
	_.forEach(mm.find('.m_prodetail-head-thumbnail'), function (__$thumb) {

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

});
//> 레디
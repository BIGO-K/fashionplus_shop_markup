'use strict';

/**
 * 상품상세
 * (옵션선택, 스크롤)
**/

//< 상품옵션 선택
function prodOption(__json) {

	if (!__json) return false;

	var _dataName = 'data-product';

	var data = __json;
	var dataProduct = data.product;

	var $element = mm.ui.element(_dataName);
	var $selected = mm.find('.m_prodoption-selected', $element);
	var $search = mm.find('.m_prodoption-search', $element);
	var $optionBox = mm.find('.m_prodoption-select', $element);
	var $dropdown = mm.find('.mm_dropdown', $optionBox);

	var _classOpen = '__option-open';
	var _classSelecting = '__option-selecting';

	var _isDeal = (dataProduct[0].options.sub) ? true : false; // 딜상품 여부 체크

	// 옵션1 생성
	(function () {

		var $optionList = mm.find('.m_prodoption-list', $dropdown[0])[0];

		mm.element.remove(mm.find('.mm_scroller', $optionList));
		mm.element.append($optionList, mm.element.create('<div class="mm_scroller"><ul></ul></div>'));

		var options = (_isDeal) ? dataProduct : dataProduct[0].options;
		_.forEach(options, function (__option, __index) {

			var _optionHtml = mm.string.template([
				'<li data-index="${INDEX}">',
					'<button type="button" class="btn_option">',
						(_isDeal) ? '<b>선택${INDEX})</b><b>${OPTION}</b>' : '<b>${OPTION}</b>',
						'<b class="text_info"><strong>${PRICE}</strong></b>',
					'</button>',
				'</li>'
			], { INDEX: (_isDeal) ? __option._index : __index + 1, OPTION: __option._name, PRICE: mm.number.comma(__option._price) });

			var $option = mm.element.create(_optionHtml);

			if (_isDeal) {
				// 상품 썸네일 추가
				mm.element.prepend(mm.find('.btn_option', $option), '<i class="image_product"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" data-preload></i>');
				mm.element.attribute(mm.find('[data-preload]', $option), { 'data-preload': { _src: __option._image }});

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

	})();

	// 옵션 수량/가격 계산
	function optionCalcQty() {

		var $total = mm.find('.m_prodoption-total', $element);
		var _totalPrice = 0;
		var _totalQty = 0;

		_.forEach(mm.find('li', $selected), function (__$item) {

			var $option = mm.find('.m_prodoption-selected-item', __$item);
			var $stepper = mm.find('[data-stepper]', __$item);

			var _qty = Number(mm.find('.text_stepper', $stepper)[0].value);
			var _price = mm.data.get($option).option._price * _qty;

			_totalPrice += _price;
			_totalQty += _qty;

			mm.find('.text_price > strong', __$item)[0].textContent = mm.number.comma(_price);

		});

		// 최종 가격, 수량 적용
		mm.find('.text_price > strong', $total)[0].textContent = mm.number.comma(_totalPrice);
		mm.find('.text_qty > strong', $total)[0].textContent = mm.number.comma(_totalQty);

		// 옵션이 모두 삭제되었을때 mm_scroller를 제거합니다
		if (mm.find('.mm_scroller li', $selected).length === 0) mm.element.remove(mm.find('.mm_scroller', $selected)[0]);

	};

	// 옵션패널 열기/닫기
	mm.event.on('.btn_option-toggle', 'click', function () {

		// 검색영역 초기화
		mm.form.value(mm.find('.textfield', $search), '');
		mm.class.remove($search, '__search-on');

		if ($element[0].classList.contains(_classOpen)) {
			mm.class.remove($element, _classOpen);
		}
		else {
			mm.class.add($element, _classOpen);

			mm.element.remove(mm.find('.m_prodoption-step', $element));
			mm.dropdown.close(mm.find('.mm_dropdown', $element));
		}

		if (mm.find('li', $selected).length === 0) mm.event.dispatch('.btn_option-open', 'click');

	});

	// 옵션 선택창 열기/닫기
	mm.event.on('.btn_option-open, .btn_option-close', 'click', function (__e) {

		// 검색영역 초기화
		mm.form.value(mm.find('.textfield', $search), '');
		mm.class.remove($search, '__search-on');

		if (mm.class.every(__e.target, 'btn_option-open') && !mm.find('.m_prodoption-step', $dropdown)[0]) mm.dropdown.open($dropdown[0]);
		else {
			mm.element.remove(mm.find('.m_prodoption-step', $element));
			mm.dropdown.close(mm.find('.mm_dropdown', $element));
		}

	});

	// 옵션선택
	mm.delegate.on($element, '.btn_option', 'click', function (__e) {

		var $this = this;
		var _selectOptionId = mm.data.get($this)._id; // 선택한 옵션의 id값
		var _isLast = (_selectOptionId) ? true : false; // 마지막 옵션 선택인지 체크(묶음 상품인 경우 옵션2 선택)

		// 옵션 중복 선택시의 처리
		if (_isLast) {
			var _isOverwrite = false;
			_.forEach(mm.find('.m_prodoption-selected-item', $selected), function (__$selectedProd) {

				if (mm.data.get(__$selectedProd).option._id === _selectOptionId) {
					_isOverwrite = true;
					return false;
				}

			});

			if (_isOverwrite) {
				mm.bom.alert('이미 선택된 옵션입니다');
				return;
			}
		}

		// 묶음상품인 경우 옵션2 생성
		if (_isDeal && !_isLast) {
			if (mm.find('.m_prodoption-step', $dropdown[0])[0]) mm.element.remove(mm.find('.m_prodoption-step', $dropdown[0]));

			var _stepHtml = mm.string.template([
				'<div class="m_prodoption-step">',
					'${CLONE}',
				'</div>'
			], { CLONE: $this.innerHTML });

			var $step = mm.element.create(_stepHtml);
			mm.element.append($dropdown[0], $step);
			mm.class.add($dropdown[0], '__option-selected');

			var _optionIndex = mm.element.index(mm.find('.btn_option', $dropdown[0]), $this); // 옵션1의 index
			var optionSub = dataProduct[_optionIndex].options.sub;

			var $optionListSub = mm.find('.m_prodoption-list', $dropdown[1]);
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

					if (mm.find('.check_soldout [type="checkbox"]', $element)[0].checked) mm.element.hide($option);
				}
				else if (__optionSub._stock <= 5) mm.element.append(mm.find('.text_info', $option),  mm.string.template('<span class="text_stock">(${STOCK}개)</span>', { STOCK: __optionSub._stock }));

			});

			// 옵션2 드롭다운 오픈
			mm.dropdown.open($dropdown[1]);
			mm.element.attribute(mm.find('.btn_dropdown', $dropdown[1]), { disabled: false });
			mm.element.style(mm.find('.mm_dropdown-item', $dropdown[1]), { 'top':  mm.number.unit($dropdown[1].offsetTop + $dropdown[1].offsetHeight) });

			gsap.to($element, mm.time._fast, { height: '75%' });
		}

		// 최종 선택옵션 생성
		if (_isLast) {
			var selectOption = null; // ? :object 선택된 옵션1
			var selectOptionSub = null; // ? :object 선택된 옵션2

			if (_isDeal) {
				selectOption = dataProduct.find(function (__option) {

					return selectOptionSub = __option.options.sub.find(function (__optionSub) {

						return (__optionSub._id === _selectOptionId);

					});

				});
			}
			else {
				selectOption = dataProduct[0].options.find(function (__optionSub) {

					return (__optionSub._id === _selectOptionId);

				});
			}

			if (!mm.find('.mm_scroller', $selected)[0]) mm.element.append($selected, mm.element.create('<div class="mm_scroller"><ul></ul></div>'));

			var _optionIndex = (_isDeal) ? selectOption._index : _.findIndex(dataProduct[0].options, selectOption) + 1;
			var _optionPrice = (_isDeal) ? selectOptionSub._price : selectOption._price;

			var $option = mm.element.create(mm.string.template([
				'<li>',
					'<div class="m_prodoption-selected-item">',
						(_isDeal) ? '<p>선택${INDEX})</p><p>${OPTION}</p><p class="text_option-sub">${OPTIONSUB}</p>' : '<p>${OPTION}</p>',
						'<p class="text_price"><strong>${PRICE}</strong></p>',
					'</div>',
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
					'<button type="button" class="btn_option-remove"><i class="mco_option-remove"></i><b class="mm_ir-blind">삭제</b></button>',
				'</li>',
			], { INDEX: _optionIndex, OPTION: selectOption._name, OPTIONSUB: (_isDeal) ? selectOptionSub._name : null, PRICE: mm.number.comma(_optionPrice) }));

			// 최종옵션은 옵션의 가격과 id값을 data로 가지고 있으며, 가격은 옵션 수량에 따른 가격계산시 사용되고, id는 옵션 삭제시 arguments 리턴시 사용됩니다
			mm.data.get(mm.find('.m_prodoption-selected-item', $option)).option = { _price: _optionPrice, _id: _selectOptionId };
			mm.element.append(mm.find('ul', $selected), $option);

			// 스텝퍼 업데이트
			var $stepper = mm.find('[data-stepper]', $option)[0];
			mm.element.attribute($stepper, { 'data-stepper': { _max: (_isDeal) ? selectOptionSub._stock : selectOption._stock }});
			mm.stepper.update($option);

			mm.data.get($stepper, 'data-stepper').onChange = function () { optionCalcQty() };
			mm.form.update($selected);

			if (_isDeal) {
				// 딜상품 썸네일 추가
				mm.element.prepend($option, '<i class="mm_bg-cover image_product" data-preload></i>');
				mm.element.attribute(mm.find('[data-preload]', $option), { 'data-preload': { _src: selectOption._image }});
				mm.preload.update($option);

				// 선택된 옵션명1 삭제
				mm.element.remove(mm.find('.m_prodoption-step', $dropdown[0]));
				mm.class.remove(mm.find('.__option-selected', $dropdown[0]), '__option-selected');

				mm.element.attribute(mm.find('.btn_dropdown', $dropdown[1]), { disabled: true });
			}

			// 검색영역 초기화
			mm.form.value(mm.find('.textfield', $search), '');
			mm.class.remove($search, '__search-on');

			// 드롭다운 초기화
			mm.dropdown.close($dropdown);
			mm.class.remove($element, _classSelecting);

			if ($selected[0].offsetHeight < mm.find('.mm_scroller', $selected)[0].scrollHeight) mm.class.add($selected, '__scroll-on');

			mm.apply(data.onChange, this, [_selectOptionId, 'add']);
		}

	});

	// 품절제외
	mm.event.on(mm.find('.check_soldout', $element), 'change', function () {

		var _isChecked = mm.find('[type="checkbox"]', this)[0].checked;

		if (_isChecked) mm.element.hide(mm.find('.__option-soldout', $dropdown));
		else mm.element.show(mm.find('.__option-soldout', $dropdown));

	});

	// 옵션검색(검색 키워드에 따라 옵션1과 2를 조합하여 옵션 검색 리스트 생성)
	mm.event.on(mm.find('.textfield', $search), 'keyup focusin', function (__e) {

		var _searchOn = '__search-on';
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

		var $searchList = mm.find('.m_prodoption-search-result', $search)[0];

		mm.class.add($search, _searchOn);
		mm.element.remove($searchList.children);

		var $scroller = mm.find('.mm_scroller', $searchList);
		if (!$scroller[0]) $scroller = mm.element.create('<div class="mm_scroller"><ul></ul></div>')[0];
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
									'<b>선택${INDEX})</b><b>${OPTION}</b>',
									'<b class="text_info"><strong>${PRICE}</strong></b>',
								'</button>',
							'</li>'
						], { INDEX: __option._index, OPTION: _optionHtml, PRICE: mm.number.comma(__optionSub._price) }));

						mm.element.prepend(mm.find('.btn_option', $resultOption), '<i class="mm_bg-cover image_product" data-preload></i>');
						mm.element.attribute(mm.find('[data-preload]', $resultOption), { 'data-preload': { _src: __option._image }});

						if (__optionSub._stock <= 5) mm.element.append(mm.find('.text_info', $resultOption), mm.string.template('<span class="text_stock">(${STOCK}개)</span>', { STOCK: __optionSub._stock }));

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

		if (mm.find('li', $scroller).length === 0) {
			mm.element.remove($scroller);
			mm.element.append($searchList, '<p class="mm_text-none">검색어에 해당하는 옵션이 없습니다</p>');
		}
		else {
			mm.element.append($searchList, $scroller);

			if (_isDeal) mm.preload.update($scroller);
		}

	});

	// 옵션 검색어 지우기
	// 검색어 input 영역에 change 이벤트를 걸어두면 검색상품을 click 했을때 1회차에는 change 이벤트밖에 실행되지 않아 클릭을 2번해야 하는 이슈가 있어 change 이벤트를 빼고, 검색어를 지우면 검색영역 클래스를 초기화 시킵니다
	mm.event.on(mm.find('.btn_text-clear', $search), 'click',function () {

		mm.class.remove($search, '__search-on');
		mm.element.remove(mm.find('.m_prodoption-search-result', $search)[0].children);

	});

	// 옵션 삭제
	mm.delegate.on($selected, '.btn_option-remove', 'click', function (__e) {

		var $item = this.closest('li');
		var _removeIndex = mm.element.index(mm.find('li', this.closest('ul')), $item);

		_.forEach($element, function (__$el) {

			mm.element.remove(mm.find('li', $selected)[_removeIndex]);

		});

		optionCalcQty();
		mm.apply(data.onChange, $selected, [mm.data.get(mm.find('.m_prodoption-selected-item', $item)).option._id, 'remove']);

	});

	// 스크롤시 옵션창 닫기
	mm.event.on(mm.scroll.el, 'scroll', function () {

		if (mm.class.some($element, [_classOpen, _classSelecting])) mm.class.remove($element, [_classOpen, _classSelecting]);

	});

}
//> 상품옵션 선택

//< 레디
mm.ready(function () {

	// 품절임박 숨김
	(function (__$stock) {

		if (!__$stock) return;

		gsap.fromTo('.m_prodetail-head-stock .mco_clock', { rotate: -15 }, { rotate: 15, duration: 0.05, ease: 'linear.none', yoyo: true, yoyoEase: 'linear.none', repeat: 100 });
		gsap.to('.m_prodetail-head-stock .mco_clock', { scale: 1.4, duration: 0.4, delay: 0.5, ease: 'bounce.out', yoyo: true, repeat: 5, yoyoEase: 'back.in',
			onComplete: function () {

				gsap.to(__$stock, { autoAlpha: 0, height: 0, y: '0', duration: 0.4, delay: 2, ease: 'cubic.inOut' });

			},
		});

	})(mm.find('.m_prodetail-head-stock')[0]);

	var $header = mm.find('.mm_header')[0];
	var $tab = mm.find('.m_prodetail-tab .mm_tabmenu')[0];
	var _classSticky = '__tabmenu-sticky';

	// 상품상세 탭 sticky
	function tabSticky () {

		if (mm.element.offset($tab).top < $header.offsetHeight + mm.element.position($header).top) $tab.classList.add(_classSticky);
		else $tab.classList.remove(_classSticky);

	}

	mm.event.on(mm.scroll.el, 'scroll', tabSticky);
	tabSticky();

	// 탭 전환시 해당 탭 컨텐츠의 상단으로 스크롤 이동
	mm.event.on(mm.find('.btn_tab', $tab), 'click', function (__e) {

		__e.preventDefault();

		if ($tab.classList.contains(_classSticky)) mm.scroll.to($tab, { _margin: $header.offsetHeight });

	});

});
//> 레디
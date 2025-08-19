'use strict';

//**
//** 전시관리
//**

// 이미지 링크영역 설정
function imageLinkSet(__id) {

	var $container = $('.m_display-link-area' + __id);
	var $preview = $container.find('.m__area-preview');
	var $pointerTable = $container.find('.m__area-table');
	var $previewImage = $preview.find('.image_banner');

	var _classOn = '__pointer-on';

	var _src = $('input' + __id).val();
	if (!mm.is.empty(mm.find('img', $previewImage[0])) && mm.find('img', $previewImage[0])[0].getAttribute('src') === _src) return;
	if (!_src) {
		mm.bom.alert('이미지 URL을 입력해 주세요');
		return;
	}

	var img = new Image();
	// 이미지 로드
	img.src = _src;
	img.onload = function () {

		var _classOnLoad = '__image-load';

		if ($previewImage.find('img')[0]) $previewImage.empty();
		$previewImage.addClass(_classOnLoad).append(this);

	};

	// 드래그 이벤트
	var drag = {
		update: function (__$container) {

			var $pointerGroup = $container.find('.btn_pointer');
			var $tableRowGroup = $container.find('tbody > tr');

			if (!$pointerGroup[0]) return;

			_.forEach($pointerGroup, function (__$btnPointer, __index) {

				var $btnPointer = $(__$btnPointer);
				mm.event.on($btnPointer, 'mousedown', function(__e) {

					var $this = $(this);
					var $pointerBox = $this.closest('.m__area-preview-pointer');
					var _index = $pointerBox.find('.btn_pointer').index(this);

					var _pointerX = $this.position().left;
					var _pointerY = $this.position().top;
					var _mouseStartX = __e.pageX;
					var _mouseStartY = __e.pageY;

					$pointerGroup.removeClass(_classOn);
					$this.addClass(_classOn);

					$pointerBox.find($tableRowGroup).removeClass(_classOn)
					.eq(_index).addClass(_classOn);

					drag.change($this);

					mm.event.on(document, 'mousemove', function(__e) {

						var _left = Math.max(Math.min(__e.pageX - _mouseStartX + _pointerX, $btnPointer.closest('.m__area-preview-pointer').outerWidth()), 0);
						var _top = Math.max(Math.min(__e.pageY - _mouseStartY + _pointerY, $btnPointer.closest('.m__area-preview-pointer').outerHeight()), 0);

						$this.css({ 'left': _left + 'px', 'top': _top + 'px' });
						drag.change($this);

					});

					mm.event.on(document, 'mouseup', function(__e) {

						mm.event.off(document, 'mousemove');

					}, { _isOnce: true });

				});

				// 인풋 이벤트(직접입력)
				var $tableRow = $($tableRowGroup[__index]);
				$tableRow.find('input[name*="dev_point"]').on('keyup', function(__e) {

					var $this = $(this);
					var _value = Number($this.val());

					if (_value > 100) $this.val(100);
					else if (_value < 0) $this.val(0);

					var _top = Number($tableRow.find('[name*="positionY"]').val());
					var _left = Number($tableRow.find('[name*="positionX"]').val());
					var _width = Number($tableRow.find('[name*="width"]').val());
					var _height = Number($tableRow.find('[name*="height"]').val());

					if ($this.is('[name*="positionX"]') || $this.is('[name*="positionY"]')) {
						if (_value + _width > 100) {
							_width = 100 - _value;
							$tableRow.find('[name*="width"]').val(_width);
						}
						else if (_value + _height > 100) {
							_height = 100 - _value;
							$tableRow.find('[name*="height"]').val(_height);
						}
					}

					$btnPointer.css({
						'width': _width + '%',
						'height': _height + '%',
						'top': _top + '%',
						'left': _left + '%'
					});

					if ($this.is('[name*="width"]') || $this.is('[name*="height"]')) drag.change($btnPointer);

				});

				drag.change($btnPointer);

			});
		},
		change: function (__$pointer) {

			var $btnPointer =  $(__$pointer);
			var $tableRow = $container.find('tbody > tr').eq($btnPointer.index());

			var _left = ($btnPointer.position().left / $preview.outerWidth()) * 100;
			var _top = ($btnPointer.position().top / $preview.outerHeight()) * 100;
			var _width = Number($tableRow.find('[name="dev_point-width"]').val());
			var _height = Number($tableRow.find('[name="dev_point-height"]').val());

			if (_left + _width > 100) _left = 100 - _width;
			if (_top + _height > 100) _top = 100 - _height;

			$tableRow.find('input[name="dev_point-positionX"]').val(Number(_left.toFixed(5)));
			$tableRow.find('input[name="dev_point-positionY"]').val(Number(_top.toFixed(5)));

			$btnPointer.css({ 'left': _left + '%', 'top': _top + '%' });

		}
	};

	// 링크영역 추가
	mm.event.on(mm.find('.btn_pointer-add', $pointerTable[0]), 'click', function () {

		var $container = $(this).closest('.m_display-link-area');
		var $tableList = $pointerTable.find('tbody');
		var $tableRow = $tableList.find('tr');
		var $pointGroup = $preview.find('.m__area-preview-pointer');

		if (!$container.find('.image_banner.__image-load')[0]) {
			mm.bom.alert('이미지 URL을 입력해 주세요');

			return;
		}

		var _index = $tableRow.length + 1;

		$pointGroup.find('.btn_pointer').removeClass(_classOn);
		$pointGroup.append(mm.string.template('<button type="button" class="btn_pointer __pointer-on"><b class="mm_ir-blind">링크영역</b></button>'));

		var $pointTr = $(mm.string.template([
			'<tr class="${CLASSON}">',
				'<td>',
					'<div class="mm_table-item">${INDEX}</div>',
				'</td>',
				'<td>',
					'<div class="mm_table-item">',
						'<div class="mm_form-text">',
							'<button type="button" class="btn_text-clear"><i class="ico_form-clear"></i><b class="mm_ir-blind">지우기</b></button>',
							'<label>',
								'<input type="text" class="textfield" name="dev_point-positionX"><i class="bg_text"></i>',
								'<span class="text_placeholder mm_ir-blind">X좌표</span>',
							'</label>',
						'</div>',
					'</div>',
				'</td>',
				'<td>',
					'<div class="mm_table-item">',
						'<div class="mm_form-text">',
							'<button type="button" class="btn_text-clear"><i class="ico_form-clear"></i><b class="mm_ir-blind">지우기</b></button>',
							'<label>',
								'<input type="text" class="textfield" name="dev_point-positionY"><i class="bg_text"></i>',
								'<span class="text_placeholder mm_ir-blind">Y좌표</span>',
							'</label>',
						'</div>',
					'</div>',
				'</td>',
				'<td>',
					'<div class="mm_table-item">',
						'<div class="mm_form-text">',
							'<button type="button" class="btn_text-clear"><i class="ico_form-clear"></i><b class="mm_ir-blind">지우기</b></button>',
							'<label>',
								'<input type="text" class="textfield" name="dev_point-width" value="10"><i class="bg_text"></i>',
								'<span class="text_placeholder mm_ir-blind">너비</span>',
							'</label>',
						'</div>',
					'</div>',
				'</td>',
				'<td>',
					'<div class="mm_table-item">',
						'<div class="mm_form-text">',
							'<button type="button" class="btn_text-clear"><i class="ico_form-clear"></i><b class="mm_ir-blind">지우기</b></button>',
							'<label>',
								'<input type="text" class="textfield" name="dev_point-height" value="10"><i class="bg_text"></i>',
								'<span class="text_placeholder mm_ir-blind">높이</span>',
							'</label>',
						'</div>',
					'</div>',
				'</td>',
				'<td>',
					'<div class="mm_table-item">',
						'<div class="mm_form-text">',
							'<button type="button" class="btn_text-clear"><i class="ico_form-clear"></i><b class="mm_ir-blind">지우기</b></button>',
							'<label>',
								'<input type="text" class="textfield"><i class="bg_text"></i>',
								'<span class="text_placeholder mm_ir-blind">URL</span>',
							'</label>',
						'</div>',
					'</div>',
				'</td>',
				'<td>',
					'<div class="mm_table-item">',
						'<div class="mm_btnbox">',
							'<div class="mm_inline">',
								'<button type="button" class="mm_btn btn_pointer-remove"><b>삭제</b></button>',
							'</div>',
						'</div>',
					'</div>',
				'</td>',
			'</tr>'
		], { INDEX: _index, CLASSON: _classOn }));

		if (!$pointerTable.hasClass(_classOn)) $pointerTable.addClass(_classOn);

		$container.find('tbody').append($pointTr);
		$tableList.find('tr').removeClass(_classOn)
		.eq(_index - 1).addClass(_classOn);

		drag.update($container);

	});

	// 링크영역 포인터 삭제
	$(document).on('click', '.btn_pointer-remove', function () {

		var $container = $(this).closest('.m_display-link-area');
		var $pointerTable = $container.find('.m__area-table');
		var _index = $container.find('tbody > tr').index(this.closest('tr'));

		$container.find('.btn_pointer').eq(_index).remove();
		this.closest('tr').remove();

		var $tableRow = $container.find('tbody > tr');
		if (!$tableRow[0]) $pointerTable.removeClass(_classOn);

		_.forEach($tableRow, function (__element, __index) {

			$(__element).find('td').eq(0).text(__index + 1);

		});

	});

}

//< 레디
mm.ready(function () {

	var $doc = $(document);

	//- 템플릿 작성
	if (mm._isPopup) {
		// 코너 등록 페이지 내 각 템플릿 html을 가져와서 팝업으로 오픈 합니다
		var $openerForm = opener.$('.m_display-template-form.__form-open');
		var $popupForm = $('.m_popup-template-detail');

		$popupForm[0].innerHTML = $openerForm[0].outerHTML;

		if ($openerForm.find('input')[0]) {
			_.forEach($openerForm.find('input'), function (__input, __index) {

				switch (__input.type) {
					case "text":
						$popupForm.find('input')[__index].value = __input.value;

						break;
					case "checkbox":
					case "radio":
						$popupForm.find('input')[__index].checked = __input.checked;

						break;
				}

			});
		}

		if ($openerForm.find('select')[0]) {
			_.each($openerForm.find('select'), function (__select, __index) {

				$popupForm.find('select')[__index].value = __select.value;

			});
		}

		if ($popupForm.find('[class*="_footer_hide_"]')[0]) $('.m_popup-template').find('.mm_foot').remove();

		// 적용하기 버튼 클릭 이벤트
		mm.event.on('.btn_apply', 'click', function () {

			var $form = $popupForm.find('.mm_form');
			var $popupInput = $form.find('input');
			var $popupSelect = $form.find('select');

			// 순서편집중인 경우 적용하기 동작하지 않고 return
			if (mm.find('.__list-sortable', $popupForm[0])[0]) {
				mm.bom.alert('순서편집을 완료해 주세요');
				return;
			}

			$openerForm.find('.mm_form')[0].outerHTML = $form[0].outerHTML;

			if ($popupInput[0]) {
				_.each($popupInput, function (__input, __index) {

					switch (__input.type) {
						case "text":
							$openerForm.find('input')[__index].value = __input.value;

							break;
						case "checkbox":
						case "radio":
							$openerForm.find('input')[__index].checked = __input.checked;

							break;
					}

				});
			}

			if ($popupSelect[0]) {
				_.each($popupSelect, function (__select, __index) {

					$openerForm.find('select')[__index].value = __select.value;

				});
			}

			mm.delay.on(mm.popup.close(), { _time: 500 });

		});

		mm.event.on('[data-check*="syncer"], [data-radio*="syncer"]', 'click', function () {

			mm.delay.on(function () {

				mm.popup.resize();

			}, { _time: 0 });

		});
	}
	else {
		$doc.on('click', '.btn_template-detail', function (__e) {

			var $this = $(__e.target);
			var _index = $this.closest('tr').data('index') - 1;
			var $bindForm = $('.m_display-template-form').removeClass('__form-open').eq(_index);

			if ($bindForm[0]) {
				$bindForm.addClass('__form-open');

				mm.popup.open('_popup_displayTemplate.html', { _name: 'templatePopup' });
			}

		});

		function formIndexChange() {

			var $list = $('.m_display-template').find('.mm_table-body tr');
			$list.each(function (__index, __element) {
				var $el = $(__element);
				var $form = $('.m_display-template-form');
				var _originIndex = $el.data('index') ? $el.data('index') - 1 : __index;
				var _changeIndex = __index + 1;

				$el.find('td').eq(0).find('.mm_table-item').html(_changeIndex);
				$form.eq(_originIndex).data('index', _changeIndex);
				$(__element).data('index', _originIndex + 1);
			});

		}

		// 순서편집 완료 이벤트
		$doc.on('click', '.btn_sort-complete', function (__e) {

			formIndexChange();

		});

		// 템플릿 삭제 이벤트
		$doc.on('click', '.btn_template-remove', function (__e) {

			mm.bom.confirm('템플릿을 삭제하시겠습니까?.', function (__args) {

				if (__args) {
					var $btn = $(__e.target);
					var _index = $btn.closest('tr').data('index') - 1;

					$btn.closest('tr').remove();
					$('.m_display-template-form').eq(_index).remove();

					var $list = $('.m_display-template').find('.mm_table-body tr');
					for (var _i = _index; _i <= $list.length; _i++) {
						var _dataIndex = $list.eq(_i).data('index');
						var _changeIndex = _dataIndex - 1;

						$list.eq(_i).data('index', _changeIndex);
						$('.m_display-template-form').eq(_dataIndex - _i).data('index', _changeIndex);

					}

					formIndexChange();
				}

			});

		});
	}
});

mm.load(function () {

	mm.form.update();

	mm.delay.on(function () {

		mm.popup.resize();

	}, { _time: 100 });

});

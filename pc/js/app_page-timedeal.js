'use strict';

/**
 * 타임어택
**/

// 타임어택 스와이퍼 변경
function timeSwiperChange(__isChange) {

	var data = mm.data.get(this).swiper;
	var $item = (data.Swiper === null) ? mm.find('.m_timedeal-ongoing-item', this)[0] : data.Swiper.slides[data.Swiper.activeIndex];
	var _index = (data.Swiper === null) ? 0 : data._index;

	mm.observer.dispatch('TIME_ITEM_CHANGE', { _isLocal: true, data: { $item: $item, _index: _index } });

}

(function () {

	// 타이머 동작
	var $timers = mm.find('.m_timedeal-timer');
	if ($timers.length === 0) return;

	var _classFlip = '__timer-flip';
	var _classReady = '__timer-ready';

	function setTime() {

		_.forEach($timers, function (__$timer) {

			var data = mm.data.get(__$timer, 'data-value', true);
			if (mm.is.empty(data)) return;

			var _time = data._time - window.performance.now() / 1000;
			if (_time < 1) _time = 0;

			var _isFlip = __$timer.classList.contains(_classFlip);
			var _hour = Math.min(99, Math.floor(_time / 60 / 60)).toString().padStart(2, '0');// 최대 99까지
			var _min = Math.floor(_time / 60 % 60).toString().padStart(2, '0');
			var _sec = Math.floor(_time % 60 % 60).toString().padStart(2, '0');
			var $hours = mm.find('.text_hour', __$timer);
			var $mins = mm.find('.text_min', __$timer);
			var $secs = mm.find('.text_sec', __$timer);

			// flip
			if (_isFlip) {
				var $times = [].concat(Object.values($hours), Object.values($mins), Object.values($secs));
				_.forEach(mm.string.join(_hour, _min, _sec).split(''), function (__time, __index) {

					if (__time !== $times[__index].textContent) setFlip($times[__index], __time);

				});
			}
			// text
			else {
				$hours[0].textContent = _hour;
				$mins[0].textContent = _min;
				$secs[0].textContent = _sec;
			}

			if (_time === 0) {
				var _isListDeal = false;

				var $a = __$timer.closest('a');
				if (!$a) {
					// 플립
					if (_isFlip) $a = mm.find('.mm_swiper .swiper-slide a', mm.siblings(__$timer, '.mm_swiper'))[0];
					// 딜 목록
					else {
						_isListDeal = true;
						$a = __$timer.closest('.m_timedeal-item-head').nextElementSibling;
					}

					if (!$a) return;
				}

				// 링크 종료
				if (mm.is.empty(data._id)) {
					mm.element.attribute($a, { 'href': '', 'data-href': '', 'onclick': 'mm.bom.alert(\'판매가 종료된 상품입니다.\')' });

					if (_isListDeal) {
						var $state = __$timer.previousElementSibling;
						$state.classList.add('__state-off');
						mm.find('b', $state)[0].textContent = '판매종료';
					}
				}
				// 넥스트 타임어택 링크 적용
				else {
					$a.classList.add(_classReady);
					mm.element.attribute($a, { 'tabindex': 0, 'onclick': '' });

					mm.event.off($a, 'click');
					mm.event.on($a, 'click', function (__e) {

						__e.preventDefault();
						timedealLink($a, data._id);

					});

					if (_isListDeal) {
						var $state = __$timer.previousElementSibling;
						$state.classList.add('__state-on');
						mm.find('b', $state)[0].textContent = '판매중';
					}
				}
			}

		});

	}
	setTime();

	// 플립 모션
	function setFlip(__$item, __time) {

		var $plane = mm.find('b', __$item)[0];
		gsap.fromTo($plane, { rotateX: 180, opacity: 0 }, { opacity: 1, rotateX: 100, duration: 0.1, ease: 'cubic.in',
			onComplete: function () {

				mm.find('span', __$item)[0].textContent = __time;
				mm.element.attribute($plane, { 'data-time': __time });
				gsap.to($plane, { rotateX: 0, duration: 0.3, ease: 'bounce.out' });

			},
		});

	}

	// 스와이퍼 플립 변경
	mm.observer.on(_.filter($timers, function (__$timer) { return __$timer.classList.contains(_classFlip) }), 'TIME_ITEM_CHANGE', function (__e) {

		if (!__e.detail.$item) return;

		var $item = __e.detail.$item;
		var data = mm.data.get($item, 'data-value', true);
		data._index = __e.detail._index;

		mm.element.attribute(mm.siblings($item.closest('.mm_swiper'), '.m_timedeal-timer'), { 'data-value': data });
		setTime();

	});

	// 인터벌
	setInterval(setTime, 1000);

})();
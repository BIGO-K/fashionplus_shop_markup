/* ===========================================================
 * trumbowyg.colors.js v1.2
 * Colors picker plugin for Trumbowyg
 * http://alex-d.github.com/Trumbowyg
 * ===========================================================
 * Author : Alexandre Demode (Alex-D)
 *          Twitter : @AlexandreDemode
 *          Website : alex-d.fr
 */

(function ($) {
    'use strict';

    $.extend(true, $.trumbowyg, {
        langs: {
            // jshint camelcase:false
            cs: {
                foreColor: 'Barva textu',
                backColor: 'Barva pozadí'
            },
            en: {
                foreColor: 'Text color',
                backColor: 'Background color',
                foreColorRemove: 'Remove text color',
                backColorRemove: 'Remove background color'
            },
            da: {
                foreColor: 'Tekstfarve',
                backColor: 'Baggrundsfarve'
            },
            fr: {
                foreColor: 'Couleur du texte',
                backColor: 'Couleur de fond',
                foreColorRemove: 'Supprimer la couleur du texte',
                backColorRemove: 'Supprimer la couleur de fond'
            },
            de: {
                foreColor: 'Textfarbe',
                backColor: 'Hintergrundfarbe'
            },
            nl: {
                foreColor: 'Tekstkleur',
                backColor: 'Achtergrondkleur'
            },
            sk: {
                foreColor: 'Farba textu',
                backColor: 'Farba pozadia'
            },
            zh_cn: {
                foreColor: '文字颜色',
                backColor: '背景颜色'
            },
            zh_tw: {
                foreColor: '文字顏色',
                backColor: '背景顏色'
            },
            ru: {
                foreColor: 'Цвет текста',
                backColor: 'Цвет выделения текста'
            },
            ja: {
                foreColor: '文字色',
                backColor: '背景色'
            },
            tr: {
                foreColor: 'Yazı rengi',
                backColor: 'Arkaplan rengi'
            },
            pt_br: {
                foreColor: 'Cor de fonte',
                backColor: 'Cor de fundo'
            },
            ko: {
                foreColor: '글자색',
                backColor: '배경색',
                foreColorRemove: '글자색 지우기',
                backColorRemove: '배경색 지우기'
            },
        }
    });

    // jshint camelcase:true


    function hex(x) {
        return ('0' + parseInt(x).toString(16)).slice(-2);
    }

    function colorToHex(rgb) {
        if (rgb.search('rgb') === -1) {
            return rgb.replace('#', '');
        } else if (rgb === 'rgba(0, 0, 0, 0)') {
            return 'transparent';
        } else {
            rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
            return hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
        }
    }

    function colorTagHandler(element, trumbowyg) {
        var tags = [];

        if (!element.style) {
            return tags;
        }

        // background color
        if (element.style.backgroundColor !== '') {
            var backColor = colorToHex(element.style.backgroundColor);
            if (trumbowyg.o.plugins.colors.colorList.indexOf(backColor) >= 0) {
                tags.push('backColor' + backColor);
            } else {
                tags.push('backColorFree');
            }
        }

        // text color
        var foreColor;
        if (element.style.color !== '') {
            foreColor = colorToHex(element.style.color);
        } else if (element.hasAttribute('color')) {
            foreColor = colorToHex(element.getAttribute('color'));
        }
        if (foreColor) {
            if (trumbowyg.o.plugins.colors.colorList.indexOf(foreColor) >= 0) {
                tags.push('foreColor' + foreColor);
            } else {
                tags.push('foreColorFree');
            }
        }

        return tags;
    }

    var defaultOptions = {
        colorList: [
			 'ffffff', 'ffebed', 'fbe4ec', 'f3e5f6', 'eee8f6', 'e8eaf6', 'e4f2fd', 'e1f5fe', 'dff7f9', 'e0f2f2', 'e8f6e9', 'f1f7e9', 'f9fbe6', 'fffde8', 'fef8e0', 'fff2df', 'fbe9e7', 'efebe8', 'ebeff2',
			 'f6f6f6', 'ffccd2', 'f9bbd0', 'e1bee8', 'd0c4e8', 'c5cae8', 'bbdefa', 'b3e5fc', 'b2ebf2', 'b2dfdc', 'c8e6ca', 'ddedc8', 'f0f4c2', 'fffac3', 'ffecb2', 'ffe0b2', 'ffccbb', 'd7ccc8', 'cfd8dd',
			 'dfdfdf', 'ef9998', 'f48fb1', 'cf93d9', 'b39ddb', '9ea8db', '90caf8', '81d5fa', '80deea', '80cbc4', 'a5d6a7', 'c5e1a6', 'e6ee9b', 'fff59c', 'ffe083', 'ffcc80', 'ffab91', 'bcaba4', 'b0bfc6',
			 'cbcbcb', 'e27570', 'f06292', 'b968c7', '9675ce', '7986cc', '64b5f6', '4fc2f8', '4dd0e2', '4cb6ac', '80c783', 'aed582', 'dde776', 'fff176', 'ffd54f', 'ffb64d', 'ff8a66', 'a0887e', '90a4ad',
			 'b4b4b4', 'ee5253', 'ec407a', 'aa47bc', '7e57c2', '5c6bc0', '42a5f6', '28b6f6', '25c6da', '26a59a', '66bb6a', '9ccc66', 'd4e056', 'ffee58', 'ffc928', 'ffa827', 'ff7143', '8c6e63', '78909c',
			 '949494', 'f6413a', 'ea1e63', '9c28b1', '673bb7', '3f51b5', '2196f3', '03a9f5', '00bcd5', '009788', '4bb050', '8bc24c', 'cddc39', 'ffeb3c', 'fec107', 'ff9700', 'fe5722', '795547', '607d8b',
			 '737373', 'e5383a', 'd81a60', '8e24aa', '5d35b0', '3949ab', '1d89e4', '039be6', '00acc2', '00887a', '43a047', '7db343', 'c0ca33', 'fdd734', 'ffb200', 'fb8c00', 'f5511e', '6d4d42', '546f7a',
			 '535353', 'd32e34', 'c2175b', '7a1fa2', '512da7', '303e9f', '1976d3', '0288d1', '0098a6', '00796a', '398e3d', '689f39', 'b0b42b', 'fac02e', 'ff9f00', 'f67c01', 'e64a19', '5d4038', '465a65',
			 '2c2c2c', 'c4282c', 'ad1457', '6a1b9a', '45289f', '283593', '1564c0', '0277bd', '00828f', '00695b', '2f7d32', '548b2e', '9e9e24', 'f9a825', 'ff8e01', 'ef6c00', 'd64316', '4d342f', '36474f',
			 '000000', 'b61c1c', '890e4f', '4a148c', '301b92', '1a237e', '0e47a1', '00579c', '016064', '004c3f', '1c5e20', '33691e', '817716', 'f47f16', 'ff6f00', 'e65100', 'bf360c', '3e2622', '273238',
        ],
        foreColorList: null, // fallbacks on colorList
        backColorList: null, // fallbacks on colorList
        allowCustomForeColor: true,
        allowCustomBackColor: true,
        displayAsList: false,
    };

    // Add all colors in two dropdowns
    $.extend(true, $.trumbowyg, {
        plugins: {
            color: {
                init: function (trumbowyg) {
                    trumbowyg.o.plugins.colors = trumbowyg.o.plugins.colors || defaultOptions;
                    var dropdownClass = trumbowyg.o.plugins.colors.displayAsList ? trumbowyg.o.prefix + 'dropdown--color-list' : '';

                    var foreColorBtnDef = {
                        dropdown: buildDropdown('foreColor', trumbowyg),
                        dropdownClass: dropdownClass,
                    },
                    backColorBtnDef = {
                        dropdown: buildDropdown('backColor', trumbowyg),
                        dropdownClass: dropdownClass,
                    };

                    trumbowyg.addBtnDef('foreColor', foreColorBtnDef);
                    trumbowyg.addBtnDef('backColor', backColorBtnDef);
                },
                tagHandler: colorTagHandler
            }
        }
    });

    function buildDropdown(fn, trumbowyg) {
        var dropdown = [],
            trumbowygColorOptions = trumbowyg.o.plugins.colors,
            colorList = trumbowygColorOptions[fn + 'List'] || trumbowygColorOptions.colorList;

        $.each(colorList, function (i, color) {
            var btn = fn + color,
                btnDef = {
                    fn: fn,
                    forceCss: true,
                    hasIcon: false,
                    text: trumbowyg.lang['#' + color] || ('#' + color),
                    param: '#' + color,
                    style: 'background-color: #' + color + ';'
                };

            if (trumbowygColorOptions.displayAsList && fn === 'foreColor') {
                btnDef.style = 'color: #' + color + ' !important;';
            }

            trumbowyg.addBtnDef(btn, btnDef);
            dropdown.push(btn);
        });

        // Remove color
        var removeColorButtonName = fn + 'Remove',
            removeColorBtnDef = {
                fn: 'removeFormat',
                hasIcon: false,
                param: fn,
                style: 'background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAG0lEQVQIW2NkQAAfEJMRmwBYhoGBYQtMBYoAADziAp0jtJTgAAAAAElFTkSuQmCC);'
            };

        if (trumbowygColorOptions.displayAsList) {
            removeColorBtnDef.style = '';
        }

        trumbowyg.addBtnDef(removeColorButtonName, removeColorBtnDef);
        dropdown.push(removeColorButtonName);

        // Custom color
        if (trumbowygColorOptions['allowCustom' + fn.charAt(0).toUpperCase() + fn.substr(1)]) {
            // add free color btn
            var freeColorButtonName = fn + 'Free',
                freeColorBtnDef = {
                    fn: function () {
                        trumbowyg.openModalInsert(trumbowyg.lang[fn],
                            {
                                color: {
                                    label: fn,
                                    forceCss: true,
                                    type: 'color',
                                    value: '#FFFFFF'
                                }
                            },
                            // callback
                            function (values) {
                                trumbowyg.execCmd(fn, values.color);
                                return true;
                            }
                        );
                    },
                    hasIcon: false,
                    text: '#',
                    // style adjust for displaying the text
                    style: 'text-indent: 0; line-height: 20px; padding: 0 5px;'
                };

            trumbowyg.addBtnDef(freeColorButtonName, freeColorBtnDef);
            dropdown.push(freeColorButtonName);
        }

        return dropdown;
    }
})(jQuery);

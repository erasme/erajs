
Core.Object.extend('Ui.Styles', {}, {}, {

	"default": {
		"Ui.Label": {
			fontSize: 16,
			color: '#000000'
		},
		"Ui.Button": {
			padding: 10,
			spacing: 5,
			color: '#e4e4e4',
			focusColor: '#f6caa2',
			activeForeground: '#dc6c36'
		},
		"Ui.ActionButton": {
			padding: 10,
			spacing: 5,
			color: '#e4e4e4',
			focusColor: '#f6caa2',
			borderWidth: 0,
			radius: 0,
			background: 'rgba(255,255,255,0)',
			activeForeground: '#dc6c36'
		},
		"Ui.ContextBarCloseButton": {
			borderWidth: 0,
			radius: 0
		},
		"Ui.DialogCloseButton": {
			background: 'rgba(240,240,240,0)',
			backgroundBorder: 'rgba(240,240,240,0)',
			showText: false
		},
		"Ui.SegmentBar": {
			spacing: 8
		},
		"Ui.Locator": {
			spacing: 10,
			color: '#e4e4e4',
			focusColor: '#f6caa2'
		},
		"Ui.ScrollingArea": {
			color: '#999999',
			showScrollbar: false,
			overScroll: true,
			radius: 0
		},
		"Ui.LinkButton": {
			background: '#a4f4f4'
		},
		"Ui.DownloadButton": {
			background: '#a4f4a4'
		},
		"Ui.UploadButton": {
			spacing: 8,
			color: '#f4a4a4',
			focusColor: '#f6caa2'
		},
		"Ui.Separator": {
			color: '#000000'
		},
		"Ui.MenuPopup": {
			"Ui.Button": {
				backgroundBorder: 'rgba(240,240,240,0)',
				background: 'rgba(240,240,240,0)'
			}
		},
		"Ui.Popup": {
			"Ui.ActionButton": {
				showText: false
			}
		}
	}
});

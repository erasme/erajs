
Core.Object.extend('Ui.Styles', {}, {}, {

	"default": {
		"Ui.Label": {
			fontSize: 16,
			color: '#000000'
		},
		"Ui.Button": {
			spacing: 8,
			color: '#e4e4e4',
			focusColor: '#f6caa2'
		},
		"Ui.ToggleButton": {
			spacing: 8,
			color: '#e4e4e4',
			focusColor: '#f6caa2',
			toggleColor: '#dc6c36'
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
			spacing: 8,
			color: '#a4f4f4',
			focusColor: '#f6caa2'
		},
		"Ui.DownloadButton": {
			spacing: 8,
			color: '#a4f4a4',
			focusColor: '#f6caa2'
		},
		"Ui.UploadButton": {
			spacing: 8,
			color: '#f4a4a4',
			focusColor: '#f6caa2'
		},
		"Ui.Separator": {
			color: '#000000'
		},
		"Ui.VirtualKeyboardKey": {
			radius: 3,
			color: new Ui.Color({ r: 0.9, g: 0.9, b: 0.9 }),
			focusColor: new Ui.Color({ r: 0.9, g: 0.9, b: 0.9 })
		}
	}
});

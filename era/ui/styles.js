
Core.Object.extend('Ui.Styles', {}, {}, {

	"default": {
		"Ui.Label": {
			fontSize: 16,
			color: '#000000'
		},
		"Ui.Button": {
			color: '#4fa8ff',
			focusColor: '#f6caa2'
		},
		"Ui.DownloadButton": {
			color: new Ui.Color({ r: 0.21, g: 0.9, b: 0.56 }),
			focusColor: '#f6caa2'
		},
		"Ui.Separator": {
			color: '#000000'
		},
		"Ui.ToolBar": {
			"Ui.Label": {
				fontSize: 16,
				color: '#ffffff'
			},
			"Ui.Button": {
				color: '#f4f4f4'
			},
			"Ui.ToggleButton": {
				color: '#f4f4f4'
			},
			"Ui.TextButtonField": {
				color: '#f4f4f4'
			},
			"Ui.ScrollingArea": {
				color: '#f4f4f4'
			}
		},
		"Ui.Popup": {
			color: new Ui.Color({ r: 0.1, g: 0.15, b: 0.2 }),
			shadowColor: new Ui.Color({ r: 0, g: 0, b: 0, a: 0.5 }),

			"Ui.Label": {
				color: '#ffffff'
			},
			"Ui.Text": {
				color: '#ffffff'
			},
			"Ui.Separator": {
				color: '#ffffff'
			},
			"Ui.MonthCalendar": {
				color: '#ffffff',
				dayColor: new Ui.Color({ r: 0.31, g: 0.66, b: 1, a: 0.3 }),
				currentDayColor: new Ui.Color({ r: 1, g: 0.31, b: 0.66, a: 0.5 })
			}
		},
		"Ui.MenuDialog": {
			"Ui.Separator": {
				color: '#666666'
			}
		},
		"Ui.VirtualKeyboardKey": {
			radius: 8,
			color: new Ui.Color({ r: 0.9, g: 0.9, b: 0.9 }),
			focusColor: new Ui.Color({ r: 0.9, g: 0.9, b: 0.9 })
		}
	}
});

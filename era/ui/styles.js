
Core.Object.extend('Ui.Styles', {}, {}, {

	"default": {
		"Ui.Label": {
			fontSize: 16,
			color: new Ui.Color({ r: 0, g: 0,  b: 0 })
		},
		"Ui.Button": {
			color: new Ui.Color({ r: 0.31, g: 0.66, b: 1 }),
			focusColor: Ui.Color.create('#f6caa2')
		},
		"Ui.DownloadButton": {
			color: new Ui.Color({ r: 0.21, g: 0.9, b: 0.56 }),
			focusColor: Ui.Color.create('#f6caa2')
		},
		"Ui.Separator": {
			color: new Ui.Color({ r: 0, g: 0,  b: 0 })
		},
		"Ui.ToolBar": {
			"Ui.Label": {
				fontSize: 16,
				color: new Ui.Color({ r: 1, g: 1,  b: 1 })
			},
			"Ui.Button": {
				color: new Ui.Color({ r: 0.96, g: 0.96, b: 0.96 })
			},
			"Ui.ToggleButton": {
				color: new Ui.Color({ r: 0.96, g: 0.96, b: 0.96 })
			},
			"Ui.TextButtonField": {
				color: new Ui.Color({ r: 0.96, g: 0.96, b: 0.96 })
			},
			"Ui.ScrollingArea": {
				color: new Ui.Color({ r: 0.96, g: 0.96, b: 0.96 })
			}
		},
		"Ui.Popup": {
			color: new Ui.Color({ r: 0.1, g: 0.15, b: 0.2 }),
			shadowColor: new Ui.Color({ r: 0, g: 0, b: 0, a: 0.5 }),

			"Ui.Label": {
				color: new Ui.Color({ r: 1, g: 1,  b: 1 })
			},
			"Ui.Separator": {
				color: new Ui.Color({ r: 1, g: 1,  b: 1 })
			},
			"Ui.MonthCalendar": {
				color: new Ui.Color({ r: 1, g: 1, b: 1 }),
				dayColor: new Ui.Color({ r: 0.31, g: 0.66, b: 1, a: 0.3 }),
				currentDayColor: new Ui.Color({ r: 1, g: 0.31, b: 0.66, a: 0.5 })
			}
		},
		"Ui.MenuDialog": {
			"Ui.Separator": {
				color: new Ui.Color({ r: 0.4, g: 0.4, b: 0.4 })
			}
		}
	}
});


Ui.Shape.extend('Ui.Icon', 
/**@lends Ui.Icon#*/
{
	/**
     * @constructs
	 * @class Predetermined Icon Shape which can be used to replace applicatives images.
     * @extends Ui.Shape
	 */
	constructor: function(config) {
		this.setWidth(24);
		this.setHeight(24);
	},

	setIcon: function(icon) {
		this.setPath(Ui.Icon.icons[icon]);
	}
}, 
/**@lends Ui.Icon# */ 
{
	arrangeCore: function(width, height) {
		Ui.Icon.base.arrangeCore.call(this, width, height);
		var scale = Math.min(width, height) / 48;
		this.setScale(scale);
	}
}, 
/**@lends Ui.Icon# */ 
{

	/**
	List of all the registered Icons which can be accessible by their names
	'check', 'home', 'search', 'close', 'arrowleft', 'arrowright', 'arrowtop', 'arrowbottom', 'refresh', 'deny', 'warning', 'trash', 'new', 'star', 'exit', 'loading', 'edit', 'upload', 'lock', 'savecloud', 'calendar', 'phone'
	*/
	icons: {},

	constructor: function() {
		this.register('check', 'm 9.1916229,24 7.0000001,-7 7,7 14,-14 7,7 -21,21 z');
		this.register('home', 'M 25.78125 8.4375 C 25.324787 8.4375 24.892151 8.63045 24.53125 8.96875 C 24.53125 8.96875 6.032579 23.87715 5.6875 24.21875 C 4.081261 25.55365 4.524131 25.86215 4.96875 26.46875 C 7.1319435 26.472745 6.9387918 26.465628 8.875 26.46875 L 8.875 38.40625 C 8.875 40.46895 10.593558 42.1875 12.65625 42.1875 L 37.3125 42.1875 C 39.375192 42.1875 41.09375 40.46895 41.09375 38.40625 L 41.09375 26.5 C 42.834133 26.49218 44.96875 26.46875 44.96875 26.46875 C 45.304525 25.79985 45.215875 24.96585 44.65625 24.40625 L 39.96875 20.3125 C 40.040347 20.078087 40.09375 19.817094 40.09375 19.5625 L 40.09375 11.875 C 40.09375 10.4883 38.949133 9.34375 37.5625 9.34375 L 33.25 9.34375 C 31.863368 9.34375 30.71875 10.4883 30.71875 11.875 L 30.71875 12.1875 L 27.03125 8.96875 C 26.681485 8.61895 26.237713 8.4375 25.78125 8.4375 z M 33.71875 12.34375 L 37.09375 12.34375 L 37.09375 17.78125 L 33.71875 14.8125 L 33.71875 12.34375 z M 12.875 26.46875 C 23.518938 26.483067 32.947599 26.505366 37.09375 26.5 L 37.09375 38.1875 L 12.875 38.1875 L 12.875 26.46875 z');
		this.register('search', 'M 16.5625 2.78125 C 9.268416 2.78125 3.3125 8.73725 3.3125 16.03125 C 3.3125 23.32535 9.268416 29.28125 16.5625 29.28125 C 19.232656 29.28125 21.727527 28.494751 23.8125 27.125 L 26.53125 29.84375 C 26.040794 31.243763 26.345911 32.877161 27.46875 34 L 36.96875 43.5 C 38.531721 45.062971 41.062029 45.062971 42.625 43.5 L 44.3125 41.8125 C 45.875471 40.249529 45.875471 37.750471 44.3125 36.1875 L 34.78125 26.65625 C 33.730308 25.605308 32.270922 25.293885 30.9375 25.65625 L 28 22.71875 C 29.155313 20.754051 29.8125 18.465809 29.8125 16.03125 C 29.8125 8.73725 23.856584 2.78125 16.5625 2.78125 z M 16.5625 6.78125 C 21.694823 6.78125 25.8125 10.89895 25.8125 16.03125 C 25.8125 21.16365 21.694823 25.28125 16.5625 25.28125 C 11.430177 25.28125 7.3125 21.16365 7.3125 16.03125 C 7.3125 10.89895 11.430177 6.78125 16.5625 6.78125 z');
		this.register('close', 'm 9,4 -5,5 15,15 -15,15 5,5 15,-15 15,15 5,-5 -15,-15 15,-15 -5,-5 -15,15 -15,-15 z');
		this.register('arrowleft', 'm 30,4 5,5 -15,15 15,15 -5,5 -20,-20 z');
		this.register('arrowright', 'm 18,4 -5,5 15,15 -15,15 5,5 20,-20 z');
		this.register('arrowtop', 'm 44,31 -5,5 -15,-15 -15,15 -5,-5 20,-20 z');
		this.register('arrowbottom', 'm 4,16 5,-5 15,15 15,-15 5,5 -20,20 z');
		this.register('refresh', 'M 23.9375 8.65625 C 18.315047 8.5110846 12.782031 11.461344 9.78125 16.8125 C 5.4164779 24.596 8.033743 34.59995 15.59375 39.09375 C 23.153757 43.58765 32.885228 40.9086 37.25 33.125 L 33.3125 30.78125 C 30.176679 36.37325 23.306402 38.25985 17.875 35.03125 C 12.443598 31.80275 10.582928 24.7169 13.71875 19.125 C 16.854571 13.533 23.724848 11.6464 29.15625 14.875 C 31.524806 16.282891 33.334721 18.493178 34.21875 21.125 L 25.9375 18.5 L 24.78125 22.125 L 39.25 26.6875 L 43.8125 12.21875 L 40.1875 11.0625 L 37.9375 18.21875 C 36.578889 15.137923 34.328741 12.531134 31.4375 10.8125 C 29.074997 9.4081875 26.493161 8.7222343 23.9375 8.65625 z M 36.84375 21.78125 L 36.78125 21.9375 L 36.5 21.84375 L 36.84375 21.78125 z');
		this.register('deny', 'M 24.375 4.5625 C 13.844791 4.5625 5.3125 13.094791 5.3125 23.625 C 5.3125 34.155209 13.844791 42.6875 24.375 42.6875 C 34.905209 42.6875 43.4375 34.155209 43.4375 23.625 C 43.4375 13.094791 34.905209 4.5625 24.375 4.5625 z M 12.875 20.46875 L 36.375 20.46875 L 36.375 27.8125 L 12.875 27.8125 L 12.875 20.46875 z');
		this.register('warning', 'M 24.71875 4.4375 C 23.303716 4.4375 21.840759 5.2267 20.8125 6.9375 L 4.21875 34.59375 C 2.3252709 37.74415 3.3675561 42.27165 7.125 42.28125 L 42.34375 42.375 C 46.101193 42.385 45.807964 37.35645 44 34.15625 L 28.625 6.9375 C 27.64318 5.1996 26.133784 4.4375 24.71875 4.4375 z M 22.15625 13.25 L 27.46875 13.25 L 27.46875 20.125 C 27.46874 22.170821 27.369577 24.007046 27.15625 25.6875 C 26.942909 27.343595 26.663738 29.000155 26.34375 30.65625 L 23.25 30.65625 C 22.929998 29.000155 22.682075 27.343595 22.46875 25.6875 C 22.255413 24.007046 22.156245 22.170821 22.15625 20.125 L 22.15625 13.25 z M 24.8125 32.96875 C 26.596301 32.96875 28.03125 34.403699 28.03125 36.1875 C 28.03125 37.971301 26.596301 39.40625 24.8125 39.40625 C 23.028699 39.40625 21.59375 37.971301 21.59375 36.1875 C 21.59375 34.403699 23.028699 32.96875 24.8125 32.96875 z');
		this.register('trash', 'm 22.83704,5 c -2.219688,0 -4.069448,1.8498 -4.069448,4.0695 l 0,0.7683 -10.3016789,0 c -2.4744975,0 -4.5247706,2.0503 -4.5247706,4.5248 l 0,1.1383 c 0,2.4745 2.0502731,4.5248 4.5247706,4.5248 l 1.1098496,0 0,18.3552 c 0,2.5298 2.2334483,4.6101 4.9231783,4.6101 l 18.042167,0 c 2.68973,0 4.923178,-2.0803 4.923178,-4.6101 l 0,-18.3552 2.162783,0 c 2.474498,0 4.524771,-2.0503 4.524771,-4.5248 l 0,-1.1383 c 0,-2.4745 -2.050273,-4.5248 -4.524771,-4.5248 l -9.504864,0 0,-0.7683 c 0,-2.2197 -1.849759,-4.0695 -4.069447,-4.0695 l -3.215718,0 z m 0.512238,2.8743 1.96358,0 c 1.045729,0 1.906664,0.8325 1.906664,1.8782 l 0,3.6995 c 3.933365,0.01 7.770635,0.028 12.407547,0.028 0.519514,0 0.882188,0.3627 0.882188,0.8822 l 0,1.1383 c 0,0.5196 -0.362674,0.8822 -0.882188,0.8822 -2.402264,0.1282 -4.712702,0.1729 -5.037008,0.2846 l 0,21.0586 c 0,1.5373 -1.22319,2.7889 -2.760395,2.7889 l -16.53391,0 c -1.537205,0 -2.782608,-1.2516 -2.788852,-2.7889 l -0.08537,-21.2294 c -3.1146968,-0.069 -0.416025,0.056 -3.9556179,-0.1138 -0.5195134,0 -0.882188,-0.3626 -0.882188,-0.8822 l 0,-1.1383 c 0,-0.5195 0.3626746,-0.8822 0.882188,-0.8822 5.0671389,-0.025 9.0192139,-0.032 13.0051589,-0.028 l 0,-3.6995 c 0,-1.0457 0.832477,-1.8782 1.878206,-1.8782 z m -5.890739,14.1434 c -0.573322,0 -1.024476,0.4796 -1.024476,1.053 l 0,13.3751 c 0,0.5733 0.451154,1.0245 1.024476,1.0245 l 0.825273,0 c 0.573322,0 1.052934,-0.4512 1.052934,-1.0245 l 0,-13.3751 c 0,-0.5734 -0.479612,-1.053 -1.052934,-1.053 l -0.825273,0 z m 5.463874,0 c -0.573322,0 -1.024476,0.4796 -1.024476,1.053 l 0,13.3751 c 0,0.5733 0.451154,1.0245 1.024476,1.0245 l 0.825273,0 c 0.573321,0 1.052934,-0.4512 1.052934,-1.0245 l 0,-13.3751 c 0,-0.5734 -0.479613,-1.053 -1.052934,-1.053 l -0.825273,0 z m 5.463874,0 c -0.573322,0 -1.024476,0.4796 -1.024476,1.053 l 0,13.3751 c 0,0.5733 0.451154,1.0245 1.024476,1.0245 l 0.825273,0 c 0.573321,0 1.052934,-0.4512 1.052934,-1.0245 l 0,-13.3751 c 0,-0.5734 -0.479613,-1.053 -1.052934,-1.053 l -0.825273,0 z');
		this.register('new', 'M 10.15625 5.65625 L 10.15625 9.65625 L 6.15625 9.65625 L 6.15625 13.65625 L 10.15625 13.65625 L 10.15625 17.65625 L 14.15625 17.65625 L 14.15625 13.65625 L 18.15625 13.65625 L 18.15625 9.65625 L 14.15625 9.65625 L 14.15625 5.65625 L 10.15625 5.65625 z M 22.15625 9.65625 L 22.15625 13.65625 L 35.28125 13.65625 C 35.991645 13.65625 36.5 14.1645 36.5 14.875 L 36.5 36.28125 C 36.5 36.99165 35.991645 37.5 35.28125 37.5 L 15.375 37.5 C 14.664605 37.5 14.15625 36.99165 14.15625 36.28125 L 14.15625 21.78125 L 10.15625 21.78125 L 10.15625 36.28125 C 10.15625 39.13855 12.517793 41.5 15.375 41.5 L 35.28125 41.5 C 38.138457 41.5 40.5 39.13855 40.5 36.28125 L 40.5 14.875 C 40.5 12.0177 38.138457 9.65625 35.28125 9.65625 L 22.15625 9.65625 z');
		this.register('star', 'm 23.757651,5 c -0.895163,0.015 -1.74266,0.4185 -2.31531,0.9115 -0.572649,0.493 -0.946681,1.0773 -1.269993,1.663 -0.646625,1.1715 -1.083333,2.481 -1.483178,3.7912 -0.399846,1.3103 -0.765223,2.611 -1.141013,3.6092 -0.375791,0.9982 -0.863354,1.6089 -0.826872,1.5814 0.03648,-0.027 -0.685072,0.2726 -1.748242,0.3583 -1.06317,0.086 -2.414188,0.078 -3.783891,0.1006 -1.3697035,0.023 -2.7488538,0.081 -4.0533165,0.3792 -0.6522312,0.1491 -1.3169807,0.3473 -1.9488982,0.7617 -0.6319175,0.4143 -1.2532513,1.1176 -1.515172,1.9737 -0.2619206,0.8562 -0.1215574,1.7731 0.1703706,2.47 0.2919279,0.697 0.7110554,1.2299 1.168227,1.7184 0.9143429,0.977 2.0261479,1.7874 3.1486997,2.5726 1.1225519,0.7851 2.2542114,1.524 3.0874544,2.1899 0.833242,0.6658 1.270874,1.3422 1.256012,1.299 -0.01486,-0.043 0.0533,0.7481 -0.193748,1.7857 -0.247047,1.0376 -0.682895,2.3074 -1.084578,3.6171 -0.401682,1.3097 -0.782999,2.6265 -0.902518,3.9592 -0.05976,0.6664 -0.06144,1.3623 0.137342,2.0913 0.198782,0.729 0.677406,1.5266 1.410693,2.0402 0.733287,0.5137 1.633944,0.686 2.387015,0.6237 0.753071,-0.062 1.403865,-0.2966 2.009725,-0.5804 1.21172,-0.5677 2.294997,-1.3744 3.388618,-2.1994 1.093621,-0.825 2.163213,-1.6885 3.053976,-2.2752 0.890762,-0.5867 1.655952,-0.8101 1.610285,-0.8093 -0.04567,8e-4 0.735345,0.2228 1.645831,0.7784 0.910486,0.5555 2.002164,1.3506 3.123614,2.1374 1.121449,0.7867 2.247516,1.5467 3.478111,2.0722 0.615298,0.2627 1.273355,0.4794 2.028127,0.5156 0.754772,0.036 1.657048,-0.1634 2.372165,-0.7021 0.715116,-0.5387 1.156065,-1.3508 1.329561,-2.0863 0.173495,-0.7354 0.146882,-1.4277 0.06415,-2.0916 -0.165459,-1.3279 -0.585097,-2.6199 -1.031754,-3.915 -0.446657,-1.295 -0.909557,-2.5637 -1.192279,-3.5922 -0.282722,-1.0284 -0.280534,-1.8404 -0.293896,-1.7967 -0.01336,0.044 0.412582,-0.6301 1.22234,-1.3244 0.809758,-0.6942 1.934952,-1.4839 3.029729,-2.3074 1.094777,-0.8234 2.169097,-1.642 3.049166,-2.6499 0.440034,-0.504 0.844908,-1.0649 1.112601,-1.7715 0.267692,-0.7066 0.350663,-1.6199 0.05934,-2.4664 -0.291321,-0.8466 -0.925793,-1.5268 -1.571637,-1.919 -0.645845,-0.3923 -1.315122,-0.5827 -1.972111,-0.7092 -1.313979,-0.253 -2.684905,-0.2499 -4.054575,-0.2253 -1.36967,0.025 -2.710455,0.093 -3.775949,0.044 -1.065494,-0.049 -1.807185,-0.3328 -1.769776,-0.3066 0.03741,0.026 -0.491907,-0.5811 -0.901934,-1.5658 -0.410028,-0.9846 -0.807845,-2.2763 -1.252686,-3.5719 -0.444841,-1.2957 -0.916948,-2.588 -1.603632,-3.7364 -0.343341,-0.5743 -0.739843,-1.1242 -1.329171,-1.5972 -0.589329,-0.4729 -1.431866,-0.8609 -2.327028,-0.8454 z m 0.04936,4.3522 c 0.05431,0.074 0.08677,0.06 0.149451,0.1649 0.375374,0.6278 0.800845,1.7333 1.223209,2.9635 0.422363,1.2302 0.846512,2.5796 1.362005,3.8175 0.515492,1.2379 1.017518,2.4514 2.291932,3.3441 1.274414,0.8927 2.575612,0.9499 3.915164,1.0114 1.339553,0.062 2.761636,-0.01 4.062098,-0.033 1.300462,-0.023 2.481817,0.024 3.2001,0.1626 0.109478,0.021 0.11064,0.032 0.193553,0.056 -0.05034,0.069 -0.03632,0.075 -0.10848,0.1574 -0.481088,0.551 -1.414422,1.3188 -2.453881,2.1007 -1.039458,0.7818 -2.180578,1.6122 -3.198616,2.485 -1.018038,0.8728 -2.008492,1.7049 -2.463696,3.1928 -0.455204,1.4879 -0.117336,2.7405 0.238105,4.0335 0.355441,1.293 0.845322,2.6325 1.269409,3.8621 0.424088,1.2295 0.770322,2.3592 0.860769,3.0851 0.01369,0.1099 -0.0028,0.1157 4.2e-4,0.2015 -0.08154,-0.027 -0.09172,-0.013 -0.193553,-0.056 -0.672702,-0.2873 -1.662942,-0.9319 -2.727726,-1.6789 -1.064785,-0.7469 -2.217014,-1.5875 -3.361689,-2.286 -1.144675,-0.6985 -2.25533,-1.3689 -3.811076,-1.3421 -1.555745,0.027 -2.628887,0.7492 -3.748765,1.4868 -1.119878,0.7376 -2.232995,1.6052 -3.271356,2.3885 -1.038361,0.7833 -2.033963,1.4685 -2.696346,1.7788 -0.09936,0.046 -0.101178,0.031 -0.18122,0.061 1.62e-4,-0.086 -0.01038,-0.09 -4.2e-4,-0.2015 0.06534,-0.7285 0.345562,-1.8772 0.726948,-3.1207 0.381386,-1.2435 0.841916,-2.5908 1.152507,-3.8953 0.310591,-1.3045 0.61475,-2.5709 0.10845,-4.0422 -0.5063,-1.4713 -1.534069,-2.2887 -2.581632,-3.1259 -1.047564,-0.8371 -2.227509,-1.6172 -3.29334,-2.3627 -1.0658309,-0.7455 -2.0109424,-1.4596 -2.5107659,-1.9936 -0.083457,-0.089 -0.06133,-0.1166 -0.1172617,-0.1892 0.080022,-0.026 0.076516,-0.037 0.18122,-0.061 0.7130816,-0.163 1.9269849,-0.2149 3.2274786,-0.2365 1.300494,-0.022 2.709163,-0.014 4.045793,-0.1212 1.336631,-0.1077 2.631554,-0.2164 3.874389,-1.1526 1.242836,-0.9362 1.70468,-2.1508 2.177128,-3.4058 0.472448,-1.255 0.853548,-2.6111 1.233189,-3.8552 0.379642,-1.244 0.76455,-2.3964 1.118026,-3.0368 0.0519,-0.094 0.06183,-0.087 0.10848,-0.1574 z');
		this.register('exit', 'm 20.089945,9 0,21.7148 -1.697743,0 -2.29084,3.9589 0,1.3567 3.988583,0 0,6.4425 24.398557,0 -0.04449,-18.0228 -6.22011,0 -3.143419,-3.1434 -2.86911,4.9672 7.517512,13.026 -2.921005,0 -6.479593,-11.2319 -1.186195,0 -1.779294,6.6502 -9.756458,0 1.623605,-2.8024 5.819772,0 1.386367,-5.1896 3.640137,-6.2943 -4.574267,0 -1.586536,2.7505 -1.749639,-1.0157 2.483597,-4.2999 10.171627,0 3.721689,3.7291 5.849424,0 0.04449,0.01 -0.02966,-12.6033 -24.317006,0 z m 15.123992,1.6903 c 1.497414,0 2.70601,1.216 2.70601,2.7134 0,1.4974 -1.208596,2.7134 -2.70601,2.7134 -1.497413,0 -2.713422,-1.216 -2.713422,-2.7134 0,-1.4974 1.216009,-2.7134 2.713422,-2.7134 z m -25.7256143,6.0051 0,4.7967 -6.4721792,0.1186 0,5.0265 6.3535598,0 0,5.1526 7.6064777,-7.6065 -7.4878583,-7.4879 z');
		this.register('loading', 'M 24 2.5 C 22.08477 2.5 20.5 4.0848 20.5 6 C 20.5 7.9152 22.08477 9.5 24 9.5 C 25.91523 9.5 27.5 7.9152 27.5 6 C 27.5 4.0848 25.91523 2.5 24 2.5 z M 11.28125 7.78125 C 10.382381 7.78125 9.4896359 8.1354 8.8125 8.8125 C 7.4582279 10.1668 7.4582281 12.3957 8.8125 13.75 C 10.166772 15.1043 12.395728 15.1043 13.75 13.75 C 15.104272 12.3957 15.104272 10.1668 13.75 8.8125 C 13.072864 8.1354 12.180119 7.78125 11.28125 7.78125 z M 36.71875 7.78125 C 35.819881 7.78125 34.927136 8.1354 34.25 8.8125 C 32.895728 10.1668 32.895728 12.3957 34.25 13.75 C 35.604272 15.1043 37.833228 15.1043 39.1875 13.75 C 40.541772 12.3957 40.541772 10.1668 39.1875 8.8125 C 38.510364 8.1354 37.617619 7.78125 36.71875 7.78125 z M 6 20.5 C 4.08477 20.5 2.5 22.0848 2.5 24 C 2.5 25.9152 4.08477 27.5 6 27.5 C 7.91523 27.5 9.5 25.9152 9.5 24 C 9.5 22.0848 7.91523 20.5 6 20.5 z M 42 20.5 C 40.08477 20.5 38.5 22.0848 38.5 24 C 38.5 25.9152 40.08477 27.5 42 27.5 C 43.91523 27.5 45.5 25.9152 45.5 24 C 45.5 22.0848 43.91523 20.5 42 20.5 z M 11.28125 33.25 C 10.382381 33.25 9.4896359 33.5729 8.8125 34.25 C 7.4582279 35.6043 7.4582281 37.8332 8.8125 39.1875 C 10.166772 40.5418 12.395728 40.5418 13.75 39.1875 C 15.104272 37.8332 15.104272 35.6043 13.75 34.25 C 13.072864 33.5729 12.180119 33.25 11.28125 33.25 z M 36.71875 33.25 C 35.819881 33.25 34.927136 33.5729 34.25 34.25 C 32.895728 35.6043 32.895728 37.8332 34.25 39.1875 C 35.604272 40.5418 37.833228 40.5418 39.1875 39.1875 C 40.541772 37.8332 40.541772 35.6043 39.1875 34.25 C 38.510364 33.5729 37.617619 33.25 36.71875 33.25 z M 24 38.5 C 22.08477 38.5 20.5 40.0848 20.5 42 C 20.5 43.9152 22.08477 45.5 24 45.5 C 25.91523 45.5 27.5 43.9152 27.5 42 C 27.5 40.0848 25.91523 38.5 24 38.5 z');
		this.register('edit', 'm 8.9095805,3.1557733 -4.59375,4.59375 L 16.28125,20.09375 20.875,15.5 z M 19.517767,9.65625 l 4.027443,4 11.73604,0 c 0.710395,0 1.21875,0.50825 1.21875,1.21875 l 0,21.40625 C 36.5,36.99165 35.991645,37.5 35.28125,37.5 l -19.90625,0 c -0.710395,0 -1.21875,-0.50835 -1.21875,-1.21875 l 0,-14.5 -4,-4.15625 0,18.65625 c 0,2.8573 2.361543,5.21875 5.21875,5.21875 l 19.90625,0 C 38.138457,41.5 40.5,39.13855 40.5,36.28125 l 0,-21.40625 c 0,-2.8573 -2.361543,-5.21875 -5.21875,-5.21875 z m 1.700983,6.3125 -4.59375,4.59375 4.790179,2.321429 c 0.144661,-0.521597 0.402425,-1.027425 0.8125,-1.4375 0.359131,-0.359131 0.800227,-0.625707 1.25,-0.78125 z M 23.75,21.1875 c 0,0 -0.491533,0.163286 -0.75,0.34375 -0.258467,0.180464 -0.564407,0.503889 -0.75,0.78125 -0.185651,0.277304 -0.375,0.84375 -0.375,0.84375 l 3.03125,1.125 z');
		this.register('upload', 'M 21.0625 5.90625 L 21.0625 19.25 L 17.75 15.90625 L 14.40625 19.25 L 24.40625 29.25 L 34.40625 19.25 L 31.0625 15.90625 L 27.75 19.25 L 27.75 5.90625 L 21.0625 5.90625 z M 6.96875 29.25 L 6.96875 39.25 L 41.96875 39.25 L 41.96875 29.25 L 36.96875 29.25 L 36.96875 34.25 L 11.96875 34.25 L 11.96875 29.25 L 6.96875 29.25 z');
		this.register('lock', 'm 18,5.3622 c -2.735406,0 -5,2.2646 -5,5 l 0,10 -1,0 c -1.662,0 -3,1.338 -3,3 l 0,17.0938 c 0,1.662 1.338,3 3,3 l 23.90625,0 c 1.662,0 3,-1.338 3,-3 l 0,-17.0938 c 0,-1.662 -1.338,-3 -3,-3 l -0.90625,0 0,-10 c 0,-2.7354 -2.264594,-5 -5,-5 l -12,0 z m 0,4 12,0 c 0.588594,0 1,0.4114 1,1 l 0,10 -14,0 0,-10 c 0,-0.5886 0.411406,-1 1,-1 z m 6.21875,15.2188 c 2.08518,0 3.78125,1.696 3.78125,3.7812 0,1.2414 -0.606288,2.3119 -1.53125,3 l 2.375,7.0625 -8.40625,0 2.21875,-6.625 c -1.299069,-0.5968 -2.21875,-1.9143 -2.21875,-3.4375 0,-2.0852 1.696069,-3.7812 3.78125,-3.7812 z');
		this.register('savecloud', 'M 21.9375 3.8125 L 21.9375 17.1875 L 18.625 13.8125 L 15.28125 17.1875 L 25.28125 27.1875 L 35.28125 17.1875 L 31.9375 13.8125 L 28.625 17.1875 L 28.625 3.8125 L 21.9375 3.8125 z M 15.1875 20.28125 C 13.209285 21.36075 11.604359 23.011 10.59375 25.0625 C 6.8454548 26.2652 4.09375 29.6762 4.09375 33.8125 C 4.09375 38.9391 8.2797172 43.125 13.40625 43.125 C 20.743081 43.095 27.938701 43.03125 35.28125 43.03125 C 39.54139 43.03125 43.03125 39.54135 43.03125 35.28125 C 43.03125 31.64315 40.426505 28.72105 37.03125 27.90625 C 36.146814 25.82585 34.408457 24.2103 32.25 23.5625 L 28.15625 27.6875 L 29.09375 27.40625 C 29.429018 27.30195 29.779124 27.25 30.15625 27.25 C 31.886675 27.25 33.262207 28.4157 33.625 30 L 33.96875 31.46875 L 35.46875 31.5625 C 37.488443 31.6695 39.03125 33.23065 39.03125 35.28125 C 39.03125 37.40205 37.40213 39.03125 35.28125 39.03125 C 27.926002 39.03125 20.719684 39.095 13.40625 39.125 C 13.39551 39.125 13.38572 39.1251 13.375 39.125 C 10.404867 39.108 8.09375 36.7874 8.09375 33.8125 C 8.09375 31.1963 9.8983864 29.1112 12.34375 28.625 L 13.4375 28.40625 L 13.8125 27.375 C 14.559974 25.4264 16.147884 23.91675 18.125 23.21875 L 15.1875 20.28125 z');
		this.register('calendar', 'M 14.1875 5.5625 C 13.0795 5.5625 12.1875 6.4545 12.1875 7.5625 L 12.1875 10.5625 C 12.1875 11.6705 13.0795 12.5625 14.1875 12.5625 C 15.2955 12.5625 16.1875 11.6705 16.1875 10.5625 L 16.1875 7.5625 C 16.1875 6.4545 15.2955 5.5625 14.1875 5.5625 z M 34.1875 5.5625 C 33.0795 5.5625 32.1875 6.4545 32.1875 7.5625 L 32.1875 10.5625 C 32.1875 11.6705 33.0795 12.5625 34.1875 12.5625 C 35.2955 12.5625 36.1875 11.6705 36.1875 10.5625 L 36.1875 7.5625 C 36.1875 6.4545 35.2955 5.5625 34.1875 5.5625 z M 7.1875 7.5625 C 5.5255 7.5625 4.1875 8.9005 4.1875 10.5625 L 4.1875 39.5625 C 4.1875 41.2245 5.5255 42.5625 7.1875 42.5625 L 41.1875 42.5625 C 42.8495 42.5625 44.1875 41.2245 44.1875 39.5625 L 44.1875 10.5625 C 44.1875 8.9005 42.8495 7.5625 41.1875 7.5625 L 37.1875 7.5625 L 37.1875 10.5625 C 37.1875 12.2245 35.8495 13.5625 34.1875 13.5625 C 32.5255 13.5625 31.1875 12.2245 31.1875 10.5625 L 31.1875 7.5625 L 17.1875 7.5625 L 17.1875 10.5625 C 17.1875 12.2245 15.8495 13.5625 14.1875 13.5625 C 12.5255 13.5625 11.1875 12.2245 11.1875 10.5625 L 11.1875 7.5625 L 7.1875 7.5625 z M 10.8125 16 L 37.3125 16 C 39.184739 16 40.71875 17.53405 40.71875 19.40625 L 40.71875 36.125 C 40.71875 37.9972 39.184739 39.53125 37.3125 39.53125 L 10.8125 39.53125 C 8.9402615 39.53125 7.40625 37.9972 7.40625 36.125 L 7.40625 19.40625 C 7.40625 17.53405 8.9402615 16 10.8125 16 z M 10.8125 18 C 10.013667 18 9.40625 18.60745 9.40625 19.40625 L 9.40625 22.71875 L 17.5 22.71875 L 17.5 18 L 10.8125 18 z M 20 18 L 20 22.71875 L 28.3125 22.71875 L 28.3125 18 L 20 18 z M 30.8125 18 L 30.8125 22.71875 L 38.71875 22.71875 L 38.71875 19.40625 C 38.71875 18.60745 38.111333 18 37.3125 18 L 30.8125 18 z M 9.40625 25.40625 L 9.40625 30.15625 L 17.5 30.15625 L 17.5 25.40625 L 9.40625 25.40625 z M 20 25.40625 L 20 30.15625 L 28.3125 30.15625 L 28.3125 25.40625 L 20 25.40625 z M 30.8125 25.40625 L 30.8125 30.15625 L 38.71875 30.15625 L 38.71875 25.40625 L 30.8125 25.40625 z M 9.40625 32.8125 L 9.40625 36.125 C 9.40625 36.9238 10.013667 37.53125 10.8125 37.53125 L 17.5 37.53125 L 17.5 32.8125 L 9.40625 32.8125 z M 20 32.8125 L 20 37.53125 L 28.3125 37.53125 L 28.3125 32.8125 L 20 32.8125 z M 30.8125 32.8125 L 30.8125 37.53125 L 37.3125 37.53125 C 38.111333 37.53125 38.71875 36.9238 38.71875 36.125 L 38.71875 32.8125 L 30.8125 32.8125 z');
		this.register('phone', 'm 40.384499,14.35 c -1.119892,-3.9826 -6.075567,-6.426 -9.848629,-4.5362 -4.937864,1.8134 -9.401496,4.7793 -13.051821,8.5578 -2.728309,2.8266 -5.416044,5.8169 -7.164639,9.3668 -1.9606824,4.1618 -2.6965691,9.234 -0.7883623,13.5432 0.8953303,1.7539 2.2878593,3.5559 4.3483553,3.9039 1.538971,0.022 3.047187,-3.1414 4.749325,-5.6577 1.159581,-1.9264 1.891977,-3.1072 0.219874,-4.4568 -1.532716,-1.0108 -3.627001,-2.4014 -3.109132,-4.5295 0.895495,-3.426 3.681076,-5.8349 5.893522,-8.4361 1.553362,-1.6278 3.28975,-3.3638 5.537441,-3.9042 2.196492,0.034 2.908148,3.5456 5.280678,2.8274 2.909013,-1.2741 4.150319,-1.5616 6.601629,-2.6387 2.101818,-0.6214 2.154604,-2.3569 1.331759,-4.0399 z');
		this.register('mail','m 3.9898475,12.1511 19.9999995,13.4062 20,-13.4062 -39.9999995,0 z m 0,0.9375 0,24.7812 15.4687495,-12.375 -15.4687495,-12.4062 z m 39.9999995,0 -15.46875,12.4062 15.46875,12.375 0,-24.7812 z m -23.8125,12.9687 -16.1874995,12.0938 0,0.062 39.9999995,0 0,-0.062 -16.21875,-12.0625 -3.78125,3.0312 -3.8125,-3.0625 z');
	},

	getNames: function() {
		var names = [];
		for(var tmp in Ui.Icon.icons)
			names.push(tmp);
		return names;
	},

	register: function(iconName, iconPath) {
		if(Ui.Icon.icons[iconName] != undefined)
			throw('Icon \''+iconName+'\' is already registered. To change it, use override');
		Ui.Icon.icons[iconName] = iconPath;
	},

	override: function(iconName, iconPath) {
		Ui.Icon.icons[iconName] = iconPath;
	},

	parse: function(icon) {
		return new Ui.Icon({ icon: icon });
	}
});


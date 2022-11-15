module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: ['standard-with-typescript', 'prettier'],
	overrides: [],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		project: ['./back/tsconfig.json'],
	},
	rules: {
		'@typescript-eslint/no-misused-promises': [
			'error',
			{
				checksVoidReturn: false,
			},
		],
	},
}

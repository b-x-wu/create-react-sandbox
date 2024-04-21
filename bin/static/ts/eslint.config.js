// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
	{
	    ignores: ['**/dist/**'],
	    languageOptions: {
	        globals: {
		    "process": true,
		},
	    },
	},
	eslint.configs.recommended,
	...tseslint.configs.recommended,
)

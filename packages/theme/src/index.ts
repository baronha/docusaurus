/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from "node:path";
import { createRequire } from "node:module";
import {
	getThemeInlineScript,
	getAnnouncementBarInlineScript,
	DataAttributeQueryStringInlineJavaScript,
} from "@docusaurus/theme-classic/src/inlineScripts";
import type { LoadContext, Plugin } from "@docusaurus/types";
import type { ThemeConfig } from "@docusaurus/theme-common";
import type { PluginOptions } from "@docusaurus/theme-classic";
import type webpack from "webpack";

const requireFromDocusaurusCore = createRequire(
	require.resolve("@docusaurus/core/package.json")
);
const ContextReplacementPlugin = requireFromDocusaurusCore(
	"webpack/lib/ContextReplacementPlugin"
) as typeof webpack.ContextReplacementPlugin;

export default function theme(
	context: LoadContext,
	options: PluginOptions
): Plugin<undefined> {
	const { siteStorage } = context;
	const themeConfig = context.siteConfig.themeConfig as ThemeConfig;
	const {
		announcementBar,
		colorMode,
		prism: { additionalLanguages },
	} = themeConfig;
	const { customCss } = options;
	return {
		name: "@gorhom/docusaurus-theme",

		getThemePath() {
			return "../lib/theme";
		},

		getTypeScriptThemePath() {
			return "../src/theme";
		},

		getClientModules() {
			const modules = [
				require.resolve("infima/dist/css/default/default.css"),
				"./prism-include-languages",
				"./nprogress",
			];
			modules.push(...customCss.map((p) => path.resolve(context.siteDir, p)));

			// push custom css
			modules.push(path.resolve(__dirname, 'custom.css'));
			return modules;
		},

		configureWebpack() {
			const prismLanguages = additionalLanguages
				.map((lang) => `prism-${lang}`)
				.join("|");

			return {
				plugins: [
					// This allows better optimization by only bundling those components
					// that the user actually needs, because the modules are dynamically
					// required and can't be known during compile time.
					new ContextReplacementPlugin(
						/prismjs[\\/]components$/,
						new RegExp(`^./(${prismLanguages})$`)
					),
				],
			};
		},

		configurePostCss(postCssOptions) {
			return postCssOptions;
		},

		injectHtmlTags() {
			return {
				preBodyTags: [
					{
						tagName: "script",
						innerHTML: `
${getThemeInlineScript({ colorMode, siteStorage })}
${DataAttributeQueryStringInlineJavaScript}
${announcementBar ? getAnnouncementBarInlineScript({ siteStorage }) : ""}
            `,
					},
				],
			};
		},
	};
}

export { getSwizzleConfig } from "./getSwizzleConfig";
export { validateThemeConfig, validateOptions } from "./options";

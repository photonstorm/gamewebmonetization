![Game Web Monetization Plugin](https://raw.githubusercontent.com/photonstorm/gamewebmonetization/main/banner.jpg "Game Web Monetization Plugin")

# Game Web Monetization Plugin

An easy-to-use Web Monetization Plugin for HTML5 game frameworks, including Phaser and Pixi.

Repository structure:

## Plugin

In the [plugin folder](https://github.com/photonstorm/gamewebmonetization/tree/main/plugin) you will find the Game Web Monetization Plugin.

This folder contains the following:

### `plugin/docs`

Here is the [complete documentation](https://photonstorm.github.io/gamewebmonetization/plugin/docs/) for the plugin, describing every property, method and interface it uses. You can view the docs online, or if you have the repo checked-out simply open `plugin/docs/index.html` in a browser.

### `plugin/src`

This folder contains the TypeScript source code for the plugin itself. Usually, you should use one of the dist files instead, but the full source is included as well. Please note that it is released under the MIT license.

### `plugin/dist`

Here you'll find the pre-bundled distribution files:

* `GameWebMonetization.js` is an ESM (ES Module), ready to import directly into your game code.
* `GameWebMonetization.es5.js` is a pre-bundled ES5 compatible script, for use in `<script>` tags.
* `GameWebMonetization.d.ts` is a TypeScript Definitions file, with accompanying source map.

Please see the tutorial for further integration details.

## Game

In the [game folder](https://github.com/photonstorm/gamewebmonetization/tree/main/game) you will find a sample Phaser 3 game that demonstrates use of the Game Web Monetization Plugin.

![3 Candies!](https://raw.githubusercontent.com/photonstorm/gamewebmonetization/main/3candies.png "3 Candies!")

The game is called **3 Candies!** and is a fast-paced puzzle game. See if you can find the 3 matching candies before the time runs out. If you play the game in a Web Monetized browser then you will get an extra life and an extra choice of background to play with.

You can [play the game here](https://photonstorm.github.io/gamewebmonetization/game/), too! Be sure to have the Web Monetization Extension installed in your browser to get the full benefits :)

## Tutorial

You can find a comprehensive [7 part tutorial](https://phaser.io/tutorials/game-web-monetization) on using the Game Web Monetization Plugin on the Phaser web site.

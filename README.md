# [Uncanny Cognitive Complexity](https://marketplace.visualstudio.com/items?itemName=Dabolus.uncanny-cognitive-complexity)

Uncanny Cognitive Complexity is a VS Code extension that shows Mr. Incredible
getting more and more uncanny as the cognitive complexity of your code grows.

It works best with TypeScript and JavaScript as it does an AST analysis of the
code to compute the correct cognitive complexity, but it also works with any
other language by using simple heuristics to estimate the complexity of the code.

![Uncanny Cognitive Complexity in action](https://raw.githubusercontent.com/Dabolus/uncanny-cognitive-complexity/main/preview.gif)

## Credits

- [Virej Dasani](https://virejdasani.github.io/) for the idea. They made the
  [Incredibly In Your Face](https://github.com/virejdasani/Incredibly-InYourFace)
  extension that works in the same way, but Mr. Incredible will react to the
  number of errors in your code instead of at your code's cognitive complexity;
- [Thomas Richards](https://thomasrichards.dev/) for their [cognitive-complexity-ts](https://www.npmjs.com/package/cognitive-complexity-ts)
  library, which is the one used by this extension under the hood to compute
  the cognitive complexity of the code;
- [Joshua Clayton](https://joshuaclayton.me/) for their [complexity](https://github.com/thoughtbot/complexity)
  tool, which I compiled to WebAssembly and used to estimate the cognitive
  complexity of files other than TypeScript and JavaScript;
- [Myself](https://giorgio.garasto.me/) for the sidebar icon. It literally took
  me more time to design it than it took me to develop the extension itself.
  Hope you will appreciate it.

## License

MIT. See the [LICENSE](LICENSE) file for more information.

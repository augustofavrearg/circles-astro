const minimum = [24, 22, 1];
const current = process.versions.node.split(".").map(Number);

const comparison =
  current.map((part, index) => part - minimum[index]).find((part) => part !== 0) ?? 0;
const supported = comparison >= 0;

if (!supported) {
  console.error(
    `Node ${process.versions.node} is not supported. Run \"nvm use\" to select Node ${minimum.join(".")} or newer.`,
  );
  process.exit(1);
}

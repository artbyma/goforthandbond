It is super annoying to rewrite this code, let's make it a library. web3-react seems to have the best
provider support, but its react context is pretty low level. use-wallet and web3modal seem to have incomplete
provider support.

Solution: Merge all three:

- A custom use-wallet inspired context (in core/)
- The provider packages from web3-react.
- The logos, icons and modal from web3-modal.
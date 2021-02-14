// SPDX-License-Identifier: MIT
// Based on https://github.com/simondlr/neolastics/blob/master/packages/hardhat/contracts/Curve.sol

pragma solidity ^0.7.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC721/IERC721.sol";
import "openzeppelin-solidity/contracts/token/ERC721/IERC721Enumerable.sol";


abstract contract Curve is IERC721, IERC721Enumerable {
    using SafeMath for uint256;
    // linear bonding curve
    // 99.5% going into reserve.
    // 0.5% going to creator.

    // this is currently 0.5%
    uint256 public initMintPrice = 0.02 ether; // at 0
    uint256 public initBurnPrice = 0.000995 ether; // at 1

    // You technically do not need to keep tabs on the reserve
    // because it uses linear pricing
    // but useful to know off-hand. Especially because this.balance might not be the same as the actual reserve
    uint256 public reserve;

    uint nextTokenId;

    address payable public creator;

    event Minted(uint256 indexed tokenId, uint256 indexed pieceId, uint256 pricePaid, uint256 indexed reserveAfterMint);
    event Burned(uint256 indexed tokenId, uint256 indexed pieceId, uint256 priceReceived, uint256 indexed reserveAfterBurn);

    /*
    todo: 
    flash minting protection
    front-running exploits
    */
    constructor (address payable _creator) {
        creator = _creator;
        reserve = 0;
        nextTokenId = 1;
    }

    /*
    With one mint front-runned, a front-runner will make a loss.
    With linear price increases of 0.001, it's not profitable.
    BECAUSE it costs 0.012 ETH at 50 gwei to mint (storage/smart contract costs) + 0.5% loss from creator fee.
    It becomes more profitable to front-run if there are multiple buys that can be spotted
    from multiple buyers in one block. However, depending on gas price, it depends how profitable it is.
    Because the planned buffer on the front-end is 0.01 ETH, it's not profitable to front-run any normal amounts.
    Unless, someone creates a specific contract to start bulk minting.
    To curb speculation, users can only mint one per transaction (unless you create a separate contract to do this).
    Thus, ultimately, at this stage, while front-running can be profitable,
    it is not generally feasible at this small scale.
    Thus, for the sake of usability, there's no additional locks here for front-running protection.
    A lock would be to have a transaction include the current price:
    But that means, that only one neolastic per block would be minted (unless you can guess price rises).
    */
    function mint() public virtual payable returns (uint256 _tokenId) {
        // you can only mint one at a time.
        require(msg.value > 0, "C: No ETH sent");

        uint256 mintPrice = getCurrentPriceToMint();
        require(msg.value >= mintPrice, "C: Not enough ETH sent");

        // mint first to increase supply.
        uint256 tokenId = nextTokenId;
        nextTokenId++;
        uint256 pieceId = onMint(tokenId);

        // disburse
        uint256 reserveCut = getReserveCut();
        reserve = reserve.add(reserveCut);
        creator.transfer(mintPrice.sub(reserveCut)); // 0.5%

        if (msg.value.sub(mintPrice) > 0) {
            msg.sender.transfer(msg.value.sub(mintPrice)); // excess/padding/buffer
        }

        emit Minted(tokenId, pieceId, mintPrice, reserve);

        return tokenId; // returns tokenId in case its useful to check it
    }

    function burn(uint256 tokenId) public virtual {
        require(msg.sender == this.ownerOf(tokenId), "not-owner");

        uint256 burnPrice = getCurrentPriceToBurn();
        uint256 pieceId = onBurn(tokenId);

        reserve = reserve.sub(burnPrice);
        msg.sender.transfer(burnPrice);

        emit Burned(tokenId, pieceId, burnPrice, reserve);
    }

    // if supply 0, mint price = 0.001
    function getCurrentPriceToMint() public virtual view returns (uint256) {
        uint256 mintPrice = initMintPrice.add(this.totalSupply().mul(initMintPrice));
        return mintPrice;
    }

    // helper function for legibility
    function getReserveCut() public virtual view returns (uint256) {
        return getCurrentPriceToBurn();
    }

    // if supply 1, then burn price = 0.000995
    function getCurrentPriceToBurn() public virtual view returns (uint256) {
        uint256 burnPrice = this.totalSupply().mul(initBurnPrice);
        return burnPrice;
    }

    function onMint(uint256 tokenId) internal virtual returns (uint256 pieceId);
    function onBurn(uint256 tokenId) internal virtual returns (uint256 pieceId);
}
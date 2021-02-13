// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "openzeppelin-solidity/contracts/token/ERC721/IERC721.sol";
import "openzeppelin-solidity/contracts/token/ERC721/IERC721Metadata.sol";
import "openzeppelin-solidity/contracts/token/ERC721/IERC721Enumerable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/IERC721Receiver.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/introspection/ERC165.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "./Curve.sol";


contract NFT is ERC721("Go forth and bond", "BONDLOVE"), Ownable, Curve {
    using SafeMath for uint256;

    uint256 MAX_TOKENS_PER_PIECE = 9;

    // Each token owns one piece. Only a limited number of tokens can own a
    // single piece.  A new piece is created once the previous one is full.
    struct Piece {
        uint256[] tokenIds;
        uint256 startedAt;
        uint256 endedAt;
        uint256 scheduledEndAt;
    }

    mapping(uint256 => Piece) pieces;
    uint256 public numPieces = 0;

    // Store the code to render on-chain.
    string public renderScriptCode;

    constructor() Curve(msg.sender) {
    }

    // End the old piece, add a new one
    function makeNewPiece() private returns (Piece storage) {
        uint256 newSegmentLength;
        if (numPieces > 0) {
            Piece storage currentPiece = getCurrentPiece();
            currentPiece.endedAt = block.timestamp;
            uint256 lastSegmentLength = currentPiece.endedAt.sub(currentPiece.startedAt);

            // If we filled up early, make the next segment longer. If we ended late, make the next segment longer.
            if (currentPiece.endedAt < currentPiece.scheduledEndAt) {
                newSegmentLength = lastSegmentLength.mul(75).div(100);
            } else {
                newSegmentLength = lastSegmentLength.mul(125).div(100);
            }
        }
        else {
            // Initial segment length
            newSegmentLength = 5 days;
        }

        // Increase the piece count
        numPieces = numPieces + 1;
        uint256 pieceId = numPieces;

        pieces[pieceId].startedAt = block.timestamp;
        pieces[pieceId].scheduledEndAt = block.timestamp.add(newSegmentLength);

        return pieces[pieceId];
    }

    function getCurrentPiece() private returns (Piece storage) {
        return pieces[numPieces];
    }

    function onMint() internal override returns (uint256 tokenId) {
        tokenId = this.totalSupply() + 1;
        _mint(msg.sender, tokenId);

        Piece storage currentPiece = getCurrentPiece();

        // We generate a new piece if the old one is full, or if it's segment timed out.
        bool isPieceFull = currentPiece.tokenIds.length >= MAX_TOKENS_PER_PIECE;
        bool hasTimedOut = block.timestamp >= currentPiece.scheduledEndAt;

        if (isPieceFull || hasTimedOut) {
            currentPiece = makeNewPiece();
        }

        currentPiece.tokenIds.push(tokenId);
    }

    function onBurn(uint256 tokenId) internal override {
        _burn(tokenId);
    }

    // Public API

    function setCode(string calldata code) public onlyOwner {
        renderScriptCode = code;
    }
}
